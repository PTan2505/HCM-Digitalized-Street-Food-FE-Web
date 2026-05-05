export interface DailySignups {
  date: string;
  signupCount: number;
}

export interface GetUserSignUps {
  fromDate: string;
  toDate: string;
  previousPeriod: string | null;
  totalSignupCount: number;
  signupGrowthRate: number | null;
  dailySignups: DailySignups[];
}

export interface DailyAmount {
  date: string;
  branchRegistrationAmount: number;
  systemCampaignAmount: number;
}

export interface GetMoney {
  fromDate: string;
  toDate: string;
  previousPeriod: string | null;
  totalBranchRegistrationAmount: number;
  totalSystemCampaignAmount: number;
  branchRegistrationGrowthRate: number | null;
  systemCampaignGrowthRate: number | null;
  dailyAmounts: DailyAmount[];
}

export interface DailyCompensation {
  date: string;
  compensationAmount: number;
}

export interface VendorCompensation {
  vendorId: number;
  vendorName: string;
  compensationAmount: number;
}

export interface GetCompensation {
  fromDate: string;
  toDate: string;
  previousPeriod: string | null;
  totalCompensationAmount: number;
  compensationGrowthRate: number | null;
  dailyCompensations: DailyCompensation[];
  compensationByVendors: VendorCompensation[];
}

export interface DailyConversions {
  date: string;
  conversionCount: number;
}

export interface GetConversions {
  fromDate: string;
  toDate: string;
  previousPeriod: string | null;
  totalConversionCount: number;
  conversionGrowthRate: number | null;
  dailyConversions: DailyConversions[];
}

export interface SystemCampaignQuest {
  questId: number;
  questTitle: string;
  totalUsersDoing: number;
  usersCurrentlyDoing: number;
  usersFinished: number;
}

export interface SystemCampaignBranchOrder {
  branchId: number;
  branchName: string;
  orderCount: number;
}

export interface SystemCampaignVoucher {
  voucherId: number;
  voucherName: string;
  totalUsed: number;
}

export interface SystemCampaignOrder {
  orderId: number;
  branchName: string;
  voucherName: string;
  totalAmount: number;
  discountAmount: number;
  createdAt: string;
}

export interface SystemCampaignStatistics {
  campaignId: number;
  campaignName: string;
  totalBranchesJoined: number;
  totalOrders: number;
  quests: SystemCampaignQuest[];
  branchOrders: SystemCampaignBranchOrder[];
  vouchers: SystemCampaignVoucher[];
  campaignOrders: SystemCampaignOrder[];
}
