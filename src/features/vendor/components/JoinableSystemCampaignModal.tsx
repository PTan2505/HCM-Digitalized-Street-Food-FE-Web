import { useCallback, useEffect, useMemo, useState } from 'react';
import type { JSX } from 'react';
import { Box, Button, Snackbar, Alert, Tooltip } from '@mui/material';
import CampaignIcon from '@mui/icons-material/Campaign';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import {
  type Controls,
  EVENTS,
  Joyride,
  STATUS,
  type EventData,
} from 'react-joyride';
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
import VendorModalHeader from '@features/vendor/components/VendorModalHeader';
import { getJoinableSystemCampaignTourSteps } from '@features/vendor/utils/joinableSystemCampaignTourSteps';

interface JoinableSystemCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  branchId?: number | null;
  mode?: 'join' | 'detail';
  vendorBranchIds?: number[];
  vendorBranches?: Branch[];
  joinedCampaignIds?: number[];
}

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
  const [pageSize, setPageSize] = useState(5);
  const [joiningCampaignIds, setJoiningCampaignIds] = useState<Set<number>>(
    new Set()
  );
  const [detailsCampaignId, setDetailsCampaignId] = useState<number | null>(
    null
  );
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isTourRunning, setIsTourRunning] = useState(false);
  const [tourInstanceKey, setTourInstanceKey] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    setPage(1);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setIsTourRunning(false);
    }
  }, [isOpen]);

  const fetchJoinableCampaigns = useCallback(async (): Promise<void> => {
    if (!isOpen) return;
    await onGetJoinableSystemCampaigns(page, pageSize);
  }, [isOpen, onGetJoinableSystemCampaigns, page, pageSize]);

  useEffect(() => {
    void fetchJoinableCampaigns();
  }, [fetchJoinableCampaigns]);

  const totalPages = useMemo(() => {
    const pages = Math.ceil((totalCount ?? 0) / pageSize);
    return pages > 0 ? pages : 1;
  }, [totalCount, pageSize]);

  const joinedCampaignIdSet = useMemo(
    () => new Set(joinedCampaignIds),
    [joinedCampaignIds]
  );

  const startSystemCampaignTour = (): void => {
    setTourInstanceKey((prev) => prev + 1);
    setIsTourRunning(true);
  };

  const handleJoyrideEvent = (data: EventData, controls: Controls): void => {
    if (data.type === EVENTS.TARGET_NOT_FOUND) {
      controls.next();
      return;
    }

    if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
      setIsTourRunning(false);
    }
  };

  const tourSteps = useMemo(() => {
    return getJoinableSystemCampaignTourSteps({
      hasRows: campaigns.length > 0,
      mode,
    });
  }, [campaigns.length, mode]);

  const guideAction = (
    <Tooltip title="Hướng dẫn" arrow>
      <button
        type="button"
        onClick={startSystemCampaignTour}
        aria-label="Mở hướng dẫn chiến dịch hệ thống"
        className="text-primary-700 hover:text-primary-800 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition-colors"
      >
        <HelpOutlineIcon fontSize="small" />
      </button>
    </Tooltip>
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
              data-tour="joinable-system-campaign-action"
              className="bg-primary-600 hover:bg-primary-700 rounded-lg px-3 py-1.5 text-sm font-semibold text-white transition-colors"
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
            data-tour="joinable-system-campaign-action"
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
              isJoining || branchId === null || isAlreadyJoined
                ? 'cursor-not-allowed bg-gray-200 text-gray-500'
                : 'bg-primary-600 hover:bg-primary-700 text-white'
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
      <Joyride
        key={tourInstanceKey}
        run={isOpen && isTourRunning}
        steps={tourSteps}
        continuous
        scrollToFirstStep
        onEvent={handleJoyrideEvent}
        options={{
          showProgress: true,
          scrollDuration: 350,
          scrollOffset: 80,
          spotlightPadding: 8,
          overlayColor: 'rgba(15, 23, 42, 0.5)',
          primaryColor: '#7ab82d',
          textColor: '#1f2937',
          zIndex: 1800,
          buttons: ['back', 'skip', 'primary'],
        }}
        locale={{
          back: 'Quay lại',
          close: 'Đóng',
          last: 'Hoàn tất',
          next: 'Tiếp theo',
          nextWithProgress: 'Tiếp theo ({current}/{total})',
          skip: 'Bỏ qua',
        }}
      />

      <div
        className={`fixed inset-0 z-1400 flex items-center justify-center p-4 transition-opacity ${
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
          <div data-tour="joinable-system-campaign-header">
            <VendorModalHeader
              title={
                mode === 'join'
                  ? 'Tham gia chiến dịch hệ thống'
                  : 'Chiến dịch hệ thống khả dụng'
              }
              icon={<CampaignIcon />}
              iconTone="campaign"
              onClose={onClose}
              rightActions={guideAction}
            />
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto p-8">
            <div data-tour="joinable-system-campaign-table-wrapper">
              <Table
                columns={columns}
                data={campaigns}
                rowKey="campaignId"
                loading={status === 'pending'}
                emptyMessage="Không có chiến dịch hệ thống khả dụng"
                maxHeight="none"
                tourId="vendor-joinable-system-campaign"
              />
            </div>

            <div data-tour="joinable-system-campaign-pagination">
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
            </div>
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
