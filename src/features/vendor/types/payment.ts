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

export interface GetVendorBalanceResponse {
  balance: number;
}

export interface VendorRequestTransferRequest {
  description: string;
  toAccountNumber: string;
  toBin: string;
  amount: number;
}

export interface VendorRequestTransferResponse {
  referenceId: string;
  payoutId: string;
  approvalState: string;
  currentVendorBalance: number;
}

export interface VendorBalanceHistoryItem {
  id: number;
  userId: number;
  userName: string | null;
  userEmail: string | null;
  amount: number;
  description: string;
  status: string | null;
  createdAt: string;
  paidAt: string | null;
  transactionCode: string | null;
  orderId: number | null;
  branchId: number | null;
  branchCampaignId: number | null;
  paymentMethod: 'Vendor Wallet' | 'PAYOS_PAYOUT' | null;
  checkoutUrl: string | null;
}

export interface VendorBalanceHistoryFilter {
  fromDate?: string;
  toDate?: string;
  paymentMethod?: string;
  pageNumber: number;
  pageSize: number;
}

export interface VendorBalanceHistoryPaginatedResponse {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: VendorBalanceHistoryItem[];
}

export type GetVendorBalanceHistoryResponse = VendorBalanceHistoryPaginatedResponse;
