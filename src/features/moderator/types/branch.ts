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
  vendor: unknown | null;
  user: unknown | null;
  workSchedules: unknown[] | null;
  dayOffs: unknown[] | null;
  branchImages: unknown[] | null;
  dishes: unknown[];
}

export interface BranchRegisterRequest {
  branchRegisterRequestId: number;
  branchId: number;
  licenseUrl: string;
  status: number;
  rejectReason: string | null;
  createdAt: string;
  updatedAt: string;
  branch: Branch;
}

export interface GetPendingRegistrationsResponse {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: BranchRegisterRequest[];
}

export interface VerifyRegistrationRequest {
  branchId: number;
}

export interface VerifyRegistrationResponse {
  message: string;
}

export interface RejectRegistrationRequest {
  branchId: number;
  reason: string;
}

export interface RejectRegistrationResponse {
  message: string;
}
