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

  async submitWorkSchedule(
    branchId: number,
    data: WorkSchedule
  ): Promise<WorkScheduleResponse> {
    const res = await this.apiClient.post<WorkScheduleResponse, WorkSchedule>({
      url: apiUrl.vendor.workSchedules(branchId),
      data,
    });
    return res.data;
  }

  async submitDayOff(branchId: number, data: DayOff): Promise<DayOffResponse> {
    const res = await this.apiClient.post<DayOffResponse, DayOff>({
      url: apiUrl.vendor.dayOffs(branchId),
      data,
    });
    return res.data;
  }
}
