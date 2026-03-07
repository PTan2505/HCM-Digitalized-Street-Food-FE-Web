export interface VendorRegistrationRequest {
  name: string;
  phoneNumber: string;
  email: string;
  addressDetail: string;
  branchName: string;
  ward: string;
  city: string;
  lat: number;
  long: number;
  isActive?: boolean;
}

export interface Branch {
  branchId: number;
  vendorId: number;
  userId: number;
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
  userId: number;
  name: string;
  createdAt: string;
  updatedAt: string | null;
  isActive: boolean;
  vendorOwnerName: string;
  branches: Branch[];
}

export interface GetMyVendorResponse {
  vendorId: number;
  userId: number;
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
  message: string;
  success: boolean;
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
  branchId: number;
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
