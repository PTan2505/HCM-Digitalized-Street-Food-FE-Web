import type { JSX } from 'react';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { FeedbackTagFormSchema } from '@features/admin/utils/feedbackTagFormSchema';
import { useEffect } from 'react';
import type { z } from 'zod';
import AppModalHeader from '@components/AppModalHeader';

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
    formState: { errors, isValid, isDirty },
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
        <AppModalHeader
          title={
            isEditMode ? 'Chỉnh sửa Feedback Tag' : 'Thêm Feedback Tag mới'
          }
          subtitle={isEditMode ? (formData.tagName ?? '') : undefined}
          icon={<ChatBubbleOutlineIcon />}
          iconTone="admin"
          onClose={onClose}
        />

        {/* Modal Content */}
        <div className="space-y-4 px-6 py-4">
          {/* Tên Tag */}
          <div>
            <label className="text-table-text-primary mb-1 block text-sm font-medium">
              Tên Feedback Tag <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('tagName')}
              className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
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
