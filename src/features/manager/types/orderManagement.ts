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
  paymentMethod: string | null;
  totalAmount: number;
  discountAmount: number | null;
  finalAmount: number;
  isTakeAway: boolean;
  note?: string | null;
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
