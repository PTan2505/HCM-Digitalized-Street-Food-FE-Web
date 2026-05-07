import type { JSX } from 'react';

export type OrderStatusType =
  | 'success'
  | 'error'
  | 'warning'
  | 'default'
  | 'info';

export const getOrderStatusMeta = (
  status: number
): {
  label: string;
  type: OrderStatusType;
} => {
  if (status === 0) return { label: 'Chờ xử lý', type: 'warning' };
  if (status === 1) return { label: 'Chờ xác nhận', type: 'warning' };
  if (status === 2) return { label: 'Đã thanh toán', type: 'info' };
  if (status === 3) return { label: 'Đã hủy', type: 'error' };
  if (status === 4) return { label: 'Hoàn tất', type: 'success' };
  if (status === 5) return { label: 'Đã hết hạn', type: 'default' };
  return { label: 'Không xác định', type: 'default' };
};

export const canDecideOrder = (status: number): boolean => status === 1;

export const OrderStatusBadge = ({
  label,
  type,
}: {
  label: string;
  type: OrderStatusType;
}): JSX.Element => {
  const colors = {
    success: 'bg-green-100 text-green-700 border-green-200',
    error: 'bg-red-100 text-red-700 border-red-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    info: 'bg-blue-100 text-blue-700 border-blue-200',
  };

  return (
    <span
      className={`inline-flex min-w-27.5 items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-bold shadow-sm ${colors[type]}`}
    >
      {label}
    </span>
  );
};
