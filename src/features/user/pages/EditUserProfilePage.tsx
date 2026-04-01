import type { JSX } from 'react';
import UserProfileForm from '../components/UserProfileForm';

export default function EditUserProfilePage(): JSX.Element {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0fdf4] via-white to-[#f0fdf4] py-8">
      <div className="mx-auto max-w-2xl px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">
            Cập nhật hồ sơ
          </h1>
          <p className="text-lg text-gray-600">
            Cập nhật thông tin cá nhân của bạn
          </p>
        </div>

        <UserProfileForm />
      </div>
    </div>
  );
}
