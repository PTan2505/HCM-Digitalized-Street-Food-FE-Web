import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';
import type {
  GetAdminOrdersPayload,
  GetAdminOrdersResponse,
} from '@features/admin/types/order';

export class AdminOrderApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getAdminOrders(
    params: GetAdminOrdersPayload
  ): Promise<GetAdminOrdersResponse> {
    const res = await this.apiClient.get<GetAdminOrdersResponse>({
      url: apiUrl.order.getAdminOrders,
      params,
    });
    return res.data;
  }
}
