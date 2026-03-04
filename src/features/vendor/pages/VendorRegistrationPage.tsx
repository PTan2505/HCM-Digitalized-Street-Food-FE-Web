import { useState, useEffect, type JSX } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import OwnerInfoSection from '../components/OwnerInfoSection';
import StoreSection from '../components/StoreSection';
import TermsDialog from '../components/TermsDialog';
import LicenseStatusBanner from '../components/LicenseStatusBanner';
import useVendorRegistration from '../hooks/useVendorRegistration';
import {
  VendorRegistrationSchema,
  type VendorRegistrationFormData,
} from '../utils/vendorRegistrationSchema';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { Snackbar, Alert, CircularProgress } from '@mui/material';

// ─── Shared UI fragments ─────────────────────────────────────────────
const PAGE_BG =
  'min-h-screen bg-gradient-to-br from-[#f0fdf4] via-white to-[#f0fdf4]';

function PageShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div className={`${PAGE_BG} py-8`}>
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">{title}</h1>
          <p className="text-lg text-gray-600">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

function LogoutButton({ onClick }: { onClick: () => void }): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-red-500 bg-white px-6 py-4 text-base font-semibold text-red-500 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-red-50 hover:shadow-xl active:translate-y-0"
    >
      <ArrowRightOnRectangleIcon className="h-5 w-5" />
      Đăng xuất
    </button>
  );
}

// ─── Title / subtitle / button label maps ────────────────────────────
const TITLE_MAP = {
  resubmit: 'Cập nhật hồ sơ đăng ký',
  uploadLicense: 'Cập nhật giấy phép kinh doanh',
  register: 'Đăng ký trở thành Vendor',
} as const;

const SUBTITLE_MAP = {
  resubmit:
    'Vui lòng cập nhật lại thông tin và giấy phép theo yêu cầu từ quản trị viên',
  uploadLicense: 'Vui lòng tải lên giấy phép kinh doanh để hoàn tất đăng ký',
  register: 'Hoàn thành các bước dưới đây để bắt đầu kinh doanh',
} as const;

const SUBMIT_LABEL_MAP = {
  resubmit: 'Gửi lại hồ sơ',
  uploadLicense: 'Cập nhật giấy phép',
  register: 'Đăng ký cửa hàng',
} as const;

// ─── Main component ──────────────────────────────────────────────────
export default function VendorRegistrationPage(): JSX.Element {
  const [openTerms, setOpenTerms] = useState(false);

  const {
    mode,
    formData,
    snackbar,
    vendorStatus,
    licenseStatusData,
    isFormValid,
    closeSnackbar,
    handleInputChange,
    handleLocationChange,
    handleFileChange,
    handleSubmit,
    onLogout,
  } = useVendorRegistration();

  // Setup react-hook-form cho register mode
  const {
    formState: { errors, isValid: formIsValid, dirtyFields },
    setValue,
    trigger,
  } = useForm<VendorRegistrationFormData>({
    resolver: zodResolver(VendorRegistrationSchema),
    mode: 'all',
    defaultValues: {
      ownerName: '',
      ownerPhone: '',
      email: '',
      branchName: '',
      ward: '',
      detailAddress: '',
      latitude: null,
      longitude: null,
      agreeTerms: false,
    },
  });

  // Sync formData từ hook vào react-hook-form
  useEffect(() => {
    if (mode === 'register') {
      setValue('ownerName', formData.ownerName, { shouldDirty: false });
      setValue('ownerPhone', formData.ownerPhone, { shouldDirty: false });
      setValue('email', formData.email, { shouldDirty: false });
      setValue('branchName', formData.branchName, { shouldDirty: false });
      setValue('ward', formData.ward, { shouldDirty: false });
      setValue('detailAddress', formData.detailAddress, { shouldDirty: false });
      if (formData.latitude !== null)
        setValue('latitude', formData.latitude, { shouldDirty: false });
      if (formData.longitude !== null)
        setValue('longitude', formData.longitude, { shouldDirty: false });
      setValue('agreeTerms', formData.agreeTerms, { shouldDirty: false });
      void trigger(); // Re-validate
    }
  }, [formData, mode, setValue, trigger]);

  // Custom handleInputChange để sync với react-hook-form
  const handleFormInputChange = (field: string, value: unknown): void => {
    handleInputChange(field, value);
    if (mode === 'register') {
      setValue(field as keyof VendorRegistrationFormData, value as never, {
        shouldDirty: true,
      });
      void trigger(field as keyof VendorRegistrationFormData);
    }
  };

  // Custom handleLocationChange để sync với react-hook-form
  const handleFormLocationChange = (lat: number, lng: number): void => {
    handleLocationChange(lat, lng);
    if (mode === 'register') {
      setValue('latitude', lat, { shouldDirty: true });
      setValue('longitude', lng, { shouldDirty: true });
      void trigger(['latitude', 'longitude']);
    }
  };

  // ── Shared snackbar element ────────────────────────────────────────
  const snackbarEl = (
    <Snackbar
      open={snackbar.open}
      autoHideDuration={6000}
      onClose={closeSnackbar}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert
        onClose={closeSnackbar}
        severity={snackbar.severity}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
  );

  // ── Loading state ──────────────────────────────────────────────────
  if (mode === 'loading') {
    return (
      <div className={`flex items-center justify-center ${PAGE_BG}`}>
        <div className="text-center">
          <CircularProgress sx={{ color: '#06AA4C' }} size={48} />
          <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  // ── Shared section props ───────────────────────────────────────────
  const ownerProps = {
    formData: {
      ownerName: formData.ownerName,
      ownerPhone: formData.ownerPhone,
      email: formData.email,
    },
    onChange: mode === 'register' ? handleFormInputChange : handleInputChange,
    readonly: mode === 'viewStatus',
    errors:
      mode === 'register'
        ? {
            ownerName: dirtyFields.ownerName
              ? errors.ownerName?.message
              : undefined,
            ownerPhone: dirtyFields.ownerPhone
              ? errors.ownerPhone?.message
              : undefined,
            email: dirtyFields.email ? errors.email?.message : undefined,
          }
        : undefined,
  } as const;

  const storeFormData = {
    branchName: formData.branchName,
    detailAddress: formData.detailAddress,
    ward: formData.ward,
    city: formData.city,
    latitude: formData.latitude,
    longitude: formData.longitude,
    licenseImages: formData.licenseImages,
  };

  const storeErrors =
    mode === 'register'
      ? {
          branchName: dirtyFields.branchName
            ? errors.branchName?.message
            : undefined,
          detailAddress: dirtyFields.detailAddress
            ? errors.detailAddress?.message
            : undefined,
          ward: dirtyFields.ward ? errors.ward?.message : undefined,
          latitude: dirtyFields.latitude ? errors.latitude?.message : undefined,
          longitude: dirtyFields.longitude
            ? errors.longitude?.message
            : undefined,
        }
      : undefined;

  // ── View status mode ──────────────────────────────────────────────
  if (mode === 'viewStatus') {
    return (
      <PageShell
        title="Thông tin người bán"
        subtitle="Thông tin đăng ký cửa hàng của bạn"
      >
        {licenseStatusData && <LicenseStatusBanner data={licenseStatusData} />}

        <OwnerInfoSection {...ownerProps} />

        <StoreSection
          formData={storeFormData}
          onChange={handleInputChange}
          onLocationChange={handleLocationChange}
          onFileChange={handleFileChange}
          readonly={true}
          hideLicenseUpload={true}
        />

        <div className="mt-10">
          <LogoutButton onClick={onLogout} />
        </div>

        {snackbarEl}
      </PageShell>
    );
  }

  // ── Register / Upload License / Resubmit mode ─────────────────────
  const formMode = mode;

  return (
    <PageShell title={TITLE_MAP[formMode]} subtitle={SUBTITLE_MAP[formMode]}>
      {mode === 'resubmit' && licenseStatusData && (
        <LicenseStatusBanner data={licenseStatusData} />
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <OwnerInfoSection {...ownerProps} />

        <StoreSection
          formData={storeFormData}
          onChange={
            mode === 'register' ? handleFormInputChange : handleInputChange
          }
          onLocationChange={
            mode === 'register'
              ? handleFormLocationChange
              : handleLocationChange
          }
          onFileChange={handleFileChange}
          readonly={mode === 'uploadLicense'}
          errors={storeErrors}
        />

        {/* Terms checkbox – register mode only */}
        {mode === 'register' && (
          <div className="mt-10">
            <label className="flex cursor-pointer items-center">
              <input
                type="checkbox"
                required
                checked={formData.agreeTerms}
                onChange={(e) =>
                  handleFormInputChange('agreeTerms', e.target.checked)
                }
                className="h-4 w-4 rounded border-gray-300 accent-[#06AA4C] outline-none focus:ring-0"
              />
              <span className="ml-2 text-sm text-gray-600">
                Tôi đồng ý với{' '}
                <button
                  type="button"
                  onClick={() => setOpenTerms(true)}
                  className="text-[#06AA4C] underline-offset-2 hover:underline"
                >
                  Điều khoản sử dụng
                </button>
              </span>
            </label>
            {dirtyFields.agreeTerms && errors.agreeTerms && (
              <p className="mt-1 text-xs text-red-500">
                {errors.agreeTerms.message}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-10">
          <button
            type="submit"
            disabled={
              (mode === 'register' && !formIsValid) ||
              (mode !== 'register' && !isFormValid) ||
              vendorStatus === 'pending'
            }
            className="w-full rounded-xl bg-[#06AA4C] px-6 py-4 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#058f40] hover:shadow-xl active:translate-y-0 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
          >
            {vendorStatus === 'pending'
              ? 'Đang xử lý...'
              : SUBMIT_LABEL_MAP[formMode]}
          </button>

          <div className="mt-4">
            <LogoutButton onClick={onLogout} />
          </div>
        </div>
      </form>

      <TermsDialog open={openTerms} onClose={() => setOpenTerms(false)} />
      {snackbarEl}
    </PageShell>
  );
}
