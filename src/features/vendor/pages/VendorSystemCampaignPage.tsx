import { useCallback, useEffect, useMemo, useState } from 'react';
import type { JSX } from 'react';
import { Box, Button } from '@mui/material';
import { Visibility as VisibilityIcon } from '@mui/icons-material';
import Table from '@features/vendor/components/Table';
import Pagination from '@features/vendor/components/Pagination';
import SystemCampaignDetailsModal from '@features/vendor/components/SystemCampaignDetailsModal';
import type { VendorCampaign } from '@features/vendor/types/campaign';
import useVendorCampaign from '@features/vendor/hooks/useVendorCampaign';
import { useAppSelector } from '@hooks/reduxHooks';
import {
  selectCampaignStatus,
  selectJoinableSystemCampaigns,
  selectJoinableSystemCampaignTotalCount,
  selectVendorCampaigns,
} from '@slices/campaign';
import { selectMyVendor } from '@slices/vendor';

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
      className={`inline-flex min-w-25 items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-bold shadow-sm ${colors[type]}`}
    >
      {label}
    </span>
  );
};

export default function VendorSystemCampaignPage(): JSX.Element {
  const campaigns = useAppSelector(selectJoinableSystemCampaigns);
  const vendorCampaigns = useAppSelector(selectVendorCampaigns);
  const totalCount = useAppSelector(selectJoinableSystemCampaignTotalCount);
  const status = useAppSelector(selectCampaignStatus);
  const myVendor = useAppSelector(selectMyVendor);
  const { onGetJoinableSystemCampaigns, onGetVendorCampaigns } =
    useVendorCampaign();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [detailsCampaignId, setDetailsCampaignId] = useState<number | null>(
    null
  );
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const fetchCampaigns = useCallback(async (): Promise<void> => {
    try {
      await Promise.all([
        onGetJoinableSystemCampaigns(page, pageSize),
        onGetVendorCampaigns(1, 1000),
      ]);
    } catch (error) {
      console.error('Failed to fetch system campaigns', error);
    }
  }, [onGetJoinableSystemCampaigns, onGetVendorCampaigns, page, pageSize]);

  useEffect(() => {
    void fetchCampaigns();
  }, [fetchCampaigns]);

  const totalPages = useMemo(() => {
    const pages = Math.ceil((totalCount ?? 0) / pageSize);
    return pages > 0 ? pages : 1;
  }, [totalCount, pageSize]);

  const vendorBranches = myVendor?.branches ?? [];
  const vendorBranchIds = vendorBranches.map((branch) => branch.branchId);

  const columns = [
    {
      key: 'name',
      label: 'Tên chiến dịch hệ thống',
      render: (value: unknown): React.ReactNode => (
        <Box className="text-table-text-primary font-semibold">
          {typeof value === 'string' ? value : String(value)}
        </Box>
      ),
    },
    {
      key: 'startDate',
      label: 'Thời gian diễn ra',
      render: (_: unknown, row: VendorCampaign): React.ReactNode => (
        <Box className="text-table-text-secondary text-sm">
          <div>Từ: {formatVNDatetime(row.startDate)}</div>
          <div>Đến: {formatVNDatetime(row.endDate)}</div>
        </Box>
      ),
    },
    {
      key: 'targetSegment',
      label: 'Phân khúc',
      render: (value: unknown): React.ReactNode => (
        <Box className="text-table-text-primary">
          {typeof value === 'string' && value.trim().length > 0 ? value : '-'}
        </Box>
      ),
    },
    {
      key: 'isActive',
      label: 'Hoạt động',
      style: { width: '140px' },
      render: (value: unknown): React.ReactNode => (
        <StatusBadge
          label={value === true ? 'Đang hoạt động' : 'Tạm ngưng'}
          type={value === true ? 'success' : 'error'}
        />
      ),
    },
    {
      key: 'detailsAction',
      label: 'Hành động',
      style: { width: '160px' },
      render: (_: unknown, row: VendorCampaign): React.ReactNode => {
        const isAlreadyJoined = vendorCampaigns.some(
          (vc) => vc.isSystemCampaign && vc.campaignId === row.campaignId
        );

        if (isAlreadyJoined) {
          return (
            <span className="text-primary-600 text-sm font-semibold">
              Đã tham gia
            </span>
          );
        }

        return (
          <Button
            size="small"
            color="info"
            variant="outlined"
            onClick={() => {
              setDetailsCampaignId(row.campaignId);
              setIsDetailsModalOpen(true);
            }}
          >
            <VisibilityIcon fontSize="small" />
          </Button>
        );
      },
    },
  ];

  return (
    <div className="flex h-full flex-col font-(--font-nunito)">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-table-text-primary mb-1 text-3xl font-bold">
            Chiến dịch hệ thống
          </h1>
          <p className="text-table-text-secondary text-sm">
            Theo dõi và tham gia các chiến dịch do hệ thống tạo
          </p>
        </div>
      </div>

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <Table
          columns={columns}
          // maxHeight='none'
          data={campaigns}
          rowKey="campaignId"
          loading={status === 'pending'}
          emptyMessage="Chưa có chiến dịch hệ thống nào"
        />
      </Box>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalCount={totalCount ?? 0}
        pageSize={pageSize}
        hasPrevious={page > 1}
        hasNext={page < totalPages}
        onPageChange={setPage}
        onPageSizeChange={(newPageSize) => {
          setPageSize(newPageSize);
          setPage(1);
        }}
      />

      <SystemCampaignDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        campaignId={detailsCampaignId}
        vendorBranchIds={vendorBranchIds}
        vendorBranches={vendorBranches}
      />
    </div>
  );
}
