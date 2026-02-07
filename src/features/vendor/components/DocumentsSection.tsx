import React from 'react';
import type { JSX } from 'react';

interface DocumentsSectionProps {
  formData: {
    storeAvatar: File | null;
    storeFrontImage: File | null;
    businessLicense: File | null;
    idCard: File | null;
  };
  onFileChange: (
    field: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
}

const FileUploadButton = ({
  label,
  field,
  fileName,
  fileObject,
  onFileChange,
  accept,
}: {
  label: string;
  field: string;
  fileName: string | null;
  fileObject: File | null;
  onFileChange: (
    field: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  accept: string;
}): JSX.Element => {
  const isImage = accept.includes('image');
  const imageUrl =
    fileObject && isImage ? URL.createObjectURL(fileObject) : null;

  return (
    <div className="mb-6">
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <label className="flex w-full cursor-pointer items-center justify-start gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-medium text-gray-600 transition-all duration-200 hover:border-gray-400 hover:bg-white">
        <svg
          className="h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <span>{fileName ?? 'Chọn file'}</span>
        <input
          type="file"
          hidden
          accept={accept}
          onChange={(e) => onFileChange(field, e)}
        />
      </label>
      {fileName && (
        <p className="mt-2 text-sm font-medium text-[#06AA4C]">
          ✓ Đã chọn file
        </p>
      )}
      {imageUrl && (
        <div className="mt-4 max-w-xs overflow-hidden rounded-xl border border-gray-200">
          <img src={imageUrl} alt="Preview" className="block h-auto w-full" />
        </div>
      )}
    </div>
  );
};

export default function DocumentsSection({
  formData,
  onFileChange,
}: DocumentsSectionProps): JSX.Element {
  return (
    <div className="mb-12">
      <h2 className="mb-6 text-lg font-semibold text-gray-800">
        5. Hình ảnh & Giấy tờ
      </h2>

      <FileUploadButton
        label="Ảnh đại diện cửa hàng"
        field="storeAvatar"
        fileName={formData.storeAvatar?.name ?? null}
        fileObject={formData.storeAvatar}
        onFileChange={onFileChange}
        accept="image/*"
      />

      <FileUploadButton
        label="Ảnh mặt tiền cửa hàng"
        field="storeFrontImage"
        fileName={formData.storeFrontImage?.name ?? null}
        fileObject={formData.storeFrontImage}
        onFileChange={onFileChange}
        accept="image/*"
      />

      <FileUploadButton
        label="Giấy phép kinh doanh"
        field="businessLicense"
        fileName={formData.businessLicense?.name ?? null}
        fileObject={formData.businessLicense}
        onFileChange={onFileChange}
        accept="image/*,.pdf"
      />

      <FileUploadButton
        label="CMND/CCCD chủ quán"
        field="idCard"
        fileName={formData.idCard?.name ?? null}
        fileObject={formData.idCard}
        onFileChange={onFileChange}
        accept="image/*,.pdf"
      />
    </div>
  );
}
