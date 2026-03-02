import { useState, useMemo, useEffect, type JSX } from 'react';
import OwnerInfoSection from '../components/OwnerInfoSection';
import StoreSection from '../components/StoreSection';
// import OperatingInfoSection from '../components/OperatingInfoSection';
import TermsDialog from '../components/TermsDialog';
import useLogin from '@features/auth/hooks/useLogin';
import useVendor from '@features/vendor/hooks/useVendor';
// import type { WorkSchedule, DayOff } from '@features/vendor/types/workSchedule';
import {
  ArrowRightOnRectangleIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { loadUserFromStorage, selectUser } from '@slices/auth';
import {
  selectVendorStatus,
  selectMyVendor,
  selectLicenseStatus,
  getMyVendor,
  checkLicenseStatus,
} from '@slices/vendor';
import {
  Snackbar,
  Alert,
  type AlertColor,
  CircularProgress,
} from '@mui/material';

type PageMode = 'loading' | 'register' | 'uploadLicense' | 'viewStatus';

function getLicenseStatusInfo(status: string): {
  label: string;
  color: string;
  bgColor: string;
  icon: JSX.Element;
} {
  switch (status) {
    case 'Accept':
      return {
        label: 'Đã duyệt',
        color: 'text-green-700',
        bgColor: 'bg-green-50 border-green-200',
        icon: <CheckCircleIcon className="h-6 w-6 text-green-500" />,
      };
    case 'Reject':
      return {
        label: 'Bị từ chối',
        color: 'text-red-700',
        bgColor: 'bg-red-50 border-red-200',
        icon: <XCircleIcon className="h-6 w-6 text-red-500" />,
      };
    case 'Pending':
    default:
      return {
        label: 'Đang chờ duyệt',
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-50 border-yellow-200',
        icon: <ClockIcon className="h-6 w-6 text-yellow-500" />,
      };
  }
}

export default function VendorRegistration(): JSX.Element {
  const [openTerms, setOpenTerms] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const { onLogout } = useLogin();
  const {
    onRegisterVendor,
    onSubmitLicense,
    // onSubmitWorkSchedule,
    // onSubmitDayOff,
  } = useVendor();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const vendorStatus = useAppSelector(selectVendorStatus);
  const myVendor = useAppSelector(selectMyVendor);
  const licenseStatusData = useAppSelector(selectLicenseStatus);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({ open: false, message: '', severity: 'info' });

  const showAlert = (message: string, severity: AlertColor = 'info'): void => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = (): void => {
    setSnackbar({ ...snackbar, open: false });
  };

  const [formData, setFormData] = useState({
    ownerName: '',
    ownerPhone: '',
    email: '',
    buildingName: '',
    detailAddress: '',
    ward: '',
    city: 'TP. Hồ Chí Minh',
    latitude: null as number | null,
    longitude: null as number | null,
    licenseImages: [] as File[],
    agreeTerms: false,
  });

  // Operating info state
  // const [workSchedule, setWorkSchedule] = useState<WorkSchedule>({
  //   weekdays: [],
  //   openTime: '08:00',
  //   closeTime: '22:00',
  // });

  // const [dayOff, setDayOff] = useState<DayOff>({
  //   startDate: '',
  //   endDate: '',
  //   startTime: null,
  //   endTime: null,
  // });

  // Determine page mode based on vendor data and license status
  const mode: PageMode = useMemo(() => {
    if (initialLoading) return 'loading';
    if (!myVendor) return 'register';

    const branch = myVendor.branches?.[0];
    if (!branch) return 'register';

    // licenseStatusData is null → show upload form, otherwise show status
    if (!licenseStatusData) return 'uploadLicense';

    return 'viewStatus';
  }, [initialLoading, myVendor, licenseStatusData]);

  // Fetch user profile and vendor data on mount
  useEffect(() => {
    const init = async (): Promise<void> => {
      void dispatch(loadUserFromStorage());
      try {
        const vendor = await dispatch(getMyVendor()).unwrap();
        const branch = vendor.branches?.[0];
        if (branch) {
          // Always check license status when branch exists
          try {
            await dispatch(checkLicenseStatus(branch.branchId)).unwrap();
          } catch {
            // License status not found → will show upload form
          }
        }
      } catch {
        // No vendor found → will show register form
      } finally {
        setInitialLoading(false);
      }
    };
    void init();
  }, [dispatch]);

  // Update form data from user profile (register mode)
  useEffect(() => {
    if (user && mode === 'register') {
      setFormData((prev) => ({
        ...prev,
        ownerName: `${user.firstName} ${user.lastName}`.trim(),
        ownerPhone: user.phoneNumber ?? '',
        email: user.email ?? '',
      }));
    }
  }, [user, mode]);

  // Update form data from vendor data (uploadLicense / viewStatus mode)
  useEffect(() => {
    if (myVendor && (mode === 'uploadLicense' || mode === 'viewStatus')) {
      const branch = myVendor.branches?.[0];
      if (branch) {
        setFormData((prev) => ({
          ...prev,
          ownerName: myVendor.vendorOwnerName || myVendor.name,
          ownerPhone: branch.phoneNumber || '',
          email: branch.email || '',
          buildingName: branch.buildingName || '',
          detailAddress: branch.addressDetail || '',
          ward: branch.ward || '',
          city: branch.city || 'TP. Hồ Chí Minh',
          latitude: branch.lat,
          longitude: branch.long,
        }));
      }
    }
  }, [myVendor, mode]);

  const isFormValid = useMemo(() => {
    if (mode === 'uploadLicense') {
      return formData.licenseImages.length > 0;
    }

    const hasOwnerInfo =
      formData.ownerName.trim() !== '' &&
      formData.ownerPhone.trim() !== '' &&
      formData.agreeTerms;

    const hasStoreInfo =
      formData.buildingName.trim() !== '' &&
      formData.detailAddress.trim() !== '' &&
      formData.ward.trim() !== '' &&
      formData.latitude !== null &&
      formData.longitude !== null &&
      formData.licenseImages.length > 0;

    return hasOwnerInfo && hasStoreInfo;
  }, [formData, mode]);

  const handleInputChange = (field: string, value: unknown): void => {
    setFormData({ ...formData, [field]: value });
  };

  const handleLocationChange = (lat: number, lng: number): void => {
    setFormData({ ...formData, latitude: lat, longitude: lng });
  };

  const handleFileChange = (files: FileList | null): void => {
    if (files) {
      setFormData({ ...formData, licenseImages: Array.from(files) });
    }
  };

  // Format date from dd/mm/yyyy to yyyy-mm-dd for API
  // const formatDateForAPI = (dateStr: string): string => {
  //   if (!dateStr || dateStr?.length !== 10) return dateStr;
  //   const [day, month, year] = dateStr.split('/');
  //   if (!day || !month || !year) return dateStr;
  //   return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  // };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    try {
      // Upload license only mode
      if (mode === 'uploadLicense') {
        const branch = myVendor?.branches?.[0];
        if (!branch) {
          showAlert('Không tìm thấy thông tin chi nhánh.', 'error');
          return;
        }

        if (formData.licenseImages.length === 0) {
          showAlert('Vui lòng chọn ảnh giấy phép kinh doanh.', 'warning');
          return;
        }

        await onSubmitLicense({
          branchId: branch.branchId,
          licenseImages: formData.licenseImages,
        });

        showAlert(
          'Cập nhật giấy phép thành công! Vui lòng chờ quản trị viên xét duyệt.',
          'success'
        );
        return;
      }

      // Full registration mode
      if (!formData.ownerName || !formData.ownerPhone) {
        showAlert(
          'Vui lòng đảm bảo thông tin chủ quán đã được tải.',
          'warning'
        );
        return;
      }

      if (!formData.buildingName) {
        showAlert('Vui lòng nhập tên cửa hàng.', 'warning');
        return;
      }

      if (!formData.ward) {
        showAlert('Vui lòng nhập phường/xã.', 'warning');
        return;
      }

      if (!formData.city) {
        showAlert('Vui lòng chọn tỉnh/thành phố.', 'warning');
        return;
      }

      if (!formData.latitude || !formData.longitude) {
        showAlert('Vui lòng chọn vị trí trên bản đồ.', 'warning');
        return;
      }

      const payload = {
        name: formData.ownerName,
        phoneNumber: formData.ownerPhone,
        email: formData.email || '',
        addressDetail: formData.detailAddress,
        buildingName: formData.buildingName,
        ward: formData.ward,
        city: formData.city,
        lat: formData.latitude,
        long: formData.longitude,
      };

      const vendorResponse = await onRegisterVendor(payload);

      const newBranchId = vendorResponse.branches[0]?.branchId;
      if (!newBranchId) {
        showAlert(
          'Đăng ký vendor thành công nhưng không tìm thấy branch ID.',
          'warning'
        );
        return;
      }

      // Submit license if provided
      if (formData.licenseImages.length > 0) {
        await onSubmitLicense({
          branchId: newBranchId,
          licenseImages: formData.licenseImages,
        });
      }

      // Auto-submit work schedule if configured
      // if (workSchedule.weekdays.length > 0) {
      //   try {
      //     await onSubmitWorkSchedule({
      //       branchId: newBranchId,
      //       data: workSchedule,
      //     });
      //   } catch (error) {
      //     console.error('Failed to submit work schedule:', error);
      //   }
      // }

      // Auto-submit day off if configured
      // if (dayOff.startDate && dayOff.endDate) {
      //   try {
      //     // Validate and convert date format from dd/mm/yyyy to yyyy-mm-dd
      //     const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
      //     if (
      //       dateRegex.test(dayOff.startDate) &&
      //       dateRegex.test(dayOff.endDate)
      //     ) {
      //       const apiData = {
      //         startDate: formatDateForAPI(dayOff.startDate),
      //         endDate: formatDateForAPI(dayOff.endDate),
      //         startTime: dayOff.startTime,
      //         endTime: dayOff.endTime,
      //       };
      //       await onSubmitDayOff({
      //         branchId: newBranchId,
      //         data: apiData,
      //       });
      //     }
      //   } catch (error) {
      //     console.error('Failed to submit day off:', error);
      //   }
      // }

      showAlert(
        'Đăng ký thành công! Vui lòng chờ quản trị viên xét duyệt.',
        'success'
      );
    } catch (error) {
      let errorMessage = 'Thao tác thất bại. Vui lòng thử lại.';

      if (error && typeof error === 'object') {
        const err = error as { message?: string; code?: string };

        if (err.message) {
          if (err.message.includes('already has a vendor account')) {
            errorMessage = 'Tài khoản của bạn đã đăng ký làm vendor rồi!';
          } else if (err.message === 'Bad Request') {
            errorMessage =
              'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.';
          } else {
            errorMessage = err.message;
          }
        }
      }

      showAlert(errorMessage, 'error');
    }
  };

  // --- Loading state ---
  if (mode === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f0fdf4] via-white to-[#f0fdf4]">
        <div className="text-center">
          <CircularProgress sx={{ color: '#06AA4C' }} size={48} />
          <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  // --- View license status mode ---
  if (mode === 'viewStatus') {
    const branch = myVendor!.branches[0];
    const statusInfo = getLicenseStatusInfo(licenseStatusData!.status);

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f0fdf4] via-white to-[#f0fdf4] py-8">
        <div className="mx-auto max-w-4xl px-4">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-4xl font-bold text-gray-900">
              Thông tin Vendor
            </h1>
            <p className="text-lg text-gray-600">
              Thông tin đăng ký cửa hàng của bạn
            </p>
          </div>

          {/* License Status */}
          <div
            className={`mb-8 rounded-2xl border-2 p-6 ${statusInfo.bgColor}`}
          >
            <div className="flex items-center gap-3">
              {statusInfo.icon}
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Trạng thái giấy phép
                </h3>
                <p className={`text-sm font-medium ${statusInfo.color}`}>
                  {statusInfo.label}
                </p>
              </div>
            </div>
            {branch.licenseRejectReason && (
              <div className="mt-3 rounded-lg bg-white/60 p-3">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Lý do từ chối:</span>{' '}
                  {branch.licenseRejectReason}
                </p>
              </div>
            )}
          </div>

          {/* Owner Info */}
          <OwnerInfoSection
            formData={{
              ownerName: formData.ownerName,
              ownerPhone: formData.ownerPhone,
              email: formData.email,
            }}
            onChange={handleInputChange}
            readonly={true}
          />

          {/* Store Info (readonly, no license upload) */}
          <StoreSection
            formData={{
              buildingName: formData.buildingName,
              detailAddress: formData.detailAddress,
              ward: formData.ward,
              city: formData.city,
              latitude: formData.latitude,
              longitude: formData.longitude,
              licenseImages: formData.licenseImages,
            }}
            onChange={handleInputChange}
            onLocationChange={handleLocationChange}
            onFileChange={handleFileChange}
            readonly={true}
            hideLicenseUpload={true}
          />

          {/* Operating Info Section */}
          {/* <div className="mb-8">
            <OperatingInfoSection branchId={branch.branchId} />
          </div> */}

          {/* Logout button */}
          <div className="mt-10">
            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-red-500 bg-white px-6 py-4 text-base font-semibold text-red-500 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-red-50 hover:shadow-xl active:translate-y-0"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              Đăng xuất
            </button>
          </div>
        </div>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
    );
  }

  // --- Register mode / Upload License mode ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0fdf4] via-white to-[#f0fdf4] py-8">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">
            {mode === 'uploadLicense'
              ? 'Cập nhật giấy phép kinh doanh'
              : 'Đăng ký trở thành Vendor'}
          </h1>
          <p className="text-lg text-gray-600">
            {mode === 'uploadLicense'
              ? 'Vui lòng tải lên giấy phép kinh doanh để hoàn tất đăng ký'
              : 'Hoàn thành các bước dưới đây để bắt đầu kinh doanh'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <OwnerInfoSection
            formData={{
              ownerName: formData.ownerName,
              ownerPhone: formData.ownerPhone,
              email: formData.email,
            }}
            onChange={handleInputChange}
            readonly={true}
          />

          <StoreSection
            formData={{
              buildingName: formData.buildingName,
              detailAddress: formData.detailAddress,
              ward: formData.ward,
              city: formData.city,
              latitude: formData.latitude,
              longitude: formData.longitude,
              licenseImages: formData.licenseImages,
            }}
            onChange={handleInputChange}
            onLocationChange={handleLocationChange}
            onFileChange={handleFileChange}
            readonly={mode === 'uploadLicense'}
          />

          {/* Operating Info Section */}
          {/* <OperatingInfoSection
            branchId={null}
            formMode={true}
            workScheduleData={workSchedule}
            dayOffData={dayOff}
            onWorkScheduleChange={setWorkSchedule}
            onDayOffChange={setDayOff}
          /> */}

          {/* Điều khoản - chỉ hiện ở chế độ đăng ký mới */}
          {mode === 'register' && (
            <div className="mt-10">
              <label className="flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  required
                  checked={formData.agreeTerms}
                  onChange={(e) =>
                    handleInputChange('agreeTerms', e.target.checked)
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
            </div>
          )}

          {/* Submit button */}
          <div className="mt-10">
            <button
              type="submit"
              disabled={!isFormValid || vendorStatus === 'pending'}
              className="w-full rounded-xl bg-[#06AA4C] px-6 py-4 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#058f40] hover:shadow-xl active:translate-y-0 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
            >
              {vendorStatus === 'pending'
                ? 'Đang xử lý...'
                : mode === 'uploadLicense'
                  ? 'Cập nhật giấy phép'
                  : 'Đăng ký cửa hàng'}
            </button>

            {/* Logout button */}
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
          </div>
        </form>
      </div>

      <TermsDialog open={openTerms} onClose={() => setOpenTerms(false)} />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
