export interface AdminOrderUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  avatarUrl: string;
}

export interface AdminOrderBranch {
  branchId: number;
  name: string;
  city: string;
  phoneNumber: string;
  vendorId: number;
  vendorName: string;
}

export interface AdminOrderPayment {
  id: number;
  orderCode: number;
  amount: number;
  status: string;
  paymentMethod: string;
  paidAt: string;
  transactionCode: string;
}

export interface AdminOrderAppliedVoucher {
  voucherId: number;
  voucherCode: string;
  voucherName: string;
}

export interface AdminOrderItem {
  dishId: number;
  dishName: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface AdminOrder {
  orderId: number;
  status: number;
  table: string | null;
  paymentMethod: string | null;
  note: string | null;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  isTakeAway: boolean;
  orderXP: number;
  createdAt: string;
  updatedAt: string;
  moneyLocation: string;
  user: AdminOrderUser | null;
  branch: AdminOrderBranch | null;
  payment: AdminOrderPayment | null;
  appliedVoucher: AdminOrderAppliedVoucher | null;
  items: AdminOrderItem[];
}

export interface GetAdminOrdersResponse {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: AdminOrder[];
}

export interface GetAdminOrdersPayload {
  pageNumber: number;
  pageSize: number;
  fromDate?: string | null;
  toDate?: string | null;
}
