import type {
  VendorRegistrationRequest,
  VendorRegistrationResponse,
  SubmitLicenseResponse,
  CheckLicenseStatusResponse,
  GetMyVendorResponse,
  SubmitImagesResponse,
  GetImagesResponse,
} from '@features/vendor/types/vendor';
import type {
  WorkSchedule,
  WorkScheduleResponse,
  DayOff,
  DayOffResponse,
} from '@features/vendor/types/workSchedule';
import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

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
  ): Promise<void> {
    await this.apiClient.post({
      url: apiUrl.vendor.createOrGetBranchesOfAVendor(vendorId),
      data,
    });
  }

  // async getBranches(vendorId: number): Promise<void> {
  //   await this.apiClient.get({
  //     url: apiUrl.vendor.createOrGetBranchesOfAVendor(vendorId),
  //   });
  // }

  async updateBranch(
    branchId: number,
    data: VendorRegistrationRequest
  ): Promise<void> {
    await this.apiClient.put({
      url: apiUrl.vendor.updateOrDeleteBranch(branchId),
      data,
    });
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

  // async getWorkSchedules(branchId: number): Promise<WorkScheduleResponse[]> {
  //   const res = await this.apiClient.get<WorkScheduleResponse[]>({
  //     url: apiUrl.vendor.createOrGetWorkSchedulesOfABranch(branchId),
  //   });
  //   return res.data;
  // }

  async deleteWorkSchedule(
    workScheduleId: number
  ): Promise<WorkScheduleResponse> {
    const res = await this.apiClient.delete<WorkScheduleResponse>({
      url: apiUrl.vendor.deleteWorkScheduleOfABranch(workScheduleId),
    });
    return res.data;
  }

  async submitDayOff(branchId: number, data: DayOff): Promise<DayOffResponse> {
    const res = await this.apiClient.post<DayOffResponse, DayOff>({
      url: apiUrl.vendor.createOrGetDayOffsOfABranch(branchId),
      data,
    });
    return res.data;
  }

  // async getDayOffs(branchId: number): Promise<DayOffResponse[]> {
  //   const res = await this.apiClient.get<DayOffResponse[]>({
  //     url: apiUrl.vendor.createOrGetDayOffsOfABranch(branchId),
  //   });
  //   return res.data;
  // }

  async deleteDayOff(dayOffId: number): Promise<DayOffResponse> {
    const res = await this.apiClient.delete<DayOffResponse>({
      url: apiUrl.vendor.deleteDayOffOfABranch(dayOffId),
    });
    return res.data;
  }

  async submitImage(
    branchId: number,
    image: File
  ): Promise<SubmitImagesResponse> {
    const formData = new FormData();
    formData.append('image', image);

    const res = await this.apiClient.post<SubmitImagesResponse, FormData>({
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
}
