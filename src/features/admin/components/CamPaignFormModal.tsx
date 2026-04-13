import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  AddPhotoAlternate as AddPhotoAlternateIcon,
  Delete as DeleteIcon,
  Campaign as CampaignIcon,
} from '@mui/icons-material';
import type { Campaign } from '@features/admin/types/campaign';
import { CampaignSchema } from '@features/admin/utils/campaignSchema';
import type { CampaignFormData } from '@features/admin/utils/campaignSchema';
import AppModalHeader from '@components/AppModalHeader';

interface CamPaignFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: CampaignFormData,
    imageFile: File | null,
    isImageRemoved?: boolean
  ) => Promise<void>;
  campaign: Campaign | null;
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
}

/** Convert ISO 8601 string to YYYY-MM-DDTHH:mm for datetime-local input, in VN timezone */
/** Get the current datetime in VN timezone formatted as YYYY-MM-DDTHH:mm (for use as `min`) */
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

  const y = findPart('year');
  const m = findPart('month');
  const d = findPart('day');
  const h = findPart('hour');
  const min = findPart('minute');

  return `${y}-${m}-${d}T${h}:${min}`;
};

/** Convert local datetime string to ISO 8601 Zulu string */
const toIsoZulu = (localStr: string | null): string | null => {
  if (!localStr) return null;
  const date = new Date(localStr);
  if (isNaN(date.getTime())) return null;
  return date.toISOString();
};

export default function CamPaignFormModal({
  isOpen,
  onClose,
  onSubmit,
  campaign,
  status,
}: CamPaignFormModalProps): React.JSX.Element | null {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isImageRemoved, setIsImageRemoved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<CampaignFormData>({
    resolver: zodResolver(CampaignSchema),
    defaultValues: {
      name: '',
      description: '',
      targetSegment: '',
      registrationStartDate: '',
      registrationEndDate: '',
      startDate: '',
      endDate: '',
    },
  });

  const registrationStartDate = watch('registrationStartDate');
  const registrationEndDate = watch('registrationEndDate');
  const startDate = watch('startDate');
  const endDate = watch('endDate');

  useEffect(() => {
    if (isOpen) {
      if (campaign) {
        reset({
          name: campaign.name,
          description: campaign.description ?? '',
          targetSegment: campaign.targetSegment ?? '',
          registrationStartDate: toLocalDatetimeValue(
            campaign.registrationStartDate
          ),
          registrationEndDate: toLocalDatetimeValue(
            campaign.registrationEndDate
          ),
          startDate: toLocalDatetimeValue(campaign.startDate),
          endDate: toLocalDatetimeValue(campaign.endDate),
        });
      } else {
        reset({
          name: '',
          description: '',
          targetSegment: '',
          registrationStartDate: '',
          registrationEndDate: '',
          startDate: '',
          endDate: '',
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

  useEffect((): (() => void) => {
    return (): void => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  // Cascade-reset only applies in CREATE mode (edit mode allows free editing)
  useEffect(() => {
    if (campaign) return;
    if (!registrationStartDate) {
      setValue('registrationEndDate', '');
      setValue('startDate', '');
      setValue('endDate', '');
    } else if (
      registrationEndDate &&
      registrationStartDate >= registrationEndDate
    ) {
      setValue('registrationEndDate', '');
    }
  }, [campaign, registrationStartDate, registrationEndDate, setValue]);

  useEffect(() => {
    if (campaign) return;
    if (!registrationEndDate) {
      setValue('startDate', '');
      setValue('endDate', '');
    } else if (startDate && registrationEndDate >= startDate) {
      setValue('startDate', '');
    }
  }, [campaign, registrationEndDate, startDate, setValue]);

  useEffect(() => {
    if (campaign) return;
    if (!startDate) {
      setValue('endDate', '');
    } else if (endDate && startDate >= endDate) {
      setValue('endDate', '');
    }
  }, [campaign, startDate, endDate, setValue]);

  const handleFormSubmit = async (data: CampaignFormData): Promise<void> => {
    const payload: CampaignFormData = {
      ...data,
      registrationStartDate: toIsoZulu(data.registrationStartDate) ?? '',
      registrationEndDate: toIsoZulu(data.registrationEndDate) ?? '',
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

  const hasCampaignChanges = isDirty || imageFile !== null || isImageRemoved;

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
      <AppModalHeader
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
                        <div className="flex items-center justify-center rounded-full border border-gray-200 bg-gray-50 p-4 text-gray-400 shadow-sm transition-colors group-hover:text-amber-600">
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

            {/* ── SECTION 3: Thời gian đăng ký ── */}
            <div>
              {sectionLabel('Thời gian đăng ký')}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">
                    Bắt đầu đăng ký <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    {...register('registrationStartDate')}
                    min={campaign ? undefined : getTodayMinVN()}
                    className={inputClass(!!errors.registrationStartDate)}
                  />
                  {errors.registrationStartDate && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.registrationStartDate.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">
                    Kết thúc đăng ký <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    {...register('registrationEndDate')}
                    disabled={!campaign && !registrationStartDate}
                    min={
                      campaign
                        ? undefined
                        : registrationStartDate || getTodayMinVN()
                    }
                    className={inputClass(!!errors.registrationEndDate)}
                  />
                  {errors.registrationEndDate && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.registrationEndDate.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* ── SECTION 4: Thời gian chiến dịch ── */}
            <div>
              {sectionLabel('Thời gian chiến dịch')}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">
                    Bắt đầu chiến dịch <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    {...register('startDate')}
                    disabled={!campaign && !registrationEndDate}
                    min={
                      campaign
                        ? undefined
                        : registrationEndDate || getTodayMinVN()
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
                    Kết thúc chiến dịch <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    {...register('endDate')}
                    disabled={!campaign && !startDate}
                    min={campaign ? undefined : startDate || getTodayMinVN()}
                    className={inputClass(!!errors.endDate)}
                  />
                  {errors.endDate && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.endDate.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
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
              status === 'pending' || (campaign !== null && !hasCampaignChanges)
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
