import type { JSX } from 'react';
import type { BranchRegisterRequest } from '@features/moderator/types/branch';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

interface BranchImagesDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  registration: BranchRegisterRequest | null;
}

interface BranchImage {
  branchImageId: number;
  imageUrl: string;
}

export default function BranchImagesDetails({
  isOpen,
  onClose,
  registration,
}: BranchImagesDetailsProps): JSX.Element | null {
  if (!isOpen || !registration) return null;

  const images: BranchImage[] = Array.isArray(
    registration?.branch?.branchImages
  )
    ? (registration.branch?.branchImages as unknown as BranchImage[])
    : [];

  const isImage = (url: string): boolean => {
    const ext = url.split('.').pop()?.toLowerCase() ?? '';
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 transition-opacity"
      onClick={onClose}
    >
      <div
        className="mx-4 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/70 px-6 py-5 sm:px-8">
          <h2 className="text-lg font-bold text-[var(--color-table-text-primary)] sm:text-xl">
            Hình ảnh chi nhánh
          </h2>
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

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 sm:px-8">
          {images.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-10 text-center text-sm text-[var(--color-table-text-secondary)]">
              Không có hình ảnh nào được tải lên
            </div>
          ) : (
            <div className="space-y-4">
              {images.map((image, i) => {
                return (
                  <div
                    key={image.branchImageId}
                    className="overflow-hidden rounded-xl border border-gray-100 shadow-sm"
                  >
                    <div className="flex items-center justify-between border-b border-gray-100 bg-slate-50/80 px-4 py-2.5">
                      <span className="text-sm font-semibold text-[var(--color-table-text-primary)]">
                        Hình ảnh {images.length > 1 ? i + 1 : ''}
                      </span>
                      <a
                        href={image.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-800 hover:underline"
                      >
                        Mở trong tab mới
                      </a>
                    </div>
                    <div className="flex items-center justify-center bg-slate-50/40 p-4">
                      {isImage(image.imageUrl) ? (
                        <img
                          src={image.imageUrl}
                          alt={`Hình ảnh ${i + 1}`}
                          className="max-h-[500px] max-w-full rounded-lg border border-gray-100 bg-white object-contain"
                        />
                      ) : (
                        <div className="rounded-lg border border-dashed border-gray-300 bg-white px-4 py-8 text-gray-400">
                          Không thể hiển thị loại file này
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end border-t border-gray-100 bg-gray-50/60 px-6 py-4 sm:px-8">
          <button
            onClick={onClose}
            type="button"
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 font-medium text-[var(--color-table-text-secondary)] transition-colors hover:bg-gray-100"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
