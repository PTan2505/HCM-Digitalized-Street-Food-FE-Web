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
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { OrderCompletionPanel } from '@features/vendor/components/OrderCompletionPanel';
import { OrderDetailDialog } from '@features/vendor/components/OrderDetailDialog';
import {
  canDecideOrder,
  getOrderStatusMeta,
  OrderStatusBadge,
} from '@features/vendor/components/OrderStatusBadge';
import Table from '@features/vendor/components/Table';
import Pagination from '@features/vendor/components/Pagination';
import useOrder from '@features/vendor/hooks/useOrder';
import usePayment from '@features/vendor/hooks/usePayment';
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
  } = useOrder();
  const { onGetVendorBalance } = usePayment();

  const myVendor = useAppSelector(selectMyVendor);
  const orders = useAppSelector(selectVendorOrders);
  const pagination = useAppSelector(selectVendorOrdersPagination);
  const status = useAppSelector(selectOrderStatus);

  const [selectedBranchId, setSelectedBranchId] =
    useState<SelectedBranch>('all');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [detailOrder, setDetailOrder] = useState<VendorOrder | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isCompletingByCode, setIsCompletingByCode] = useState(false);
  const [completeMessage, setCompleteMessage] = useState('');

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

    if (selectedBranchId === 'all') {
      await onGetVendorOrders({ pageNumber, pageSize });
    } else {
      await onGetVendorBranchOrders({
        branchId: selectedBranchId,
        params: { pageNumber, pageSize },
      });
    }
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
      let matchedOrder: VendorOrder | null = null;

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

      const completedOrder: VendorOrder = {
        ...matchedOrder,
        status: 4,
        updatedAt: new Date().toISOString(),
      };

      // Refresh account balance in the payment slice right after completion.
      void onGetVendorBalance();

      setDetailOrder(completedOrder);
      setVerificationCode('');
      setCompleteMessage('Hoàn tất đơn hàng thành công.');
    } finally {
      setIsCompletingByCode(false);
    }
  };

  const handleOpenDetail = (order: VendorOrder): void => {
    setDetailOrder(order);
  };

  const handleCloseDetail = (): void => {
    setDetailOrder(null);
  };

  const columns = useMemo(
    () => [
      // {
      //   key: 'orderId',
      //   label: 'Mã đơn',
      //   style: { width: '90px' },
      // },
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
              {items.length > 0
                ? items.map((item) => (
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
      onClick: (row: VendorOrder): void => {
        handleOpenDetail(row);
      },
    },
    {
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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-table-text-primary mb-1 text-3xl font-bold">
            Quản lý đơn hàng
          </h1>
          <p className="text-table-text-secondary text-sm">
            Theo dõi và xử lý đơn hàng theo từng chi nhánh
          </p>
        </div>

        <FormControl size="small" className="min-w-65">
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
            value={selectedBranchId !== null ? String(selectedBranchId) : 'all'}
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
        emptyMessage={
          branches.length === 0
            ? 'Chưa có chi nhánh để xem đơn hàng'
            : 'Chưa có đơn hàng nào'
        }
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
