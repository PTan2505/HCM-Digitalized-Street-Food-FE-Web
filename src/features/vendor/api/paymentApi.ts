import type {
  CreatePaymentLinkRequest,
  ConfirmPaymentRequest,
  ConfirmPaymentResponse,
  CreatePaymentLinkResponse,
  GetPaymentCancelResponse,
  GetPaymentHistoryResponse,
  GetPaymentStatusResponse,
  GetPaymentSuccessResponse,
  GetVendorBalanceResponse,
  GetVendorBalanceHistoryResponse,
  VendorRequestTransferRequest,
  VendorRequestTransferResponse,
} from '@features/vendor/types/payment';
import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

export class PaymentApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async createPaymentLink(
    data: CreatePaymentLinkRequest
  ): Promise<CreatePaymentLinkResponse> {
    const res = await this.apiClient.post<
      CreatePaymentLinkResponse,
      CreatePaymentLinkRequest
    >({
      url: apiUrl.payment.createPaymentLink,
      data,
    });
    return res.data;
  }

  async getPaymentStatus(orderCode: string): Promise<GetPaymentStatusResponse> {
    const res = await this.apiClient.get<GetPaymentStatusResponse>({
      url: apiUrl.payment.getPaymentStatus(orderCode),
    });
    return res.data;
  }

  async confirmPayment(
    data: ConfirmPaymentRequest
  ): Promise<ConfirmPaymentResponse> {
    const res = await this.apiClient.post<
      ConfirmPaymentResponse,
      ConfirmPaymentRequest
    >({
      url: apiUrl.payment.confirmPayment,
      data,
    });
    return res.data;
  }

  async getPaymentHistory(): Promise<GetPaymentHistoryResponse> {
    const res = await this.apiClient.get<GetPaymentHistoryResponse>({
      url: apiUrl.payment.getPaymentHistory,
    });
    return res.data;
  }

  async getPaymentSuccess(params: {
    orderCode: number;
    status: string;
  }): Promise<GetPaymentSuccessResponse> {
    const res = await this.apiClient.get<GetPaymentSuccessResponse>({
      url: apiUrl.payment.getPaymentSuccess,
      params,
    });
    return res.data;
  }

  async getPaymentCancel(params: {
    orderCode: number;
  }): Promise<GetPaymentCancelResponse> {
    const res = await this.apiClient.get<GetPaymentCancelResponse>({
      url: apiUrl.payment.getPaymentCancel,
      params,
    });
    return res.data;
  }

  async getVendorBalance(): Promise<GetVendorBalanceResponse> {
    const res = await this.apiClient.get<GetVendorBalanceResponse>({
      url: apiUrl.payment.getVendorBalance,
    });
    return res.data;
  }

  async getVendorBalanceHistory(): Promise<GetVendorBalanceHistoryResponse> {
    const res = await this.apiClient.get<GetVendorBalanceHistoryResponse>({
      url: apiUrl.payment.getVendorBalanceHistory,
    });
    return res.data;
  }

  async vendorRequestTransfer(
    data: VendorRequestTransferRequest
  ): Promise<VendorRequestTransferResponse> {
    const res = await this.apiClient.post<
      VendorRequestTransferResponse,
      VendorRequestTransferRequest
    >({
      url: apiUrl.payment.vendorRequestTransfer,
      data,
    });
    return res.data;
  }
}
