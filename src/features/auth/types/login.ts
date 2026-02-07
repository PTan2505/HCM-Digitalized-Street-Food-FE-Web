export interface UserTokens {
  refreshToken: string;
  accessToken: string;
  accessExpires: number;
  refreshExpires: number;
}

export interface LoginRequest {
  phoneNumber: string;
  password?: string | undefined;
  otp?: string | undefined;
}

export type LoginType = 'admin' | 'customer';

export interface OTPResponse {
  phoneNumber: string;
  isNewUser: boolean;
}
