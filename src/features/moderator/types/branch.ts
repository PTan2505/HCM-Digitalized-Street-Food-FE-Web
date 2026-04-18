export interface BranchUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  phoneNumber?: string | null;
}

export interface Branch {
  branchId: number;
  vendorId: number;
  userId?: number | null;
  managerId?: number | null;
  createdById?: number | null;
  requestedByUserId?: number | null;
  userShareName?: string | null;
  userShareEmail?: string | null;
  userSharePhone?: string | null;
  vendorUserName?: string | null;
  vendorUserEmail?: string | null;
  vendorUserPhone?: string | null;
  name: string;
  phoneNumber: string | null;
  email: string | null;
  addressDetail: string;
  branchName?: string;
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
  vendor?: unknown | null;
  user?: BranchUser | null;
  workSchedules?: unknown[] | null;
  dayOffs?: unknown[] | null;
  branchImages?: unknown[] | null;
  dishes?: unknown[];
}

export interface BranchRegisterRequest {
  branchRequestId: number;
  branchId: number | null;
  licenseUrl: string | null;
  status: number;
  rejectReason: string | null;
  createdAt: string;
  updatedAt: string;
  isCreatedByOwner: boolean;
  type: number;
  userShareName?: string;
  userShareEmail?: string;
  userSharePhone?: string;
  vendorUserName?: string;
  vendorUserEmail?: string;
  vendorUserPhone?: string;
  branch: Branch;
}

export type PendingRegistrationType = 0 | 1 | 2;

export interface GetPendingRegistrationsParams {
  pageNumber: number;
  pageSize: number;
  type: PendingRegistrationType;
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
