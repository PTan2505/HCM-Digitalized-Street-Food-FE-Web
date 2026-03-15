import type {
  Badge,
  CreateOrUpdateBadgeRequest,
  CreateOrUpdateBadgeResponse,
  GetUsersWithBadges,
  AwardOrRevokeBadgeRequest,
  AwardOrRevokeBadgeResponse,
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

  async getUsersWithBadges(params: {
    pageNumber: number;
    pageSize: number;
  }): Promise<GetUsersWithBadges> {
    const res = await this.apiClient.get<GetUsersWithBadges>({
      url: apiUrl.badge.getUsersWithBadges,
      params,
    });
    return res.data;
  }

  async awardBadgeToUser(
    data: AwardOrRevokeBadgeRequest
  ): Promise<AwardOrRevokeBadgeResponse> {
    const res = await this.apiClient.post<
      AwardOrRevokeBadgeResponse,
      AwardOrRevokeBadgeRequest
    >({
      url: apiUrl.badge.awardUserBadge(data.userId, data.badgeId),
      data,
    });

    return res.data;
  }

  async revokeBadgeFromUser(
    data: AwardOrRevokeBadgeRequest
  ): Promise<AwardOrRevokeBadgeResponse> {
    const res = await this.apiClient.delete<AwardOrRevokeBadgeResponse>({
      url: apiUrl.badge.revokeUserBadge(data.userId, data.badgeId),
    });

    return res.data;
  }
}
