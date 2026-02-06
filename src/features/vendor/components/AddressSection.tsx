import { useMemo } from 'react';
import MapLocationPicker from './MapLocationPicker';

interface AddressSectionProps {
  formData: {
    province: string;
    district: string;
    ward: string;
    detailAddress: string;
    mapLocation: string;
    latitude: number | null;
    longitude: number | null;
  };
  onChange: (field: string, value: any) => void;
}

export default function AddressSection({
  formData,
  onChange,
}: AddressSectionProps) {
  // Ghép địa chỉ đầy đủ - chỉ lấy địa chỉ chi tiết và TP.HCM
  const fullAddress = useMemo(() => {
    if (!formData.detailAddress || formData.detailAddress.trim() === '') {
      return '';
    }
    return `${formData.detailAddress}, thành phố Hồ Chí Minh`;
  }, [formData.detailAddress]);

  return (
    <div className="mb-12">
      <h2 className="mb-6 text-lg font-semibold text-gray-800">
        3. Địa chỉ cửa hàng
      </h2>

      {/* Tỉnh/Thành phố - Cố định TP.HCM */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Tỉnh / Thành phố <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value="TP. Hồ Chí Minh"
          disabled
          className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-gray-600"
        />
      </div>

      {/* Địa chỉ đầy đủ */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Địa chỉ đầy đủ <span className="text-red-500">*</span>
        </label>
        <textarea
          required
          rows={3}
          placeholder="Nhập địa chỉ đầy đủ (VD: 256B Đường Nguyễn Duy Trinh, Phường Bình Trưng Tây, Quận Thủ Đức)"
          value={formData.detailAddress}
          onChange={(e) => onChange('detailAddress', e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-all duration-200 outline-none hover:border-gray-400 hover:bg-white focus:border-2 focus:border-[#06AA4C] focus:bg-white"
        />
      </div>

      {/* Google Maps */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Chọn vị trí trên bản đồ
        </label>
        <MapLocationPicker
          address={fullAddress}
          latitude={formData.latitude}
          longitude={formData.longitude}
          onLocationChange={(lat, lng) => {
            onChange('latitude', lat);
            onChange('longitude', lng);
          }}
          onAddressChange={(newAddress) => {
            onChange('detailAddress', newAddress);
          }}
        />
      </div>
    </div>
  );
}
