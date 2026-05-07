import { useEffect, useMemo, useRef, useState } from 'react';
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
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import VendorModalHeader from '@features/vendor/components/VendorModalHeader';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number | null;
  onUpdateOrderTable?: (orderId: number, table: string) => Promise<void>;
  tableAutoEditKey?: number;
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

const getMoneyLocationLabel = (location: string | null | undefined): string => {
  switch (location) {
    case 'systemKeep':
      return 'Hệ thống đang giữ';
    case 'transToVendor':
      return 'Đã chuyển tới Vendor';
    case 'refundToCustomer':
      return 'Đã hoàn lại cho khách hàng';
    case 'notPaid':
      return 'Chưa thanh toán';
    default:
      return location ?? '-';
  }
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
  onUpdateOrderTable,
  tableAutoEditKey,
}: OrderDetailsModalProps): JSX.Element | null {
  const order = useAppSelector(selectSelectedOrder);
  const status = useAppSelector(selectOrderStatus);

  const { onGetOrderDetails, onDecideVendorOrder, onCompleteVendorOrder } =
    useOrder();
  const [verificationCode, setVerificationCode] = useState('');
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);
  const [isSubmittingComplete, setIsSubmittingComplete] = useState(false);

  // Table editing state
  const [isEditingTable, setIsEditingTable] = useState(false);
  const [tableDraft, setTableDraft] = useState('');
  const [isSavingTable, setIsSavingTable] = useState(false);
  const lastAutoEditKeyRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen || !orderId) return;
    setVerificationCode('');
    void onGetOrderDetails(orderId);
  }, [isOpen, orderId, onGetOrderDetails]);

  // Reset table edit state when order changes
  useEffect(() => {
    if (!order) {
      setIsEditingTable(false);
      setTableDraft('');
      setIsSavingTable(false);
      return;
    }
    setIsEditingTable(false);
    setTableDraft(order.table?.trim() ?? '');
  }, [order]);

  // Auto-open table edit when tableAutoEditKey changes
  useEffect(() => {
    if (
      !order ||
      order.isTakeAway ||
      tableAutoEditKey === undefined ||
      !onUpdateOrderTable
    ) {
      return;
    }

    if (lastAutoEditKeyRef.current === tableAutoEditKey) {
      return;
    }

    lastAutoEditKeyRef.current = tableAutoEditKey;

    if (order.table?.trim()) {
      return;
    }

    setIsEditingTable(true);
    setTableDraft(order.table?.trim() ?? '');
  }, [order, tableAutoEditKey, onUpdateOrderTable]);

  const canEditTable =
    order !== null && !order.isTakeAway && !!onUpdateOrderTable;

  const handleStartEditTable = (): void => {
    if (!canEditTable || !order) return;
    setTableDraft(order.table?.trim() ?? '');
    setIsEditingTable(true);
  };

  const handleCancelEditTable = (): void => {
    setTableDraft(order?.table?.trim() ?? '');
    setIsEditingTable(false);
  };

  const handleSaveTable = async (): Promise<void> => {
    if (!order || isSavingTable || !onUpdateOrderTable) return;
    const sanitizedTable = tableDraft.trim();
    if (sanitizedTable.length === 0) return;
    setIsSavingTable(true);
    try {
      await onUpdateOrderTable(order.orderId, sanitizedTable);
      setIsEditingTable(false);
    } finally {
      setIsSavingTable(false);
    }
  };

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
        {/* ── Header ─────────────────────────────────────────────── */}
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

                {/* Table edit row — only shown when onUpdateOrderTable is provided */}
                {!order.isTakeAway && onUpdateOrderTable ? (
                  <div className="mt-3 rounded-lg border border-gray-200/60 bg-white px-3 py-2.5">
                    <p className="mb-1 text-xs font-bold tracking-wide text-gray-500 uppercase">
                      Bàn
                    </p>
                    {isEditingTable ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          value={tableDraft}
                          onChange={(e) => setTableDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              void handleSaveTable();
                            }
                            if (e.key === 'Escape') {
                              e.preventDefault();
                              handleCancelEditTable();
                            }
                          }}
                          className="focus:border-primary-500 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm outline-none"
                          autoFocus
                          disabled={isSavingTable}
                        />
                        <button
                          type="button"
                          onClick={() => void handleSaveTable()}
                          disabled={
                            isSavingTable || tableDraft.trim().length === 0
                          }
                          className="inline-flex h-7 w-7 items-center justify-center text-green-700 transition-colors hover:text-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <CheckIcon sx={{ fontSize: 18, color: '#166534' }} />
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEditTable}
                          disabled={isSavingTable}
                          className="inline-flex h-7 w-7 items-center justify-center text-red-700 transition-colors hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <CloseIcon sx={{ fontSize: 18, color: '#b91c1c' }} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-gray-800">
                          {order.table?.trim() ? order.table.trim() : '-'}
                        </span>
                        {canEditTable ? (
                          <button
                            type="button"
                            onClick={handleStartEditTable}
                            className="inline-flex h-6 w-6 items-center justify-center text-gray-500 transition-colors hover:text-gray-700"
                          >
                            <EditIcon sx={{ fontSize: 16 }} />
                          </button>
                        ) : null}
                      </div>
                    )}
                  </div>
                ) : null}

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
                  {order.appliedVoucherCode?.trim() ? (
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Mã voucher:</span>
                      <span className="rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
                        {order.appliedVoucherCode.trim()}
                      </span>
                    </div>
                  ) : null}
                  {order.appliedVoucherName?.trim() ? (
                    <div className="flex justify-between gap-3 text-sm text-gray-600">
                      <span>Tên voucher:</span>
                      <span className="text-right font-medium text-gray-700">
                        {order.appliedVoucherName.trim()}
                      </span>
                    </div>
                  ) : null}
                  {order.discountAmount && order.discountAmount > 0 ? (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Giảm giá:</span>
                      <span>-{formatCurrencyVnd(order.discountAmount)}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between border-t border-gray-200 pt-2 text-sm text-gray-600">
                    <span>Thành tiền:</span>
                    <span className="font-semibold">
                      {formatCurrencyVnd(order.finalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Phí hệ thống:</span>
                    <span className="text-red-500">
                      -{formatCurrencyVnd(order.platformFee)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-dashed border-gray-200 pt-3 text-lg font-bold text-gray-900">
                    <span className="text-primary-700">Tiền nhận được:</span>
                    <span className="text-primary-700 underline decoration-2 underline-offset-4">
                      {formatCurrencyVnd(order.vendorPayout)}
                    </span>
                  </div>
                  {order.moneyLocation && (
                    <div className="mt-2 flex justify-end text-xs text-gray-500 italic">
                      <span className="font-medium text-gray-700">
                        {getMoneyLocationLabel(order.moneyLocation)}
                      </span>
                    </div>
                  )}
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

        {/* ── Footer ─────────────────────────────────────────────── */}
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
