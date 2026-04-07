import type { JSX } from 'react';
import { Dialog, DialogContent } from '@mui/material';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import type { Branch } from '@features/vendor/types/vendor';

interface OnboardingMissingBranchDishModalProps {
  open: boolean;
  missingBranches: Branch[];
  onClose: () => void;
}

export default function OnboardingMissingBranchDishModal({
  open,
  missingBranches,
  onClose,
}: OnboardingMissingBranchDishModalProps): JSX.Element {
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
        <div className="bg-linear-to-r from-[#f97316] to-[#dc2626] px-6 py-8">
          <h2 className="mb-2 text-2xl font-bold text-white">
            Chi nhánh chưa có món ăn
          </h2>
          <p className="text-sm text-white/90">
            Một số chi nhánh đã thanh toán nhưng chưa được gán món ăn nào. Hãy
            cập nhật menu để khách hàng có thể đặt hàng.
          </p>
        </div>

        <div className="space-y-6 px-6 py-8">
          <div className="flex items-start gap-4">
            <div className="shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="mb-2 text-base font-semibold text-gray-900">
                Chi nhánh chưa được gán món ăn
              </h3>
              <p className="text-sm leading-relaxed text-gray-600">
                Các chi nhánh sau đã thanh toán gói dịch vụ nhưng chưa có món ăn
                nào trong menu. Vui lòng vào{' '}
                <span className="font-semibold text-orange-600">
                  Quản lý chi nhánh → Quản lý menu
                </span>{' '}
                để gán món ăn cho từng chi nhánh.
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-orange-50 p-4">
            <h4 className="mb-3 text-sm font-semibold text-orange-900">
              Các chi nhánh cần cập nhật ({missingBranches.length}):
            </h4>
            <ul className="space-y-2 text-sm text-orange-800">
              {missingBranches.map((branch) => (
                <li key={branch.branchId} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-600" />
                  <span>
                    <span className="font-semibold">{branch.name}</span>
                    {branch.addressDetail
                      ? ` — ${branch.addressDetail}${branch.ward ? `, ${branch.ward}` : ''}${branch.city ? `, ${branch.city}` : ''}`
                      : ''}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg bg-amber-50 p-4">
            <h4 className="mb-3 text-sm font-semibold text-amber-900">
              Tại sao cần cập nhật?
            </h4>
            <ul className="space-y-2 text-sm text-amber-800">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600" />
                <span>
                  Chi nhánh không có món ăn sẽ không hiển thị menu với khách
                  hàng
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600" />
                <span>Khách hàng không thể đặt hàng từ chi nhánh này</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600" />
                <span>Lãng phí gói dịch vụ đã đăng ký</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 bg-gray-50 px-6 py-6">
          <button
            onClick={onClose}
            className="w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            Đã hiểu, sẽ cập nhật ngay
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
