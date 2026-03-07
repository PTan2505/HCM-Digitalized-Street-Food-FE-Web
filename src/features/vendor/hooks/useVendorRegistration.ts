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
  branchName: string;
  detailAddress: string;
  ward: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  licenseImages: File[];
  agreeTerms: boolean;
}

interface UseVendorRegistrationReturn {
  readonly mode: PageMode;
  readonly formData: VendorFormData;
  readonly vendorStatus: 'idle' | 'pending' | 'succeeded' | 'failed';
  readonly myVendor: GetMyVendorResponse | null;
  readonly licenseStatusData: CheckLicenseStatusResponse | null;
  readonly isFormValid: boolean;
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
  branchName: '',
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
      formData.email.trim() !== '' &&
      formData.agreeTerms;

    const hasStoreInfo =
      // branchName is optional, không cần check
      formData.detailAddress.trim() !== '' &&
      // ward/city are auto-filled by AddressAutocomplete, not required for basic validity
      formData.latitude !== null &&
      formData.longitude !== null &&
      formData.licenseImages.length > 0;

    return hasOwnerInfo && hasStoreInfo;
  }, [formData, mode]);

  // ── Form handlers ─────────────────────────────────────────────────
  const handleInputChange = useCallback((field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleLocationChange = useCallback((lat: number, lng: number) => {
    setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
  }, []);

  const handleFileChange = useCallback((files: FileList | null) => {
    setFormData((prev) => ({
      ...prev,
      licenseImages: files ? Array.from(files) : [],
    }));
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
        // ownerName để trống cho người dùng tự điền
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
          ownerName: myVendor.name || '',
          ownerPhone: branch.phoneNumber || '',
          email: branch.email || '',
          branchName: myVendor.name + ' ' + branch.name || '',
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
          // branch is guaranteed to exist when mode is uploadLicense/resubmit
          const branch = myVendor?.branches[0];
          if (!branch) return;

          await onSubmitLicense({
            branchId: branch.branchId,
            licenseImages: formData.licenseImages,
          });
          return;
        }

        // Full registration — field validation is handled by zodResolver
        const vendorResponse = await onRegisterVendor({
          name: formData.ownerName,
          phoneNumber: formData.ownerPhone,
          email: formData.email || '',
          addressDetail: formData.detailAddress,
          branchName: formData.branchName || formData.ownerName, // Nếu không có branchName, dùng ownerName
          ward: formData.ward,
          city: formData.city,
          lat: formData.latitude ?? 0,
          long: formData.longitude ?? 0,
        });

        const newBranchId = vendorResponse.branches[0]?.branchId;
        if (newBranchId && formData.licenseImages.length > 0) {
          await onSubmitLicense({
            branchId: newBranchId,
            licenseImages: formData.licenseImages,
          });
        }
      } catch {
        // TODO: handle error notification
      }
    },
    [mode, formData, myVendor, onRegisterVendor, onSubmitLicense]
  );

  // ── Return ─────────────────────────────────────────────────────────
  return {
    mode,
    formData,
    vendorStatus,
    myVendor,
    licenseStatusData,
    isFormValid,
    handleInputChange,
    handleLocationChange,
    handleFileChange,
    handleSubmit,
    onLogout,
  } as const;
}
