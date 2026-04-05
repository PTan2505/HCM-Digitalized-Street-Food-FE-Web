import { useEffect } from 'react';
import type { JSX } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { Voucher } from '@custom-types/voucher';
import { useAppSelector } from '@hooks/reduxHooks';
import { selectCampaigns } from '@slices/campaign';
import useCampaign from '@features/admin/hooks/useCampaign';

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

  const DetailItem = ({
    label,
    value,
  }: {
    label: string;
    value: React.ReactNode;
  }): JSX.Element => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="body2" color="text.secondary" fontWeight="bold">
        {label}
      </Typography>
      <Box sx={{ mt: 0.5 }}>{value}</Box>
    </Box>
  );

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, fontWeight: 'bold', pr: 6 }}>
        Chi tiết voucher: {voucher.name}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={(theme) => ({
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <DetailItem label="ID Voucher" value={voucher.voucherId} />
          </div>
          <div>
            <DetailItem
              label="Mã Voucher"
              value={
                <Chip
                  label={voucher.voucherCode}
                  size="small"
                  color="default"
                  variant="outlined"
                  sx={{ fontWeight: 'bold' }}
                />
              }
            />
          </div>
          <div>
            <DetailItem
              label="Loại"
              value={
                <Chip
                  label={voucher.type === 'PERCENT' ? 'Phần trăm' : 'Giá tiền'}
                  size="small"
                  color={voucher.type === 'PERCENT' ? 'info' : 'primary'}
                />
              }
            />
          </div>
          <div>
            <DetailItem
              label="Trạng thái"
              value={
                <Chip
                  label={voucher.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
                  size="small"
                  color={voucher.isActive ? 'success' : 'error'}
                />
              }
            />
          </div>

          <div>
            <DetailItem
              label="Giá trị giảm"
              value={
                <Typography variant="body1" fontWeight="bold" color="primary">
                  {voucher.type === 'PERCENT'
                    ? `${voucher.discountValue}%`
                    : formatCurrency(voucher.discountValue)}
                </Typography>
              }
            />
          </div>
          <div>
            <DetailItem
              label="Giảm tối đa"
              value={
                voucher.maxDiscountValue !== null
                  ? formatCurrency(voucher.maxDiscountValue)
                  : '-'
              }
            />
          </div>

          <div>
            <DetailItem
              label="Đơn hàng tối thiểu"
              value={formatCurrency(voucher.minAmountRequired)}
            />
          </div>
          <div>
            <DetailItem
              label="Điểm đổi (Redeem Point)"
              value={voucher.redeemPoint}
            />
          </div>

          <div>
            <DetailItem label="Số lượng phát hành" value={voucher.quantity} />
          </div>
          <div>
            <DetailItem
              label="Phân loại"
              value={
                voucher.campaignId ? (
                  <Chip
                    label={`Thuộc về chiến dịch: ${
                      campaigns.find((c) => c.campaignId === voucher.campaignId)
                        ?.name ?? `ID ${voucher.campaignId}`
                    }`}
                    size="small"
                    color="info"
                    variant="outlined"
                    sx={{ fontWeight: 'bold' }}
                  />
                ) : (
                  <Chip
                    label="Thuộc về MarketPlace"
                    size="small"
                    color="secondary"
                    sx={{
                      fontWeight: 'bold',
                    }}
                  />
                )
              }
            />
          </div>

          <div>
            <DetailItem
              label="Ngày bắt đầu"
              value={formatVNDatetime(voucher.startDate)}
            />
          </div>
          <div>
            <DetailItem
              label="Ngày kết thúc"
              value={formatVNDatetime(voucher.endDate)}
            />
          </div>
          <div>
            <DetailItem
              label="Ngày hết hạn truy cập"
              value={formatVNDatetime(voucher.expiredDate)}
            />
          </div>
          <div>
            <DetailItem
              label="Ngày tạo (Hệ thống)"
              value={formatVNDatetime(voucher.createdAt ?? null)}
            />
          </div>

          <div className="sm:col-span-2">
            <DetailItem
              label="Mô tả"
              value={
                <Typography
                  variant="body2"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    bgcolor: 'grey.50',
                    p: 1.5,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'grey.200',
                  }}
                >
                  {voucher.description ?? 'Không có mô tả'}
                </Typography>
              }
            />
          </div>
        </div>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="contained" color="primary">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
}
