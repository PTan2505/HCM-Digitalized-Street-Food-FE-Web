import type { GetManagerOrdersResponse } from '@features/manager/types/orderManagement';
import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

export class OrderManagementApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getManagerOrders(params: {
    pageNumber: number;
    pageSize: number;
  }): Promise<GetManagerOrdersResponse> {
    const res = await this.apiClient.get<GetManagerOrdersResponse>({
      url: apiUrl.order.getManagerOrders,
      params,
    });
    return res.data;
  }
}
