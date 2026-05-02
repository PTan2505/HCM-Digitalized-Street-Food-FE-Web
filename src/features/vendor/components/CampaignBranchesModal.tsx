import React from 'react';
import { Modal, Box } from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import VendorModalHeader from './VendorModalHeader';
import Table from './Table';
import type { CampaignBranchStat } from '../types/dashboard';

interface CampaignBranchesModalProps {
  open: boolean;
  onClose: () => void;
  campaignName: string;
  branches: CampaignBranchStat[];
}

export default function CampaignBranchesModal({
  open,
  onClose,
  campaignName,
  branches,
}: CampaignBranchesModalProps): React.JSX.Element {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const columns = [
    {
      key: 'branchName',
      label: 'Tên chi nhánh',
      render: (value: unknown): React.JSX.Element => (
        <span className="font-medium text-gray-900">{String(value)}</span>
      ),
    },
    {
      key: 'orderCount',
      label: 'Số đơn hàng',
      render: (value: unknown): React.JSX.Element => (
        <span className="text-gray-600">
          {Number(value).toLocaleString('vi-VN')}
        </span>
      ),
    },
    {
      key: 'revenue',
      label: 'Doanh thu',
      render: (value: unknown): React.JSX.Element => (
        <span className="font-semibold text-emerald-600">
          {formatCurrency(Number(value))}
        </span>
      ),
    },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="campaign-branches-modal"
    >
      <Box
        className="absolute top-1/2 left-1/2 flex max-h-[90vh] w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        sx={{ outline: 'none' }}
      >
        <VendorModalHeader
          title="Chi nhánh tham gia"
          subtitle={`Chiến dịch: ${campaignName}`}
          icon={<StorefrontIcon />}
          iconTone="branch"
          onClose={onClose}
        />

        <div className="flex-1 overflow-y-auto p-6">
          <Table
            columns={columns}
            data={branches}
            rowKey="branchId"
            emptyMessage="Không có chi nhánh nào tham gia chiến dịch này"
          />
        </div>
      </Box>
    </Modal>
  );
}
