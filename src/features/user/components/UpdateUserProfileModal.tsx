import type { JSX } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import UserProfileForm from './UserProfileForm';

interface UpdateUserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UpdateUserProfileModal({
  isOpen,
  onClose,
}: UpdateUserProfileModalProps): JSX.Element | null {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 transition-opacity"
      onClick={onClose}
    >
      <div
        className="mx-4 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-8 py-5">
          <div>
            <h2 className="text-xl font-bold text-[var(--color-table-text-primary)] md:text-2xl">
              Thông tin cá nhân
            </h2>
            <p className="mt-1 text-sm font-medium text-[var(--color-table-text-secondary)]">
              Quản lý và cập nhật hồ sơ của bạn
            </p>
          </div>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              bgcolor: 'white',
              border: '1px solid #f3f4f6',
              '&:hover': { bgcolor: '#f3f4f6' },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto px-8 pt-6 pb-8">
          <UserProfileForm
            onSuccess={onClose}
            hideLogout={true}
            isModal={true}
          />
        </div>
      </div>
    </div>
  );
}
