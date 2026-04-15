export interface VendorRegistrationRequest {
  name?: string;
  phoneNumber: string;
  email: string;
  addressDetail: string;
  branchName?: string;
  ward: string;
  city: string;
  lat: number;
  long: number;
  dietaryPreferenceIds: number[];
  isActive?: boolean;
}

export interface Branch {
  branchId: number;
  vendorId: number;
  userId?: number;
  managerId: number;
  name: string;
  phoneNumber: string;
  email: string;
  addressDetail: string;
  branchName: string;
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
  tierId?: number;
  tierName?: string;
  isActive: boolean;
  isSubscribed: boolean;
  daysRemaining: number | null;
  licenseUrl: string | null;
  licenseUrls: string[] | null;
  licenseStatus: string | null;
  licenseRejectReason: string | null;
}

export interface VendorRegistrationResponse {
  branchId: number;
  vendorId: number;
  userId?: number;
  managerId: number;
  name: string;
  createdAt: string;
  updatedAt: string | null;
  isActive: boolean;
  vendorOwnerName: string;
  branches: Branch[];
}

export interface CreateOrUpdateBranchResponse {
  branchId: number;
  vendorId: number;
  userId?: number;
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
  updatedAt: string | null;
  isVerified: boolean;
  avgRating: number;
  isActive: boolean;
  isSubscribed: boolean;
  subscriptionExpiresAt: string | null;
  daysRemaining: number | null;
  licenseUrl?: string | null;
  licenseUrls: string[] | null;
  licenseStatus: string | null;
  licenseRejectReason: string | null;
}

export interface GetMyVendorResponse {
  vendorId: number;
  userId?: number;
  managerId: number;
  name: string;
  createdAt: string;
  updatedAt: string | null;
  isActive: boolean;
  vendorOwnerName: string;
  branches: Branch[];
}

export interface SubmitLicenseRequest {
  branchId: number;
  licenseImages: File[];
}

export interface SubmitLicenseResponse {
  branchId: number;
  licenseUrls: string[];
  status: string;
}

export interface CheckLicenseStatusResponse {
  branchId: number;
  status: string;
  licenseUrls: string[] | null;
  rejectReason: string | null;
  submittedAt: string;
}

export interface SubmitImagesRequest {
  branchId: number;
  image: File;
}

export interface SubmitImagesResponse {
  branchImageId: number;
  // branchId is optional because the GetImagesResponse doesn't include branchId in its items
  branchId?: number;
  imageUrl: string;
  // branch?: Branch;
}

export interface GetImagesResponse {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: SubmitImagesResponse[];
}

export interface UpdateVendorNameRequest {
  name: string;
}

export interface UpdateVendorNameResponse {
  vendorId: number;
  userId?: number;
  managerId: number;
  name: string;
  createdAt: string;
  updatedAt: string | null;
  isActive: boolean;
  vendorOwnerName: string;
  branches: Branch[];
}

export type UpdateDietaryPreferencesOfMyVendorRequest = number[];

export interface DietaryPreferences {
  dietaryPreferenceId: number;
  name: string;
  description: string;
}

export type UpdateOrGetDietaryPreferencesOfMyVendorResponse =
  DietaryPreferences[];

export interface GhostPin {
  branchId: number;
  vendorId: number;
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
  updatedAt: string | null;
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
  tierId: number;
  tierName: string;
  licenseUrls: string[];
  licenseStatus: string | null;
  licenseRejectReason: string | null;
}

export interface GetAllGhostPinsResponse {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: GhostPin[];
}

export interface ClaimBranchRequest {
  branchId: number;
  licenseImages: File[];
}

export interface ClaimBranchResponse {
  paymentLink?: string | null;
  licenseUrls: string[];
}

export interface UserSearchItem {
  id: number;
  userName: string;
  email: string;
  phoneNumber: string;
}

export interface SearchUsersResponse {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: UserSearchItem[];
}

export interface AssignBranchManagerRequest {
  managerId: number;
}
