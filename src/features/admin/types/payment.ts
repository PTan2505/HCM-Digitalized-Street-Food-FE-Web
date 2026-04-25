export interface PaymentPayoutItem {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  amount: number;
  description: string;
  status: string;
  createdAt: string;
  paidAt: string | null;
  transactionCode: string;
  orderId: number | null;
  branchId: number | null;
  branchCampaignId: number | null;
  paymentMethod: string;
  checkoutUrl: string | null;
}

export interface PaymentPayoutResponse {
  result: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
    hasPrevious: boolean;
    hasNext: boolean;
    items: PaymentPayoutItem[];
  };
  totalAmount: number;
}
