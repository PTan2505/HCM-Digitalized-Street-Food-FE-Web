import { useCallback, useEffect, useMemo, useState } from 'react';
import type { JSX } from 'react';
import { Box, Button, Snackbar, Alert } from '@mui/material';
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
} from '@slices/campaign';
import type { Branch } from '@features/vendor/types/vendor';

interface JoinableSystemCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  branchId?: number | null;
  mode?: 'join' | 'detail';
  vendorBranchIds?: number[];
  vendorBranches?: Branch[];
  joinedCampaignIds?: number[];
}

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

export default function JoinableSystemCampaignModal({
  isOpen,
  onClose,
  branchId = null,
  mode = 'join',
  vendorBranchIds = [],
  vendorBranches = [],
  joinedCampaignIds = [],
}: JoinableSystemCampaignModalProps): JSX.Element {
  const campaigns = useAppSelector(selectJoinableSystemCampaigns);
  const totalCount = useAppSelector(selectJoinableSystemCampaignTotalCount);
  const status = useAppSelector(selectCampaignStatus);
  const { onGetJoinableSystemCampaigns, onJoinBranchToSystemCampaign } =
    useVendorCampaign();

  const [page, setPage] = useState(1);
  const [joiningCampaignIds, setJoiningCampaignIds] = useState<Set<number>>(
    new Set()
  );
  const [detailsCampaignId, setDetailsCampaignId] = useState<number | null>(
    null
  );
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setPage(1);
  }, [isOpen]);

  const fetchJoinableCampaigns = useCallback(async (): Promise<void> => {
    if (!isOpen) return;
    await onGetJoinableSystemCampaigns(page, PAGE_SIZE);
  }, [isOpen, onGetJoinableSystemCampaigns, page]);

  useEffect(() => {
    void fetchJoinableCampaigns();
  }, [fetchJoinableCampaigns]);

  const totalPages = useMemo(() => {
    const pages = Math.ceil((totalCount ?? 0) / PAGE_SIZE);
    return pages > 0 ? pages : 1;
  }, [totalCount]);

  const joinedCampaignIdSet = useMemo(
    () => new Set(joinedCampaignIds),
    [joinedCampaignIds]
  );

  const handleJoinCampaign = async (campaignId: number): Promise<void> => {
    if (branchId === null) return;

    setJoiningCampaignIds((prev) => {
      const next = new Set(prev);
      next.add(campaignId);
      return next;
    });

    try {
      const response = await onJoinBranchToSystemCampaign(campaignId, [
        branchId,
      ]);

      if (response.payment?.paymentUrl) {
        window.location.href = response.payment.paymentUrl;
      } else if (response.branches && response.branches.length > 0) {
        // Successfully joined and no payment link needed, do nothing as Redux state handles UI updates
      } else {
        setErrorMsg('Không thể tạo link thanh toán. Vui lòng thử lại.');
      }
    } catch {
      setErrorMsg('Đã xảy ra lỗi khi tạo link thanh toán.');
    } finally {
      setJoiningCampaignIds((prev) => {
        const next = new Set(prev);
        next.delete(campaignId);
        return next;
      });
    }
  };

  const columns = [
    // {
    //   key: 'campaignId',
    //   label: 'ID',
    //   style: { width: '70px' },
    // },
    {
      key: 'name',
      label: 'Tên chiến dịch hệ thống',
      render: (value: unknown): React.ReactNode => (
        <Box className="font-semibold text-[var(--color-table-text-primary)]">
          {typeof value === 'string' ? value : String(value)}
        </Box>
      ),
    },
    {
      key: 'startDate',
      label: 'Thời gian diễn ra',
      render: (_: unknown, row: VendorCampaign): React.ReactNode => (
        <Box className="text-sm text-[var(--color-table-text-secondary)]">
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
          {typeof value === 'string' && value.trim().length > 0
            ? value
            : 'Tất cả'}
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
      key: mode === 'join' ? 'joinAction' : 'detailsAction',
      label: 'Hành động',
      style: { width: '160px' },
      render: (_: unknown, row: VendorCampaign): React.ReactNode => {
        const isJoining = joiningCampaignIds.has(row.campaignId);
        const isAlreadyJoined = joinedCampaignIdSet.has(row.campaignId);

        if (mode === 'detail') {
          return (
            <button
              onClick={() => {
                setDetailsCampaignId(row.campaignId);
                setIsDetailsModalOpen(true);
              }}
              className="rounded-lg bg-[var(--color-primary-600)] px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-700)]"
            >
              Chi tiết
            </button>
          );
        }

        return (
          <button
            onClick={() => {
              void handleJoinCampaign(row.campaignId);
            }}
            disabled={isJoining || branchId === null || isAlreadyJoined}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
              isJoining || branchId === null || isAlreadyJoined
                ? 'cursor-not-allowed bg-gray-200 text-gray-500'
                : 'bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)]'
            }`}
          >
            {isAlreadyJoined
              ? 'Đã tham gia'
              : isJoining
                ? 'Đang tham gia...'
                : 'Tham gia'}
          </button>
        );
      },
    },
  ];

  return (
    <>
      <div
        className={`fixed inset-0 z-[1400] flex items-center justify-center p-4 transition-opacity ${
          isOpen
            ? 'bg-black/60 opacity-100'
            : 'pointer-events-none bg-transparent opacity-0'
        }`}
        onClick={onClose}
      >
        <div
          className="mx-4 flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-8 py-5">
            <div>
              <h2 className="text-xl font-bold text-[var(--color-table-text-primary)] md:text-2xl">
                {mode === 'join'
                  ? 'Tham gia chiến dịch hệ thống'
                  : 'Chiến dịch hệ thống khả dụng'}
              </h2>
            </div>
            {/* <IconButton
              aria-label="close"
              onClick={onClose}
              sx={{
                color: 'text.secondary',
                '&:hover': { backgroundColor: 'action.hover' },
              }}
            >
              <CloseIcon />
            </IconButton> */}
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto p-8">
            <Table
              columns={columns}
              data={campaigns}
              rowKey="campaignId"
              loading={status === 'pending'}
              emptyMessage="Không có chiến dịch hệ thống khả dụng"
              maxHeight="none"
            />

            <Box sx={{ mt: 3 }}>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalCount={totalCount ?? 0}
                pageSize={PAGE_SIZE}
                hasPrevious={page > 1}
                hasNext={page < totalPages}
                onPageChange={setPage}
              />
            </Box>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end border-t border-gray-100 bg-gray-50/50 px-8 py-4">
            <Button onClick={onClose} variant="outlined" color="inherit">
              Đóng
            </Button>
          </div>
        </div>
      </div>

      <SystemCampaignDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setDetailsCampaignId(null);
        }}
        campaignId={detailsCampaignId}
        vendorBranchIds={vendorBranchIds}
        vendorBranches={vendorBranches}
      />

      <Snackbar
        open={errorMsg !== null}
        autoHideDuration={4000}
        onClose={() => setErrorMsg(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setErrorMsg(null)}>
          {errorMsg}
        </Alert>
      </Snackbar>
    </>
  );
}
