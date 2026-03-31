import { zodResolver } from '@hookform/resolvers/zod';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
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
import { useEffect, type JSX } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';

interface QuestFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: QuestCreate) => Promise<void>;
  quest: Quest | null;
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
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
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<QuestFormInput, unknown, QuestFormData>({
    resolver: zodResolver(QuestSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'tasks',
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

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
      return;
    }

    reset({
      ...defaultValues,
      tasks: [{ ...defaultTask }],
    });
  }, [isOpen, quest, reset]);

  const handleFormSubmit = async (data: QuestFormData): Promise<void> => {
    await onSubmit({
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
    });
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
                placeholder="Nhập tiêu đề quest"
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-table-text-primary mb-1 block text-sm font-medium">
                Campaign ID
              </label>
              <input
                type="number"
                {...register('campaignId', {
                  setValueAs: (value) => {
                    if (value === '' || value === null || value === undefined) {
                      return null;
                    }
                    const parsedValue = Number(value);
                    return Number.isNaN(parsedValue) ? null : parsedValue;
                  },
                })}
                className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
                placeholder="Để trống nếu quest độc lập"
              />
              {errors.campaignId && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.campaignId.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="text-table-text-primary mb-1 block text-sm font-medium">
                URL ảnh
              </label>
              <input
                type="text"
                {...register('imageUrl', {
                  setValueAs: (value) =>
                    typeof value === 'string' && value.trim() === ''
                      ? null
                      : value,
                })}
                className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
                placeholder="https://..."
              />
              {errors.imageUrl && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.imageUrl.message}
                </p>
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
                placeholder="Nhập mô tả quest"
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
              Quest độc lập
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
                    <select
                      {...register(`tasks.${index}.rewardType`, {
                        setValueAs: (value) => Number(value),
                      })}
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
                    <input
                      type="number"
                      {...register(`tasks.${index}.rewardValue`, {
                        valueAsNumber: true,
                      })}
                      className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
                    />
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
                : 'Tạo quest'}
          </button>
        </div>
      </div>
    </div>
  );
}
