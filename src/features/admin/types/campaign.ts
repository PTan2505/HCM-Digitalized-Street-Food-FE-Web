export interface Campaign {
  campaignId: number;
  createdByBranchId: number | null;
  createdByVendorId: number | null;
  name: string;
  description: string | null;
  targetSegment: string | null;
  registrationStartDate: string | null;
  registrationEndDate: string | null;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string | null;
  isSystemCampaign: boolean;
}

export interface CampaignCreate {
  name: string;
  description: string | null;
  targetSegment: string | null;
  registrationStartDate: string | null;
  registrationEndDate: string | null;
  startDate: string;
  endDate: string;
}

export interface CampaignUpdate {
  name: string;
  description: string | null;
  targetSegment: string | null;
  registrationStartDate: string | null;
  registrationEndDate: string | null;
  startDate: string;
  endDate: string;
}

export interface CampaignListResponse {
  totalCount: number;
  items: Campaign[];
}
