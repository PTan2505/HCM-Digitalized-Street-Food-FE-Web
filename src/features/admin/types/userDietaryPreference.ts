export interface UserDietaryPreference {
  dietaryPreferenceId: number;
  name: string;
  description: string;
}

export interface UsersWithDietaryPreferences {
  userId: number;
  userName: string;
  dietaryPreferences: string[];
}

export interface GetUsersWithDietaryPreferencesResponse {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: UsersWithDietaryPreferences[];
}

export interface CreateOrUpdateUserDietaryPreferenceRequest {
  name: string;
  description: string;
}

export interface CreateOrUpdateUserDietaryPreferenceResponse {
  message?: string;
  data: UserDietaryPreference;
}
