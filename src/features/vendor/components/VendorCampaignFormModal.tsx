import { useEffect, useRef, useState, useMemo } from 'react';
import type { ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Tooltip,
  Chip,
  IconButton,
} from '@mui/material';
import {
  AddPhotoAlternate as AddPhotoAlternateIcon,
  Delete as DeleteIcon,
  Campaign as CampaignIcon,
} from '@mui/icons-material';
import type { VendorCampaign } from '@features/vendor/types/campaign';
import type { Branch } from '@features/vendor/types/vendor';
import { VendorCampaignSchema } from '@features/vendor/utils/campaignSchema';
import type { VendorCampaignFormData } from '@features/vendor/utils/campaignSchema';
import VendorModalHeader from '@features/vendor/components/VendorModalHeader';

interface VendorCampaignFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: VendorCampaignFormData,
    imageFile: File | null,
    isImageRemoved?: boolean
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

  const subscribedBranches = useMemo(
    () =>
      branches.filter(
        (branch) => branch.isSubscribed && branch.tierName !== 'Warning'
      ),
    [branches]
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<VendorCampaignFormData>({
    resolver: zodResolver(VendorCampaignSchema),
    defaultValues: {
      name: '',
      description: '',
      targetSegment: '',
      startDate: '',
      endDate: '',
      branchIds: null,
    },
  });

  const startDate = watch('startDate');
  const endDate = watch('endDate');
  const selectedBranchIds = watch('branchIds');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isImageRemoved, setIsImageRemoved] = useState(false);
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
          branchIds: campaign.branchIds ?? null,
        });
      } else {
        reset({
          name: '',
          description: '',
          targetSegment: '',
          startDate: '',
          endDate: '',
          branchIds: null,
        });
      }
      setImageFile(null);
      setImagePreviewUrl(null);
      setIsImageRemoved(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [isOpen, campaign, reset]);

  useEffect(() => {
    return (): void => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

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
    };
    await onSubmit(payload, imageFile, isImageRemoved);
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
    setIsImageRemoved(false);
  };

  const handleClearSelectedImage = (): void => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImageFile(null);
    setImagePreviewUrl(null);
    setIsImageRemoved(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  const existingImageUrl = campaign?.imageUrl ?? null;
  const displayImageUrl =
    imagePreviewUrl ?? (isImageRemoved ? null : existingImageUrl);
  const hasImageChanged = imageFile !== null || isImageRemoved;

  const inputClass = (hasError: boolean): string =>
    `w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 ${
      hasError
        ? 'border-red-500 focus:ring-red-200'
        : 'border-gray-300 focus:ring-amber-200'
    }`;

  const sectionLabel = (text: string): React.JSX.Element => (
    <p
      className="mb-3 text-xs font-bold uppercase"
      style={{ color: '#8bcf3f' }}
    >
      {text}
    </p>
  );

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: {
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        },
      }}
    >
      <VendorModalHeader
        title={campaign ? 'Cập nhật chiến dịch' : 'Thêm chiến dịch mới'}
        subtitle={campaign?.name ?? ''}
        icon={<CampaignIcon />}
        iconTone="campaign"
        onClose={onClose}
      />
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent
          dividers
          sx={{
            overflowY: 'auto',
            maxHeight: 'calc(90vh - 150px)',
          }}
        >
          <div className="flex flex-col gap-6">
            <fieldset className="m-0 min-w-0 border-0 p-0">
              {/* ── SECTION 1: Thông tin cơ bản ── */}
              <div>
                {sectionLabel('Thông tin cơ bản')}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">
                      Tên chiến dịch <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('name')}
                      className={inputClass(!!errors.name)}
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
                      className={inputClass(false)}
                      placeholder="VD: Học sinh, Sinh viên"
                    />
                  </div>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* ── SECTION 2: Nội dung & Hình ảnh ── */}
              <div>
                {sectionLabel('Nội dung & Hình ảnh')}
                <div className="flex flex-col gap-4">
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

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Ảnh banner chiến dịch
                    </label>
                    <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                      {displayImageUrl ? (
                        <div className="group hover:border-primary-400 relative flex min-h-40 w-full items-center justify-center overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm transition-colors">
                          <img
                            src={displayImageUrl}
                            alt="Campaign"
                            className="h-40 w-auto max-w-full object-contain transition duration-300 group-hover:scale-[1.02] group-hover:brightness-95"
                          />

                          <div className="absolute inset-0 flex items-center justify-center gap-4 bg-black/40 opacity-0 backdrop-blur-[1px] transition-all duration-300 group-hover:opacity-100">
                            <Tooltip title="Đổi ảnh khác" arrow>
                              <IconButton
                                onClick={() => fileInputRef.current?.click()}
                                sx={{
                                  bgcolor: 'rgba(255,255,255,0.95)',
                                  color: 'var(--color-primary-600)',
                                  '&:hover': {
                                    bgcolor: 'white',
                                    transform: 'scale(1.1)',
                                  },
                                  transition: 'all 0.2s',
                                  width: 44,
                                  height: 44,
                                }}
                              >
                                <AddPhotoAlternateIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Xoá ảnh hiện tại" arrow>
                              <IconButton
                                onClick={handleClearSelectedImage}
                                sx={{
                                  bgcolor: 'rgba(255,255,255,0.95)',
                                  color: '#ef4444',
                                  '&:hover': {
                                    bgcolor: '#fee2e2',
                                    color: '#b91c1c',
                                    transform: 'scale(1.1)',
                                  },
                                  transition: 'all 0.2s',
                                  width: 44,
                                  height: 44,
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="hover:border-primary-400 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white transition-colors hover:bg-gray-50/50"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <div className="flex items-center justify-center rounded-full border border-gray-200 bg-gray-50 p-4 text-gray-400 shadow-sm transition-colors hover:group-hover:text-amber-600">
                            <AddPhotoAlternateIcon fontSize="medium" />
                          </div>
                          <div className="mt-3 text-center">
                            <p className="text-sm font-semibold text-gray-700">
                              Nhấn để tải ảnh lên
                            </p>
                            <p className="text-xs text-gray-500">
                              Kích thước khuyên dùng: 1200x675 (16:9)
                            </p>
                          </div>
                        </div>
                      )}
                      <p className="text-center text-xs text-gray-500">
                        Định dạng hỗ trợ: JPG, PNG, WEBP.
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
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* ── SECTION 3: Chi nhánh áp dụng ── */}
              {!isEditMode &&
                !hideApplyScope &&
                subscribedBranches.length > 0 && (
                  <>
                    <div>
                      {sectionLabel('Chi nhánh áp dụng')}
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-xs font-normal text-red-500 italic">
                          (Phải chọn ít nhất 1 chi nhánh)
                        </p>
                        {selectedBranchIds !== null &&
                          selectedBranchIds.length !==
                            subscribedBranches.length && (
                            <button
                              type="button"
                              onClick={() => {
                                setValue('branchIds', null, {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                });
                              }}
                              className="hover:text-primary-700 text-xs font-semibold text-amber-600 transition-colors hover:underline"
                            >
                              Chọn tất cả
                            </button>
                          )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {subscribedBranches.map((branch) => {
                          const isSelected =
                            selectedBranchIds === null ||
                            selectedBranchIds.includes(branch.branchId);
                          return (
                            <Chip
                              key={branch.branchId}
                              label={branch.name}
                              color={isSelected ? 'primary' : 'default'}
                              variant={isSelected ? 'filled' : 'outlined'}
                              onClick={() => {
                                let newSelected: number[];
                                if (selectedBranchIds === null) {
                                  newSelected = subscribedBranches
                                    .map((b) => b.branchId)
                                    .filter((id) => id !== branch.branchId);
                                } else {
                                  if (
                                    selectedBranchIds.includes(branch.branchId)
                                  ) {
                                    newSelected = selectedBranchIds.filter(
                                      (id) => id !== branch.branchId
                                    );
                                  } else {
                                    newSelected = [
                                      ...selectedBranchIds,
                                      branch.branchId,
                                    ];
                                  }
                                }
                                if (newSelected.length === 0) return;

                                if (
                                  newSelected.length ===
                                  subscribedBranches.length
                                ) {
                                  setValue('branchIds', null, {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                  });
                                } else {
                                  setValue('branchIds', newSelected, {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                  });
                                }
                              }}
                              className="cursor-pointer font-medium transition-all hover:opacity-80"
                            />
                          );
                        })}
                      </div>
                      {errors.branchIds?.message && (
                        <p className="mt-2 text-xs text-red-500">
                          {errors.branchIds.message}
                        </p>
                      )}
                    </div>
                    <hr className="border-gray-100" />
                  </>
                )}

              {/* ── SECTION 4: Thời gian chiến dịch ── */}
              <div>
                {sectionLabel('Thời gian chiến dịch')}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">
                      Ngày bắt đầu chiến dịch{' '}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      {...register('startDate')}
                      min={
                        isEditMode &&
                        campaign?.startDate &&
                        toLocalDatetimeValue(campaign.startDate) <
                          getTodayMinVN()
                          ? toLocalDatetimeValue(campaign.startDate)
                          : getTodayMinVN()
                      }
                      className={inputClass(!!errors.startDate)}
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
                      disabled={!startDate}
                      min={startDate || getTodayMinVN()}
                      className={`${inputClass(!!errors.endDate)} ${!startDate ? 'cursor-not-allowed bg-gray-100 text-gray-500' : ''}`}
                    />
                    {errors.endDate && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.endDate.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </fieldset>
          </div>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1 }}>
          <Button onClick={onClose} color="inherit">
            Hủy
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={
              status === 'pending' ||
              (isEditMode && !isDirty && !hasImageChanged)
            }
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
