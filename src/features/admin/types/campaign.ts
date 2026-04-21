export interface Campaign {
  campaignId: number;
  createdByVendorId: number | null;
  name: string;
  description: string | null;
  targetSegment: string | null;
  registrationStartDate: string | null;
  registrationEndDate: string | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isRegisterable: boolean;
  createdAt: string;
  updatedAt: string | null;
  isSystemCampaign: boolean;
  requiredTierId?: number | null;
  imageUrl?: string | null;
  isUpdateable: boolean;
}

export interface CampaignCreate {
  name: string;
  description: string | null;
  targetSegment: string | null;
  registrationStartDate: string | null;
  registrationEndDate: string | null;
  requiredTierId?: number | null;
  startDate: string;
  endDate: string;
}

export interface CampaignUpdate {
  name: string;
  description: string | null;
  targetSegment: string | null;
  registrationStartDate: string | null;
  registrationEndDate: string | null;
  requiredTierId?: number | null;
  startDate: string;
  endDate: string;
}

export interface CampaignListResponse {
  totalCount: number;
  items: Campaign[];
}

export interface PostCampaignImage {
  image: File;
}

export type PostCampaignImageResponse = string;

export type GetCampaignImageResponse = string;

export interface CampaignBranch {
  branchId: number;
  vendorId: number;
  name: string;
  phoneNumber: string | null;
  email: string | null;
  addressDetail: string;
  tierName: string | null;
  avgRating: number;
  isActive: boolean;
}

export interface CampaignBranchListResponse {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: CampaignBranch[];
}
