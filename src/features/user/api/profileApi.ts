import type { User } from '@custom-types/user';
import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

export interface UserLookupResponse {
  id?: number;
  userName?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
}

export interface ContactVerificationResponse {
  channels?: string[];
  otp?: string;
}

export interface VerifyOtpProfileResponse {
  channel?: string;
}

export class UserProfileApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getUserProfile(): Promise<User> {
    const res = await this.apiClient.get<User>({
      url: apiUrl.auth.profile,
    });
    return res.data;
  }

  async updateUserProfile(data: Partial<User>): Promise<User> {
    const res = await this.apiClient.put<User, Partial<User>>({
      url: apiUrl.auth.profile,
      data,
    });
    return res.data;
  }

  async markUserInfoSetup(): Promise<void> {
    await this.apiClient.put<void, null>({
      url: apiUrl.user.userSetup.userinfo,
    });
  }

  async getUserById(id: number): Promise<UserLookupResponse> {
    const res = await this.apiClient.get<UserLookupResponse>({
      url: apiUrl.user.getUserById(id),
    });
    return res.data;
  }

  async requestContactVerification(): Promise<ContactVerificationResponse> {
    const res = await this.apiClient.post<ContactVerificationResponse, null>({
      url: apiUrl.auth.contactVerification,
    });
    return res.data;
  }

  async verifyOTPProfile(otp: string): Promise<VerifyOtpProfileResponse> {
    const res = await this.apiClient.post<
      VerifyOtpProfileResponse,
      { otp: string }
    >({
      url: apiUrl.auth.verifyOTPProfile,
      data: { otp },
    });
    return res.data;
  }
}
