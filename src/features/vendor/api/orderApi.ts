import type {
  CompleteVendorOrderResponse,
  DecideVendorOrderResponse,
  GetOrderPickupCodeResponse,
  GetVendorBranchOrdersResponse,
  OrderDetailsResponse,
} from '@features/vendor/types/order';
import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

export class OrderApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getVendorOrders(params: {
    pageNumber: number;
    pageSize: number;
  }): Promise<GetVendorBranchOrdersResponse> {
    const res = await this.apiClient.get<GetVendorBranchOrdersResponse>({
      url: apiUrl.order.getVendorOrders,
      params,
    });
    return res.data;
  }

  async getVendorBranchOrders(
    branchId: number,
    params: {
      pageNumber: number;
      pageSize: number;
    }
  ): Promise<GetVendorBranchOrdersResponse> {
    const res = await this.apiClient.get<GetVendorBranchOrdersResponse>({
      url: apiUrl.order.getVendorBranchOrders(branchId),
      params,
    });
    return res.data;
  }

  async decideVendorOrder(
    orderId: number,
    approve: boolean
  ): Promise<DecideVendorOrderResponse> {
    const res = await this.apiClient.put<DecideVendorOrderResponse, null>({
      url: apiUrl.order.decideVendorOrder(orderId),
      params: {
        approve,
      },
    });
    return res.data;
  }

  async getOrderPickupCode(
    orderId: number
  ): Promise<GetOrderPickupCodeResponse> {
    const res = await this.apiClient.get<GetOrderPickupCodeResponse>({
      url: apiUrl.order.getOrderPickupCode(orderId),
    });
    return res.data;
  }

  async completeVendorOrder(
    orderId: number,
    verificationCode: string
  ): Promise<CompleteVendorOrderResponse> {
    const res = await this.apiClient.put<CompleteVendorOrderResponse, null>({
      url: apiUrl.order.completeVendorOrder(orderId),
      params: {
        verificationCode,
      },
    });
    return res.data;
  }

  async getOrderDetails(orderId: number): Promise<OrderDetailsResponse> {
    const res = await this.apiClient.get<OrderDetailsResponse>({
      url: apiUrl.order.getOrderDetails(orderId),
    });
    return res.data;
  }
}
