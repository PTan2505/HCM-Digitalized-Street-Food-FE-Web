export interface VendorCampaign {
  campaignId: number;
  createdByBranchId: number | null;
  createdByVendorId: number | null;
  name: string;
  description: string | null;
  targetSegment: string | null;
  startDate: string;
  endDate: string;
  status?: string;
  createdAt: string;
  updatedAt: string | null;
  isSystemCampaign: boolean;
}

export interface VendorCampaignCreate {
  name: string;
  description: string | null;
  targetSegment: string | null;
  startDate: string;
  endDate: string;
}

export interface VendorCampaignUpdate {
  name: string;
  description: string | null;
  targetSegment: string | null;
  startDate: string;
  endDate: string;
}

export interface VendorCampaignListResponse {
  totalCount: number;
  items: VendorCampaign[];
}
