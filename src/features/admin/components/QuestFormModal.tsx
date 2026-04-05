import { zodResolver } from '@hookform/resolvers/zod';
import {
  Add as AddIcon,
  AddPhotoAlternate as AddPhotoAlternateIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
} from '@mui/material';
import useBadge from '@features/admin/hooks/useBadge';
import useCampaign from '@features/admin/hooks/useCampaign';
import useVoucher from '@features/admin/hooks/useVoucher';
import type { Badge } from '@features/admin/types/badge';
import type { Campaign } from '@features/admin/types/campaign';
import {
  type Quest,
  type QuestCreate,
  QuestRewardType,
  QUEST_REWARD_TYPE_LABELS,
  QuestTaskType,
  QUEST_TASK_TYPE_LABELS,
} from '@features/admin/types/quest';
import {
  type QuestFormInput,
  type QuestFormData,
  QuestSchema,
} from '@features/admin/utils/questSchema';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type JSX,
} from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import type { Voucher } from '@custom-types/voucher';

interface QuestFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: QuestCreate, imageFile?: File | null) => Promise<void>;
  quest: Quest | null;
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
}

interface RewardOption {
  id: number;
  label: string;
  hint: string;
}

const defaultTask = {
  type: QuestTaskType.REVIEW,
  targetValue: 1,
  description: null,
  rewardType: QuestRewardType.POINTS,
  rewardValue: 1,
};

const defaultValues: QuestFormInput = {
  title: '',
  description: null,
  imageUrl: null,
  isActive: true,
  isStandalone: true,
  campaignId: null,
  tasks: [defaultTask],
};

export default function QuestFormModal({
  isOpen,
  onClose,
  onSubmit,
  quest,
  status,
}: QuestFormModalProps): JSX.Element | null {
  const { onGetCampaigns } = useCampaign();
  const { onGetAllBadges } = useBadge();
  const { onGetVouchers } = useVoucher();
  const [campaignOptions, setCampaignOptions] = useState<Campaign[]>([]);
  const [badgeOptions, setBadgeOptions] = useState<Badge[]>([]);
  const [voucherOptions, setVoucherOptions] = useState<Voucher[]>([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);
  const [isLoadingRewards, setIsLoadingRewards] = useState(false);
  const [campaignQuery, setCampaignQuery] = useState('');
  const [isCampaignFocused, setIsCampaignFocused] = useState(false);
  const [rewardQueries, setRewardQueries] = useState<Record<string, string>>(
    {}
  );
  const [rewardFocusedMap, setRewardFocusedMap] = useState<
    Record<string, boolean>
  >({});
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<QuestFormInput, unknown, QuestFormData>({
    resolver: zodResolver(QuestSchema),
    defaultValues,
  });

  const isStandalone = watch('isStandalone');
  const watchedIsActive = watch('isActive');
  const campaignId = watch('campaignId');

  const selectedCampaign = useMemo(() => {
    if (!campaignId) {
      return null;
    }

    return (
      campaignOptions.find((campaign) => campaign.campaignId === campaignId) ??
      null
    );
  }, [campaignId, campaignOptions]);

  const filteredCampaigns = useMemo(() => {
    const normalizedQuery = campaignQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return campaignOptions.slice(0, 8);
    }

    return campaignOptions
      .filter((campaign) =>
        campaign.name.toLowerCase().includes(normalizedQuery)
      )
      .sort((first, second) => {
        const firstStartsWith = first.name
          .toLowerCase()
          .startsWith(normalizedQuery);
        const secondStartsWith = second.name
          .toLowerCase()
          .startsWith(normalizedQuery);

        if (firstStartsWith === secondStartsWith) {
          return first.name.localeCompare(second.name, 'vi');
        }

        return firstStartsWith ? -1 : 1;
      })
      .slice(0, 8);
  }, [campaignOptions, campaignQuery]);

  const badgeRewardOptions = useMemo<RewardOption[]>(
    () =>
      badgeOptions.map((badge) => ({
        id: badge.badgeId,
        label: badge.badgeName,
        hint: `ID: ${badge.badgeId}`,
      })),
    [badgeOptions]
  );

  const voucherRewardOptions = useMemo<RewardOption[]>(
    () =>
      voucherOptions.map((voucher) => ({
        id: voucher.voucherId,
        label: voucher.name,
        hint: voucher.voucherCode,
      })),
    [voucherOptions]
  );

  const getDefaultRewardValue = useCallback(
    (rewardType: QuestRewardType): number => {
      if (rewardType === QuestRewardType.POINTS) {
        return 1;
      }

      if (rewardType === QuestRewardType.BADGE) {
        return badgeRewardOptions[0]?.id ?? 0;
      }

      return voucherRewardOptions[0]?.id ?? 0;
    },
    [badgeRewardOptions, voucherRewardOptions]
  );

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'tasks',
  });

  const fetchCampaignOptions = useCallback(async (): Promise<void> => {
    setIsLoadingCampaigns(true);

    try {
      const response = await onGetCampaigns(1, 200);
      setCampaignOptions(
        (response.items ?? []).filter(
          (campaign) =>
            campaign.createdByVendorId === null &&
            campaign.createdByBranchId === null
        )
      );
    } catch (error) {
      console.error('Failed to fetch campaigns for quest form', error);
      setCampaignOptions([]);
    } finally {
      setIsLoadingCampaigns(false);
    }
  }, [onGetCampaigns]);

  const fetchRewardOptions = useCallback(async (): Promise<void> => {
    setIsLoadingRewards(true);

    try {
      const [badges, vouchers] = await Promise.all([
        onGetAllBadges(),
        onGetVouchers(),
      ]);
      setBadgeOptions(badges);
      setVoucherOptions(vouchers);
    } catch (error) {
      console.error('Failed to fetch reward options for quest form', error);
      setBadgeOptions([]);
      setVoucherOptions([]);
    } finally {
      setIsLoadingRewards(false);
    }
  }, [onGetAllBadges, onGetVouchers]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    void fetchCampaignOptions();
    void fetchRewardOptions();

    if (quest) {
      reset({
        title: quest.title,
        description: quest.description,
        imageUrl: quest.imageUrl,
        isActive: quest.isActive,
        isStandalone: quest.isStandalone,
        campaignId: quest.campaignId,
        tasks:
          quest.tasks.length > 0
            ? quest.tasks.map((task) => ({
                type: task.type,
                targetValue: task.targetValue,
                description: task.description,
                rewardType: task.rewardType,
                rewardValue: task.rewardValue,
              }))
            : [{ ...defaultTask }],
      });
      setSelectedImageFile(null);
      setImagePreviewUrl(quest.imageUrl ?? null);
      setRewardQueries({});
      setRewardFocusedMap({});
      return;
    }

    reset({
      ...defaultValues,
      tasks: [{ ...defaultTask }],
    });
    setCampaignQuery('');
    setSelectedImageFile(null);
    setImagePreviewUrl(null);
    setRewardQueries({});
    setRewardFocusedMap({});
  }, [fetchCampaignOptions, fetchRewardOptions, isOpen, quest, reset]);

  useEffect((): (() => void) => {
    return (): void => {
      if (imagePreviewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  useEffect(() => {
    if (isCampaignFocused) {
      return;
    }

    setCampaignQuery(selectedCampaign?.name ?? '');
  }, [isCampaignFocused, selectedCampaign]);

  useEffect(() => {
    if (isStandalone) {
      setValue('campaignId', null, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [isStandalone, setValue]);

  const handleFormSubmit = async (data: QuestFormData): Promise<void> => {
    await onSubmit(
      {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        isActive: data.isActive,
        isStandalone: data.isStandalone,
        campaignId: data.campaignId,
        tasks: data.tasks.map((task) => ({
          type: task.type,
          targetValue: task.targetValue,
          description: task.description,
          rewardType: task.rewardType,
          rewardValue: task.rewardValue,
        })),
      },
      selectedImageFile
    );
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0] ?? null;

    if (imagePreviewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviewUrl);
    }

    if (!file) {
      setSelectedImageFile(null);
      setImagePreviewUrl(quest?.imageUrl ?? null);
      return;
    }

    setSelectedImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  const handleClearImage = (): void => {
    if (imagePreviewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setSelectedImageFile(null);
    setImagePreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) {
    return null;
  }

  // ── Helpers ──────────────────────────────────────────────────────────────
  const inputClass = (hasError: boolean): string =>
    `w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 ${
      hasError
        ? 'border-red-500 focus:ring-red-200'
        : 'border-gray-300 focus:ring-amber-200'
    }`;

  const sectionLabel = (text: string): JSX.Element => (
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
      <DialogTitle sx={{ m: 0, p: 2, fontWeight: 'bold', pr: 6 }}>
        {quest ? 'Chỉnh sửa nhiệm vụ' : 'Tạo nhiệm vụ mới'}
      </DialogTitle>

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
              <div className="flex flex-col gap-4">
                {/* Toggle: Nhiệm vụ độc lập — placed ABOVE campaign field */}
                <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      Nhiệm vụ độc lập
                    </p>
                    <p className="text-xs text-gray-500">
                      Bật nếu nhiệm vụ không thuộc chiến dịch nào
                    </p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      {...register('isStandalone')}
                      className="peer sr-only"
                    />
                    <div
                      className="peer h-6 w-11 rounded-full bg-gray-300 transition-all after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full"
                      style={{
                        backgroundColor: isStandalone ? '#8bcf3f' : '#d1d5db',
                        transition: 'background-color 0.2s',
                      }}
                    />
                  </label>
                </div>

                {/* Campaign picker — hidden when standalone */}
                {!isStandalone && (
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">
                      Tên chiến dịch <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={campaignQuery}
                        onFocus={() => setIsCampaignFocused(true)}
                        onBlur={() => {
                          window.setTimeout(
                            () => setIsCampaignFocused(false),
                            120
                          );
                        }}
                        onChange={(event) => {
                          const nextQuery = event.target.value;
                          setCampaignQuery(nextQuery);
                          setValue('campaignId', null, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        }}
                        className={inputClass(!!errors.campaignId)}
                        placeholder="Nhập tên chiến dịch để tìm"
                      />

                      {isCampaignFocused && campaignQuery.trim().length > 0 && (
                        <div className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                          {isLoadingCampaigns ? (
                            <p className="px-3 py-2 text-sm text-gray-500">
                              Đang tải chiến dịch...
                            </p>
                          ) : filteredCampaigns.length > 0 ? (
                            filteredCampaigns.map((campaign) => (
                              <button
                                key={campaign.campaignId}
                                type="button"
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => {
                                  setValue('campaignId', campaign.campaignId, {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                  });
                                  setCampaignQuery(campaign.name);
                                  setIsCampaignFocused(false);
                                }}
                                className="hover:bg-primary-50 w-full px-3 py-2 text-left text-sm"
                              >
                                <p className="font-medium text-gray-800">
                                  {campaign.name}
                                </p>
                              </button>
                            ))
                          ) : (
                            <p className="px-3 py-2 text-sm text-gray-500">
                              Không tìm thấy chiến dịch phù hợp.
                            </p>
                          )}
                        </div>
                      )}

                      {errors.campaignId && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.campaignId.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Title */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">
                      Tiêu đề <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('title')}
                      className={inputClass(!!errors.title)}
                      placeholder="Nhập tiêu đề nhiệm vụ"
                    />
                    {errors.title && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.title.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* ── SECTION 2: Nội dung & Hình ảnh ── */}
            <div>
              {sectionLabel('Nội dung & Hình ảnh')}
              <div className="flex flex-col gap-4">
                {/* Description */}
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">
                    Mô tả
                  </label>
                  <textarea
                    rows={3}
                    {...register('description', {
                      setValueAs: (value) =>
                        typeof value === 'string' && value.trim() === ''
                          ? null
                          : value,
                    })}
                    className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-200"
                    placeholder="Nhập mô tả nhiệm vụ"
                  />
                  {errors.description && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                {/* Image upload */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Ảnh nhiệm vụ
                  </label>
                  <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                    {imagePreviewUrl ? (
                      <div className="group hover:border-primary-400 relative flex min-h-40 w-full items-center justify-center overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm transition-colors">
                        <img
                          src={imagePreviewUrl}
                          alt="Quest preview"
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
                          {!quest && (
                            <Tooltip title="Xoá ảnh hiện tại" arrow>
                              <IconButton
                                onClick={handleClearImage}
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
                          )}
                        </div>
                      </div>
                    ) : (
                      <div
                        className="hover:border-primary-400 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white transition-colors hover:bg-gray-50/50"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <div className="flex items-center justify-center rounded-full border border-gray-200 bg-gray-50 p-4 text-gray-400 shadow-sm">
                          <AddPhotoAlternateIcon fontSize="medium" />
                        </div>
                        <div className="mt-3 text-center">
                          <p className="text-sm font-semibold text-gray-700">
                            Nhấn để tải ảnh lên
                          </p>
                          <p className="text-xs text-gray-500">
                            Kích thước khuyên dùng: 800x800 (1:1)
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
                      onChange={handleImageChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* ── SECTION 3: Danh sách nhiệm vụ con ── */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                {sectionLabel('Danh sách nhiệm vụ con')}
                <button
                  type="button"
                  onClick={() => append({ ...defaultTask })}
                  className="border-primary-500 text-primary-600 hover:bg-primary-50 flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors"
                >
                  <AddIcon fontSize="small" />
                  Thêm
                </button>
              </div>

              {errors.tasks?.message && (
                <p className="mb-2 text-xs text-red-500">
                  {errors.tasks.message}
                </p>
              )}

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="font-semibold text-gray-700">
                        Nhiệm vụ {index + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                        className="flex items-center gap-1 text-sm font-medium text-red-600 disabled:cursor-not-allowed disabled:text-gray-400"
                      >
                        <DeleteIcon fontSize="small" />
                        Xóa
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {/* Task type */}
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-gray-700">
                          Loại nhiệm vụ <span className="text-red-500">*</span>
                        </label>
                        <select
                          {...register(`tasks.${index}.type`, {
                            setValueAs: (value) => Number(value),
                          })}
                          className={inputClass(!!errors.tasks?.[index]?.type)}
                        >
                          {Object.entries(QUEST_TASK_TYPE_LABELS).map(
                            ([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            )
                          )}
                        </select>
                        {errors.tasks?.[index]?.type && (
                          <p className="mt-1 text-xs text-red-500">
                            {errors.tasks[index]?.type?.message}
                          </p>
                        )}
                      </div>

                      {/* Target value */}
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-gray-700">
                          Mục tiêu <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          {...register(`tasks.${index}.targetValue`, {
                            valueAsNumber: true,
                          })}
                          className={inputClass(
                            !!errors.tasks?.[index]?.targetValue
                          )}
                        />
                        {errors.tasks?.[index]?.targetValue && (
                          <p className="mt-1 text-xs text-red-500">
                            {errors.tasks[index]?.targetValue?.message}
                          </p>
                        )}
                      </div>

                      {/* Reward type */}
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-gray-700">
                          Loại thưởng <span className="text-red-500">*</span>
                        </label>
                        {((): JSX.Element => {
                          const rewardTypeRegister = register(
                            `tasks.${index}.rewardType`,
                            {
                              setValueAs: (value) => Number(value),
                            }
                          );

                          return (
                            <select
                              {...rewardTypeRegister}
                              onChange={(event) => {
                                rewardTypeRegister.onChange(event);
                                const nextRewardType = Number(
                                  event.target.value
                                ) as QuestRewardType;
                                const taskKey = field.id;

                                setValue(
                                  `tasks.${index}.rewardValue`,
                                  getDefaultRewardValue(nextRewardType),
                                  { shouldDirty: true, shouldValidate: true }
                                );

                                if (nextRewardType === QuestRewardType.POINTS) {
                                  setRewardQueries((prev) => {
                                    const nextQueries = { ...prev };
                                    delete nextQueries[taskKey];
                                    return nextQueries;
                                  });
                                } else {
                                  setRewardQueries((prev) => ({
                                    ...prev,
                                    [taskKey]: '',
                                  }));
                                }
                              }}
                              className={inputClass(
                                !!errors.tasks?.[index]?.rewardType
                              )}
                            >
                              {Object.entries(QUEST_REWARD_TYPE_LABELS).map(
                                ([value, label]) => (
                                  <option key={value} value={value}>
                                    {label}
                                  </option>
                                )
                              )}
                            </select>
                          );
                        })()}
                        {errors.tasks?.[index]?.rewardType && (
                          <p className="mt-1 text-xs text-red-500">
                            {errors.tasks[index]?.rewardType?.message}
                          </p>
                        )}
                      </div>

                      {/* Reward value */}
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-gray-700">
                          Giá trị thưởng <span className="text-red-500">*</span>
                        </label>
                        {((): JSX.Element => {
                          const rewardTypeValue =
                            watch(`tasks.${index}.rewardType`) ??
                            QuestRewardType.POINTS;

                          if (rewardTypeValue === QuestRewardType.POINTS) {
                            return (
                              <input
                                type="number"
                                {...register(`tasks.${index}.rewardValue`, {
                                  valueAsNumber: true,
                                })}
                                className={inputClass(
                                  !!errors.tasks?.[index]?.rewardValue
                                )}
                              />
                            );
                          }

                          const isBadgeReward =
                            rewardTypeValue === QuestRewardType.BADGE;
                          const rewardOptions = isBadgeReward
                            ? badgeRewardOptions
                            : voucherRewardOptions;
                          const currentRewardValue =
                            watch(`tasks.${index}.rewardValue`) ?? 0;
                          const selectedRewardOption =
                            rewardOptions.find(
                              (option) => option.id === currentRewardValue
                            ) ?? null;
                          const taskKey = field.id;
                          const isRewardFocused =
                            rewardFocusedMap[taskKey] ?? false;
                          const rewardQueryFromState = rewardQueries[taskKey];
                          const rewardQuery =
                            rewardQueryFromState ??
                            selectedRewardOption?.label ??
                            '';
                          const normalizedRewardQuery = rewardQuery
                            .trim()
                            .toLowerCase();
                          const filteredRewardOptions = !normalizedRewardQuery
                            ? rewardOptions.slice(0, 8)
                            : rewardOptions
                                .filter((option) =>
                                  `${option.label}`
                                    .toLowerCase()
                                    .includes(normalizedRewardQuery)
                                )
                                .slice(0, 8);

                          return (
                            <div className="relative">
                              <input
                                type="hidden"
                                {...register(`tasks.${index}.rewardValue`, {
                                  valueAsNumber: true,
                                })}
                              />

                              <input
                                type="text"
                                value={rewardQuery}
                                onFocus={() => {
                                  setRewardFocusedMap((prev) => ({
                                    ...prev,
                                    [taskKey]: true,
                                  }));
                                }}
                                onBlur={() => {
                                  window.setTimeout(() => {
                                    setRewardFocusedMap((prev) => ({
                                      ...prev,
                                      [taskKey]: false,
                                    }));
                                  }, 120);
                                }}
                                onChange={(event) => {
                                  const nextQuery = event.target.value;
                                  setRewardQueries((prev) => ({
                                    ...prev,
                                    [taskKey]: nextQuery,
                                  }));
                                }}
                                className={inputClass(
                                  !!errors.tasks?.[index]?.rewardValue
                                )}
                                placeholder={
                                  isBadgeReward
                                    ? 'Tìm và chọn huy hiệu'
                                    : 'Tìm và chọn voucher'
                                }
                              />

                              {isRewardFocused && (
                                <div className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                                  {isLoadingRewards ? (
                                    <p className="px-3 py-2 text-sm text-gray-500">
                                      Đang tải dữ liệu phần thưởng...
                                    </p>
                                  ) : filteredRewardOptions.length > 0 ? (
                                    filteredRewardOptions.map((option) => (
                                      <button
                                        key={option.id}
                                        type="button"
                                        onMouseDown={(event) =>
                                          event.preventDefault()
                                        }
                                        onClick={() => {
                                          setValue(
                                            `tasks.${index}.rewardValue`,
                                            option.id,
                                            {
                                              shouldDirty: true,
                                              shouldValidate: true,
                                            }
                                          );
                                          setRewardQueries((prev) => ({
                                            ...prev,
                                            [taskKey]: option.label,
                                          }));
                                          setRewardFocusedMap((prev) => ({
                                            ...prev,
                                            [taskKey]: false,
                                          }));
                                        }}
                                        className="hover:bg-primary-50 w-full px-3 py-2 text-left text-sm"
                                      >
                                        <p className="font-medium text-gray-800">
                                          {option.label}
                                        </p>
                                      </button>
                                    ))
                                  ) : (
                                    <p className="px-3 py-2 text-sm text-gray-500">
                                      Không tìm thấy phần thưởng phù hợp.
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                        {errors.tasks?.[index]?.rewardValue && (
                          <p className="mt-1 text-xs text-red-500">
                            {errors.tasks[index]?.rewardValue?.message}
                          </p>
                        )}
                      </div>

                      {/* Task description */}
                      <div className="md:col-span-2">
                        <label className="mb-1 block text-sm font-semibold text-gray-700">
                          Mô tả nhiệm vụ con
                        </label>
                        <textarea
                          rows={2}
                          {...register(`tasks.${index}.description`, {
                            setValueAs: (value) =>
                              typeof value === 'string' && value.trim() === ''
                                ? null
                                : value,
                          })}
                          className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-200"
                        />
                        {errors.tasks?.[index]?.description && (
                          <p className="mt-1 text-xs text-red-500">
                            {errors.tasks[index]?.description?.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* ── SECTION 4: Thiết lập khác ── */}
            <div>
              {sectionLabel('Thiết lập khác')}
              <div className="flex flex-col gap-4">
                {/* isActive toggle */}
                <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      Trạng thái hoạt động
                    </p>
                    <p className="text-xs text-gray-500">
                      Bật để cho phép nhiệm vụ hiển thị trên hệ thống
                    </p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      {...register('isActive')}
                      className="peer sr-only"
                    />
                    <div
                      className="peer h-6 w-11 rounded-full bg-gray-300 transition-all after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full"
                      style={{
                        backgroundColor: watchedIsActive
                          ? '#8bcf3f'
                          : '#d1d5db',
                        transition: 'background-color 0.2s',
                      }}
                    />
                  </label>
                </div>
              </div>
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
            {quest ? 'Cập nhật' : 'Tạo nhiệm vụ'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
