import type { APIErrorResponse } from '@custom-types/apiResponse';
import type { User } from '@custom-types/user';
import useLogin from '@features/auth/hooks/useLogin';
import { UpdateProfileSchema } from '@features/auth/utils/updateUserProfileSchema';
import useProfile from '@features/user/hooks/useProfile';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppSelector } from '@hooks/reduxHooks';
import { selectUser } from '@slices/auth';
import { type JSX } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@constants/routes';
import type { z } from 'zod';

type UpdateProfileFormData = z.infer<typeof UpdateProfileSchema>;

export interface UserProfileFormProps {
  onSuccess?: () => void;
  hideLogout?: boolean;
  isModal?: boolean;
}

export default function UserProfileForm({
  onSuccess,
  hideLogout = false,
  isModal = false,
}: UserProfileFormProps = {}): JSX.Element {
  const user = useAppSelector(selectUser);
  const navigate = useNavigate();
  const { onLogout } = useLogin();
  const { updateUserProfile } = useProfile();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileFormData>({
    defaultValues: {
      username: user?.username ?? '',
      email: user?.email ?? '',
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      phoneNumber: user?.phoneNumber ?? '',
    },
    resolver: zodResolver(UpdateProfileSchema),
  });

  const onSubmit = async (data: UpdateProfileFormData): Promise<void> => {
    try {
      await updateUserProfile(data as Partial<User>, isModal);
      if (onSuccess) {
        onSuccess();
      } else {
        navigate(`${ROUTES.VENDOR.BASE}/${ROUTES.VENDOR.PATHS.BRANCH}`, {
          state: { fromEditProfile: true },
        });
      }
    } catch (error) {
      const err = error as APIErrorResponse;
      if (err.fieldErrors) {
        const errorKeys = Object.keys(err.fieldErrors);
        errorKeys.forEach((key) => {
          const fieldErrors = err.fieldErrors?.[key];
          if (fieldErrors) {
            setError(key as keyof UpdateProfileFormData, {
              type: 'server',
              message: fieldErrors.join(', '),
            });
          }
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Avatar Section */}
      {/* <div className="flex flex-col items-center">
        <div className="relative">
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="Avatar"
              className="h-32 w-32 rounded-full border-4 border-[#06AA4C] object-cover shadow-lg"
            />
          ) : (
            <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-[#06AA4C] bg-gray-100 shadow-lg">
              <span className="text-4xl text-gray-400">👤</span>
            </div>
          )}
          <button
            type="button"
            className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-[#06AA4C] text-white shadow-md transition-all hover:bg-[#058f40] active:scale-95"
          >
            <CameraIcon className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-3 text-sm text-gray-500">
          Nhấn vào biểu tượng máy ảnh để thay đổi ảnh đại diện
        </p>
      </div> */}

      {/* Thông tin cá nhân */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-semibold text-gray-800">
          Thông tin cá nhân
        </h2>

        <div className="space-y-6">
          {/* Username */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Tên người dùng <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Nhập tên người dùng"
              {...register('username')}
              className={`w-full rounded-xl border bg-gray-50 px-4 py-3 transition-all duration-200 outline-none hover:border-gray-400 hover:bg-white focus:border-2 focus:border-[#06AA4C] focus:bg-white ${
                errors.username ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-500">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              placeholder="Nhập email"
              {...register('email')}
              disabled={!!user?.email}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-all duration-200 outline-none hover:border-gray-400 hover:bg-white focus:border-2 focus:border-[#06AA4C] focus:bg-white disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 disabled:hover:border-gray-200 disabled:hover:bg-gray-100"
            />
            {/* <p className="mt-2 text-xs text-gray-500">
              Email không thể thay đổi
            </p> */}
          </div>

          {/* First Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Họ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Nhập họ"
              {...register('firstName')}
              className={`w-full rounded-xl border bg-gray-50 px-4 py-3 transition-all duration-200 outline-none hover:border-gray-400 hover:bg-white focus:border-2 focus:border-[#06AA4C] focus:bg-white ${
                errors.firstName ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-500">
                {errors.firstName.message}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Nhập tên"
              {...register('lastName')}
              className={`w-full rounded-xl border bg-gray-50 px-4 py-3 transition-all duration-200 outline-none hover:border-gray-400 hover:bg-white focus:border-2 focus:border-[#06AA4C] focus:bg-white ${
                errors.lastName ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-500">
                {errors.lastName.message}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Số điện thoại
            </label>
            <input
              type="tel"
              placeholder="Nhập số điện thoại"
              {...register('phoneNumber')}
              disabled={!!user?.phoneNumber}
              className={`w-full rounded-xl border bg-gray-50 px-4 py-3 transition-all duration-200 outline-none hover:border-gray-400 hover:bg-white focus:border-2 focus:border-[#06AA4C] focus:bg-white disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 disabled:hover:border-gray-200 disabled:hover:bg-gray-100 ${
                errors.phoneNumber ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-500">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Submit button */}
      <div className="mt-10">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-[#06AA4C] px-6 py-4 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#058f40] hover:shadow-xl active:translate-y-0 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
        >
          {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>

        {/* Logout button */}
        {!hideLogout && (
          <div className="mt-4">
            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-red-500 bg-white px-6 py-4 text-base font-semibold text-red-500 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-red-50 hover:shadow-xl active:translate-y-0"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              Đăng xuất
            </button>
          </div>
        )}
      </div>
    </form>
  );
}
