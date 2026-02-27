import type {
  VendorRegistrationRequest,
  VendorRegistrationResponse,
  SubmitLicenseResponse,
  CheckLicenseStatusResponse,
  GetMyVendorResponse,
} from '@features/vendor/types/vendor';
import { useAppDispatch } from '@hooks/reduxHooks';
import {
  registerVendor,
  submitLicense,
  checkLicenseStatus,
  getMyVendor,
} from '@slices/vendor';
import { useCallback } from 'react';

export default function useVendor(): {
  onRegisterVendor: (
    payload: VendorRegistrationRequest
  ) => Promise<VendorRegistrationResponse>;
  onSubmitLicense: (payload: {
    branchId: number;
    licenseImages: File[];
  }) => Promise<SubmitLicenseResponse>;
  onCheckLicenseStatus: (
    branchId: number
  ) => Promise<CheckLicenseStatusResponse>;
  onGetMyVendor: () => Promise<GetMyVendorResponse>;
} {
  const dispatch = useAppDispatch();

  const onRegisterVendor = useCallback(
    async (
      payload: VendorRegistrationRequest
    ): Promise<VendorRegistrationResponse> => {
      const response = await dispatch(registerVendor(payload)).unwrap();
      return response;
    },
    [dispatch]
  );

  const onSubmitLicense = useCallback(
    async (payload: {
      branchId: number;
      licenseImages: File[];
    }): Promise<SubmitLicenseResponse> => {
      const response = await dispatch(submitLicense(payload)).unwrap();
      return response;
    },
    [dispatch]
  );

  const onGetMyVendor = useCallback(async (): Promise<GetMyVendorResponse> => {
    const response = await dispatch(getMyVendor()).unwrap();
    return response;
  }, [dispatch]);

  const onCheckLicenseStatus = useCallback(
    async (branchId: number): Promise<CheckLicenseStatusResponse> => {
      const response = await dispatch(checkLicenseStatus(branchId)).unwrap();
      return response;
    },
    [dispatch]
  );

  return {
    onRegisterVendor,
    onSubmitLicense,
    onCheckLicenseStatus,
    onGetMyVendor,
  };
}
