import type {
  LoginResponse,
  LoginWithGoogleRequest,
  LoginWithPhoneNumberRequest,
} from '@features/auth/types/login';
import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

export class LoginApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async loginWithGoogle(data: LoginWithGoogleRequest): Promise<LoginResponse> {
    let res = null;
    res = await this.apiClient.post<LoginResponse, LoginWithGoogleRequest>({
      url: apiUrl.auth.googleLogin,
      data,
    });
    return res.data;
  }

  async loginWithPhoneNumber(
    data: LoginWithPhoneNumberRequest
  ): Promise<{ message: string }> {
    let res = null;
    res = await this.apiClient.post<
      { message: string },
      LoginWithPhoneNumberRequest
    >({
      url: apiUrl.auth.phoneLogin,
      data,
    });
    return res.data;
  }

  async verifyPhoneNumber(
    data: LoginWithPhoneNumberRequest
  ): Promise<LoginResponse> {
    let res = null;
    res = await this.apiClient.post<LoginResponse, LoginWithPhoneNumberRequest>(
      {
        url: apiUrl.auth.phoneVerify,
        data,
      }
    );
    return res.data;
  }
}
