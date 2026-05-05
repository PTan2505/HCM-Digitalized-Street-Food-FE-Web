import { useEffect, useMemo, useState } from 'react';
import type { JSX } from 'react';
import { Box, Button, CircularProgress, Chip } from '@mui/material';
import CampaignIcon from '@mui/icons-material/Campaign';
import {
  CalendarToday as CalendarTodayIcon,
  ConfirmationNumber as ConfirmationNumberIcon,
} from '@mui/icons-material';
import type { CampaignDetailsResponse } from '@features/vendor/types/campaign';
import type { Branch } from '@features/vendor/types/vendor';
import useVendorCampaign from '@features/vendor/hooks/useVendorCampaign';
import useVoucher from '@features/admin/hooks/useVoucher';
import useTier from '@features/admin/hooks/useTier';
import type { Voucher } from '@custom-types/voucher';
import VendorModalHeader from '@features/vendor/components/VendorModalHeader';
import type { Tier } from '@features/admin/types/tier';

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

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);

/** Compact voucher card */
const VoucherCard = ({ voucher }: { voucher: Voucher }): JSX.Element => {
  const isPercent = voucher.type === 'PERCENT';
  const remaining = Math.max(voucher.quantity - (voucher.usedQuantity ?? 0), 0);

  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Discount badge */}
      <div
        className="absolute top-0 right-0 rounded-bl-xl px-3 py-1 text-xs font-bold text-white"
        style={{ background: '#8bcf3f' }}
      >
        {isPercent
          ? `−${voucher.discountValue}%`
          : `−${formatCurrency(voucher.discountValue)}`}
      </div>

      <div className="p-4 pr-20">
        {/* Name + code */}
        <p className="truncate text-sm font-bold text-gray-800">
          {voucher.name}
        </p>
        <div className="mt-1 flex items-center gap-1.5">
          <ConfirmationNumberIcon sx={{ fontSize: 12, color: '#9ca3af' }} />
          <code className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] font-semibold tracking-wider text-gray-600">
            {voucher.voucherCode}
          </code>
        </div>

        {/* Meta row */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
          {/* Validity */}
          <span className="flex items-center gap-1">
            <CalendarTodayIcon sx={{ fontSize: 11 }} />
            {formatVNDatetime(voucher.startDate).split(',')[0]} →{' '}
            {formatVNDatetime(voucher.endDate).split(',')[0]}
          </span>

          {/* Remaining */}
          <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 font-semibold text-gray-600">
            Còn lại: {remaining}/{voucher.quantity}
          </span>

          {/* Status */}
          <Chip
            label={voucher.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
            size="small"
            color={voucher.isActive ? 'success' : 'error'}
            variant="outlined"
            sx={{ height: 18, fontSize: '10px', fontWeight: 700 }}
          />
        </div>

        {/* Min spend */}
        {voucher.minAmountRequired > 0 && (
          <p className="mt-1.5 text-[11px] text-gray-400">
            Đơn tối thiểu:{' '}
            <span className="font-semibold text-gray-600">
              {formatCurrency(voucher.minAmountRequired)}
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

const translateTierName = (name: string): string => {
  const normalized = name.trim().toLowerCase();
  if (normalized === 'silver') return 'Bạc';
  if (normalized === 'gold') return 'Vàng';
  if (normalized === 'diamond') return 'Kim cương';
  return name;
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
  const { onGetVouchersByCampaignId } = useVoucher();
  const { onGetAllTiers } = useTier();

  const [details, setDetails] = useState<CampaignDetailsResponse | null>(null);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBranchIds, setSelectedBranchIds] = useState<number[]>([]);
  const [isJoining, setIsJoining] = useState(false);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [isLoadingTiers, setIsLoadingTiers] = useState(false);

  useEffect(() => {
    if (!isOpen || campaignId === null) return;

    const loadDetails = async (): Promise<void> => {
      setIsLoading(true);
      setError(null);
      setSelectedBranchIds([]);
      setVouchers([]);
      try {
        const [campaignResponse, voucherResponse] = await Promise.all([
          onGetSystemCampaignDetails(campaignId),
          onGetVouchersByCampaignId(campaignId).catch(() => [] as Voucher[]),
        ]);
        setDetails(campaignResponse);
        setVouchers(voucherResponse);
      } catch {
        setError('Không thể tải chi tiết chiến dịch. Vui lòng thử lại.');
        setDetails(null);
      } finally {
        setIsLoading(false);
      }
    };

    void loadDetails();
  }, [
    isOpen,
    campaignId,
    onGetSystemCampaignDetails,
    onGetVouchersByCampaignId,
  ]);

  useEffect(() => {
    if (!isOpen) {
      setTiers([]);
      setIsLoadingTiers(false);
      return;
    }

    const loadTiers = async (): Promise<void> => {
      setIsLoadingTiers(true);
      try {
        const response = await onGetAllTiers();
        setTiers(response);
      } catch (loadError) {
        console.error('Failed to fetch tiers', loadError);
        setTiers([]);
      } finally {
        setIsLoadingTiers(false);
      }
    };

    void loadTiers();
  }, [isOpen, onGetAllTiers]);

  const requiredTierLabel = useMemo((): string => {
    if (!details?.requiredTierId) {
      return 'Không yêu cầu';
    }

    if (isLoadingTiers) {
      return 'Đang tải...';
    }

    const tier = tiers.find((item) => item.tierId === details.requiredTierId);
    return tier ? translateTierName(tier.name) : `#${details.requiredTierId}`;
  }, [details?.requiredTierId, isLoadingTiers, tiers]);

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
    try {
      const response = await onJoinBranchToSystemCampaign(
        campaignId,
        selectedBranchIds
      );
      if (response.payment?.paymentUrl) {
        window.location.href = response.payment.paymentUrl;
      } else if (response.branches && response.branches.length > 0) {
        onClose();
      }
    } catch (joinErr) {
      console.error(joinErr);
    } finally {
      setIsJoining(false);
    }
  };

  if (!isOpen) return null;

  const renderContent = (): JSX.Element => {
    if (isLoading) {
      return (
        <Box className="flex min-h-65 items-center justify-center">
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
      <div className="space-y-6 text-sm">
        {/* ── Campaign info ── */}
        <div>
          <p className="mb-1 font-semibold text-gray-700">Tên chiến dịch</p>
          <p className="text-table-text-primary">{details.name}</p>
        </div>

        <div>
          <p className="mb-1 font-semibold text-gray-700">Mô tả</p>
          <p className="text-table-text-primary">
            {details.description?.trim() ? details.description : 'Không có'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="mb-1 font-semibold text-gray-700">
              Thời gian diễn ra
            </p>
            <p className="text-table-text-secondary">
              Từ: {formatVNDatetime(details.startDate)}
            </p>
            <p className="text-table-text-secondary">
              Đến: {formatVNDatetime(details.endDate)}
            </p>
          </div>
          <div>
            <p className="mb-1 font-semibold text-gray-700">
              Thời gian đăng ký
            </p>
            <p className="text-table-text-secondary">
              Từ: {formatVNDatetime(details.registrationStartDate)}
            </p>
            <p className="text-table-text-secondary">
              Đến: {formatVNDatetime(details.registrationEndDate)}
            </p>
          </div>
        </div>

        {/* <div>
          <p className="mb-1 font-semibold text-gray-700">Phân khúc mục tiêu</p>
          <p className="text-table-text-primary">
            {details.targetSegment?.trim() ? details.targetSegment : 'Tất cả'}
          </p>
        </div> */}

        {/* ── Vouchers ── */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="font-semibold text-gray-700">
              Vouchers sẵn có của chiến dịch
              {vouchers.length > 0 && (
                <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-500">
                  {vouchers.length}
                </span>
              )}
            </p>
          </div>

          {vouchers.length === 0 ? (
            <p className="text-table-text-primary">
              Chiến dịch chưa có voucher nào.
            </p>
          ) : (
            <div className="max-h-72 overflow-y-auto pr-1">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {vouchers.map((v) => (
                  <VoucherCard key={v.voucherId} voucher={v} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Joinable branches ── */}
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
                className="text-primary-600 hover:text-primary-700 text-xs font-semibold transition-colors hover:underline"
              >
                {selectedBranchIds.length === joinableBranches.length
                  ? 'Bỏ chọn tất cả'
                  : 'Chọn tất cả'}
              </button>
            )}
          </div>
          {joinableBranches.length === 0 ? (
            <p className="text-sm text-gray-500">
              Không có chi nhánh đạt yêu cầu từ hạng {requiredTierLabel} trở lên
              để tham gia.
            </p>
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
        className={`fixed inset-0 z-1500 flex items-center justify-center p-4 transition-opacity ${
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
          <VendorModalHeader
            title="Chi tiết chiến dịch hệ thống"
            icon={<CampaignIcon />}
            iconTone="campaign"
            onClose={onClose}
          />

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
                sx={{ boxShadow: 'none' }}
              >
                {isJoining ? 'Đang tham gia...' : 'Tham gia'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
