import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import type { JSX } from 'react';
import type { User } from '@custom-types/user';
import type {
  ManagerOrder,
  ManagerOrderItem,
} from '@features/manager/types/orderManagement';
import {
  getOrderStatusMeta,
  OrderStatusBadge,
} from '@features/manager/components/OrderStatusBadge';

const formatDateTime = (value: string | null | undefined): string => {
  if (!value) return '-';
  return new Date(value).toLocaleString('vi-VN');
};

const formatCurrency = (value: number | null | undefined): string => {
  if (typeof value !== 'number') return '-';
  return `${value.toLocaleString('vi-VN')}đ`;
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
  detailProfile,
  onClose,
}: {
  detailOrder: ManagerOrder | null;
  detailProfile: User | null;
  onClose: () => void;
}): JSX.Element => {
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
      <DialogTitle className="border-b border-gray-100 bg-gray-50/70 px-6 py-4">
        <Box className="flex items-start justify-between gap-4">
          <Box>
            <Typography className="text-table-text-primary text-xl font-bold">
              Chi tiết đơn hàng
            </Typography>
            <Typography className="text-table-text-secondary mt-1 text-sm">
              {detailOrder ? `#${detailOrder.orderId}` : '-'}
            </Typography>
          </Box>
          {detailOrder ? (
            <OrderStatusBadge
              label={getOrderStatusMeta(detailOrder.status).label}
              type={getOrderStatusMeta(detailOrder.status).type}
            />
          ) : null}
        </Box>
      </DialogTitle>
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
                <Typography className="text-table-text-primary mt-1 text-sm font-semibold">
                  {((): string => {
                    const tableName = detailOrder?.table?.trim();
                    return tableName && tableName.length > 0 ? tableName : '-';
                  })()}
                </Typography>
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
                  {detailProfile?.username ??
                    `User #${detailOrder?.userId ?? '-'}`}
                </Typography>
              </Box>
              <Box className="rounded-lg border border-gray-200/60 bg-white p-3 sm:col-span-2">
                <Typography className="text-xs font-bold tracking-wide text-gray-500 uppercase">
                  Số điện thoại
                </Typography>
                <Typography className="text-table-text-primary mt-1 text-sm font-semibold">
                  {detailProfile?.phoneNumber ?? '-'}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box className="rounded-xl border border-gray-100 bg-slate-50/60 p-4 shadow-sm">
            <Typography className="mb-3 text-xs font-bold tracking-wider text-gray-700 uppercase">
              Danh sách món
            </Typography>
            <Box className="max-h-56 overflow-y-auto pr-1">
              <Box className="grid grid-cols-[minmax(0,1fr)_88px_120px] gap-2 rounded-lg border border-gray-200/80 bg-gray-100/80 px-3 py-2">
                <Typography className="text-xs font-bold tracking-wide text-gray-600 uppercase">
                  Món
                </Typography>
                <Typography className="text-right text-xs font-bold tracking-wide text-gray-600 uppercase">
                  Số lượng
                </Typography>
                <Typography className="text-right text-xs font-bold tracking-wide text-gray-600 uppercase">
                  Tiền món
                </Typography>
              </Box>
              <Box className="mt-2 space-y-2">
                {(detailOrder?.items ?? []).map((item: ManagerOrderItem) => (
                  <Box
                    key={`${item.dishId}-${item.dishName}`}
                    className="grid grid-cols-[minmax(0,1fr)_88px_120px] items-center gap-2 rounded-lg border border-gray-200/70 bg-white px-3 py-2"
                  >
                    <Box className="min-w-0">
                      <Typography className="text-table-text-primary truncate text-sm font-semibold">
                        {item.dishName}
                      </Typography>
                      <Typography className="text-table-text-secondary text-xs">
                        Mã món: #{item.dishId}
                      </Typography>
                    </Box>
                    <Typography className="text-right text-sm font-semibold text-gray-700">
                      x{item.quantity}
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
