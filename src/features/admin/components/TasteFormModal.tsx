import type { JSX } from 'react';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { TasteFormSchema } from '@features/admin/utils/tasteFormSchema';
import { useEffect } from 'react';
import type { z } from 'zod';
import AppModalHeader from '@components/AppModalHeader';

type TasteFormSchemaType = z.infer<typeof TasteFormSchema>;

interface TasteFormData {
  name?: string;
  description?: string | null;
  tasteId?: number;
}

interface TasteFormModalProps {
  isOpen: boolean;
  isEditMode: boolean;
  formData: TasteFormData;
  onClose: () => void;
  onSave: (data: TasteFormSchemaType) => void | Promise<void>;
  onChange: (data: TasteFormData) => void;
}

export default function TasteFormModal({
  isOpen,
  isEditMode,
  formData,
  onClose,
  onSave,
}: TasteFormModalProps): JSX.Element | null {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm<TasteFormSchemaType>({
    resolver: zodResolver(TasteFormSchema),
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

  const handleFormSubmit = (data: TasteFormSchemaType): void => {
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
          title={isEditMode ? 'Chỉnh sửa Khẩu vị' : 'Thêm Khẩu vị mới'}
          subtitle={isEditMode ? (formData.name ?? '') : undefined}
          icon={<LocalDiningIcon />}
          iconTone="admin"
          onClose={onClose}
        />

        {/* Modal Content */}
        <div className="space-y-4 px-6 py-4">
          {/* Tên Khẩu vị */}
          <div>
            <label className="text-table-text-primary mb-1 block text-sm font-medium">
              Tên Khẩu vị <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('name')}
              className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
              placeholder="Tên Khẩu vị"
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
              rows={3}
              className="focus:ring-primary-500 w-full resize-none rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
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
