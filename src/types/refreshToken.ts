import type { BackendResponse } from '@custom-types/apiResponse';
import type { User } from '@custom-types/user';

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenData {
  token: string;
  user: User;
}

export type RefreshTokenResponse = BackendResponse<RefreshTokenData>;
