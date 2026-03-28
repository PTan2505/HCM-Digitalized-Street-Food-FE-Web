import { useEffect, useMemo, useState } from 'react';
import type { JSX } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Chip,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { CampaignDetailsResponse } from '@features/vendor/types/campaign';
import type { Branch } from '@features/vendor/types/vendor';
import useVendorCampaign from '@features/vendor/hooks/useVendorCampaign';

interface SystemCampaignDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: number | null;
  vendorBranchIds: number[];
  vendorBranches: Branch[];
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

export default function SystemCampaignDetailsModal({
  isOpen,
  onClose,
  campaignId,
  vendorBranchIds,
  vendorBranches,
}: SystemCampaignDetailsModalProps): JSX.Element | null {
  const { onGetSystemCampaignDetails, onJoinBranchToSystemCampaign } =
    useVendorCampaign();

  const [details, setDetails] = useState<CampaignDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBranchIds, setSelectedBranchIds] = useState<number[]>([]);
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || campaignId === null) return;

    const loadDetails = async (): Promise<void> => {
      setIsLoading(true);
      setError(null);
      setSelectedBranchIds([]);
      setJoinError(null);
      try {
        const response = await onGetSystemCampaignDetails(campaignId);
        setDetails(response);
      } catch {
        setError('Không thể tải chi tiết chiến dịch. Vui lòng thử lại.');
        setDetails(null);
      } finally {
        setIsLoading(false);
      }
    };

    void loadDetails();
  }, [isOpen, campaignId, onGetSystemCampaignDetails]);

  const joinableBranches = useMemo(() => {
    if (!details) return [] as Branch[];
    const myBranchSet = new Set(vendorBranchIds);
    const branchMap = new Map(vendorBranches.map((b) => [b.branchId, b]));
    return details.joinableBranch
      .filter((id) => myBranchSet.has(id))
      .map((id) => branchMap.get(id))
      .filter((branch): branch is Branch => branch !== undefined);
  }, [details, vendorBranchIds, vendorBranches]);

  const handleToggleBranch = (id: number): void => {
    setSelectedBranchIds((prev) =>
      prev.includes(id) ? prev.filter((bId) => bId !== id) : [...prev, id]
    );
  };

  const handleJoin = async (): Promise<void> => {
    if (selectedBranchIds.length === 0 || campaignId === null) return;
    setIsJoining(true);
    setJoinError(null);
    try {
      const response = await onJoinBranchToSystemCampaign(
        campaignId,
        selectedBranchIds
      );
      if (response.payment?.paymentUrl) {
        window.location.href = response.payment.paymentUrl;
      } else if (response.branches && response.branches.length > 0) {
        onClose();
      } else {
        setJoinError('Không thể tạo link thanh toán. Vui lòng thử lại.');
      }
    } catch {
      setJoinError('Đã xảy ra lỗi khi tham gia chiến dịch.');
    } finally {
      setIsJoining(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  const renderContent = (): JSX.Element => {
    if (isLoading) {
      return (
        <Box className="flex min-h-[260px] items-center justify-center">
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box className="py-6 text-center text-sm font-medium text-red-500">
          {error}
        </Box>
      );
    }

    if (!details) {
      return (
        <Box className="py-6 text-center text-sm text-gray-500">
          Không có dữ liệu chi tiết.
        </Box>
      );
    }

    return (
      <div className="space-y-4 text-sm">
        <div>
          <p className="mb-1 font-semibold text-gray-700">Tên chiến dịch</p>
          <p className="text-[var(--color-table-text-primary)]">
            {details.name}
          </p>
        </div>

        <div>
          <p className="mb-1 font-semibold text-gray-700">Mô tả</p>
          <p className="text-[var(--color-table-text-primary)]">
            {details.description?.trim() ? details.description : 'Không có'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="mb-1 font-semibold text-gray-700">
              Thời gian diễn ra
            </p>
            <p className="text-[var(--color-table-text-secondary)]">
              Từ: {formatVNDatetime(details.startDate)}
            </p>
            <p className="text-[var(--color-table-text-secondary)]">
              Đến: {formatVNDatetime(details.endDate)}
            </p>
          </div>
          <div>
            <p className="mb-1 font-semibold text-gray-700">
              Thời gian đăng ký
            </p>
            <p className="text-[var(--color-table-text-secondary)]">
              Từ: {formatVNDatetime(details.registrationStartDate)}
            </p>
            <p className="text-[var(--color-table-text-secondary)]">
              Đến: {formatVNDatetime(details.registrationEndDate)}
            </p>
          </div>
        </div>

        <div>
          <p className="mb-1 font-semibold text-gray-700">Phân khúc mục tiêu</p>
          <p className="text-[var(--color-table-text-primary)]">
            {details.targetSegment?.trim() ? details.targetSegment : 'Tất cả'}
          </p>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="font-semibold text-gray-700">
              Chi nhánh của bạn có thể tham gia
            </p>
            {joinableBranches.length > 0 && (
              <button
                onClick={() => {
                  if (selectedBranchIds.length === joinableBranches.length) {
                    setSelectedBranchIds([]);
                  } else {
                    setSelectedBranchIds(
                      joinableBranches.map((b) => b.branchId)
                    );
                  }
                }}
                className="text-xs font-semibold text-[var(--color-primary-600)] transition-colors hover:text-[var(--color-primary-700)] hover:underline"
              >
                {selectedBranchIds.length === joinableBranches.length
                  ? 'Bỏ chọn tất cả'
                  : 'Chọn tất cả'}
              </button>
            )}
          </div>
          {joinableBranches.length === 0 ? (
            <p className="text-sm text-gray-500">Không có chi nhánh phù hợp.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {joinableBranches.map((branch) => {
                const isSelected = selectedBranchIds.includes(branch.branchId);
                return (
                  <Chip
                    key={branch.branchId}
                    label={branch.name}
                    color={isSelected ? 'primary' : 'default'}
                    variant={isSelected ? 'filled' : 'outlined'}
                    onClick={() => handleToggleBranch(branch.branchId)}
                    className="cursor-pointer font-medium transition-all hover:opacity-80"
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-[1500] flex items-center justify-center p-4 transition-opacity ${
          isOpen
            ? 'bg-black/60 opacity-100'
            : 'pointer-events-none bg-transparent opacity-0'
        }`}
        onClick={onClose}
      >
        <div
          className="mx-4 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-8 py-5">
            <div>
              <h2 className="text-xl font-bold text-[var(--color-table-text-primary)] md:text-2xl">
                Chi tiết chiến dịch hệ thống
              </h2>
            </div>
            <IconButton
              aria-label="close"
              onClick={onClose}
              sx={{
                color: 'text.secondary',
                '&:hover': { backgroundColor: 'action.hover' },
              }}
            >
              <CloseIcon />
            </IconButton>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto p-8">{renderContent()}</div>

          {/* Modal Footer */}
          <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50/50 px-8 py-4">
            <Button
              onClick={onClose}
              variant="outlined"
              color="inherit"
              disabled={isJoining}
            >
              Đóng
            </Button>
            {details && joinableBranches.length > 0 && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => void handleJoin()}
                disabled={selectedBranchIds.length === 0 || isJoining}
                className={
                  selectedBranchIds.length === 0 || isJoining
                    ? 'bg-gray-300 text-gray-500'
                    : 'bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)]'
                }
                sx={{ boxShadow: 'none' }}
              >
                {isJoining ? 'Đang tham gia...' : 'Tham gia'}
              </Button>
            )}
          </div>
        </div>
      </div>
      <Snackbar
        open={joinError !== null}
        autoHideDuration={4000}
        onClose={() => setJoinError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ zIndex: 1600 }}
      >
        <Alert severity="error" onClose={() => setJoinError(null)}>
          {joinError}
        </Alert>
      </Snackbar>
    </>
  );
}
