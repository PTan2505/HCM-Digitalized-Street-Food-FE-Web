export interface VendorCampaign {
  campaignId: number;
  createdByBranchId: number | null;
  createdByVendorId: number | null;
  name: string;
  description: string | null;
  targetSegment: string | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
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
  isActive: boolean;
}

export interface VendorCampaignUpdate {
  name: string;
  description: string | null;
  targetSegment: string | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface VendorCampaignListResponse {
  totalCount: number;
  items: VendorCampaign[];
}

export interface JoinSystemCampaignResponse {
  success: boolean;
  message: string | null;
  paymentUrl: string | null;
  orderCode: number;
  paymentLinkId: string;
  requiresConfirmation: boolean;
}
