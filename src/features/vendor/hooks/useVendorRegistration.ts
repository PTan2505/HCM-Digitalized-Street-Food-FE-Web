import React, { useState, useMemo, useEffect, useCallback } from 'react';
import useLogin from '@features/auth/hooks/useLogin';
import useVendor from '@features/vendor/hooks/useVendor';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { loadUserFromStorage, selectUser } from '@slices/auth';
import {
  selectVendorStatus,
  selectMyVendor,
  selectLicenseStatus,
  getMyVendor,
  checkLicenseStatus,
} from '@slices/vendor';
import type { AlertColor } from '@mui/material';
import type {
  GetMyVendorResponse,
  CheckLicenseStatusResponse,
} from '@features/vendor/types/vendor';

// ─── Types ───────────────────────────────────────────────────────────
export type PageMode =
  | 'loading'
  | 'register'
  | 'uploadLicense'
  | 'viewStatus'
  | 'resubmit';

export interface VendorFormData {
  ownerName: string;
  ownerPhone: string;
  email: string;
  buildingName: string;
  detailAddress: string;
  ward: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  licenseImages: File[];
  agreeTerms: boolean;
}

export interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

interface UseVendorRegistrationReturn {
  readonly mode: PageMode;
  readonly formData: VendorFormData;
  readonly snackbar: SnackbarState;
  readonly vendorStatus: 'idle' | 'pending' | 'succeeded' | 'failed';
  readonly myVendor: GetMyVendorResponse | null;
  readonly licenseStatusData: CheckLicenseStatusResponse | null;
  readonly isFormValid: boolean;
  readonly showAlert: (message: string, severity?: AlertColor) => void;
  readonly closeSnackbar: () => void;
  readonly handleInputChange: (field: string, value: unknown) => void;
  readonly handleLocationChange: (lat: number, lng: number) => void;
  readonly handleFileChange: (files: FileList | null) => void;
  readonly handleSubmit: (e: React.FormEvent) => Promise<void>;
  readonly onLogout: () => void;
}

const INITIAL_FORM_DATA: VendorFormData = {
  ownerName: '',
  ownerPhone: '',
  email: '',
  buildingName: '',
  detailAddress: '',
  ward: '',
  city: 'TP. Hồ Chí Minh',
  latitude: null,
  longitude: null,
  licenseImages: [],
  agreeTerms: false,
};

// ─── Hook ────────────────────────────────────────────────────────────
export default function useVendorRegistration(): UseVendorRegistrationReturn {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const vendorStatus = useAppSelector(selectVendorStatus);
  const myVendor = useAppSelector(selectMyVendor);
  const licenseStatusData = useAppSelector(selectLicenseStatus);

  const { onLogout } = useLogin();
  const { onRegisterVendor, onSubmitLicense } = useVendor();

  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState<VendorFormData>(INITIAL_FORM_DATA);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'info',
  });

  // ── Derived state ──────────────────────────────────────────────────
  const mode: PageMode = useMemo(() => {
    if (initialLoading) return 'loading';
    if (!myVendor) return 'register';

    const branch = myVendor.branches?.[0];
    if (!branch) return 'register';

    if (!licenseStatusData) return 'uploadLicense';
    if (licenseStatusData.status === 'Reject') return 'resubmit';

    return 'viewStatus';
  }, [initialLoading, myVendor, licenseStatusData]);

  const isFormValid = useMemo(() => {
    if (mode === 'uploadLicense' || mode === 'resubmit') {
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

  // ── Snackbar helpers ───────────────────────────────────────────────
  const showAlert = useCallback(
    (message: string, severity: AlertColor = 'info') => {
      setSnackbar({ open: true, message, severity });
    },
    []
  );

  const closeSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  // ── Form handlers ─────────────────────────────────────────────────
  const handleInputChange = useCallback((field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleLocationChange = useCallback((lat: number, lng: number) => {
    setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
  }, []);

  const handleFileChange = useCallback((files: FileList | null) => {
    if (files) {
      setFormData((prev) => ({ ...prev, licenseImages: Array.from(files) }));
    }
  }, []);

  // ── Side effects ──────────────────────────────────────────────────
  // Load user + vendor data on mount
  useEffect(() => {
    const init = async (): Promise<void> => {
      await dispatch(loadUserFromStorage());
      try {
        const vendor = await dispatch(getMyVendor()).unwrap();
        const branch = vendor.branches?.[0];
        if (branch) {
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

  // Sync user profile → form (register mode)
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

  // Sync vendor data → form (other modes)
  useEffect(() => {
    if (
      myVendor &&
      (mode === 'uploadLicense' || mode === 'viewStatus' || mode === 'resubmit')
    ) {
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

  // ── Submit ─────────────────────────────────────────────────────────
  const handleSubmit = useCallback(
    async (e: React.FormEvent): Promise<void> => {
      e.preventDefault();

      try {
        // Upload / Resubmit license only
        if (mode === 'uploadLicense' || mode === 'resubmit') {
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
            mode === 'resubmit'
              ? 'Gửi lại hồ sơ thành công! Vui lòng chờ quản trị viên xét duyệt.'
              : 'Cập nhật giấy phép thành công! Vui lòng chờ quản trị viên xét duyệt.',
            'success'
          );
          return;
        }

        // Full registration
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

        const vendorResponse = await onRegisterVendor({
          name: formData.ownerName,
          phoneNumber: formData.ownerPhone,
          email: formData.email || '',
          addressDetail: formData.detailAddress,
          buildingName: formData.buildingName,
          ward: formData.ward,
          city: formData.city,
          lat: formData.latitude,
          long: formData.longitude,
        });

        const newBranchId = vendorResponse.branches[0]?.branchId;
        if (!newBranchId) {
          showAlert(
            'Đăng ký vendor thành công nhưng không tìm thấy branch ID.',
            'warning'
          );
          return;
        }

        if (formData.licenseImages.length > 0) {
          await onSubmitLicense({
            branchId: newBranchId,
            licenseImages: formData.licenseImages,
          });
        }

        showAlert(
          'Đăng ký thành công! Vui lòng chờ quản trị viên xét duyệt.',
          'success'
        );
      } catch (error) {
        let errorMessage = 'Thao tác thất bại. Vui lòng thử lại.';

        if (error && typeof error === 'object') {
          const err = error as { message?: string };
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
    },
    [mode, formData, myVendor, onRegisterVendor, onSubmitLicense, showAlert]
  );

  // ── Return ─────────────────────────────────────────────────────────
  return {
    mode,
    formData,
    snackbar,
    vendorStatus,
    myVendor,
    licenseStatusData,
    isFormValid,
    showAlert,
    closeSnackbar,
    handleInputChange,
    handleLocationChange,
    handleFileChange,
    handleSubmit,
    onLogout,
  } as const;
}
