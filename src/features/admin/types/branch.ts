export interface BranchAdmin {
  branchId: number;
  vendorId: number;
  vendorName?: string | null;
  managerId: number | null;
  name: string;
  phoneNumber: string | null;
  email: string | null;
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
  totalRatingSum: number;
  batchReviewCount: number;
  batchRatingSum: number;
  isActive: boolean;
  isSubscribed: boolean;
  subscriptionExpiresAt: string | null;
  daysRemaining: number | null;
  createdById: number | null;
  lastTierResetAt: string | null;
  ghostpinXP: number | null;
  tierId: number | null;
  tierName: string | null;
  licenseUrls: string | null;
  licenseStatus: string | null;
  verifiedBy: number | null;
  verifiedByUserName: string | null;
  licenseRejectReason: string | null;
}

export interface GetBranchesAdminResponse {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: BranchAdmin[];
}

export interface GetBranchesAdminParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
}
