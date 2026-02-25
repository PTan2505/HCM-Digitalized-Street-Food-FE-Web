import { useState, useMemo, useEffect, type JSX } from 'react';
import OwnerInfoSection from '../components/OwnerInfoSection';
import StoreSection from '../components/StoreSection';
import TermsDialog from '../components/TermsDialog';
import useLogin from '@features/auth/hooks/useLogin';
import useVendor from '@features/vendor/hooks/useVendor';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { loadUserFromStorage, selectUser } from '@slices/auth';
import { selectVendorStatus } from '@slices/vendor';
import { Snackbar, Alert, type AlertColor } from '@mui/material';

export default function VendorRegistration(): JSX.Element {
  const [openTerms, setOpenTerms] = useState(false);
  const { onLogout } = useLogin();
  const { onRegisterVendor, onSubmitLicense } = useVendor();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const vendorStatus = useAppSelector(selectVendorStatus);

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
    // Thông tin chủ quán
    ownerName: '',
    ownerPhone: '',
    email: '',

    // Thông tin cửa hàng
    buildingName: '',
    detailAddress: '',
    ward: '',
    city: 'TP. Hồ Chí Minh',
    latitude: null as number | null,
    longitude: null as number | null,
    licenseImages: [] as File[],

    // Điều khoản
    agreeTerms: false,
  });

  // Fetch user profile on mount
  useEffect(() => {
    void dispatch(loadUserFromStorage());
  }, [dispatch]);

  // Update owner info from user profile
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        ownerName: `${user.firstName} ${user.lastName}`.trim(),
        ownerPhone: user.phoneNumber ?? '',
        email: user.email ?? '',
      }));
    }
  }, [user]);

  const isFormValid = useMemo(() => {
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
  }, [formData]);

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

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    try {
      // Validate form data
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

      // Prepare payload
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

      // Step 1: Register vendor
      const vendorResponse = await onRegisterVendor(payload);
      console.log('Vendor Response:', vendorResponse);
      console.log('Branch ID:', vendorResponse.branches[0].branchId);

      // Step 2: Submit license images (only if branchId is available)
      if (formData.licenseImages.length > 0) {
        if (!vendorResponse.branches[0]?.branchId) {
          console.error('Branch ID not found in response!');
          showAlert(
            'Đăng ký vendor thành công nhưng không tìm thấy branch ID để upload ảnh.',
            'warning'
          );
          return;
        }

        console.log(
          'Uploading license images for branch:',
          vendorResponse.branches[0].branchId
        );
        await onSubmitLicense({
          branchId: vendorResponse.branches[0].branchId,
          licenseImages: formData.licenseImages,
        });
      }

      showAlert(
        'Đăng ký thành công! Vui lòng chờ quản trị viên xét duyệt.',
        'success'
      );
    } catch (error) {
      // Extract and display meaningful error message
      let errorMessage = 'Đăng ký thất bại. Vui lòng thử lại.';

      if (error && typeof error === 'object') {
        const err = error as { message?: string; code?: string };

        if (err.message) {
          // Translate common error messages
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0fdf4] via-white to-[#f0fdf4] py-8">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">
            Đăng ký trở thành Vendor
          </h1>
          <p className="text-lg text-gray-600">
            Hoàn thành các bước dưới đây để bắt đầu kinh doanh
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
          />

          {/* Điều khoản */}
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

          {/* Submit button */}
          <div className="mt-10">
            <button
              type="submit"
              disabled={!isFormValid || vendorStatus === 'pending'}
              className="w-full rounded-xl bg-[#06AA4C] px-6 py-4 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#058f40] hover:shadow-xl active:translate-y-0 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
            >
              {vendorStatus === 'pending'
                ? 'Đang xử lý...'
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
