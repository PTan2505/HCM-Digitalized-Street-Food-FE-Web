export interface Badge {
  badgeName: string;
  pointToGet: number;
  iconUrl: string;
  description: string;
  badgeId: number;
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

export interface CreateOrUpdateBadgeRequest {
  badgeName: string;
  pointToGet: number;
  iconUrl: string;
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
