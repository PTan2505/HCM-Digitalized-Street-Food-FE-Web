import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';
import type {
  MarkAsReadResponse,
  PaginatedNotifications,
  UnreadCountResponse,
} from '@custom-types/notification';

export class NotificationApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getNotifications(
    page: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedNotifications> {
    const res = await this.apiClient.get<PaginatedNotifications>({
      url: apiUrl.notification.getNotifications,
      params: { page, pageSize },
    });
    return res.data;
  }

  async getUnreadCount(): Promise<UnreadCountResponse> {
    const res = await this.apiClient.get<UnreadCountResponse>({
      url: apiUrl.notification.getUnreadCount,
    });
    return res.data;
  }

  async markAsRead(notificationId: number): Promise<MarkAsReadResponse> {
    const res = await this.apiClient.put<MarkAsReadResponse, null>({
      url: apiUrl.notification.markAsRead(notificationId),
    });
    return res.data;
  }

  async markAllAsRead(): Promise<MarkAsReadResponse> {
    const res = await this.apiClient.put<MarkAsReadResponse, null>({
      url: apiUrl.notification.markAllAsRead,
    });
    return res.data;
  }
}
