import type { Tier } from '@features/admin/types/tier';
import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

export class TierApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getTiers(): Promise<Tier[]> {
    const res = await this.apiClient.get<Tier[]>({
      url: apiUrl.tier.getAllTiers,
    });
    return res.data;
  }
}
