import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import type { JSX } from 'react';
import { Box, Chip } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {
  type Controls,
  EVENTS,
  Joyride,
  STATUS,
  type EventData,
} from 'react-joyride';
import { OrderCompletionPanel } from '@features/manager/components/OrderCompletionPanel';
import { OrderDetailDialog } from '@features/manager/components/OrderDetailDialog';
import {
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
import { getManagerOrderManagementTourSteps } from '@features/manager/utils/orderManagementTourSteps';

export default function OrderManagementPage(): JSX.Element {
  const { onGetManagerOrders } = useOrderManagement();
  const { onDecideVendorOrder, onCompleteVendorOrder, onUpdateOrder } =
    useOrder();

  const orders = useAppSelector(selectVendorOrders);
  const pagination = useAppSelector(selectVendorOrdersPagination);
  const status = useAppSelector(selectOrderStatus);

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [detailOrder, setDetailOrder] = useState<ManagerOrder | null>(null);
  const [orderIdInput, setOrderIdInput] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isCompletingByCode, setIsCompletingByCode] = useState(false);
  const [completeMessage, setCompleteMessage] = useState('');
  const [isTourRunning, setIsTourRunning] = useState(false);
  const [tourInstanceKey, setTourInstanceKey] = useState(0);
  const [tableAutoEditKey, setTableAutoEditKey] = useState(0);

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

  const handleOrderIdChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const sanitizedId = event.target.value.replace(/\D/g, '');
    if (completeMessage !== '') {
      setCompleteMessage('');
    }
    setOrderIdInput(sanitizedId);
  };

  const handleCompleteOrderByCode = async (): Promise<void> => {
    if (verificationCode.length !== 6 || isCompletingByCode) {
      return;
    }

    const parsedOrderId = Number(orderIdInput);
    if (!Number.isInteger(parsedOrderId) || parsedOrderId <= 0) {
      setCompleteMessage('Vui lòng nhập mã đơn hợp lệ.');
      return;
    }

    setIsCompletingByCode(true);
    setCompleteMessage('');

    try {
      await onCompleteVendorOrder({
        orderId: parsedOrderId,
        verificationCode,
      });

      const matchedOrder = orders.find(
        (order) => order.orderId === parsedOrderId
      );

      if (matchedOrder) {
        const completedOrder: ManagerOrder = {
          ...matchedOrder,
          status: 4,
          updatedAt: new Date().toISOString(),
        };
        setDetailOrder(completedOrder);
        if (!completedOrder.isTakeAway && !completedOrder.table?.trim()) {
          setTableAutoEditKey((prev) => prev + 1);
        }
      }

      setOrderIdInput('');
      setVerificationCode('');
      setCompleteMessage('Hoàn tất đơn hàng thành công.');
    } catch {
      setCompleteMessage('Không thể hoàn tất đơn với mã đã nhập.');
    } finally {
      setIsCompletingByCode(false);
    }
  };

  const handleUpdateOrderTable = async (
    orderId: number,
    table: string
  ): Promise<void> => {
    const updatedOrder = await onUpdateOrder({
      orderId,
      data: { table },
    });

    setDetailOrder((prev) =>
      prev && prev.orderId === updatedOrder.orderId ? updatedOrder : prev
    );
  };

  const handleOpenDetail = (order: ManagerOrder): void => {
    setDetailOrder(order);
  };

  const handleCloseDetail = (): void => {
    setDetailOrder(null);
  };

  const startOrderTour = (): void => {
    setTourInstanceKey((prev) => prev + 1);
    setIsTourRunning(true);
  };

  const handleJoyrideEvent = (data: EventData, controls: Controls): void => {
    if (data.type === EVENTS.TARGET_NOT_FOUND) {
      controls.next();
      return;
    }

    if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
      setIsTourRunning(false);
    }
  };

  const tourSteps = useMemo(() => {
    return getManagerOrderManagementTourSteps({
      hasRows: orders.length > 0,
    });
  }, [orders.length]);

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
      id: 'view-detail',
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
  ];

  return (
    <div className="font-(--font-nunito)">
      <Joyride
        key={tourInstanceKey}
        run={isTourRunning}
        steps={tourSteps}
        continuous
        scrollToFirstStep
        onEvent={handleJoyrideEvent}
        options={{
          showProgress: true,
          scrollDuration: 350,
          scrollOffset: 80,
          spotlightPadding: 8,
          overlayColor: 'rgba(15, 23, 42, 0.5)',
          primaryColor: '#7ab82d',
          textColor: '#1f2937',
          zIndex: 1700,
          buttons: ['back', 'skip', 'primary'],
        }}
        locale={{
          back: 'Quay lại',
          close: 'Đóng',
          last: 'Hoàn tất',
          next: 'Tiếp theo',
          nextWithProgress: 'Tiếp theo ({current}/{total})',
          skip: 'Bỏ qua',
        }}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div data-tour="manager-order-header">
          <div className="mb-1 flex items-start gap-2">
            <h1 className="text-table-text-primary text-3xl font-bold">
              Quản lý đơn hàng
            </h1>
            <button
              type="button"
              onClick={startOrderTour}
              aria-label="Mở hướng dẫn quản lý đơn hàng"
              title="Hướng dẫn"
              className="text-primary-700 hover:text-primary-800 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors"
            >
              <HelpOutlineIcon sx={{ fontSize: 18 }} />
            </button>
          </div>
          <p className="text-table-text-secondary text-sm">
            Theo dõi và xem chi tiết đơn hàng trên toàn hệ thống
          </p>
        </div>
      </div>

      <div data-tour="manager-order-completion-panel">
        <OrderCompletionPanel
          orderId={orderIdInput}
          verificationCode={verificationCode}
          isCompletingByCode={isCompletingByCode}
          completeMessage={completeMessage}
          onOrderIdChange={handleOrderIdChange}
          onVerificationCodeChange={handleVerificationCodeChange}
          onCompleteOrderByCode={handleCompleteOrderByCode}
        />
      </div>

      <div data-tour="manager-order-table-wrapper">
        <Table
          columns={columns}
          data={orders}
          rowKey="orderId"
          actions={actions}
          loading={status === 'pending'}
          emptyMessage="Chưa có đơn hàng nào"
          tourId="manager-order"
        />
      </div>

      <div data-tour="manager-order-pagination">
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
      </div>

      <OrderDetailDialog
        detailOrder={detailOrder}
        onClose={handleCloseDetail}
        onUpdateOrderTable={handleUpdateOrderTable}
        tableAutoEditKey={tableAutoEditKey}
        onDecideOrder={handleDecision}
        onCompleteOrder={onCompleteVendorOrder}
      />
    </div>
  );
}
