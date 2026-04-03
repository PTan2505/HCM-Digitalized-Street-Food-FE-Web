import type { JSX } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { FeedbackTagFormSchema } from '@features/admin/utils/feedbackTagFormSchema';
import { useEffect } from 'react';
import type { z } from 'zod';

type FeedbackTagFormSchemaType = z.infer<typeof FeedbackTagFormSchema>;

interface FeedbackTagFormData {
  tagName?: string;
  description?: string | null;
  tagId?: number;
}

interface FeedbackTagFormModalProps {
  isOpen: boolean;
  isEditMode: boolean;
  formData: FeedbackTagFormData;
  onClose: () => void;
  onSave: (data: FeedbackTagFormSchemaType) => void | Promise<void>;
  onChange: (data: FeedbackTagFormData) => void;
}

export default function FeedbackTagModal({
  isOpen,
  isEditMode,
  formData,
  onClose,
  onSave,
}: FeedbackTagFormModalProps): JSX.Element | null {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<FeedbackTagFormSchemaType>({
    resolver: zodResolver(FeedbackTagFormSchema),
    mode: 'onChange',
    defaultValues: {
      tagName: '',
      description: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        tagName: formData.tagName ?? '',
        description: formData.description ?? '',
      });
    }
  }, [isOpen, formData, reset]);

  const handleFormSubmit = (data: FeedbackTagFormSchemaType): void => {
    void onSave(data);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="mx-4 w-full max-w-lg rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-bold text-[var(--color-table-text-primary)]">
            {isEditMode ? 'Chỉnh sửa Feedback Tag' : 'Thêm Feedback Tag mới'}
          </h2>
        </div>

        {/* Modal Content */}
        <div className="space-y-4 px-6 py-4">
          {/* Tên Tag */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--color-table-text-primary)]">
              Tên Feedback Tag <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('tagName')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-[var(--color-primary-500)] focus:outline-none"
              placeholder="Tên Feedback Tag"
            />
            {errors.tagName && (
              <p className="mt-1 text-xs text-red-500">
                {errors.tagName.message}
              </p>
            )}
          </div>

          {/* Mô tả */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--color-table-text-primary)]">
              Mô tả <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-[var(--color-primary-500)] focus:outline-none"
              placeholder="Mô tả"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            type="button"
            className="rounded-lg px-4 py-2 text-[var(--color-table-text-secondary)] transition-colors hover:bg-gray-100"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit(handleFormSubmit)}
            type="button"
            disabled={!isValid}
            className="rounded-lg bg-[var(--color-primary-600)] px-4 py-2 font-semibold text-white transition-colors hover:bg-[var(--color-primary-700)] disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isEditMode ? 'Cập nhật' : 'Thêm mới'}
          </button>
        </div>
      </div>
    </div>
  );
}
