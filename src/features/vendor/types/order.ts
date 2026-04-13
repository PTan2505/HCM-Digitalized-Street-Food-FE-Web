export interface VendorOrderItem {
  dishId: number;
  dishName: string;
  quantity: number;
  unitPrice?: number | null;
  totalAmount?: number | null;
  finalAmount?: number | null;
  lineAmount?: number | null;
  amount?: number | null;
  subtotal?: number | null;
  price?: number | null;
}

export interface VendorOrder {
  orderId: number;
  userId: number;
  userName?: string | null;
  branchId: number;
  branchName: string;
  status: number;
  table: string | null;
  note: string | null;
  paymentMethod: string | null;
  totalAmount: number;
  discountAmount: number | null;
  finalAmount: number;
  isTakeAway: boolean;
  note?: string | null;
  lockedAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: VendorOrderItem[];
}

export interface GetVendorBranchOrdersResponse {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: VendorOrder[];
}

export interface DecideVendorOrderResponse {
  orderId: number;
  status: number;
  finalAmount: number;
}

export interface GetOrderPickupCodeResponse {
  orderId: number;
  verificationCode: string;
  qrContent: string;
}

export interface CompleteVendorOrderResponse {
  orderId: number;
  status: number;
  finalAmount: number;
}

export interface UpdateOrderPayload {
  table?: string | null;
}

export type UpdateOrderResponse = VendorOrder;

export type OrderDetailsResponse = VendorOrder;
