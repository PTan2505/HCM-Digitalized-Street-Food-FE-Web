import { useState, useEffect, useRef } from 'react';
import type { JSX } from 'react';
import type { Campaign } from '@features/admin/types/campaign';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import IconButton from '@mui/material/IconButton';
import { CircularProgress, Dialog, Tooltip } from '@mui/material';
import useCampaign from '@features/admin/hooks/useCampaign';
import { useAppSelector } from '@hooks/reduxHooks';
import { selectCampaignStatus, selectCampaigns } from '@slices/campaign';

interface CampaignImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign | null;
}

export default function CampaignImageModal({
  isOpen,
  onClose,
  campaign: propCampaign,
}: CampaignImageModalProps): JSX.Element | null {
  const campaigns = useAppSelector(selectCampaigns);
  const campaign =
    campaigns.find((c) => c.campaignId === propCampaign?.campaignId) ??
    propCampaign;

  const { onGetCampaignImage, onPostCampaignImage, onDeleteCampaignImage } =
    useCampaign();
  const status = useAppSelector(selectCampaignStatus);

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (
      isOpen &&
      campaign?.campaignId &&
      campaign.imageUrl === undefined &&
      status !== 'pending'
    ) {
      void onGetCampaignImage(campaign.campaignId);
    }
  }, [
    isOpen,
    campaign?.campaignId,
    campaign?.imageUrl,
    status,
    onGetCampaignImage,
  ]);

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const files = e.target.files;
    if (!files || files.length === 0 || !campaign) return;
    const file = files[0];
    const formData = new FormData();
    formData.append('image', file);

    try {
      await onPostCampaignImage(campaign.campaignId, formData);
    } catch (err) {
      console.error('Failed to upload image', err);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!campaign) return;
    setConfirmDelete(false);
    try {
      await onDeleteCampaignImage(campaign.campaignId);
    } catch (err) {
      console.error('Failed to delete image', err);
    }
  };

  if (!isOpen || !campaign) return null;

  const currentImageUrl = campaign.imageUrl;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 font-[var(--font-nunito)]"
        onClick={onClose}
      >
        <div
          className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-8 py-5">
            <div>
              <h2 className="text-xl font-bold text-[var(--color-table-text-primary)] md:text-2xl">
                Ảnh chiến dịch
              </h2>
              <p className="mt-1 flex items-center gap-2 text-sm font-medium text-[var(--color-table-text-secondary)]">
                <span className="rounded-md bg-gray-200 px-2 py-0.5 text-xs text-gray-700">
                  #{campaign.campaignId}
                </span>
                {campaign.name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <IconButton
                size="small"
                onClick={onClose}
                sx={{
                  bgcolor: 'white',
                  border: '1px solid #f3f4f6',
                  '&:hover': { bgcolor: '#f3f4f6' },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </div>
          </div>

          {/* Body */}
          <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto bg-gray-50/30 p-8">
            {status === 'pending' && currentImageUrl === undefined ? (
              <div className="flex flex-col items-center gap-4 py-20">
                <CircularProgress />
                <p className="text-sm font-medium text-gray-500 italic">
                  Đang tải dữ liệu ảnh...
                </p>
              </div>
            ) : !currentImageUrl ? (
              <div className="flex flex-col items-center gap-4 py-16 text-center text-gray-400">
                <div className="relative">
                  <AddPhotoAlternateIcon sx={{ fontSize: 100, opacity: 0.1 }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-12 w-12 rounded-full border-4 border-white bg-gray-100 shadow-sm" />
                  </div>
                </div>
                <div>
                  <p className="text-xl font-extrabold text-gray-600">
                    Chưa có ảnh chiến dịch
                  </p>
                  <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-gray-500">
                    Tải lên hình ảnh bắt mắt để thu hút khách hàng tham gia
                    chiến dịch của bạn.
                  </p>
                </div>
                <button
                  className="mt-4 flex items-center gap-2 rounded-xl bg-[var(--color-primary-600)] px-8 py-3 font-bold text-white transition-all hover:bg-[var(--color-primary-700)] hover:shadow-xl active:scale-95"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={status === 'pending'}
                >
                  <AddPhotoAlternateIcon fontSize="small" />
                  Tải lên ảnh ngay
                </button>
              </div>
            ) : (
              <div className="group relative flex min-h-[300px] w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 bg-white p-2 shadow-sm transition hover:border-[var(--color-primary-400)] hover:shadow-md">
                <img
                  src={currentImageUrl}
                  alt="Campaign"
                  className="max-h-[60vh] w-auto max-w-full rounded-xl object-contain shadow-2xl transition duration-500 group-hover:scale-[1.01] group-hover:brightness-90"
                />

                {/* Actions Overlay */}
                <div className="absolute inset-0 flex items-center justify-center gap-6 bg-black/40 opacity-0 backdrop-blur-[2px] transition-all duration-300 group-hover:opacity-100">
                  <Tooltip title="Xem ảnh ban đầu" arrow>
                    <IconButton
                      onClick={() => setPreviewImage(currentImageUrl)}
                      sx={{
                        width: 56,
                        height: 56,
                        bgcolor: 'rgba(255,255,255,0.95)',
                        '&:hover': {
                          bgcolor: 'white',
                          transform: 'scale(1.1)',
                        },
                        transition: 'all 0.2s',
                      }}
                    >
                      <ZoomInIcon fontSize="large" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip
                    title={
                      status === 'pending'
                        ? 'Đang xử lý...'
                        : 'Thay đổi ảnh mới'
                    }
                    arrow
                  >
                    <span>
                      <IconButton
                        onClick={() => fileInputRef.current?.click()}
                        disabled={status === 'pending'}
                        sx={{
                          width: 56,
                          height: 56,
                          bgcolor: 'rgba(255,255,255,0.95)',
                          color: 'var(--color-primary-600)',
                          '&:hover': {
                            bgcolor: 'white',
                            transform: 'scale(1.1)',
                          },
                          transition: 'all 0.2s',
                        }}
                      >
                        {status === 'pending' ? (
                          <CircularProgress size={32} color="inherit" />
                        ) : (
                          <AddPhotoAlternateIcon fontSize="large" />
                        )}
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip
                    title={
                      status === 'pending'
                        ? 'Đang xử lý...'
                        : 'Xoá ảnh hiện tại'
                    }
                    arrow
                  >
                    <span>
                      <IconButton
                        onClick={() => setConfirmDelete(true)}
                        disabled={status === 'pending'}
                        sx={{
                          width: 56,
                          height: 56,
                          bgcolor: 'rgba(255,255,255,0.95)',
                          color: '#ef4444',
                          '&:hover': {
                            bgcolor: '#fee2e2',
                            color: '#b91c1c',
                            transform: 'scale(1.1)',
                          },
                          transition: 'all 0.2s',
                        }}
                      >
                        <DeleteIcon fontSize="large" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void handleFileChange(e)}
            />
          </div>

          <div className="border-t border-gray-100 bg-gray-50/50 px-8 py-4">
            <div className="flex items-center justify-between text-xs font-medium text-gray-500">
              <p>Định dạng hỗ trợ: JPG, PNG, WEBP</p>
              <p>Kích thước khuyên dùng: 1200x675 (16:9)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox preview */}
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
        <div className="relative">
          <img
            src={previewImage ?? ''}
            alt="Preview"
            className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
          />
          <IconButton
            onClick={() => setPreviewImage(null)}
            sx={{
              position: 'absolute',
              top: -16,
              right: -16,
              bgcolor: 'white',
              '&:hover': { bgcolor: '#f3f4f6' },
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            <CloseIcon />
          </IconButton>
        </div>
      </Dialog>

      {/* Confirm delete dialog */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setConfirmDelete(false)}
        >
          <div
            className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 font-[var(--font-nunito)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <DeleteIcon sx={{ color: '#ef4444' }} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-800">Xoá ảnh</h3>
                <p className="text-sm text-gray-500">
                  Hành động này không thể hoàn tác.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                onClick={() => setConfirmDelete(false)}
              >
                Huỷ
              </button>
              <button
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
                onClick={() => void handleDeleteConfirm()}
              >
                Xoá
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
