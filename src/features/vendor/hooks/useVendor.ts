import type {
  VendorRegistrationRequest,
  VendorRegistrationResponse,
  SubmitLicenseResponse,
  CheckLicenseStatusResponse,
  GetMyVendorResponse,
  SubmitImagesResponse,
  GetImagesResponse,
  CreateOrUpdateBranchResponse,
  UpdateVendorNameRequest,
  UpdateVendorNameResponse,
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
  submitImages,
  getImages,
  createBranch,
  updateBranch,
  deleteBranch,
  updateVendorName,
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
  onSubmitImages: (payload: {
    branchId: number;
    images: File[];
  }) => Promise<SubmitImagesResponse[]>;
  onGetImages: (payload: {
    branchId: number;
    params: { pageNumber: number; pageSize: number };
  }) => Promise<GetImagesResponse>;
  onCreateBranch: (payload: {
    vendorId: number;
    data: VendorRegistrationRequest;
  }) => Promise<CreateOrUpdateBranchResponse>;
  onUpdateBranch: (payload: {
    branchId: number;
    data: VendorRegistrationRequest;
  }) => Promise<CreateOrUpdateBranchResponse>;
  onDeleteBranch: (branchId: number) => Promise<number>;
  onUpdateVendorName: (
    payload: UpdateVendorNameRequest
  ) => Promise<UpdateVendorNameResponse>;
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

  const onSubmitImages = useCallback(
    async (payload: {
      branchId: number;
      images: File[];
    }): Promise<SubmitImagesResponse[]> => {
      const response = await dispatch(submitImages(payload)).unwrap();
      return response;
    },
    [dispatch]
  );

  const onGetImages = useCallback(
    async (payload: {
      branchId: number;
      params: { pageNumber: number; pageSize: number };
    }): Promise<GetImagesResponse> => {
      const response = await dispatch(getImages(payload)).unwrap();
      return response;
    },
    [dispatch]
  );

  const onCreateBranch = useCallback(
    async (payload: {
      vendorId: number;
      data: VendorRegistrationRequest;
    }): Promise<CreateOrUpdateBranchResponse> => {
      return await dispatch(createBranch(payload)).unwrap();
    },
    [dispatch]
  );

  const onUpdateBranch = useCallback(
    async (payload: {
      branchId: number;
      data: VendorRegistrationRequest;
    }): Promise<CreateOrUpdateBranchResponse> => {
      return await dispatch(updateBranch(payload)).unwrap();
    },
    [dispatch]
  );

  const onDeleteBranch = useCallback(
    async (branchId: number): Promise<number> => {
      const response = await dispatch(deleteBranch(branchId)).unwrap();
      return response;
    },
    [dispatch]
  );

  const onUpdateVendorName = useCallback(
    async (
      payload: UpdateVendorNameRequest
    ): Promise<UpdateVendorNameResponse> => {
      return await dispatch(updateVendorName(payload)).unwrap();
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
    onSubmitImages,
    onGetImages,
    onCreateBranch,
    onUpdateBranch,
    onDeleteBranch,
    onUpdateVendorName,
  };
}
