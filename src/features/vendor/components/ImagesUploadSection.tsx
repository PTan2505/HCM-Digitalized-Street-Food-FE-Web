import React, { useState, useEffect } from 'react';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import type { JSX } from 'react';

interface ImagesUploadSectionProps {
  storeImages: File[];
  onFileChange: (files: FileList | null) => void;
  readonly?: boolean;
}

export default function ImagesUploadSection({
  storeImages,
  onFileChange,
  readonly = false,
}: ImagesUploadSectionProps): JSX.Element {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [fullViewImage, setFullViewImage] = useState<string | null>(null);

  useEffect(() => {
    const urls = storeImages.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    return (): void => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [storeImages]);

  const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      const updatedImages = [...storeImages, ...newFiles];
      const dataTransfer = new DataTransfer();
      updatedImages.forEach((file) => dataTransfer.items.add(file));
      onFileChange(dataTransfer.files);
    }
    e.target.value = '';
  };

  const handleRemoveImage = (index: number): void => {
    const updatedImages = storeImages.filter((_, i) => i !== index);
    const dataTransfer = new DataTransfer();
    updatedImages.forEach((file) => dataTransfer.items.add(file));
    onFileChange(updatedImages.length > 0 ? dataTransfer.files : null);
  };

  return (
    <div className="mb-12">
      <h2 className="mb-6 text-lg font-semibold text-gray-800">
        3. Hình ảnh cửa hàng
      </h2>

      {!readonly && (
        <>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Hình ảnh cửa hàng <span className="text-red-500">*</span>
          </label>

          <div className="mb-4">
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#06AA4C] bg-green-50 px-4 py-3 text-sm font-medium text-[#06AA4C] transition-all duration-200 hover:bg-green-100">
              <PhotoIcon className="h-5 w-5" />
              Chọn hình ảnh cửa hàng
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleAddImages}
                className="hidden"
              />
            </label>
          </div>
          <p className="mb-4 text-xs text-gray-500">
            Chọn một hoặc nhiều hình ảnh cửa hàng của bạn (ảnh mặt tiền, nội
            thất, món ăn,...)
          </p>
        </>
      )}

      {storeImages.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {storeImages.map((file, index) => (
            <div key={index} className="group relative">
              <div className="overflow-hidden rounded-xl border-2 border-gray-200 bg-white shadow-sm">
                <img
                  src={previewUrls[index]}
                  alt={file.name}
                  className="h-32 w-full cursor-pointer object-cover transition-transform duration-300 group-hover:scale-105"
                  onClick={() =>
                    previewUrls[index] && setFullViewImage(previewUrls[index])
                  }
                />
                <div className="border-t border-gray-100 px-2 py-1.5">
                  <p className="truncate text-xs text-gray-500">{file.name}</p>
                </div>
              </div>
              {!readonly && (
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition-all duration-200 hover:bg-red-600"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {storeImages.length === 0 && !readonly && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-12">
          <PhotoIcon className="mb-3 h-12 w-12 text-gray-300" />
          <p className="text-sm text-gray-400">Chưa có hình ảnh cửa hàng</p>
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
              className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-700 shadow-lg transition-colors hover:bg-gray-100"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
