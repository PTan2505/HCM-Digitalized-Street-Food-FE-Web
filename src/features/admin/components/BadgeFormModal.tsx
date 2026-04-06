import type { JSX } from 'react';
import { Avatar } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { BadgeFormSchema } from '@features/admin/utils/badgeFormSchema';
import { useEffect, useState } from 'react';
import type { z } from 'zod';
import AppModalHeader from '@components/AppModalHeader';

type BadgeFormSchemaType = z.infer<typeof BadgeFormSchema>;

interface BadgeFormData {
  badgeName?: string;
  pointToGet?: number;
  iconUrl?: string;
  description?: string;
  badgeId?: number;
}

interface BadgeFormModalProps {
  isOpen: boolean;
  isEditMode: boolean;
  formData: BadgeFormData;
  onClose: () => void;
  onSave: (data: BadgeFormSchemaType) => void | Promise<void>;
  onChange: (data: BadgeFormData) => void;
}

export default function BadgeFormModal({
  isOpen,
  isEditMode,
  formData,
  onClose,
  onSave,
}: BadgeFormModalProps): JSX.Element | null {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isValid, isDirty },
  } = useForm<BadgeFormSchemaType>({
    resolver: zodResolver(BadgeFormSchema),
    mode: 'onChange',
    defaultValues: {
      badgeName: '',
      pointToGet: '',
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
      setPreviewUrl(formData.iconUrl ?? '');
      return undefined;
    }
  }, [imageFile, formData.iconUrl]);

  useEffect(() => {
    if (isOpen) {
      reset({
        badgeName: formData.badgeName ?? '',
        pointToGet: formData.pointToGet?.toString() ?? '',
        description: formData.description ?? '',
        imageFile: null,
      });
    }
  }, [isOpen, formData, reset]);

  const handleFormSubmit = (data: BadgeFormSchemaType): void => {
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
          title={isEditMode ? 'Chỉnh sửa Badge' : 'Thêm Badge mới'}
          subtitle={isEditMode ? (formData.badgeName ?? '') : undefined}
          icon={<EmojiEventsIcon />}
          iconTone="admin"
          onClose={onClose}
        />

        {/* Modal Content */}
        <div className="space-y-4 px-6 py-4">
          {/* Tên Badge */}
          <div>
            <label className="text-table-text-primary mb-1 block text-sm font-medium">
              Tên Badge <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('badgeName')}
              className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
              placeholder="Tên Badge"
            />
            {errors.badgeName && (
              <p className="mt-1 text-xs text-red-500">
                {errors.badgeName.message}
              </p>
            )}
          </div>

          {/* Điểm yêu cầu */}
          <div>
            <label className="text-table-text-primary mb-1 block text-sm font-medium">
              Điểm yêu cầu <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('pointToGet')}
              className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
              placeholder="0"
            />
            {errors.pointToGet && (
              <p className="mt-1 text-xs text-red-500">
                {errors.pointToGet.message}
              </p>
            )}
          </div>

          {/* File Icon */}
          <div>
            <label className="text-table-text-primary mb-1 block text-sm font-medium">
              Icon huy hiệu
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
              Tải lên hình ảnh icon cho huy hiệu
            </p>
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

          {/* Preview */}
          {previewUrl && (
            <div className="flex items-center gap-2">
              <span className="text-table-text-secondary text-sm">
                Xem trước icon huy hiệu:
              </span>
              <Avatar src={previewUrl} alt="Preview" className="h-12 w-12" />
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
