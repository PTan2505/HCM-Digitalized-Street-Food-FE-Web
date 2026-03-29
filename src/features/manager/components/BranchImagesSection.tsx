import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import { CircularProgress, IconButton, Tooltip } from '@mui/material';
import useVendor from '@features/vendor/hooks/useVendor';
import type { Branch } from '@features/vendor/types/vendor';
import { useEffect, useRef, useState } from 'react';
import type { JSX } from 'react';

const PAGE_SIZE = 12;

type BranchImagesSectionProps = {
  branch: Branch;
};

export default function BranchImagesSection({
  branch,
}: BranchImagesSectionProps): JSX.Element {
  const { onGetImages, onSubmitImages, onDeleteImage } = useVendor();

  const [images, setImages] = useState<
    Array<{ branchImageId: number; imageUrl: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadImages = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await onGetImages({
        branchId: branch.branchId,
        params: { pageNumber: 1, pageSize: PAGE_SIZE },
      });
      setImages(response.items ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadImages();
  }, [branch.branchId]);

  const handleUploadImages = async (
    event: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    setUploading(true);
    try {
      await onSubmitImages({
        branchId: branch.branchId,
        images: Array.from(files),
      });
      await loadImages();
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteImage = async (imageId: number): Promise<void> => {
    setDeletingId(imageId);
    try {
      await onDeleteImage(imageId);
      await loadImages();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="border-b border-gray-100 py-3">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold text-gray-600">
          Hình ảnh cửa hàng
        </div>
        <div>
          <button
            type="button"
            className="bg-primary-500 hover:bg-primary-600 inline-flex cursor-pointer items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || loading}
          >
            {uploading ? (
              <CircularProgress size={14} color="inherit" />
            ) : (
              <AddPhotoAlternateIcon sx={{ fontSize: 16 }} />
            )}
            Thêm ảnh
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            multiple
            onChange={(event) => {
              void handleUploadImages(event);
            }}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-4 text-sm text-gray-500">
          <CircularProgress size={16} />
          Đang tải ảnh...
        </div>
      ) : images.length === 0 ? (
        <div className="flex items-center gap-2 rounded-md border border-dashed border-gray-300 bg-gray-50 px-3 py-6 text-sm text-gray-500">
          <ImageIcon sx={{ fontSize: 18 }} />
          Chưa có ảnh cửa hàng
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image) => (
            <div
              key={image.branchImageId}
              className="group relative overflow-hidden rounded-lg border border-gray-200"
            >
              <img
                src={image.imageUrl}
                alt={`branch-image-${image.branchImageId}`}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <Tooltip title="Xem ảnh">
                  <IconButton
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.9)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.75)' },
                    }}
                    onClick={() => setPreviewImage(image.imageUrl)}
                  >
                    <ZoomInIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Xóa ảnh">
                  <span>
                    <IconButton
                      size="small"
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.9)',
                        color: '#dc2626',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.75)' },
                      }}
                      disabled={deletingId === image.branchImageId}
                      onClick={() => {
                        void handleDeleteImage(image.branchImageId);
                      }}
                    >
                      {deletingId === image.branchImageId ? (
                        <CircularProgress size={14} />
                      ) : (
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      )}
                    </IconButton>
                  </span>
                </Tooltip>
              </div>
            </div>
          ))}
        </div>
      )}

      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="image-preview"
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
