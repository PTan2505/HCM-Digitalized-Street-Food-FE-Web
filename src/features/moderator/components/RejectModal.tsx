import type { JSX } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { z } from 'zod';
import { RejectFormSchema } from '@features/moderator/utils/registrationRejectFormSchema';

type RejectFormSchemaType = z.infer<typeof RejectFormSchema>;

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void | Promise<void>;
}

export default function RejectModal({
  isOpen,
  onClose,
  onConfirm,
}: RejectModalProps): JSX.Element | null {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<RejectFormSchemaType>({
    resolver: zodResolver(RejectFormSchema),
    mode: 'onChange',
    defaultValues: {
      reason: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({ reason: '' });
    }
  }, [isOpen, reset]);

  const handleFormSubmit = (data: RejectFormSchemaType): void => {
    void onConfirm(data.reason);
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
            Từ chối yêu cầu đăng ký
          </h2>
        </div>

        {/* Modal Content */}
        <div className="space-y-4 px-6 py-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--color-table-text-primary)]">
              Lý do từ chối <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('reason')}
              rows={4}
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-[var(--color-primary-500)] focus:outline-none"
              placeholder="Nhập lý do từ chối..."
            />
            {errors.reason ? (
              <p className="mt-1 text-xs text-red-500">
                {errors.reason.message}
              </p>
            ) : (
              <p className="mt-1 text-xs text-[var(--color-table-text-secondary)]">
                Vui lòng cung cấp lý do rõ ràng để người bán có thể khắc phục
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
            className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Xác nhận từ chối
          </button>
        </div>
      </div>
    </div>
  );
}
