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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="mx-4 w-full max-w-3xl rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-bold text-[var(--color-table-text-primary)]">
            Hình ảnh chi nhánh
          </h2>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>

        {/* Modal Content */}
        <div className="max-h-[75vh] overflow-y-auto px-6 py-4">
          {images.length === 0 ? (
            <p className="py-8 text-center text-[var(--color-table-text-secondary)]">
              Không có hình ảnh nào được tải lên
            </p>
          ) : (
            <div className="space-y-4">
              {images.map((image, i) => {
                return (
                  <div
                    key={image.branchImageId}
                    className="overflow-hidden rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center justify-between bg-gray-50 px-4 py-2">
                      <span className="text-sm font-medium text-[var(--color-table-text-primary)]">
                        Hình ảnh {images.length > 1 ? i + 1 : ''}
                      </span>
                      <a
                        href={image.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        Mở trong tab mới
                      </a>
                    </div>
                    <div className="flex items-center justify-center bg-white p-4">
                      {isImage(image.imageUrl) ? (
                        <img
                          src={image.imageUrl}
                          alt={`Hình ảnh ${i + 1}`}
                          className="max-h-[500px] max-w-full rounded object-contain"
                        />
                      ) : (
                        <div className="flex items-center justify-center p-8 text-gray-400">
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
        <div className="flex justify-end border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            type="button"
            className="rounded-lg px-4 py-2 text-[var(--color-table-text-secondary)] transition-colors hover:bg-gray-100"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
