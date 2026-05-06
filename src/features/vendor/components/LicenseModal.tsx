import { useRef, useState } from 'react';
import type { JSX } from 'react';
import { CircularProgress, Dialog, IconButton, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArticleIcon from '@mui/icons-material/Article';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import type { Branch } from '@features/vendor/types/vendor';
import VendorModalHeader from '@features/vendor/components/VendorModalHeader';
import useVendor from '@features/vendor/hooks/useVendor';
import { useAppDispatch } from '@hooks/reduxHooks';
import { getMyVendor } from '@slices/vendor';

interface LicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch: Branch | null;
  /** 'view' = chỉ xem ảnh | 'update' = upload giấy phép mới */
  mode: 'view' | 'update';
  onUploadSuccess?: (licenseUrls: string[]) => void;
}

export default function LicenseModal({
  isOpen,
  onClose,
  branch,
  mode,
  onUploadSuccess,
}: LicenseModalProps): JSX.Element | null {
  const { onSubmitLicense } = useVendor();
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  if (!isOpen || !branch) return null;

  const licenseUrls: string[] = branch.licenseUrls ?? [];
  const isUpdateMode = mode === 'update';

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const result = await onSubmitLicense({
        branchId: branch.branchId,
        licenseImages: Array.from(files),
      });
      setUploadSuccess(true);

      if (onUploadSuccess) {
        onUploadSuccess(result.licenseUrls);
      } else {
        await dispatch(getMyVendor()).unwrap();
      }
    } catch {
      setUploadError('Cập nhật giấy phép thất bại. Vui lòng thử lại.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        onClick={onClose}
      >
        <div
          className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <VendorModalHeader
            title={isUpdateMode ? 'Cập nhật giấy phép' : 'Xem giấy phép'}
            subtitle={branch.name}
            icon={<ArticleIcon />}
            iconTone="branch"
            onClose={onClose}
          />

          {/* Body */}
          <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-8 py-6">
            {/* Upload section — chỉ hiện ở update mode */}
            {isUpdateMode && (
              <div className="rounded-xl border border-dashed border-blue-300 bg-blue-50 p-6">
                <div className="flex flex-col items-center gap-3 text-center">
                  <UploadFileIcon
                    sx={{ fontSize: 40, color: '#3b82f6', opacity: 0.7 }}
                  />
                  <div>
                    <p className="text-sm font-semibold text-blue-700">
                      Tải lên ảnh giấy phép
                    </p>
                    <p className="mt-0.5 text-xs text-blue-400">
                      Hỗ trợ nhiều ảnh cùng lúc
                    </p>
                  </div>

                  {uploadError && (
                    <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                      {uploadError}
                    </p>
                  )}
                  {uploadSuccess && (
                    <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
                      ✓ Cập nhật giấy phép thành công!
                    </p>
                  )}

                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
                  >
                    {uploading ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <UploadFileIcon fontSize="small" />
                    )}
                    {uploading ? 'Đang tải lên...' : 'Chọn ảnh để tải lên'}
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => void handleFileChange(e)}
                  />
                </div>
              </div>
            )}

            {/* License images gallery */}
            {licenseUrls.length > 0 ? (
              <div>
                <p className="mb-4 text-sm font-semibold text-gray-600">
                  Ảnh giấy phép đã nộp ({licenseUrls.length} ảnh)
                </p>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {licenseUrls.map((url, index) => (
                    <div
                      key={index}
                      className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50 shadow-sm transition hover:shadow-md"
                      style={{ aspectRatio: '4/3' }}
                    >
                      <img
                        src={url}
                        alt={`Giấy phép ${index + 1}`}
                        className="h-full w-full object-cover transition duration-200 group-hover:brightness-75"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        <Tooltip title="Xem ảnh lớn">
                          <IconButton
                            size="small"
                            onClick={() => setPreviewImage(url)}
                            sx={{
                              bgcolor: 'rgba(255,255,255,0.9)',
                              '&:hover': { bgcolor: 'white' },
                            }}
                          >
                            <ZoomInIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </div>
                      <div className="absolute right-0 bottom-0 left-0 bg-black/30 py-1 text-center text-xs font-medium text-white">
                        Ảnh {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : !isUpdateMode ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-400">
                <ArticleIcon sx={{ fontSize: 64, opacity: 0.25 }} />
                <p className="text-base font-medium">Chưa có giấy phép nào</p>
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end border-t border-gray-100 bg-gray-50/50 px-8 py-4">
            <button
              onClick={onClose}
              type="button"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <Dialog
        open={previewImage !== null}
        onClose={() => setPreviewImage(null)}
        maxWidth="lg"
        PaperProps={{
          sx: {
            bgcolor: 'transparent',
            boxShadow: 'none',
            overflow: 'visible',
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
            }}
          >
            <CloseIcon />
          </IconButton>
        </div>
      </Dialog>
    </>
  );
}
