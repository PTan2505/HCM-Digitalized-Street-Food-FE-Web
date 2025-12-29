import type { User } from '@custom-types/user';
import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

interface UserList {
  users: User[];
  count: number;
  next: string | null;
  previous: string | null;
}

export class UserProfileApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getUserProfile(): Promise<User> {
    const res = await this.apiClient.get<User>({
      url: apiUrl.profile.customer,
    });
    return res.data;
  }

  async getUserList(): Promise<UserList> {
    const res = await this.apiClient.get<UserList>({
      url: apiUrl.users.list,
    });
    return res.data;
  }
}
