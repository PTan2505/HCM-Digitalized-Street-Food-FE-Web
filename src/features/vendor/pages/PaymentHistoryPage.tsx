import { useEffect } from 'react';
import type { JSX } from 'react';
import { Box } from '@mui/material';
import Table from '@features/vendor/components/Table';
import type { PaymentHistoryItem } from '@features/vendor/types/payment';
import usePayment from '@features/vendor/hooks/usePayment';
import { useAppSelector } from '@hooks/reduxHooks';
import { selectPaymentHistory, selectPaymentStatus } from '@slices/payment';

const StatusBadge = ({
  label,
  type,
}: {
  label: string;
  type: 'success' | 'error' | 'warning' | 'default';
}): JSX.Element => {
  const colors = {
    success: 'bg-green-100 text-green-700 border-green-200',
    error: 'bg-red-100 text-red-700 border-red-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    default: 'bg-slate-100 text-slate-700 border-slate-200',
  };
  return (
    <span
      className={`inline-flex min-w-[80px] items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-bold shadow-sm ${colors[type]}`}
    >
      {label}
    </span>
  );
};

const getPaymentStatusLabel = (status: string): string => {
  const map: Record<string, string> = {
    PAID: 'Đã thanh toán',
    PENDING: 'Chờ thanh toán',
    CANCELLED: 'Đã huỷ',
    FAILED: 'Thất bại',
  };
  return map[status.toUpperCase()] ?? status;
};

const getPaymentStatusType = (
  status: string
): 'success' | 'error' | 'warning' | 'default' => {
  const s = status.toUpperCase();
  if (s === 'PAID') return 'success';
  if (s === 'CANCELLED' || s === 'FAILED') return 'error';
  if (s === 'PENDING') return 'warning';
  return 'default';
};

function PaymentHistoryPage(): JSX.Element {
  const { onGetPaymentHistory } = usePayment();
  const history = useAppSelector(selectPaymentHistory);
  const status = useAppSelector(selectPaymentStatus);

  useEffect(() => {
    void onGetPaymentHistory();
  }, [onGetPaymentHistory]);

  const formatDate = (date: string | null): string => {
    if (!date) return '-';
    return new Date(date).toLocaleString('vi-VN');
  };

  const formatAmount = (amount: number): string =>
    amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

  const columns = [
    // {
    //   key: 'id',
    //   label: 'ID',
    //   style: { width: '60px' },
    // },
    // {
    //   key: 'branchId',
    //   label: 'Chi nhánh',
    //   style: { width: '100px' },
    // },
    {
      key: 'description',
      label: 'Mô tả',
      render: (value: unknown): React.ReactNode => (
        <Box className="max-w-[400px] overflow-hidden text-sm text-ellipsis whitespace-nowrap">
          {typeof value === 'string' ? value : '-'}
        </Box>
      ),
    },
    {
      key: 'amount',
      label: 'Số tiền',
      style: { width: '140px' },
      render: (value: unknown): React.ReactNode => (
        <span className="font-semibold text-[var(--color-table-text-primary)]">
          {typeof value === 'number' ? formatAmount(value) : '-'}
        </span>
      ),
    },
    // {
    //   key: 'paymentMethod',
    //   label: 'Phương thức',
    //   style: { width: '130px' },
    //   render: (value: unknown): React.ReactNode => (
    //     <span className="text-sm">
    //       {typeof value === 'string' ? value : '-'}
    //     </span>
    //   ),
    // },
    {
      key: 'status',
      label: 'Trạng thái',
      style: { width: '140px' },
      render: (value: unknown): React.ReactNode => (
        <StatusBadge
          label={typeof value === 'string' ? getPaymentStatusLabel(value) : '-'}
          type={
            typeof value === 'string' ? getPaymentStatusType(value) : 'default'
          }
        />
      ),
    },
    {
      key: 'createdAt',
      label: 'Ngày tạo',
      style: { width: '180px' },
      render: (value: unknown): React.ReactNode =>
        typeof value === 'string' ? formatDate(value) : '-',
    },
    {
      key: 'paidAt',
      label: 'Ngày thanh toán',
      style: { width: '180px' },
      render: (value: unknown): React.ReactNode =>
        typeof value === 'string' ? formatDate(value) : '-',
    },
  ];

  const rows: PaymentHistoryItem[] = history ?? [];

  return (
    <div className="font-[var(--font-nunito)]">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-3xl font-bold text-[var(--color-table-text-primary)]">
            Lịch sử thanh toán
          </h1>
          <p className="text-sm text-[var(--color-table-text-secondary)]">
            Danh sách các giao dịch thanh toán của cửa hàng
          </p>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={rows}
        rowKey="id"
        loading={status === 'pending'}
        emptyMessage="Chưa có giao dịch nào"
        maxHeight="calc(100vh - 240px)"
      />
    </div>
  );
}

export default PaymentHistoryPage;
