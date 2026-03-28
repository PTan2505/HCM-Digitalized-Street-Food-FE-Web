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
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  isSystemCampaign: boolean;
  imageUrl?: string | null;
}

export interface CampaignCreate {
  name: string;
  description: string | null;
  targetSegment: string | null;
  registrationStartDate: string | null;
  registrationEndDate: string | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface CampaignUpdate {
  name: string;
  description: string | null;
  targetSegment: string | null;
  registrationStartDate: string | null;
  registrationEndDate: string | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
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
