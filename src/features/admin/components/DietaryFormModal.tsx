import type { JSX } from 'react';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { DietaryFormSchema } from '@features/admin/utils/dietaryFormSchema';
import { useEffect } from 'react';
import type { z } from 'zod';
import AppModalHeader from '@components/AppModalHeader';

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
    formState: { errors, isValid, isDirty },
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
        <AppModalHeader
          title={isEditMode ? 'Chỉnh sửa chế độ ăn' : 'Thêm chế độ ăn mới'}
          subtitle={isEditMode ? (formData.name ?? '') : undefined}
          icon={<RestaurantMenuIcon />}
          iconTone="admin"
          onClose={onClose}
        />

        {/* Modal Content */}
        <div className="space-y-4 px-6 py-4">
          {/* Tên chế độ ăn */}
          <div>
            <label className="text-table-text-primary mb-1 block text-sm font-medium">
              Tên chế độ ăn <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('name')}
              className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
              placeholder="Ví dụ: Ăn chay, Không gluten..."
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Mô tả */}
          <div>
            <label className="text-table-text-primary mb-1 block text-sm font-medium">
              Mô tả <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="focus:ring-primary-500 w-full resize-none rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
              placeholder="Mô tả chi tiết về chế độ ăn..."
            />
            {errors.description ? (
              <p className="mt-1 text-xs text-red-500">
                {errors.description.message}
              </p>
            ) : (
              <p className="text-table-text-secondary mt-1 text-xs">
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
            className="text-table-text-secondary rounded-lg px-4 py-2 transition-colors hover:bg-gray-100"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit(handleFormSubmit)}
            type="button"
            disabled={isEditMode ? !isValid || !isDirty : !isValid}
            className="bg-primary-600 hover:bg-primary-700 rounded-lg px-4 py-2 font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isEditMode ? 'Cập nhật' : 'Thêm mới'}
          </button>
        </div>
      </div>
    </div>
  );
}
