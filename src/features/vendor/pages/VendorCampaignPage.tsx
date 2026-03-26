import { useState, useEffect, useCallback } from 'react';
import type { JSX } from 'react';
import { Box, Chip } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import Table from '@features/vendor/components/Table';
import Pagination from '@features/vendor/components/Pagination';
import VendorCampaignFormModal from '@features/vendor/components/VendorCampaignFormModal';
import type { VendorCampaign } from '@features/vendor/types/campaign';
import useVendorCampaign from '@features/vendor/hooks/useVendorCampaign';
import { useAppSelector } from '@hooks/reduxHooks';
import {
  selectVendorCampaigns,
  selectCampaignStatus,
  selectVendorCampaignTotalCount,
} from '@slices/campaign';
import type { VendorCampaignFormData } from '@features/vendor/utils/campaignSchema';

const PAGE_SIZE = 10;

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

export default function VendorCampaignPage(): JSX.Element {
  const campaigns = useAppSelector(selectVendorCampaigns);
  const status = useAppSelector(selectCampaignStatus);
  const totalCount = useAppSelector(selectVendorCampaignTotalCount);
  const {
    onGetVendorCampaigns,
    onCreateVendorCampaign,
    onUpdateVendorCampaign,
  } = useVendorCampaign();

  const [page, setPage] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<VendorCampaign | null>(
    null
  );

  const fetchCampaigns = useCallback(async (): Promise<void> => {
    try {
      await onGetVendorCampaigns(page, PAGE_SIZE);
    } catch (err) {
      console.error('Failed to fetch vendor campaigns', err);
    }
  }, [onGetVendorCampaigns, page]);

  useEffect(() => {
    void fetchCampaigns();
  }, [fetchCampaigns]);

  const handleOpenModal = (campaign?: VendorCampaign): void => {
    setEditingCampaign(campaign ?? null);
    setOpenModal(true);
  };

  const handleCloseModal = (): void => {
    setOpenModal(false);
    setEditingCampaign(null);
  };

  const handleSubmit = async (data: VendorCampaignFormData): Promise<void> => {
    try {
      const payload = {
        name: data.name,
        description: data.description ?? null,
        targetSegment: data.targetSegment ?? null,
        startDate: data.startDate,
        endDate: data.endDate,
      };

      if (editingCampaign) {
        await onUpdateVendorCampaign(editingCampaign.campaignId, payload);
      } else {
        await onCreateVendorCampaign(payload);
      }
      handleCloseModal();
    } catch (err) {
      console.error('Failed to save vendor campaign', err);
    }
  };

  const columns = [
    {
      key: 'campaignId',
      label: 'ID',
      style: { width: '60px' },
    },
    {
      key: 'name',
      label: 'Tên chiến dịch',
      render: (value: unknown): JSX.Element => (
        <Box className="font-semibold text-[var(--color-table-text-primary)]">
          {typeof value === 'string' ? value : String(value)}
        </Box>
      ),
    },
    {
      key: 'startDate',
      label: 'Thời gian diễn ra',
      render: (_: unknown, row: VendorCampaign): JSX.Element => (
        <Box className="text-sm text-[var(--color-table-text-secondary)]">
          <div>Từ: {formatVNDatetime(row.startDate)}</div>
          <div>Đến: {formatVNDatetime(row.endDate)}</div>
        </Box>
      ),
    },
    {
      key: 'targetSegment',
      label: 'Phân khúc',
      render: (value: unknown): JSX.Element => (
        <Chip
          label={typeof value === 'string' && value ? value : 'Tất cả'}
          size="small"
          variant="outlined"
        />
      ),
    },
    // {
    //   key: 'status',
    //   label: 'Trạng thái',
    //   render: (value: unknown): JSX.Element => {
    //     const s = typeof value === 'string' ? value : '';
    //     const colorMap: Record<
    //       string,
    //       'success' | 'warning' | 'error' | 'default'
    //     > = {
    //       Active: 'success',
    //       Upcoming: 'warning',
    //       Ended: 'error',
    //     };
    //     return (
    //       <Chip
    //         label={s || 'Không rõ'}
    //         size="small"
    //         color={colorMap[s] ?? 'default'}
    //       />
    //     );
    //   },
    // },
  ];

  const actions = [
    {
      label: <EditIcon fontSize="small" />,
      menuLabel: 'Cập nhật chiến dịch',
      onClick: (row: VendorCampaign): void => handleOpenModal(row),
      color: 'primary' as const,
    },
  ];

  return (
    <div className="flex h-full flex-col font-[var(--font-nunito)]">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-3xl font-bold text-[var(--color-table-text-primary)]">
            Quản lý chiến dịch
          </h1>
          <p className="text-sm text-[var(--color-table-text-secondary)]">
            Quản lý các chương trình khuyến mãi và chiến dịch của quán
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 rounded-lg bg-[var(--color-primary-600)] px-4 py-2 font-semibold text-white transition-colors hover:bg-[var(--color-primary-700)]"
        >
          <AddIcon fontSize="small" />
          Thêm chiến dịch
        </button>
      </div>

      {/* Table Content */}
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <Table
          columns={columns}
          data={campaigns}
          rowKey="campaignId"
          actions={actions}
          loading={status === 'pending'}
          emptyMessage="Chưa có chiến dịch nào"
        />
      </Box>

      {/* Pagination */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
        <Pagination
          currentPage={page}
          totalPages={Math.ceil((totalCount ?? 0) / PAGE_SIZE)}
          totalCount={totalCount ?? 0}
          pageSize={PAGE_SIZE}
          hasPrevious={page > 1}
          hasNext={page < Math.ceil((totalCount ?? 0) / PAGE_SIZE)}
          onPageChange={setPage}
        />
      </Box>

      {/* Form Modal */}
      <VendorCampaignFormModal
        isOpen={openModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        campaign={editingCampaign}
        status={status}
      />
    </div>
  );
}
