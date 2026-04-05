import type { JSX } from 'react';
import { Avatar } from '@mui/material';
import CategoryIcon from '@mui/icons-material/Category';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { CategoryFormSchema } from '@features/admin/utils/categoryFormSchema';
import { useEffect, useState } from 'react';
import type { z } from 'zod';
import AppModalHeader from '@components/AppModalHeader';

type CategoryFormSchemaType = z.infer<typeof CategoryFormSchema>;

interface CategoryFormData {
  name?: string;
  description?: string | null;
  categoryId?: number;
  imageUrl?: string | null;
}

interface CategoryFormModalProps {
  isOpen: boolean;
  isEditMode: boolean;
  formData: CategoryFormData;
  onClose: () => void;
  onSave: (data: CategoryFormSchemaType) => void | Promise<void>;
  onChange: (data: CategoryFormData) => void;
}

export default function CategoryFormModal({
  isOpen,
  isEditMode,
  formData,
  onClose,
  onSave,
}: CategoryFormModalProps): JSX.Element | null {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isValid, isDirty },
  } = useForm<CategoryFormSchemaType>({
    resolver: zodResolver(CategoryFormSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      description: '',
      imageFile: null,
    },
  });

  const imageFile = watch('imageFile');
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect((): (() => void) | void => {
    if (imageFile instanceof File) {
      const url = URL.createObjectURL(imageFile);
      setPreviewUrl(url);
      return (): void => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(formData.imageUrl ?? '');
      return undefined;
    }
  }, [imageFile, formData.imageUrl]);

  useEffect(() => {
    if (isOpen) {
      reset({
        name: formData.name ?? '',
        description: formData.description ?? '',
        imageFile: null,
      });
    }
  }, [isOpen, formData, reset]);

  const handleFormSubmit = (data: CategoryFormSchemaType): void => {
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
          title={isEditMode ? 'Chỉnh sửa Danh mục' : 'Thêm Danh mục mới'}
          subtitle={isEditMode ? (formData.name ?? '') : undefined}
          icon={<CategoryIcon />}
          iconTone="category"
          onClose={onClose}
        />

        {/* Modal Content */}
        <div className="space-y-4 px-6 py-4">
          {/* Tên Danh mục */}
          <div>
            <label className="text-table-text-primary mb-1 block text-sm font-medium">
              Tên Danh mục <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('name')}
              className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
              placeholder="Nhập tên danh mục"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Mô tả */}
          <div>
            <label className="text-table-text-primary mb-1 block text-sm font-medium">
              Mô tả
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="focus:ring-primary-500 w-full resize-none rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
              placeholder="Nhập mô tả (tùy chọn)"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* File Ảnh */}
          <div>
            <label className="text-table-text-primary mb-1 block text-sm font-medium">
              Hình ảnh danh mục
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setValue('imageFile', file, {
                  shouldValidate: true,
                  shouldDirty: true,
                });
              }}
              className="focus:ring-primary-500 file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm file:mr-4 file:rounded-lg file:border-0 file:px-4 file:py-2 file:text-sm file:font-semibold focus:border-transparent focus:ring-2 focus:outline-none"
            />
            <p className="text-table-text-secondary mt-1 text-xs">
              Tải lên hình ảnh cho danh mục
            </p>
          </div>

          {/* Preview */}
          {previewUrl && (
            <div className="flex items-center gap-2">
              <span className="text-table-text-secondary text-sm">
                Xem trước hình ảnh:
              </span>
              <Avatar
                src={previewUrl}
                alt="Preview"
                className="h-16 w-16 rounded-md"
                variant="rounded"
              />
            </div>
          )}
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
