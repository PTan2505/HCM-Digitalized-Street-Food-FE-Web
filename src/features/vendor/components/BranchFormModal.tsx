import { useState, useEffect, useMemo, type JSX } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  CircularProgress,
} from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type {
  Branch,
  VendorRegistrationRequest,
} from '@features/vendor/types/vendor';
import type { UserDietaryPreference } from '@features/admin/types/userDietaryPreference';
import useDietary from '@features/admin/hooks/useDietary';
import {
  CreateVendorSchema,
  AddBranchSchema,
  EditBranchSchema,
} from '@features/vendor/utils/vendorRegistrationSchema';
import type { BranchFormData } from '@features/vendor/utils/vendorRegistrationSchema';
import { useAppSelector } from '@hooks/reduxHooks';
import { selectUser } from '@slices/auth';
import { selectUserDietaryPreferences } from '@slices/userPreferenceDietary';
import StoreSection from './StoreSection';
import OwnerInfoSection from './OwnerInfoSection';
import LicenseUploadSection from './LicenseUploadSection';
import ImagesUploadSection from './ImagesUploadSection';
import useVendor from '@features/vendor/hooks/useVendor';
import VendorModalHeader from '@features/vendor/components/VendorModalHeader';

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
      dietaryPreferenceIds: [],
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
      return `Chỉnh sửa chi nhánh: ${mode.branch.name}`;
    default:
      return '';
  }
}

function getSubtitle(mode: BranchFormMode): {
  badge: string;
  name: string;
} {
  if (mode.type === 'createVendor') {
    return {
      badge: 'Tạo mới',
      name: 'Thiết lập cửa hàng và chi nhánh đầu tiên',
    };
  }

  if (mode.type === 'addBranch') {
    return {
      badge: `#${mode.vendorId}`,
      name: 'Thêm chi nhánh mới cho cửa hàng hiện có',
    };
  }

  return {
    badge: `#${mode.branch.branchId}`,
    name: mode.branch.name,
  };
}

function normalizeAddressDetail(address: string): string {
  const trimmedAddress = address.trim();
  if (!trimmedAddress) return '';

  // Keep the full detailed address and only remove ward/city part.
  const wardMatch = trimmedAddress.match(/\s*,?\s*(phường|xã|thị trấn)\b/i);
  if (!wardMatch?.index) {
    return trimmedAddress;
  }

  return trimmedAddress.slice(0, wardMatch.index).replace(/,\s*$/, '').trim();
}

export default function BranchFormModal({
  isOpen,
  onClose,
  mode,
  onSuccess,
}: BranchFormModalProps): JSX.Element {
  const user = useAppSelector(selectUser);
  const dietaryPreferencesFromStore = useAppSelector(
    selectUserDietaryPreferences
  );
  const dietaryPreferences = useMemo(
    () =>
      dietaryPreferencesFromStore.filter(
        (dietaryPreference) => dietaryPreference.isActive !== false
      ),
    [dietaryPreferencesFromStore]
  );

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
  const { onGetAllUserDietaryPreferences } = useDietary();

  const {
    watch,
    setValue,
    getValues,
    reset,
    trigger,
    formState: { errors, isValid, isDirty },
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

      if (mode.type === 'createVendor') {
        void onGetAllUserDietaryPreferences();
      }
    }
  }, [isOpen, mode, onGetAllUserDietaryPreferences, reset]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const loginPhoneNumber = user?.phoneNumber?.trim();
    if (!loginPhoneNumber) {
      return;
    }

    const currentPhoneValue = getValues('ownerPhone')?.trim();
    if (currentPhoneValue) {
      return;
    }

    setValue('ownerPhone', loginPhoneNumber, {
      shouldValidate: true,
      shouldDirty: false,
    });
  }, [isOpen, user?.phoneNumber, getValues, setValue]);

  const handleChange = (field: string, value: unknown): void => {
    setValue(field as keyof BranchFormData, value as never, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleLocationChange = (lat: number, lng: number): void => {
    setValue('latitude' as keyof BranchFormData, lat as never, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setValue('longitude' as keyof BranchFormData, lng as never, {
      shouldValidate: true,
      shouldDirty: true,
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

    const selectedDietaryPreferenceIds =
      (form as { dietaryPreferenceIds?: number[] }).dietaryPreferenceIds ?? [];
    const normalizedBranchName = form.branchName?.trim() ?? '';
    const normalizedAddressDetail = normalizeAddressDetail(form.detailAddress);

    setSubmitting(true);
    try {
      if (mode.type === 'createVendor') {
        const payload: VendorRegistrationRequest = {
          name: (form as { ownerName?: string }).ownerName ?? '',
          phoneNumber: form.ownerPhone,
          email: form.email,
          ...(normalizedBranchName ? { branchName: normalizedBranchName } : {}),
          addressDetail: normalizedAddressDetail,
          ward: form.ward ?? 'Thành phố Hồ Chí Minh',
          city: form.city ?? 'Thành phố Hồ Chí Minh',
          lat: form.latitude ?? 0,
          long: form.longitude ?? 0,
          dietaryPreferenceIds: selectedDietaryPreferenceIds,
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
          addressDetail: normalizedAddressDetail,
          ward: form.ward ?? 'Thành phố Hồ Chí Minh',
          city: form.city ?? 'Thành phố Hồ Chí Minh',
          lat: form.latitude ?? 0,
          long: form.longitude ?? 0,
          dietaryPreferenceIds: [],
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
          addressDetail: normalizedAddressDetail,
          ward: form.ward ?? 'Thành phố Hồ Chí Minh',
          city: form.city ?? 'Thành phố Hồ Chí Minh',
          lat: form.latitude ?? 0,
          long: form.longitude ?? 0,
          dietaryPreferenceIds: [],
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
  const subtitle = getSubtitle(mode);

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
        <VendorModalHeader
          title={getTitle(mode)}
          subtitle={subtitle.name}
          icon={<StorefrontIcon />}
          iconTone="branch"
          onClose={onClose}
        />

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

            {/* Dietary preference — only for createVendor */}
            {mode.type === 'createVendor' && (
              <div className="mb-12">
                <h2 className="mb-6 text-lg font-semibold text-gray-800">
                  2. Cửa hàng của bạn phù hợp với chế độ ăn nào?
                </h2>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Chọn chế độ ăn <span className="text-red-500">*</span>
                </label>

                <div
                  className={`rounded-xl border px-3 py-3 transition-all duration-200 ${
                    (errors as Record<string, { message?: string }>)
                      .dietaryPreferenceIds?.message
                      ? 'border-red-500 bg-white'
                      : 'border-gray-200 bg-gray-50 hover:border-gray-400 hover:bg-white'
                  }`}
                >
                  <div className="flex flex-wrap gap-2">
                    {dietaryPreferences.map((d: UserDietaryPreference) => {
                      const selectedDietaryPreferenceIds =
                        (form as { dietaryPreferenceIds?: number[] })
                          .dietaryPreferenceIds ?? [];
                      const isSelected = selectedDietaryPreferenceIds.includes(
                        d.dietaryPreferenceId
                      );

                      return (
                        <Chip
                          key={d.dietaryPreferenceId}
                          label={d.name}
                          onClick={() => {
                            const nextValues = isSelected
                              ? selectedDietaryPreferenceIds.filter(
                                  (id) => id !== d.dietaryPreferenceId
                                )
                              : [
                                  ...selectedDietaryPreferenceIds,
                                  d.dietaryPreferenceId,
                                ];
                            handleChange('dietaryPreferenceIds', nextValues);
                          }}
                          variant={isSelected ? 'filled' : 'outlined'}
                          className={`border transition-colors ${
                            isSelected
                              ? 'border-[#06AA4C] bg-[#E8F7EF] font-medium text-[#058F40] hover:bg-[#DCF3E7]'
                              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        />
                      );
                    })}

                    {dietaryPreferences.length === 0 && (
                      <span className="text-sm text-gray-400">
                        Không có dữ liệu
                      </span>
                    )}
                  </div>
                </div>

                {(errors as Record<string, { message?: string }>)
                  .dietaryPreferenceIds?.message && (
                  <p className="mt-1 text-xs text-red-500">
                    {
                      (errors as Record<string, { message?: string }>)
                        .dietaryPreferenceIds?.message
                    }
                  </p>
                )}

                {!(errors as Record<string, { message?: string }>)
                  .dietaryPreferenceIds?.message && (
                  <p className="mt-2 text-xs text-gray-500">
                    Bạn có thể chọn nhiều chế độ ăn nếu phù hợp
                  </p>
                )}
              </div>
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
              branchNameRequired={true}
              {...(mode.type === 'addBranch'
                ? {
                    sectionTitle: '2. Thông tin chi nhánh',
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
            disabled={
              submitting ||
              !isValid ||
              (isCreate && storeImages.length === 0) ||
              (mode.type === 'editBranch' && !isDirty)
            }
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
