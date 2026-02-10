import type { JSX } from 'react';
import { Avatar } from '@mui/material';

interface BadgeFormData {
  badgeName?: string;
  pointToGet?: number;
  iconUrl?: string;
  description?: string;
}

interface BadgeFormModalProps {
  isOpen: boolean;
  isEditMode: boolean;
  formData: BadgeFormData;
  onClose: () => void;
  onSave: () => void;
  onChange: (data: BadgeFormData) => void;
}

export default function BadgeFormModal({
  isOpen,
  isEditMode,
  formData,
  onClose,
  onSave,
  onChange,
}: BadgeFormModalProps): JSX.Element | null {
  if (!isOpen) return null;

  const isFormValid =
    formData.badgeName &&
    formData.pointToGet &&
    formData.iconUrl &&
    formData.description;

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
            {isEditMode ? 'Chỉnh sửa Badge' : 'Thêm Badge mới'}
          </h2>
        </div>

        {/* Modal Content */}
        <div className="space-y-4 px-6 py-4">
          {/* Tên Badge */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--color-table-text-primary)]">
              Tên Badge <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.badgeName ?? ''}
              onChange={(e) =>
                onChange({ ...formData, badgeName: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-[var(--color-primary-500)] focus:outline-none"
              placeholder="Tên Badge"
            />
          </div>

          {/* Điểm yêu cầu */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--color-table-text-primary)]">
              Điểm yêu cầu <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.pointToGet ?? 0}
              onChange={(e) =>
                onChange({ ...formData, pointToGet: Number(e.target.value) })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-[var(--color-primary-500)] focus:outline-none"
              placeholder="0"
            />
          </div>

          {/* URL Icon */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--color-table-text-primary)]">
              URL Icon <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.iconUrl ?? ''}
              onChange={(e) =>
                onChange({ ...formData, iconUrl: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-[var(--color-primary-500)] focus:outline-none"
              placeholder="URL Icon"
            />
            <p className="mt-1 text-xs text-[var(--color-table-text-secondary)]">
              Nhập URL hình ảnh icon
            </p>
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
              rows={3}
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-[var(--color-primary-500)] focus:outline-none"
              placeholder="Mô tả"
            />
          </div>

          {/* Preview */}
          {formData.iconUrl && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--color-table-text-secondary)]">
                Preview:
              </span>
              <Avatar
                src={formData.iconUrl}
                alt="Preview"
                sx={{ width: 48, height: 48 }}
              />
            </div>
          )}
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
