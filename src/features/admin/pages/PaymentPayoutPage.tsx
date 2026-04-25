import { useState } from 'react';
import type { JSX } from 'react';
import { Box, Chip } from '@mui/material';
import Table from '@features/admin/components/Table';
import Pagination from '@features/admin/components/Pagination';
import { usePaymentPayout } from '@features/admin/hooks/usePayment';
import type { PaymentPayoutItem } from '@features/admin/types/payment';

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

const formatVNDatetime = (isoStr: string | null): string => {
  if (!isoStr) return '-';
  const date = new Date(isoStr);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function PaymentPayoutPage(): JSX.Element {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { payouts, status } = usePaymentPayout(page, pageSize);

  const columns = [
    {
      key: 'transactionCode',
      label: 'Mã GD',
      render: (_: unknown, row: PaymentPayoutItem): JSX.Element => (
        <span className="font-medium text-[var(--color-table-text-primary)]">
          {row.transactionCode}
        </span>
      ),
    },
    {
      key: 'user',
      label: 'Người nhận',
      render: (_: unknown, row: PaymentPayoutItem): JSX.Element => (
        <div className="flex flex-col">
          <span className="font-semibold text-[var(--color-table-text-primary)]">
            {row.userName}
          </span>
          <span className="text-xs text-[var(--color-table-text-secondary)]">
            {row.userEmail}
          </span>
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Số tiền',
      render: (value: unknown, row: PaymentPayoutItem): JSX.Element => (
        <span
          className={`font-bold ${
            row.amount < 0 ? 'text-red-600' : 'text-green-600'
          }`}
        >
          {formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      key: 'paymentMethod',
      label: 'Phương thức',
      render: (_: unknown, row: PaymentPayoutItem): JSX.Element => (
        <span className="text-sm text-[var(--color-table-text-secondary)]">
          {row.paymentMethod}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (_: unknown, row: PaymentPayoutItem): JSX.Element => {
        if (row.status === 'PAID') {
          return (
            <Chip
              label="PAID"
              color="success"
              size="small"
              variant="outlined"
              className="bg-green-50 font-bold text-green-700"
            />
          );
        }
        return (
          <Chip
            label={row.status}
            size="small"
            variant="outlined"
            className="font-bold"
          />
        );
      },
    },
    // {
    //   key: 'createdAt',
    //   label: 'Ngày tạo',
    //   render: (_: unknown, row: PaymentPayoutItem): JSX.Element => (
    //     <span className="text-sm text-[var(--color-table-text-secondary)]">
    //       {formatVNDatetime(row.createdAt)}
    //     </span>
    //   ),
    // },
    {
      key: 'paidAt',
      label: 'Ngày thanh toán',
      render: (_: unknown, row: PaymentPayoutItem): JSX.Element => (
        <span className="text-sm text-[var(--color-table-text-secondary)]">
          {row.paidAt ? formatVNDatetime(row.paidAt) : '-'}
        </span>
      ),
    },
  ];

  return (
    <div className="flex h-full flex-col font-[var(--font-nunito)]">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="mb-1 flex items-start gap-2">
            <h1 className="text-3xl font-bold text-[var(--color-table-text-primary)]">
              Lịch sử rút tiền
            </h1>
          </div>
          <p className="text-sm text-[var(--color-table-text-secondary)]">
            Danh sách các giao dịch rút tiền
          </p>
        </div>
        {payouts && (
          <div className="rounded-md border border-red-100 bg-red-50/50 px-3 py-1.5 text-right">
            <p className="text-[10px] font-bold tracking-tight text-red-500 uppercase">
              Tổng tiền đã rút
            </p>
            <p className="text-sm font-bold text-red-700">
              {formatCurrency(payouts.totalAmount)}
            </p>
          </div>
        )}
      </div>

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <Table
          columns={columns}
          data={payouts?.result.items ?? []}
          rowKey="id"
          loading={status === 'pending'}
          emptyMessage="Chưa có lịch sử rút tiền nào"
        />
      </Box>

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={payouts?.result.totalPages ?? 1}
        totalCount={payouts?.result.totalCount ?? 0}
        pageSize={pageSize}
        hasPrevious={payouts?.result.hasPrevious ?? false}
        hasNext={payouts?.result.hasNext ?? false}
        onPageChange={setPage}
        onPageSizeChange={(newPageSize) => {
          setPageSize(newPageSize);
          setPage(1);
        }}
      />
    </div>
  );
}
