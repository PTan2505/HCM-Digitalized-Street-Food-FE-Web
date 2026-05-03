import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
  Add as AddIcon,
  Delete as DeleteIcon,
  Campaign as CampaignIcon,
} from '@mui/icons-material';
import type { Campaign } from '@features/admin/types/campaign';
import type { Tier } from '@features/admin/types/tier';
import { QuestTaskType } from '@features/admin/types/quest';
import { CampaignSchema } from '@features/admin/utils/campaignSchema';
import type { CampaignFormData } from '@features/admin/utils/campaignSchema';
import AppModalHeader from '@components/AppModalHeader';
import useTier from '@features/admin/hooks/useTier';

type VoucherDraft = {
  name: string;
  voucherCode: string;
  type: 'AMOUNT' | 'PERCENT';
  description: string;
  discountValue: number;
  maxDiscountValue: number | null;
  minAmountRequired: number;
  quantity: number;
  isActive: boolean;
};

type RewardDraft = {
  quantity: number;
  voucher: VoucherDraft;
};

type QuestTaskDraft = {
  taskType: QuestTaskType;
  targetValue: number;
  taskDescription: string;
  expectedParticipantCount: number;
  rewards: RewardDraft[];
};

type QuestTaskSubmitDraft = {
  taskType: QuestTaskType;
  targetValue: number;
  taskDescription: string;
  rewards: RewardDraft[];
};

export type CampaignQuestBundleDraft = {
  title: string;
  description: string;
  imageFile: File | null;
  imagePreviewUrl: string | null;
  tasks: QuestTaskDraft[];
};

export type CampaignQuestBundleSubmitDraft = {
  title: string;
  description: string;
  imageFile: File | null;
  imagePreviewUrl: string | null;
  tasks: QuestTaskSubmitDraft[];
};

interface CamPaignFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: CampaignFormData,
    imageFile: File | null,
    isImageRemoved?: boolean,
    questBundles?: CampaignQuestBundleSubmitDraft[]
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

const formatNumberWithDots = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '';
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const parseNumberInput = (value: string): number => {
  const normalized = value.replace(/\./g, '').replace(/[^0-9]/g, '');
  return normalized === '' ? 0 : Number(normalized);
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
  isActive: true,
});

const defaultRewardDraft = (): RewardDraft => ({
  quantity: 1,
  voucher: defaultVoucherDraft(),
});

const defaultQuestTaskDraft = (): QuestTaskDraft => ({
  taskType: QuestTaskType.REVIEW,
  targetValue: 1,
  taskDescription: '',
  expectedParticipantCount: 1,
  rewards: [defaultRewardDraft()],
});

const defaultQuestBundleDraft = (): CampaignQuestBundleDraft => ({
  title: '',
  description: '',
  imageFile: null,
  imagePreviewUrl: null,
  tasks: [defaultQuestTaskDraft()],
});

const revokeQuestPreviewUrl = (previewUrl: string | null): void => {
  if (previewUrl?.startsWith('blob:')) {
    URL.revokeObjectURL(previewUrl);
  }
};

const taskOptions: Array<{ value: QuestTaskType; label: string }> = [
  { value: QuestTaskType.REVIEW, label: 'Đánh giá' },
  { value: QuestTaskType.ORDER_AMOUNT, label: 'Tổng chi tiêu đơn hàng' },
  { value: QuestTaskType.SHARE, label: 'Chia sẻ' },
  {
    value: QuestTaskType.CREATE_GHOST_PIN,
    label: 'Chia sẻ quán ăn ngon cho cộng đồng',
  },
];

const getIssuedVoucherQuantity = (
  rewardQuantity: number,
  expectedParticipantCount: number
): number => {
  if (rewardQuantity <= 0 || expectedParticipantCount <= 0) {
    return 0;
  }

  return rewardQuantity * expectedParticipantCount;
};

export default function CamPaignFormModal({
  isOpen,
  onClose,
  onSubmit,
  campaign,
  status,
}: CamPaignFormModalProps): React.JSX.Element | null {
  const { onGetAllTiers } = useTier();
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isImageRemoved, setIsImageRemoved] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [questBundles, setQuestBundles] = useState<CampaignQuestBundleDraft[]>([
    defaultQuestBundleDraft(),
  ]);
  const [questError, setQuestError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const questImageInputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const questBundlesRef = useRef<CampaignQuestBundleDraft[]>(questBundles);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors, isDirty },
  } = useForm<CampaignFormData>({
    resolver: zodResolver(CampaignSchema),
    defaultValues: {
      name: '',
      description: '',
      targetSegment: '',
      requiredTierId: null,
      expectedBranchJoin: 1,
      joinFee: 10000,
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
    questBundlesRef.current = questBundles;
  }, [questBundles]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    void (async (): Promise<void> => {
      try {
        const response = await onGetAllTiers();
        const supportedTiers = response.filter((tier) => {
          const normalizedName = tier.name.trim().toLowerCase();

          return (
            normalizedName === 'silver' ||
            normalizedName === 'gold' ||
            normalizedName === 'diamond'
          );
        });

        setTiers(supportedTiers);
      } catch (error) {
        console.error('Failed to fetch tiers', error);
        setTiers([]);
      }
    })();
  }, [isOpen, onGetAllTiers]);

  useEffect(() => {
    if (isOpen) {
      if (campaign) {
        reset({
          name: campaign.name,
          description: campaign.description ?? '',
          targetSegment: campaign.targetSegment ?? '',
          requiredTierId: campaign.requiredTierId ?? null,
          expectedBranchJoin: campaign.expectedBranchJoin ?? 1,
          joinFee: campaign.joinFee ?? 10000,
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
          requiredTierId: null,
          expectedBranchJoin: 1,
          joinFee: 10000,
          registrationStartDate: '',
          registrationEndDate: '',
          startDate: '',
          endDate: '',
        });
      }

      questBundles.forEach((bundle) => {
        revokeQuestPreviewUrl(bundle.imagePreviewUrl);
      });
      setImageFile(null);
      setImagePreviewUrl(null);
      setIsImageRemoved(false);
      setImageError(null);
      setQuestBundles([defaultQuestBundleDraft()]);
      setQuestError(null);
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

  useEffect((): (() => void) => {
    return (): void => {
      questBundlesRef.current.forEach((bundle) => {
        revokeQuestPreviewUrl(bundle.imagePreviewUrl);
      });
    };
  }, []);

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
    const hasBannerImage =
      imageFile !== null || (!isImageRemoved && Boolean(campaign?.imageUrl));
    if (!hasBannerImage) {
      setImageError('Ảnh banner chiến dịch không được để trống');
      return;
    }
    setImageError(null);

    if (!campaign) {
      for (
        let questIndex = 0;
        questIndex < questBundles.length;
        questIndex += 1
      ) {
        const quest = questBundles[questIndex];
        if (quest.title.trim() === '') {
          setQuestError(
            `Vui lòng nhập tiêu đề cho nhiệm vụ ${questIndex + 1}.`
          );
          return;
        }

        if (quest.tasks.length === 0) {
          setQuestError(
            `Nhiệm vụ ${questIndex + 1} cần ít nhất một nhiệm vụ con.`
          );
          return;
        }

        for (
          let taskIndex = 0;
          taskIndex < quest.tasks.length;
          taskIndex += 1
        ) {
          const task = quest.tasks[taskIndex];

          if (task.targetValue <= 0) {
            setQuestError(
              `Mục tiêu của nhiệm vụ con ${taskIndex + 1} trong nhiệm vụ ${questIndex + 1} phải lớn hơn 0.`
            );
            return;
          }

          if (task.expectedParticipantCount <= 0) {
            setQuestError(
              `Số người kỳ vọng tham gia của nhiệm vụ con ${taskIndex + 1} trong nhiệm vụ ${questIndex + 1} phải lớn hơn 0.`
            );
            return;
          }

          if (task.rewards.length === 0) {
            setQuestError(
              `Nhiệm vụ con ${taskIndex + 1} trong nhiệm vụ ${questIndex + 1} cần ít nhất một phần thưởng.`
            );
            return;
          }

          for (
            let rewardIndex = 0;
            rewardIndex < task.rewards.length;
            rewardIndex += 1
          ) {
            const reward = task.rewards[rewardIndex];
            const voucher = reward.voucher;
            const issuedVoucherQuantity = getIssuedVoucherQuantity(
              reward.quantity,
              task.expectedParticipantCount
            );
            if (reward.quantity <= 0) {
              setQuestError(
                `Số lượng phần thưởng ${rewardIndex + 1} của nhiệm vụ con ${taskIndex + 1} phải lớn hơn 0.`
              );
              return;
            }

            if (
              voucher.name.trim() === '' ||
              voucher.voucherCode.trim() === ''
            ) {
              setQuestError(
                `Voucher ở phần thưởng ${rewardIndex + 1} của nhiệm vụ con ${taskIndex + 1} chưa đủ thông tin bắt buộc.`
              );
              return;
            }

            if (voucher.type === 'PERCENT' && voucher.discountValue > 100) {
              setQuestError(
                `Voucher giảm % ở nhiệm vụ con ${taskIndex + 1} không được vượt quá 100.`
              );
              return;
            }

            if (issuedVoucherQuantity <= 0) {
              setQuestError(
                `Số lượng phát hành voucher ở nhiệm vụ con ${taskIndex + 1} phải lớn hơn 0.`
              );
              return;
            }
          }
        }
      }
    }

    setQuestError(null);

    const payload: CampaignFormData = {
      ...data,
      requiredTierId: data.requiredTierId ?? undefined,
      expectedBranchJoin: data.expectedBranchJoin ?? 1,
      joinFee: data.joinFee,
      registrationStartDate: toIsoZulu(data.registrationStartDate) ?? '',
      registrationEndDate: toIsoZulu(data.registrationEndDate) ?? '',
      startDate: toIsoZulu(data.startDate) ?? '',
      endDate: toIsoZulu(data.endDate) ?? '',
    };

    const createQuestBundles = campaign
      ? undefined
      : questBundles.map((quest) => ({
          ...quest,
          tasks: quest.tasks.map((task) => ({
            taskType: task.taskType,
            targetValue: task.targetValue,
            taskDescription: task.taskDescription,
            rewards: task.rewards.map((reward) => ({
              ...reward,
              voucher: {
                ...reward.voucher,
                quantity: getIssuedVoucherQuantity(
                  reward.quantity,
                  task.expectedParticipantCount
                ),
                isActive: true,
              },
            })),
          })),
        }));

    await onSubmit(payload, imageFile, isImageRemoved, createQuestBundles);
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
    setImageError(null);
  };

  const handleClearSelectedImage = (): void => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImageFile(null);
    setImagePreviewUrl(null);
    setIsImageRemoved(true);
    setImageError('Ảnh banner chiến dịch không được để trống');
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

  const updateQuestBundle = (
    questIndex: number,
    updater: (quest: CampaignQuestBundleDraft) => CampaignQuestBundleDraft
  ): void => {
    setQuestBundles((prev) =>
      prev.map((quest, index) =>
        index === questIndex ? updater(quest) : quest
      )
    );
  };

  const handleQuestImageChange = (
    questIndex: number,
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      return;
    }

    updateQuestBundle(questIndex, (quest) => {
      revokeQuestPreviewUrl(quest.imagePreviewUrl);

      return {
        ...quest,
        imageFile: file,
        imagePreviewUrl: URL.createObjectURL(file),
      };
    });
  };

  const handleClearQuestImage = (questIndex: number): void => {
    updateQuestBundle(questIndex, (quest) => {
      revokeQuestPreviewUrl(quest.imagePreviewUrl);

      return {
        ...quest,
        imageFile: null,
        imagePreviewUrl: null,
      };
    });

    const inputRef = questImageInputRefs.current[questIndex];
    if (inputRef) {
      inputRef.value = '';
    }
  };

  const addTaskToQuest = (questIndex: number): void => {
    updateQuestBundle(questIndex, (quest) => ({
      ...quest,
      tasks: [...quest.tasks, defaultQuestTaskDraft()],
    }));
  };

  const removeTaskFromQuest = (questIndex: number, taskIndex: number): void => {
    updateQuestBundle(questIndex, (quest) => ({
      ...quest,
      tasks: quest.tasks.filter((_, index) => index !== taskIndex),
    }));
  };

  const addRewardToTask = (questIndex: number, taskIndex: number): void => {
    updateQuestBundle(questIndex, (quest) => ({
      ...quest,
      tasks: quest.tasks.map((task, index) =>
        index === taskIndex
          ? {
              ...task,
              rewards: [...task.rewards, defaultRewardDraft()],
            }
          : task
      ),
    }));
  };

  const removeRewardFromTask = (
    questIndex: number,
    taskIndex: number,
    rewardIndex: number
  ): void => {
    updateQuestBundle(questIndex, (quest) => ({
      ...quest,
      tasks: quest.tasks.map((task, index) =>
        index === taskIndex
          ? {
              ...task,
              rewards: task.rewards.filter((_, idx) => idx !== rewardIndex),
            }
          : task
      ),
    }));
  };

  const updateTaskField = (
    questIndex: number,
    taskIndex: number,
    updater: (task: QuestTaskDraft) => QuestTaskDraft
  ): void => {
    updateQuestBundle(questIndex, (quest) => ({
      ...quest,
      tasks: quest.tasks.map((task, index) =>
        index === taskIndex ? updater(task) : task
      ),
    }));
  };

  const updateRewardField = (
    questIndex: number,
    taskIndex: number,
    rewardIndex: number,
    updater: (reward: RewardDraft) => RewardDraft
  ): void => {
    updateTaskField(questIndex, taskIndex, (task) => ({
      ...task,
      rewards: task.rewards.map((reward, index) =>
        index === rewardIndex ? updater(reward) : reward
      ),
    }));
  };

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

                {/* <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">
                    Phân khúc mục tiêu
                  </label>
                  <input
                    {...register('targetSegment')}
                    className={inputClass(false)}
                    placeholder="VD: Học sinh, Sinh viên"
                  />
                </div> */}

                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">
                    Yêu cầu hạng quán ít nhất cần có để tham gia chiến dịch
                  </label>
                  <Controller
                    control={control}
                    name="requiredTierId"
                    render={({ field }) => (
                      <select
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(val === '' ? null : Number(val));
                        }}
                        className={inputClass(!!errors.requiredTierId)}
                      >
                        <option value="">Không yêu cầu hạng</option>
                        {tiers.map((tier) => (
                          <option key={tier.tierId} value={tier.tierId}>
                            {tier.name}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">
                    Số lượng chi nhánh dự kiến tham gia
                  </label>
                  <Controller
                    control={control}
                    name="expectedBranchJoin"
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        min={1}
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(val === '' ? null : Number(val));
                        }}
                        className={inputClass(!!errors.expectedBranchJoin)}
                        placeholder="VD: 1"
                      />
                    )}
                  />
                  {errors.expectedBranchJoin && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.expectedBranchJoin.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">
                    Phí tham gia <span className="text-red-500">*</span>
                    <span className="ml-1 text-xs font-normal text-gray-500">
                      (VNĐ)
                    </span>
                    <span className="ml-2 text-xs font-medium text-amber-600">
                      (Tối thiểu 10.000đ)
                    </span>
                  </label>
                  <Controller
                    control={control}
                    name="joinFee"
                    render={({ field }) => (
                      <input
                        type="text"
                        inputMode="numeric"
                        className={inputClass(!!errors.joinFee)}
                        value={formatNumberWithDots(field.value)}
                        onChange={(e) => {
                          field.onChange(parseNumberInput(e.target.value));
                        }}
                        onBlur={() => {
                          if (field.value < 10000) {
                            field.onChange(10000);
                          }
                          field.onBlur();
                        }}
                      />
                    )}
                  />
                  {errors.joinFee && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.joinFee.message}
                    </p>
                  )}
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
                    Mô tả <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className={`${inputClass(!!errors.description)} resize-none`}
                    placeholder="Nhập mô tả chiến dịch"
                  />
                  {errors.description && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Ảnh banner chiến dịch{' '}
                    <span className="text-red-500">*</span>
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
                    {imageError && (
                      <p className="text-center text-xs text-red-500">
                        {imageError}
                      </p>
                    )}
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
                    min={
                      campaign?.registrationStartDate &&
                      toLocalDatetimeValue(campaign.registrationStartDate) <
                        getTodayMinVN()
                        ? toLocalDatetimeValue(campaign.registrationStartDate)
                        : getTodayMinVN()
                    }
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
                    min={registrationStartDate || getTodayMinVN()}
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
                    min={registrationEndDate || getTodayMinVN()}
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
                    min={startDate || getTodayMinVN()}
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

            {!campaign && (
              <>
                <hr className="border-gray-100" />

                <div>
                  {sectionLabel('Nhiệm vụ kèm voucher')}

                  {questError && (
                    <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                      {questError}
                    </div>
                  )}

                  <div className="space-y-4">
                    {questBundles.map((quest, questIndex) => {
                      return (
                        <div
                          key={questIndex}
                          className="rounded-xl border border-gray-100 bg-gray-50/60 p-4"
                        >
                          <div className="mb-4 flex items-center justify-between">
                            <p className="text-sm font-semibold text-gray-700">
                              Nhiệm vụ
                            </p>
                          </div>

                          <div>
                            <label className="mb-1 block text-sm font-semibold text-gray-700">
                              Tiêu đề nhiệm vụ{' '}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              value={quest.title}
                              onChange={(event) =>
                                updateQuestBundle(questIndex, (prev) => ({
                                  ...prev,
                                  title: event.target.value,
                                }))
                              }
                              className={inputClass(false)}
                              placeholder="Nhập tiêu đề nhiệm vụ"
                            />
                          </div>

                          <div className="mt-4">
                            <label className="mb-1 block text-sm font-semibold text-gray-700">
                              Mô tả quest
                            </label>
                            <textarea
                              rows={2}
                              value={quest.description}
                              onChange={(event) =>
                                updateQuestBundle(questIndex, (prev) => ({
                                  ...prev,
                                  description: event.target.value,
                                }))
                              }
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-200"
                              placeholder="Nhập mô tả quest (không bắt buộc)"
                            />
                          </div>

                          <div className="mt-4">
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                              Ảnh nhiệm vụ
                            </label>
                            <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                              {quest.imagePreviewUrl ? (
                                <div className="group relative flex min-h-32 w-full items-center justify-center overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm">
                                  <img
                                    src={quest.imagePreviewUrl}
                                    alt="Quest preview"
                                    className="h-32 w-auto max-w-full object-contain"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center gap-4 bg-black/40 opacity-0 transition-all duration-300 group-hover:opacity-100">
                                    <Tooltip title="Đổi ảnh khác" arrow>
                                      <IconButton
                                        onClick={() =>
                                          questImageInputRefs.current[
                                            questIndex
                                          ]?.click()
                                        }
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
                                        onClick={() =>
                                          handleClearQuestImage(questIndex)
                                        }
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
                                  className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white"
                                  onClick={() =>
                                    questImageInputRefs.current[
                                      questIndex
                                    ]?.click()
                                  }
                                >
                                  <AddPhotoAlternateIcon fontSize="medium" />
                                  <p className="mt-2 text-sm font-semibold text-gray-700">
                                    Nhấn để tải ảnh nhiệm vụ lên
                                  </p>
                                </div>
                              )}
                              <input
                                ref={(el) => {
                                  questImageInputRefs.current[questIndex] = el;
                                }}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(event) =>
                                  handleQuestImageChange(questIndex, event)
                                }
                              />
                            </div>
                          </div>

                          <div className="mt-4">
                            <div className="mb-3 flex items-center justify-between">
                              <p className="text-xs font-bold tracking-wide text-gray-500 uppercase">
                                Danh sách nhiệm vụ con
                              </p>
                              <button
                                type="button"
                                onClick={() => addTaskToQuest(questIndex)}
                                className="border-primary-500 text-primary-600 hover:bg-primary-50 flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-semibold"
                              >
                                <AddIcon sx={{ fontSize: 14 }} />
                                Thêm nhiệm vụ con
                              </button>
                            </div>

                            <div className="space-y-4">
                              {quest.tasks.map((task, taskIndex) => {
                                const canRemoveTask = quest.tasks.length > 1;
                                const isOrderAmountTask =
                                  task.taskType === QuestTaskType.ORDER_AMOUNT;

                                return (
                                  <div
                                    key={taskIndex}
                                    className="rounded-lg border border-gray-200 bg-white p-3"
                                  >
                                    <div className="mb-3 flex items-center justify-between">
                                      <h4 className="text-sm font-semibold text-gray-700">
                                        Nhiệm vụ con {taskIndex + 1}
                                      </h4>
                                      {canRemoveTask && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            removeTaskFromQuest(
                                              questIndex,
                                              taskIndex
                                            )
                                          }
                                          className="flex items-center gap-1 text-sm font-medium text-red-600"
                                        >
                                          <DeleteIcon fontSize="small" />
                                          Xóa
                                        </button>
                                      )}
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                      <div>
                                        <label className="mb-1 block text-sm font-semibold text-gray-700">
                                          Loại nhiệm vụ{' '}
                                          <span className="text-red-500">
                                            *
                                          </span>
                                        </label>
                                        <select
                                          value={task.taskType}
                                          onChange={(event) =>
                                            updateTaskField(
                                              questIndex,
                                              taskIndex,
                                              (prevTask) => ({
                                                ...prevTask,
                                                taskType: Number(
                                                  event.target.value
                                                ) as QuestTaskType,
                                              })
                                            )
                                          }
                                          className={inputClass(false)}
                                        >
                                          {taskOptions
                                            .filter(
                                              (option) =>
                                                option.value !==
                                                  QuestTaskType.SHARE ||
                                                option.value === task.taskType
                                            )
                                            .map((option) => (
                                              <option
                                                key={option.value}
                                                value={option.value}
                                              >
                                                {option.label}
                                              </option>
                                            ))}
                                        </select>
                                      </div>

                                      <div>
                                        <label className="mb-1 block text-sm font-semibold text-gray-700">
                                          Giá trị cần đạt{' '}
                                          <span className="text-red-500">
                                            *
                                          </span>
                                        </label>
                                        {isOrderAmountTask ? (
                                          <input
                                            type="text"
                                            inputMode="numeric"
                                            value={
                                              task.targetValue > 0
                                                ? formatNumberWithDots(
                                                    task.targetValue
                                                  )
                                                : ''
                                            }
                                            onChange={(event) => {
                                              const rawValue =
                                                event.target.value;
                                              updateTaskField(
                                                questIndex,
                                                taskIndex,
                                                (prevTask) => ({
                                                  ...prevTask,
                                                  targetValue:
                                                    rawValue === ''
                                                      ? 0
                                                      : Math.max(
                                                          1,
                                                          parseNumberInput(
                                                            rawValue
                                                          )
                                                        ),
                                                })
                                              );
                                            }}
                                            className={inputClass(false)}
                                            placeholder="Ví dụ: 1.000.000"
                                          />
                                        ) : (
                                          <input
                                            type="number"
                                            min={1}
                                            value={
                                              task.targetValue > 0
                                                ? task.targetValue
                                                : ''
                                            }
                                            onChange={(event) => {
                                              const rawValue =
                                                event.target.value;
                                              updateTaskField(
                                                questIndex,
                                                taskIndex,
                                                (prevTask) => ({
                                                  ...prevTask,
                                                  targetValue:
                                                    rawValue === ''
                                                      ? 0
                                                      : Math.max(
                                                          1,
                                                          Number(rawValue)
                                                        ),
                                                })
                                              );
                                            }}
                                            className={inputClass(false)}
                                            placeholder="1"
                                          />
                                        )}
                                      </div>

                                      <div className="md:col-span-2">
                                        <label className="mb-1 block text-sm font-semibold text-gray-700">
                                          Mô tả nhiệm vụ con
                                        </label>
                                        <textarea
                                          rows={2}
                                          value={task.taskDescription}
                                          onChange={(event) =>
                                            updateTaskField(
                                              questIndex,
                                              taskIndex,
                                              (prevTask) => ({
                                                ...prevTask,
                                                taskDescription:
                                                  event.target.value,
                                              })
                                            )
                                          }
                                          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-200"
                                          placeholder="Mô tả nhiệm vụ con (tùy chọn)"
                                        />
                                      </div>

                                      <div>
                                        <label className="mb-1 block text-sm font-semibold text-gray-700">
                                          Số người kỳ vọng tham gia{' '}
                                          <span className="text-red-500">
                                            *
                                          </span>
                                        </label>
                                        <input
                                          type="number"
                                          min={1}
                                          value={
                                            task.expectedParticipantCount > 0
                                              ? task.expectedParticipantCount
                                              : ''
                                          }
                                          onChange={(event) => {
                                            const rawValue = event.target.value;
                                            updateTaskField(
                                              questIndex,
                                              taskIndex,
                                              (prevTask) => ({
                                                ...prevTask,
                                                expectedParticipantCount:
                                                  rawValue === ''
                                                    ? 0
                                                    : Math.max(
                                                        1,
                                                        Number(rawValue)
                                                      ),
                                              })
                                            );
                                          }}
                                          className={inputClass(false)}
                                          placeholder="1"
                                        />
                                        <p className="mt-1 text-[11px] text-gray-500">
                                          Áp dụng cho tất cả phần thưởng trong
                                          nhiệm vụ con này.
                                        </p>
                                      </div>
                                    </div>

                                    <div className="mt-4">
                                      <div className="mb-2 flex items-center justify-between">
                                        <p className="text-sm font-semibold text-gray-700">
                                          Phần thưởng
                                        </p>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            addRewardToTask(
                                              questIndex,
                                              taskIndex
                                            )
                                          }
                                          className="border-primary-500 text-primary-600 hover:bg-primary-50 flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-semibold"
                                        >
                                          <AddIcon sx={{ fontSize: 14 }} />
                                          Thêm thưởng
                                        </button>
                                      </div>

                                      <div className="space-y-3">
                                        {task.rewards.map(
                                          (reward, rewardIndex) => {
                                            const canRemoveReward =
                                              task.rewards.length > 1;
                                            const voucher = reward.voucher;

                                            return (
                                              <div
                                                key={rewardIndex}
                                                className="rounded-lg border border-gray-200 bg-gray-50 p-3"
                                              >
                                                <div className="mb-2 flex items-center justify-between">
                                                  <p className="text-xs font-semibold text-gray-600">
                                                    Phần thưởng{' '}
                                                    {rewardIndex + 1}
                                                  </p>
                                                  <div className="flex items-center gap-2">
                                                    <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                                                      Voucher
                                                    </span>
                                                    {canRemoveReward && (
                                                      <button
                                                        type="button"
                                                        onClick={() =>
                                                          removeRewardFromTask(
                                                            questIndex,
                                                            taskIndex,
                                                            rewardIndex
                                                          )
                                                        }
                                                        className="text-xs font-semibold text-red-600"
                                                      >
                                                        Xóa
                                                      </button>
                                                    )}
                                                  </div>
                                                </div>

                                                <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                                                  <div>
                                                    <label className="mb-1 block text-xs font-semibold text-gray-700">
                                                      Loại thưởng
                                                    </label>
                                                    <input
                                                      value="Voucher"
                                                      disabled
                                                      className="w-full cursor-not-allowed rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-500"
                                                    />
                                                  </div>
                                                  <div>
                                                    <label className="mb-1 block text-xs font-semibold text-gray-700">
                                                      Giá trị thưởng
                                                    </label>
                                                    <input
                                                      value="Tự động theo voucher tạo mới"
                                                      disabled
                                                      className="w-full cursor-not-allowed rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-500"
                                                    />
                                                  </div>
                                                  <div>
                                                    <label className="mb-1 block text-xs font-semibold text-gray-700">
                                                      Số lượng thưởng{' '}
                                                      <span className="text-red-500">
                                                        *
                                                      </span>
                                                    </label>
                                                    <input
                                                      type="number"
                                                      min={1}
                                                      value={
                                                        reward.quantity > 0
                                                          ? reward.quantity
                                                          : ''
                                                      }
                                                      onChange={(event) => {
                                                        const rawValue =
                                                          event.target.value;
                                                        const nextQuantity =
                                                          rawValue === ''
                                                            ? 0
                                                            : Math.max(
                                                                1,
                                                                Number(rawValue)
                                                              );
                                                        updateRewardField(
                                                          questIndex,
                                                          taskIndex,
                                                          rewardIndex,
                                                          (prevReward) => ({
                                                            ...prevReward,
                                                            quantity:
                                                              nextQuantity,
                                                          })
                                                        );
                                                      }}
                                                      className={inputClass(
                                                        false
                                                      )}
                                                      placeholder="1"
                                                    />
                                                  </div>
                                                </div>

                                                <div className="rounded-lg border border-gray-200 bg-white p-3">
                                                  <p
                                                    className="mb-3 text-xs font-bold uppercase"
                                                    style={{ color: '#8bcf3f' }}
                                                  >
                                                    Form tạo voucher cho phần
                                                    thưởng này
                                                  </p>

                                                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                                    <div>
                                                      <label className="mb-1 block text-xs font-semibold text-gray-700">
                                                        Tên voucher{' '}
                                                        <span className="text-red-500">
                                                          *
                                                        </span>
                                                      </label>
                                                      <input
                                                        value={voucher.name}
                                                        onChange={(event) =>
                                                          updateRewardField(
                                                            questIndex,
                                                            taskIndex,
                                                            rewardIndex,
                                                            (prevReward) => ({
                                                              ...prevReward,
                                                              voucher: {
                                                                ...prevReward.voucher,
                                                                name: event
                                                                  .target.value,
                                                              },
                                                            })
                                                          )
                                                        }
                                                        className={inputClass(
                                                          false
                                                        )}
                                                        placeholder="Nhập tên voucher"
                                                      />
                                                    </div>

                                                    <div>
                                                      <label className="mb-1 block text-xs font-semibold text-gray-700">
                                                        Mã voucher{' '}
                                                        <span className="text-red-500">
                                                          *
                                                        </span>
                                                      </label>
                                                      <input
                                                        value={
                                                          voucher.voucherCode
                                                        }
                                                        onChange={(event) =>
                                                          updateRewardField(
                                                            questIndex,
                                                            taskIndex,
                                                            rewardIndex,
                                                            (prevReward) => ({
                                                              ...prevReward,
                                                              voucher: {
                                                                ...prevReward.voucher,
                                                                voucherCode:
                                                                  event.target
                                                                    .value,
                                                              },
                                                            })
                                                          )
                                                        }
                                                        className={inputClass(
                                                          false
                                                        )}
                                                        placeholder="VD: QUEST2026"
                                                      />
                                                    </div>

                                                    <div>
                                                      <label className="mb-1 block text-xs font-semibold text-gray-700">
                                                        Loại giảm giá{' '}
                                                        <span className="text-red-500">
                                                          *
                                                        </span>
                                                      </label>
                                                      <select
                                                        value={voucher.type}
                                                        onChange={(event) =>
                                                          updateRewardField(
                                                            questIndex,
                                                            taskIndex,
                                                            rewardIndex,
                                                            (prevReward) => ({
                                                              ...prevReward,
                                                              voucher: {
                                                                ...prevReward.voucher,
                                                                type: event
                                                                  .target
                                                                  .value as
                                                                  | 'AMOUNT'
                                                                  | 'PERCENT',
                                                                maxDiscountValue:
                                                                  event.target
                                                                    .value ===
                                                                  'AMOUNT'
                                                                    ? null
                                                                    : prevReward
                                                                        .voucher
                                                                        .maxDiscountValue,
                                                              },
                                                            })
                                                          )
                                                        }
                                                        className={inputClass(
                                                          false
                                                        )}
                                                      >
                                                        <option value="AMOUNT">
                                                          Giảm theo số tiền
                                                        </option>
                                                        <option value="PERCENT">
                                                          Giảm theo %
                                                        </option>
                                                      </select>
                                                    </div>

                                                    <div>
                                                      <label className="mb-1 block text-xs font-semibold text-gray-700">
                                                        Giá trị giảm{' '}
                                                        <span className="text-red-500">
                                                          *
                                                        </span>
                                                      </label>
                                                      <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        value={
                                                          voucher.type ===
                                                          'PERCENT'
                                                            ? String(
                                                                voucher.discountValue
                                                              )
                                                            : formatNumberWithDots(
                                                                voucher.discountValue
                                                              )
                                                        }
                                                        onChange={(event) =>
                                                          updateRewardField(
                                                            questIndex,
                                                            taskIndex,
                                                            rewardIndex,
                                                            (prevReward) => {
                                                              const nextValue =
                                                                prevReward
                                                                  .voucher
                                                                  .type ===
                                                                'PERCENT'
                                                                  ? Math.min(
                                                                      Number(
                                                                        event.target.value.replace(
                                                                          /[^0-9]/g,
                                                                          ''
                                                                        )
                                                                      ),
                                                                      100
                                                                    )
                                                                  : parseNumberInput(
                                                                      event
                                                                        .target
                                                                        .value
                                                                    );

                                                              return {
                                                                ...prevReward,
                                                                voucher: {
                                                                  ...prevReward.voucher,
                                                                  discountValue:
                                                                    Number.isNaN(
                                                                      nextValue
                                                                    )
                                                                      ? 0
                                                                      : nextValue,
                                                                },
                                                              };
                                                            }
                                                          )
                                                        }
                                                        className={inputClass(
                                                          false
                                                        )}
                                                        placeholder="0"
                                                      />
                                                    </div>

                                                    {voucher.type ===
                                                      'PERCENT' && (
                                                      <div>
                                                        <label className="mb-1 block text-xs font-semibold text-gray-700">
                                                          Giảm tối đa (VNĐ)
                                                        </label>
                                                        <input
                                                          type="text"
                                                          inputMode="numeric"
                                                          value={formatNumberWithDots(
                                                            voucher.maxDiscountValue
                                                          )}
                                                          onChange={(event) =>
                                                            updateRewardField(
                                                              questIndex,
                                                              taskIndex,
                                                              rewardIndex,
                                                              (prevReward) => ({
                                                                ...prevReward,
                                                                voucher: {
                                                                  ...prevReward.voucher,
                                                                  maxDiscountValue:
                                                                    event.target
                                                                      .value ===
                                                                    ''
                                                                      ? null
                                                                      : parseNumberInput(
                                                                          event
                                                                            .target
                                                                            .value
                                                                        ),
                                                                },
                                                              })
                                                            )
                                                          }
                                                          className={inputClass(
                                                            false
                                                          )}
                                                          placeholder="Không giới hạn"
                                                        />
                                                      </div>
                                                    )}

                                                    <div>
                                                      <label className="mb-1 block text-xs font-semibold text-gray-700">
                                                        Đơn hàng tối thiểu (VNĐ){' '}
                                                        <span className="text-red-500">
                                                          *
                                                        </span>
                                                      </label>
                                                      <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        value={formatNumberWithDots(
                                                          voucher.minAmountRequired
                                                        )}
                                                        onChange={(event) =>
                                                          updateRewardField(
                                                            questIndex,
                                                            taskIndex,
                                                            rewardIndex,
                                                            (prevReward) => ({
                                                              ...prevReward,
                                                              voucher: {
                                                                ...prevReward.voucher,
                                                                minAmountRequired:
                                                                  parseNumberInput(
                                                                    event.target
                                                                      .value
                                                                  ),
                                                              },
                                                            })
                                                          )
                                                        }
                                                        className={inputClass(
                                                          false
                                                        )}
                                                        placeholder="0"
                                                      />
                                                    </div>

                                                    <div>
                                                      <label className="mb-1 block text-xs font-semibold text-gray-700">
                                                        Số lượng phát hành{' '}
                                                        <span className="text-red-500">
                                                          *
                                                        </span>
                                                      </label>
                                                      <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        value={formatNumberWithDots(
                                                          getIssuedVoucherQuantity(
                                                            reward.quantity,
                                                            task.expectedParticipantCount
                                                          )
                                                        )}
                                                        disabled
                                                        className={inputClass(
                                                          false
                                                        )}
                                                        placeholder="0"
                                                      />
                                                      <p className="mt-1 text-[11px] text-gray-500">
                                                        Tự tính theo công thức:
                                                        Số lượng thưởng x Số
                                                        người kỳ vọng tham gia.
                                                      </p>
                                                    </div>
                                                  </div>

                                                  <div className="mt-3">
                                                    <label className="mb-1 block text-xs font-semibold text-gray-700">
                                                      Mô tả voucher
                                                    </label>
                                                    <textarea
                                                      rows={2}
                                                      value={
                                                        voucher.description
                                                      }
                                                      onChange={(event) =>
                                                        updateRewardField(
                                                          questIndex,
                                                          taskIndex,
                                                          rewardIndex,
                                                          (prevReward) => ({
                                                            ...prevReward,
                                                            voucher: {
                                                              ...prevReward.voucher,
                                                              description:
                                                                event.target
                                                                  .value,
                                                            },
                                                          })
                                                        )
                                                      }
                                                      className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-200"
                                                      placeholder="Nhập mô tả voucher (không bắt buộc)"
                                                    />
                                                  </div>
                                                </div>
                                              </div>
                                            );
                                          }
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
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
