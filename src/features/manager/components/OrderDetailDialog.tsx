import {
  Box,
  Button,
  Chip,
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
              <Box className="rounded-lg border border-gray-200/60 bg-white p-3 sm:col-span-2">
                <Typography className="text-xs font-bold tracking-wide text-gray-500 uppercase">
                  Thời gian tạo
                </Typography>
                <Typography className="text-table-text-primary mt-1 text-sm font-semibold">
                  {formatDateTime(detailOrder?.createdAt)}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box className="rounded-xl border border-gray-100 bg-slate-50/60 p-4 shadow-sm">
            <Typography className="mb-3 text-xs font-bold tracking-wider text-gray-700 uppercase">
              Danh sách món
            </Typography>
            <Box className="max-h-56 space-y-2 overflow-y-auto pr-1">
              {(detailOrder?.items ?? []).map((item: ManagerOrderItem) => (
                <Box
                  key={`${item.dishId}-${item.dishName}`}
                  className="flex items-center justify-between rounded-lg border border-gray-200/70 bg-white px-3 py-2"
                >
                  <Box className="min-w-0">
                    <Typography className="text-table-text-primary truncate text-sm font-semibold">
                      {item.dishName}
                    </Typography>
                    <Typography className="text-table-text-secondary text-xs">
                      Mã món: #{item.dishId}
                    </Typography>
                  </Box>
                  <Chip
                    label={`x${item.quantity}`}
                    size="small"
                    className="bg-primary-100 text-primary-800 font-semibold"
                  />
                </Box>
              ))}
              {(detailOrder?.items?.length ?? 0) === 0 ? (
                <Typography className="text-table-text-secondary text-sm">
                  Không có món trong đơn hàng.
                </Typography>
              ) : null}
            </Box>
          </Box>

          <Box className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 shadow-sm">
            <Box className="flex items-center justify-between">
              <Typography className="text-sm font-bold text-emerald-800">
                Tổng thanh toán
              </Typography>
              <Typography className="text-lg font-extrabold text-emerald-700">
                {detailOrder?.finalAmount !== undefined
                  ? `${detailOrder.finalAmount.toLocaleString('vi-VN')}đ`
                  : '-'}
              </Typography>
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
