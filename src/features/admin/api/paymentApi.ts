import { apiUrl } from '@lib/api/apiUrl';
import type ApiClient from '@lib/api/apiClient';
import type { PaymentPayoutResponse } from '../types/payment';

export class AdminPaymentApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getPaymentPayout(
    pageNumber: number,
    pageSize: number
  ): Promise<PaymentPayoutResponse> {
    const res = await this.apiClient.get<PaymentPayoutResponse>({
      url: apiUrl.payment.getPaymentPayout,
      params: { pageNumber, pageSize },
    });
    return res.data;
  }
}
