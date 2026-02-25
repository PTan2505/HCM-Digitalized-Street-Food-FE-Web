import type {
  VendorRegistrationRequest,
  VendorRegistrationResponse,
  SubmitLicenseResponse,
} from '@features/vendor/types/vendor';
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
}
