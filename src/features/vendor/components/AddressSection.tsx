const provinces = [
  'TP. Hồ Chí Minh',
  'Hà Nội',
  'Đà Nẵng',
  'Cần Thơ',
  'Biên Hòa',
];
const districts = ['Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5'];
const wards = [
  'Phường Bến Thành',
  'Phường Nguyễn Thái Bình',
  'Phường Phạm Ngũ Lão',
];

interface AddressSectionProps {
  formData: {
    province: string;
    district: string;
    ward: string;
    detailAddress: string;
    mapLocation: string;
  };
  onChange: (field: string, value: string) => void;
}

export default function AddressSection({
  formData,
  onChange,
}: AddressSectionProps) {
  return (
    <div className="mb-12">
      <h2 className="mb-6 text-lg font-semibold text-gray-800">
        3. Địa chỉ cửa hàng
      </h2>

      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Tỉnh / Thành phố <span className="text-red-500">*</span>
        </label>
        <select
          required
          value={formData.province}
          onChange={(e) => onChange('province', e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-all duration-200 outline-none hover:border-gray-400 hover:bg-white focus:border-2 focus:border-[#06AA4C] focus:bg-white"
        >
          <option value="" disabled>
            Chọn tỉnh/thành phố
          </option>
          {provinces.map((prov) => (
            <option key={prov} value={prov}>
              {prov}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Quận / Huyện <span className="text-red-500">*</span>
        </label>
        <select
          required
          value={formData.district}
          onChange={(e) => onChange('district', e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-all duration-200 outline-none hover:border-gray-400 hover:bg-white focus:border-2 focus:border-[#06AA4C] focus:bg-white"
        >
          <option value="" disabled>
            Chọn quận/huyện
          </option>
          {districts.map((dist) => (
            <option key={dist} value={dist}>
              {dist}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Phường / Xã <span className="text-red-500">*</span>
        </label>
        <select
          required
          value={formData.ward}
          onChange={(e) => onChange('ward', e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-all duration-200 outline-none hover:border-gray-400 hover:bg-white focus:border-2 focus:border-[#06AA4C] focus:bg-white"
        >
          <option value="" disabled>
            Chọn phường/xã
          </option>
          {wards.map((ward) => (
            <option key={ward} value={ward}>
              {ward}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Địa chỉ chi tiết <span className="text-red-500">*</span>
        </label>
        <textarea
          required
          rows={3}
          placeholder="Số nhà, tên đường..."
          value={formData.detailAddress}
          onChange={(e) => onChange('detailAddress', e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-all duration-200 outline-none hover:border-gray-400 hover:bg-white focus:border-2 focus:border-[#06AA4C] focus:bg-white"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Vị trí trên bản đồ
        </label>
        <input
          type="url"
          placeholder="https://maps.google.com/..."
          value={formData.mapLocation}
          onChange={(e) => onChange('mapLocation', e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-all duration-200 outline-none hover:border-gray-400 hover:bg-white focus:border-2 focus:border-[#06AA4C] focus:bg-white"
        />
        <p className="mt-2 text-xs text-gray-500">
          Dán link Google Maps của cửa hàng (nếu có)
        </p>
      </div>
    </div>
  );
}
