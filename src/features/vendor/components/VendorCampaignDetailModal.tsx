import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import {
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Campaign as CampaignIcon,
  ZoomIn as ZoomInIcon,
  Image as ImageIcon,
  CalendarToday as CalendarTodayIcon,
  ConfirmationNumber as ConfirmationNumberIcon,
} from '@mui/icons-material';
import AppModalHeader from '@components/AppModalHeader';
import type { VendorCampaign } from '@features/vendor/types/campaign';
import type { Voucher } from '@custom-types/voucher';
import useVoucher from '@features/admin/hooks/useVoucher';

interface VendorCampaignDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: VendorCampaign | null;
  isLoading?: boolean;
}

const formatVNDatetime = (isoStr: string | null): string => {
  if (!isoStr) return '-';
  const date = new Date(isoStr);
  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const StatusBadge = ({ isActive }: { isActive: boolean }): JSX.Element => {
  const tone = isActive
    ? 'bg-green-100 text-green-700 border-green-200'
    : 'bg-amber-100 text-amber-700 border-amber-200';

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-bold shadow-sm ${tone}`}
    >
      {isActive ? 'Đang hoạt động' : 'Tạm ngưng hoặc đã kết thúc'}
    </span>
  );
};

const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value: string;
}): JSX.Element => (
  <div className="rounded-lg border border-slate-200 bg-white p-3">
    <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
      {label}
    </p>
    <p className="text-table-text-primary mt-1 text-sm leading-6 font-semibold whitespace-pre-wrap">
      {value}
    </p>
  </div>
);

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
            label={
              voucher.isActive ? 'Đang hoạt động' : 'Tạm ngưng hoặc đã kết thúc'
            }
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

export default function VendorCampaignDetailModal({
  isOpen,
  onClose,
  campaign,
  isLoading = false,
}: VendorCampaignDetailModalProps): JSX.Element | null {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const { onGetVouchersByCampaignId } = useVoucher();

  useEffect(() => {
    if (isOpen && campaign) {
      const loadVouchers = async (): Promise<void> => {
        try {
          const res = await onGetVouchersByCampaignId(campaign.campaignId);
          setVouchers(res);
        } catch {
          setVouchers([]);
        }
      };
      void loadVouchers();
    } else {
      setVouchers([]);
    }
  }, [isOpen, campaign, onGetVouchersByCampaignId]);

  if (!isOpen) return null;

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} maxWidth="lg" fullWidth>
        <AppModalHeader
          title="Chi tiết chiến dịch"
          subtitle={campaign?.name ?? ''}
          icon={<CampaignIcon />}
          iconTone="campaign"
          onClose={onClose}
        />

        <DialogContent dividers sx={{ backgroundColor: '#f8fafc' }}>
          {isLoading ? (
            <div className="flex min-h-56 flex-col items-center justify-center gap-3">
              <CircularProgress />
              <p className="text-sm font-medium text-slate-500 italic">
                Đang tải chi tiết chiến dịch...
              </p>
            </div>
          ) : campaign === null ? (
            <div className="flex min-h-56 flex-col items-center justify-center gap-2 text-slate-500">
              <CampaignIcon sx={{ fontSize: 48, opacity: 0.4 }} />
              <p className="text-sm font-semibold">
                Không có dữ liệu chiến dịch
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <StatusBadge isActive={campaign.isActive} />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <DetailItem
                    label="Bắt đầu chiến dịch"
                    value={formatVNDatetime(campaign.startDate)}
                  />
                  <DetailItem
                    label="Kết thúc chiến dịch"
                    value={formatVNDatetime(campaign.endDate)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
                <div className="space-y-3 lg:col-span-3">
                  <DetailItem label="Tên chiến dịch" value={campaign.name} />
                  <DetailItem
                    label="Phân khúc mục tiêu"
                    value={
                      campaign.targetSegment?.trim()
                        ? campaign.targetSegment
                        : '-'
                    }
                  />
                  <div className="h-28 rounded-lg border border-slate-200 bg-white p-3">
                    <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                      Mô tả
                    </p>
                    <p className="text-table-text-primary mt-1 text-sm leading-6 whitespace-pre-wrap">
                      {campaign.description ?? 'Không có mô tả'}
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="mb-2 flex items-center gap-2">
                      <ImageIcon sx={{ fontSize: 18, color: '#64748b' }} />
                      <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                        Ảnh chiến dịch
                      </p>
                    </div>

                    {campaign.imageUrl ? (
                      <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                        <img
                          src={campaign.imageUrl}
                          alt={campaign.name}
                          className="h-56 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          <IconButton
                            onClick={() =>
                              setPreviewImage(campaign.imageUrl ?? null)
                            }
                            sx={{
                              bgcolor: 'rgba(255,255,255,0.95)',
                              '&:hover': {
                                bgcolor: 'white',
                                transform: 'scale(1.08)',
                              },
                              transition: 'all 0.2s',
                            }}
                          >
                            <ZoomInIcon />
                          </IconButton>
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-56 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-400">
                        <ImageIcon sx={{ fontSize: 42, opacity: 0.5 }} />
                        <p className="mt-2 text-sm font-semibold">
                          Chưa có ảnh
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DetailItem
                  label="Tạo lúc"
                  value={formatVNDatetime(campaign.createdAt)}
                />
                <DetailItem
                  label="Cập nhật lần cuối"
                  value={
                    campaign.updatedAt
                      ? formatVNDatetime(campaign.updatedAt)
                      : 'Chưa cập nhật'
                  }
                />
              </div>

              {/* ── Vouchers ── */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
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
                  <p className="text-sm text-slate-500">
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
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={previewImage !== null}
        onClose={() => setPreviewImage(null)}
        maxWidth="lg"
        PaperProps={{
          sx: {
            bgcolor: 'transparent',
            boxShadow: 'none',
            overflow: 'visible',
            backgroundImage: 'none',
          },
        }}
      >
        <img
          src={previewImage ?? ''}
          alt="Campaign Preview"
          className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
        />
      </Dialog>
    </>
  );
}
