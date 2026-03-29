import { useState, useEffect, useCallback } from 'react';
import type { JSX } from 'react';
import { Box, Chip } from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  ConfirmationNumber as VoucherIcon,
} from '@mui/icons-material';
import Table from '@features/admin/components/Table';
import Pagination from '@features/admin/components/Pagination';
import CamPaignFormModal from '@features/admin/components/CamPaignFormModal';
import CampaignVoucherModal from '@features/admin/components/CampaignVoucherModal';
import type { Campaign } from '@features/admin/types/campaign';
import useCampaign from '@features/admin/hooks/useCampaign';
import { useAppSelector } from '@hooks/reduxHooks';
import {
  selectCampaigns,
  selectCampaignStatus,
  selectCampaignTotalCount,
} from '@slices/campaign';
import type { CampaignFormData } from '@features/admin/utils/campaignSchema';

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
      className={`inline-flex min-w-[100px] items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-bold shadow-sm ${colors[type]}`}
    >
      {label}
    </span>
  );
};

export default function CampaignPage(): JSX.Element {
  const campaigns = useAppSelector(selectCampaigns);
  const status = useAppSelector(selectCampaignStatus);
  const totalCount = useAppSelector(selectCampaignTotalCount);
  const {
    onGetCampaigns,
    onCreateCampaign,
    onUpdateCampaign,
    onPostCampaignImage,
    onDeleteCampaignImage,
  } = useCampaign();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [openModal, setOpenModal] = useState(false);
  const [openVoucherModal, setOpenVoucherModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );

  const fetchCampaigns = useCallback(async (): Promise<void> => {
    try {
      await onGetCampaigns(page, pageSize);
    } catch (err) {
      console.error('Failed to fetch campaigns', err);
    }
  }, [onGetCampaigns, page, pageSize]);

  useEffect(() => {
    void fetchCampaigns();
  }, [fetchCampaigns]);

  const handleOpenModal = (campaign?: Campaign): void => {
    if (campaign) {
      setEditingCampaign(campaign);
    } else {
      setEditingCampaign(null);
    }
    setOpenModal(true);
  };

  const handleCloseModal = (): void => {
    setOpenModal(false);
    setEditingCampaign(null);
  };

  const handleSubmit = async (
    data: CampaignFormData,
    imageFile: File | null,
    isImageRemoved?: boolean
  ): Promise<void> => {
    try {
      if (editingCampaign) {
        await onUpdateCampaign(editingCampaign.campaignId, data);

        if (isImageRemoved && !imageFile) {
          await onDeleteCampaignImage(editingCampaign.campaignId);
        }

        if (imageFile) {
          const formData = new FormData();
          formData.append('image', imageFile);
          await onPostCampaignImage(editingCampaign.campaignId, formData);
        }
      } else {
        const createdCampaign = await onCreateCampaign(data);

        if (imageFile) {
          const formData = new FormData();
          formData.append('image', imageFile);
          await onPostCampaignImage(createdCampaign.campaignId, formData);
        }
      }
      handleCloseModal();
      // void fetchCampaigns();
    } catch (err) {
      console.error('Failed to save campaign', err);
    }
  };

  const columns = [
    // {
    //   key: 'campaignId',
    //   label: 'ID',
    //   style: { width: '60px' },
    // },
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
      render: (_: unknown, row: Campaign): JSX.Element => (
        <Box className="text-sm text-[var(--color-table-text-secondary)]">
          <div>Từ: {formatVNDatetime(row.startDate)}</div>
          <div>Đến: {formatVNDatetime(row.endDate)}</div>
        </Box>
      ),
    },
    {
      key: 'registrationStartDate',
      label: 'Thời gian đăng ký',
      render: (_: unknown, row: Campaign): JSX.Element => (
        <Box className="text-sm text-[var(--color-table-text-secondary)]">
          <div>Từ: {formatVNDatetime(row.registrationStartDate)}</div>
          <div>Đến: {formatVNDatetime(row.registrationEndDate)}</div>
        </Box>
      ),
    },
    {
      key: 'targetSegment',
      label: 'Phân khúc',
      render: (value: unknown): JSX.Element => (
        <Chip
          label={typeof value === 'string' ? value : 'Tất cả'}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      key: 'isActive',
      label: 'Hoạt động',
      render: (value: unknown): JSX.Element => (
        <StatusBadge
          label={value === true ? 'Đang hoạt động' : 'Tạm ngưng'}
          type={value === true ? 'success' : 'error'}
        />
      ),
    },
  ];

  const actions = [
    {
      label: <VoucherIcon fontSize="small" />,
      onClick: (row: Campaign): void => {
        setSelectedCampaign(row);
        setOpenVoucherModal(true);
      },
      tooltip: 'Quản lý voucher chiến dịch',
      color: 'warning' as const,
      variant: 'outlined' as const,
    },
    {
      label: <EditIcon fontSize="small" />,
      onClick: (row: Campaign): void => handleOpenModal(row),
      tooltip: 'Chỉnh sửa chiến dịch',
      color: 'primary' as const,
      variant: 'outlined' as const,
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
            Quản lý các chương trình khuyến mãi và chiến dịch hệ thống
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
      <Pagination
        currentPage={page}
        totalPages={Math.ceil((totalCount ?? 0) / pageSize)}
        totalCount={totalCount ?? 0}
        pageSize={pageSize}
        hasPrevious={page > 1}
        hasNext={page < Math.ceil((totalCount ?? 0) / pageSize)}
        onPageChange={setPage}
        onPageSizeChange={(newPageSize) => {
          setPageSize(newPageSize);
          setPage(1);
        }}
      />

      {/* Form Modal */}
      <CamPaignFormModal
        isOpen={openModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        campaign={editingCampaign}
        status={status}
      />

      {/* Campaign Voucher Modal */}
      <CampaignVoucherModal
        isOpen={openVoucherModal}
        onClose={() => setOpenVoucherModal(false)}
        campaign={selectedCampaign}
      />
    </div>
  );
}
