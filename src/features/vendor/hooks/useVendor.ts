import type {
  VendorRegistrationRequest,
  VendorRegistrationResponse,
  SubmitLicenseResponse,
  CheckLicenseStatusResponse,
  GetMyVendorResponse,
} from '@features/vendor/types/vendor';
import type {
  WorkSchedule,
  WorkScheduleResponse,
  DayOff,
  DayOffResponse,
} from '@features/vendor/types/workSchedule';
import { useAppDispatch } from '@hooks/reduxHooks';
import {
  registerVendor,
  submitLicense,
  checkLicenseStatus,
  getMyVendor,
  submitWorkSchedule,
  submitDayOff,
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
  onSubmitWorkSchedule: (payload: {
    branchId: number;
    data: WorkSchedule;
  }) => Promise<WorkScheduleResponse>;
  onSubmitDayOff: (payload: {
    branchId: number;
    data: DayOff;
  }) => Promise<DayOffResponse>;
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

  const onSubmitWorkSchedule = useCallback(
    async (payload: {
      branchId: number;
      data: WorkSchedule;
    }): Promise<WorkScheduleResponse> => {
      const response = await dispatch(submitWorkSchedule(payload)).unwrap();
      return response;
    },
    [dispatch]
  );

  const onSubmitDayOff = useCallback(
    async (payload: {
      branchId: number;
      data: DayOff;
    }): Promise<DayOffResponse> => {
      const response = await dispatch(submitDayOff(payload)).unwrap();
      return response;
    },
    [dispatch]
  );

  return {
    onRegisterVendor,
    onSubmitLicense,
    onCheckLicenseStatus,
    onGetMyVendor,
    onSubmitWorkSchedule,
    onSubmitDayOff,
  };
}
