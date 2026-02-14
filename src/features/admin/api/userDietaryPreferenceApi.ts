import type {
  UserDietaryPreference,
  CreateOrUpdateUserDietaryPreferenceRequest,
  CreateOrUpdateUserDietaryPreferenceResponse,
  UsersWithDietaryPreferences,
} from '@features/admin/types/userDietaryPreference';
import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

export class userDietaryPreferenceApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async createUserDietaryPreference(
    data: CreateOrUpdateUserDietaryPreferenceRequest
  ): Promise<CreateOrUpdateUserDietaryPreferenceResponse> {
    let res = null;
    res = await this.apiClient.post<
      CreateOrUpdateUserDietaryPreferenceResponse,
      CreateOrUpdateUserDietaryPreferenceRequest
    >({
      url: apiUrl.userDietaryPreference.getAllOrPostDietaryPreference,
      data,
    });
    return res.data;
  }

  async updateUserDietaryPreference(
    userDietaryPreferenceId: number,
    data: CreateOrUpdateUserDietaryPreferenceRequest
  ): Promise<CreateOrUpdateUserDietaryPreferenceResponse> {
    let res = null;
    res = await this.apiClient.put<
      CreateOrUpdateUserDietaryPreferenceResponse,
      CreateOrUpdateUserDietaryPreferenceRequest
    >({
      url: apiUrl.userDietaryPreference.updateOrDeleteDietaryPreference(
        userDietaryPreferenceId
      ),
      data,
    });
    return res.data;
  }

  async deleteUserDietaryPreference(
    userDietaryPreferenceId: number
  ): Promise<{ message: string }> {
    let res = null;
    res = await this.apiClient.delete<{ message: string }>({
      url: apiUrl.userDietaryPreference.updateOrDeleteDietaryPreference(
        userDietaryPreferenceId
      ),
    });
    return res.data;
  }

  async getAllUserDietaryPreferences(): Promise<UserDietaryPreference[]> {
    let res = null;
    res = await this.apiClient.get<UserDietaryPreference[]>({
      url: apiUrl.userDietaryPreference.getAllOrPostDietaryPreference,
    });
    return res.data;
  }

  async getUsersWithDietaryPreferences(): Promise<
    UsersWithDietaryPreferences[]
  > {
    let res = null;
    res = await this.apiClient.get<UsersWithDietaryPreferences[]>({
      url: apiUrl.userDietaryPreference.getUsersWithDietaryPreferences,
    });
    return res.data;
  }
}
