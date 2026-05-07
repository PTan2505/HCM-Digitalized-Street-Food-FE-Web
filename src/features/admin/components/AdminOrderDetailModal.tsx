import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Store, User, CreditCard, Receipt, MapPin, Tag } from 'lucide-react';
import type { AdminOrder } from '@features/admin/types/order';
import {
  OrderStatusBadge,
  getOrderStatusMeta,
} from '@features/vendor/components/OrderStatusBadge';
import AppModalHeader from '@components/AppModalHeader';

interface AdminOrderDetailModalProps {
  open: boolean;
  onClose: () => void;
  order: AdminOrder;
}

export default function AdminOrderDetailModal({
  open,
  onClose,
  order,
}: AdminOrderDetailModalProps): React.JSX.Element {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const getMoneyLocationLabel = (
    location: string | null | undefined
  ): string => {
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

  const getPaymentMethodLabel = (method: string | null | undefined): string => {
    switch (method) {
      case 'QR Code':
        return 'Mã QR';
      case 'Lowca Wallet':
        return 'Ví Lowca';
      default:
        return method ?? '-';
    }
  };

  const statusMeta = getOrderStatusMeta(order.status);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '24px',
          overflow: 'hidden',
          maxHeight: '85vh',
        },
      }}
    >
      <AppModalHeader
        title={`Chi tiết đơn hàng #${order.orderId}`}
        subtitle={
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {new Date(order.createdAt).toLocaleString('vi-VN')}
            </span>
            <span className="text-gray-300">•</span>
            <OrderStatusBadge label={statusMeta.label} type={statusMeta.type} />
            <span className="text-gray-300">•</span>
            <span className="text-sm font-medium text-gray-700">
              {order.isTakeAway ? 'Mang đi' : 'Ăn tại quán'}
            </span>
          </div>
        }
        icon={<Receipt size={24} />}
        iconTone="admin"
        onClose={onClose}
      />

      <DialogContent className="flex flex-col overflow-hidden pt-6">
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-8 overflow-hidden md:grid-cols-2">
          {/* Cột trái: Thông tin người dùng, chi nhánh, thanh toán */}
          <div className="space-y-6 overflow-y-auto pr-2">
            {/* Người dùng */}
            <Box className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
              <Box className="text-primary-600 mb-3 flex items-center gap-2">
                <User size={20} />
                <Typography variant="subtitle2" className="font-semibold">
                  Khách hàng
                </Typography>
              </Box>
              {order.user ? (
                <Box className="space-y-2">
                  <Typography
                    variant="body2"
                    className="font-medium text-gray-900"
                  >
                    Tên: {order.user.lastName} {order.user.firstName}
                  </Typography>
                  <Typography variant="body2" className="text-gray-600">
                    SĐT: {order.user.phoneNumber || 'Không có'}
                  </Typography>
                  <Typography variant="body2" className="text-gray-600">
                    Email: {order.user.email || 'Không có'}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" className="text-gray-500 italic">
                  Khách vãng lai
                </Typography>
              )}
            </Box>

            {/* Chi nhánh */}
            <Box className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
              <Box className="text-primary-600 mb-3 flex items-center gap-2">
                <Store size={20} />
                <Typography variant="subtitle2" className="font-semibold">
                  Chi nhánh
                </Typography>
              </Box>
              {order.branch ? (
                <Box className="space-y-2">
                  <Typography
                    variant="body2"
                    className="font-medium text-gray-900"
                  >
                    Tên chi nhánh: {order.branch.name}
                  </Typography>
                  <Typography variant="body2" className="text-gray-600">
                    Tên cửa hàng: {order.branch.vendorName}
                  </Typography>
                  {/* <Box className="flex items-start gap-1">
                    <MapPin size={14} className="mt-0.5 text-gray-400" />
                    <Typography variant="body2" className="text-gray-600">
                      {order.branch.city}
                    </Typography>
                  </Box> */}
                </Box>
              ) : (
                <Typography variant="body2" className="text-gray-500 italic">
                  Không có thông tin
                </Typography>
              )}
            </Box>

            {/* Thanh toán & Ghi chú */}
            <Box className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
              <Box className="text-primary-600 mb-3 flex items-center gap-2">
                <CreditCard size={20} />
                <Typography variant="subtitle2" className="font-semibold">
                  Thanh toán & Ghi chú
                </Typography>
              </Box>
              <Box className="space-y-2">
                <Box className="flex justify-between">
                  <Typography variant="body2" className="text-gray-600">
                    Phương thức:
                  </Typography>
                  <Typography
                    variant="body2"
                    className="font-medium text-gray-900"
                  >
                    {getPaymentMethodLabel(order.paymentMethod)}
                  </Typography>
                </Box>
                <Box className="flex justify-between">
                  <Typography variant="body2" className="text-gray-600">
                    Luồng tiền:
                  </Typography>
                  <Typography
                    variant="body2"
                    className="font-medium text-gray-900"
                  >
                    {getMoneyLocationLabel(order.moneyLocation)}
                  </Typography>
                </Box>
                {order.payment?.paidAt && (
                  <Box className="flex justify-between">
                    <Typography variant="body2" className="text-gray-600">
                      Thời gian:
                    </Typography>
                    <Typography
                      variant="body2"
                      className="font-medium text-gray-900"
                    >
                      {new Date(order.payment.paidAt).toLocaleString('vi-VN')}
                    </Typography>
                  </Box>
                )}
                {!order.isTakeAway && order.table && (
                  <Box className="flex justify-between">
                    <Typography variant="body2" className="text-gray-600">
                      Bàn:
                    </Typography>
                    <Typography
                      variant="body2"
                      className="font-medium text-gray-900"
                    >
                      {order.table}
                    </Typography>
                  </Box>
                )}
                {order.note && (
                  <Box className="mt-2 rounded bg-amber-50 p-2">
                    <Typography
                      variant="body2"
                      className="text-sm text-amber-800"
                    >
                      <span className="font-semibold">Ghi chú:</span>{' '}
                      {order.note}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </div>

          {/* Cột phải: Chi tiết món và tổng tiền */}
          <div className="flex min-h-0 flex-col">
            <Box className="flex flex-1 flex-col overflow-hidden rounded-xl border border-gray-100 bg-gray-50/50 p-4">
              <Box className="text-primary-600 mb-4 flex items-center gap-2">
                <Receipt size={20} />
                <Typography variant="subtitle2" className="font-semibold">
                  Chi tiết đơn hàng
                </Typography>
              </Box>

              {/* Danh sách món */}
              <Box className="flex-1 space-y-4 overflow-y-auto pr-2">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, idx) => (
                    <Box
                      key={idx}
                      className="flex items-center gap-3 border-b border-dashed border-gray-200 pb-3 last:border-0 last:pb-0"
                    >
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.dishName}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      ) : (
                        <Box className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-200 text-gray-400">
                          <Receipt size={20} />
                        </Box>
                      )}
                      <Box className="flex-1">
                        <Typography
                          variant="body2"
                          className="font-medium text-gray-900"
                        >
                          {item.dishName}
                        </Typography>
                        <Typography
                          variant="body2"
                          className="text-sm text-gray-500"
                        >
                          {formatCurrency(item.price)} x {item.quantity}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        className="font-semibold text-gray-900"
                      >
                        {formatCurrency(item.price * item.quantity)}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" className="text-gray-500 italic">
                    Không có món nào
                  </Typography>
                )}
              </Box>

              <Divider className="my-4 border-dashed" />

              {/* Voucher */}
              {order.appliedVoucher && (
                <Box className="mb-4 rounded-lg bg-green-50 p-3">
                  <Box className="flex items-center gap-2 text-green-700">
                    <Tag size={16} />
                    <Typography variant="body2" className="font-medium">
                      Voucher áp dụng
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    className="mt-1 font-semibold text-green-800"
                  >
                    {order.appliedVoucher.voucherCode}
                  </Typography>
                  <Typography
                    variant="body2"
                    className="text-sm text-green-600"
                  >
                    {order.appliedVoucher.voucherName}
                  </Typography>
                </Box>
              )}

              {/* Tổng tiền */}
              <Box className="space-y-2">
                <Box className="flex justify-between">
                  <Typography variant="body2" className="text-gray-600">
                    Tạm tính
                  </Typography>
                  <Typography
                    variant="body2"
                    className="font-medium text-gray-900"
                  >
                    {formatCurrency(order.totalAmount)}
                  </Typography>
                </Box>
                <Box className="flex justify-between">
                  <Typography variant="body2" className="text-gray-600">
                    Giảm giá
                  </Typography>
                  <Typography
                    variant="body2"
                    className="font-medium text-green-600"
                  >
                    -{formatCurrency(order.discountAmount)}
                  </Typography>
                </Box>
                <Divider className="my-2" />
                <Box className="flex justify-between">
                  <Typography
                    variant="subtitle1"
                    className="font-bold text-gray-900"
                  >
                    Tổng cộng
                  </Typography>
                  <Typography
                    variant="h6"
                    className="text-primary-600 font-bold"
                  >
                    {formatCurrency(order.finalAmount)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
