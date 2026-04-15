import { useEffect, useState, useCallback } from 'react';
import type { JSX } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Box,
} from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import Table from '@features/admin/components/Table';
import Pagination from '@features/admin/components/Pagination';
import type { Campaign, CampaignBranch } from '@features/admin/types/campaign';
import useCampaign from '@features/admin/hooks/useCampaign';
import AppModalHeader from '@components/AppModalHeader';

interface CampaignBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign | null;
}

export default function CampaignBranchModal({
  isOpen,
  onClose,
  campaign,
}: CampaignBranchModalProps): JSX.Element | null {
  const { onGetBranchesOfACampaign } = useCampaign();

  const [branches, setBranches] = useState<CampaignBranch[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBranches = useCallback(async () => {
    if (!campaign) return;
    setIsLoading(true);
    try {
      const res = await onGetBranchesOfACampaign(
        campaign.campaignId,
        page,
        pageSize
      );
      setBranches(res.items ?? []);
      setTotalCount(res.totalCount ?? 0);
    } catch (err) {
      console.error(err);
      setBranches([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [campaign, onGetBranchesOfACampaign, page, pageSize]);

  useEffect(() => {
    if (isOpen && campaign) {
      void fetchBranches();
    } else {
      setBranches([]);
      setTotalCount(0);
    }
  }, [isOpen, campaign, fetchBranches]);

  if (!isOpen) return null;

  const columns = [
    {
      key: 'name',
      label: 'Tên chi nhánh',
      render: (_: unknown, row: CampaignBranch): React.ReactNode => (
        <Box>
          <Box className="flex items-center gap-2">
            <StorefrontIcon fontSize="small" className="text-primary-600" />
            <Box className="text-table-text-primary font-semibold">
              {row.name}
            </Box>
          </Box>
          {row.tierName != null && (
            <Chip
              label={row.tierName}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.7rem',
                mt: 0.5,
                backgroundColor: 'primary.50',
                color: 'primary.700',
                fontWeight: 'bold',
              }}
            />
          )}
        </Box>
      ),
    },
    {
      key: 'contact',
      label: 'Liên hệ',
      render: (_: unknown, row: CampaignBranch): React.ReactNode => (
        <Box className="text-table-text-secondary text-sm">
          <div>{row.phoneNumber ?? '-'}</div>
          <div>{row.email ?? '-'}</div>
        </Box>
      ),
    },
    {
      key: 'addressDetail',
      label: 'Địa chỉ',
      render: (_: unknown, row: CampaignBranch): React.ReactNode => (
        <Box
          className="text-table-text-secondary block max-w-100 truncate"
          title={row.addressDetail}
        >
          {row.addressDetail.trim() !== '' ? row.addressDetail : '-'}
        </Box>
      ),
    },
  ];

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '85vh',
        },
      }}
    >
      <AppModalHeader
        title="Chi nhánh tham gia chiến dịch"
        subtitle={campaign?.name ?? ''}
        icon={<StorefrontIcon />}
        iconTone="campaign"
        onClose={onClose}
      />
      <DialogContent dividers sx={{ p: 4 }}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              Chiến dịch:{' '}
              <span className="font-semibold text-gray-800">
                {campaign?.name}
              </span>
            </p>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Đang tham gia: {totalCount}
          </span>
        </div>

        <Table
          columns={columns}
          data={branches}
          rowKey="branchId"
          loading={isLoading}
          emptyMessage="Chưa có chi nhánh nào tham gia"
          maxHeight="calc(85vh - 280px)"
        />
        <Box sx={{ mt: 2 }}>
          <Pagination
            currentPage={page}
            totalPages={Math.ceil(totalCount / pageSize)}
            totalCount={totalCount}
            pageSize={pageSize}
            hasPrevious={page > 1}
            hasNext={page < Math.ceil(totalCount / pageSize)}
            onPageChange={setPage}
            onPageSizeChange={(newPageSize) => {
              setPageSize(newPageSize);
              setPage(1);
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
}
