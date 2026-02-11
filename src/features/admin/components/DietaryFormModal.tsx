import type { JSX } from 'react';

interface DietaryFormData {
  name?: string;
  description?: string;
}

interface DietaryFormModalProps {
  isOpen: boolean;
  isEditMode: boolean;
  formData: DietaryFormData;
  onClose: () => void;
  onSave: () => void;
  onChange: (data: DietaryFormData) => void;
}

export default function DietaryFormModal({
  isOpen,
  isEditMode,
  formData,
  onClose,
  onSave,
  onChange,
}: DietaryFormModalProps): JSX.Element | null {
  if (!isOpen) return null;

  const isFormValid = formData.name && formData.description;

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
              value={formData.name ?? ''}
              onChange={(e) => onChange({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-[var(--color-primary-500)] focus:outline-none"
              placeholder="Ví dụ: Ăn chay, Không gluten..."
            />
          </div>

          {/* Mô tả */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--color-table-text-primary)]">
              Mô tả <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description ?? ''}
              onChange={(e) =>
                onChange({ ...formData, description: e.target.value })
              }
              rows={4}
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-[var(--color-primary-500)] focus:outline-none"
              placeholder="Mô tả chi tiết về chế độ ăn..."
            />
            <p className="mt-1 text-xs text-[var(--color-table-text-secondary)]">
              Mô tả các đặc điểm, hạn chế và lưu ý của chế độ ăn
            </p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-[var(--color-table-text-secondary)] transition-colors hover:bg-gray-100"
          >
            Hủy
          </button>
          <button
            onClick={onSave}
            disabled={!isFormValid}
            className="rounded-lg bg-[var(--color-primary-600)] px-4 py-2 font-semibold text-white transition-colors hover:bg-[var(--color-primary-700)] disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isEditMode ? 'Cập nhật' : 'Thêm mới'}
          </button>
        </div>
      </div>
    </div>
  );
}
