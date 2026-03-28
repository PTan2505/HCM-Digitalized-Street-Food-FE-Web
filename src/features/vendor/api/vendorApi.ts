import type {
  VendorRegistrationRequest,
  VendorRegistrationResponse,
  SubmitLicenseResponse,
  CheckLicenseStatusResponse,
  GetMyVendorResponse,
  SubmitImagesResponse,
  GetImagesResponse,
  CreateOrUpdateBranchResponse,
  Branch,
  UpdateVendorNameRequest,
  UpdateVendorNameResponse,
  UpdateDietaryPreferencesOfMyVendorRequest,
  UpdateOrGetDietaryPreferencesOfMyVendorResponse,
  GetAllGhostPinsResponse,
  ClaimBranchResponse,
  AssignBranchManagerRequest,
  SearchUsersResponse,
} from '@features/vendor/types/vendor';
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
import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

type BranchListResponse = {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: Branch[];
};

const isBranchListResponse = (data: unknown): data is BranchListResponse => {
  if (!data || typeof data !== 'object') return false;
  if (
    !('items' in data) ||
    !Array.isArray((data as { items: unknown }).items)
  ) {
    return false;
  }
  return (
    'currentPage' in data &&
    'pageSize' in data &&
    'totalPages' in data &&
    'totalCount' in data
  );
};

export class VendorApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async registerVendor(
    data: VendorRegistrationRequest
  ): Promise<VendorRegistrationResponse> {
    const res = await this.apiClient.post<
      VendorRegistrationResponse,
      VendorRegistrationRequest
    >({
      url: apiUrl.vendor.register,
      data,
    });
    return res.data;
  }

  async submitLicense(
    branchId: number,
    licenseImages: File[]
  ): Promise<SubmitLicenseResponse> {
    const formData = new FormData();
    licenseImages.forEach((file) => {
      formData.append('licenseImages', file);
    });

    const res = await this.apiClient.post<SubmitLicenseResponse, FormData>({
      url: apiUrl.vendor.submitLicense(branchId),
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  }

  async getMyVendor(): Promise<GetMyVendorResponse> {
    const res = await this.apiClient.get<GetMyVendorResponse>({
      url: apiUrl.vendor.getMyVendor,
    });
    return res.data;
  }

  async checkLicenseStatus(
    branchId: number
  ): Promise<CheckLicenseStatusResponse> {
    const res = await this.apiClient.get<CheckLicenseStatusResponse>({
      url: apiUrl.vendor.checkLicenseStatus(branchId),
    });
    return res.data;
  }

  async createBranch(
    vendorId: number,
    data: VendorRegistrationRequest
  ): Promise<CreateOrUpdateBranchResponse> {
    const res = await this.apiClient.post<
      CreateOrUpdateBranchResponse,
      VendorRegistrationRequest
    >({
      url: apiUrl.vendor.createOrGetBranchesOfAVendor(vendorId),
      data,
    });
    return res.data;
  }

  async getBranches(vendorId: number): Promise<Branch[]> {
    const res = await this.apiClient.get<unknown>({
      url: apiUrl.vendor.createOrGetBranchesOfAVendor(vendorId),
    });

    if (Array.isArray(res.data)) {
      return res.data as Branch[];
    }

    if (isBranchListResponse(res.data)) {
      const { currentPage, pageSize, totalPages } = res.data;
      const branches = [...res.data.items];

      for (let page = currentPage + 1; page <= totalPages; page += 1) {
        const pageRes = await this.apiClient.get<unknown>({
          url: apiUrl.vendor.createOrGetBranchesOfAVendor(vendorId),
          params: { pageNumber: page, pageSize },
        });

        if (isBranchListResponse(pageRes.data)) {
          branches.push(...pageRes.data.items);
        } else if (Array.isArray(pageRes.data)) {
          branches.push(...(pageRes.data as Branch[]));
        }
      }

      return branches;
    }

    return [];
  }

  async updateBranch(
    branchId: number,
    data: VendorRegistrationRequest
  ): Promise<CreateOrUpdateBranchResponse> {
    const res = await this.apiClient.put<
      CreateOrUpdateBranchResponse,
      VendorRegistrationRequest
    >({
      url: apiUrl.vendor.updateOrDeleteBranch(branchId),
      data,
    });
    return res.data;
  }

  async deleteBranch(branchId: number): Promise<void> {
    await this.apiClient.delete({
      url: apiUrl.vendor.updateOrDeleteBranch(branchId),
    });
  }

  async submitWorkSchedule(
    branchId: number,
    data: WorkSchedule
  ): Promise<WorkScheduleResponse> {
    const res = await this.apiClient.post<WorkScheduleResponse, WorkSchedule>({
      url: apiUrl.vendor.createOrGetWorkSchedulesOfABranch(branchId),
      data,
    });
    return res.data;
  }

  async updateWorkSchedule(
    workScheduleId: number,
    data: UpdateWorkSchedule
  ): Promise<WorkScheduleItem> {
    const res = await this.apiClient.put<WorkScheduleItem, UpdateWorkSchedule>({
      url: apiUrl.vendor.deleteOrUpdateWorkScheduleOfABranch(workScheduleId),
      data,
    });
    return res.data;
  }

  async getWorkSchedules(branchId: number): Promise<GetWorkScheduleResponse> {
    const res = await this.apiClient.get<GetWorkScheduleResponse>({
      url: apiUrl.vendor.createOrGetWorkSchedulesOfABranch(branchId),
    });
    return res.data;
  }

  async deleteWorkSchedule(workScheduleId: number): Promise<void> {
    await this.apiClient.delete({
      url: apiUrl.vendor.deleteOrUpdateWorkScheduleOfABranch(workScheduleId),
    });
  }

  async submitDayOff(branchId: number, data: DayOff): Promise<DayOffResponse> {
    const res = await this.apiClient.post<DayOffResponse, DayOff>({
      url: apiUrl.vendor.createOrGetDayOffsOfABranch(branchId),
      data,
    });
    return res.data;
  }

  async getDayOffs(branchId: number): Promise<GetDayOffResponse> {
    const res = await this.apiClient.get<GetDayOffResponse>({
      url: apiUrl.vendor.createOrGetDayOffsOfABranch(branchId),
    });
    return res.data;
  }

  async deleteDayOff(dayOffId: number): Promise<void> {
    await this.apiClient.delete({
      url: apiUrl.vendor.deleteOrUpdateDayOffOfABranch(dayOffId),
    });
  }

  async submitImages(
    branchId: number,
    images: File[]
  ): Promise<SubmitImagesResponse[]> {
    const formData = new FormData();
    images.forEach((file) => {
      formData.append('images', file);
    });

    const res = await this.apiClient.post<SubmitImagesResponse[], FormData>({
      url: apiUrl.vendor.createOrGetImagesOfABranch(branchId),
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  }

  async getImages(
    branchId: number,
    params: { pageNumber: number; pageSize: number }
  ): Promise<GetImagesResponse> {
    const res = await this.apiClient.get<GetImagesResponse>({
      url: apiUrl.vendor.createOrGetImagesOfABranch(branchId),
      params,
    });
    return res.data;
  }

  async deleteImage(imageId: number): Promise<void> {
    await this.apiClient.delete({
      url: apiUrl.vendor.deleteImagesOfABranch(imageId),
    });
  }

  async updateVendorName(
    data: UpdateVendorNameRequest
  ): Promise<UpdateVendorNameResponse> {
    const res = await this.apiClient.put<
      UpdateVendorNameResponse,
      UpdateVendorNameRequest
    >({
      url: apiUrl.vendor.updateVendorName,
      data,
    });
    return res.data;
  }

  async getDietaryPreferencesOfMyVendor(
    vendorId: number
  ): Promise<UpdateOrGetDietaryPreferencesOfMyVendorResponse> {
    const res =
      await this.apiClient.get<UpdateOrGetDietaryPreferencesOfMyVendorResponse>(
        {
          url: apiUrl.vendor.getDietaryPreferencesOfAVendor(vendorId),
        }
      );
    return res.data;
  }

  async updateDietaryPreferencesOfMyVendor(
    data: UpdateDietaryPreferencesOfMyVendorRequest
  ): Promise<UpdateOrGetDietaryPreferencesOfMyVendorResponse> {
    const res = await this.apiClient.put<
      UpdateOrGetDietaryPreferencesOfMyVendorResponse,
      UpdateDietaryPreferencesOfMyVendorRequest
    >({
      url: apiUrl.vendor.updateDietaryPreferencesOfMyVendor,
      data,
    });
    return res.data;
  }

  async getAllGhostPins(params: {
    pageNumber: number;
    pageSize: number;
  }): Promise<GetAllGhostPinsResponse> {
    const res = await this.apiClient.get<GetAllGhostPinsResponse>({
      url: apiUrl.vendor.getAllGhostPins,
      params,
    });
    return res.data;
  }

  async claimBranch(
    branchId: number,
    licenseImages: File[]
  ): Promise<ClaimBranchResponse> {
    const formData = new FormData();
    licenseImages.forEach((file) => {
      formData.append('licenseImages', file);
    });
    formData.append('branchId', branchId.toString());
    const res = await this.apiClient.post<ClaimBranchResponse, FormData>({
      url: apiUrl.vendor.claimBranch,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  }

  async updateBranchManager(
    branchId: number,
    data: AssignBranchManagerRequest
  ): Promise<boolean> {
    const res = await this.apiClient.put<boolean, AssignBranchManagerRequest>({
      url: apiUrl.vendor.updateBranchManager(branchId),
      data,
    });
    return res.data;
  }

  async searchUsers(params: {
    query: string;
    pageNumber: number;
    pageSize: number;
  }): Promise<SearchUsersResponse> {
    const res = await this.apiClient.get<SearchUsersResponse>({
      url: apiUrl.user.search,
      params,
    });
    return res.data;
  }
}
