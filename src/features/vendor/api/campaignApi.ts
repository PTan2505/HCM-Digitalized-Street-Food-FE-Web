import type {
  VendorCampaign,
  CampaignDetailsResponse,
  VendorCampaignCreate,
  VendorCampaignUpdate,
  JoinSystemCampaignResponse,
  JoinSystemCampaignRequest,
  CampaignBranchesResponse,
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
    pageSize: number,
    vendorId?: number
  ): Promise<VendorCampaignListResponse> {
    const res = await this.apiClient.get<VendorCampaignListResponse>({
      url: apiUrl.campaign.GetOrPostVendorCampaign,
      params: { pageNumber, pageSize, vendorId },
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

  async getBranchCampaigns(
    branchId: number,
    pageNumber: number,
    pageSize: number
  ): Promise<VendorCampaignListResponse> {
    const res = await this.apiClient.get<VendorCampaignListResponse>({
      url: apiUrl.campaign.GetOrPostBranchCampaign(branchId),
      params: { pageNumber, pageSize },
    });
    return res.data;
  }

  async createBranchCampaign(
    branchId: number,
    data: VendorCampaignCreate
  ): Promise<VendorCampaign> {
    const res = await this.apiClient.post<VendorCampaign, VendorCampaignCreate>(
      {
        url: apiUrl.campaign.GetOrPostBranchCampaign(branchId),
        data,
      }
    );
    return res.data;
  }

  async getJoinableSystemCampaigns(
    pageNumber: number,
    pageSize: number
  ): Promise<VendorCampaignListResponse> {
    const res = await this.apiClient.get<VendorCampaignListResponse>({
      url: apiUrl.campaign.GetJoinableSystemCampaigns,
      params: { pageNumber, pageSize },
    });
    return res.data;
  }

  async joinBranchToSystemCampaign(
    campaignId: number,
    branchIds: number[]
  ): Promise<JoinSystemCampaignResponse> {
    const res = await this.apiClient.post<
      JoinSystemCampaignResponse,
      JoinSystemCampaignRequest
    >({
      url: apiUrl.campaign.BranchJoinASystemCampaign(campaignId),
      data: { branchIds },
    });
    return res.data;
  }

  async getSystemCampaignDetails(
    campaignId: number
  ): Promise<CampaignDetailsResponse> {
    const res = await this.apiClient.get<CampaignDetailsResponse>({
      url: apiUrl.campaign.GetDetailsOfASystemCampaign(campaignId),
    });
    return res.data;
  }

  async getBranchesOfACampaign(
    campaignId: number
  ): Promise<CampaignBranchesResponse> {
    const res = await this.apiClient.get<CampaignBranchesResponse>({
      url: apiUrl.campaign.GetBranchesOfACampaign(campaignId),
    });
    return res.data;
  }

  async addBranchesToACampaign(
    campaignId: number,
    branchIds: number[]
  ): Promise<CampaignBranchesResponse> {
    const res = await this.apiClient.post<
      CampaignBranchesResponse,
      { branchIds: number[] }
    >({
      url: apiUrl.campaign.AddBranchesToACampaign(campaignId),
      data: { branchIds },
    });
    return res.data;
  }

  async removeBranchesFromACampaign(
    campaignId: number,
    branchIds: number[]
  ): Promise<CampaignBranchesResponse> {
    const res = await this.apiClient.post<
      CampaignBranchesResponse,
      { branchIds: number[] }
    >({
      url: apiUrl.campaign.RemoveBranchesFromACampaign(campaignId),
      data: { branchIds },
    });
    return res.data;
  }
}
