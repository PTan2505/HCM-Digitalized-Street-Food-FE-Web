import { useEffect, useState } from 'react';
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
import { selectVendorBalanceHistory, selectPaymentStatus } from '@slices/payment';
import VendorModalHeader from '@features/vendor/components/VendorModalHeader';
import usePayment from '@features/vendor/hooks/usePayment';
import type { VendorBalanceHistoryItem } from '@features/vendor/types/payment';

interface VendorBalanceHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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
  const { onFetchVendorBalanceHistory } = usePayment();
  const history = useAppSelector(selectVendorBalanceHistory);
  const status = useAppSelector(selectPaymentStatus);
  const isLoading = status === 'pending';

  useEffect(() => {
    if (isOpen) {
      void onFetchVendorBalanceHistory();
    }
  }, [isOpen, onFetchVendorBalanceHistory]);

  const moneyIn: VendorBalanceHistoryItem[] = (history ?? []).filter(
    (item) => item.amount > 0
  );
  const moneyOut: VendorBalanceHistoryItem[] = (history ?? []).filter(
    (item) => item.amount < 0
  );

  const rows = activeTab === 0 ? moneyIn : moneyOut;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ className: 'rounded-2xl overflow-hidden' }}
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
          onChange={(_, v: number) => setActiveTab(v)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Tiền vào" />
          <Tab label="Tiền ra" />
        </Tabs>
      </div>

      <div className="px-6 py-4" style={{ minHeight: 320 }}>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={44} className="rounded" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-gray-400">
            <AccountBalanceWalletIcon sx={{ fontSize: 40, opacity: 0.4 }} />
            <p className="text-sm">Không có giao dịch nào</p>
          </div>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell className="font-semibold text-gray-600">Ngày</TableCell>
                  <TableCell className="font-semibold text-gray-600">Mô tả / Phương thức</TableCell>
                  <TableCell className="font-semibold text-gray-600">Mã giao dịch</TableCell>
                  <TableCell align="right" className="font-semibold text-gray-600">Số tiền</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell className="whitespace-nowrap text-sm text-gray-700">
                      {formatDate(item.createdAt)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      <div>{item.description}</div>
                      <div className="text-xs text-gray-400">
                        {METHOD_LABEL[item.paymentMethod ?? ''] ?? item.paymentMethod}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {item.transactionCode ?? '—'}
                    </TableCell>
                    <TableCell align="right" className="whitespace-nowrap text-sm font-semibold">
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
        )}
      </div>
    </Dialog>
  );
}
