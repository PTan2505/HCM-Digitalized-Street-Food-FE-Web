import { useEffect, useMemo, useState } from 'react';
import type { JSX } from 'react';
import useOrder from '@features/vendor/hooks/useOrder';
import {
  getOrderStatusMeta,
  OrderStatusBadge,
} from '@features/vendor/components/OrderStatusBadge';
import { useAppSelector } from '@hooks/reduxHooks';
import { selectSelectedOrder, selectOrderStatus } from '@slices/order';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CircularProgress from '@mui/material/CircularProgress';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VendorModalHeader from '@features/vendor/components/VendorModalHeader';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number | null;
}

const formatDateTime = (value?: string | null): string => {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '-';
  return parsed.toLocaleString('vi-VN');
};

const formatCurrencyVnd = (value?: number | null): string => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '0 VND';
  }
  return `${value.toLocaleString('vi-VN')} VND`;
};

const SectionHeading = ({
  dotColor,
  children,
}: {
  dotColor: string;
  children: React.ReactNode;
}): JSX.Element => (
  <h3 className="mb-4 flex items-center gap-2 text-sm font-bold tracking-wider text-gray-800 uppercase">
    <span className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />
    {children}
  </h3>
);

export default function OrderDetailsModal({
  isOpen,
  onClose,
  orderId,
}: OrderDetailsModalProps): JSX.Element | null {
  const order = useAppSelector(selectSelectedOrder);
  const status = useAppSelector(selectOrderStatus);

  const { onGetOrderDetails, onDecideVendorOrder, onCompleteVendorOrder } =
    useOrder();
  const [verificationCode, setVerificationCode] = useState('');
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);
  const [isSubmittingComplete, setIsSubmittingComplete] = useState(false);

  useEffect(() => {
    if (!isOpen || !orderId) return;
    setVerificationCode('');
    void onGetOrderDetails(orderId);
  }, [isOpen, orderId, onGetOrderDetails]);

  const isLoading = status === 'pending' && order?.orderId !== orderId;

  const statusMeta = useMemo(() => {
    if (!order) return getOrderStatusMeta(-1);
    return getOrderStatusMeta(order.status);
  }, [order]);

  const handleDecision = async (approve: boolean): Promise<void> => {
    if (!order) return;
    setIsSubmittingDecision(true);
    try {
      await onDecideVendorOrder({ orderId: order.orderId, approve });
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  const handleVerificationCodeChange = (value: string): void => {
    setVerificationCode(value.replace(/\D/g, '').slice(0, 6));
  };

  const handleCompleteOrder = async (): Promise<void> => {
    if (!order || verificationCode.length !== 6) return;
    setIsSubmittingComplete(true);
    try {
      await onCompleteVendorOrder({ orderId: order.orderId, verificationCode });
      setVerificationCode('');
    } finally {
      setIsSubmittingComplete(false);
    }
  };

  if (!isOpen) return null;

  const needsAction = order && (order.status === 1 || order.status === 2);

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 transition-opacity"
      onClick={onClose}
    >
      <div
        className="mx-4 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header (giống BranchDetailsModal) ─────────────────── */}
        <VendorModalHeader
          title="Chi tiết đơn hàng"
          subtitle={order?.branchName ?? '—'}
          icon={<ReceiptLongIcon />}
          iconTone="order"
          onClose={onClose}
          rightActions={
            order ? (
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-500">
                  #{order.orderId}
                </span>
                <OrderStatusBadge
                  label={statusMeta.label}
                  type={statusMeta.type}
                />
              </div>
            ) : undefined
          }
        />

        {/* ── Body ──────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <CircularProgress size={32} />
            </div>
          ) : !order ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">
              Không tìm thấy thông tin đơn hàng.
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* ── Thông tin khách & thời gian ──────────────────── */}
              <div className="rounded-xl border border-gray-100 bg-slate-50/50 p-5 shadow-sm">
                <SectionHeading dotColor="bg-blue-500">
                  Thông tin đơn
                </SectionHeading>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  {/* Avatar + tên */}
                  <div className="flex items-center gap-3">
                    <div className="bg-primary-100 text-primary-700 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-bold">
                      {order.userName?.trim().charAt(0).toUpperCase() ?? 'K'}
                    </div>
                    <div>
                      <div className="text-table-text-primary text-sm font-semibold">
                        {order.userName ?? 'Khách hàng'}
                      </div>
                      <div className="text-xs text-gray-500">Người đặt</div>
                    </div>
                  </div>
                  {/* Thời gian + hình thức */}
                  <div className="flex flex-col items-end gap-1.5">
                    <div className="flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-500">
                      <AccessTimeIcon sx={{ fontSize: 13 }} />
                      {formatDateTime(order.createdAt)}
                    </div>
                    <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                      {order.isTakeAway
                        ? 'Mang đi'
                        : `Tại bàn ${order.table ?? '-'}`}
                    </span>
                  </div>
                </div>
                {order.note?.trim() ? (
                  <div className="mt-3 rounded-lg border border-gray-200/60 bg-white px-3 py-2.5">
                    <p className="mb-0.5 text-xs font-bold tracking-wide text-gray-500 uppercase">
                      Ghi chú
                    </p>
                    <p className="text-sm text-gray-700">{order.note.trim()}</p>
                  </div>
                ) : null}
              </div>

              {/* ── Danh sách món ────────────────────────────────── */}
              <div className="rounded-xl border border-gray-100 bg-slate-50/50 p-5 shadow-sm">
                <SectionHeading dotColor="bg-amber-500">
                  Danh sách món ({order.items.length})
                </SectionHeading>
                <div className="space-y-2">
                  {order.items.map((item, idx) => {
                    const itemPrice = item.price ?? item.unitPrice ?? 0;
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 bg-white px-4 py-3 shadow-sm"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-gray-800">
                            {item.dishName}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-500">
                            {formatCurrencyVnd(itemPrice)} × {item.quantity}
                          </p>
                        </div>
                        <div className="shrink-0 text-sm font-bold text-gray-900">
                          {formatCurrencyVnd(itemPrice * item.quantity)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── Tổng tiền ────────────────────────────────────── */}
              <div className="rounded-xl border border-gray-100 bg-slate-50/50 p-5 shadow-sm">
                <SectionHeading dotColor="bg-green-500">
                  Tổng thanh toán
                </SectionHeading>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Tổng tiền món:</span>
                    <span>{formatCurrencyVnd(order.totalAmount)}</span>
                  </div>
                  {order.discountAmount && order.discountAmount > 0 ? (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Giảm giá:</span>
                      <span>-{formatCurrencyVnd(order.discountAmount)}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold text-gray-900">
                    <span>Thành tiền:</span>
                    <span className="text-primary-600">
                      {formatCurrencyVnd(order.finalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Thao tác (status 1 hoặc 2) ───────────────────── */}
              {needsAction && (
                <div className="rounded-xl border border-gray-100 bg-slate-50/50 p-5 shadow-sm">
                  <SectionHeading dotColor="bg-rose-500">
                    Thao tác đơn hàng
                  </SectionHeading>

                  {order.status === 1 && (
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          void handleDecision(true);
                        }}
                        disabled={isSubmittingDecision || isSubmittingComplete}
                        className="bg-primary-600 hover:bg-primary-700 inline-flex h-10 items-center justify-center rounded-lg px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSubmittingDecision ? 'Đang xử lý...' : 'Chấp nhận'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          void handleDecision(false);
                        }}
                        disabled={isSubmittingDecision || isSubmittingComplete}
                        className="inline-flex h-10 items-center justify-center rounded-lg border border-red-200 bg-red-50 px-5 text-sm font-bold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSubmittingDecision ? 'Đang xử lý...' : 'Từ chối'}
                      </button>
                    </div>
                  )}

                  {order.status === 2 && (
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-gray-600">
                        Vui lòng nhập 6 số xác thực từ khách hàng để hoàn tất
                        đơn:
                      </p>
                      <div className="flex flex-wrap items-center gap-3">
                        <input
                          type="text"
                          value={verificationCode}
                          onChange={(e) =>
                            handleVerificationCodeChange(e.target.value)
                          }
                          maxLength={6}
                          inputMode="numeric"
                          placeholder="Nhập 6 chữ số"
                          disabled={
                            isSubmittingComplete || isSubmittingDecision
                          }
                          className="focus:border-primary-500 focus:ring-primary-200 h-10 min-w-48 rounded-lg border border-gray-300 bg-white px-3 text-sm font-semibold tracking-[0.15em] text-gray-800 outline-none placeholder:tracking-normal placeholder:text-gray-400 focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-100"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            void handleCompleteOrder();
                          }}
                          disabled={
                            verificationCode.length !== 6 ||
                            isSubmittingComplete ||
                            isSubmittingDecision
                          }
                          className="bg-primary-600 hover:bg-primary-700 inline-flex h-10 items-center justify-center rounded-lg px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isSubmittingComplete
                            ? 'Đang hoàn tất...'
                            : 'Hoàn tất đơn'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer (giống BranchDetailsModal) ─────────────────── */}
        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-8 py-4">
          <div className="text-xs text-gray-400">
            {order ? `Mã đơn: #${order.orderId}` : ''}
          </div>
          <button
            onClick={onClose}
            type="button"
            className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--color-table-text-secondary)] transition-colors hover:bg-gray-100"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
