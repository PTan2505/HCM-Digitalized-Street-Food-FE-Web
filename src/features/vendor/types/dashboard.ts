export interface VendorDashboardRevenue {
  totalRevenue: number;
  totalOrders: number;
  revenueGrowthRate: number | null;
  ordersGrowthRate: number | null;
  previousPeriod: string | null;
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

export interface VendorDashboardCampaigns {
  totalCampaigns: number;
  totalCampaignOrders: number;
  totalCampaignRevenue: number;
  campaigns: CampaignStat[];
}

export interface CampaignBranchStat {
  branchId: number;
  branchName: string;
  orderCount: number;
  revenue: number;
}

export interface CampaignStat {
  campaignId: number;
  campaignName: string;
  orderCount: number;
  revenue: number;
  branches?: CampaignBranchStat[];
}
