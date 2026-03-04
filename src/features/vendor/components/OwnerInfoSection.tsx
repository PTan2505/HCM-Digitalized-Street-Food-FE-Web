import type { JSX } from 'react';

interface OwnerInfoSectionProps {
  formData: {
    ownerName: string;
    ownerPhone: string;
    email: string;
  };
  onChange: (field: string, value: string) => void;
  readonly?: boolean;
  errors?: {
    ownerName?: string;
    ownerPhone?: string;
    email?: string;
  };
}

export default function OwnerInfoSection({
  formData,
  onChange,
  readonly = false,
  errors,
}: OwnerInfoSectionProps): JSX.Element {
  return (
    <div className="mb-12">
      <h2 className="mb-6 text-lg font-semibold text-gray-800">
        1. Thông tin cửa hàng
      </h2>

      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Tên cửa hàng <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          placeholder="Nhập tên cửa hàng (VD: Quán Phở Hà Nội)"
          value={formData.ownerName}
          onChange={(e) => onChange('ownerName', e.target.value)}
          disabled={readonly}
          className={`w-full rounded-xl border px-4 py-3 transition-all duration-200 outline-none ${
            readonly
              ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-600'
              : errors?.ownerName
                ? 'border-red-500 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-200'
                : 'border-gray-200 bg-gray-50 hover:border-gray-400 hover:bg-white focus:border-2 focus:border-[#06AA4C] focus:bg-white'
          }`}
        />
        {errors?.ownerName && (
          <p className="mt-1 text-xs text-red-500">{errors.ownerName}</p>
        )}
      </div>

      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Số điện thoại liên hệ của cửa hàng{' '}
          <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          required
          placeholder="0901234567"
          value={formData.ownerPhone}
          onChange={(e) => onChange('ownerPhone', e.target.value)}
          disabled={readonly}
          className={`w-full rounded-xl border px-4 py-3 transition-all duration-200 outline-none ${
            readonly
              ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-600'
              : errors?.ownerPhone
                ? 'border-red-500 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-200'
                : 'border-gray-200 bg-gray-50 hover:border-gray-400 hover:bg-white focus:border-2 focus:border-[#06AA4C] focus:bg-white'
          }`}
        />
        {errors?.ownerPhone ? (
          <p className="mt-1 text-xs text-red-500">{errors.ownerPhone}</p>
        ) : (
          !readonly && (
            <p className="mt-2 text-xs text-gray-500">
              Số điện thoại này sẽ được sử dụng để liên hệ
            </p>
          )
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Email liên hệ của cửa hàng <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          placeholder="email@example.com"
          value={formData.email}
          onChange={(e) => onChange('email', e.target.value)}
          disabled={readonly}
          className={`w-full rounded-xl border px-4 py-3 transition-all duration-200 outline-none ${
            readonly
              ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-600'
              : errors?.email
                ? 'border-red-500 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-200'
                : 'border-gray-200 bg-gray-50 hover:border-gray-400 hover:bg-white focus:border-2 focus:border-[#06AA4C] focus:bg-white'
          }`}
        />
        {errors?.email && (
          <p className="mt-1 text-xs text-red-500">{errors.email}</p>
        )}
      </div>
    </div>
  );
}
