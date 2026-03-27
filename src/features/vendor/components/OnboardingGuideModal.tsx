import type { JSX } from 'react';
import { Dialog, DialogContent } from '@mui/material';
import { Link } from 'react-router-dom';
import { ROUTES } from '@constants/routes';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

interface OnboardingGuideModalProps {
  open: boolean;
  onClose: () => void;
}

export default function OnboardingGuideModal({
  open,
  onClose,
}: OnboardingGuideModalProps): JSX.Element {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12)',
        },
      }}
    >
      <DialogContent className="p-0">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-[#7ab82d] to-[#9fd356] px-6 py-8">
          <h2 className="mb-2 text-2xl font-bold text-white">
            Chào mừng bạn đến với Lowca!
          </h2>
          <p className="text-opacity-90 text-sm text-white">
            Khám phá những tính năng tuyệt vời cho cửa hàng của bạn
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6 px-6 py-8">
          {/* Feature 1 */}
          <div className="flex gap-4">
            <div className="mt-1 flex-shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                <CheckCircleIcon className="h-5 w-5 text-[#7ab82d]" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="mb-1 text-base font-semibold text-gray-900">
                Đăng ký cửa hàng để trở thành Vendor tại đây
              </h3>
              <p className="text-sm leading-relaxed text-gray-600">
                Quản lý chi nhánh, thêm menu, quản lý thời gian hoạt động và cập
                nhật các thông tin khác (nếu đã được duyệt).
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100" />

          {/* Feature 2 */}
          <div className="flex gap-4">
            <div className="mt-1 flex-shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                <CheckCircleIcon className="h-5 w-5 text-[#7ab82d]" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="mb-1 text-base font-semibold text-gray-900">
                Xác nhận quyền sở hữu chi nhánh
              </h3>
              <p className="text-sm leading-relaxed text-gray-600">
                Nếu bạn đã có chi nhánh trên hệ thống,{' '}
                <Link
                  to={`${ROUTES.VENDOR.BASE}/${ROUTES.VENDOR.PATHS.GHOST_PIN}`}
                  onClick={onClose}
                  className="font-semibold text-[#7ab82d] transition-colors hover:text-[#5f9324]"
                >
                  xác nhận quyền sở hữu ở đây
                </Link>
                .
              </p>
            </div>
          </div>
        </div>

        {/* Footer with button */}
        <div className="border-t border-gray-100 bg-gray-50 px-6 py-6">
          <button
            onClick={onClose}
            className="w-full cursor-pointer rounded-lg bg-gradient-to-r from-[#7ab82d] to-[#9fd356] px-4 py-3 font-semibold text-white shadow-sm transition-all duration-200 hover:from-[#5f9324] hover:to-[#7ab82d] hover:shadow-md active:scale-95"
          >
            Đã hiểu
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
