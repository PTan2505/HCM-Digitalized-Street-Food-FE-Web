import { useState, useEffect, useRef } from 'react';
import type { JSX } from 'react';
import type { Branch } from '@features/vendor/types/vendor';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import IconButton from '@mui/material/IconButton';
import { CircularProgress, Dialog, Tooltip } from '@mui/material';
import useVendor from '@features/vendor/hooks/useVendor';
import { useAppSelector } from '@hooks/reduxHooks';
import { selectImages, selectVendorStatus } from '@slices/vendor';
import Pagination from '@features/vendor/components/Pagination';
import VendorModalHeader from '@features/vendor/components/VendorModalHeader';

interface ImagesDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch: Branch | null;
}

const PAGE_SIZE = 9;

export default function ImagesDetailsModal({
  isOpen,
  onClose,
  branch,
}: ImagesDetailsModalProps): JSX.Element | null {
  const { onGetImages, onSubmitImages, onDeleteImage } = useVendor();

  const imagesData = useAppSelector(selectImages);
  const status = useAppSelector(selectVendorStatus);
  const images = imagesData?.items ?? [];
  const currentPage = imagesData?.currentPage ?? 1;
  const totalPages = imagesData?.totalPages ?? 1;
  const totalCount = imagesData?.totalCount ?? 0;
  const hasPrevious = imagesData?.hasPrevious ?? false;
  const hasNext = imagesData?.hasNext ?? false;

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && branch) {
      void onGetImages({
        branchId: branch.branchId,
        params: { pageNumber: 1, pageSize: PAGE_SIZE },
      });
    }
  }, [isOpen, branch, onGetImages]);

  const handlePageChange = (page: number): void => {
    if (!branch) return;
    void onGetImages({
      branchId: branch.branchId,
      params: { pageNumber: page, pageSize: PAGE_SIZE },
    });
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const files = e.target.files;
    if (!files || files.length === 0 || !branch) return;
    const selectedFiles = Array.from(files);
    try {
      await onSubmitImages({
        branchId: branch.branchId,
        images: selectedFiles,
      });
    } catch {
      // Handle error silently
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (confirmDeleteId === null) return;
    setConfirmDeleteId(null);
    try {
      await onDeleteImage(confirmDeleteId);
    } catch {
      // Handle error silently
    }
  };

  if (!isOpen || !branch) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        onClick={onClose}
      >
        <div
          className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <VendorModalHeader
            title="Ảnh chi nhánh"
            subtitle={`${branch.name}${totalCount > 0 ? ` - ${totalCount.toString()} ảnh` : ''}`}
            icon={<PhotoLibraryIcon />}
            iconTone="branch"
            onClose={onClose}
            rightActions={
              <>
                <Tooltip title="Thêm ảnh">
                  <span>
                    <button
                      type="button"
                      className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={status === 'pending'}
                    >
                      {status === 'pending' ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <AddPhotoAlternateIcon fontSize="small" />
                      )}
                      {status === 'pending' ? 'Đang tải...' : 'Thêm ảnh'}
                    </button>
                  </span>
                </Tooltip>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => void handleFileChange(e)}
                />
              </>
            }
          />

          {/* Body */}
          <div className="flex flex-1 flex-col overflow-y-auto px-8 py-6">
            {status === 'pending' && images.length === 0 ? (
              <div className="flex flex-1 items-center justify-center py-20">
                <CircularProgress />
              </div>
            ) : images.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20 text-gray-400">
                <AddPhotoAlternateIcon sx={{ fontSize: 64, opacity: 0.3 }} />
                <p className="text-base font-medium">Chưa có ảnh nào</p>
                <button
                  className="flex items-center gap-2 rounded-lg border-2 border-dashed border-blue-300 px-6 py-3 text-sm font-semibold text-blue-500 transition hover:border-blue-500 hover:text-blue-700"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={status === 'pending'}
                >
                  <AddPhotoAlternateIcon fontSize="small" />
                  Thêm ảnh đầu tiên
                </button>
              </div>
            ) : (
              <>
                {/* Image grid */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {images.map((img) => (
                    <div
                      key={img.branchImageId}
                      className="group relative overflow-hidden rounded-xl border border-gray-100 bg-gray-50 shadow-sm transition hover:shadow-md"
                      style={{ aspectRatio: '4/3' }}
                    >
                      <img
                        src={img.imageUrl}
                        alt={`Ảnh ${img.branchImageId}`}
                        className="h-full w-full object-cover transition duration-200 group-hover:brightness-75"
                        loading="lazy"
                      />
                      {/* Hover overlay actions */}
                      <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        <Tooltip title="Xem ảnh">
                          <IconButton
                            size="small"
                            onClick={() => setPreviewImage(img.imageUrl)}
                            sx={{
                              bgcolor: 'rgba(255,255,255,0.9)',
                              '&:hover': { bgcolor: 'white' },
                            }}
                          >
                            <ZoomInIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xoá ảnh">
                          <span>
                            <IconButton
                              size="small"
                              onClick={() =>
                                setConfirmDeleteId(img.branchImageId)
                              }
                              disabled={status === 'pending'}
                              sx={{
                                bgcolor: 'rgba(255,255,255,0.9)',
                                color: '#ef4444',
                                '&:hover': {
                                  bgcolor: '#fee2e2',
                                  color: '#b91c1c',
                                },
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalCount={totalCount}
                    pageSize={PAGE_SIZE}
                    hasPrevious={hasPrevious}
                    hasNext={hasNext}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}
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

      {/* Confirm delete dialog */}
      {confirmDeleteId !== null && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setConfirmDeleteId(null)}
        >
          <div
            className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
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
                onClick={() => setConfirmDeleteId(null)}
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
