import { useCallback, useEffect, useState } from 'react';
import type { JSX } from 'react';
import Dialog from '@mui/material/Dialog';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Skeleton from '@mui/material/Skeleton';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useAppSelector } from '@hooks/reduxHooks';
import {
  selectVendorBalanceHistory,
  selectPaymentStatus,
} from '@slices/payment';
import VendorModalHeader from '@features/vendor/components/VendorModalHeader';
import Pagination from '@features/vendor/components/Pagination';
import usePayment from '@features/vendor/hooks/usePayment';
import type { VendorBalanceHistoryItem } from '@features/vendor/types/payment';

interface VendorBalanceHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TAB_METHODS = ['Vendor Wallet', 'PAYOS_PAYOUT'] as const;

const formatCurrencyVnd = (value: number): string =>
  `${Math.abs(value).toLocaleString('vi-VN')} ₫`;

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const METHOD_LABEL: Record<string, string> = {
  'Vendor Wallet': 'Ví Vendor',
  PAYOS_PAYOUT: 'Rút tiền PayOS',
};

export default function VendorBalanceHistoryModal({
  isOpen,
  onClose,
}: VendorBalanceHistoryModalProps): JSX.Element {
  const [activeTab, setActiveTab] = useState(0);
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d.toISOString().slice(0, 10);
  });
  const [toDate, setToDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { onFetchVendorBalanceHistory } = usePayment();
  const history = useAppSelector(selectVendorBalanceHistory);
  const status = useAppSelector(selectPaymentStatus);
  const isLoading = status === 'pending';

  const fetchData = useCallback(
    (page: number, size: number) => {
      void onFetchVendorBalanceHistory({
        paymentMethod: TAB_METHODS[activeTab],
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        pageNumber: page,
        pageSize: size,
      });
    },
    [activeTab, fromDate, toDate, onFetchVendorBalanceHistory]
  );

  useEffect(() => {
    if (isOpen) {
      fetchData(pageNumber, pageSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, activeTab, fromDate, toDate]);

  const handleTabChange = (_: React.SyntheticEvent, v: number): void => {
    setActiveTab(v);
    setPageNumber(1);
  };

  const handleFromDate = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFromDate(e.target.value);
    setPageNumber(1);
  };

  const handleToDate = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setToDate(e.target.value);
    setPageNumber(1);
  };

  const handlePageChange = (page: number): void => {
    setPageNumber(page);
    fetchData(page, pageSize);
  };

  const handlePageSizeChange = (size: number): void => {
    setPageSize(size);
    setPageNumber(1);
    fetchData(1, size);
  };

  const rows: VendorBalanceHistoryItem[] = history?.items ?? [];

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        className: 'rounded-2xl overflow-hidden flex flex-col',
        style: { maxHeight: '90vh' },
      }}
    >
      <VendorModalHeader
        title="Lịch sử số dư"
        subtitle="Tra cứu các giao dịch tiền vào và tiền ra của ví vendor"
        icon={<AccountBalanceWalletIcon />}
        iconTone="default"
        onClose={onClose}
      />

      <div className="px-6 pt-4">
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Tiền vào" />
          <Tab label="Tiền ra" />
        </Tabs>
      </div>

      <div className="flex flex-wrap items-center gap-4 px-6 pt-4">
        <div>
          <span className="mb-1 block text-xs font-semibold tracking-wider text-gray-500 uppercase">
            Từ ngày
          </span>
          <input
            type="date"
            value={fromDate}
            max={toDate || undefined}
            onChange={handleFromDate}
            className="focus:ring-primary-600 rounded-lg border border-gray-300 bg-white px-3 py-1.75 text-sm text-gray-800 transition-all outline-none hover:border-gray-400 focus:ring-1"
          />
        </div>
        <div>
          <span className="mb-1 block text-xs font-semibold tracking-wider text-gray-500 uppercase">
            Đến ngày
          </span>
          <input
            type="date"
            value={toDate}
            min={fromDate || undefined}
            onChange={handleToDate}
            className="focus:ring-primary-600 rounded-lg border border-gray-300 bg-white px-3 py-1.75 text-sm text-gray-800 transition-all outline-none hover:border-gray-400 focus:ring-1"
          />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-6 py-4">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                height={44}
                className="rounded"
              />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-gray-400">
            <AccountBalanceWalletIcon sx={{ fontSize: 40, opacity: 0.4 }} />
            <p className="text-sm">Không có giao dịch nào</p>
          </div>
        ) : (
          <>
            <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell className="font-semibold text-gray-600">
                      Ngày
                    </TableCell>
                    <TableCell className="font-semibold text-gray-600">
                      Mô tả / Phương thức
                    </TableCell>
                    <TableCell className="font-semibold text-gray-600">
                      Mã giao dịch
                    </TableCell>
                    <TableCell
                      align="right"
                      className="font-semibold text-gray-600"
                    >
                      Số tiền
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell className="text-sm whitespace-nowrap text-gray-700">
                        {formatDate(item.createdAt)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-700">
                        <div>{item.description}</div>
                        <div className="text-xs text-gray-400">
                          {METHOD_LABEL[item.paymentMethod ?? ''] ??
                            item.paymentMethod}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {item.transactionCode ?? '—'}
                      </TableCell>
                      <TableCell
                        align="right"
                        className="text-sm font-semibold whitespace-nowrap"
                      >
                        {activeTab === 0 ? (
                          <span style={{ color: '#00B14F' }}>
                            +{formatCurrencyVnd(item.amount)}
                          </span>
                        ) : (
                          <span style={{ color: '#e66772' }}>
                            -{formatCurrencyVnd(item.amount)}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {history && (
              <Pagination
                currentPage={history.currentPage}
                totalPages={history.totalPages}
                totalCount={history.totalCount}
                pageSize={history.pageSize}
                hasPrevious={history.hasPrevious}
                hasNext={history.hasNext}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                pageSizeOptions={[5, 10, 20, 50]}
              />
            )}
          </>
        )}
      </div>
    </Dialog>
  );
}
