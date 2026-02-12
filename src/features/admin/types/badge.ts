export interface Badge {
  badgeName: string;
  pointToGet: number;
  iconUrl: string;
  description: string;
  badgeId: number;
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
