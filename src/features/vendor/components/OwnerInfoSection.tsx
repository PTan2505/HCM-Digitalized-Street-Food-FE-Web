import React from 'react';

interface OwnerInfoSectionProps {
  formData: {
    ownerName: string;
    ownerPhone: string;
    email: string;
  };
  onChange: (field: string, value: string) => void;
}

export default function OwnerInfoSection({
  formData,
  onChange,
}: OwnerInfoSectionProps): JSX.Element {
  return (
    <div className="mb-12">
      <h2 className="mb-6 text-lg font-semibold text-gray-800">
        1. Thông tin chủ quán
      </h2>

      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Họ và tên <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          placeholder="Nguyễn Văn A"
          value={formData.ownerName}
          onChange={(e) => onChange('ownerName', e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-all duration-200 outline-none hover:border-gray-400 hover:bg-white focus:border-2 focus:border-[#06AA4C] focus:bg-white"
        />
      </div>

      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Số điện thoại liên hệ <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          required
          placeholder="0901234567"
          value={formData.ownerPhone}
          onChange={(e) => onChange('ownerPhone', e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-all duration-200 outline-none hover:border-gray-400 hover:bg-white focus:border-2 focus:border-[#06AA4C] focus:bg-white"
        />
        <p className="mt-2 text-xs text-gray-500">
          Số điện thoại này sẽ được sử dụng để liên hệ
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          placeholder="email@example.com"
          value={formData.email}
          onChange={(e) => onChange('email', e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-all duration-200 outline-none hover:border-gray-400 hover:bg-white focus:border-2 focus:border-[#06AA4C] focus:bg-white"
        />
      </div>
    </div>
  );
}
