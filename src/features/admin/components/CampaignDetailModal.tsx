import { useState } from 'react';
import type { JSX } from 'react';
import {
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
} from '@mui/material';
import {
  Campaign as CampaignIcon,
  ZoomIn as ZoomInIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import AppModalHeader from '@components/AppModalHeader';
import type { Campaign } from '@features/admin/types/campaign';

interface CampaignDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign | null;
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
      {isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
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

export default function CampaignDetailModal({
  isOpen,
  onClose,
  campaign,
  isLoading = false,
}: CampaignDetailModalProps): JSX.Element | null {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <DetailItem
                    label="Bắt đầu đăng ký"
                    value={formatVNDatetime(campaign.registrationStartDate)}
                  />
                  <DetailItem
                    label="Kết thúc đăng ký"
                    value={formatVNDatetime(campaign.registrationEndDate)}
                  />
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
                    value={campaign.targetSegment ?? 'Tất cả'}
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

              <Box className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    Tạo lúc
                  </p>
                  <p className="text-table-text-primary mt-1 text-sm font-semibold">
                    {formatVNDatetime(campaign.createdAt)}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    Cập nhật lần cuối
                  </p>
                  <p className="text-table-text-primary mt-1 text-sm font-semibold">
                    {campaign.updatedAt
                      ? formatVNDatetime(campaign.updatedAt)
                      : 'Chưa cập nhật'}
                  </p>
                </div>
              </Box>
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
