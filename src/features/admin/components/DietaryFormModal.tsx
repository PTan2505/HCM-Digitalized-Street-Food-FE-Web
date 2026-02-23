import type { JSX } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { DietaryFormSchema } from '@features/admin/utils/dietaryFormSchema';
import { useEffect } from 'react';
import type { z } from 'zod';

type DietaryFormSchemaType = z.infer<typeof DietaryFormSchema>;

interface DietaryFormData {
  name?: string;
  description?: string;
  dietaryPreferenceId?: number;
}

interface DietaryFormModalProps {
  isOpen: boolean;
  isEditMode: boolean;
  formData: DietaryFormData;
  onClose: () => void;
  onSave: (data: DietaryFormSchemaType) => void | Promise<void>;
  onChange: (data: DietaryFormData) => void;
}

export default function DietaryFormModal({
  isOpen,
  isEditMode,
  formData,
  onClose,
  onSave,
}: DietaryFormModalProps): JSX.Element | null {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<DietaryFormSchemaType>({
    resolver: zodResolver(DietaryFormSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: formData.name ?? '',
        description: formData.description ?? '',
      });
    }
  }, [isOpen, formData, reset]);

  const handleFormSubmit = (data: DietaryFormSchemaType): void => {
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
            {isEditMode ? 'Chỉnh sửa chế độ ăn' : 'Thêm chế độ ăn mới'}
          </h2>
        </div>

        {/* Modal Content */}
        <div className="space-y-4 px-6 py-4">
          {/* Tên chế độ ăn */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--color-table-text-primary)]">
              Tên chế độ ăn <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('name')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-[var(--color-primary-500)] focus:outline-none"
              placeholder="Ví dụ: Ăn chay, Không gluten..."
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Mô tả */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--color-table-text-primary)]">
              Mô tả <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-[var(--color-primary-500)] focus:outline-none"
              placeholder="Mô tả chi tiết về chế độ ăn..."
            />
            {errors.description ? (
              <p className="mt-1 text-xs text-red-500">
                {errors.description.message}
              </p>
            ) : (
              <p className="mt-1 text-xs text-[var(--color-table-text-secondary)]">
                Mô tả các đặc điểm, hạn chế và lưu ý của chế độ ăn
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
