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

export interface CreateOrUpdateUserDietaryPreferenceRequest {
  name: string;
  description: string;
}

export interface CreateOrUpdateUserDietaryPreferenceResponse {
  message?: string;
  data: UserDietaryPreference;
}
