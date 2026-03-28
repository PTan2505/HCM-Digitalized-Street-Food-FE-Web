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
  imageUrl?: string | null;
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

export interface JoinSystemCampaignRequest {
  branchIds: number[];
}

export interface PaymentResponse {
  paymentUrl: string | null;
  orderCode: number;
  paymentLinkId: string;
}

export interface BranchJoinedResponse {
  branchId: number;
  status: string;
}

export interface JoinSystemCampaignResponse {
  payment: PaymentResponse;
  branches: BranchJoinedResponse[];
}

export interface CampaignDetailsResponse {
  campaignId: number;
  name: string;
  description: string | null;
  targetSegment: string | null;
  startDate: string;
  endDate: string;
  registrationStartDate: string;
  registrationEndDate: string;
  isActive: boolean;
  imageUrl?: string | null;
  joinableBranch: number[];
}
