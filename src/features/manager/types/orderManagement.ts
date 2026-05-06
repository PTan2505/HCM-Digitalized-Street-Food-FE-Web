export interface ManagerOrderItem {
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

export interface ManagerOrder {
  orderId: number;
  userId: number;
  userName?: string | null;
  branchId: number;
  branchName: string;
  status: number;
  table: string | null;
  note: string | null;
  paymentMethod: string | null;
  appliedVoucherCode?: string | null;
  appliedVoucherName?: string | null;
  totalAmount: number;
  discountAmount: number | null;
  finalAmount: number;
  platformFee: number;
  vendorPayout: number;
  isTakeAway: boolean;
  lockedAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: ManagerOrderItem[];
}

export interface GetManagerOrdersResponse {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: ManagerOrder[];
}
