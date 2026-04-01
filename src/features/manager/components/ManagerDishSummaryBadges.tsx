import type { JSX } from 'react';

interface ManagerDishSummaryBadgesProps {
  totalOnPage: number;
  assignedCount: number;
  selectedCount: number;
}

export default function ManagerDishSummaryBadges({
  totalOnPage,
  assignedCount,
  selectedCount,
}: ManagerDishSummaryBadgesProps): JSX.Element {
  return (
    <div className="flex flex-wrap gap-3">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
        Tổng: {totalOnPage} món trên trang
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
        Đã gán: {assignedCount} món
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">
        <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
        Đang chọn: {selectedCount} món
      </span>
    </div>
  );
}
