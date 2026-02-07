import React from 'react';

const storeTypes = [
  'Quán ăn vỉa hè',
  'Xe đẩy thức ăn',
  'Cửa hàng nhỏ',
  'Quán cafe',
  'Quán trà sữa',
  'Bánh mì',
  'Phở / Bún',
  'Cơm tấm',
  'Khác',
];

interface StoreInfoSectionProps {
  formData: {
    storeName: string;
    storeType: string;
    storePhone: string;
  };
  onChange: (field: string, value: string) => void;
}

export default function StoreInfoSection({
  formData,
  onChange,
}: StoreInfoSectionProps): JSX.Element {
  return (
    <div className="mb-12">
      <h2 className="mb-6 text-lg font-semibold text-gray-800">
        2. Thông tin cửa hàng
      </h2>

      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Tên cửa hàng <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          placeholder="Quán Phở Hà Nội"
          value={formData.storeName}
          onChange={(e) => onChange('storeName', e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-all duration-200 outline-none hover:border-gray-400 hover:bg-white focus:border-2 focus:border-[#06AA4C] focus:bg-white"
        />
      </div>

      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Loại hình cửa hàng <span className="text-red-500">*</span>
        </label>
        <select
          required
          value={formData.storeType}
          onChange={(e) => onChange('storeType', e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-all duration-200 outline-none hover:border-gray-400 hover:bg-white focus:border-2 focus:border-[#06AA4C] focus:bg-white"
        >
          <option value="" disabled>
            Chọn loại hình
          </option>
          {storeTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Số điện thoại cửa hàng
        </label>
        <input
          type="tel"
          placeholder="0901234567"
          value={formData.storePhone}
          onChange={(e) => onChange('storePhone', e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-all duration-200 outline-none hover:border-gray-400 hover:bg-white focus:border-2 focus:border-[#06AA4C] focus:bg-white"
        />
        <p className="mt-2 text-xs text-gray-500">
          Có thể trùng số điện thoại chủ quán
        </p>
      </div>
    </div>
  );
}
