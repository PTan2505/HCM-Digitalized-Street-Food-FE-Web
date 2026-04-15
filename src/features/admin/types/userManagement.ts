export type UserRoleFilter = 'user' | 'vendor' | 'system';

export interface GetUsersParams {
  role: string;
  pageNumber: number;
  pageSize: number;
}

export interface SearchUsersParams {
  query: string;
  pageNumber: number;
  pageSize: number;
}

export interface AdminUserItem {
  id: number;
  userName: string;
  email: string;
  phoneNumber: string;
  firstName?: string | null;
  lastName?: string | null;
  role?: number | string | null;
  isBanned?: boolean | null;
  banned?: boolean | null;
  isBlocked?: boolean | null;
  status?: string | null;
}

export interface GetUsersResponse {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: AdminUserItem[];
}
