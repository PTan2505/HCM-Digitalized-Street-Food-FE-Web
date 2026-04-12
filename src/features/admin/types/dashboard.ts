export interface DailySignups {
  date: string;
  signupCount: number;
}

export interface GetUserSignUps {
  fromDate: string;
  toDate: string;
  totalSignupCount: number;
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
  totalBranchRegistrationAmount: number;
  totalSystemCampaignAmount: number;
  dailyAmounts: DailyAmount[];
}

export interface DailyCompensation {
  date: string;
  compensationAmount: number;
}

export interface GetCompensation {
  fromDate: string;
  toDate: string;
  totalCompensationAmount: number;
  dailyCompensations: DailyCompensation[];
}

export interface DailyConversions {
  date: string;
  conversionCount: number;
}

export interface GetConversions {
  fromDate: string;
  toDate: string;
  totalConversionCount: number;
  dailyConversions: DailyConversions[];
}
