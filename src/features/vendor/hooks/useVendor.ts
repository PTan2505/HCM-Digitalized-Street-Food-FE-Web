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
  UpdateDietaryPreferencesOfMyVendorRequest,
  UpdateOrGetDietaryPreferencesOfMyVendorResponse,
  GetAllGhostPinsResponse,
  ClaimBranchRequest,
  ClaimBranchResponse,
  SearchUsersResponse,
  AssignBranchManagerRequest,
} from '@features/vendor/types/vendor';
import type { UserLookupResponse } from '@features/user/api/profileApi';

import type {
  WorkSchedule,
  WorkScheduleResponse,
  DayOff,
  DayOffResponse,
  GetWorkScheduleResponse,
  GetDayOffResponse,
  UpdateWorkSchedule,
  WorkScheduleItem,
} from '@features/vendor/types/workSchedule';
import { useAppDispatch } from '@hooks/reduxHooks';
import {
  registerVendor,
  submitLicense,
  checkLicenseStatus,
  getMyVendor,
  submitWorkSchedule,
  submitDayOff,
  getWorkSchedules,
  updateWorkSchedule,
  deleteWorkSchedule,
  getDayOffs,
  deleteDayOff,
  submitImages,
  getImages,
  deleteImage,
  createBranch,
  updateBranch,
  deleteBranch,
  updateVendorName,
  getDietaryPreferencesOfMyVendor,
  updateDietaryPreferencesOfMyVendor,
  getAllGhostPins,
  claimBranch,
  getUserById,
  updateBranchManager,
  searchUsers,
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
  onGetWorkSchedules: (branchId: number) => Promise<GetWorkScheduleResponse>;
  onUpdateWorkSchedule: (payload: {
    workScheduleId: number;
    data: UpdateWorkSchedule;
  }) => Promise<WorkScheduleItem>;
  onDeleteWorkSchedule: (workScheduleId: number) => Promise<number>;
  onSubmitDayOff: (payload: {
    branchId: number;
    data: DayOff;
  }) => Promise<DayOffResponse>;
  onGetDayOffs: (branchId: number) => Promise<GetDayOffResponse>;
  onDeleteDayOff: (dayOffId: number) => Promise<number>;
  onSubmitImages: (payload: {
    branchId: number;
    images: File[];
  }) => Promise<SubmitImagesResponse[]>;
  onGetImages: (payload: {
    branchId: number;
    params: { pageNumber: number; pageSize: number };
  }) => Promise<GetImagesResponse>;
  onDeleteImage: (imageId: number) => Promise<number>;
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
  onGetDietaryPreferencesOfMyVendor: (payload: {
    vendorId: number;
  }) => Promise<UpdateOrGetDietaryPreferencesOfMyVendorResponse>;
  onUpdateDietaryPreferencesOfMyVendor: (
    payload: UpdateDietaryPreferencesOfMyVendorRequest
  ) => Promise<UpdateOrGetDietaryPreferencesOfMyVendorResponse>;
  onGetAllGhostPins: (params: {
    pageNumber: number;
    pageSize: number;
  }) => Promise<GetAllGhostPinsResponse>;
  onClaimBranch: (payload: ClaimBranchRequest) => Promise<ClaimBranchResponse>;
  onGetUserById: (userId: number) => Promise<UserLookupResponse>;
  onUpdateBranchManager: (payload: {
    branchId: number;
    data: AssignBranchManagerRequest;
  }) => Promise<boolean>;
  onSearchUsers: (params: {
    query: string;
    pageNumber: number;
    pageSize: number;
  }) => Promise<SearchUsersResponse>;
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

  const onGetWorkSchedules = useCallback(
    async (branchId: number): Promise<GetWorkScheduleResponse> => {
      return await dispatch(getWorkSchedules(branchId)).unwrap();
    },
    [dispatch]
  );

  const onUpdateWorkSchedule = useCallback(
    async (payload: {
      workScheduleId: number;
      data: UpdateWorkSchedule;
    }): Promise<WorkScheduleItem> => {
      return await dispatch(updateWorkSchedule(payload)).unwrap();
    },
    [dispatch]
  );

  const onDeleteWorkSchedule = useCallback(
    async (workScheduleId: number): Promise<number> => {
      return await dispatch(deleteWorkSchedule(workScheduleId)).unwrap();
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

  const onGetDayOffs = useCallback(
    async (branchId: number): Promise<GetDayOffResponse> => {
      return await dispatch(getDayOffs(branchId)).unwrap();
    },
    [dispatch]
  );

  const onDeleteDayOff = useCallback(
    async (dayOffId: number): Promise<number> => {
      return await dispatch(deleteDayOff(dayOffId)).unwrap();
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

  const onDeleteImage = useCallback(
    async (imageId: number): Promise<number> => {
      return await dispatch(deleteImage(imageId)).unwrap();
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

  const onGetDietaryPreferencesOfMyVendor = useCallback(
    async (payload: {
      vendorId: number;
    }): Promise<UpdateOrGetDietaryPreferencesOfMyVendorResponse> => {
      return await dispatch(getDietaryPreferencesOfMyVendor(payload)).unwrap();
    },
    [dispatch]
  );

  const onUpdateDietaryPreferencesOfMyVendor = useCallback(
    async (
      payload: UpdateDietaryPreferencesOfMyVendorRequest
    ): Promise<UpdateOrGetDietaryPreferencesOfMyVendorResponse> => {
      return await dispatch(
        updateDietaryPreferencesOfMyVendor(payload)
      ).unwrap();
    },
    [dispatch]
  );

  const onGetAllGhostPins = useCallback(
    async (params: {
      pageNumber: number;
      pageSize: number;
    }): Promise<GetAllGhostPinsResponse> => {
      return await dispatch(getAllGhostPins(params)).unwrap();
    },
    [dispatch]
  );

  const onClaimBranch = useCallback(
    async (payload: ClaimBranchRequest): Promise<ClaimBranchResponse> => {
      return await dispatch(claimBranch(payload)).unwrap();
    },
    [dispatch]
  );

  const onGetUserById = useCallback(
    async (userId: number): Promise<UserLookupResponse> => {
      return await dispatch(getUserById(userId)).unwrap();
    },
    [dispatch]
  );

  const onUpdateBranchManager = useCallback(
    async (payload: {
      branchId: number;
      data: AssignBranchManagerRequest;
    }): Promise<boolean> => {
      return await dispatch(updateBranchManager(payload)).unwrap();
    },
    [dispatch]
  );

  const onSearchUsers = useCallback(
    async (params: {
      query: string;
      pageNumber: number;
      pageSize: number;
    }): Promise<SearchUsersResponse> => {
      return await dispatch(searchUsers(params)).unwrap();
    },
    [dispatch]
  );

  return {
    onRegisterVendor,
    onSubmitLicense,
    onCheckLicenseStatus,
    onGetMyVendor,
    onSubmitWorkSchedule,
    onGetWorkSchedules,
    onUpdateWorkSchedule,
    onDeleteWorkSchedule,
    onSubmitDayOff,
    onGetDayOffs,
    onDeleteDayOff,
    onSubmitImages,
    onGetImages,
    onDeleteImage,
    onCreateBranch,
    onUpdateBranch,
    onDeleteBranch,
    onUpdateVendorName,
    onGetDietaryPreferencesOfMyVendor,
    onUpdateDietaryPreferencesOfMyVendor,
    onGetAllGhostPins,
    onClaimBranch,
    onGetUserById,
    onUpdateBranchManager,
    onSearchUsers,
  };
}
