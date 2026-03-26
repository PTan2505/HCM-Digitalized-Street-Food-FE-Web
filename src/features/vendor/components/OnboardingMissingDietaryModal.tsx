import type { JSX } from 'react';
import { Dialog, DialogContent } from '@mui/material';
import { Link } from 'react-router-dom';
import { ROUTES } from '@constants/routes';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface OnboardingMissingDietaryModalProps {
  open: boolean;
  onClose: () => void;
}

export default function OnboardingMissingDietaryModal({
  open,
  onClose,
}: OnboardingMissingDietaryModalProps): JSX.Element {
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
        <div className="bg-gradient-to-r from-[#f59e0b] to-[#f97316] px-6 py-8">
          <h2 className="mb-2 text-2xl font-bold text-white">
            Cập nhật chế độ ăn của cửa hàng
          </h2>
          <p className="text-opacity-90 text-sm text-white">
            Hãy hoàn thành bước quan trọng này để cập nhật đầy đủ thông tin,
            giúp người dùng tìm kiếm dễ dàng hơn
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6 px-6 py-8">
          {/* Alert Icon */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                <ExclamationTriangleIcon className="h-6 w-6 text-[#f59e0b]" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="mb-2 text-base font-semibold text-gray-900">
                Chưa cấu hình chế độ ăn
              </h3>
              <p className="text-sm leading-relaxed text-gray-600">
                Vui lòng chọn các chế độ ăn mà cửa hàng của bạn đang phục vụ.
                Điều này giúp khách hàng dễ dàng tìm thấy các món ăn phù hợp với
                nhu cầu của họ.
              </p>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="rounded-lg bg-blue-50 p-4">
            <h4 className="mb-3 text-sm font-semibold text-blue-900">
              Lợi ích:
            </h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600" />
                <span>
                  Tăng khả năng hiển thị cho các nhóm khách hàng cụ thể
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600" />
                <span>Cải thiện trải nghiệm tìm kiếm của khách hàng</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600" />
                <span>Phù hợp hơn với nhu cầu dinh dưỡng của khách</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer with button */}
        <div className="border-t border-gray-100 bg-gray-50 px-6 py-6">
          {/* <Link
            to={`${ROUTES.VENDOR.BASE}/${ROUTES.VENDOR.PATHS.DIETARY}`}
            onClick={onClose}
            className="mb-3 block w-full rounded-lg bg-gradient-to-r from-[#f59e0b] to-[#f97316] px-4 py-3 text-center font-semibold text-white shadow-sm transition-all duration-200 hover:from-[#d97706] hover:to-[#ea580c] hover:shadow-md active:scale-95"
          >
            Cập nhật ngay
          </Link> */}
          <button
            onClick={onClose}
            className="w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            Đã hiểu
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
