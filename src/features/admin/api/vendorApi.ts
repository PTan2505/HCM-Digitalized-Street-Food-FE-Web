import type {
  GetAllVendorsResponse,
  GetAllVendorsParams,
  VendorDetail,
} from '@features/admin/types/vendor';
import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

export class VendorAdminApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getAllVendors(
    params: GetAllVendorsParams
  ): Promise<GetAllVendorsResponse> {
    let res = null;
    res = await this.apiClient.get<GetAllVendorsResponse>({
      url: apiUrl.admin.vendor.getAllVendors,
      params,
    });
    return res.data;
  }

  async getVendorDetail(id: number): Promise<VendorDetail> {
    let res = null;
    res = await this.apiClient.get<VendorDetail>({
      url: apiUrl.admin.vendor.getVendorDetail(id),
    });
    return res.data;
  }

  async getActiveVendors(
    params: GetAllVendorsParams
  ): Promise<GetAllVendorsResponse> {
    let res = null;
    res = await this.apiClient.get<GetAllVendorsResponse>({
      url: apiUrl.admin.vendor.getActiveVendors,
      params,
    });
    return res.data;
  }

  async deleteVendor(id: number): Promise<{ message: string }> {
    let res = null;
    res = await this.apiClient.delete<{ message: string }>({
      url: apiUrl.admin.vendor.deleteVendor(id),
    });
    return res.data;
  }

  async suspendVendor(id: number): Promise<{ message: string }> {
    let res = null;
    res = await this.apiClient.put<{ message: string }, undefined>({
      url: apiUrl.admin.vendor.suspendVendor(id),
    });
    return res.data;
  }

  async reactivateVendor(id: number): Promise<{ message: string }> {
    let res = null;
    res = await this.apiClient.put<{ message: string }, undefined>({
      url: apiUrl.admin.vendor.reactivateVendor(id),
    });
    return res.data;
  }
}
