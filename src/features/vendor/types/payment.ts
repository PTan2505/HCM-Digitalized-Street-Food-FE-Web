export interface CreatePaymentLinkRequest {
  branchId: number;
}

export interface ConfirmPaymentRequest {
  code?: string;
  orderCode: number;
  status?: string;
  transactionId?: string;
}

export interface CreatePaymentLinkResponse {
  paymentUrl: string;
  orderCode: string;
  paymentLinkId: string;
  requireConfirmation: boolean;
  success: boolean;
  message?: string;
}

export interface GetPaymentStatusResponse {
  orderCode: string;
  status: string;
  amount: number;
  description: string;
  createdAt: string;
  paidAt: string;
  transactionCode: string;
  message?: string;
}

export interface ConfirmPaymentResponse {
  orderCode: string;
  status: string;
  amount: number;
  description: string;
  createdAt: string;
  paidAt: string;
  transactionCode: string;
  message?: string;
}

export interface GetPaymentHistoryResponse {}

export interface GetPaymentSuccessResponse {}

export interface GetPaymentCancelResponse {}
