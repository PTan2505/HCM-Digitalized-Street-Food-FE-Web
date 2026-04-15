import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';
import type { PublicCampaign } from '../types/campaign';

type PublicCampaignResponse = PublicCampaign[] | { items?: PublicCampaign[] };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isPublicCampaign(value: unknown): value is PublicCampaign {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value.campaignId === 'number' && 'imageUrl' in value;
}

function normalizePublicCampaigns(response: unknown): PublicCampaign[] {
  if (Array.isArray(response)) {
    return response.filter(isPublicCampaign);
  }

  if (
    isRecord(response) &&
    Array.isArray(response.items) &&
    response.items.every(isPublicCampaign)
  ) {
    return response.items;
  }

  return [];
}

export class HomeCampaignApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getPublicCampaigns(): Promise<PublicCampaign[]> {
    const res = await this.apiClient.get<PublicCampaignResponse>({
      url: apiUrl.campaign.GetPublicCampaigns,
    });

    return normalizePublicCampaigns(res.data);
  }
}
