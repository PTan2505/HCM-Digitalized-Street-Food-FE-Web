import { useState, useEffect, type JSX } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type {
  Branch,
  VendorRegistrationRequest,
} from '@features/vendor/types/vendor';
import {
  CreateVendorSchema,
  AddBranchSchema,
  EditBranchSchema,
} from '@features/vendor/utils/vendorRegistrationSchema';
import type { BranchFormData } from '@features/vendor/utils/vendorRegistrationSchema';
import StoreSection from './StoreSection';
import OwnerInfoSection from './OwnerInfoSection';
import LicenseUploadSection from './LicenseUploadSection';
import ImagesUploadSection from './ImagesUploadSection';
import useVendor from '@features/vendor/hooks/useVendor';

export type BranchFormMode =
  | { type: 'createVendor' }
  | { type: 'addBranch'; vendorId: number }
  | { type: 'editBranch'; branch: Branch };

interface BranchFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: BranchFormMode;
  onSuccess: () => void;
}

function getSchema(
  mode: BranchFormMode
):
  | typeof CreateVendorSchema
  | typeof AddBranchSchema
  | typeof EditBranchSchema {
  switch (mode.type) {
    case 'createVendor':
      return CreateVendorSchema;
    case 'addBranch':
      return AddBranchSchema;
    case 'editBranch':
      return EditBranchSchema;
    default:
      return EditBranchSchema;
  }
}

function getDefaultValues(mode: BranchFormMode): BranchFormData {
  if (mode.type === 'editBranch') {
    const b = mode.branch;
    return {
      ownerPhone: b.phoneNumber ?? '',
      email: b.email ?? '',
      branchName: b.name ?? '',
      detailAddress: b.addressDetail ?? '',
      ward: b.ward ?? '',
      city: b.city ?? '',
      latitude: b.lat ?? null,
      longitude: b.long ?? null,
    };
  }
  if (mode.type === 'createVendor') {
    return {
      ownerName: '',
      ownerPhone: '',
      email: '',
      branchName: '',
      detailAddress: '',
      ward: '',
      city: '',
      latitude: null,
      longitude: null,
    };
  }
  // addBranch
  return {
    ownerPhone: '',
    email: '',
    branchName: '',
    detailAddress: '',
    ward: '',
    city: '',
    latitude: null,
    longitude: null,
  };
}

function getTitle(mode: BranchFormMode): string {
  switch (mode.type) {
    case 'createVendor':
      return 'Tạo cửa hàng mới';
    case 'addBranch':
      return 'Thêm chi nhánh';
    case 'editBranch':
      return 'Chỉnh sửa chi nhánh';
    default:
      return '';
  }
}

export default function BranchFormModal({
  isOpen,
  onClose,
  mode,
  onSuccess,
}: BranchFormModalProps): JSX.Element {
  const [submitting, setSubmitting] = useState(false);
  const [licenseImages, setLicenseImages] = useState<File[]>([]);
  const [storeImages, setStoreImages] = useState<File[]>([]);

  const {
    onRegisterVendor,
    onCreateBranch,
    onUpdateBranch,
    onSubmitLicense,
    onSubmitImages,
  } = useVendor();

  const {
    watch,
    setValue,
    reset,
    trigger,
    formState: { errors, isValid },
  } = useForm<BranchFormData>({
    resolver: zodResolver(getSchema(mode)),
    mode: 'onChange',
    defaultValues: getDefaultValues(mode),
  });

  const form = watch();

  // Reset form when modal opens with new mode
  useEffect(() => {
    if (isOpen) {
      reset(getDefaultValues(mode));
      setLicenseImages([]);
      setStoreImages([]);
    }
  }, [isOpen, mode, reset]);

  const handleChange = (field: string, value: unknown): void => {
    setValue(field as keyof BranchFormData, value as never, {
      shouldValidate: true,
    });
  };

  const handleLocationChange = (lat: number, lng: number): void => {
    setValue('latitude' as keyof BranchFormData, lat as never, {
      shouldValidate: true,
    });
    setValue('longitude' as keyof BranchFormData, lng as never, {
      shouldValidate: true,
    });
  };

  const handleLicenseFileChange = (files: FileList | null): void => {
    setLicenseImages(files ? Array.from(files) : []);
  };

  const handleImageFileChange = (files: FileList | null): void => {
    setStoreImages(files ? Array.from(files) : []);
  };

  const handleSubmit = async (): Promise<void> => {
    const valid = await trigger();
    if (!valid) return;
    setSubmitting(true);
    try {
      if (mode.type === 'createVendor') {
        const payload: VendorRegistrationRequest = {
          name: (form as { ownerName?: string }).ownerName ?? '',
          phoneNumber: form.ownerPhone,
          email: form.email,
          branchName: form.branchName,
          addressDetail: form.detailAddress,
          ward: form.ward ?? 'Thành phố Hồ Chí Minh',
          city: form.city ?? 'Thành phố Hồ Chí Minh',
          lat: form.latitude ?? 0,
          long: form.longitude ?? 0,
        };
        const res = await onRegisterVendor(payload);
        const branchId = res.branches[0]?.branchId;

        if (licenseImages.length > 0) {
          await onSubmitLicense({ branchId, licenseImages });
        }
        if (storeImages.length > 0) {
          await onSubmitImages({ branchId, images: storeImages });
        }
      } else if (mode.type === 'addBranch') {
        const payload: VendorRegistrationRequest = {
          name: form.branchName,
          phoneNumber: form.ownerPhone,
          email: form.email,
          addressDetail: form.detailAddress,
          ward: form.ward ?? 'Thành phố Hồ Chí Minh',
          city: form.city ?? 'Thành phố Hồ Chí Minh',
          lat: form.latitude ?? 0,
          long: form.longitude ?? 0,
        };
        const res = await onCreateBranch({
          vendorId: mode.vendorId,
          data: payload,
        });
        const branchId = res.branchId;

        if (licenseImages.length > 0) {
          await onSubmitLicense({ branchId, licenseImages });
        }
        if (storeImages.length > 0) {
          await onSubmitImages({ branchId, images: storeImages });
        }
      } else if (mode.type === 'editBranch') {
        const payload: VendorRegistrationRequest = {
          phoneNumber: form.ownerPhone,
          email: form.email,
          name: form.branchName,
          addressDetail: form.detailAddress,
          ward: form.ward ?? 'Thành phố Hồ Chí Minh',
          city: form.city ?? 'Thành phố Hồ Chí Minh',
          lat: form.latitude ?? 0,
          long: form.longitude ?? 0,
        };
        await onUpdateBranch({ branchId: mode.branch.branchId, data: payload });
      }

      onSuccess();
      onClose();
    } catch {
      // Error handling
    } finally {
      setSubmitting(false);
    }
  };

  const isCreate = mode.type === 'createVendor' || mode.type === 'addBranch';

  // Map zod errors to section error props
  const ownerErrors = {
    ownerName: (errors as Record<string, { message?: string }>).ownerName
      ?.message,
    ownerPhone: errors.ownerPhone?.message,
    email: errors.email?.message,
  };
  const storeErrors = {
    branchName: errors.branchName?.message,
    detailAddress: errors.detailAddress?.message,
    latitude: errors.latitude?.message,
    longitude: errors.longitude?.message,
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, maxHeight: '90vh' },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontWeight: 700,
            fontSize: '1.25rem',
            borderBottom: '1px solid #e5e7eb',
            pb: 2,
          }}
        >
          {getTitle(mode)}
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 3, pb: 1, mt: 3 }}>
          <div className="space-y-2">
            {/* Section 1: Owner/Store info — only for createVendor */}
            {mode.type === 'createVendor' && (
              <OwnerInfoSection
                formData={{
                  ownerName: (form as { ownerName?: string }).ownerName ?? '',
                  ownerPhone: form.ownerPhone,
                  email: form.email,
                }}
                onChange={handleChange}
                errors={ownerErrors}
              />
            )}

            {/* Owner phone & email for addBranch / editBranch */}
            {mode.type !== 'createVendor' && (
              <div className="mb-12">
                <h2 className="mb-6 text-lg font-semibold text-gray-800">
                  1. Thông tin liên hệ chi nhánh
                </h2>
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="0901234567"
                    value={form.ownerPhone}
                    onChange={(e) => handleChange('ownerPhone', e.target.value)}
                    className={`w-full rounded-xl border px-4 py-3 transition-all duration-200 outline-none ${
                      errors.ownerPhone
                        ? 'border-red-500 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-200'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-400 hover:bg-white focus:border-2 focus:border-[#06AA4C] focus:bg-white'
                    }`}
                  />
                  {errors.ownerPhone && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.ownerPhone.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={`w-full rounded-xl border px-4 py-3 transition-all duration-200 outline-none ${
                      errors.email
                        ? 'border-red-500 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-200'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-400 hover:bg-white focus:border-2 focus:border-[#06AA4C] focus:bg-white'
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Section 2: Store / Branch info */}
            <StoreSection
              formData={{
                branchName: form.branchName ?? '',
                detailAddress: form.detailAddress,
                ward: form.ward ?? '',
                city: form.city ?? '',
                latitude: form.latitude,
                longitude: form.longitude,
              }}
              onChange={handleChange}
              onLocationChange={handleLocationChange}
              errors={storeErrors}
              {...(mode.type === 'addBranch'
                ? {
                    sectionTitle: '2. Thông tin chi nhánh',
                    branchNameRequired: true,
                  }
                : {})}
            />

            {/* Section 3: Images upload — create modes only */}
            {isCreate && (
              <ImagesUploadSection
                storeImages={storeImages}
                onFileChange={handleImageFileChange}
              />
            )}

            {/* Section 4: License upload — create modes only */}
            {isCreate && (
              <LicenseUploadSection
                licenseImages={licenseImages}
                onFileChange={handleLicenseFileChange}
              />
            )}
          </div>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #e5e7eb' }}>
          <Button
            onClick={onClose}
            variant="outlined"
            color="inherit"
            disabled={submitting}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting || !isValid || (isCreate && storeImages.length === 0)}
            sx={{
              bgcolor: '#06AA4C',
              '&:hover': { bgcolor: '#058f40' },
              '&:disabled': { bgcolor: '#e5e7eb' },
              fontWeight: 600,
              minWidth: 120,
            }}
          >
            {submitting ? (
              <CircularProgress size={22} sx={{ color: '#fff' }} />
            ) : mode.type === 'editBranch' ? (
              'Cập nhật'
            ) : mode.type === 'createVendor' ? (
              'Tạo cửa hàng'
            ) : (
              'Thêm chi nhánh'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
