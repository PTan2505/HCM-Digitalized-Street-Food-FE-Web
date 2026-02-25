import type {
  VendorRegistrationRequest,
  VendorRegistrationResponse,
  SubmitLicenseResponse,
} from '@features/vendor/types/vendor';
import { useAppDispatch } from '@hooks/reduxHooks';
import { registerVendor, submitLicense } from '@slices/vendor';
import { useCallback } from 'react';

export default function useVendor(): {
  onRegisterVendor: (
    payload: VendorRegistrationRequest
  ) => Promise<VendorRegistrationResponse>;
  onSubmitLicense: (payload: {
    branchId: number;
    licenseImages: File[];
  }) => Promise<SubmitLicenseResponse>;
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

  return {
    onRegisterVendor,
    onSubmitLicense,
  };
}
