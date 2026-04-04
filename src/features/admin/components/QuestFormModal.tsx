import { zodResolver } from '@hookform/resolvers/zod';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
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

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="mx-4 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-table-text-primary text-xl font-bold">
            {quest ? 'Chỉnh sửa quest' : 'Tạo quest mới'}
          </h2>
        </div>

        <div className="max-h-[calc(90vh-144px)] space-y-4 overflow-y-auto px-6 py-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-table-text-primary mb-1 block text-sm font-medium">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('title')}
                className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
                placeholder="Nhập tiêu đề nhiệm vụ"
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-table-text-primary mb-1 block text-sm font-medium">
                Tên chiến dịch
                <span className="text-red-500">{isStandalone ? '' : ' *'}</span>
              </label>
              {!isStandalone ? (
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
                    className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
                    placeholder="Nhập tên chiến dịch để tìm"
                  />

                  {isCampaignFocused && campaignQuery.trim().length > 0 && (
                    <div className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                      {isLoadingCampaigns ? (
                        <p className="text-table-text-secondary px-3 py-2 text-sm">
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
                            <p className="text-table-text-primary font-medium">
                              {campaign.name}
                            </p>
                          </button>
                        ))
                      ) : (
                        <p className="text-table-text-secondary px-3 py-2 text-sm">
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
              ) : (
                <div className="text-table-text-secondary flex min-h-10 items-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-2">
                  Nhiệm vụ độc lập không cần tên chiến dịch.
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="text-table-text-primary mb-1 block text-sm font-medium">
                Ảnh nhiệm vụ
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1 file:font-medium hover:file:bg-slate-200 focus:border-transparent focus:ring-2 focus:outline-none"
              />

              {imagePreviewUrl && (
                <div className="mt-2 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 p-2">
                  <img
                    src={imagePreviewUrl}
                    alt="Quest preview"
                    className="max-h-44 w-auto rounded object-cover"
                  />
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="text-table-text-primary mb-1 block text-sm font-medium">
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
                className="focus:ring-primary-500 w-full resize-none rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
                placeholder="Nhập mô tả nhiệm vụ"
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <label className="text-table-text-primary inline-flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                {...register('isActive')}
                className="h-4 w-4 rounded border-gray-300"
              />
              Đang hoạt động
            </label>

            <label className="text-table-text-primary inline-flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                {...register('isStandalone')}
                className="h-4 w-4 rounded border-gray-300"
              />
              Nhiệm vụ độc lập
            </label>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <h3 className="text-table-text-primary text-lg font-semibold">
              Danh sách nhiệm vụ
            </h3>
            <button
              type="button"
              onClick={() => append({ ...defaultTask })}
              className="border-primary-500 text-primary-600 hover:bg-primary-50 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors"
            >
              <AddIcon fontSize="small" />
              Thêm nhiệm vụ
            </button>
          </div>

          {errors.tasks?.message && (
            <p className="text-xs text-red-500">{errors.tasks.message}</p>
          )}

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-table-text-primary font-semibold">
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
                  <div>
                    <label className="text-table-text-primary mb-1 block text-sm font-medium">
                      Loại nhiệm vụ <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register(`tasks.${index}.type`, {
                        setValueAs: (value) => Number(value),
                      })}
                      className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
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

                  <div>
                    <label className="text-table-text-primary mb-1 block text-sm font-medium">
                      Mục tiêu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      {...register(`tasks.${index}.targetValue`, {
                        valueAsNumber: true,
                      })}
                      className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
                    />
                    {errors.tasks?.[index]?.targetValue && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.tasks[index]?.targetValue?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-table-text-primary mb-1 block text-sm font-medium">
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

                            if (nextRewardType === QuestRewardType.POINTS) {
                              setValue(
                                `tasks.${index}.rewardValue`,
                                getDefaultRewardValue(nextRewardType),
                                {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                }
                              );
                              setRewardQueries((prev) => {
                                const nextQueries = { ...prev };
                                delete nextQueries[taskKey];
                                return nextQueries;
                              });
                              return;
                            }

                            setValue(
                              `tasks.${index}.rewardValue`,
                              getDefaultRewardValue(nextRewardType),
                              {
                                shouldDirty: true,
                                shouldValidate: true,
                              }
                            );
                            setRewardQueries((prev) => ({
                              ...prev,
                              [taskKey]: '',
                            }));
                          }}
                          className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
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

                  <div>
                    <label className="text-table-text-primary mb-1 block text-sm font-medium">
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
                            className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
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
                            className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
                            placeholder={
                              isBadgeReward
                                ? 'Tìm và chọn huy hiệu'
                                : 'Tìm và chọn voucher'
                            }
                          />

                          {isRewardFocused && (
                            <div className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                              {isLoadingRewards ? (
                                <p className="text-table-text-secondary px-3 py-2 text-sm">
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
                                    <p className="text-table-text-primary font-medium">
                                      {option.label}
                                    </p>
                                    {/* <p className="text-table-text-secondary text-xs">
                                      {option.hint}
                                    </p> */}
                                  </button>
                                ))
                              ) : (
                                <p className="text-table-text-secondary px-3 py-2 text-sm">
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

                  <div className="md:col-span-2">
                    <label className="text-table-text-primary mb-1 block text-sm font-medium">
                      Mô tả nhiệm vụ
                    </label>
                    <textarea
                      rows={2}
                      {...register(`tasks.${index}.description`, {
                        setValueAs: (value) =>
                          typeof value === 'string' && value.trim() === ''
                            ? null
                            : value,
                      })}
                      className="focus:ring-primary-500 w-full resize-none rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
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

        <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            type="button"
            className="text-table-text-secondary rounded-lg px-4 py-2 transition-colors hover:bg-gray-100"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit(handleFormSubmit)}
            type="button"
            disabled={status === 'pending'}
            className="bg-primary-600 hover:bg-primary-700 rounded-lg px-4 py-2 font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {status === 'pending'
              ? 'Đang lưu...'
              : quest
                ? 'Cập nhật'
                : 'Tạo nhiệm vụ'}
          </button>
        </div>
      </div>
    </div>
  );
}
