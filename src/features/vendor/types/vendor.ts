export interface VendorRegistrationRequest {
  name: string;
  phoneNumber: string;
  email: string;
  addressDetail: string;
  buildingName: string;
  ward: string;
  city: string;
  lat: number;
  long: number;
}

export interface Branch {
  branchId: number;
  vendorId: number;
  userId: number;
  name: string;
  phoneNumber: string;
  email: string;
  addressDetail: string;
  buildingName: string;
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
  licenseUrl: string | null;
  licenseUrls: string[] | null;
  licenseStatus: string | null;
  licenseRejectReason: string | null;
}

export interface VendorRegistrationResponse {
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
