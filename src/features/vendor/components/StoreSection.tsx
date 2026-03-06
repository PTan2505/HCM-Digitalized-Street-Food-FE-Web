import React, { useMemo, useState, useEffect } from 'react';
import MapLocationPicker from './MapLocationPicker';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import type { JSX } from 'react';

interface StoreSectionProps {
  formData: {
    branchName: string;
    detailAddress: string;
    ward: string;
    city: string;
    latitude: number | null;
    longitude: number | null;
    licenseImages: File[];
  };
  onChange: (field: string, value: unknown) => void;
  onLocationChange: (lat: number, lng: number) => void;
  onFileChange: (files: FileList | null) => void;
  readonly?: boolean;
  hideLicenseUpload?: boolean;
  errors?: {
    branchName?: string;
    detailAddress?: string;
    ward?: string;
    latitude?: string;
    longitude?: string;
  };
}

export default function StoreSection({
  formData,
  onChange,
  onLocationChange,
  onFileChange,
  readonly = false,
  hideLicenseUpload = false,
  errors,
}: StoreSectionProps): JSX.Element {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [fullViewImage, setFullViewImage] = useState<string | null>(null);

  // Ghép địa chỉ đầy đủ để hiển thị trên map
  const fullAddress = useMemo(() => {
    if (!formData.detailAddress || formData.detailAddress.trim() === '') {
      return '';
    }
    return `${formData.detailAddress}, ${formData.city}`;
  }, [formData.detailAddress, formData.city]);

  // Tạo preview URLs khi licenseImages thay đổi
  useEffect(() => {
    const urls = formData.licenseImages.map((file) =>
      URL.createObjectURL(file)
    );
    setPreviewUrls(urls);

    // Cleanup URLs khi component unmount hoặc images thay đổi
    return (): void => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [formData.licenseImages]);

  // Xử lý thêm ảnh mới
  const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      const updatedImages = [...formData.licenseImages, ...newFiles];

      // Tạo DataTransfer để convert array thành FileList
      const dataTransfer = new DataTransfer();
      updatedImages.forEach((file) => dataTransfer.items.add(file));

      onFileChange(dataTransfer.files);
    }
    // Reset input để có thể chọn lại cùng file
    e.target.value = '';
  };

  // Xử lý xóa ảnh
  const handleRemoveImage = (index: number): void => {
    const updatedImages = formData.licenseImages.filter((_, i) => i !== index);

    // Tạo DataTransfer để convert array thành FileList
    const dataTransfer = new DataTransfer();
    updatedImages.forEach((file) => dataTransfer.items.add(file));

    onFileChange(updatedImages.length > 0 ? dataTransfer.files : null);
  };

  // Xử lý xem ảnh full size
  const handleViewFullImage = (url: string): void => {
    setFullViewImage(url);
  };

  // Đóng modal xem ảnh
  const handleCloseFullView = (): void => {
    setFullViewImage(null);
  };

  return (
    <div className="mb-12">
      <h2 className="mb-6 text-lg font-semibold text-gray-800">
        2. Thông tin chi nhánh chính
      </h2>

      {/* Tên cơ sở */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Tên chi nhánh <span className="text-gray-400">(Không bắt buộc)</span>
        </label>
        <input
          type="text"
          placeholder="Chi nhánh Thủ Đức"
          value={formData.branchName}
          onChange={(e) => onChange('branchName', e.target.value)}
          disabled={readonly}
          className={`w-full rounded-xl border px-4 py-3 transition-all duration-200 outline-none ${readonly
            ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-600'
            : errors?.branchName
              ? 'border-red-500 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-200'
              : 'border-gray-200 bg-gray-50 hover:border-gray-400 hover:bg-white focus:border-2 focus:border-[#06AA4C] focus:bg-white'
            }`}
        />
        {errors?.branchName ? (
          <p className="mt-1 text-xs text-red-500">{errors.branchName}</p>
        ) : (
          <div className="mt-2 space-y-1 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-700">
            <p>
              Có thể để trống — nếu không điền, hệ thống sẽ tự động lấy tên cửa
              hàng ở trên cộng thêm chữ số theo thứ tự.
            </p>
            <p>
              <strong>Ví dụ, nếu tên cửa hàng là ABC thì tên chi nhánh sẽ là ABC 1 trong trường hợp bạn để trống trường này</strong>
            </p>
            <p>
              <span className="font-semibold">Nếu có nhiều chi nhánh:</span> Hãy
              tạo chi nhánh chính trước. Sau khi được duyệt, bạn mới có thể tiếp
              tục đăng ký các chi nhánh còn lại.
            </p>
          </div>
        )}
      </div>

      {/* Tỉnh/Thành phố - Cố định TP.HCM */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Tỉnh / Thành phố <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.city}
          disabled
          className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-gray-600"
        />
      </div>

      {/* Ward Phường */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Phường / Xã <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          placeholder="Phường Bình Trưng Tây"
          value={formData.ward}
          onChange={(e) => onChange('ward', e.target.value)}
          disabled={readonly}
          className={`w-full rounded-xl border px-4 py-3 transition-all duration-200 outline-none ${readonly
            ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-600'
            : errors?.ward
              ? 'border-red-500 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-200'
              : 'border-gray-200 bg-gray-50 hover:border-gray-400 hover:bg-white focus:border-2 focus:border-[#06AA4C] focus:bg-white'
            }`}
        />
        {errors?.ward && (
          <p className="mt-1 text-xs text-red-500">{errors.ward}</p>
        )}
      </div>

      {/* Địa chỉ đầy đủ */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Địa chỉ cửa hàng <span className="text-red-500">*</span>
        </label>
        <textarea
          required
          rows={3}
          placeholder="Nhập địa chỉ đầy đủ (VD: 256B Đường Nguyễn Duy Trinh, Phường Bình Trưng Tây, Quận Thủ Đức)"
          value={formData.detailAddress}
          onChange={(e) => onChange('detailAddress', e.target.value)}
          disabled={readonly}
          className={`w-full rounded-xl border px-4 py-3 transition-all duration-200 outline-none ${readonly
            ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-600'
            : errors?.detailAddress
              ? 'border-red-500 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-200'
              : 'border-gray-200 bg-gray-50 hover:border-gray-400 hover:bg-white focus:border-2 focus:border-[#06AA4C] focus:bg-white'
            }`}
        />
        {errors?.detailAddress ? (
          <p className="mt-1 text-xs text-red-500">{errors.detailAddress}</p>
        ) : (
          <p className="mt-2 text-xs text-gray-500">
            Bao gồm số nhà, đường, phường/xã, quận/huyện
          </p>
        )}
      </div>

      {/* Google Maps */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Vị trí trên bản đồ{' '}
          {!readonly && <span className="text-red-500">*</span>}
        </label>
        {readonly ? (
          formData.latitude !== null && formData.longitude !== null ? (
            <div className="pointer-events-none">
              <MapLocationPicker
                address={fullAddress}
                latitude={formData.latitude}
                longitude={formData.longitude}
                onLocationChange={() => { }}
              />
              <p className="mt-2 text-xs text-green-600">
                ✓ Vị trí: {formData.latitude.toFixed(6)},{' '}
                {formData.longitude.toFixed(6)}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Chưa có vị trí</p>
          )
        ) : (
          <>
            <MapLocationPicker
              address={fullAddress}
              latitude={formData.latitude}
              longitude={formData.longitude}
              onLocationChange={onLocationChange}
            />
            {formData.latitude !== null && formData.longitude !== null ? (
              <p className="mt-2 text-xs text-green-600">
                ✓ Vị trí đã chọn: {formData.latitude.toFixed(6)},{' '}
                {formData.longitude.toFixed(6)}
              </p>
            ) : (
              errors?.latitude &&
              errors?.longitude && (
                <p className="mt-2 text-xs text-red-500">
                  {errors.latitude || errors.longitude}
                </p>
              )
            )}
          </>
        )}
      </div>

      {/* Hình ảnh giấy tờ */}
      {!hideLicenseUpload && (
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Hình ảnh giấy phép kinh doanh{' '}
            <span className="text-red-500">*</span>
          </label>

          {/* Upload Button */}
          <div className="mb-4">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-4 transition-all duration-200 hover:border-[#06AA4C] hover:bg-green-50">
              <PhotoIcon className="h-6 w-6 text-gray-400" />
              <span className="text-sm font-medium text-gray-600">
                Thêm hình ảnh
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

          {/* Image Previews */}
          {formData.licenseImages.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {formData.licenseImages.map((file, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white shadow-sm transition-all duration-200 hover:border-[#06AA4C] hover:shadow-md"
                >
                  {/* Image */}
                  <div className="aspect-square w-full overflow-hidden bg-gray-100">
                    <img
                      src={previewUrls[index]}
                      alt={`Preview ${index + 1}`}
                      className="h-full w-full cursor-pointer object-cover transition-transform duration-200 group-hover:scale-105"
                      onClick={() => handleViewFullImage(previewUrls[index])}
                      title="Nhấn để xem kích thước đầy đủ"
                    />
                  </div>

                  {/* File Name */}
                  <div className="p-2">
                    <p
                      className="truncate text-xs text-gray-600"
                      title={file.name}
                    >
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-all duration-200 hover:bg-red-600"
                    title="Xóa ảnh"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>

                  {/* Image Number Badge */}
                  <div className="absolute top-2 left-2 rounded-full bg-black/60 px-2 py-1 text-xs font-semibold text-white">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {formData.licenseImages.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-12">
              <PhotoIcon className="mb-3 h-12 w-12 text-gray-300" />
              <p className="text-sm text-gray-500">Chưa có ảnh nào được chọn</p>
            </div>
          )}
        </div>
      )}

      {/* Full View Image Modal */}
      {fullViewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={handleCloseFullView}
        >
          <div className="relative max-h-[90vh] max-w-[90vw]">
            <img
              src={fullViewImage}
              alt="Full view"
              className="max-h-[90vh] max-w-[90vw] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={handleCloseFullView}
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
