export interface Badge {
  badgeName: string;
  iconUrl: string;
  description: string;
  badgeId: number;
  isActive?: boolean;
  isEarned?: boolean;
  earnedAt?: string;
}

export interface UserWithBadges {
  userId: number;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  point: number;
  badges: Badge[];
}

export interface GetUsersWithBadges {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: UserWithBadges[];
}

export interface CreateOrUpdateBadgeRequest {
  badgeName: string;
  imageFile?: File | null;
  description: string;
}

export interface CreateOrUpdateBadgeResponse {
  message?: string;
  data: Badge;
}

export interface AwardOrRevokeBadgeRequest {
  userId: number;
  badgeId: number;
}

export interface AwardOrRevokeBadgeResponse {
  message?: string;
  data: object;
}
