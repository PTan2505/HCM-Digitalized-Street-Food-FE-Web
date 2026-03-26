import type {
  VendorCampaign,
  VendorCampaignCreate,
  VendorCampaignUpdate,
  VendorCampaignListResponse,
} from '@features/vendor/types/campaign';
import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

export class VendorCampaignApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getVendorCampaigns(
    pageNumber: number,
    pageSize: number
  ): Promise<VendorCampaignListResponse> {
    const res = await this.apiClient.get<VendorCampaignListResponse>({
      url: apiUrl.campaign.GetOrPostVendorCampaign,
      params: { pageNumber, pageSize },
    });
    return res.data;
  }

  async createVendorCampaign(
    data: VendorCampaignCreate
  ): Promise<VendorCampaign> {
    const res = await this.apiClient.post<VendorCampaign, VendorCampaignCreate>(
      {
        url: apiUrl.campaign.GetOrPostVendorCampaign,
        data,
      }
    );
    return res.data;
  }

  async updateVendorCampaign(
    id: number,
    data: VendorCampaignUpdate
  ): Promise<VendorCampaign> {
    const res = await this.apiClient.put<VendorCampaign, VendorCampaignUpdate>({
      url: apiUrl.campaign.UpdateCampaign(id),
      data,
    });
    return res.data;
  }
}
