export interface VendorDashboardRevenue {
  totalRevenue: number;
  totalOrders: number;
  dailyRevenues: DailyRevenue[];
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface VendorDashboardVoucher {
  voucherUsages: VoucherUsages[];
}

export interface VoucherUsages {
  voucherType: VoucherType;
  voucherName: string;
  usageCount: number;
}

export type VoucherType = 'PERCENT' | 'AMOUNT';

export interface VendorDashboardDishes {
  topDishes: TopDishes[];
}

export interface TopDishes {
  dishId: number;
  dishName: string;
  totalQuantityOrdered: number;
}
