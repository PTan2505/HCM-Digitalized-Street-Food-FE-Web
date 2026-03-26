import type { JSX } from 'react';
import { Dialog, DialogContent } from '@mui/material';
import { Link } from 'react-router-dom';
import { ROUTES } from '@constants/routes';
import type { Branch } from '@features/vendor/types/vendor';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface OnboardingMissingBranchModalProps {
  open: boolean;
  missingBranches: Branch[];
  onClose: () => void;
}

export default function OnboardingMissingBranchModal({
  open,
  missingBranches,
  onClose,
}: OnboardingMissingBranchModalProps): JSX.Element {
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
        <div className="bg-linear-to-r from-[#14b8a6] to-[#0f766e] px-6 py-8">
          <h2 className="mb-2 text-2xl font-bold text-white">
            Cập nhật thời gian hoạt động
          </h2>
          <p className="text-sm text-white/90">
            Một số chi nhánh chưa có lịch hoạt động. Hãy cập nhật để khách hàng
            biết thời gian phục vụ của quán.
          </p>
        </div>

        <div className="space-y-6 px-6 py-8">
          <div className="flex items-start gap-4">
            <div className="shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100">
                <ExclamationTriangleIcon className="h-6 w-6 text-teal-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="mb-2 text-base font-semibold text-gray-900">
                Chi nhánh chưa cập nhật lịch
              </h3>
              <p className="text-sm leading-relaxed text-gray-600">
                Vui lòng vào quản lý chi nhánh và thêm thời gian hoạt động cho
                các chi nhánh sau:
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-teal-50 p-4">
            <ul className="space-y-2 text-sm text-teal-900">
              {missingBranches.map((branch) => (
                <li key={branch.branchId} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600" />
                  <span>
                    {branch.name} - {branch.addressDetail}, {branch.ward},{' '}
                    {branch.city}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 bg-gray-50 px-6 py-6">
          {/* <Link
            to={`${ROUTES.VENDOR.BASE}/${ROUTES.VENDOR.PATHS.BRANCH}`}
            onClick={onClose}
            className="mb-3 block w-full rounded-lg bg-linear-to-r from-[#14b8a6] to-[#0f766e] px-4 py-3 text-center font-semibold text-white shadow-sm transition-all duration-200 hover:from-[#0d9488] hover:to-[#115e59] hover:shadow-md active:scale-95"
          >
            Cập nhật ngay
          </Link> */}
          <button
            onClick={onClose}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            Đã hiểu
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
