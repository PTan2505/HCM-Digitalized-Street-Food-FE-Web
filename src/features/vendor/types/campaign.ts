export interface VendorCampaign {
  campaignId: number;
  createdByVendorId: number | null;
  name: string;
  description: string | null;
  targetSegment: string | null;
  registrationStartDate?: string | null;
  registrationEndDate?: string | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isRegisterable: boolean;
  createdAt: string;
  updatedAt: string | null;
  isSystemCampaign: boolean;
  imageUrl?: string | null;
  branchIds?: number[] | null;
}

export interface VendorCampaignCreate {
  name: string;
  description: string | null;
  targetSegment: string | null;
  startDate: string;
  endDate: string;
  branchIds: number[] | null;
}

export interface VendorCampaignUpdate {
  name: string;
  description: string | null;
  targetSegment: string | null;
  startDate: string;
  endDate: string;
  branchIds: number[] | null;
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

export interface CampaignBranchesResponse {
  campaignId: number;
  branchIds: number[];
}

export interface CampaignBranchItem {
  finalScore: number;
  distanceKm: number | null;
  branchId: number;
  vendorId: number;
  managerId: number;
  name: string;
  phoneNumber: string;
  email: string;
  addressDetail: string;
  ward: string;
  city: string;
  lat: number;
  long: number;
  createdAt: string;
  updatedAt: string;
  isVerified: boolean;
  avgRating: number;
  totalReviewCount: number;
  isActive: boolean;
  tierId: number;
  tierName: string;
}

export interface GetBranchesOfCampaignResponse {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: CampaignBranchItem[];
}

export interface CampaignDetailsResponse {
  campaignId: number;
  name: string;
  description: string | null;
  targetSegment: string | null;
  requiredTierId: number | null;
  startDate: string;
  endDate: string;
  registrationStartDate: string;
  registrationEndDate: string;
  isActive: boolean;
  imageUrl?: string | null;
  joinableBranch: number[];
}
