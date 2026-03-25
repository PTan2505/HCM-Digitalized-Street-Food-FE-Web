import type {
  CampaignCreate,
  CampaignUpdate,
  Campaign,
  CampaignListResponse,
} from '@features/admin/types/campaign';
import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

export class CampaignApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getCampaigns(
    pageNumber: number,
    pageSize: number
  ): Promise<CampaignListResponse> {
    const res = await this.apiClient.get<CampaignListResponse>({
      url: apiUrl.campaign.GetOrPostSystemCampaign,
      params: { pageNumber, pageSize },
    });
    return res.data;
  }

  async createCampaign(data: CampaignCreate): Promise<Campaign> {
    const res = await this.apiClient.post<Campaign, CampaignCreate>({
      url: apiUrl.campaign.GetOrPostSystemCampaign,
      data,
    });
    return res.data;
  }

  async updateCampaign(id: number, data: CampaignUpdate): Promise<Campaign> {
    const res = await this.apiClient.put<Campaign, CampaignUpdate>({
      url: apiUrl.campaign.UpdateCampaign(id),
      data,
    });
    return res.data;
  }
}
