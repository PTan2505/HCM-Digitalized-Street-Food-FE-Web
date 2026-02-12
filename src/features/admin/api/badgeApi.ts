import type {
  Badge,
  CreateOrUpdateBadgeRequest,
  CreateOrUpdateBadgeResponse,
} from '@features/admin/types/badge';
import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

export class BadgeApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async createBadge(
    data: CreateOrUpdateBadgeRequest
  ): Promise<CreateOrUpdateBadgeResponse> {
    let res = null;
    res = await this.apiClient.post<
      CreateOrUpdateBadgeResponse,
      CreateOrUpdateBadgeRequest
    >({
      url: apiUrl.badge.getAllOrPostBadge,
      data,
    });
    return res.data;
  }

  async updateBadge(
    badgeId: number,
    data: CreateOrUpdateBadgeRequest
  ): Promise<CreateOrUpdateBadgeResponse> {
    let res = null;
    res = await this.apiClient.put<
      CreateOrUpdateBadgeResponse,
      CreateOrUpdateBadgeRequest
    >({
      url: apiUrl.badge.updateOrDeleteBadge(badgeId),
      data,
    });
    return res.data;
  }

  async deleteBadge(badgeId: number): Promise<{ message: string }> {
    let res = null;
    res = await this.apiClient.delete<{ message: string }>({
      url: apiUrl.badge.updateOrDeleteBadge(badgeId),
    });
    return res.data;
  }

  async getAllBadges(): Promise<Badge[]> {
    let res = null;
    res = await this.apiClient.get<Badge[]>({
      url: apiUrl.badge.getAllOrPostBadge,
    });
    return res.data;
  }
}
