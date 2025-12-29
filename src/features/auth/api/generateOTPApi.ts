import type { LoginRequest, OTPResponse } from '@auth/types/login';
import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

export class OTPApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async generateOTP(data: LoginRequest): Promise<OTPResponse> {
    const res = await this.apiClient.post<OTPResponse, LoginRequest>({
      url: apiUrl.otp.generate,
      data,
    });
    return res.data;
  }
}
