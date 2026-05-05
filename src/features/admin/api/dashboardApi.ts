import type {
  GetUserSignUps,
  GetMoney,
  GetCompensation,
  GetConversions,
  SystemCampaignStatistics,
  AdminRevenueBarResponse,
} from '@features/admin/types/dashboard';
import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

export class AdminDashboardApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getUserSignUps(params: {
    fromDate: string;
    toDate: string;
  }): Promise<GetUserSignUps> {
    const res = await this.apiClient.get<GetUserSignUps>({
      url: apiUrl.adminDashboard.getUserSignUps,
      params,
    });
    return res.data;
  }

  async getMoney(params: {
    fromDate: string;
    toDate: string;
  }): Promise<GetMoney> {
    const res = await this.apiClient.get<GetMoney>({
      url: apiUrl.adminDashboard.getMoney,
      params,
    });
    return res.data;
  }

  async getCompensation(params: {
    fromDate: string;
    toDate: string;
  }): Promise<GetCompensation> {
    const res = await this.apiClient.get<GetCompensation>({
      url: apiUrl.adminDashboard.getCompensation,
      params,
    });
    return res.data;
  }

  async getUserToVendorConversions(params: {
    fromDate: string;
    toDate: string;
  }): Promise<GetConversions> {
    const res = await this.apiClient.get<GetConversions>({
      url: apiUrl.adminDashboard.getUserToVendorConversions,
      params,
    });
    return res.data;
  }

  async getSystemCampaignsStatistics(): Promise<SystemCampaignStatistics[]> {
    const res = await this.apiClient.get<SystemCampaignStatistics[]>({
      url: apiUrl.adminDashboard.getSystemCampaignsStatistics,
    });
    return res.data;
  }

  async getAdminRevenueBar(params: {
    fromDate: string;
    toDate: string;
  }): Promise<AdminRevenueBarResponse> {
    const res = await this.apiClient.get<AdminRevenueBarResponse>({
      url: apiUrl.adminDashboard.getAdminRevenueBar,
      params,
    });
    return res.data;
  }
}
