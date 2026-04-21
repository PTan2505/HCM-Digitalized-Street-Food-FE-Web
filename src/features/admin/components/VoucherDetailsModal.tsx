import { useEffect } from 'react';
import type { JSX } from 'react';
import { Dialog, DialogContent, Chip } from '@mui/material';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import type { Voucher } from '@custom-types/voucher';
import { useAppSelector } from '@hooks/reduxHooks';
import { selectCampaigns } from '@slices/campaign';
import useCampaign from '@features/admin/hooks/useCampaign';
import AppModalHeader from '@components/AppModalHeader';

interface VoucherDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  voucher: Voucher | null;
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
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    value
  );

const formatDiscountText = (voucher: Voucher): string => {
  if (voucher.type === 'PERCENT') {
    const maxDiscountText = voucher.maxDiscountValue
      ? ` (tối đa ${formatCurrency(voucher.maxDiscountValue)})`
      : '';
    return `${voucher.discountValue}%${maxDiscountText}`;
  }

  return formatCurrency(voucher.discountValue);
};

export default function VoucherDetailsModal({
  isOpen,
  onClose,
  voucher,
}: VoucherDetailsModalProps): JSX.Element | null {
  const { onGetCampaigns } = useCampaign();
  const campaigns = useAppSelector(selectCampaigns);

  useEffect(() => {
    if (isOpen && campaigns.length === 0) {
      void onGetCampaigns(1, 100);
    }
  }, [isOpen, campaigns.length, onGetCampaigns]);

  if (!isOpen || !voucher) return null;

  const campaignName = voucher.campaignId
    ? (campaigns.find((campaign) => campaign.campaignId === voucher.campaignId)
        ?.name ?? 'voucher này thuộc chiến dịch của vendor')
    : null;

  const remainQuantity =
    voucher.remain ?? Math.max(voucher.quantity - voucher.usedQuantity, 0);
  const usagePercent =
    voucher.quantity > 0
      ? Math.min((voucher.usedQuantity / voucher.quantity) * 100, 100)
      : 0;

  const TagBadge = ({
    label,
    type,
  }: {
    label: string;
    type: 'success' | 'error' | 'info' | 'default';
  }): JSX.Element => {
    const colors = {
      success: 'bg-green-100 text-green-700 border-green-200',
      error: 'bg-red-100 text-red-700 border-red-200',
      info: 'bg-blue-100 text-blue-700 border-blue-200',
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

  const DetailItem = ({
    label,
    value,
  }: {
    label: string;
    value: string | number;
  }): JSX.Element => (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
        {label}
      </p>
      <p className="text-table-text-primary mt-1 text-sm font-semibold">
        {value}
      </p>
    </div>
  );

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="lg" fullWidth>
      <AppModalHeader
        title="Chi tiết voucher"
        subtitle={voucher.name}
        icon={<LocalOfferIcon />}
        iconTone="voucher"
        onClose={onClose}
      />
      <DialogContent dividers sx={{ backgroundColor: '#f8fafc' }}>
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Chip
                label={voucher.voucherCode}
                size="small"
                color="default"
                variant="outlined"
                sx={{ fontWeight: 'bold' }}
              />
              <TagBadge
                label={voucher.type === 'PERCENT' ? 'Phần trăm' : 'Giá tiền'}
                type={voucher.type === 'PERCENT' ? 'info' : 'default'}
              />
              <TagBadge
                label={voucher.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
                type={voucher.isActive ? 'success' : 'error'}
              />
              {/* <Chip
                label={
                  campaignName ? `Chiến dịch: ${campaignName}` : 'MarketPlace'
                }
                size="small"
                color={campaignName ? 'info' : 'secondary'}
                variant={campaignName ? 'outlined' : 'filled'}
              /> */}
            </div>

            <div
              className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${campaignName ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}
            >
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Giá trị giảm
                </p>
                <p className="text-primary-700 mt-1 text-sm font-bold">
                  {formatDiscountText(voucher)}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Đơn tối thiểu
                </p>
                <p className="text-table-text-primary mt-1 text-sm font-semibold">
                  {formatCurrency(voucher.minAmountRequired)}
                </p>
              </div>

              {!campaignName && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    Điểm đổi
                  </p>
                  <p className="text-table-text-primary mt-1 text-sm font-semibold">
                    {voucher.redeemPoint}
                  </p>
                </div>
              )}

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Còn lại / Tổng
                </p>
                <p className="text-table-text-primary mt-1 text-sm font-semibold">
                  {remainQuantity} / {voucher.quantity}
                </p>
              </div>
            </div>

            <div className="mt-3">
              <p className="text-table-text-secondary text-xs">
                Đã dùng {voucher.usedQuantity} ({Math.round(usagePercent)}%)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <DetailItem label="Tên voucher" value={voucher.name} />
            <DetailItem
              label="Giảm tối đa"
              value={
                voucher.maxDiscountValue !== null
                  ? formatCurrency(voucher.maxDiscountValue)
                  : '-'
              }
            />
            <DetailItem
              label="Ngày bắt đầu"
              value={formatVNDatetime(voucher.startDate)}
            />
            <DetailItem
              label="Ngày kết thúc"
              value={formatVNDatetime(voucher.endDate)}
            />
            <DetailItem
              label="Ngày hết hạn truy cập"
              value={formatVNDatetime(voucher.expiredDate)}
            />
            <DetailItem
              label="Ngày tạo (Hệ thống)"
              value={formatVNDatetime(voucher.createdAt ?? null)}
            />
            <DetailItem label="Số lượng phát hành" value={voucher.quantity} />
            <DetailItem label="Đã sử dụng" value={voucher.usedQuantity} />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Mô tả
            </p>
            <p className="text-table-text-secondary mt-2 text-sm leading-6 whitespace-pre-wrap">
              {voucher.description ?? 'Không có mô tả'}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
