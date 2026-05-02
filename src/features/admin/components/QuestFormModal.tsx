import AppModalHeader from '@components/AppModalHeader';
import type {
  Voucher,
  VoucherCreate,
  VoucherUpdate,
} from '@custom-types/voucher';
import useBadge from '@features/admin/hooks/useBadge';
import useCampaign from '@features/admin/hooks/useCampaign';
import useTier from '@features/admin/hooks/useTier';
import useVoucher from '@features/admin/hooks/useVoucher';
import type { Badge } from '@features/admin/types/badge';
import type { Campaign } from '@features/admin/types/campaign';
import {
  QUEST_REWARD_TYPE_LABELS,
  QUEST_TASK_TYPE_LABELS,
  QuestRewardType,
  QuestTaskType,
  type Quest,
  type QuestCreate,
} from '@features/admin/types/quest';
import type { Tier } from '@features/admin/types/tier';
import {
  QuestSchema,
  type QuestFormData,
  type QuestFormInput,
} from '@features/admin/utils/questSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Add as AddIcon,
  AddPhotoAlternate as AddPhotoAlternateIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
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
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type Dispatch,
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

type QuestScope = 'standalone' | 'campaign' | 'upgrade';

const ALLOWED_TIER_TARGET_NAMES = new Set(['gold', 'diamond']);

const QUEST_SCOPE_LABELS: Record<QuestScope, string> = {
  standalone: 'Độc lập',
  campaign: 'Theo chiến dịch',
  upgrade: 'Nâng cấp (Hạng)',
};

interface QuestFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: QuestCreate, imageFile?: File | null) => Promise<void>;
  quest: Quest | null;
  canEditTasks?: boolean;
  enableViewModeToggle?: boolean;
  initialViewMode?: boolean;
  forcedCampaignId?: number | null;
  forcedCampaignName?: string | null;
  forcedCampaignStartDate?: string | null;
  forcedCampaignEndDate?: string | null;
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  campaignIsUpdateable?: boolean;
}

type RewardVoucherMode = 'existing' | 'create' | 'update';

interface VoucherDraft {
  name: string;
  voucherCode: string;
  type: 'AMOUNT' | 'PERCENT';
  description: string;
  discountValue: number;
  maxDiscountValue: number | null;
  minAmountRequired: number;
  quantity: number;
}

interface RewardOption {
  id: number;
  label: string;
  hint: string;
  searchText?: string;
  maxQuantity?: number;
}

interface VoucherRemainInfo {
  maxQuantity: number | null;
  displayText: string;
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

const isFixedQuantityRewardType = (rewardType: unknown): boolean => {
  return (
    Number(rewardType) === Number(QuestRewardType.POINTS) ||
    Number(rewardType) === Number(QuestRewardType.BADGE)
  );
};

const formatNumberWithDots = (value: number | null | undefined): string => {
  if (value === null || value === undefined) {
    return '';
  }

  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const parseNumberInput = (value: string): number => {
  const normalized = value.replace(/\./g, '').replace(/[^0-9]/g, '');
  return normalized === '' ? 0 : Number(normalized);
};

const getIssuedVoucherQuantity = (
  rewardQuantity: number,
  expectedParticipantCount: number
): number => {
  if (rewardQuantity <= 0 || expectedParticipantCount <= 0) {
    return 0;
  }

  return rewardQuantity * expectedParticipantCount;
};

const getVoucherRemainInfo = (voucher: Voucher): VoucherRemainInfo => {
  const remain =
    typeof voucher.remain === 'number' && !Number.isNaN(voucher.remain)
      ? voucher.remain
      : null;
  const quantity =
    typeof voucher.quantity === 'number' && !Number.isNaN(voucher.quantity)
      ? voucher.quantity
      : 0;
  const usedQuantity =
    typeof voucher.usedQuantity === 'number' &&
    !Number.isNaN(voucher.usedQuantity)
      ? voucher.usedQuantity
      : 0;

  if (remain !== null) {
    if (remain > 0) {
      return {
        maxQuantity: Math.max(remain, 0),
        displayText: String(Math.max(remain, 0)),
      };
    }

    if (remain === 0) {
      if (quantity < 0) {
        return {
          maxQuantity: null,
          displayText: 'Vô hạn',
        };
      }

      return {
        maxQuantity: 0,
        displayText: '0',
      };
    }

    return {
      maxQuantity: null,
      displayText: 'Vô hạn',
    };
  }

  if (quantity < 0) {
    return {
      maxQuantity: null,
      displayText: 'Vô hạn',
    };
  }

  const computedRemain = Math.max(quantity - usedQuantity, 0);
  return {
    maxQuantity: computedRemain,
    displayText: String(computedRemain),
  };
};

const createDefaultReward = (
  rewardType: QuestRewardType = QuestRewardType.POINTS,
  rewardValue?: number
): QuestFormInput['tasks'][number]['rewards'][number] => ({
  rewardType,
  rewardValue: rewardValue ?? getDefaultRewardValue(rewardType),
  quantity: 1,
});

const createDefaultTask = (
  rewardType: QuestRewardType = QuestRewardType.POINTS,
  rewardValue?: number
): QuestFormInput['tasks'][number] => ({
  type: QuestTaskType.REVIEW,
  targetValue: 1,
  description: null,
  rewards: [createDefaultReward(rewardType, rewardValue)],
});

const createUpgradeTask = (tiers: Tier[]): QuestFormInput['tasks'][number] => ({
  type: QuestTaskType.TIER_UP,
  targetValue: tiers[0]?.tierId ?? 1,
  description: null,
  rewards: [createDefaultReward()],
});

const normalizeTasksForNonUpgrade = (
  tasks: QuestFormInput['tasks']
): QuestFormInput['tasks'] => {
  if (tasks.length === 0) {
    return [createDefaultTask()];
  }

  return tasks.map((task) =>
    Number(task.type) === Number(QuestTaskType.TIER_UP)
      ? {
          ...task,
          type: QuestTaskType.REVIEW,
          targetValue: 1,
        }
      : task
  );
};

const getInheritedExpectedParticipantCount = (
  taskRewards: QuestFormInput['tasks'][number]['rewards'],
  taskIndex: number,
  rewardIndex: number,
  rewardExpectedParticipantMap: Record<string, number>
): number => {
  for (
    let previousRewardIndex = rewardIndex - 1;
    previousRewardIndex >= 0;
    previousRewardIndex -= 1
  ) {
    const previousReward = taskRewards[previousRewardIndex];

    if (
      Number(previousReward?.rewardType) !== Number(QuestRewardType.VOUCHER)
    ) {
      continue;
    }

    const previousRewardKey = `${taskIndex}-${previousRewardIndex}`;
    const previousExpectedParticipant =
      rewardExpectedParticipantMap[previousRewardKey];

    if (
      typeof previousExpectedParticipant === 'number' &&
      previousExpectedParticipant > 0
    ) {
      return previousExpectedParticipant;
    }
  }

  return 1;
};

const defaultVoucherDraft = (): VoucherDraft => ({
  name: '',
  voucherCode: '',
  type: 'AMOUNT',
  description: '',
  discountValue: 0,
  maxDiscountValue: null,
  minAmountRequired: 0,
  quantity: 0,
});

const createVoucherDraftFromVoucher = (
  voucher: Voucher,
  quantityFallback: number
): VoucherDraft => {
  const voucherQuantity = Number(voucher.quantity);
  const resolvedQuantity =
    !Number.isNaN(voucherQuantity) && voucherQuantity > 0
      ? voucherQuantity
      : quantityFallback;

  return {
    name: voucher.name,
    voucherCode: voucher.voucherCode,
    type: voucher.type,
    description: voucher.description ?? '',
    discountValue: voucher.discountValue,
    maxDiscountValue: voucher.maxDiscountValue,
    minAmountRequired: voucher.minAmountRequired,
    quantity: Number.isNaN(resolvedQuantity)
      ? 1
      : Math.max(1, resolvedQuantity),
  };
};

const toVoucherPayload = (
  draft: VoucherDraft,
  quantity: number,
  campaignId: number | null,
  startDate: string,
  endDate: string | null
): VoucherUpdate => ({
  name: draft.name.trim(),
  voucherCode: draft.voucherCode.trim(),
  type: draft.type === 'PERCENT' ? 'PERCENTAGE' : 'AMOUNT',
  description:
    draft.description.trim() === '' ? null : draft.description.trim(),
  discountValue: draft.discountValue,
  maxDiscountValue: draft.type === 'PERCENT' ? draft.maxDiscountValue : null,
  minAmountRequired: draft.minAmountRequired,
  quantity,
  redeemPoint: 0,
  startDate,
  endDate,
  expiredDate: null,
  isActive: true,
  campaignId,
});

const defaultValues: QuestFormInput = {
  questScope: 'standalone',
  title: '',
  description: null,
  imageUrl: null,
  isActive: false,
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
  isReadOnly: boolean;
  isViewMode: boolean;
  isCreateMode: boolean;
  questScope: QuestScope;
  isForcedCampaignCreate: boolean;
  isCampaignVoucherLocked: boolean;
  hasCampaignVoucherOptions: boolean;
  control: Control<QuestFormInput>;
  register: UseFormRegister<QuestFormInput>;
  watch: UseFormWatch<QuestFormInput>;
  setValue: UseFormSetValue<QuestFormInput>;
  errors: FieldErrors<QuestFormInput>;
  badgeRewardOptions: RewardOption[];
  voucherOptions: Voucher[];
  voucherRewardOptions: RewardOption[];
  isLoadingRewards: boolean;
  rewardQueries: Record<string, string>;
  setRewardQueries: Dispatch<SetStateAction<Record<string, string>>>;
  rewardFocusedMap: Record<string, boolean>;
  setRewardFocusedMap: Dispatch<SetStateAction<Record<string, boolean>>>;
  rewardVoucherModeMap: Record<string, RewardVoucherMode>;
  setRewardVoucherModeMap: Dispatch<
    SetStateAction<Record<string, RewardVoucherMode>>
  >;
  rewardSelectedVoucherValueMap: Record<string, number>;
  setRewardSelectedVoucherValueMap: Dispatch<
    SetStateAction<Record<string, number>>
  >;
  rewardVoucherDraftMap: Record<string, VoucherDraft>;
  setRewardVoucherDraftMap: Dispatch<
    SetStateAction<Record<string, VoucherDraft>>
  >;
  setHasVoucherDraftChanges: Dispatch<SetStateAction<boolean>>;
  rewardExpectedParticipantMap: Record<string, number>;
  setRewardExpectedParticipantMap: Dispatch<
    SetStateAction<Record<string, number>>
  >;
  onAppendReward: (taskIndex: number) => void;
  inputClass: (hasError: boolean) => string;
}

function TaskRewardFields({
  taskIndex,
  isReadOnly,
  isViewMode,
  isCreateMode,
  questScope,
  isForcedCampaignCreate,
  isCampaignVoucherLocked,
  hasCampaignVoucherOptions,
  control,
  register,
  watch,
  setValue,
  errors,
  badgeRewardOptions,
  voucherRewardOptions,
  voucherOptions,
  isLoadingRewards,
  rewardQueries,
  setRewardQueries,
  rewardFocusedMap,
  setRewardFocusedMap,
  rewardVoucherModeMap,
  setRewardVoucherModeMap,
  rewardSelectedVoucherValueMap,
  setRewardSelectedVoucherValueMap,
  rewardVoucherDraftMap,
  setRewardVoucherDraftMap,
  setHasVoucherDraftChanges,
  rewardExpectedParticipantMap,
  setRewardExpectedParticipantMap,
  onAppendReward,
  inputClass,
}: TaskRewardFieldsProps): JSX.Element {
  const { fields, remove } = useFieldArray({
    control,
    name: `tasks.${taskIndex}.rewards`,
  });

  useEffect(() => {
    if (
      !isCampaignVoucherLocked ||
      isForcedCampaignCreate ||
      isCreateMode ||
      questScope !== 'campaign' ||
      fields.length !== 1
    ) {
      return;
    }

    const rewardModeKey = `${taskIndex}-0`;
    const remainingReward = watch(`tasks.${taskIndex}.rewards.0`);
    const currentRewardValue = Number(remainingReward?.rewardValue ?? 0);
    const currentRewardQuantity = Number(remainingReward?.quantity ?? 1);
    const hasExistingVoucherData = currentRewardValue > 0;

    if (hasExistingVoucherData) {
      return;
    }

    setRewardVoucherModeMap((prev) =>
      prev[rewardModeKey] === 'create'
        ? prev
        : {
            ...prev,
            [rewardModeKey]: 'create',
          }
    );

    if (
      Number(remainingReward?.rewardType) !== Number(QuestRewardType.VOUCHER)
    ) {
      setValue(
        `tasks.${taskIndex}.rewards.0.rewardType`,
        QuestRewardType.VOUCHER,
        {
          shouldDirty: true,
          shouldValidate: true,
        }
      );
    }

    setValue(`tasks.${taskIndex}.rewards.0.rewardValue`, 0, {
      shouldDirty: true,
      shouldValidate: true,
    });

    setRewardVoucherDraftMap((prev) => ({
      ...prev,
      [rewardModeKey]: {
        ...(prev[rewardModeKey] ?? defaultVoucherDraft()),
        quantity:
          Number.isNaN(currentRewardQuantity) || currentRewardQuantity < 1
            ? 1
            : currentRewardQuantity,
      },
    }));
  }, [
    fields.length,
    isCampaignVoucherLocked,
    isCreateMode,
    isForcedCampaignCreate,
    questScope,
    setRewardVoucherDraftMap,
    setRewardVoucherModeMap,
    setValue,
    taskIndex,
    watch,
  ]);

  return (
    <div className="mt-4 rounded-lg border border-gray-200 bg-white p-3">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-700">Phần thưởng</p>
        <button
          type="button"
          onClick={() => onAppendReward(taskIndex)}
          disabled={isReadOnly}
          className="border-primary-500 text-primary-600 hover:bg-primary-50 flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-semibold disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400"
        >
          <AddIcon fontSize="small" />
          Thêm thưởng
        </button>
      </div>

      <div className="space-y-3">
        {fields.map((rewardField, rewardIndex) => {
          const currentTaskRewards = watch(`tasks.${taskIndex}.rewards`) ?? [];
          const rewardType =
            watch(`tasks.${taskIndex}.rewards.${rewardIndex}.rewardType`) ??
            QuestRewardType.POINTS;
          const currentRewardValue =
            watch(`tasks.${taskIndex}.rewards.${rewardIndex}.rewardValue`) ?? 0;
          const watchedRewardQuantity = watch(
            `tasks.${taskIndex}.rewards.${rewardIndex}.quantity`
          );
          const currentRewardQuantity =
            watchedRewardQuantity === null ||
            watchedRewardQuantity === undefined
              ? null
              : Number(watchedRewardQuantity);
          const isFixedQuantityReward = isFixedQuantityRewardType(rewardType);
          const selectedVoucherOption =
            rewardType === QuestRewardType.VOUCHER
              ? (voucherRewardOptions.find(
                  (option) => option.id === currentRewardValue
                ) ?? null)
              : null;
          const selectedVoucher =
            rewardType === QuestRewardType.VOUCHER
              ? (voucherOptions.find(
                  (voucher) => voucher.voucherId === currentRewardValue
                ) ?? null)
              : null;
          const selectedVoucherRemainInfo =
            rewardType === QuestRewardType.VOUCHER && selectedVoucher
              ? getVoucherRemainInfo(selectedVoucher)
              : null;
          const voucherRemainLimit = selectedVoucherRemainInfo?.maxQuantity;
          const voucherRemainText = selectedVoucherRemainInfo?.displayText;
          const rewardIndexKey = `${taskIndex}-${rewardIndex}`;
          const isStandaloneCreateQuest =
            isCreateMode && questScope === 'standalone';
          const isUpgradeCreateQuest = isCreateMode && questScope === 'upgrade';
          const hasStandaloneVoucherOptions =
            questScope === 'standalone' && voucherRewardOptions.length > 0;
          const rewardVoucherMode =
            rewardVoucherModeMap[rewardIndexKey] ??
            (isCampaignVoucherLocked
              ? Number(currentRewardValue) > 0
                ? 'existing'
                : 'create'
              : !isCreateMode
                ? questScope === 'standalone' && hasStandaloneVoucherOptions
                  ? 'existing'
                  : Number(currentRewardValue) > 0
                    ? 'existing'
                    : 'create'
                : isUpgradeCreateQuest
                  ? 'create'
                  : hasStandaloneVoucherOptions
                    ? 'existing'
                    : 'create');
          const shouldShowUpgradeUnlimitedVoucherQuantityWarning =
            questScope === 'upgrade' &&
            rewardType === QuestRewardType.VOUCHER &&
            currentRewardQuantity !== null &&
            currentRewardQuantity > 10 &&
            (rewardVoucherMode === 'create' ||
              (selectedVoucherRemainInfo !== null &&
                selectedVoucherRemainInfo.maxQuantity === null));
          const voucherDraft =
            rewardVoucherDraftMap[rewardIndexKey] ?? defaultVoucherDraft();
          const isVoucherUpdateMode =
            !isCreateMode && rewardVoucherMode === 'update';
          const voucherIssuedQuantityFromDraft = Math.max(
            0,
            Number(voucherDraft.quantity) || 0
          );
          const effectiveVoucherRemainLimit =
            rewardType === QuestRewardType.VOUCHER &&
            isVoucherUpdateMode &&
            questScope !== 'upgrade'
              ? voucherIssuedQuantityFromDraft
              : voucherRemainLimit;
          const effectiveVoucherRemainText =
            rewardType === QuestRewardType.VOUCHER &&
            isVoucherUpdateMode &&
            questScope !== 'upgrade'
              ? String(voucherIssuedQuantityFromDraft)
              : voucherRemainText;
          const markVoucherDraftChanged = (): void => {
            if (!isCreateMode && rewardVoucherMode === 'update') {
              setHasVoucherDraftChanges(true);
            }
          };
          const expectedParticipantCount =
            rewardExpectedParticipantMap[rewardIndexKey] ?? 1;
          const shouldUseExpectedParticipant =
            rewardType === QuestRewardType.VOUCHER &&
            isStandaloneCreateQuest &&
            rewardVoucherMode === 'create';
          const issuedVoucherQuantity =
            questScope === 'upgrade' && rewardType === QuestRewardType.VOUCHER
              ? -1
              : shouldUseExpectedParticipant
                ? getIssuedVoucherQuantity(
                    currentRewardQuantity !== null && currentRewardQuantity > 0
                      ? currentRewardQuantity
                      : 0,
                    expectedParticipantCount
                  )
                : currentRewardQuantity !== null && currentRewardQuantity > 0
                  ? currentRewardQuantity
                  : 0;

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
                  disabled={fields.length === 1 || isReadOnly}
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
                  {isCampaignVoucherLocked ? (
                    <>
                      <input
                        type="hidden"
                        {...register(
                          `tasks.${taskIndex}.rewards.${rewardIndex}.rewardType`,
                          {
                            setValueAs: (value) => Number(value),
                          }
                        )}
                      />
                      <div className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700">
                        {QUEST_REWARD_TYPE_LABELS[QuestRewardType.VOUCHER]}
                      </div>
                    </>
                  ) : (
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
                        const nextRewardMode: RewardVoucherMode =
                          isCreateMode && questScope === 'upgrade'
                            ? 'create'
                            : isCreateMode &&
                                questScope === 'standalone' &&
                                voucherRewardOptions.length > 0
                              ? 'existing'
                              : 'create';
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
                        if (nextRewardType === QuestRewardType.VOUCHER) {
                          const inheritedExpectedParticipantCount =
                            getInheritedExpectedParticipantCount(
                              currentTaskRewards,
                              taskIndex,
                              rewardIndex,
                              rewardExpectedParticipantMap
                            );
                          setRewardVoucherModeMap((prev) => ({
                            ...prev,
                            [rewardIndexKey]: nextRewardMode,
                          }));
                          setRewardExpectedParticipantMap((prev) => ({
                            ...prev,
                            [rewardIndexKey]:
                              prev[rewardIndexKey] ??
                              inheritedExpectedParticipantCount,
                          }));
                        }
                        setRewardQueries((prev) => ({
                          ...prev,
                          [rewardKey]: '',
                        }));
                      }}
                      disabled={isReadOnly}
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
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700">
                    Giá trị thưởng
                  </label>
                  {isCampaignVoucherLocked ? (
                    <div className="space-y-2">
                      {isForcedCampaignCreate && hasCampaignVoucherOptions && (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            disabled={isReadOnly}
                            onClick={() => {
                              setRewardVoucherModeMap((prev) => ({
                                ...prev,
                                [rewardIndexKey]: 'existing',
                              }));
                            }}
                            className={`rounded-lg border px-2 py-1 text-xs font-semibold ${
                              rewardVoucherMode === 'existing'
                                ? 'border-primary-500 bg-primary-50 text-primary-700'
                                : 'border-gray-200 bg-white text-gray-600'
                            }`}
                          >
                            Chọn voucher có sẵn
                          </button>
                          <button
                            type="button"
                            disabled={isReadOnly}
                            onClick={() => {
                              setRewardVoucherModeMap((prev) => ({
                                ...prev,
                                [rewardIndexKey]: 'create',
                              }));
                              const syncedQuantity =
                                currentRewardQuantity !== null &&
                                currentRewardQuantity > 0
                                  ? currentRewardQuantity
                                  : 1;
                              setRewardVoucherDraftMap((prev) => ({
                                ...prev,
                                [rewardIndexKey]: {
                                  ...(prev[rewardIndexKey] ?? voucherDraft),
                                  quantity: syncedQuantity,
                                },
                              }));
                              setValue(
                                `tasks.${taskIndex}.rewards.${rewardIndex}.rewardValue`,
                                0,
                                {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                }
                              );
                            }}
                            className={`rounded-lg border px-2 py-1 text-xs font-semibold ${
                              rewardVoucherMode === 'create'
                                ? 'border-primary-500 bg-primary-50 text-primary-700'
                                : 'border-gray-200 bg-white text-gray-600'
                            }`}
                          >
                            Tạo voucher mới
                          </button>
                        </div>
                      )}

                      {(
                        isForcedCampaignCreate
                          ? rewardVoucherMode === 'existing' &&
                            hasCampaignVoucherOptions
                          : isCreateMode
                            ? true
                            : rewardVoucherMode !== 'create'
                      ) ? (
                        ((): JSX.Element => {
                          const rewardOptions = voucherRewardOptions;
                          const selectedVoucherIds = new Set<number>(
                            currentTaskRewards
                              .map((taskReward, taskRewardIndex) => {
                                if (taskRewardIndex === rewardIndex) {
                                  return null;
                                }

                                if (
                                  Number(taskReward.rewardType) !==
                                  Number(QuestRewardType.VOUCHER)
                                ) {
                                  return null;
                                }

                                return Number(taskReward.rewardValue);
                              })
                              .filter(
                                (rewardValue): rewardValue is number =>
                                  typeof rewardValue === 'number' &&
                                  rewardValue > 0
                              )
                          );
                          const availableRewardOptions = rewardOptions.filter(
                            (option) =>
                              option.id === currentRewardValue ||
                              !selectedVoucherIds.has(option.id)
                          );
                          const selectedRewardOption =
                            rewardOptions.find(
                              (option) => option.id === currentRewardValue
                            ) ?? null;
                          const rewardKey = rewardField.id;
                          const isFocused =
                            rewardFocusedMap[rewardKey] ?? false;
                          const queryFromState = rewardQueries[rewardKey];
                          const fallbackVoucherLabel =
                            Number(currentRewardValue) > 0
                              ? (selectedVoucher?.name?.trim() ?? '') ||
                                `Voucher #${Number(currentRewardValue)}`
                              : '';
                          const query =
                            queryFromState ??
                            selectedRewardOption?.label ??
                            fallbackVoucherLabel;
                          const normalizedQuery = query.trim().toLowerCase();
                          const filteredRewardOptions = !normalizedQuery
                            ? availableRewardOptions
                            : availableRewardOptions.filter((option) =>
                                `${option.label} ${option.searchText ?? option.hint}`
                                  .toLowerCase()
                                  .includes(normalizedQuery)
                              );

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
                                  if (isReadOnly) {
                                    return;
                                  }
                                  setRewardFocusedMap((prev) => ({
                                    ...prev,
                                    [rewardKey]: true,
                                  }));
                                }}
                                onBlur={() => {
                                  if (isReadOnly) {
                                    return;
                                  }
                                  window.setTimeout(() => {
                                    setRewardFocusedMap((prev) => ({
                                      ...prev,
                                      [rewardKey]: false,
                                    }));
                                  }, 120);
                                }}
                                onChange={(event) => {
                                  if (isReadOnly) {
                                    return;
                                  }
                                  const nextQuery = event.target.value;
                                  if (
                                    nextQuery.trim().length === 0 &&
                                    Number(currentRewardValue) > 0
                                  ) {
                                    setValue(
                                      `tasks.${taskIndex}.rewards.${rewardIndex}.rewardValue`,
                                      0,
                                      {
                                        shouldDirty: true,
                                        shouldValidate: true,
                                      }
                                    );
                                  }
                                  setRewardQueries((prev) => ({
                                    ...prev,
                                    [rewardKey]: nextQuery,
                                  }));
                                }}
                                disabled={isReadOnly}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-amber-200"
                                placeholder="Nhập để tìm voucher chiến dịch"
                              />

                              {!isCreateMode &&
                                !isViewMode &&
                                rewardType === QuestRewardType.VOUCHER &&
                                selectedVoucher && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (
                                        rewardVoucherModeMap[rewardIndexKey] ===
                                        'update'
                                      ) {
                                        setRewardVoucherModeMap((prev) => ({
                                          ...prev,
                                          [rewardIndexKey]: 'existing',
                                        }));
                                        return;
                                      }

                                      const quantityFromReward =
                                        currentRewardQuantity !== null &&
                                        currentRewardQuantity > 0
                                          ? currentRewardQuantity
                                          : 1;
                                      setRewardVoucherModeMap((prev) => ({
                                        ...prev,
                                        [rewardIndexKey]: 'update',
                                      }));
                                      setRewardVoucherDraftMap((prev) => ({
                                        ...prev,
                                        [rewardIndexKey]:
                                          createVoucherDraftFromVoucher(
                                            selectedVoucher,
                                            quantityFromReward
                                          ),
                                      }));
                                    }}
                                    className="text-primary-600 hover:text-primary-700 absolute top-1/2 right-2 z-[2] -translate-y-1/2"
                                  >
                                    <EditIcon fontSize="small" />
                                  </button>
                                )}

                              {isFocused && !isReadOnly && (
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
                                          if (
                                            typeof option.maxQuantity ===
                                            'number'
                                          ) {
                                            const currentQuantityRaw =
                                              watch(
                                                `tasks.${taskIndex}.rewards.${rewardIndex}.quantity`
                                              ) ?? 1;
                                            const currentQuantity =
                                              Number(currentQuantityRaw);
                                            const adjustedQuantity = Math.min(
                                              Math.max(
                                                1,
                                                Number.isNaN(currentQuantity)
                                                  ? 1
                                                  : currentQuantity
                                              ),
                                              option.maxQuantity
                                            );
                                            setValue(
                                              `tasks.${taskIndex}.rewards.${rewardIndex}.quantity`,
                                              adjustedQuantity,
                                              {
                                                shouldDirty: true,
                                                shouldValidate: true,
                                              }
                                            );
                                          }
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
                                      Không tìm thấy voucher phù hợp.
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })()
                      ) : isForcedCampaignCreate || !isCreateMode ? (
                        <input
                          value="Tự động theo voucher tạo mới"
                          disabled
                          className="w-full cursor-not-allowed rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-500"
                        />
                      ) : null}
                    </div>
                  ) : rewardType === QuestRewardType.VOUCHER &&
                    !isCreateMode &&
                    questScope === 'standalone' &&
                    Number(currentRewardValue) > 0 ? (
                    <div className="space-y-2">
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
                          value={
                            selectedVoucherOption?.label ??
                            selectedVoucher?.name ??
                            `Voucher #${Number(currentRewardValue)}`
                          }
                          disabled
                          className="w-full cursor-not-allowed rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 pr-10 text-sm text-gray-700"
                        />
                        {!isViewMode && selectedVoucher && (
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                rewardVoucherModeMap[rewardIndexKey] ===
                                'update'
                              ) {
                                setRewardVoucherModeMap((prev) => ({
                                  ...prev,
                                  [rewardIndexKey]: 'existing',
                                }));
                                return;
                              }

                              const quantityFromReward =
                                currentRewardQuantity !== null &&
                                currentRewardQuantity > 0
                                  ? currentRewardQuantity
                                  : 1;
                              setRewardVoucherModeMap((prev) => ({
                                ...prev,
                                [rewardIndexKey]: 'update',
                              }));
                              setRewardVoucherDraftMap((prev) => ({
                                ...prev,
                                [rewardIndexKey]: createVoucherDraftFromVoucher(
                                  selectedVoucher,
                                  quantityFromReward
                                ),
                              }));
                            }}
                            className="text-primary-600 hover:text-primary-700 absolute top-1/2 right-2 z-[2] -translate-y-1/2"
                          >
                            <EditIcon fontSize="small" />
                          </button>
                        )}
                      </div>
                    </div>
                  ) : rewardType === QuestRewardType.VOUCHER &&
                    !isCreateMode &&
                    questScope === 'upgrade' &&
                    Number(currentRewardValue) > 0 ? (
                    <div className="space-y-2">
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
                          value={
                            selectedVoucherOption?.label ??
                            selectedVoucher?.name ??
                            `Voucher #${Number(currentRewardValue)}`
                          }
                          disabled
                          className="w-full cursor-not-allowed rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 pr-10 text-sm text-gray-700"
                        />
                        {!isViewMode && selectedVoucher && (
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                rewardVoucherModeMap[rewardIndexKey] ===
                                'update'
                              ) {
                                setRewardVoucherModeMap((prev) => ({
                                  ...prev,
                                  [rewardIndexKey]: 'existing',
                                }));
                                return;
                              }

                              const quantityFromReward =
                                currentRewardQuantity !== null &&
                                currentRewardQuantity > 0
                                  ? currentRewardQuantity
                                  : 1;
                              setRewardVoucherModeMap((prev) => ({
                                ...prev,
                                [rewardIndexKey]: 'update',
                              }));
                              setRewardVoucherDraftMap((prev) => ({
                                ...prev,
                                [rewardIndexKey]: createVoucherDraftFromVoucher(
                                  selectedVoucher,
                                  quantityFromReward
                                ),
                              }));
                            }}
                            className="text-primary-600 hover:text-primary-700 absolute top-1/2 right-2 z-[2] -translate-y-1/2"
                          >
                            <EditIcon fontSize="small" />
                          </button>
                        )}
                      </div>
                    </div>
                  ) : rewardType === QuestRewardType.VOUCHER &&
                    ((isCreateMode &&
                      (questScope === 'standalone' ||
                        questScope === 'upgrade')) ||
                      (!isCreateMode &&
                        questScope === 'upgrade' &&
                        Number(currentRewardValue) <= 0) ||
                      (!isCreateMode &&
                        questScope === 'standalone' &&
                        Number(currentRewardValue) <= 0)) ? (
                    <div className="space-y-2">
                      {questScope === 'standalone' && (
                        <div
                          className={`grid gap-2 ${
                            hasStandaloneVoucherOptions
                              ? 'grid-cols-2'
                              : 'grid-cols-1'
                          }`}
                        >
                          {hasStandaloneVoucherOptions && (
                            <button
                              type="button"
                              disabled={isReadOnly}
                              onClick={() => {
                                setRewardVoucherModeMap((prev) => ({
                                  ...prev,
                                  [rewardIndexKey]: 'existing',
                                }));

                                if (Number(currentRewardValue) > 0) {
                                  return;
                                }

                                const preservedVoucherId =
                                  rewardSelectedVoucherValueMap[
                                    rewardIndexKey
                                  ] ?? 0;
                                if (preservedVoucherId <= 0) {
                                  return;
                                }

                                setValue(
                                  `tasks.${taskIndex}.rewards.${rewardIndex}.rewardValue`,
                                  preservedVoucherId,
                                  {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                  }
                                );

                                const restoredRewardOption =
                                  voucherRewardOptions.find(
                                    (option) => option.id === preservedVoucherId
                                  ) ?? null;
                                if (restoredRewardOption) {
                                  setRewardQueries((prev) => ({
                                    ...prev,
                                    [rewardField.id]:
                                      restoredRewardOption.label,
                                  }));
                                }
                              }}
                              className={`rounded-lg border px-2 py-1 text-xs font-semibold ${
                                rewardVoucherMode === 'existing'
                                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                                  : 'border-gray-200 bg-white text-gray-600'
                              }`}
                            >
                              Chọn voucher có sẵn
                            </button>
                          )}

                          <button
                            type="button"
                            disabled={isReadOnly}
                            onClick={() => {
                              const inheritedExpectedParticipantCount =
                                getInheritedExpectedParticipantCount(
                                  currentTaskRewards,
                                  taskIndex,
                                  rewardIndex,
                                  rewardExpectedParticipantMap
                                );
                              if (Number(currentRewardValue) > 0) {
                                setRewardSelectedVoucherValueMap((prev) => ({
                                  ...prev,
                                  [rewardIndexKey]: Number(currentRewardValue),
                                }));
                              }
                              setRewardVoucherModeMap((prev) => ({
                                ...prev,
                                [rewardIndexKey]: 'create',
                              }));
                              setValue(
                                `tasks.${taskIndex}.rewards.${rewardIndex}.rewardValue`,
                                0,
                                {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                }
                              );
                              setRewardExpectedParticipantMap((prev) => ({
                                ...prev,
                                [rewardIndexKey]:
                                  prev[rewardIndexKey] ??
                                  inheritedExpectedParticipantCount,
                              }));
                            }}
                            className={`rounded-lg border px-2 py-1 text-xs font-semibold ${
                              rewardVoucherMode === 'create'
                                ? 'border-primary-500 bg-primary-50 text-primary-700'
                                : 'border-gray-200 bg-white text-gray-600'
                            }`}
                          >
                            Tạo voucher mới
                          </button>
                        </div>
                      )}

                      {(questScope === 'upgrade' ||
                        rewardVoucherMode === 'create' ||
                        !hasStandaloneVoucherOptions) && (
                        <input
                          value="Tự động theo voucher tạo mới"
                          disabled
                          className="w-full cursor-not-allowed rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-500"
                        />
                      )}

                      {questScope === 'standalone' &&
                        rewardVoucherMode === 'existing' &&
                        hasStandaloneVoucherOptions &&
                        ((): JSX.Element => {
                          const rewardOptions = voucherRewardOptions;
                          const selectedVoucherIds = new Set<number>(
                            currentTaskRewards
                              .map((taskReward, taskRewardIndex) => {
                                if (taskRewardIndex === rewardIndex) {
                                  return null;
                                }

                                if (
                                  Number(taskReward.rewardType) !==
                                  Number(QuestRewardType.VOUCHER)
                                ) {
                                  return null;
                                }

                                return Number(taskReward.rewardValue);
                              })
                              .filter(
                                (rewardValue): rewardValue is number =>
                                  typeof rewardValue === 'number' &&
                                  rewardValue > 0
                              )
                          );
                          const availableRewardOptions = rewardOptions.filter(
                            (option) =>
                              option.id === currentRewardValue ||
                              !selectedVoucherIds.has(option.id)
                          );
                          const selectedRewardOption =
                            rewardOptions.find(
                              (option) => option.id === currentRewardValue
                            ) ?? null;
                          const rewardKey = rewardField.id;
                          const isFocused =
                            rewardFocusedMap[rewardKey] ?? false;
                          const queryFromState = rewardQueries[rewardKey];
                          const fallbackVoucherLabel =
                            Number(currentRewardValue) > 0
                              ? (selectedVoucher?.name?.trim() ?? '') ||
                                `Voucher #${Number(currentRewardValue)}`
                              : '';
                          const query =
                            queryFromState ??
                            selectedRewardOption?.label ??
                            fallbackVoucherLabel;
                          const normalizedQuery = query.trim().toLowerCase();
                          const filteredRewardOptions = !normalizedQuery
                            ? availableRewardOptions
                            : availableRewardOptions.filter((option) =>
                                `${option.label} ${option.searchText ?? option.hint}`
                                  .toLowerCase()
                                  .includes(normalizedQuery)
                              );

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
                                  if (isReadOnly) {
                                    return;
                                  }
                                  setRewardFocusedMap((prev) => ({
                                    ...prev,
                                    [rewardKey]: true,
                                  }));
                                }}
                                onBlur={() => {
                                  if (isReadOnly) {
                                    return;
                                  }
                                  window.setTimeout(() => {
                                    setRewardFocusedMap((prev) => ({
                                      ...prev,
                                      [rewardKey]: false,
                                    }));
                                  }, 120);
                                }}
                                onChange={(event) => {
                                  if (isReadOnly) {
                                    return;
                                  }
                                  const nextQuery = event.target.value;
                                  if (
                                    nextQuery.trim().length === 0 &&
                                    Number(currentRewardValue) > 0
                                  ) {
                                    setValue(
                                      `tasks.${taskIndex}.rewards.${rewardIndex}.rewardValue`,
                                      0,
                                      {
                                        shouldDirty: true,
                                        shouldValidate: true,
                                      }
                                    );
                                  }
                                  setRewardQueries((prev) => ({
                                    ...prev,
                                    [rewardKey]: nextQuery,
                                  }));
                                }}
                                disabled={isReadOnly}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-amber-200"
                                placeholder="Nhập để tìm voucher"
                              />

                              {!isCreateMode &&
                                !isViewMode &&
                                rewardType === QuestRewardType.VOUCHER &&
                                selectedVoucher && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (
                                        rewardVoucherModeMap[rewardIndexKey] ===
                                        'update'
                                      ) {
                                        setRewardVoucherModeMap((prev) => ({
                                          ...prev,
                                          [rewardIndexKey]: 'existing',
                                        }));
                                        return;
                                      }

                                      const quantityFromReward =
                                        currentRewardQuantity !== null &&
                                        currentRewardQuantity > 0
                                          ? currentRewardQuantity
                                          : 1;
                                      setRewardVoucherModeMap((prev) => ({
                                        ...prev,
                                        [rewardIndexKey]: 'update',
                                      }));
                                      setRewardVoucherDraftMap((prev) => ({
                                        ...prev,
                                        [rewardIndexKey]:
                                          createVoucherDraftFromVoucher(
                                            selectedVoucher,
                                            quantityFromReward
                                          ),
                                      }));
                                    }}
                                    className="text-primary-600 hover:text-primary-700 absolute top-1/2 right-2 z-[2] -translate-y-1/2"
                                  >
                                    <EditIcon fontSize="small" />
                                  </button>
                                )}

                              {isFocused && !isReadOnly && (
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
                                          setRewardSelectedVoucherValueMap(
                                            (prev) => ({
                                              ...prev,
                                              [rewardIndexKey]: option.id,
                                            })
                                          );
                                          if (
                                            typeof option.maxQuantity ===
                                            'number'
                                          ) {
                                            const currentQuantityRaw =
                                              watch(
                                                `tasks.${taskIndex}.rewards.${rewardIndex}.quantity`
                                              ) ?? 1;
                                            const currentQuantity =
                                              Number(currentQuantityRaw);
                                            const adjustedQuantity = Math.min(
                                              Math.max(
                                                1,
                                                Number.isNaN(currentQuantity)
                                                  ? 1
                                                  : currentQuantity
                                              ),
                                              option.maxQuantity
                                            );
                                            setValue(
                                              `tasks.${taskIndex}.rewards.${rewardIndex}.quantity`,
                                              adjustedQuantity,
                                              {
                                                shouldDirty: true,
                                                shouldValidate: true,
                                              }
                                            );
                                          }
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
                                      Không tìm thấy voucher phù hợp.
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                    </div>
                  ) : rewardType === QuestRewardType.POINTS ? (
                    <input
                      type="number"
                      {...register(
                        `tasks.${taskIndex}.rewards.${rewardIndex}.rewardValue`,
                        { valueAsNumber: true }
                      )}
                      disabled={isReadOnly}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-200"
                    />
                  ) : (
                    ((): JSX.Element => {
                      const isBadgeReward =
                        rewardType === QuestRewardType.BADGE;
                      const targetRewardType = isBadgeReward
                        ? QuestRewardType.BADGE
                        : QuestRewardType.VOUCHER;
                      const rewardOptions = isBadgeReward
                        ? badgeRewardOptions
                        : voucherRewardOptions;
                      const selectedRewardIds = new Set<number>(
                        currentTaskRewards
                          .map((taskReward, taskRewardIndex) => {
                            if (taskRewardIndex === rewardIndex) {
                              return null;
                            }

                            if (
                              Number(taskReward.rewardType) !==
                              Number(targetRewardType)
                            ) {
                              return null;
                            }

                            return Number(taskReward.rewardValue);
                          })
                          .filter(
                            (rewardValue): rewardValue is number =>
                              typeof rewardValue === 'number' && rewardValue > 0
                          )
                      );
                      const availableRewardOptions = rewardOptions.filter(
                        (option) =>
                          option.id === currentRewardValue ||
                          !selectedRewardIds.has(option.id)
                      );
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
                        ? availableRewardOptions
                        : availableRewardOptions.filter((option) =>
                            `${option.label} ${option.searchText ?? option.hint}`
                              .toLowerCase()
                              .includes(normalizedQuery)
                          );

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
                              if (isReadOnly) {
                                return;
                              }
                              setRewardFocusedMap((prev) => ({
                                ...prev,
                                [rewardKey]: true,
                              }));
                            }}
                            onBlur={() => {
                              if (isReadOnly) {
                                return;
                              }
                              window.setTimeout(() => {
                                setRewardFocusedMap((prev) => ({
                                  ...prev,
                                  [rewardKey]: false,
                                }));
                              }, 120);
                            }}
                            onChange={(event) => {
                              if (isReadOnly) {
                                return;
                              }
                              const nextQuery = event.target.value;
                              if (
                                nextQuery.trim().length === 0 &&
                                Number(currentRewardValue) > 0
                              ) {
                                setValue(
                                  `tasks.${taskIndex}.rewards.${rewardIndex}.rewardValue`,
                                  0,
                                  {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                  }
                                );
                              }
                              setRewardQueries((prev) => ({
                                ...prev,
                                [rewardKey]: nextQuery,
                              }));
                            }}
                            disabled={isReadOnly}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-200"
                            placeholder={
                              isBadgeReward
                                ? 'Nhập để tìm huy hiệu'
                                : 'Nhập để tìm voucher'
                            }
                          />

                          {isFocused && !isReadOnly && (
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
                                      if (
                                        typeof option.maxQuantity === 'number'
                                      ) {
                                        const currentQuantityRaw =
                                          watch(
                                            `tasks.${taskIndex}.rewards.${rewardIndex}.quantity`
                                          ) ?? 1;
                                        const currentQuantity =
                                          Number(currentQuantityRaw);
                                        const adjustedQuantity = Math.min(
                                          Math.max(
                                            1,
                                            Number.isNaN(currentQuantity)
                                              ? 1
                                              : currentQuantity
                                          ),
                                          option.maxQuantity
                                        );
                                        setValue(
                                          `tasks.${taskIndex}.rewards.${rewardIndex}.quantity`,
                                          adjustedQuantity,
                                          {
                                            shouldDirty: true,
                                            shouldValidate: true,
                                          }
                                        );
                                      }
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
                    Số lượng thưởng
                    {rewardType === QuestRewardType.VOUCHER &&
                    effectiveVoucherRemainText ? (
                      <span className="ml-1 text-[11px] font-normal text-gray-500">
                        (Tồn: {effectiveVoucherRemainText})
                      </span>
                    ) : null}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={
                      rewardType === QuestRewardType.VOUCHER &&
                      typeof effectiveVoucherRemainLimit === 'number' &&
                      !(
                        isCreateMode &&
                        (questScope === 'standalone' ||
                          questScope === 'upgrade') &&
                        rewardVoucherMode === 'create'
                      )
                        ? effectiveVoucherRemainLimit
                        : undefined
                    }
                    value={currentRewardQuantity ?? ''}
                    onChange={(event) => {
                      if (isFixedQuantityReward) {
                        return;
                      }

                      const rawValue = event.target.value;

                      if (rawValue === '') {
                        setValue(
                          `tasks.${taskIndex}.rewards.${rewardIndex}.quantity`,
                          null,
                          {
                            shouldDirty: true,
                            shouldValidate: true,
                          }
                        );
                        if (
                          isForcedCampaignCreate &&
                          (!hasCampaignVoucherOptions ||
                            rewardVoucherMode === 'create')
                        ) {
                          setRewardVoucherDraftMap((prev) => ({
                            ...prev,
                            [rewardIndexKey]: {
                              ...voucherDraft,
                              quantity: 0,
                            },
                          }));
                        }
                        return;
                      }

                      let nextQuantity = Math.max(1, Number(rawValue));
                      if (
                        rewardType === QuestRewardType.VOUCHER &&
                        typeof effectiveVoucherRemainLimit === 'number' &&
                        !(
                          isCreateMode &&
                          (questScope === 'standalone' ||
                            questScope === 'upgrade') &&
                          rewardVoucherMode === 'create'
                        )
                      ) {
                        nextQuantity = Math.min(
                          nextQuantity,
                          effectiveVoucherRemainLimit
                        );
                      }

                      setValue(
                        `tasks.${taskIndex}.rewards.${rewardIndex}.quantity`,
                        Number.isNaN(nextQuantity) ? null : nextQuantity,
                        {
                          shouldDirty: true,
                          shouldValidate: true,
                        }
                      );

                      if (
                        isForcedCampaignCreate &&
                        (!hasCampaignVoucherOptions ||
                          rewardVoucherMode === 'create')
                      ) {
                        setRewardVoucherDraftMap((prev) => ({
                          ...prev,
                          [rewardIndexKey]: {
                            ...voucherDraft,
                            quantity: Number.isNaN(nextQuantity)
                              ? 0
                              : nextQuantity,
                          },
                        }));
                      }
                    }}
                    disabled={isReadOnly || isFixedQuantityReward}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-200"
                  />
                  {isFixedQuantityReward &&
                    currentRewardQuantity !== null &&
                    currentRewardQuantity !== 1 &&
                    !isReadOnly && (
                      <button
                        type="button"
                        onClick={() => {
                          setValue(
                            `tasks.${taskIndex}.rewards.${rewardIndex}.quantity`,
                            1,
                            {
                              shouldDirty: true,
                              shouldValidate: true,
                            }
                          );
                        }}
                        className="text-primary-600 hover:text-primary-700 mt-1 text-xs font-semibold"
                      >
                        Đặt về 1
                      </button>
                    )}
                  {shouldShowUpgradeUnlimitedVoucherQuantityWarning && (
                    <p className="mt-1 text-xs text-amber-600">
                      Khuyến nghị tối đa 10 voucher mỗi user cho 1 lần hoàn
                      thành task.
                    </p>
                  )}
                </div>
              </div>

              {rewardType === QuestRewardType.VOUCHER &&
                ((isForcedCampaignCreate &&
                  (!hasCampaignVoucherOptions ||
                    rewardVoucherMode === 'create')) ||
                  (isCreateMode &&
                    (questScope === 'standalone' || questScope === 'upgrade') &&
                    (questScope === 'upgrade' ||
                      rewardVoucherMode === 'create' ||
                      !hasStandaloneVoucherOptions)) ||
                  (!isCreateMode &&
                    (rewardVoucherMode === 'create' ||
                      rewardVoucherMode === 'update'))) && (
                  <div className="mt-3 rounded-lg border border-gray-200 bg-white p-3">
                    <p
                      className="mb-3 text-xs font-bold uppercase"
                      style={{ color: '#8bcf3f' }}
                    >
                      {rewardVoucherMode === 'update'
                        ? 'Cập nhật voucher cho phần thưởng này'
                        : 'Tạo voucher cho phần thưởng này'}
                    </p>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-700">
                          Tên voucher <span className="text-red-500">*</span>
                        </label>
                        <input
                          value={voucherDraft.name}
                          onChange={(event) => {
                            const nextValue = event.target.value;
                            markVoucherDraftChanged();
                            setRewardVoucherDraftMap((prev) => ({
                              ...prev,
                              [rewardIndexKey]: {
                                ...voucherDraft,
                                name: nextValue,
                              },
                            }));
                          }}
                          disabled={isReadOnly}
                          className={inputClass(false)}
                          placeholder="Nhập tên voucher"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-700">
                          Mã voucher <span className="text-red-500">*</span>
                        </label>
                        <input
                          value={voucherDraft.voucherCode}
                          onChange={(event) => {
                            const nextValue = event.target.value;
                            markVoucherDraftChanged();
                            setRewardVoucherDraftMap((prev) => ({
                              ...prev,
                              [rewardIndexKey]: {
                                ...voucherDraft,
                                voucherCode: nextValue,
                              },
                            }));
                          }}
                          disabled={isReadOnly}
                          className={inputClass(false)}
                          placeholder="VD: QUEST2026"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-700">
                          Loại giảm giá <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={voucherDraft.type}
                          onChange={(event) => {
                            const nextType = event.target.value as
                              | 'AMOUNT'
                              | 'PERCENT';
                            markVoucherDraftChanged();
                            setRewardVoucherDraftMap((prev) => ({
                              ...prev,
                              [rewardIndexKey]: {
                                ...voucherDraft,
                                type: nextType,
                                maxDiscountValue:
                                  nextType === 'AMOUNT'
                                    ? null
                                    : voucherDraft.maxDiscountValue,
                              },
                            }));
                          }}
                          disabled={isReadOnly}
                          className={inputClass(false)}
                        >
                          <option value="AMOUNT">Giảm theo số tiền</option>
                          <option value="PERCENT">Giảm theo %</option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-700">
                          Giá trị giảm <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={
                            voucherDraft.type === 'PERCENT'
                              ? String(voucherDraft.discountValue)
                              : formatNumberWithDots(voucherDraft.discountValue)
                          }
                          onChange={(event) => {
                            const nextValue =
                              voucherDraft.type === 'PERCENT'
                                ? Math.min(
                                    Number(
                                      event.target.value.replace(/[^0-9]/g, '')
                                    ),
                                    100
                                  )
                                : parseNumberInput(event.target.value);

                            markVoucherDraftChanged();
                            setRewardVoucherDraftMap((prev) => ({
                              ...prev,
                              [rewardIndexKey]: {
                                ...voucherDraft,
                                discountValue: Number.isNaN(nextValue)
                                  ? 0
                                  : nextValue,
                              },
                            }));
                          }}
                          disabled={isReadOnly}
                          className={inputClass(false)}
                          placeholder="0"
                        />
                      </div>

                      {voucherDraft.type === 'PERCENT' && (
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-gray-700">
                            Giảm tối đa (VNĐ)
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={formatNumberWithDots(
                              voucherDraft.maxDiscountValue
                            )}
                            onChange={(event) => {
                              const nextValue = event.target.value;
                              markVoucherDraftChanged();
                              setRewardVoucherDraftMap((prev) => ({
                                ...prev,
                                [rewardIndexKey]: {
                                  ...voucherDraft,
                                  maxDiscountValue:
                                    nextValue === ''
                                      ? null
                                      : parseNumberInput(nextValue),
                                },
                              }));
                            }}
                            disabled={isReadOnly}
                            className={inputClass(false)}
                            placeholder="Không giới hạn"
                          />
                        </div>
                      )}

                      <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-700">
                          Đơn hàng tối thiểu (VNĐ){' '}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={formatNumberWithDots(
                            voucherDraft.minAmountRequired
                          )}
                          onChange={(event) => {
                            markVoucherDraftChanged();
                            setRewardVoucherDraftMap((prev) => ({
                              ...prev,
                              [rewardIndexKey]: {
                                ...voucherDraft,
                                minAmountRequired: parseNumberInput(
                                  event.target.value
                                ),
                              },
                            }));
                          }}
                          disabled={isReadOnly}
                          className={inputClass(false)}
                          placeholder="0"
                        />
                      </div>

                      {questScope === 'standalone' &&
                        rewardVoucherMode === 'create' && (
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-gray-700">
                              Số người kỳ vọng tham gia{' '}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              min={1}
                              value={expectedParticipantCount}
                              onChange={(event) => {
                                const nextExpectedParticipant = Math.max(
                                  1,
                                  Number(event.target.value)
                                );
                                setRewardExpectedParticipantMap((prev) => ({
                                  ...prev,
                                  [rewardIndexKey]: Number.isNaN(
                                    nextExpectedParticipant
                                  )
                                    ? 1
                                    : nextExpectedParticipant,
                                }));
                              }}
                              disabled={isReadOnly}
                              className={inputClass(false)}
                              placeholder="1"
                            />
                            {/* <p className="mt-1 text-[11px] text-gray-500">
                              Field ảo chỉ dùng để tính số lượng phát hành.
                            </p> */}
                          </div>
                        )}

                      {questScope !== 'upgrade' && (
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-gray-700">
                            Số lượng phát hành{' '}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={formatNumberWithDots(
                              rewardVoucherMode === 'update'
                                ? voucherDraft.quantity
                                : issuedVoucherQuantity
                            )}
                            onChange={(event) => {
                              if (
                                isReadOnly ||
                                rewardVoucherMode !== 'update'
                              ) {
                                return;
                              }

                              const nextIssuedQuantity = parseNumberInput(
                                event.target.value
                              );
                              const sanitizedIssuedQuantity = Number.isNaN(
                                nextIssuedQuantity
                              )
                                ? 0
                                : Math.max(0, nextIssuedQuantity);

                              markVoucherDraftChanged();
                              setRewardVoucherDraftMap((prev) => ({
                                ...prev,
                                [rewardIndexKey]: {
                                  ...voucherDraft,
                                  quantity: sanitizedIssuedQuantity,
                                },
                              }));

                              const rewardQuantityRaw =
                                currentRewardQuantity ?? 0;
                              const rewardQuantityValue =
                                Number(rewardQuantityRaw);
                              if (
                                !Number.isNaN(rewardQuantityValue) &&
                                rewardQuantityValue > sanitizedIssuedQuantity
                              ) {
                                setValue(
                                  `tasks.${taskIndex}.rewards.${rewardIndex}.quantity`,
                                  sanitizedIssuedQuantity,
                                  {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                  }
                                );
                              }
                            }}
                            disabled={
                              isReadOnly || rewardVoucherMode !== 'update'
                            }
                            className={inputClass(false)}
                            placeholder="0"
                          />
                          <p className="mt-1 text-[11px] text-gray-500">
                            {rewardVoucherMode === 'update'
                              ? 'Số lượng phát hành phải lớn hơn hoặc bằng số lượng phần thưởng để tránh lệch dữ liệu.'
                              : questScope === 'standalone' &&
                                  rewardVoucherMode === 'create'
                                ? 'Tự tính theo công thức: Số lượng x Số người kỳ vọng tham gia.'
                                : 'Tự đồng bộ theo Số lượng phần thưởng để tránh lệch dữ liệu.'}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-3">
                      <label className="mb-1 block text-xs font-semibold text-gray-700">
                        Mô tả voucher
                      </label>
                      <textarea
                        rows={2}
                        value={voucherDraft.description}
                        onChange={(event) => {
                          const nextValue = event.target.value;
                          markVoucherDraftChanged();
                          setRewardVoucherDraftMap((prev) => ({
                            ...prev,
                            [rewardIndexKey]: {
                              ...voucherDraft,
                              description: nextValue,
                            },
                          }));
                        }}
                        disabled={isReadOnly}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-200"
                        placeholder="Nhập mô tả voucher (không bắt buộc)"
                      />
                    </div>
                  </div>
                )}

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
  canEditTasks = true,
  enableViewModeToggle = false,
  initialViewMode = false,
  forcedCampaignId = null,
  forcedCampaignName = null,
  forcedCampaignStartDate = null,
  forcedCampaignEndDate = null,
  status,
  campaignIsUpdateable,
}: QuestFormModalProps): JSX.Element | null {
  const { onGetCampaigns } = useCampaign();
  const { onGetAllBadges } = useBadge();
  const { onGetAllTiers } = useTier();
  const {
    onGetVouchers,
    onGetVouchersByCampaignId,
    onGetVoucherById,
    onCreateVoucher,
    onUpdateVoucher,
  } = useVoucher();

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
  const [rewardVoucherModeMap, setRewardVoucherModeMap] = useState<
    Record<string, RewardVoucherMode>
  >({});
  const [rewardSelectedVoucherValueMap, setRewardSelectedVoucherValueMap] =
    useState<Record<string, number>>({});
  const [rewardVoucherDraftMap, setRewardVoucherDraftMap] = useState<
    Record<string, VoucherDraft>
  >({});
  const [hasVoucherDraftChanges, setHasVoucherDraftChanges] = useState(false);
  const [rewardExpectedParticipantMap, setRewardExpectedParticipantMap] =
    useState<Record<string, number>>({});
  const [isViewMode, setIsViewMode] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    getValues,
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
  const hasRewardQueryChanges = Object.values(rewardQueries).some(
    (query) => query.trim().length > 0
  );
  const hasQuestChanges =
    isDirty ||
    selectedImageFile !== null ||
    hasRewardQueryChanges ||
    hasVoucherDraftChanges;
  const isUpdateMode = quest !== null;
  const isForcedCampaignCreate = !isUpdateMode && forcedCampaignId !== null;
  const isCampaignQuestEdit =
    isUpdateMode &&
    questScope === 'campaign' &&
    (quest?.campaignId ?? null) !== null;
  const campaignVoucherSourceId = isForcedCampaignCreate
    ? forcedCampaignId
    : isCampaignQuestEdit
      ? (quest?.campaignId ?? campaignId)
      : null;
  const isCampaignVoucherLocked = isForcedCampaignCreate || isCampaignQuestEdit;
  const isTaskEditingLocked = quest !== null && !canEditTasks;
  const isFormReadOnly = isTaskEditingLocked || isViewMode;
  const isCampaignSelectionDisabled =
    isTaskEditingLocked || isUpdateMode || isForcedCampaignCreate;
  const shouldLoadCampaignOptions = !isCampaignSelectionDisabled;
  const hasForcedCampaignName = Boolean(forcedCampaignName?.trim());
  const shouldResolveCampaignNameOnUpdate =
    isCampaignQuestEdit && !hasForcedCampaignName;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setIsViewMode(
      Boolean(quest !== null && enableViewModeToggle && initialViewMode)
    );
  }, [enableViewModeToggle, initialViewMode, isOpen, quest]);

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
      badgeOptions
        .filter((badge) => badge.isActive !== false)
        .map((badge) => ({
          id: badge.badgeId,
          label: badge.badgeName,
          hint: '',
        })),
    [badgeOptions]
  );

  const voucherRewardOptions = useMemo<RewardOption[]>(
    () =>
      voucherOptions.map((voucher) => ({
        maxQuantity: getVoucherRemainInfo(voucher).maxQuantity ?? undefined,
        id: voucher.voucherId,
        label: voucher.name,
        hint: `${buildVoucherDiscountText(voucher)} | Đơn tối thiểu ${formatCurrencyVND(
          voucher.minAmountRequired
        )}`,
        searchText: `${voucher.name} ${voucher.voucherCode} ${voucher.discountValue} ${voucher.minAmountRequired}`,
      })),
    [voucherOptions]
  );
  const hasCampaignVoucherOptions =
    isCampaignVoucherLocked && voucherRewardOptions.length > 0;

  const filteredTierOptions = useMemo((): Tier[] => {
    return tierOptions.filter((tier) =>
      ALLOWED_TIER_TARGET_NAMES.has(tier.name.trim().toLowerCase())
    );
  }, [tierOptions]);

  const fetchReferenceData = useCallback(async (): Promise<void> => {
    const shouldFetchCampaignOptions =
      shouldLoadCampaignOptions || shouldResolveCampaignNameOnUpdate;

    setIsLoadingCampaigns(shouldFetchCampaignOptions);
    setIsLoadingRewards(true);

    try {
      const voucherPromise =
        isCampaignVoucherLocked && campaignVoucherSourceId !== null
          ? onGetVouchersByCampaignId(campaignVoucherSourceId)
          : questScope === 'standalone'
            ? onGetVouchers({
                isBelongAQuestTask: false,
                isRemaining: true,
                isSystemVoucher: true,
              })
            : onGetVouchers({
                isSystemVoucher: true,
              });

      const [badges, vouchers, tiers] = await Promise.all([
        onGetAllBadges(),
        voucherPromise,
        onGetAllTiers(),
      ]);

      let resolvedVouchers = vouchers;
      if (isUpdateMode && quest) {
        const rewardVoucherIds = Array.from(
          new Set(
            quest.tasks
              .flatMap((task) => task.rewards ?? [])
              .filter(
                (reward) =>
                  Number(reward.rewardType) === Number(QuestRewardType.VOUCHER)
              )
              .map((reward) => Number(reward.rewardValue))
              .filter((rewardValue) => rewardValue > 0)
          )
        );

        const missingVoucherIds = rewardVoucherIds.filter(
          (voucherId) =>
            !resolvedVouchers.some((voucher) => voucher.voucherId === voucherId)
        );

        if (missingVoucherIds.length > 0) {
          const missingVouchers = await Promise.all(
            missingVoucherIds.map((voucherId) =>
              onGetVoucherById(voucherId).catch(() => null)
            )
          );

          resolvedVouchers = [
            ...resolvedVouchers,
            ...missingVouchers.filter(
              (voucher): voucher is Voucher => voucher !== null
            ),
          ];
        }
      }

      if (shouldFetchCampaignOptions) {
        const campaignResponse = await onGetCampaigns(1, 200);
        const allCampaigns = campaignResponse.items ?? [];
        setCampaignOptions(
          shouldLoadCampaignOptions
            ? allCampaigns.filter(
                (campaign) =>
                  campaign.createdByVendorId === null && campaign.isUpdateable
              )
            : allCampaigns
        );
      } else {
        setCampaignOptions([]);
      }

      setBadgeOptions(badges);
      setVoucherOptions(resolvedVouchers);
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
  }, [
    campaignVoucherSourceId,
    isCampaignVoucherLocked,
    isUpdateMode,
    onGetAllBadges,
    onGetAllTiers,
    onGetCampaigns,
    onGetVoucherById,
    onGetVouchersByCampaignId,
    onGetVouchers,
    quest,
    questScope,
    shouldResolveCampaignNameOnUpdate,
    shouldLoadCampaignOptions,
  ]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    void fetchReferenceData();
  }, [fetchReferenceData, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

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
        isActive: quest.isActive ?? true,
        requiresEnrollment: inferredScope !== 'upgrade',
        isStandalone: inferredScope !== 'campaign',
        campaignId: inferredScope === 'campaign' ? quest.campaignId : null,
        tasks: normalizedTasks,
      });
      setSelectedImageFile(null);
      setImagePreviewUrl(quest.imageUrl ?? null);
      setCampaignQuery(
        forcedCampaignName ??
          (quest.campaignId ? `Chiến dịch #${quest.campaignId}` : '')
      );
      setRewardQueries({});
      setRewardFocusedMap({});
      setRewardVoucherModeMap({});
      setRewardSelectedVoucherValueMap({});
      setRewardVoucherDraftMap({});
      setHasVoucherDraftChanges(false);
      setRewardExpectedParticipantMap({});
      return;
    }

    reset(defaultValues);
    if (isForcedCampaignCreate) {
      setValue('questScope', 'campaign', {
        shouldDirty: false,
        shouldValidate: false,
      });
      setValue('isStandalone', false, {
        shouldDirty: false,
        shouldValidate: false,
      });
      setValue('requiresEnrollment', true, {
        shouldDirty: false,
        shouldValidate: false,
      });
      setValue('campaignId', forcedCampaignId, {
        shouldDirty: false,
        shouldValidate: false,
      });
    }
    setSelectedImageFile(null);
    setImagePreviewUrl(null);
    setCampaignQuery(isForcedCampaignCreate ? (forcedCampaignName ?? '') : '');
    setRewardQueries({});
    setRewardFocusedMap({});
    setRewardVoucherModeMap({});
    setRewardSelectedVoucherValueMap({});
    setRewardVoucherDraftMap({});
    setHasVoucherDraftChanges(false);
    setRewardExpectedParticipantMap({});
  }, [
    forcedCampaignId,
    forcedCampaignName,
    isForcedCampaignCreate,
    isOpen,
    quest,
    reset,
    setRewardExpectedParticipantMap,
    setValue,
  ]);

  useEffect((): (() => void) => {
    return (): void => {
      if (imagePreviewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  useEffect(() => {
    if (!isOpen || !isCampaignVoucherLocked) {
      return;
    }

    const currentTasks = getValues('tasks');
    currentTasks.forEach((task, taskIndex) => {
      task.rewards.forEach((_, rewardIndex) => {
        const rewardPath = `tasks.${taskIndex}.rewards.${rewardIndex}` as const;
        const rewardModeKey = `${taskIndex}-${rewardIndex}`;

        setValue(`${rewardPath}.rewardType`, QuestRewardType.VOUCHER, {
          shouldDirty: false,
          shouldValidate: false,
        });

        const currentRewardValue =
          getValues(`${rewardPath}.rewardValue`) ??
          getDefaultRewardValue(QuestRewardType.VOUCHER);

        if (
          isForcedCampaignCreate &&
          hasCampaignVoucherOptions &&
          currentRewardValue === 0
        ) {
          const defaultVoucherId = voucherRewardOptions[0]?.id ?? 0;
          setValue(`${rewardPath}.rewardValue`, defaultVoucherId, {
            shouldDirty: false,
            shouldValidate: false,
          });
        }

        setRewardVoucherModeMap((prev) => ({
          ...prev,
          [rewardModeKey]:
            prev[rewardModeKey] ??
            (Number(currentRewardValue) > 0 ? 'existing' : 'create'),
        }));

        setRewardVoucherDraftMap((prev) => {
          const currentRewardQuantity = Number(
            task.rewards[rewardIndex]?.quantity ?? 0
          );

          return {
            ...prev,
            [rewardModeKey]: prev[rewardModeKey] ?? {
              ...defaultVoucherDraft(),
              quantity:
                Number.isNaN(currentRewardQuantity) || currentRewardQuantity < 0
                  ? 0
                  : currentRewardQuantity,
            },
          };
        });
      });
    });
  }, [
    getValues,
    hasCampaignVoucherOptions,
    isCampaignVoucherLocked,
    isOpen,
    setValue,
    voucherRewardOptions,
  ]);

  useEffect(() => {
    if (!isOpen || isUpdateMode || isCampaignVoucherLocked) {
      return;
    }

    const hasStandaloneVoucherOptions =
      questScope === 'standalone' && voucherRewardOptions.length > 0;

    const currentTasks = getValues('tasks');
    currentTasks.forEach((task, taskIndex) => {
      task.rewards.forEach((reward, rewardIndex) => {
        if (Number(reward.rewardType) !== Number(QuestRewardType.VOUCHER)) {
          return;
        }

        const rewardPath = `tasks.${taskIndex}.rewards.${rewardIndex}` as const;
        const rewardModeKey = `${taskIndex}-${rewardIndex}`;
        const defaultMode: RewardVoucherMode =
          questScope === 'upgrade'
            ? 'create'
            : hasStandaloneVoucherOptions
              ? 'existing'
              : 'create';

        setRewardVoucherModeMap((prev) => ({
          ...prev,
          [rewardModeKey]: prev[rewardModeKey] ?? defaultMode,
        }));

        setRewardExpectedParticipantMap((prev) => ({
          ...prev,
          [rewardModeKey]: prev[rewardModeKey] ?? 1,
        }));

        const currentMode = rewardVoucherModeMap[rewardModeKey] ?? defaultMode;
        if (
          questScope === 'upgrade' ||
          currentMode === 'create' ||
          !hasStandaloneVoucherOptions
        ) {
          setValue(`${rewardPath}.rewardValue`, 0, {
            shouldDirty: false,
            shouldValidate: false,
          });
        }
      });
    });
  }, [
    getValues,
    isCampaignVoucherLocked,
    isOpen,
    isUpdateMode,
    questScope,
    rewardVoucherModeMap,
    setValue,
    voucherRewardOptions,
  ]);

  useEffect(() => {
    if (isCampaignFocused || isCampaignSelectionDisabled) {
      return;
    }

    setCampaignQuery(selectedCampaign?.name ?? '');
  }, [isCampaignFocused, isCampaignSelectionDisabled, selectedCampaign]);

  useEffect(() => {
    if (
      !isOpen ||
      !isCampaignQuestEdit ||
      !shouldResolveCampaignNameOnUpdate ||
      !selectedCampaign?.name
    ) {
      return;
    }

    setCampaignQuery(selectedCampaign.name);
  }, [
    isOpen,
    isCampaignQuestEdit,
    selectedCampaign,
    shouldResolveCampaignNameOnUpdate,
  ]);

  const handleQuestScopeChange = (scope: QuestScope): void => {
    if (isFormReadOnly) {
      return;
    }

    const normalizedTasksForNonUpgrade = normalizeTasksForNonUpgrade(
      getValues('tasks')
    );

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
      replace(normalizedTasksForNonUpgrade);
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
      replace(normalizedTasksForNonUpgrade);
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

    const normalizedTasks = data.tasks.map((task, taskIndex) => ({
      type: isUpgrade ? QuestTaskType.TIER_UP : task.type,
      targetValue: task.targetValue,
      description: task.description,
      rewards: task.rewards.map((reward, rewardIndex) => ({
        rewardType: reward.rewardType,
        rewardValue: reward.rewardValue,
        quantity: reward.quantity,
        rewardIndex,
      })),
      taskIndex,
    }));

    const voucherRemainMap = new Map<number, number | null>(
      voucherOptions.map((voucher) => [
        voucher.voucherId,
        getVoucherRemainInfo(voucher).maxQuantity,
      ])
    );

    for (const task of normalizedTasks) {
      for (const reward of task.rewards) {
        if (Number(reward.rewardType) !== Number(QuestRewardType.VOUCHER)) {
          continue;
        }

        if (reward.rewardValue <= 0) {
          continue;
        }

        const rewardModeKey = `${task.taskIndex}-${reward.rewardIndex}`;
        const draftForReward =
          rewardVoucherDraftMap[rewardModeKey] ?? defaultVoucherDraft();
        const isVoucherUpdateMode =
          rewardVoucherModeMap[rewardModeKey] === 'update';
        const remain = isVoucherUpdateMode
          ? Math.max(0, Number(draftForReward.quantity) || 0)
          : voucherRemainMap.get(reward.rewardValue);
        const rewardQuantity = reward.quantity ?? 0;
        if (
          typeof remain === 'number' &&
          !Number.isNaN(remain) &&
          rewardQuantity > remain
        ) {
          throw new Error(
            isVoucherUpdateMode
              ? `Số lượng voucher ở nhiệm vụ con ${task.taskIndex + 1} không được vượt quá số lượng phát hành (${remain}).`
              : `Số lượng voucher ở nhiệm vụ con ${task.taskIndex + 1} không được vượt quá tồn (${remain}).`
          );
        }
      }
    }

    const isStandaloneQuest = data.questScope === 'standalone';
    const shouldHandleVoucherDraftFlow =
      isForcedCampaignCreate || isStandaloneQuest || isUpgrade || isUpdateMode;

    if (shouldHandleVoucherDraftFlow) {
      const campaignIdForNewVoucher = isCampaign
        ? (forcedCampaignId ?? data.campaignId)
        : null;

      if (isForcedCampaignCreate && !campaignIdForNewVoucher) {
        return;
      }

      const voucherById = new Map<number, Voucher>(
        voucherOptions.map((voucher) => [voucher.voucherId, voucher])
      );
      const hasStandaloneVoucherOptions =
        isStandaloneQuest && voucherRewardOptions.length > 0;
      const voucherPayloads: VoucherCreate[] = [];
      const draftRewardLocations: Array<{
        taskIndex: number;
        rewardIndex: number;
      }> = [];
      const voucherUpdateRequests: Array<Promise<Voucher>> = [];

      for (const task of normalizedTasks) {
        for (const reward of task.rewards) {
          if (Number(reward.rewardType) !== Number(QuestRewardType.VOUCHER)) {
            continue;
          }

          const rewardModeKey = `${task.taskIndex}-${reward.rewardIndex}`;
          const defaultVoucherMode: RewardVoucherMode = isForcedCampaignCreate
            ? hasCampaignVoucherOptions
              ? 'existing'
              : 'create'
            : isUpdateMode
              ? reward.rewardValue > 0
                ? 'existing'
                : 'create'
              : isUpgrade
                ? 'create'
                : hasStandaloneVoucherOptions
                  ? 'existing'
                  : 'create';
          const voucherMode =
            rewardVoucherModeMap[rewardModeKey] ?? defaultVoucherMode;

          if (voucherMode === 'existing') {
            if (reward.rewardValue <= 0) {
              throw new Error('Vui lòng chọn voucher cho phần thưởng.');
            }
            continue;
          }

          const voucherDraft =
            rewardVoucherDraftMap[rewardModeKey] ?? defaultVoucherDraft();
          const expectedParticipantCount =
            rewardExpectedParticipantMap[rewardModeKey] ?? 1;
          const issuedVoucherQuantity = isUpgrade
            ? -1
            : isStandaloneQuest
              ? getIssuedVoucherQuantity(
                  reward.quantity ?? 0,
                  expectedParticipantCount
                )
              : (reward.quantity ?? 0);
          const issuedVoucherQuantityForUpdate = isUpgrade
            ? -1
            : Math.max(0, Number(voucherDraft.quantity) || 0);

          if (
            voucherDraft.name.trim().length === 0 ||
            voucherDraft.voucherCode.trim().length === 0 ||
            voucherDraft.discountValue <= 0 ||
            (voucherDraft.type === 'PERCENT' &&
              voucherDraft.discountValue > 100) ||
            voucherDraft.minAmountRequired < 0 ||
            (!isUpgrade &&
              (voucherMode === 'update'
                ? issuedVoucherQuantityForUpdate <= 0
                : issuedVoucherQuantity <= 0)) ||
            (voucherDraft.type === 'PERCENT' &&
              (voucherDraft.maxDiscountValue === null ||
                voucherDraft.maxDiscountValue <= 0)) ||
            (isStandaloneQuest && expectedParticipantCount <= 0)
          ) {
            throw new Error(
              isForcedCampaignCreate
                ? 'Vui lòng nhập đầy đủ thông tin voucher mới cho phần thưởng chiến dịch.'
                : isUpgrade
                  ? 'Vui lòng nhập đầy đủ thông tin voucher cho phần thưởng nâng hạng.'
                  : 'Vui lòng nhập đầy đủ thông tin voucher cho phần thưởng.'
            );
          }

          if (voucherMode === 'update') {
            if (reward.rewardValue <= 0) {
              throw new Error('Vui lòng chọn voucher trước khi cập nhật.');
            }

            const selectedVoucher = voucherById.get(reward.rewardValue);
            const updatePayload = toVoucherPayload(
              voucherDraft,
              issuedVoucherQuantityForUpdate,
              selectedVoucher?.campaignId ?? campaignIdForNewVoucher,
              selectedVoucher?.startDate ??
                forcedCampaignStartDate ??
                new Date().toISOString(),
              selectedVoucher?.endDate ?? forcedCampaignEndDate ?? null
            );
            voucherUpdateRequests.push(
              onUpdateVoucher(reward.rewardValue, updatePayload)
            );
            continue;
          }

          voucherPayloads.push(
            toVoucherPayload(
              voucherDraft,
              issuedVoucherQuantity,
              campaignIdForNewVoucher,
              forcedCampaignStartDate ?? new Date().toISOString(),
              forcedCampaignEndDate ?? null
            )
          );
          draftRewardLocations.push({
            taskIndex: task.taskIndex,
            rewardIndex: reward.rewardIndex,
          });
        }
      }

      const createdVouchers =
        voucherPayloads.length > 0
          ? await onCreateVoucher(voucherPayloads)
          : [];

      draftRewardLocations.forEach((location, index) => {
        const createdVoucherId = createdVouchers[index]?.voucherId;
        if (!createdVoucherId) {
          return;
        }

        const task = normalizedTasks[location.taskIndex];
        const reward = task?.rewards[location.rewardIndex];

        if (!reward) {
          return;
        }

        reward.rewardType = QuestRewardType.VOUCHER;
        reward.rewardValue = createdVoucherId;
      });

      if (voucherUpdateRequests.length > 0) {
        await Promise.all(voucherUpdateRequests);
      }

      if (isForcedCampaignCreate) {
        normalizedTasks.forEach((task) => {
          task.rewards.forEach((reward) => {
            reward.rewardType = QuestRewardType.VOUCHER;
          });
        });
      }
    }

    await onSubmit(
      {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        isActive: data.isActive,
        isStandalone: !isCampaign,
        campaignId: isCampaign ? data.campaignId : null,
        tasks: normalizedTasks.map((task) => ({
          type: task.type,
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
    if (isFormReadOnly) {
      return;
    }

    append(
      isCampaignVoucherLocked
        ? createDefaultTask(QuestRewardType.VOUCHER, 0)
        : createDefaultTask()
    );
  };

  const handleAppendReward = (taskIndex: number): void => {
    if (isFormReadOnly) {
      return;
    }

    const currentRewards = watch(`tasks.${taskIndex}.rewards`) ?? [];
    const nextRewardIndex = currentRewards.length;
    const shouldForceCreateVoucherReward = isCampaignQuestEdit;
    const shouldCreateVoucherForUpgradeUpdate =
      isUpdateMode && questScope === 'upgrade';
    const nextReward =
      shouldForceCreateVoucherReward ||
      shouldCreateVoucherForUpgradeUpdate ||
      isCampaignVoucherLocked
        ? createDefaultReward(QuestRewardType.VOUCHER, 0)
        : createDefaultReward();

    setValue(`tasks.${taskIndex}.rewards`, [...currentRewards, nextReward], {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (Number(nextReward.rewardType) === Number(QuestRewardType.VOUCHER)) {
      const nextRewardKey = `${taskIndex}-${nextRewardIndex}`;
      const inheritedExpectedParticipantCount =
        getInheritedExpectedParticipantCount(
          currentRewards,
          taskIndex,
          nextRewardIndex,
          rewardExpectedParticipantMap
        );

      setRewardExpectedParticipantMap((prev) => ({
        ...prev,
        [nextRewardKey]:
          prev[nextRewardKey] ?? inheritedExpectedParticipantCount,
      }));

      if (
        shouldForceCreateVoucherReward ||
        shouldCreateVoucherForUpgradeUpdate
      ) {
        setRewardVoucherModeMap((prev) => ({
          ...prev,
          [nextRewardKey]: 'create',
        }));
        setRewardVoucherDraftMap((prev) => ({
          ...prev,
          [nextRewardKey]: {
            ...(prev[nextRewardKey] ?? defaultVoucherDraft()),
            quantity: 1,
          },
        }));
      }
    }
  };

  if (!isOpen) {
    return null;
  }

  const inputClass = (hasError: boolean): string =>
    `w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 ${
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
        title={
          forcedCampaignId !== null
            ? campaignIsUpdateable === false
              ? 'Chi tiết nhiệm vụ'
              : 'Quản lý nhiệm vụ'
            : quest
              ? 'Chỉnh sửa nhiệm vụ'
              : 'Tạo nhiệm vụ mới'
        }
        subtitle={quest?.title ?? ''}
        icon={<AddIcon />}
        iconTone="admin"
        rightActions={
          quest !== null &&
          enableViewModeToggle &&
          !(forcedCampaignId !== null && campaignIsUpdateable === false) ? (
            <Tooltip
              title={isViewMode ? 'Bật chế độ chỉnh sửa' : 'Bật chế độ xem'}
              arrow
            >
              <IconButton
                size="small"
                onClick={() => setIsViewMode((prev) => !prev)}
                sx={{
                  bgcolor: 'white',
                  border: '1px solid #f3f4f6',
                  '&:hover': { bgcolor: '#f3f4f6' },
                }}
              >
                {isViewMode ? (
                  <EditIcon fontSize="small" />
                ) : (
                  <VisibilityIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
          ) : null
        }
        onClose={onClose}
      />

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <fieldset disabled={isViewMode} className="m-0 min-w-0 border-0 p-0">
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
                {isUpdateMode || isForcedCampaignCreate ? (
                  <div className="border-primary-500 bg-primary-50 text-primary-700 rounded-lg border px-3 py-2 text-sm font-semibold">
                    {QUEST_SCOPE_LABELS[questScope]}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => handleQuestScopeChange('standalone')}
                      disabled={isTaskEditingLocked}
                      className={`rounded-lg border px-3 py-2 text-left text-sm font-semibold ${
                        questScope === 'standalone'
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 bg-white text-gray-700'
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      {QUEST_SCOPE_LABELS.standalone}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuestScopeChange('upgrade')}
                      disabled={isTaskEditingLocked}
                      className={`rounded-lg border px-3 py-2 text-left text-sm font-semibold ${
                        questScope === 'upgrade'
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 bg-white text-gray-700'
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      {QUEST_SCOPE_LABELS.upgrade}
                    </button>
                  </div>
                )}
                {isTaskEditingLocked && !isViewMode && (
                  <p className="mt-2 text-xs text-amber-600">
                    Quest đã có người tham gia, chỉ được chỉnh sửa tiêu đề, mô
                    tả và ảnh.
                  </p>
                )}
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
                      disabled={isCampaignSelectionDisabled}
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

                    {!isCampaignSelectionDisabled &&
                      isCampaignFocused &&
                      campaignQuery.trim().length > 0 && (
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
                      disabled={isTaskEditingLocked}
                      className="border-primary-500 text-primary-600 hover:bg-primary-50 flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-semibold disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400"
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
                    const currentTargetValue = Number(
                      watch(`tasks.${index}.targetValue`) ?? 0
                    );

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
                              fields.length === 1 ||
                              questScope === 'upgrade' ||
                              isTaskEditingLocked
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
                                disabled={isTaskEditingLocked}
                                className={inputClass(
                                  !!errors.tasks?.[index]?.type
                                )}
                              >
                                {Object.entries(QUEST_TASK_TYPE_LABELS)
                                  .filter(([value]) => {
                                    if (
                                      value === String(QuestTaskType.TIER_UP)
                                    ) {
                                      return false;
                                    }
                                    if (value === String(QuestTaskType.SHARE)) {
                                      return Number(value) === currentTaskType;
                                    }
                                    return true;
                                  })
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
                                disabled={isTaskEditingLocked}
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
                                      {...register(
                                        `tasks.${index}.targetValue`,
                                        {
                                          valueAsNumber: true,
                                        }
                                      )}
                                    />
                                    <input
                                      type="text"
                                      inputMode="numeric"
                                      disabled={isTaskEditingLocked}
                                      value={
                                        Number.isFinite(currentTargetValue)
                                          ? formatNumberWithDots(
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
                                    disabled={isTaskEditingLocked}
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
                                  typeof value === 'string' &&
                                  value.trim() === ''
                                    ? null
                                    : value,
                              })}
                              disabled={isTaskEditingLocked}
                              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-200"
                            />
                          </div>
                        </div>

                        <TaskRewardFields
                          taskIndex={index}
                          isReadOnly={isFormReadOnly}
                          isViewMode={isViewMode}
                          isCreateMode={!isUpdateMode}
                          questScope={questScope}
                          isForcedCampaignCreate={isForcedCampaignCreate}
                          isCampaignVoucherLocked={isCampaignVoucherLocked}
                          hasCampaignVoucherOptions={hasCampaignVoucherOptions}
                          control={control}
                          register={register}
                          watch={watch}
                          setValue={setValue}
                          errors={errors}
                          badgeRewardOptions={badgeRewardOptions}
                          voucherOptions={voucherOptions}
                          voucherRewardOptions={voucherRewardOptions}
                          isLoadingRewards={isLoadingRewards}
                          rewardQueries={rewardQueries}
                          setRewardQueries={setRewardQueries}
                          rewardFocusedMap={rewardFocusedMap}
                          setRewardFocusedMap={setRewardFocusedMap}
                          rewardVoucherModeMap={rewardVoucherModeMap}
                          setRewardVoucherModeMap={setRewardVoucherModeMap}
                          rewardSelectedVoucherValueMap={
                            rewardSelectedVoucherValueMap
                          }
                          setRewardSelectedVoucherValueMap={
                            setRewardSelectedVoucherValueMap
                          }
                          rewardVoucherDraftMap={rewardVoucherDraftMap}
                          setRewardVoucherDraftMap={setRewardVoucherDraftMap}
                          setHasVoucherDraftChanges={setHasVoucherDraftChanges}
                          rewardExpectedParticipantMap={
                            rewardExpectedParticipantMap
                          }
                          setRewardExpectedParticipantMap={
                            setRewardExpectedParticipantMap
                          }
                          onAppendReward={handleAppendReward}
                          inputClass={inputClass}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </DialogContent>
        </fieldset>

        <DialogActions sx={{ px: 3, py: 1 }}>
          <Button onClick={onClose} color="inherit">
            Hủy
          </Button>
          {!isViewMode && (
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
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
}
