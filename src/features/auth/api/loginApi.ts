import type { LoginRequest, LoginType, UserTokens } from '@auth/types/login';
import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

export class LoginApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async login(data: LoginRequest, loginType: LoginType): Promise<UserTokens> {
    let res = null;
    if (loginType == 'moderator') {
      res = await this.apiClient.post<UserTokens, LoginRequest>({
        url: apiUrl.login.moderator,
        data,
      });
    } else {
      res = await this.apiClient.post<UserTokens, LoginRequest>({
        url: apiUrl.login.customer,
        data,
      });
    }
    return res.data;
  }
}
