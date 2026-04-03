import { useEffect, useMemo, useState } from 'react';
import type { JSX } from 'react';
import useOrder from '@features/vendor/hooks/useOrder';
import {
  getOrderStatusMeta,
  OrderStatusBadge,
} from '@features/vendor/components/OrderStatusBadge';
import { useAppSelector } from '@hooks/reduxHooks';
import { selectSelectedOrder, selectOrderStatus } from '@slices/order';
import CloseIcon from '@mui/icons-material/Close';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';

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

  // Fetch details khi modal mở
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
      await onDecideVendorOrder({
        orderId: order.orderId,
        approve,
      });
      await onGetOrderDetails(order.orderId);
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  const handleVerificationCodeChange = (value: string): void => {
    const sanitizedCode = value.replace(/\D/g, '').slice(0, 6);
    setVerificationCode(sanitizedCode);
  };

  const handleCompleteOrder = async (): Promise<void> => {
    if (!order || verificationCode.length !== 6) return;

    setIsSubmittingComplete(true);

    try {
      await onCompleteVendorOrder({
        orderId: order.orderId,
        verificationCode,
      });
      await onGetOrderDetails(order.orderId);
      setVerificationCode('');
    } finally {
      setIsSubmittingComplete(false);
    }
  };

  const getOrderStatusText = (statusCode: number): string => {
    switch (statusCode) {
      case 0:
        return 'Chờ xử lý';
      case 1:
        return 'Chờ xác nhận';
      case 2:
        return 'Đã thanh toán';
      case 3:
        return 'Đã hủy';
      case 4:
        return 'Hoàn tất';
      default:
        return 'Không xác định';
    }
  };

  const getPaymentMethodText = (method: string | null): string => {
    if (!method) return 'Không xác định';
    if (method.toLowerCase() === 'cash') return 'Tiền mặt';
    if (method.toLowerCase() === 'banking') return 'Chuyển khoản';
    return method;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 transition-opacity"
      onClick={onClose}
    >
      <div
        className="mx-4 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/60 px-6 py-4">
          <div className="min-w-0">
            <p className="text-primary-700 mb-1 text-xs font-semibold tracking-wide uppercase">
              Chi tiết đơn hàng
            </p>
            <h2 className="text-table-text-primary text-lg leading-tight font-bold">
              {order
                ? `#${order.orderId.toString()} - ${order.branchName}`
                : '—'}
            </h2>
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <CircularProgress size={32} />
            </div>
          ) : !order ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">
              Không tìm thấy thông tin đơn hàng.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Order summary */}
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary-100 text-primary-700 flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold">
                      {order.userName?.trim().charAt(0).toUpperCase() ?? 'K'}
                    </div>
                    <div>
                      <div className="text-table-text-primary text-sm font-semibold">
                        {order.userName ?? 'Khách hàng'}
                      </div>
                      <div className="text-xs text-gray-500">Người đặt</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-500">
                      {formatDateTime(order.createdAt)}
                    </div>
                    <OrderStatusBadge
                      label={statusMeta.label}
                      type={statusMeta.type}
                    />
                  </div>
                </div>

                {/* Details grid */}
                <div className="mb-4 grid grid-cols-2 gap-4 rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm">
                  <div>
                    <span className="mb-1 block text-xs text-gray-500">
                      Hình thức
                    </span>
                    <span className="font-semibold text-gray-800">
                      {order.isTakeAway
                        ? 'Mang đi'
                        : `Tại bàn ${order.table ?? '-'}`}
                    </span>
                  </div>
                  <div>
                    <span className="mb-1 block text-xs text-gray-500">
                      Thanh toán
                    </span>
                    <span className="font-semibold text-gray-800">
                      {getPaymentMethodText(order.paymentMethod)}
                    </span>
                  </div>
                </div>

                {/* Amount summary */}
                <div className="flex flex-col gap-2 border-b border-gray-100 pb-4">
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
                  <div className="flex justify-between pt-1 text-base font-bold text-gray-900">
                    <span>Thành tiền:</span>
                    <span className="text-primary-600">
                      {formatCurrencyVnd(order.finalAmount)}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mt-4">
                  <p className="mb-3 text-sm font-semibold text-gray-800">
                    Danh sách món ({order.items.length})
                  </p>
                  <div className="space-y-3">
                    {order.items.map((item, idx) => {
                      const itemPrice = item.price ?? item.unitPrice ?? 0;
                      return (
                        <div
                          key={idx}
                          className="flex items-start justify-between gap-3 rounded-lg border border-gray-100 bg-white p-3 shadow-sm"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-800">
                              {item.dishName}
                            </p>
                            <p className="mt-0.5 text-xs text-gray-500">
                              {formatCurrencyVnd(itemPrice)} x {item.quantity}
                            </p>
                          </div>
                          <div className="text-sm font-semibold text-gray-900">
                            {formatCurrencyVnd(itemPrice * item.quantity)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Order actions */}
              <div className="bg-primary-50 border-primary-100 space-y-3 rounded-xl border p-4">
                <p className="text-primary-700 mb-1 text-xs font-semibold tracking-wide uppercase">
                  Thao tác đơn hàng
                </p>

                {order.status === 1 ? (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        void handleDecision(true);
                      }}
                      disabled={isSubmittingDecision || isSubmittingComplete}
                      className="bg-primary-600 hover:bg-primary-700 inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmittingDecision ? 'Đang xử lý...' : 'Chấp nhận'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        void handleDecision(false);
                      }}
                      disabled={isSubmittingDecision || isSubmittingComplete}
                      className="inline-flex h-10 items-center justify-center rounded-lg border border-red-200 bg-red-50 px-4 text-sm font-bold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmittingDecision ? 'Đang xử lý...' : 'Từ chối'}
                    </button>
                  </div>
                ) : null}

                {order.status === 2 ? (
                  <div className="space-y-2 pt-1">
                    <p className="text-xs font-semibold text-gray-600">
                      Vui lòng nhập 6 số xác thực từ khách hàng để hoàn tất đơn:
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(event) => {
                          handleVerificationCodeChange(event.target.value);
                        }}
                        maxLength={6}
                        inputMode="numeric"
                        placeholder="Nhập 6 chữ số"
                        disabled={isSubmittingComplete || isSubmittingDecision}
                        className="focus:border-primary-500 focus:ring-primary-200 h-10 min-w-52 rounded-lg border border-gray-300 bg-white px-3 text-sm font-semibold tracking-[0.15em] text-gray-800 outline-none placeholder:tracking-normal placeholder:text-gray-400 focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-100"
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
                        className="bg-primary-600 hover:bg-primary-700 inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSubmittingComplete
                          ? 'Đang hoàn tất...'
                          : 'Hoàn tất đơn'}
                      </button>
                    </div>
                  </div>
                ) : null}

                {order.status === 3 || order.status === 4 ? (
                  <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-4 py-3 shadow-sm">
                    <span className="text-sm font-medium text-gray-600">
                      Trạng thái xử lý:
                    </span>
                    <OrderStatusBadge
                      label={getOrderStatusText(order.status)}
                      type={statusMeta.type}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
