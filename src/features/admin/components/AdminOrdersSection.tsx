import React, { useEffect, useState } from 'react';
import useAdminOrder from '@features/admin/hooks/useAdminOrder';
import { useAppSelector } from '@hooks/reduxHooks';
import {
  selectAdminOrders,
  selectAdminOrdersPagination,
  selectAdminOrderStatus,
} from '@slices/adminOrder';
import Table from '@features/admin/components/Table';
import Pagination from '@features/admin/components/Pagination';
import {
  OrderStatusBadge,
  getOrderStatusMeta,
} from '@features/vendor/components/OrderStatusBadge';
import AdminOrderDetailModal from './AdminOrderDetailModal';
import type { AdminOrder } from '@features/admin/types/order';

interface AdminOrdersSectionProps {
  fromDate: string;
  toDate: string;
}

export default function AdminOrdersSection({
  fromDate,
  toDate,
}: AdminOrdersSectionProps): React.JSX.Element {
  const { onGetAdminOrders } = useAdminOrder();
  const orders = useAppSelector(selectAdminOrders);
  const pagination = useAppSelector(selectAdminOrdersPagination);
  const status = useAppSelector(selectAdminOrderStatus);

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  useEffect(() => {
    onGetAdminOrders({
      pageNumber,
      pageSize,
      fromDate,
      toDate,
    });
  }, [pageNumber, pageSize, fromDate, toDate, onGetAdminOrders]);

  const handlePageChange = (newPage: number): void => {
    setPageNumber(newPage);
  };

  const handleRowsPerPageChange = (newSize: number): void => {
    setPageSize(newSize);
    setPageNumber(1);
  };

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
        return method ?? 'Không xác định';
    }
  };

  const columns = [
    {
      key: 'createdAt',
      label: 'Ngày tạo',
      render: (value: unknown): React.ReactNode => {
        return new Date(value as string).toLocaleString('vi-VN');
      },
    },
    {
      key: 'totalAmount',
      label: 'Tổng tiền',
      render: (value: unknown): React.ReactNode => {
        return (
          <span className="text-primary-600 font-semibold">
            {formatCurrency(value as number)}
          </span>
        );
      },
    },
    {
      key: 'paymentMethod',
      label: 'Phương thức thanh toán',
      render: (value: unknown): React.ReactNode => {
        return getPaymentMethodLabel(value as string | undefined);
      },
    },
    {
      key: 'moneyLocation',
      label: 'Luồng tiền',
      render: (value: unknown): React.ReactNode => {
        return getMoneyLocationLabel(value as string | undefined);
      },
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (value: unknown): React.ReactNode => {
        const meta = getOrderStatusMeta(value as number);
        return <OrderStatusBadge label={meta.label} type={meta.type} />;
      },
    },
  ];

  const actions = [
    {
      label: 'Xem chi tiết',
      menuLabel: 'Xem chi tiết',
      onClick: (row: AdminOrder): void => setSelectedOrder(row),
    },
  ];

  return (
    <div
      className="rounded-xl border border-gray-100 p-6 shadow-sm"
      style={{
        background: 'linear-gradient(to right, #ffffff, #f8fafc)',
      }}
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Giao dịch đơn hàng
        </h3>
        <p className="text-sm text-gray-500">
          Danh sách các đơn hàng trên toàn hệ thống
        </p>
      </div>

      <Table<AdminOrder>
        columns={columns}
        data={orders}
        loading={status === 'pending'}
        emptyMessage="Không có đơn hàng nào trong thời gian này"
        rowKey="orderId"
        actions={actions}
        groupActionsInMenu={false}
      />

      {orders.length > 0 && (
        <div className="w-full">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            pageSize={pagination.pageSize}
            onPageSizeChange={handleRowsPerPageChange}
            totalCount={pagination.totalCount}
            hasPrevious={pagination.hasPrevious}
            hasNext={pagination.hasNext}
            pageSizeOptions={[5, 10, 20, 50]}
          />
        </div>
      )}

      {selectedOrder && (
        <AdminOrderDetailModal
          open={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          order={selectedOrder}
        />
      )}
    </div>
  );
}
