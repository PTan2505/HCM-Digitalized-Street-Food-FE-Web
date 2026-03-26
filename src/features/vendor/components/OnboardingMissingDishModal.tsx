import type { JSX } from 'react';
import { Dialog, DialogContent } from '@mui/material';
import { Link } from 'react-router-dom';
import { ROUTES } from '@constants/routes';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface OnboardingMissingDishModalProps {
  open: boolean;
  onClose: () => void;
}

export default function OnboardingMissingDishModal({
  open,
  onClose,
}: OnboardingMissingDishModalProps): JSX.Element {
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
        <div className="bg-linear-to-r from-[#0ea5e9] to-[#2563eb] px-6 py-8">
          <h2 className="mb-2 text-2xl font-bold text-white">
            Cập nhật món ăn của cửa hàng
          </h2>
          <p className="text-sm text-white/90">
            Hãy thêm món ăn đầu tiên để cửa hàng bắt đầu hiển thị đầy đủ với
            khách hàng.
          </p>
        </div>

        <div className="space-y-6 px-6 py-8">
          <div className="flex items-start gap-4">
            <div className="shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100">
                <ExclamationTriangleIcon className="h-6 w-6 text-sky-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="mb-2 text-base font-semibold text-gray-900">
                Chưa có món ăn nào
              </h3>
              <p className="text-sm leading-relaxed text-gray-600">
                Vui lòng thêm ít nhất một món ăn để khách hàng có thể xem menu
                và đặt hàng từ cửa hàng của bạn.
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-sky-50 p-4">
            <h4 className="mb-3 text-sm font-semibold text-sky-900">
              Lợi ích:
            </h4>
            <ul className="space-y-2 text-sm text-sky-800">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-600" />
                <span>Tăng khả năng hiển thị trong kết quả tìm kiếm</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-600" />
                <span>Khách hàng có thể xem chi tiết menu và giá</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-600" />
                <span>Tăng cơ hội nhận đơn hàng mới</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 bg-gray-50 px-6 py-6">
          {/* <Link
            to={`${ROUTES.VENDOR.BASE}/${ROUTES.VENDOR.PATHS.DISH}`}
            onClick={onClose}
            className="mb-3 block w-full rounded-lg bg-linear-to-r from-[#0ea5e9] to-[#2563eb] px-4 py-3 text-center font-semibold text-white shadow-sm transition-all duration-200 hover:from-[#0284c7] hover:to-[#1d4ed8] hover:shadow-md active:scale-95"
          >
            Thêm món ngay
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
