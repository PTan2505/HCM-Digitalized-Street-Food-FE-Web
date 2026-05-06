import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import type { JSX } from 'react';
import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {
  type Controls,
  EVENTS,
  Joyride,
  STATUS,
  type EventData,
} from 'react-joyride';
import { OrderCompletionPanel } from '@features/vendor/components/OrderCompletionPanel';
import OrderDetailsModal from '@features/vendor/components/OrderDetailsModal';
import {
  canDecideOrder,
  getOrderStatusMeta,
  OrderStatusBadge,
} from '@features/vendor/components/OrderStatusBadge';
import Table from '@features/vendor/components/Table';
import Pagination from '@features/vendor/components/Pagination';
import useOrder from '@features/vendor/hooks/useOrder';
import useVendor from '@features/vendor/hooks/useVendor';
import type { VendorOrder } from '@features/vendor/types/order';
import type { Branch } from '@features/vendor/types/vendor';
import { useAppSelector } from '@hooks/reduxHooks';
import {
  selectOrderStatus,
  selectVendorOrders,
  selectVendorOrdersPagination,
} from '@slices/order';
import { selectMyVendor } from '@slices/vendor';
import { getOrderManagementTourSteps } from '@features/vendor/utils/orderManagementTourSteps';

const getBranchDisplayName = (branch: {
  branchName?: string | null;
  name?: string | null;
  branchId: number;
}): string =>
  branch.branchName ?? branch.name ?? `Chi nhánh #${branch.branchId}`;

type SelectedBranch = number | 'all';

export default function OrderPage(): JSX.Element {
  const { onGetMyVendor } = useVendor();
  const {
    onGetVendorOrders,
    onGetVendorBranchOrders,
    onDecideVendorOrder,
    onCompleteVendorOrder,
    onUpdateOrder,
  } = useOrder();

  const myVendor = useAppSelector(selectMyVendor);
  const orders = useAppSelector(selectVendorOrders);
  const pagination = useAppSelector(selectVendorOrdersPagination);
  const status = useAppSelector(selectOrderStatus);

  const [selectedBranchId, setSelectedBranchId] =
    useState<SelectedBranch>('all');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [detailOrderId, setDetailOrderId] = useState<number | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [orderIdInput, setOrderIdInput] = useState('');
  const [isCompletingByCode, setIsCompletingByCode] = useState(false);
  const [completeMessage, setCompleteMessage] = useState('');
  const [isTourRunning, setIsTourRunning] = useState(false);
  const [tourInstanceKey, setTourInstanceKey] = useState(0);
  const [tableAutoEditKey, setTableAutoEditKey] = useState(0);

  const branches: Branch[] = useMemo(
    () =>
      (myVendor?.branches ?? []).filter(
        (branch) => branch.isActive && branch.licenseStatus === 'Accept'
      ),
    [myVendor?.branches]
  );

  useEffect(() => {
    void onGetMyVendor();
  }, [onGetMyVendor]);

  useEffect(() => {
    if (selectedBranchId === 'all') {
      void onGetVendorOrders({ pageNumber, pageSize });
      return;
    }

    void onGetVendorBranchOrders({
      branchId: selectedBranchId,
      params: { pageNumber, pageSize },
    });
  }, [
    selectedBranchId,
    pageNumber,
    pageSize,
    onGetVendorOrders,
    onGetVendorBranchOrders,
  ]);

  const handleBranchChange = (event: SelectChangeEvent<string>): void => {
    const val = event.target.value;
    setSelectedBranchId(val === 'all' ? 'all' : Number(val));
    setPageNumber(1);
  };

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
    const sanitized = event.target.value.replace(/\D/g, '');
    if (completeMessage !== '') {
      setCompleteMessage('');
    }
    setOrderIdInput(sanitized);
  };

  const handleCompleteOrderByCode = async (): Promise<void> => {
    if (
      verificationCode.length !== 6 ||
      orderIdInput.trim() === '' ||
      Number(orderIdInput) <= 0 ||
      isCompletingByCode
    ) {
      return;
    }

    setIsCompletingByCode(true);
    setCompleteMessage('');

    const targetOrderId = Number(orderIdInput);

    try {
      await onCompleteVendorOrder({
        orderId: targetOrderId,
        verificationCode,
      });

      setDetailOrderId(targetOrderId);
      setTableAutoEditKey((prev) => prev + 1);
      setVerificationCode('');
      setOrderIdInput('');
      setCompleteMessage('Hoàn tất đơn hàng thành công.');
    } catch {
      setCompleteMessage('Không thể hoàn tất đơn. Vui lòng kiểm tra lại mã.');
    } finally {
      setIsCompletingByCode(false);
    }
  };

  const handleUpdateOrderTable = async (
    orderId: number,
    table: string
  ): Promise<void> => {
    await onUpdateOrder({
      orderId,
      data: { table },
    });
  };

  const handleOpenDetail = (order: VendorOrder): void => {
    setDetailOrderId(order.orderId);
  };

  const handleCloseDetail = (): void => {
    setDetailOrderId(null);
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
    return getOrderManagementTourSteps({
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
        render: (value: unknown, row: VendorOrder): React.ReactNode => {
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
            ? (value as VendorOrder['items'])
            : [];

          return (
            <Box className="flex max-w-[320px] flex-wrap gap-1">
              {items.length > 0 ? (
                <>
                  {items.slice(0, 2).map((item) => (
                    <Chip
                      key={`${item.dishId}-${item.dishName}`}
                      label={`${item.dishName} x${item.quantity}`}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                  {items.length > 2 && (
                    <Chip label="..." size="small" variant="outlined" />
                  )}
                </>
              ) : (
                '-'
              )}
            </Box>
          );
        },
      },
      {
        key: 'vendorPayout',
        label: 'Tiền nhận được',
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
      id: 'view',
      label: (
        <VisibilityOutlinedIcon fontSize="small" className="text-blue-700" />
      ),
      menuLabel: (
        <span className="font-semibold text-blue-700">Xem chi tiết</span>
      ),
      onClick: (row: VendorOrder): void => {
        handleOpenDetail(row);
      },
    },
    {
      id: 'approve',
      label: (
        <CheckCircleOutlineIcon fontSize="small" className="text-primary-700" />
      ),
      menuLabel: <span className="text-primary-700 font-bold">Chấp nhận</span>,
      onClick: (row: VendorOrder): void => {
        void handleDecision(row.orderId, true);
      },
      show: (row: VendorOrder): boolean => canDecideOrder(row.status),
    },
    {
      id: 'reject',
      label: <CancelOutlinedIcon fontSize="small" className="text-red-600" />,
      menuLabel: <span className="font-bold text-red-600">Từ chối</span>,
      onClick: (row: VendorOrder): void => {
        void handleDecision(row.orderId, false);
      },
      show: (row: VendorOrder): boolean => canDecideOrder(row.status),
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
        <div data-tour="order-page-header">
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
            Theo dõi và xử lý đơn hàng theo từng chi nhánh
          </p>
        </div>

        <div className="flex items-center gap-2">
          <FormControl
            size="small"
            className="min-w-65"
            data-tour="order-branch-filter"
          >
            <InputLabel
              id="vendor-order-branch-label"
              sx={{
                color: 'var(--color-primary-700)',
                '&.Mui-focused': {
                  color: 'var(--color-primary-700)',
                },
              }}
            >
              Chi nhánh
            </InputLabel>
            <Select
              labelId="vendor-order-branch-label"
              value={
                selectedBranchId !== null ? String(selectedBranchId) : 'all'
              }
              label="Chi nhánh"
              onChange={handleBranchChange}
              disabled={branches.length === 0}
              sx={{
                color: 'var(--color-primary-700)',
                fontWeight: 700,
                '& .MuiSelect-icon': {
                  color: 'var(--color-primary-700)',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'var(--color-primary-600)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'var(--color-primary-600)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'var(--color-primary-600)',
                  borderWidth: '1px',
                },
                '&.Mui-focused': {
                  color: 'var(--color-primary-700)',
                  boxShadow: 'none',
                  outline: 'none',
                },
              }}
            >
              <MenuItem value="all">Tất cả chi nhánh</MenuItem>
              {branches.map((branch) => (
                <MenuItem key={branch.branchId} value={branch.branchId}>
                  {getBranchDisplayName(branch)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </div>

      <div data-tour="order-completion-panel">
        <OrderCompletionPanel
          verificationCode={verificationCode}
          orderId={orderIdInput}
          isCompletingByCode={isCompletingByCode}
          completeMessage={completeMessage}
          onVerificationCodeChange={handleVerificationCodeChange}
          onOrderIdChange={handleOrderIdChange}
          onCompleteOrderByCode={handleCompleteOrderByCode}
        />
      </div>

      <div data-tour="order-table-wrapper">
        <Table
          columns={columns}
          data={orders}
          rowKey="orderId"
          actions={actions}
          loading={status === 'pending'}
          emptyMessage={
            branches.length === 0
              ? 'Chưa có chi nhánh để xem đơn hàng'
              : 'Chưa có đơn hàng nào'
          }
          tourId="vendor-order"
        />
      </div>

      <div data-tour="order-pagination">
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

      <OrderDetailsModal
        isOpen={detailOrderId !== null}
        orderId={detailOrderId}
        onClose={handleCloseDetail}
        onUpdateOrderTable={handleUpdateOrderTable}
        tableAutoEditKey={tableAutoEditKey}
      />
    </div>
  );
}
