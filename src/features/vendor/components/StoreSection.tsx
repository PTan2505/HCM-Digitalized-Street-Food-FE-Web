import MapLocationPicker from './MapLocationPicker';
import AddressAutocomplete, {
  type AddressSelectData,
} from './AddressAutocomplete';
import type { JSX } from 'react';

interface StoreSectionProps {
  formData: {
    branchName: string;
    detailAddress: string;
    ward: string;
    city: string;
    latitude: number | null;
    longitude: number | null;
  };
  onChange: (field: string, value: unknown) => void;
  onLocationChange: (lat: number, lng: number) => void;
  readonly?: boolean;
  sectionTitle?: string;
  branchNameRequired?: boolean;
  errors?: {
    branchName?: string;
    detailAddress?: string;
    latitude?: string;
    longitude?: string;
  };
}

export default function StoreSection({
  formData,
  onChange,
  onLocationChange,
  readonly = false,
  sectionTitle = '2. Thông tin chi nhánh chính',
  branchNameRequired = false,
  errors,
}: StoreSectionProps): JSX.Element {
  const handleMapAddressResolved = (data: {
    detailAddress: string;
    ward: string;
    city: string;
  }): void => {
    onChange('detailAddress', data.detailAddress);
    if (data.ward) {
      onChange('ward', data.ward);
    }
    if (data.city) {
      onChange('city', data.city);
    }
  };

  // Handle address autocomplete selection — syncs all address fields at once
  const handleAddressSelect = (data: AddressSelectData): void => {
    onChange('detailAddress', data.addressDetail);
    onChange('ward', data.ward);
    onChange('city', data.city || 'Thành phố Hồ Chí Minh');
    if (data.latitude !== null && data.longitude !== null) {
      onLocationChange(data.latitude, data.longitude);
      return;
    }

    onChange('latitude', null);
    onChange('longitude', null);
  };

  return (
    <div className="mb-12">
      <h2 className="mb-6 text-lg font-semibold text-gray-800">
        {sectionTitle}
      </h2>

      {/* Tên cơ sở */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Tên chi nhánh{' '}
          {branchNameRequired ? (
            <span className="text-red-500">*</span>
          ) : (
            <span className="text-gray-400">(Không bắt buộc)</span>
          )}
        </label>
        <input
          type="text"
          placeholder="Chi nhánh Thủ Đức"
          value={formData.branchName}
          onChange={(e) => onChange('branchName', e.target.value)}
          disabled={readonly}
          className={`w-full rounded-xl border px-4 py-3 transition-all duration-200 outline-none ${
            readonly
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
              <strong>
                Ví dụ, nếu tên cửa hàng là ABC thì tên chi nhánh khi hiển thị
                phía người dùng sẽ là ABC 1 trong trường hợp bạn để trống trường
                này
              </strong>
            </p>
          </div>
        )}
      </div>

      {/* Địa chỉ cửa hàng — autocomplete */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Địa chỉ cửa hàng <span className="text-red-500">*</span>
        </label>

        {readonly ? (
          <>
            <input
              type="text"
              value={formData.detailAddress}
              disabled
              className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-600"
            />
            {(formData.ward || formData.city) && (
              <p className="mt-2 text-xs text-gray-500">
                {[formData.ward, formData.city].filter(Boolean).join(', ')}
              </p>
            )}
          </>
        ) : (
          <>
            <AddressAutocomplete
              value={formData.detailAddress}
              onSelect={handleAddressSelect}
              onChange={(val) => onChange('detailAddress', val)}
              error={errors?.detailAddress}
              placeholder="Tìm kiếm địa chỉ cửa hàng..."
            />
            {!errors?.detailAddress && !formData.detailAddress && (
              <p className="mt-2 text-xs text-gray-500">
                Nhập địa chỉ và chọn từ gợi ý để tự động điền phường/tỉnh
              </p>
            )}
          </>
        )}
      </div>

      {/* Bản đồ */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Vị trí trên bản đồ{' '}
          {!readonly && <span className="text-red-500">*</span>}
        </label>
        {readonly ? (
          formData.latitude !== null && formData.longitude !== null ? (
            <div className="pointer-events-none">
              <MapLocationPicker
                address={[formData.detailAddress, formData.ward, formData.city]
                  .filter(Boolean)
                  .join(', ')}
                latitude={formData.latitude}
                longitude={formData.longitude}
                onLocationChange={() => {}}
              />
              <p className="mt-2 text-xs text-green-600">
                Vị trí: {formData.latitude.toFixed(6)},{' '}
                {formData.longitude.toFixed(6)}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Chưa có vị trí</p>
          )
        ) : (
          <>
            <MapLocationPicker
              address={[formData.detailAddress, formData.ward, formData.city]
                .filter(Boolean)
                .join(', ')}
              latitude={formData.latitude}
              longitude={formData.longitude}
              onLocationChange={onLocationChange}
              onAddressResolved={handleMapAddressResolved}
            />
            {/* {formData.latitude !== null && formData.longitude !== null ? (
              <p className="mt-2 text-xs text-green-600">
                ✓ Vị trí đã chọn: {formData.latitude.toFixed(6)},{' '}
                {formData.longitude.toFixed(6)}
              </p>
            ) : (
              (errors?.latitude ?? errors?.longitude) && (
                <p className="mt-2 text-xs text-red-500">
                  {errors?.latitude ?? errors?.longitude}
                </p>
              )
            )} */}
          </>
        )}
      </div>
    </div>
  );
}
