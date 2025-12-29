interface NewTokenData {
  newAccessToken?: string;
  newRefreshToken?: string;
}

interface ITokenManagement {
  setTokens: (data: NewTokenData) => void;
  getAccessToken: () => string;
  getRefreshToken: () => string;
  clearTokens: () => void;
}

export class TokenManagement implements ITokenManagement {
  setTokens({ newAccessToken, newRefreshToken }: NewTokenData): void {
    if (newAccessToken) {
      localStorage.setItem('accessToken', newAccessToken);
    }
    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken);
    }
  }

  getAccessToken(): string {
    return localStorage.getItem('accessToken') ?? '';
  }

  getRefreshToken(): string {
    return localStorage.getItem('refreshToken') ?? '';
  }

  clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}

export const tokenManagement = new TokenManagement();
