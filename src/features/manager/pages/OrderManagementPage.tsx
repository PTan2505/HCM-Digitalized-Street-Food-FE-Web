import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import type { JSX } from 'react';
import { Box, Chip } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { OrderCompletionPanel } from '@features/manager/components/OrderCompletionPanel';
import { OrderDetailDialog } from '@features/manager/components/OrderDetailDialog';
import {
  canDecideOrder,
  getOrderStatusMeta,
  OrderStatusBadge,
} from '@features/manager/components/OrderStatusBadge';
import Table from '@features/vendor/components/Table';
import Pagination from '@features/vendor/components/Pagination';
import useOrderManagement from '@features/manager/hooks/useOrderManagement';
import useOrder from '@features/vendor/hooks/useOrder';
import type {
  ManagerOrder,
  ManagerOrderItem,
} from '@features/manager/types/orderManagement';
import { useAppSelector } from '@hooks/reduxHooks';
import {
  selectOrderStatus,
  selectVendorOrders,
  selectVendorOrdersPagination,
} from '@slices/order';

export default function OrderManagementPage(): JSX.Element {
  const { onGetManagerOrders } = useOrderManagement();
  const { onDecideVendorOrder, onCompleteVendorOrder } = useOrder();

  const orders = useAppSelector(selectVendorOrders);
  const pagination = useAppSelector(selectVendorOrdersPagination);
  const status = useAppSelector(selectOrderStatus);

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [detailOrder, setDetailOrder] = useState<ManagerOrder | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isCompletingByCode, setIsCompletingByCode] = useState(false);
  const [completeMessage, setCompleteMessage] = useState('');

  useEffect(() => {
    void onGetManagerOrders({
      pageNumber,
      pageSize,
    });
  }, [onGetManagerOrders, pageNumber, pageSize]);

  const handlePageChange = (page: number): void => {
    setPageNumber(page);
  };

  const handlePageSizeChange = (size: number): void => {
    setPageSize(size);
    setPageNumber(1);
  };

  const handleDecision = async (
    orderId: number,
    approve: boolean
  ): Promise<void> => {
    await onDecideVendorOrder({ orderId, approve });
  };

  const handleVerificationCodeChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    const sanitizedCode = event.target.value.replace(/\D/g, '').slice(0, 6);
    if (completeMessage !== '') {
      setCompleteMessage('');
    }
    setVerificationCode(sanitizedCode);
  };

  const handleCompleteOrderByCode = async (): Promise<void> => {
    if (verificationCode.length !== 6 || isCompletingByCode) {
      return;
    }

    setIsCompletingByCode(true);
    setCompleteMessage('');

    const candidateOrders = orders.filter((order) => order.status === 2);

    if (candidateOrders.length === 0) {
      setCompleteMessage('Không có đơn đã chấp nhận để hoàn tất.');
      setIsCompletingByCode(false);
      return;
    }

    try {
      let matchedOrder: ManagerOrder | null = null;

      for (const order of candidateOrders) {
        try {
          await onCompleteVendorOrder({
            orderId: order.orderId,
            verificationCode,
          });
          matchedOrder = order;
          break;
        } catch {
          // Try next accepted order until one matches the verification code.
        }
      }

      if (!matchedOrder) {
        setCompleteMessage('Không tìm thấy đơn hàng khớp với mã xác minh.');
        return;
      }

      const completedOrder: ManagerOrder = {
        ...matchedOrder,
        status: 4,
        updatedAt: new Date().toISOString(),
      };

      setDetailOrder(completedOrder);
      setVerificationCode('');
      setCompleteMessage('Hoàn tất đơn hàng thành công.');
    } finally {
      setIsCompletingByCode(false);
    }
  };

  const handleOpenDetail = (order: ManagerOrder): void => {
    setDetailOrder(order);
  };

  const handleCloseDetail = (): void => {
    setDetailOrder(null);
  };

  const columns = useMemo(
    () => [
      {
        key: 'orderId',
        label: 'Mã đơn',
        style: { width: '90px' },
      },
      {
        key: 'branchName',
        label: 'Chi nhánh',
        style: { width: '180px' },
        render: (value: unknown, row: ManagerOrder): React.ReactNode => {
          if (typeof value === 'string' && value.trim() !== '') {
            return value;
          }
          return `Chi nhánh #${row.branchId}`;
        },
      },
      {
        key: 'items',
        label: 'Món ăn',
        render: (value: unknown): React.ReactNode => {
          const items = Array.isArray(value)
            ? (value as ManagerOrder['items'])
            : [];

          return (
            <Box className="flex max-w-[320px] flex-wrap gap-1">
              {items.length > 0
                ? items.map((item: ManagerOrderItem) => (
                    <Chip
                      key={`${item.dishId}-${item.dishName}`}
                      label={`${item.dishName} x${item.quantity}`}
                      size="small"
                      variant="outlined"
                    />
                  ))
                : '-'}
            </Box>
          );
        },
      },
      {
        key: 'finalAmount',
        label: 'Thành tiền',
        style: { width: '150px' },
        render: (value: unknown): React.ReactNode =>
          typeof value === 'number' ? `${value.toLocaleString('vi-VN')}đ` : '-',
      },
      {
        key: 'isTakeAway',
        label: 'Hình thức',
        style: { width: '130px' },
        render: (value: unknown): React.ReactNode =>
          value ? 'Mang đi' : 'Tại bàn',
      },
      {
        key: 'status',
        label: 'Trạng thái',
        style: { width: '130px' },
        render: (value: unknown): React.ReactNode => {
          const orderStatus =
            typeof value === 'number' ? getOrderStatusMeta(value) : null;
          return (
            <OrderStatusBadge
              label={orderStatus?.label ?? 'Không xác định'}
              type={orderStatus?.type ?? 'default'}
            />
          );
        },
      },
      {
        key: 'createdAt',
        label: 'Thời gian tạo',
        style: { width: '180px' },
        render: (value: unknown): React.ReactNode =>
          typeof value === 'string'
            ? new Date(value).toLocaleString('vi-VN')
            : '-',
      },
    ],
    []
  );

  const actions = [
    {
      label: (
        <VisibilityOutlinedIcon fontSize="small" className="text-blue-700" />
      ),
      menuLabel: (
        <span className="font-semibold text-blue-700">Xem chi tiết</span>
      ),
      onClick: (row: ManagerOrder): void => {
        handleOpenDetail(row);
      },
    },
    {
      label: (
        <CheckCircleOutlineIcon fontSize="small" className="text-primary-700" />
      ),
      menuLabel: <span className="text-primary-700 font-bold">Chấp nhận</span>,
      onClick: (row: ManagerOrder): void => {
        void handleDecision(row.orderId, true);
      },
      show: (row: ManagerOrder): boolean => canDecideOrder(row.status),
    },
    {
      label: <CancelOutlinedIcon fontSize="small" className="text-red-600" />,
      menuLabel: <span className="font-bold text-red-600">Từ chối</span>,
      onClick: (row: ManagerOrder): void => {
        void handleDecision(row.orderId, false);
      },
      show: (row: ManagerOrder): boolean => canDecideOrder(row.status),
    },
  ];

  return (
    <div className="font-(--font-nunito)">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-table-text-primary mb-1 text-3xl font-bold">
            Quản lý đơn hàng
          </h1>
          <p className="text-table-text-secondary text-sm">
            Theo dõi và xem chi tiết đơn hàng trên toàn hệ thống
          </p>
        </div>
      </div>

      <OrderCompletionPanel
        verificationCode={verificationCode}
        isCompletingByCode={isCompletingByCode}
        completeMessage={completeMessage}
        onVerificationCodeChange={handleVerificationCodeChange}
        onCompleteOrderByCode={handleCompleteOrderByCode}
      />

      <Table
        columns={columns}
        data={orders}
        rowKey="orderId"
        actions={actions}
        loading={status === 'pending'}
        emptyMessage="Chưa có đơn hàng nào"
      />

      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalCount={pagination.totalCount}
        pageSize={pagination.pageSize}
        hasPrevious={pagination.hasPrevious}
        hasNext={pagination.hasNext}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />

      <OrderDetailDialog
        detailOrder={detailOrder}
        onClose={handleCloseDetail}
      />
    </div>
  );
}
