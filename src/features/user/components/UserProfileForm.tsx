import type { APIErrorResponse } from '@custom-types/apiResponse';
import type { User } from '@custom-types/user';
import useLogin from '@features/auth/hooks/useLogin';
import { UpdateProfileSchema } from '@features/auth/utils/updateUserProfileSchema';
import useProfile from '@features/user/hooks/useProfile';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppSelector } from '@hooks/reduxHooks';
import { BadgeCheck, CircleAlert } from 'lucide-react';
import { MuiOtpInput } from 'mui-one-time-password-input';
import { selectUser } from '@slices/auth';
import { useEffect, useMemo, useState, type JSX } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@constants/routes';
import type { z } from 'zod';

type UpdateProfileFormData = z.infer<typeof UpdateProfileSchema>;
type VerifiableField = 'email' | 'phoneNumber';

const OTP_TIMEOUT_SECONDS = 6 * 60;

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
  const {
    updateUserProfile,
    requestProfileContactVerification,
    verifyProfileContactOTP,
  } = useProfile();
  const [activeVerificationField, setActiveVerificationField] =
    useState<VerifiableField | null>(null);
  const [isRequestingField, setIsRequestingField] =
    useState<VerifiableField | null>(null);
  const [isVerifyingField, setIsVerifyingField] =
    useState<VerifiableField | null>(null);
  const [otpValue, setOtpValue] = useState<Record<VerifiableField, string>>({
    email: '',
    phoneNumber: '',
  });
  const [countdown, setCountdown] = useState<Record<VerifiableField, number>>({
    email: 0,
    phoneNumber: 0,
  });
  const [otpErrors, setOtpErrors] = useState<Record<VerifiableField, string>>({
    email: '',
    phoneNumber: '',
  });
  const [verifiedState, setVerifiedState] = useState<
    Record<VerifiableField, boolean>
  >({
    email: Boolean(user?.emailVerified),
    phoneNumber: Boolean(user?.phoneNumberVerified),
  });

  useEffect(() => {
    setVerifiedState({
      email: Boolean(user?.emailVerified),
      phoneNumber: Boolean(user?.phoneNumberVerified),
    });
  }, [user?.emailVerified, user?.phoneNumberVerified]);

  useEffect(() => {
    if (!isModal) {
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => ({
        email: prev.email > 0 ? prev.email - 1 : 0,
        phoneNumber: prev.phoneNumber > 0 ? prev.phoneNumber - 1 : 0,
      }));
    }, 1000);

    return (): void => {
      clearInterval(timer);
    };
  }, [isModal]);

  const canVerifyEmail = useMemo(
    () => isModal && Boolean(user?.email) && !verifiedState.email,
    [isModal, user?.email, verifiedState.email]
  );
  const canVerifyPhone = useMemo(
    () => isModal && Boolean(user?.phoneNumber) && !verifiedState.phoneNumber,
    [isModal, user?.phoneNumber, verifiedState.phoneNumber]
  );

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
        navigate(`${ROUTES.USER.BASE}/${ROUTES.USER.PATHS.BRANCH}`, {
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

  const formatCountdown = (seconds: number): string => {
    const minute = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const second = (seconds % 60).toString().padStart(2, '0');
    return `${minute}:${second}`;
  };

  const requestVerificationCode = async (
    field: VerifiableField
  ): Promise<void> => {
    setOtpErrors((prev) => ({ ...prev, [field]: '' }));
    setIsRequestingField(field);

    try {
      await requestProfileContactVerification();
      setActiveVerificationField(field);
      setOtpValue((prev) => ({ ...prev, [field]: '' }));
      setCountdown((prev) => ({ ...prev, [field]: OTP_TIMEOUT_SECONDS }));
    } catch (error) {
      const apiError = error as APIErrorResponse;
      setOtpErrors((prev) => ({
        ...prev,
        [field]: apiError.message ?? 'Không thể gửi mã OTP. Vui lòng thử lại.',
      }));
    } finally {
      setIsRequestingField(null);
    }
  };

  const verifyOtp = async (field: VerifiableField): Promise<void> => {
    if (otpValue[field].length < 6) {
      setOtpErrors((prev) => ({
        ...prev,
        [field]: 'Vui lòng nhập đủ 6 số OTP.',
      }));
      return;
    }

    setOtpErrors((prev) => ({ ...prev, [field]: '' }));
    setIsVerifyingField(field);

    try {
      await verifyProfileContactOTP({
        otp: otpValue[field],
        field,
      });

      setVerifiedState((prev) => ({ ...prev, [field]: true }));
      setActiveVerificationField((current) =>
        current === field ? null : current
      );
      setCountdown((prev) => ({ ...prev, [field]: 0 }));
      setOtpValue((prev) => ({ ...prev, [field]: '' }));
    } catch (error) {
      const apiError = error as APIErrorResponse;
      setOtpErrors((prev) => ({
        ...prev,
        [field]: apiError.message ?? 'Mã OTP không hợp lệ. Vui lòng thử lại.',
      }));
    } finally {
      setIsVerifyingField(null);
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
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <span>Email</span>
              {isModal && verifiedState.email && (
                <span className="inline-flex h-6 items-center gap-1 rounded-full bg-emerald-100 px-2 text-xs font-semibold text-emerald-700">
                  <BadgeCheck size={14} />
                  Đã xác thực
                </span>
              )}
              {canVerifyEmail && (
                <span className="inline-flex h-6 items-center gap-1 rounded-full bg-amber-100 px-2 text-xs font-semibold text-amber-700">
                  <CircleAlert size={14} />
                  Chưa xác thực
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="Nhập email"
                {...register('email')}
                disabled={!!user?.email}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-32 transition-all duration-200 outline-none hover:border-gray-400 hover:bg-white focus:border-2 focus:border-[#06AA4C] focus:bg-white disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 disabled:hover:border-gray-200 disabled:hover:bg-gray-100"
              />
              {canVerifyEmail && (
                <button
                  type="button"
                  onClick={() => requestVerificationCode('email')}
                  disabled={isRequestingField === 'email'}
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded-lg bg-[#06AA4C] px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-[#058f40] disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {isRequestingField === 'email' ? 'Đang gửi...' : 'Xác thực'}
                </button>
              )}
            </div>
            {activeVerificationField === 'email' && canVerifyEmail && (
              <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                <p className="mb-3 text-xs font-medium text-emerald-700">
                  Nhập mã OTP gửi về email để hoàn tất xác thực.
                </p>
                <MuiOtpInput
                  value={otpValue.email}
                  length={6}
                  onChange={(value) => {
                    setOtpValue((prev) => ({ ...prev, email: value }));
                    if (otpErrors.email) {
                      setOtpErrors((prev) => ({ ...prev, email: '' }));
                    }
                  }}
                  TextFieldsProps={(index) => ({
                    placeholder: '-',
                    className: otpValue.email[index] ? 'is-filled' : '',
                  })}
                  sx={{
                    gap: '8px',
                    '& .MuiInputBase-root.MuiOutlinedInput-root': {
                      width: '44px',
                      height: '48px',
                      borderRadius: '12px',
                      border: '1px solid #9ccfb0',
                      backgroundColor: '#ffffff',
                    },
                    '& .MuiInputBase-root.MuiOutlinedInput-root.Mui-focused': {
                      borderColor: '#06AA4C',
                      boxShadow: '0 0 0 2px rgba(6,170,76,0.18)',
                    },
                    '& .MuiInputBase-input': {
                      p: 0,
                      fontWeight: 700,
                      color: '#065f46',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none',
                    },
                  }}
                />
                {otpErrors.email && (
                  <p className="mt-2 text-xs font-medium text-red-500">
                    {otpErrors.email}
                  </p>
                )}
                <div className="mt-3 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => verifyOtp('email')}
                    disabled={isVerifyingField === 'email'}
                    className="rounded-lg bg-[#06AA4C] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[#058f40] disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    {isVerifyingField === 'email'
                      ? 'Đang xác thực...'
                      : 'Xác thực OTP'}
                  </button>
                  <button
                    type="button"
                    onClick={() => requestVerificationCode('email')}
                    disabled={
                      countdown.email > 0 || isRequestingField === 'email'
                    }
                    className="text-xs font-semibold text-emerald-700 underline underline-offset-2 disabled:cursor-not-allowed disabled:text-gray-400"
                  >
                    {countdown.email > 0
                      ? `Gửi lại sau ${formatCountdown(countdown.email)}`
                      : 'Gửi lại mã'}
                  </button>
                </div>
              </div>
            )}
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
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <span>
                Số điện thoại <span className="text-red-500">*</span>
              </span>
              {isModal && verifiedState.phoneNumber && (
                <span className="inline-flex h-6 items-center gap-1 rounded-full bg-emerald-100 px-2 text-xs font-semibold text-emerald-700">
                  <BadgeCheck size={14} />
                  Đã xác thực
                </span>
              )}
              {canVerifyPhone && (
                <span className="inline-flex h-6 items-center gap-1 rounded-full bg-amber-100 px-2 text-xs font-semibold text-amber-700">
                  <CircleAlert size={14} />
                  Chưa xác thực
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type="tel"
                placeholder="Nhập số điện thoại"
                {...register('phoneNumber')}
                disabled={!!user?.phoneNumber}
                className={`w-full rounded-xl border bg-gray-50 px-4 py-3 pr-32 transition-all duration-200 outline-none hover:border-gray-400 hover:bg-white focus:border-2 focus:border-[#06AA4C] focus:bg-white disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 disabled:hover:border-gray-200 disabled:hover:bg-gray-100 ${
                  errors.phoneNumber ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {canVerifyPhone && (
                <button
                  type="button"
                  onClick={() => requestVerificationCode('phoneNumber')}
                  disabled={isRequestingField === 'phoneNumber'}
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded-lg bg-[#06AA4C] px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-[#058f40] disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {isRequestingField === 'phoneNumber'
                    ? 'Đang gửi...'
                    : 'Xác thực'}
                </button>
              )}
            </div>
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-500">
                {errors.phoneNumber.message}
              </p>
            )}
            {activeVerificationField === 'phoneNumber' && canVerifyPhone && (
              <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                <p className="mb-3 text-xs font-medium text-emerald-700">
                  Nhập mã OTP gửi về số điện thoại để hoàn tất xác thực.
                </p>
                <MuiOtpInput
                  value={otpValue.phoneNumber}
                  length={6}
                  onChange={(value) => {
                    setOtpValue((prev) => ({ ...prev, phoneNumber: value }));
                    if (otpErrors.phoneNumber) {
                      setOtpErrors((prev) => ({ ...prev, phoneNumber: '' }));
                    }
                  }}
                  TextFieldsProps={(index) => ({
                    placeholder: '-',
                    className: otpValue.phoneNumber[index] ? 'is-filled' : '',
                  })}
                  sx={{
                    gap: '8px',
                    '& .MuiInputBase-root.MuiOutlinedInput-root': {
                      width: '44px',
                      height: '48px',
                      borderRadius: '12px',
                      border: '1px solid #9ccfb0',
                      backgroundColor: '#ffffff',
                    },
                    '& .MuiInputBase-root.MuiOutlinedInput-root.Mui-focused': {
                      borderColor: '#06AA4C',
                      boxShadow: '0 0 0 2px rgba(6,170,76,0.18)',
                    },
                    '& .MuiInputBase-input': {
                      p: 0,
                      fontWeight: 700,
                      color: '#065f46',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none',
                    },
                  }}
                />
                {otpErrors.phoneNumber && (
                  <p className="mt-2 text-xs font-medium text-red-500">
                    {otpErrors.phoneNumber}
                  </p>
                )}
                <div className="mt-3 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => verifyOtp('phoneNumber')}
                    disabled={isVerifyingField === 'phoneNumber'}
                    className="rounded-lg bg-[#06AA4C] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[#058f40] disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    {isVerifyingField === 'phoneNumber'
                      ? 'Đang xác thực...'
                      : 'Xác thực OTP'}
                  </button>
                  <button
                    type="button"
                    onClick={() => requestVerificationCode('phoneNumber')}
                    disabled={
                      countdown.phoneNumber > 0 ||
                      isRequestingField === 'phoneNumber'
                    }
                    className="text-xs font-semibold text-emerald-700 underline underline-offset-2 disabled:cursor-not-allowed disabled:text-gray-400"
                  >
                    {countdown.phoneNumber > 0
                      ? `Gửi lại sau ${formatCountdown(countdown.phoneNumber)}`
                      : 'Gửi lại mã'}
                  </button>
                </div>
              </div>
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
