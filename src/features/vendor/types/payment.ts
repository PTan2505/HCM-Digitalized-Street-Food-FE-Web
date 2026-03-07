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

export interface PaymentHistoryItem {
  id: number;
  userId: number;
  branchId: number;
  orderCode: number;
  amount: number;
  description: string;
  status: string;
  createdAt: string;
  paidAt: string | null;
  paymentLinkId: string | null;
  transactionCode: string | null;
  paymentMethod: string | null;
  checkoutUrl: string | null;
  user: unknown | null;
}

export type GetPaymentHistoryResponse = PaymentHistoryItem[];

export interface GetPaymentSuccessResponse {
  message?: string;
}

export interface GetPaymentCancelResponse {
  message?: string;
}
