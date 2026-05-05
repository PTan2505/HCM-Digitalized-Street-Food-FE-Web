import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { useEffect, useRef, useState, type JSX } from 'react';
import type {
  ManagerOrder,
  ManagerOrderItem,
} from '@features/manager/types/orderManagement';
import {
  getOrderStatusMeta,
  OrderStatusBadge,
} from '@features/manager/components/OrderStatusBadge';
import VendorModalHeader from '@features/vendor/components/VendorModalHeader';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

const formatDateTime = (value: string | null | undefined): string => {
  if (!value) return '-';
  return new Date(value).toLocaleString('vi-VN');
};

const formatCurrency = (value: number | null | undefined): string => {
  if (typeof value !== 'number') return '-';
  return `${value.toLocaleString('vi-VN')}đ`;
};

const getOrderItemUnitPrice = (
  item: ManagerOrder['items'][number]
): number | null => {
  if (typeof item.unitPrice === 'number') {
    return item.unitPrice;
  }

  if (typeof item.price === 'number') {
    return item.price;
  }

  return null;
};

const getOrderItemAmount = (
  item: ManagerOrder['items'][number]
): number | null => {
  const itemAmountCandidates = [
    item.lineAmount,
    item.finalAmount,
    item.totalAmount,
    item.amount,
    item.subtotal,
  ];

  const amountFromCandidates = itemAmountCandidates.find(
    (amount) => typeof amount === 'number'
  );

  if (typeof amountFromCandidates === 'number') {
    return amountFromCandidates;
  }

  if (typeof item.unitPrice === 'number') {
    return item.unitPrice * item.quantity;
  }

  if (typeof item.price === 'number') {
    return item.price * item.quantity;
  }

  return null;
};

const getDisplayOrderItemAmount = (
  item: ManagerOrder['items'][number],
  order: ManagerOrder | null
): number | null => {
  const directItemAmount = getOrderItemAmount(item);
  if (typeof directItemAmount === 'number') {
    return directItemAmount;
  }

  if (!order) return null;

  if (order.items.length === 1 && typeof order.totalAmount === 'number') {
    return order.totalAmount;
  }

  return null;
};

export const OrderDetailDialog = ({
  detailOrder,
  onClose,
  onUpdateOrderTable,
  tableAutoEditKey,
  onDecideOrder,
  onCompleteOrder,
}: {
  detailOrder: ManagerOrder | null;
  onClose: () => void;
  onUpdateOrderTable: (orderId: number, table: string) => Promise<void>;
  tableAutoEditKey?: number;
  onDecideOrder: (orderId: number, approve: boolean) => Promise<void>;
  onCompleteOrder: (payload: {
    orderId: number;
    verificationCode: string;
  }) => Promise<unknown>;
}): JSX.Element => {
  const [isEditingTable, setIsEditingTable] = useState(false);
  const [tableDraft, setTableDraft] = useState('');
  const [isSavingTable, setIsSavingTable] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [orderIdInput, setOrderIdInput] = useState('');
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);
  const [isSubmittingComplete, setIsSubmittingComplete] = useState(false);
  const lastAutoEditKeyRef = useRef<number | null>(null);

  useEffect(() => {
    if (!detailOrder) {
      setIsEditingTable(false);
      setTableDraft('');
      setIsSavingTable(false);
      setVerificationCode('');
      setOrderIdInput('');
      setIsSubmittingDecision(false);
      setIsSubmittingComplete(false);
      return;
    }

    setIsEditingTable(false);
    setTableDraft(detailOrder.table?.trim() ?? '');
    setVerificationCode('');
    setOrderIdInput(String(detailOrder.orderId));
  }, [detailOrder]);

  useEffect(() => {
    if (
      !detailOrder ||
      detailOrder.isTakeAway ||
      tableAutoEditKey === undefined
    ) {
      return;
    }

    if (lastAutoEditKeyRef.current === tableAutoEditKey) {
      return;
    }

    lastAutoEditKeyRef.current = tableAutoEditKey;

    if (detailOrder.table?.trim()) {
      return;
    }

    setIsEditingTable(true);
    setTableDraft(detailOrder.table?.trim() ?? '');
  }, [detailOrder, tableAutoEditKey]);

  const canEditTable = detailOrder !== null && !detailOrder.isTakeAway;

  const handleStartEditTable = (): void => {
    if (!canEditTable || !detailOrder) return;
    setTableDraft(detailOrder.table?.trim() ?? '');
    setIsEditingTable(true);
  };

  const handleCancelEditTable = (): void => {
    setTableDraft(detailOrder?.table?.trim() ?? '');
    setIsEditingTable(false);
  };

  const handleSaveTable = async (): Promise<void> => {
    if (!detailOrder || isSavingTable) {
      return;
    }

    const sanitizedTable = tableDraft.trim();
    if (sanitizedTable.length === 0) {
      return;
    }

    setIsSavingTable(true);
    try {
      await onUpdateOrderTable(detailOrder.orderId, sanitizedTable);
      setIsEditingTable(false);
    } finally {
      setIsSavingTable(false);
    }
  };

  const handleDecision = async (approve: boolean): Promise<void> => {
    if (!detailOrder || isSubmittingDecision || isSubmittingComplete) {
      return;
    }

    setIsSubmittingDecision(true);
    try {
      await onDecideOrder(detailOrder.orderId, approve);
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  const handleVerificationCodeChange = (value: string): void => {
    setVerificationCode(value.replace(/\D/g, '').slice(0, 6));
  };

  const handleOrderIdChange = (value: string): void => {
    setOrderIdInput(value.replace(/\D/g, ''));
  };

  const handleCompleteOrder = async (): Promise<void> => {
    if (!detailOrder || isSubmittingComplete || isSubmittingDecision) {
      return;
    }

    const parsedOrderId = Number(orderIdInput);
    if (
      !Number.isInteger(parsedOrderId) ||
      parsedOrderId <= 0 ||
      parsedOrderId !== detailOrder.orderId
    ) {
      return;
    }

    if (verificationCode.length !== 6) {
      return;
    }

    setIsSubmittingComplete(true);
    try {
      await onCompleteOrder({
        orderId: parsedOrderId,
        verificationCode,
      });
      setVerificationCode('');
    } finally {
      setIsSubmittingComplete(false);
    }
  };

  const needsAction =
    detailOrder !== null &&
    (detailOrder.status === 1 || detailOrder.status === 2);

  const isOrderIdValid = (() => {
    const parsedOrderId = Number(orderIdInput);
    return (
      Number.isInteger(parsedOrderId) &&
      parsedOrderId > 0 &&
      parsedOrderId === detailOrder?.orderId
    );
  })();

  return (
    <Dialog
      open={detailOrder !== null}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        className:
          'overflow-hidden rounded-2xl border border-gray-100 shadow-2xl',
      }}
    >
      <VendorModalHeader
        title="Chi tiết đơn hàng"
        subtitle={
          detailOrder?.branchName?.trim()
            ? detailOrder.branchName.trim()
            : detailOrder
              ? `Chi nhánh #${detailOrder.branchId}`
              : '—'
        }
        icon={<ReceiptLongIcon />}
        iconTone="order"
        onClose={onClose}
        rightActions={
          detailOrder ? (
            <div className="flex items-center gap-2">
              {/* <span className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-500">
                #{detailOrder.orderId}
              </span> */}
              <OrderStatusBadge
                label={getOrderStatusMeta(detailOrder.status).label}
                type={getOrderStatusMeta(detailOrder.status).type}
              />
            </div>
          ) : undefined
        }
      />
      <DialogContent dividers>
        <Box className="space-y-5 px-1 py-1">
          <Box className="rounded-xl border border-gray-100 bg-slate-50/60 p-4 shadow-sm">
            <Typography className="mb-4 text-xs font-bold tracking-wider text-gray-700 uppercase">
              Thông tin chung
            </Typography>
            <Box className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Box className="rounded-lg border border-gray-200/60 bg-white p-3">
                <Typography className="text-xs font-bold tracking-wide text-gray-500 uppercase">
                  Chi nhánh
                </Typography>
                <Typography className="text-table-text-primary mt-1 text-sm font-semibold">
                  {detailOrder
                    ? detailOrder.branchName.trim() !== ''
                      ? detailOrder.branchName.trim()
                      : `Chi nhánh #${detailOrder.branchId}`
                    : '-'}
                </Typography>
              </Box>
              <Box className="rounded-lg border border-gray-200/60 bg-white p-3">
                <Typography className="text-xs font-bold tracking-wide text-gray-500 uppercase">
                  Hình thức nhận món
                </Typography>
                <Typography className="text-table-text-primary mt-1 text-sm font-semibold">
                  {detailOrder?.isTakeAway ? 'Mang đi' : 'Tại bàn'}
                </Typography>
              </Box>
              <Box className="rounded-lg border border-gray-200/60 bg-white p-3">
                <Typography className="text-xs font-bold tracking-wide text-gray-500 uppercase">
                  Bàn
                </Typography>
                {isEditingTable ? (
                  <div className="mt-1 flex items-center gap-1.5">
                    <input
                      value={tableDraft}
                      onChange={(event) => setTableDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          void handleSaveTable();
                        }

                        if (event.key === 'Escape') {
                          event.preventDefault();
                          handleCancelEditTable();
                        }
                      }}
                      className="focus:border-primary-500 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm outline-none"
                      autoFocus
                      disabled={isSavingTable}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        void handleSaveTable();
                      }}
                      disabled={isSavingTable || tableDraft.trim().length === 0}
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
                  <div className="mt-1 flex items-center gap-1.5">
                    <Typography className="text-table-text-primary text-sm font-semibold">
                      {((): string => {
                        const tableName = detailOrder?.table?.trim();
                        return tableName && tableName.length > 0
                          ? tableName
                          : '-';
                      })()}
                    </Typography>
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
              </Box>
              <Box className="rounded-lg border border-gray-200/60 bg-white p-3">
                <Typography className="text-xs font-bold tracking-wide text-gray-500 uppercase">
                  Thời gian tạo
                </Typography>
                <Typography className="text-table-text-primary mt-1 text-sm font-semibold">
                  {formatDateTime(detailOrder?.createdAt)}
                </Typography>
              </Box>
              <Box className="rounded-lg border border-gray-200/60 bg-white p-3 sm:col-span-2">
                <Typography className="text-xs font-bold tracking-wide text-gray-500 uppercase">
                  Người đặt đơn
                </Typography>
                <Typography className="text-table-text-primary mt-1 text-sm font-semibold">
                  {detailOrder?.userName?.trim() ??
                    `User #${detailOrder?.userId ?? '-'}`}
                </Typography>
              </Box>
              <Box className="rounded-lg border border-gray-200/60 bg-white p-3 sm:col-span-2">
                <Typography className="text-xs font-bold tracking-wide text-gray-500 uppercase">
                  Ghi chú
                </Typography>
                <Typography className="text-table-text-primary mt-1 text-sm font-semibold whitespace-pre-wrap">
                  {detailOrder?.note?.trim() ? detailOrder.note.trim() : '-'}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box className="rounded-xl border border-gray-100 bg-slate-50/60 p-4 shadow-sm">
            <Typography className="mb-3 text-xs font-bold tracking-wider text-gray-700 uppercase">
              Danh sách món
            </Typography>
            <Box className="max-h-56 overflow-y-auto pr-1">
              <Box className="grid grid-cols-[minmax(0,1fr)_88px_110px_120px] gap-2 rounded-lg border border-gray-200/80 bg-gray-100/80 px-3 py-2">
                <Typography className="text-xs font-bold tracking-wide text-gray-600 uppercase">
                  Món
                </Typography>
                <Typography className="text-right text-xs font-bold tracking-wide text-gray-600 uppercase">
                  Số lượng
                </Typography>
                <Typography className="text-right text-xs font-bold tracking-wide text-gray-600 uppercase">
                  Đơn giá
                </Typography>
                <Typography className="text-right text-xs font-bold tracking-wide text-gray-600 uppercase">
                  Tiền món
                </Typography>
              </Box>
              <Box className="mt-2 space-y-2">
                {(detailOrder?.items ?? []).map((item: ManagerOrderItem) => (
                  <Box
                    key={`${item.dishId}-${item.dishName}`}
                    className="grid grid-cols-[minmax(0,1fr)_88px_110px_120px] items-center gap-2 rounded-lg border border-gray-200/70 bg-white px-3 py-2"
                  >
                    <Box className="min-w-0">
                      <Typography className="text-table-text-primary truncate text-sm font-semibold">
                        {item.dishName}
                      </Typography>
                      {/* <Typography className="text-table-text-secondary text-xs">
                        Mã món: #{item.dishId}
                      </Typography> */}
                    </Box>
                    <Typography className="text-right text-sm font-semibold text-gray-700">
                      x{item.quantity}
                    </Typography>
                    <Typography className="text-right text-sm font-semibold text-gray-700">
                      {formatCurrency(getOrderItemUnitPrice(item))}
                    </Typography>
                    <Typography className="text-right text-sm font-bold text-emerald-700">
                      {formatCurrency(
                        getDisplayOrderItemAmount(item, detailOrder)
                      )}
                    </Typography>
                  </Box>
                ))}
              </Box>
              {(detailOrder?.items?.length ?? 0) === 0 ? (
                <Typography className="text-table-text-secondary text-sm">
                  Không có món trong đơn hàng.
                </Typography>
              ) : null}
            </Box>
          </Box>

          <Box className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 shadow-sm">
            <Typography className="mb-3 text-xs font-bold tracking-wider text-emerald-800 uppercase">
              Thanh toán
            </Typography>
            <Box className="space-y-2">
              <Box className="flex items-center justify-between">
                <Typography className="text-sm text-emerald-900">
                  Tổng tiền món
                </Typography>
                <Typography className="text-sm font-semibold text-emerald-800">
                  {formatCurrency(detailOrder?.totalAmount)}
                </Typography>
              </Box>
              <Box className="flex items-center justify-between">
                <Typography className="text-sm text-emerald-900">
                  Mã voucher
                </Typography>
                <Typography className="rounded-full border border-emerald-200 bg-white px-2 py-0.5 text-xs font-semibold text-emerald-800">
                  {detailOrder?.appliedVoucherCode?.trim()
                    ? detailOrder.appliedVoucherCode.trim()
                    : '-'}
                </Typography>
              </Box>
              <Box className="flex items-center justify-between">
                <Typography className="text-sm text-emerald-900">
                  Tên voucher
                </Typography>
                <Typography className="text-right text-sm font-semibold text-emerald-800">
                  {detailOrder?.appliedVoucherName?.trim()
                    ? detailOrder.appliedVoucherName.trim()
                    : '-'}
                </Typography>
              </Box>
              <Box className="flex items-center justify-between">
                <Typography className="text-sm text-emerald-900">
                  Giảm giá
                </Typography>
                <Typography className="text-sm font-semibold text-emerald-800">
                  {formatCurrency(detailOrder?.discountAmount)}
                </Typography>
              </Box>
              <Box className="flex items-center justify-between border-t border-emerald-200 pt-2">
                <Typography className="text-sm font-bold text-emerald-900">
                  Thanh toán cuối cùng
                </Typography>
                <Typography className="text-lg font-extrabold text-emerald-700">
                  {formatCurrency(detailOrder?.finalAmount)}
                </Typography>
              </Box>
            </Box>
          </Box>

          {needsAction ? (
            <Box className="rounded-xl border border-gray-100 bg-slate-50/60 p-4 shadow-sm">
              <Typography className="mb-3 text-xs font-bold tracking-wider text-gray-700 uppercase">
                Thao tác đơn hàng
              </Typography>

              {detailOrder?.status === 1 ? (
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
              ) : null}

              {detailOrder?.status === 2 ? (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-600">
                    Nhập mã đơn và 6 số xác minh để hoàn tất đơn:
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="text"
                      value={orderIdInput}
                      onChange={(event) =>
                        handleOrderIdChange(event.target.value)
                      }
                      inputMode="numeric"
                      placeholder="Nhập mã đơn"
                      disabled={isSubmittingComplete || isSubmittingDecision}
                      className="focus:border-primary-500 focus:ring-primary-200 h-10 min-w-40 rounded-lg border border-gray-300 bg-white px-3 text-sm font-semibold text-gray-800 outline-none placeholder:text-gray-400 focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-100"
                    />
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(event) =>
                        handleVerificationCodeChange(event.target.value)
                      }
                      maxLength={6}
                      inputMode="numeric"
                      placeholder="Nhập 6 chữ số"
                      disabled={isSubmittingComplete || isSubmittingDecision}
                      className="focus:border-primary-500 focus:ring-primary-200 h-10 min-w-48 rounded-lg border border-gray-300 bg-white px-3 text-sm font-semibold tracking-[0.15em] text-gray-800 outline-none placeholder:tracking-normal placeholder:text-gray-400 focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-100"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        void handleCompleteOrder();
                      }}
                      disabled={
                        verificationCode.length !== 6 ||
                        !isOrderIdValid ||
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
              ) : null}
            </Box>
          ) : null}
        </Box>
      </DialogContent>
      <DialogActions className="border-t border-gray-100 bg-gray-50/50 px-6 py-3">
        <Button
          onClick={onClose}
          variant="contained"
          className="font-(--font-nunito)"
        >
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};
