import type {
  GetUsersParams,
  GetUsersResponse,
  SearchUsersParams,
} from '@features/admin/types/userManagement';
import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

export class UserAdminApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getUsers(params: GetUsersParams): Promise<GetUsersResponse> {
    let res = null;
    res = await this.apiClient.get<GetUsersResponse>({
      url: apiUrl.user.getUsers,
      params,
    });
    return res.data;
  }

  async searchUsers(params: SearchUsersParams): Promise<GetUsersResponse> {
    let res = null;
    res = await this.apiClient.get<GetUsersResponse>({
      url: apiUrl.user.search,
      params,
    });
    return res.data;
  }

  async banUser(id: number): Promise<{ message: string }> {
    let res = null;
    res = await this.apiClient.post<{ message: string }, null>({
      url: apiUrl.user.banUser(id),
      data: null,
    });
    return res.data;
  }

  async unbanUser(id: number): Promise<{ message: string }> {
    let res = null;
    res = await this.apiClient.post<{ message: string }, null>({
      url: apiUrl.user.unbanUser(id),
      data: null,
    });
    return res.data;
  }
}
