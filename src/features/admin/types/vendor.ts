export interface AdminVendor {
  vendorId: number;
  userId: number;
  name: string;
  createdAt: string;
  updatedAt: string | null;
  isActive: boolean;
  vendorOwnerName: string;
}

export interface VendorBranch {
  branchId: number;
  vendorId: number;
  userId?: number | null;
  managerId?: number | null;
  name: string;
  phoneNumber: string;
  email: string;
  addressDetail: string;
  branchName?: string | null;
  ward: string;
  city: string;
  lat: number;
  long: number;
  createdAt: string;
  updatedAt: string | null;
  isVerified: boolean;
  avgRating: number;
  totalReviewCount?: number;
  totalRatingSum?: number;
  batchReviewCount?: number;
  batchRatingSum?: number;
  isActive: boolean;
  isSubscribed: boolean;
  subscriptionExpiresAt?: string | null;
  daysRemaining?: number | null;
  tierId?: number | null;
  tierName?: string | null;
  licenseUrl?: string | null;
  licenseUrls: string[] | null;
  licenseStatus: string | null;
  licenseRejectReason: string | null;
}

export interface VendorOwner {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  avatarUrl: string | null;
}

export interface VendorDetail {
  vendorId: number;
  userId: number;
  name: string;
  createdAt: string;
  updatedAt: string | null;
  isActive: boolean;
  vendorOwner: VendorOwner;
  vendorOwnerName: string;
  branches: VendorBranch[];
  dietaryPreferences?: Array<{
    dietaryId?: number;
    name?: string;
  }>;
}

export interface GetAllVendorsResponse {
  items: AdminVendor[];
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface GetAllVendorsParams {
  pageNumber: number;
  pageSize: number;
}
