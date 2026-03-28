import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  CircularProgress,
} from '@mui/material';
import type { VendorCampaign } from '@features/vendor/types/campaign';
import type { Branch } from '@features/vendor/types/vendor';
import { VendorCampaignSchema } from '@features/vendor/utils/campaignSchema';
import type { VendorCampaignFormData } from '@features/vendor/utils/campaignSchema';

interface VendorCampaignFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: VendorCampaignFormData,
    imageFile: File | null
  ) => Promise<void>;
  campaign: VendorCampaign | null;
  branches?: Branch[];
  hideApplyScope?: boolean;
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
}

/** Get the current datetime in VN timezone formatted as YYYY-MM-DDTHH:mm */
const getTodayMinVN = (): string => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(now);
  const findPart = (type: string): string | undefined =>
    parts.find((p) => p.type === type)?.value;
  return `${findPart('year')}-${findPart('month')}-${findPart('day')}T${findPart('hour')}:${findPart('minute')}`;
};

/** Convert ISO string to YYYY-MM-DDTHH:mm in VN timezone */
const toLocalDatetimeValue = (isoStr: string | null): string => {
  if (!isoStr) return '';
  const date = new Date(isoStr);
  if (isNaN(date.getTime())) return '';

  const formatter = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const findPart = (type: string): string | undefined =>
    parts.find((p) => p.type === type)?.value;

  return `${findPart('year')}-${findPart('month')}-${findPart('day')}T${findPart('hour')}:${findPart('minute')}`;
};

/** Convert local datetime string to ISO 8601 Zulu string */
const toIsoZulu = (localStr: string | null): string | null => {
  if (!localStr) return null;
  const date = new Date(localStr);
  if (isNaN(date.getTime())) return null;
  return date.toISOString();
};

export default function VendorCampaignFormModal({
  isOpen,
  onClose,
  onSubmit,
  campaign,
  branches = [],
  hideApplyScope = false,
  status,
}: VendorCampaignFormModalProps): React.JSX.Element | null {
  const isEditMode = campaign !== null;
  const subscribedBranches = (Array.isArray(branches) ? branches : []).filter(
    (branch) => branch.isSubscribed
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<VendorCampaignFormData>({
    resolver: zodResolver(VendorCampaignSchema),
    defaultValues: {
      name: '',
      description: '',
      targetSegment: '',
      startDate: '',
      endDate: '',
      isActive: true,
      applyScope: 'VENDOR',
      branchIds: [],
    },
  });

  const startDate = watch('startDate');
  const endDate = watch('endDate');
  const applyScope = watch('applyScope');
  const selectedBranchIds = watch('branchIds');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (campaign) {
        reset({
          name: campaign.name,
          description: campaign.description ?? '',
          targetSegment: campaign.targetSegment ?? '',
          startDate: toLocalDatetimeValue(campaign.startDate),
          endDate: toLocalDatetimeValue(campaign.endDate),
          isActive: campaign.isActive,
          applyScope: 'VENDOR',
          branchIds: [],
        });
      } else {
        reset({
          name: '',
          description: '',
          targetSegment: '',
          startDate: '',
          endDate: '',
          isActive: true,
          applyScope: 'VENDOR',
          branchIds: [],
        });
      }
      setImageFile(null);
      setImagePreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [isOpen, campaign, reset]);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  useEffect(() => {
    if (applyScope === 'VENDOR' && selectedBranchIds.length > 0) {
      setValue('branchIds', [], { shouldValidate: true });
    }
  }, [applyScope, selectedBranchIds.length, setValue]);

  // Cascade-reset only applies in CREATE mode (edit mode allows free editing)
  useEffect(() => {
    if (campaign) return;
    if (!startDate) {
      setValue('endDate', '');
    } else if (endDate && startDate >= endDate) {
      setValue('endDate', '');
    }
  }, [campaign, startDate, endDate, setValue]);

  const handleFormSubmit = async (
    data: VendorCampaignFormData
  ): Promise<void> => {
    const payload: VendorCampaignFormData = {
      ...data,
      startDate: toIsoZulu(data.startDate) ?? '',
      endDate: toIsoZulu(data.endDate) ?? '',
      isActive: data.isActive,
    };
    await onSubmit(payload, imageFile);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  const handleClearSelectedImage = (): void => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImageFile(null);
    setImagePreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSelectSingleBranch = (branchId: number): void => {
    setValue('branchIds', [branchId], {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  if (!isOpen) return null;

  const existingImageUrl = campaign?.imageUrl ?? null;
  const displayImageUrl = imagePreviewUrl ?? existingImageUrl;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="body"
      PaperProps={{
        sx: {
          maxHeight: 'unset',
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, fontWeight: 'bold' }}>
        {campaign ? 'Cập nhật chiến dịch' : 'Thêm chiến dịch mới'}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={(theme) => ({
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}
        >
          {/* <CloseIcon /> */}
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent dividers sx={{ overflowY: 'visible' }}>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Tên chiến dịch <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('name')}
                  className={`w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 ${
                    errors.name
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-amber-200'
                  }`}
                  placeholder="Nhập tên chiến dịch"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Phân khúc mục tiêu
                </label>
                <input
                  {...register('targetSegment')}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-200"
                  placeholder="Học sinh, Sinh viên..."
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Trạng thái hoạt động
                </label>
                <label className="inline-flex h-[42px] items-center gap-2 rounded-lg border border-gray-300 px-3 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    {...register('isActive')}
                    className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-300"
                  />
                  Kích hoạt chiến dịch
                </label>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Mô tả
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-200"
                placeholder="Nhập mô tả chiến dịch"
              />
            </div>

            {/* Campaign Image */}
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Ảnh chiến dịch
              </label>
              <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                <div className="flex min-h-[160px] items-center justify-center overflow-hidden rounded-lg border border-dashed border-gray-300 bg-white">
                  {displayImageUrl ? (
                    <img
                      src={displayImageUrl}
                      alt="Campaign"
                      className="h-40 w-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-sm text-gray-500">
                      Chưa có ảnh chiến dịch
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg bg-[var(--color-primary-600)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-700)]"
                  >
                    {imageFile
                      ? 'Đổi ảnh'
                      : displayImageUrl
                        ? 'Cập nhật ảnh'
                        : 'Tải ảnh'}
                  </button>
                  {imageFile && (
                    <button
                      type="button"
                      onClick={handleClearSelectedImage}
                      className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
                    >
                      Bỏ ảnh đã chọn
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Định dạng hỗ trợ: JPG, PNG, WEBP. Kích thước khuyên dùng:
                  1200x675 (16:9).
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {!isEditMode && !hideApplyScope && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Phạm vi áp dụng
                </label>

                <div className="rounded-lg border border-gray-200 p-3">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="radio"
                        checked={applyScope === 'VENDOR'}
                        onChange={() =>
                          setValue('applyScope', 'VENDOR', {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                        className="h-4 w-4 border-gray-300 text-amber-600 focus:ring-amber-300"
                      />
                      Áp dụng cho tất cả chi nhánh đã đăng ký gói
                    </label>

                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="radio"
                        checked={applyScope === 'BRANCHES'}
                        onChange={() =>
                          setValue('applyScope', 'BRANCHES', {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                        className="h-4 w-4 border-gray-300 text-amber-600 focus:ring-amber-300"
                      />
                      Chọn chi nhánh cụ thể
                    </label>
                  </div>

                  {applyScope === 'BRANCHES' && (
                    <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
                      {subscribedBranches.length === 0 ? (
                        <p className="text-sm text-gray-500">
                          Không có chi nhánh nào đang đăng ký gói để áp dụng.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {subscribedBranches.map((branch) => (
                            <label
                              key={branch.branchId}
                              className="flex items-center gap-2 rounded-md bg-white px-2 py-1.5 text-sm text-gray-700"
                            >
                              <input
                                type="radio"
                                name="campaign-single-branch"
                                checked={
                                  selectedBranchIds[0] === branch.branchId
                                }
                                onChange={() =>
                                  handleSelectSingleBranch(branch.branchId)
                                }
                                className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-300"
                              />
                              {branch.name}
                            </label>
                          ))}
                        </div>
                      )}

                      {errors.branchIds?.message && (
                        <p className="mt-2 text-xs text-red-500">
                          {errors.branchIds.message}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Dates Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Ngày bắt đầu chiến dịch{' '}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  {...register('startDate')}
                  min={isEditMode ? undefined : getTodayMinVN()}
                  step="60"
                  className={`w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 ${
                    errors.startDate
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-amber-200'
                  }`}
                />
                {errors.startDate && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.startDate.message}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Ngày kết thúc chiến dịch{' '}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  {...register('endDate')}
                  disabled={!isEditMode && !startDate}
                  min={isEditMode ? undefined : (startDate ?? undefined)}
                  step="60"
                  className={`w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 ${
                    errors.endDate
                      ? 'border-red-500 focus:ring-red-200'
                      : !isEditMode && !startDate
                        ? 'cursor-not-allowed border-gray-200 bg-gray-100'
                        : 'border-gray-300 focus:ring-amber-200'
                  }`}
                />
                {errors.endDate && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.endDate.message}
                  </p>
                )}
              </div>
              <div className="hidden xl:block" />
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} color="inherit">
            Hủy
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={status === 'pending'}
            startIcon={
              status === 'pending' ? <CircularProgress size={20} /> : null
            }
          >
            {campaign ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
