import type {
  VendorDashboardRevenue,
  VendorDashboardVoucher,
  VendorDashboardDishes,
} from '@features/vendor/types/dashboard';
import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

export class DashboardApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getRevenue(params: {
    fromDate: string;
    toDate: string;
  }): Promise<VendorDashboardRevenue> {
    const res = await this.apiClient.get<VendorDashboardRevenue>({
      url: apiUrl.vendorDashboard.getRevenue,
      params,
    });
    return res.data;
  }

  async getVouchers(): Promise<VendorDashboardVoucher> {
    const res = await this.apiClient.get<VendorDashboardVoucher>({
      url: apiUrl.vendorDashboard.getVouchers,
    });
    return res.data;
  }

  async getDishes(): Promise<VendorDashboardDishes> {
    const res = await this.apiClient.get<VendorDashboardDishes>({
      url: apiUrl.vendorDashboard.getDishes,
    });
    return res.data;
  }
}
