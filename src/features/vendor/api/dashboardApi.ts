import type {
  VendorDashboardRevenue,
  VendorDashboardVoucher,
  VendorDashboardDishes,
  VendorDashboardCampaigns,
  VendorRevenueBarResponse,
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

  async getVouchers(params: {
    fromDate: string;
    toDate: string;
  }): Promise<VendorDashboardVoucher> {
    const res = await this.apiClient.get<VendorDashboardVoucher>({
      url: apiUrl.vendorDashboard.getVouchers,
      params,
    });
    return res.data;
  }

  async getDishes(params: {
    fromDate: string;
    toDate: string;
  }): Promise<VendorDashboardDishes> {
    const res = await this.apiClient.get<VendorDashboardDishes>({
      url: apiUrl.vendorDashboard.getDishes,
      params,
    });
    return res.data;
  }

  async getCampaigns(params: {
    fromDate: string;
    toDate: string;
  }): Promise<VendorDashboardCampaigns> {
    const res = await this.apiClient.get<VendorDashboardCampaigns>({
      url: apiUrl.vendorDashboard.getCampaigns,
      params,
    });
    return res.data;
  }

  async getVendorRevenueBar(params: {
    fromDate: string;
    toDate: string;
  }): Promise<VendorRevenueBarResponse> {
    const res = await this.apiClient.get<VendorRevenueBarResponse>({
      url: apiUrl.vendorDashboard.getVendorRevenueBar,
      params,
    });
    return res.data;
  }
}
