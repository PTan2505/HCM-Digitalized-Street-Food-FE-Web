import React, { useState, useEffect } from 'react';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import type { JSX } from 'react';

interface LicenseUploadSectionProps {
  licenseImages: File[];
  onFileChange: (files: FileList | null) => void;
  readonly?: boolean;
  title?: string;
}

export default function LicenseUploadSection({
  licenseImages,
  onFileChange,
  readonly = false,
  title = '4. Giấy phép kinh doanh',
}: LicenseUploadSectionProps): JSX.Element {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [fullViewImage, setFullViewImage] = useState<string | null>(null);

  useEffect(() => {
    const urls = licenseImages.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    return (): void => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [licenseImages]);

  const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      const updatedImages = [...licenseImages, ...newFiles];
      const dataTransfer = new DataTransfer();
      updatedImages.forEach((file) => dataTransfer.items.add(file));
      onFileChange(dataTransfer.files);
    }
    e.target.value = '';
  };

  const handleRemoveImage = (index: number): void => {
    const updatedImages = licenseImages.filter((_, i) => i !== index);
    const dataTransfer = new DataTransfer();
    updatedImages.forEach((file) => dataTransfer.items.add(file));
    onFileChange(updatedImages.length > 0 ? dataTransfer.files : null);
  };

  return (
    <div className="mb-12">
      <h2 className="mb-6 text-lg font-semibold text-gray-800">{title}</h2>

      {!readonly && (
        <>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Hình ảnh giấy phép kinh doanh{' '}
            <span className="text-gray-400">(Không bắt buộc)</span>
          </label>

          <div className="mb-4">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-4 transition-all duration-200 hover:border-[#06AA4C] hover:bg-green-50">
              <PhotoIcon className="h-6 w-6 text-gray-400" />
              <span className="text-sm font-medium text-gray-600">
                Thêm hình ảnh giấy phép
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleAddImages}
                className="hidden"
              />
            </label>
          </div>
          <p className="mb-4 text-xs text-gray-500">
            Chọn một hoặc nhiều hình ảnh giấy phép kinh doanh/chứng nhận đăng ký
            kinh doanh
          </p>
        </>
      )}

      {licenseImages.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {licenseImages.map((file, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white shadow-sm transition-all duration-200 hover:border-[#06AA4C] hover:shadow-md"
            >
              <div className="aspect-square w-full overflow-hidden bg-gray-100">
                <img
                  src={previewUrls[index]}
                  alt={`Preview ${index + 1}`}
                  className="h-full w-full cursor-pointer object-cover transition-transform duration-200 group-hover:scale-105"
                  onClick={() =>
                    previewUrls[index] && setFullViewImage(previewUrls[index])
                  }
                  title="Nhấn để xem kích thước đầy đủ"
                />
              </div>

              <div className="p-2">
                <p className="truncate text-xs text-gray-600" title={file.name}>
                  {file.name}
                </p>
                <p className="text-xs text-gray-400">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>

              {!readonly && (
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-all duration-200 hover:bg-red-600"
                  title="Xóa ảnh"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}

              <div className="absolute top-2 left-2 rounded-full bg-black/60 px-2 py-1 text-xs font-semibold text-white">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {licenseImages.length === 0 && !readonly && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-12">
          <PhotoIcon className="mb-3 h-12 w-12 text-gray-300" />
          <p className="text-sm text-gray-500">
            Chưa có ảnh giấy phép nào được chọn
          </p>
        </div>
      )}

      {fullViewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setFullViewImage(null)}
        >
          <div className="relative max-h-[90vh] max-w-[90vw]">
            <img
              src={fullViewImage}
              alt="Full view"
              className="max-h-[90vh] max-w-[90vw] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              type="button"
              onClick={() => setFullViewImage(null)}
              className="absolute -top-3 -right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-800 shadow-lg transition-all duration-200 hover:bg-gray-100"
              title="Đóng"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
