import type { JSX } from 'react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Box,
} from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import AppModalHeader from '@components/AppModalHeader';
import Table from '@features/admin/components/Table';
import type { SystemCampaignStatistics } from '@features/admin/types/dashboard';

interface SystemCampaignStatisticsModalProps {
  open: boolean;
  onClose: () => void;
  data: SystemCampaignStatistics | null;
}

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);

const formatDate = (dateStr: string): string => {
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
};

export default function SystemCampaignStatisticsModal({
  open,
  onClose,
  data,
}: SystemCampaignStatisticsModalProps): JSX.Element {
  const [tab, setTab] = useState(0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { borderRadius: '24px', overflow: 'hidden' },
      }}
    >
      <AppModalHeader
        title={data?.campaignName ?? 'Chi tiết chiến dịch'}
        subtitle={
          <div className="mt-1 flex flex-col gap-0.5 text-sm font-normal text-gray-500">
            <span className="mb-0.5 font-medium text-gray-600">
              Thống kê chi tiết chiến dịch hệ thống
            </span>
            <span>
              Số lượng chi nhánh tham gia: {data?.totalBranchesJoined ?? 0}
            </span>
            <span>
              Tổng đơn hàng:{' '}
              {new Intl.NumberFormat('vi-VN').format(data?.totalOrders ?? 0)}
            </span>
          </div>
        }
        icon={<BarChartIcon />}
        iconTone="admin"
        onClose={onClose}
      />

      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 1 }}>
        <Tabs
          value={tab}
          onChange={(_, v: number) => setTab(v)}
          textColor="primary"
          indicatorColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label={`Nhiệm vụ (${data?.quests?.length ?? 0})`} />
          <Tab
            label={`Đơn hàng của chi nhánh (${data?.branchOrders?.length ?? 0})`}
          />
          <Tab label={`Voucher (${data?.vouchers?.length ?? 0})`} />
          <Tab
            label={`Đơn hàng của chiến dịch (${data?.campaignOrders?.length ?? 0})`}
          />
        </Tabs>
      </Box>

      <DialogContent className="p-6">
        {/* Quests tab */}
        {tab === 0 && (
          <Table
            rowKey="questId"
            data={data?.quests ?? []}
            columns={[
              {
                key: 'questTitle',
                label: 'Tên nhiệm vụ',
                style: { fontWeight: 600 },
              },
              {
                key: 'totalUsersDoing',
                label: 'Tổng người tham gia',
                style: { textAlign: 'right' },
                render: (v) => (
                  <span className="font-semibold text-blue-600">
                    {Number(v ?? 0).toString()}
                  </span>
                ),
              },
              {
                key: 'usersCurrentlyDoing',
                label: 'Đang thực hiện',
                style: { textAlign: 'right' },
                render: (v) => (
                  <span className="font-semibold text-amber-600">
                    {Number(v ?? 0).toString()}
                  </span>
                ),
              },
              {
                key: 'usersFinished',
                label: 'Đã hoàn thành',
                style: { textAlign: 'right' },
                render: (v) => (
                  <span className="font-semibold text-emerald-600">
                    {Number(v ?? 0).toString()}
                  </span>
                ),
              },
            ]}
            emptyMessage="Không có dữ liệu nhiệm vụ"
            maxHeight="400px"
          />
        )}

        {/* Branch orders tab */}
        {tab === 1 && (
          <Table
            rowKey="branchId"
            data={data?.branchOrders ?? []}
            columns={[
              {
                key: 'branchName',
                label: 'Chi nhánh',
                style: { fontWeight: 600 },
              },
              {
                key: 'orderCount',
                label: 'Số đơn hàng',
                style: { textAlign: 'right' },
                render: (v) => (
                  <span className="font-semibold text-blue-600">
                    {Number(v ?? 0).toString()}
                  </span>
                ),
              },
            ]}
            emptyMessage="Không có dữ liệu chi nhánh"
            maxHeight="400px"
          />
        )}

        {/* Vouchers tab */}
        {tab === 2 && (
          <Table
            rowKey="voucherId"
            data={data?.vouchers ?? []}
            columns={[
              {
                key: 'voucherName',
                label: 'Tên voucher',
                style: { fontWeight: 600 },
              },
              {
                key: 'totalUsed',
                label: 'Lượt sử dụng',
                style: { textAlign: 'right' },
                render: (v) => (
                  <span className="font-semibold text-purple-600">
                    {Number(v ?? 0).toString()}
                  </span>
                ),
              },
            ]}
            emptyMessage="Không có dữ liệu voucher"
            maxHeight="400px"
          />
        )}

        {/* Campaign orders tab */}
        {tab === 3 && (
          <Table
            rowKey="orderId"
            data={data?.campaignOrders ?? []}
            columns={[
              {
                key: 'branchName',
                label: 'Chi nhánh',
                style: { fontWeight: 600 },
              },
              {
                key: 'voucherName',
                label: 'Voucher',
              },
              {
                key: 'totalAmount',
                label: 'Tổng tiền',
                style: { textAlign: 'right' },
                render: (v) => (
                  <span className="font-semibold text-emerald-600">
                    {formatCurrency(Number(v ?? 0))}
                  </span>
                ),
              },
              {
                key: 'discountAmount',
                label: 'Giảm giá',
                style: { textAlign: 'right' },
                render: (v) => (
                  <span className="font-semibold text-red-500">
                    -{formatCurrency(Number(v ?? 0))}
                  </span>
                ),
              },
              {
                key: 'createdAt',
                label: 'Ngày tạo',
                render: (v) => (
                  <span className="text-gray-600">
                    {formatDate((v as string) ?? '')}
                  </span>
                ),
              },
            ]}
            emptyMessage="Không có dữ liệu đơn hàng"
            maxHeight="400px"
          />
        )}
      </DialogContent>

      <DialogActions className="border-t border-gray-200 bg-gray-50 p-4">
        <Button onClick={onClose} color="primary" variant="contained">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
}
