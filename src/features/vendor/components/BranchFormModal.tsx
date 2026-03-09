import { useState, type JSX } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  CircularProgress,
  Switch,
  FormControlLabel,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type {
  Branch,
  VendorRegistrationRequest,
} from '@features/vendor/types/vendor';
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
  showActivationToggle?: boolean;
}

interface FormState {
  ownerName: string;
  ownerPhone: string;
  email: string;
  branchName: string;
  detailAddress: string;
  ward: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  isActive: boolean;
  licenseImages: File[];
  storeImages: File[];
}

function getInitialState(mode: BranchFormMode): FormState {
  if (mode.type === 'editBranch') {
    const b = mode.branch;
    return {
      ownerName: b.name ?? '',
      ownerPhone: b.phoneNumber ?? '',
      email: b.email ?? '',
      branchName: b.name ?? '',
      detailAddress: b.addressDetail ?? '',
      ward: b.ward ?? '',
      city: b.city ?? '',
      latitude: b.lat ?? null,
      longitude: b.long ?? null,
      isActive: b.isActive,
      licenseImages: [],
      storeImages: [],
    };
  }
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
    isActive: true,
    licenseImages: [],
    storeImages: [],
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
  showActivationToggle = true,
}: BranchFormModalProps): JSX.Element {
  const [form, setForm] = useState<FormState>(getInitialState(mode));
  const [submitting, setSubmitting] = useState(false);

  const {
    onRegisterVendor,
    onCreateBranch,
    onUpdateBranch,
    onSubmitLicense,
    onSubmitImages,
  } = useVendor();

  // Reset form when modal opens with new mode
  const handleEnter = (): void => {
    setForm(getInitialState(mode));
  };

  const handleChange = (field: string, value: unknown): void => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLocationChange = (lat: number, lng: number): void => {
    setForm((prev) => ({ ...prev, latitude: lat, longitude: lng }));
  };

  const handleLicenseFileChange = (files: FileList | null): void => {
    setForm((prev) => ({
      ...prev,
      licenseImages: files ? Array.from(files) : [],
    }));
  };

  const handleImageFileChange = (files: FileList | null): void => {
    setForm((prev) => ({
      ...prev,
      storeImages: files ? Array.from(files) : [],
    }));
  };

  const isFormValid = (): boolean => {
    if (
      !form.ownerPhone ||
      !form.email ||
      !form.detailAddress ||
      form.latitude === null ||
      form.longitude === null
    ) {
      return false;
    }
    if (mode.type === 'createVendor' && !form.ownerName) {
      return false;
    }
    if (mode.type === 'addBranch' && !form.branchName) {
      return false;
    }
    return true;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!isFormValid()) return;
    setSubmitting(true);
    try {
      if (mode.type === 'createVendor') {
        const payload: VendorRegistrationRequest = {
          name: form.ownerName,
          phoneNumber: form.ownerPhone,
          email: form.email,
          branchName: form.branchName,
          addressDetail: form.detailAddress,
          ward: form.ward || 'Thành phố Hồ Chí Minh',
          city: form.city || 'Thành phố Hồ Chí Minh',
          lat: form.latitude ?? 0,
          long: form.longitude ?? 0,
        };
        const res = await onRegisterVendor(payload);
        const branchId = res.branches[0]?.branchId;

        if (form.licenseImages.length > 0) {
          await onSubmitLicense({
            branchId,
            licenseImages: form.licenseImages,
          });
        }
        if (form.storeImages.length > 0) {
          await onSubmitImages({ branchId, images: form.storeImages });
        }
      } else if (mode.type === 'addBranch') {
        const payload: VendorRegistrationRequest = {
          name: form.branchName,
          phoneNumber: form.ownerPhone,
          email: form.email,
          addressDetail: form.detailAddress,
          ward: form.ward || 'Thành phố Hồ Chí Minh',
          city: form.city || 'Thành phố Hồ Chí Minh',
          lat: form.latitude ?? 0,
          long: form.longitude ?? 0,
        };
        const res = await onCreateBranch({
          vendorId: mode.vendorId,
          data: payload,
        });
        const branchId = res.branchId;

        if (form.licenseImages.length > 0) {
          await onSubmitLicense({
            branchId,
            licenseImages: form.licenseImages,
          });
        }
        if (form.storeImages.length > 0) {
          await onSubmitImages({ branchId, images: form.storeImages });
        }
      } else if (mode.type === 'editBranch') {
        const payload: VendorRegistrationRequest = {
          phoneNumber: form.ownerPhone,
          email: form.email,
          name: form.branchName,
          addressDetail: form.detailAddress,
          ward: form.ward || 'Thành phố Hồ Chí Minh',
          city: form.city || 'Thành phố Hồ Chí Minh',
          lat: form.latitude ?? 0,
          long: form.longitude ?? 0,
          isActive: form.isActive,
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

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        TransitionProps={{ onEnter: handleEnter }}
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

        <DialogContent sx={{ pt: 3, pb: 1 }}>
          <div className="space-y-2">
            {/* Section 1: Owner/Store info — only for createVendor */}
            {mode.type === 'createVendor' && (
              <OwnerInfoSection
                formData={{
                  ownerName: form.ownerName,
                  ownerPhone: form.ownerPhone,
                  email: form.email,
                }}
                onChange={handleChange}
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
                    required
                    placeholder="0901234567"
                    value={form.ownerPhone}
                    onChange={(e) => handleChange('ownerPhone', e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-all duration-200 outline-none hover:border-gray-400 hover:bg-white focus:border-2 focus:border-[#06AA4C] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="email@example.com"
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-all duration-200 outline-none hover:border-gray-400 hover:bg-white focus:border-2 focus:border-[#06AA4C] focus:bg-white"
                  />
                </div>
              </div>
            )}

            {/* Section 2: Store / Branch info */}
            <StoreSection
              formData={{
                branchName: form.branchName,
                detailAddress: form.detailAddress,
                ward: form.ward,
                city: form.city,
                latitude: form.latitude,
                longitude: form.longitude,
              }}
              onChange={handleChange}
              onLocationChange={handleLocationChange}
              {...(mode.type === 'addBranch'
                ? {
                    sectionTitle: '2. Thông tin chi nhánh',
                    branchNameRequired: true,
                  }
                : {})}
            />

            {/* isActive toggle — editBranch only */}
            {mode.type === 'editBranch' && showActivationToggle && (
              <div className="mb-6">
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.isActive}
                      onChange={(e) =>
                        handleChange('isActive', e.target.checked)
                      }
                      color="success"
                    />
                  }
                  label={form.isActive ? 'Đang hoạt động' : 'Ngưng hoạt động'}
                />
              </div>
            )}

            {/* Section 3: Images upload — create modes only */}
            {isCreate && (
              <ImagesUploadSection
                storeImages={form.storeImages}
                onFileChange={handleImageFileChange}
              />
            )}

            {/* Section 4: License upload — create modes only */}
            {isCreate && (
              <LicenseUploadSection
                licenseImages={form.licenseImages}
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
            disabled={submitting || !isFormValid()}
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
