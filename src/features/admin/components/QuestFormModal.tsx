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
  IconButton,
  Tooltip,
} from '@mui/material';
import AppModalHeader from '@components/AppModalHeader';
import useBadge from '@features/admin/hooks/useBadge';
import useCampaign from '@features/admin/hooks/useCampaign';
import useVoucher from '@features/admin/hooks/useVoucher';
import type { Badge } from '@features/admin/types/badge';
import type { Campaign } from '@features/admin/types/campaign';
import type { Tier } from '@features/admin/types/tier';
import {
  type Quest,
  type QuestCreate,
  QuestRewardType,
  QUEST_REWARD_TYPE_LABELS,
  QuestTaskType,
  QUEST_TASK_TYPE_LABELS,
} from '@features/admin/types/quest';
import {
  type QuestFormData,
  type QuestFormInput,
  QuestSchema,
} from '@features/admin/utils/questSchema';
import { axiosApi } from '@lib/api/apiInstance';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ChangeEvent,
  type JSX,
  type SetStateAction,
} from 'react';
import {
  useFieldArray,
  useForm,
  type Control,
  type FieldErrors,
  type UseFormRegister,
  type UseFormSetValue,
  type UseFormWatch,
} from 'react-hook-form';
import type { Voucher } from '@custom-types/voucher';

type QuestScope = 'standalone' | 'campaign' | 'upgrade';

const ALLOWED_TIER_TARGET_NAMES = new Set(['gold', 'diamond', 'silver']);

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
  searchText?: string;
}

const formatCurrencyVND = (value: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
};

const buildVoucherDiscountText = (voucher: Voucher): string => {
  if (voucher.type === 'PERCENT') {
    const maxCapText = voucher.maxDiscountValue
      ? `, tối đa ${formatCurrencyVND(voucher.maxDiscountValue)}`
      : '';
    return `Giảm ${voucher.discountValue}%${maxCapText}`;
  }

  return `Giảm ${formatCurrencyVND(voucher.discountValue)}`;
};

const getDefaultRewardValue = (rewardType: QuestRewardType): number => {
  if (rewardType === QuestRewardType.POINTS) {
    return 1;
  }

  return 0;
};

const formatNumberWithDotGrouping = (value: number): string => {
  const safeNumber = Number.isFinite(value) ? Math.trunc(value) : 0;
  return safeNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const createDefaultReward =
  (): QuestFormInput['tasks'][number]['rewards'][number] => ({
    rewardType: QuestRewardType.POINTS,
    rewardValue: getDefaultRewardValue(QuestRewardType.POINTS),
    quantity: 1,
  });

const createDefaultTask = (): QuestFormInput['tasks'][number] => ({
  type: QuestTaskType.REVIEW,
  targetValue: 1,
  description: null,
  rewards: [createDefaultReward()],
});

const createUpgradeTask = (tiers: Tier[]): QuestFormInput['tasks'][number] => ({
  type: QuestTaskType.TIER_UP,
  targetValue: tiers[0]?.tierId ?? 1,
  description: null,
  rewards: [createDefaultReward()],
});

const defaultValues: QuestFormInput = {
  questScope: 'standalone',
  title: '',
  description: null,
  imageUrl: null,
  isActive: true,
  requiresEnrollment: true,
  isStandalone: true,
  campaignId: null,
  tasks: [
    {
      type: QuestTaskType.REVIEW,
      targetValue: 1,
      description: null,
      rewards: [
        {
          rewardType: QuestRewardType.POINTS,
          rewardValue: 1,
          quantity: 1,
        },
      ],
    },
  ],
};

interface TaskRewardFieldsProps {
  taskIndex: number;
  control: Control<QuestFormInput>;
  register: UseFormRegister<QuestFormInput>;
  watch: UseFormWatch<QuestFormInput>;
  setValue: UseFormSetValue<QuestFormInput>;
  errors: FieldErrors<QuestFormInput>;
  badgeRewardOptions: RewardOption[];
  voucherRewardOptions: RewardOption[];
  isLoadingRewards: boolean;
  rewardQueries: Record<string, string>;
  setRewardQueries: Dispatch<SetStateAction<Record<string, string>>>;
  rewardFocusedMap: Record<string, boolean>;
  setRewardFocusedMap: Dispatch<SetStateAction<Record<string, boolean>>>;
  onAppendReward: (taskIndex: number) => void;
}

function TaskRewardFields({
  taskIndex,
  control,
  register,
  watch,
  setValue,
  errors,
  badgeRewardOptions,
  voucherRewardOptions,
  isLoadingRewards,
  rewardQueries,
  setRewardQueries,
  rewardFocusedMap,
  setRewardFocusedMap,
  onAppendReward,
}: TaskRewardFieldsProps): JSX.Element {
  const { fields, remove } = useFieldArray({
    control,
    name: `tasks.${taskIndex}.rewards`,
  });

  return (
    <div className="mt-4 rounded-lg border border-gray-200 bg-white p-3">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-700">Phần thưởng</p>
        <button
          type="button"
          onClick={() => onAppendReward(taskIndex)}
          className="border-primary-500 text-primary-600 hover:bg-primary-50 flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-semibold"
        >
          <AddIcon fontSize="small" />
          Thêm thưởng
        </button>
      </div>

      <div className="space-y-3">
        {fields.map((rewardField, rewardIndex) => {
          const rewardType =
            watch(`tasks.${taskIndex}.rewards.${rewardIndex}.rewardType`) ??
            QuestRewardType.POINTS;

          return (
            <div
              key={rewardField.id}
              className="rounded-lg border border-gray-200 bg-gray-50 p-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-600">
                  Phần thưởng {rewardIndex + 1}
                </p>
                <button
                  type="button"
                  onClick={() => remove(rewardIndex)}
                  disabled={fields.length === 1}
                  className="text-xs font-semibold text-red-600 disabled:cursor-not-allowed disabled:text-gray-400"
                >
                  Xóa
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700">
                    Loại thưởng
                  </label>
                  <select
                    {...register(
                      `tasks.${taskIndex}.rewards.${rewardIndex}.rewardType`,
                      {
                        setValueAs: (value) => Number(value),
                      }
                    )}
                    onChange={(event) => {
                      const nextRewardType = Number(
                        event.target.value
                      ) as QuestRewardType;
                      const rewardKey = rewardField.id;
                      setValue(
                        `tasks.${taskIndex}.rewards.${rewardIndex}.rewardType`,
                        nextRewardType,
                        { shouldDirty: true, shouldValidate: true }
                      );
                      setValue(
                        `tasks.${taskIndex}.rewards.${rewardIndex}.rewardValue`,
                        getDefaultRewardValue(nextRewardType),
                        { shouldDirty: true, shouldValidate: true }
                      );
                      setValue(
                        `tasks.${taskIndex}.rewards.${rewardIndex}.quantity`,
                        1,
                        { shouldDirty: true, shouldValidate: true }
                      );
                      setRewardQueries((prev) => ({
                        ...prev,
                        [rewardKey]: '',
                      }));
                    }}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-200"
                  >
                    {Object.entries(QUEST_REWARD_TYPE_LABELS).map(
                      ([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700">
                    Giá trị thưởng
                  </label>
                  {rewardType === QuestRewardType.POINTS ? (
                    <input
                      type="number"
                      {...register(
                        `tasks.${taskIndex}.rewards.${rewardIndex}.rewardValue`,
                        { valueAsNumber: true }
                      )}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-200"
                    />
                  ) : (
                    ((): JSX.Element => {
                      const isBadgeReward =
                        rewardType === QuestRewardType.BADGE;
                      const rewardOptions = isBadgeReward
                        ? badgeRewardOptions
                        : voucherRewardOptions;
                      const currentRewardValue =
                        watch(
                          `tasks.${taskIndex}.rewards.${rewardIndex}.rewardValue`
                        ) ?? 0;
                      const selectedRewardOption =
                        rewardOptions.find(
                          (option) => option.id === currentRewardValue
                        ) ?? null;
                      const rewardKey = rewardField.id;
                      const isFocused = rewardFocusedMap[rewardKey] ?? false;
                      const queryFromState = rewardQueries[rewardKey];
                      const query =
                        queryFromState ?? selectedRewardOption?.label ?? '';
                      const normalizedQuery = query.trim().toLowerCase();
                      const filteredRewardOptions = !normalizedQuery
                        ? rewardOptions.slice(0, 8)
                        : rewardOptions
                            .filter((option) =>
                              `${option.label} ${option.searchText ?? option.hint}`
                                .toLowerCase()
                                .includes(normalizedQuery)
                            )
                            .slice(0, 8);

                      return (
                        <div className="relative">
                          <input
                            type="hidden"
                            {...register(
                              `tasks.${taskIndex}.rewards.${rewardIndex}.rewardValue`,
                              {
                                valueAsNumber: true,
                              }
                            )}
                          />

                          <input
                            type="text"
                            value={query}
                            onFocus={() => {
                              setRewardFocusedMap((prev) => ({
                                ...prev,
                                [rewardKey]: true,
                              }));
                            }}
                            onBlur={() => {
                              window.setTimeout(() => {
                                setRewardFocusedMap((prev) => ({
                                  ...prev,
                                  [rewardKey]: false,
                                }));
                              }, 120);
                            }}
                            onChange={(event) => {
                              const nextQuery = event.target.value;
                              setRewardQueries((prev) => ({
                                ...prev,
                                [rewardKey]: nextQuery,
                              }));
                            }}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-200"
                            placeholder={
                              isBadgeReward
                                ? 'Nhập để tìm huy hiệu'
                                : 'Nhập để tìm voucher'
                            }
                          />

                          {isFocused && (
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
                                        `tasks.${taskIndex}.rewards.${rewardIndex}.rewardValue`,
                                        option.id,
                                        {
                                          shouldDirty: true,
                                          shouldValidate: true,
                                        }
                                      );
                                      setRewardQueries((prev) => ({
                                        ...prev,
                                        [rewardKey]: option.label,
                                      }));
                                      setRewardFocusedMap((prev) => ({
                                        ...prev,
                                        [rewardKey]: false,
                                      }));
                                    }}
                                    className="hover:bg-primary-50 w-full px-3 py-2 text-left text-sm"
                                  >
                                    <p className="font-medium text-gray-800">
                                      {option.label}
                                    </p>
                                    <p className="mt-0.5 text-xs text-gray-500">
                                      {option.hint}
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
                    })()
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700">
                    Số lượng
                  </label>
                  <input
                    type="number"
                    min={1}
                    {...register(
                      `tasks.${taskIndex}.rewards.${rewardIndex}.quantity`,
                      {
                        setValueAs: (value) =>
                          value === '' ? null : Number(value),
                      }
                    )}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-200"
                  />
                </div>
              </div>

              {errors.tasks?.[taskIndex]?.rewards?.[rewardIndex]
                ?.rewardType && (
                <p className="mt-1 text-xs text-red-500">
                  {
                    errors.tasks[taskIndex]?.rewards?.[rewardIndex]?.rewardType
                      ?.message as string
                  }
                </p>
              )}
              {errors.tasks?.[taskIndex]?.rewards?.[rewardIndex]
                ?.rewardValue && (
                <p className="mt-1 text-xs text-red-500">
                  {
                    errors.tasks[taskIndex]?.rewards?.[rewardIndex]?.rewardValue
                      ?.message as string
                  }
                </p>
              )}
              {errors.tasks?.[taskIndex]?.rewards?.[rewardIndex]?.quantity && (
                <p className="mt-1 text-xs text-red-500">
                  {
                    errors.tasks[taskIndex]?.rewards?.[rewardIndex]?.quantity
                      ?.message as string
                  }
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

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
  const [tierOptions, setTierOptions] = useState<Tier[]>([]);
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
    formState: { errors, isDirty },
  } = useForm<QuestFormInput, unknown, QuestFormData>({
    resolver: zodResolver(QuestSchema),
    defaultValues,
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'tasks',
  });

  const questScope = watch('questScope');
  const campaignId = watch('campaignId');
  const hasQuestChanges = isDirty || selectedImageFile !== null;

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
        hint: '',
      })),
    [badgeOptions]
  );

  const voucherRewardOptions = useMemo<RewardOption[]>(
    () =>
      voucherOptions.map((voucher) => ({
        id: voucher.voucherId,
        label: voucher.name,
        hint: `${buildVoucherDiscountText(voucher)} | Đơn tối thiểu ${formatCurrencyVND(
          voucher.minAmountRequired
        )}`,
        searchText: `${voucher.name} ${voucher.voucherCode} ${voucher.discountValue} ${voucher.minAmountRequired}`,
      })),
    [voucherOptions]
  );

  const filteredTierOptions = useMemo((): Tier[] => {
    return tierOptions.filter((tier) =>
      ALLOWED_TIER_TARGET_NAMES.has(tier.name.trim().toLowerCase())
    );
  }, [tierOptions]);

  const fetchReferenceData = useCallback(async (): Promise<void> => {
    setIsLoadingCampaigns(true);
    setIsLoadingRewards(true);

    try {
      const [campaignResponse, badges, vouchers, tiers] = await Promise.all([
        onGetCampaigns(1, 200),
        onGetAllBadges(),
        onGetVouchers(),
        axiosApi.tierApi.getTiers(),
      ]);

      setCampaignOptions(
        (campaignResponse.items ?? []).filter(
          (campaign) =>
            campaign.createdByVendorId === null &&
            campaign.createdByBranchId === null &&
            campaign.isUpdateable
        )
      );
      setBadgeOptions(badges);
      setVoucherOptions(vouchers);
      setTierOptions(tiers);
    } catch (error) {
      console.error('Failed to fetch quest reference data', error);
      setCampaignOptions([]);
      setBadgeOptions([]);
      setVoucherOptions([]);
      setTierOptions([]);
    } finally {
      setIsLoadingCampaigns(false);
      setIsLoadingRewards(false);
    }
  }, [onGetAllBadges, onGetCampaigns, onGetVouchers]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    void fetchReferenceData();

    if (quest) {
      const normalizedTasks =
        quest.tasks.length > 0
          ? quest.tasks.map((task) => ({
              type: task.type,
              targetValue: task.targetValue,
              description: task.description,
              rewards:
                task.rewards?.length > 0
                  ? task.rewards.map((reward) => ({
                      rewardType: reward.rewardType,
                      rewardValue: reward.rewardValue,
                      quantity: reward.quantity,
                    }))
                  : [createDefaultReward()],
            }))
          : [createDefaultTask()];
      const inferredScope: QuestScope =
        normalizedTasks[0]?.type === QuestTaskType.TIER_UP
          ? 'upgrade'
          : quest.isStandalone
            ? 'standalone'
            : 'campaign';

      reset({
        questScope: inferredScope,
        title: quest.title,
        description: quest.description,
        imageUrl: quest.imageUrl,
        isActive: true,
        requiresEnrollment: inferredScope !== 'upgrade',
        isStandalone: inferredScope !== 'campaign',
        campaignId: inferredScope === 'campaign' ? quest.campaignId : null,
        tasks: normalizedTasks,
      });
      setSelectedImageFile(null);
      setImagePreviewUrl(quest.imageUrl ?? null);
      setCampaignQuery('');
      setRewardQueries({});
      setRewardFocusedMap({});
      return;
    }

    reset(defaultValues);
    setSelectedImageFile(null);
    setImagePreviewUrl(null);
    setCampaignQuery('');
    setRewardQueries({});
    setRewardFocusedMap({});
  }, [fetchReferenceData, isOpen, quest, reset]);

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

  const handleQuestScopeChange = (scope: QuestScope): void => {
    setValue('questScope', scope, {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (scope === 'campaign') {
      setValue('isStandalone', false, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue('requiresEnrollment', true, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setCampaignQuery(selectedCampaign?.name ?? '');
      return;
    }

    if (scope === 'standalone') {
      setValue('isStandalone', true, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue('campaignId', null, { shouldDirty: true, shouldValidate: true });
      setValue('requiresEnrollment', true, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setCampaignQuery('');
      return;
    }

    setValue('isStandalone', true, { shouldDirty: true, shouldValidate: true });
    setValue('campaignId', null, { shouldDirty: true, shouldValidate: true });
    setValue('requiresEnrollment', false, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setCampaignQuery('');
    replace([createUpgradeTask(filteredTierOptions)]);
    setValue('tasks.0.targetValue', filteredTierOptions[0]?.tierId ?? 1, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleFormSubmit = async (data: QuestFormData): Promise<void> => {
    const isUpgrade = data.questScope === 'upgrade';
    const isCampaign = data.questScope === 'campaign';

    await onSubmit(
      {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        isActive: true,
        requiresEnrollment: !isUpgrade,
        isStandalone: !isCampaign,
        campaignId: isCampaign ? data.campaignId : null,
        tasks: data.tasks.map((task) => ({
          type: isUpgrade ? QuestTaskType.TIER_UP : task.type,
          targetValue: task.targetValue,
          description: task.description,
          rewards: task.rewards.map((reward) => ({
            rewardType: reward.rewardType,
            rewardValue: reward.rewardValue,
            quantity: reward.quantity,
          })),
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

  const handleAppendTask = (): void => {
    append(createDefaultTask());
  };

  const handleAppendReward = (taskIndex: number): void => {
    const currentRewards = watch(`tasks.${taskIndex}.rewards`) ?? [];
    setValue(
      `tasks.${taskIndex}.rewards`,
      [...currentRewards, createDefaultReward()],
      { shouldDirty: true, shouldValidate: true }
    );
  };

  if (!isOpen) {
    return null;
  }

  const inputClass = (hasError: boolean): string =>
    `w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 ${
      hasError
        ? 'border-red-500 focus:ring-red-200'
        : 'border-gray-300 focus:ring-amber-200'
    }`;

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
        title={quest ? 'Chỉnh sửa nhiệm vụ' : 'Tạo nhiệm vụ mới'}
        subtitle={quest?.title ?? ''}
        icon={<AddIcon />}
        iconTone="admin"
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
            <div>
              <p className="mb-2 text-xs font-bold tracking-wide text-gray-500 uppercase">
                Loại quest
              </p>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                <button
                  type="button"
                  onClick={() => handleQuestScopeChange('campaign')}
                  className={`rounded-lg border px-3 py-2 text-left text-sm font-semibold ${
                    questScope === 'campaign'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 bg-white text-gray-700'
                  }`}
                >
                  Theo chiến dịch
                </button>
                <button
                  type="button"
                  onClick={() => handleQuestScopeChange('standalone')}
                  className={`rounded-lg border px-3 py-2 text-left text-sm font-semibold ${
                    questScope === 'standalone'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 bg-white text-gray-700'
                  }`}
                >
                  Độc lập
                </button>
                <button
                  type="button"
                  onClick={() => handleQuestScopeChange('upgrade')}
                  className={`rounded-lg border px-3 py-2 text-left text-sm font-semibold ${
                    questScope === 'upgrade'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 bg-white text-gray-700'
                  }`}
                >
                  Nâng cấp (Hạng)
                </button>
              </div>
              <input type="hidden" {...register('questScope')} />
              <input type="hidden" {...register('isStandalone')} />
              <input type="hidden" {...register('requiresEnrollment')} />
              <input type="hidden" {...register('isActive')} />
            </div>

            {questScope === 'campaign' && (
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
                      window.setTimeout(() => setIsCampaignFocused(false), 120);
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
                </div>
                {errors.campaignId && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.campaignId.message}
                  </p>
                )}
              </div>
            )}

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

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Ảnh nhiệm vụ
              </label>
              <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                {imagePreviewUrl ? (
                  <div className="group relative flex min-h-40 w-full items-center justify-center overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm">
                    <img
                      src={imagePreviewUrl}
                      alt="Quest preview"
                      className="h-40 w-auto max-w-full object-contain"
                    />
                    <div className="absolute inset-0 flex items-center justify-center gap-4 bg-black/40 opacity-0 transition-all duration-300 group-hover:opacity-100">
                      <Tooltip title="Đổi ảnh khác" arrow>
                        <IconButton
                          onClick={() => fileInputRef.current?.click()}
                          sx={{
                            bgcolor: 'rgba(255,255,255,0.95)',
                            color: 'var(--color-primary-600)',
                            '&:hover': {
                              bgcolor: 'white',
                            },
                          }}
                        >
                          <AddPhotoAlternateIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa ảnh" arrow>
                        <IconButton
                          onClick={handleClearImage}
                          sx={{
                            bgcolor: 'rgba(255,255,255,0.95)',
                            color: '#ef4444',
                            '&:hover': {
                              bgcolor: '#fee2e2',
                            },
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </div>
                ) : (
                  <div
                    className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <AddPhotoAlternateIcon fontSize="medium" />
                    <p className="mt-2 text-sm font-semibold text-gray-700">
                      Nhấn để tải ảnh lên
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-bold tracking-wide text-gray-500 uppercase">
                  Danh sách nhiệm vụ con
                </p>
                {questScope !== 'upgrade' && (
                  <button
                    type="button"
                    onClick={handleAppendTask}
                    className="border-primary-500 text-primary-600 hover:bg-primary-50 flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-semibold"
                  >
                    <AddIcon fontSize="small" />
                    Thêm nhiệm vụ
                  </button>
                )}
              </div>

              {errors.tasks?.message && (
                <p className="mb-2 text-xs text-red-500">
                  {errors.tasks.message}
                </p>
              )}

              <div className="space-y-4">
                {fields.map((field, index) => {
                  const currentTaskType =
                    watch(`tasks.${index}.type`) ?? QuestTaskType.REVIEW;
                  const currentTargetValue =
                    watch(`tasks.${index}.targetValue`) ?? 0;

                  return (
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
                          disabled={
                            fields.length === 1 || questScope === 'upgrade'
                          }
                          className="flex items-center gap-1 text-sm font-medium text-red-600 disabled:cursor-not-allowed disabled:text-gray-400"
                        >
                          <DeleteIcon fontSize="small" />
                          Xóa
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-sm font-semibold text-gray-700">
                            Loại nhiệm vụ{' '}
                            <span className="text-red-500">*</span>
                          </label>
                          {questScope === 'upgrade' ? (
                            <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700">
                              {QUEST_TASK_TYPE_LABELS[QuestTaskType.TIER_UP]}
                            </div>
                          ) : (
                            <select
                              {...register(`tasks.${index}.type`, {
                                setValueAs: (value) => Number(value),
                              })}
                              className={inputClass(
                                !!errors.tasks?.[index]?.type
                              )}
                            >
                              {Object.entries(QUEST_TASK_TYPE_LABELS)
                                .filter(
                                  ([value]) =>
                                    value !== String(QuestTaskType.TIER_UP)
                                )
                                .map(([value, label]) => (
                                  <option key={value} value={value}>
                                    {label}
                                  </option>
                                ))}
                            </select>
                          )}
                          {errors.tasks?.[index]?.type && (
                            <p className="mt-1 text-xs text-red-500">
                              {errors.tasks[index]?.type?.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="mb-1 block text-sm font-semibold text-gray-700">
                            Giá trị cần đạt{' '}
                            <span className="text-red-500">*</span>
                          </label>
                          {questScope === 'upgrade' ||
                          currentTaskType === QuestTaskType.TIER_UP ? (
                            <select
                              {...register(`tasks.${index}.targetValue`, {
                                setValueAs: (value) => Number(value),
                              })}
                              className={inputClass(
                                !!errors.tasks?.[index]?.targetValue
                              )}
                            >
                              {filteredTierOptions.map((tier) => (
                                <option key={tier.tierId} value={tier.tierId}>
                                  {tier.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <>
                              {currentTaskType ===
                              QuestTaskType.ORDER_AMOUNT ? (
                                <>
                                  <input
                                    type="hidden"
                                    {...register(`tasks.${index}.targetValue`, {
                                      valueAsNumber: true,
                                    })}
                                  />
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    value={
                                      Number.isFinite(currentTargetValue)
                                        ? formatNumberWithDotGrouping(
                                            currentTargetValue
                                          )
                                        : ''
                                    }
                                    onChange={(event) => {
                                      const digitsOnly =
                                        event.target.value.replace(/\D/g, '');
                                      const parsedValue =
                                        digitsOnly.length > 0
                                          ? Number(digitsOnly)
                                          : Number.NaN;
                                      setValue(
                                        `tasks.${index}.targetValue`,
                                        parsedValue,
                                        {
                                          shouldDirty: true,
                                          shouldValidate: true,
                                        }
                                      );
                                    }}
                                    className={inputClass(
                                      !!errors.tasks?.[index]?.targetValue
                                    )}
                                    placeholder="Ví dụ: 1.000.000"
                                  />
                                </>
                              ) : (
                                <input
                                  type="number"
                                  {...register(`tasks.${index}.targetValue`, {
                                    valueAsNumber: true,
                                  })}
                                  className={inputClass(
                                    !!errors.tasks?.[index]?.targetValue
                                  )}
                                />
                              )}
                            </>
                          )}
                          {errors.tasks?.[index]?.targetValue && (
                            <p className="mt-1 text-xs text-red-500">
                              {errors.tasks[index]?.targetValue?.message}
                            </p>
                          )}
                        </div>

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
                        </div>
                      </div>

                      <TaskRewardFields
                        taskIndex={index}
                        control={control}
                        register={register}
                        watch={watch}
                        setValue={setValue}
                        errors={errors}
                        badgeRewardOptions={badgeRewardOptions}
                        voucherRewardOptions={voucherRewardOptions}
                        isLoadingRewards={isLoadingRewards}
                        rewardQueries={rewardQueries}
                        setRewardQueries={setRewardQueries}
                        rewardFocusedMap={rewardFocusedMap}
                        setRewardFocusedMap={setRewardFocusedMap}
                        onAppendReward={handleAppendReward}
                      />
                    </div>
                  );
                })}
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
              status === 'pending' || (quest !== null && !hasQuestChanges)
            }
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
