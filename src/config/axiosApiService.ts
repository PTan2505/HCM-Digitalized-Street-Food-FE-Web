import { apiUrl } from '@lib/api/apiUrl';
import { tokenManagement } from '@utils/tokenManagement';
import { ENV } from './env';
import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios';
import type { ErrorResponse } from '@custom-types/apiResponse';
import type {
  RefreshTokenRequest,
  RefreshTokenResponse,
} from '@custom-types/refreshToken';
import { toast } from 'react-toastify';
import CustomNotification from '@components/CustomNotification';

interface RefreshTokenQueueItem {
  config: AxiosRequestConfig & { _retry?: boolean };
  resolve: (value: AxiosResponse) => void;
  reject: (error: AxiosError) => void;
}

let isRefreshing = false;
const refreshAndRetryQueue: RefreshTokenQueueItem[] = [];

const skipAuthorizationPaths = [
  apiUrl.auth.phoneLogin,
  apiUrl.auth.refreshToken,
];

export interface ApiService {
  // TODO: Standardize the error response
  call<TResponse = unknown, TRequest = unknown>(
    requestConfig: AxiosRequestConfig<TRequest>
  ): Promise<AxiosResponse<TResponse>>;
  isApiError(error: unknown): boolean;
}

const axiosInstance = axios.create({
  baseURL: ENV.api.baseUrl,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const isSkipAuthorization = skipAuthorizationPaths.some((path) =>
      config.url?.includes(path)
    );

    const accessToken = tokenManagement.getAccessToken();

    if (config.headers && accessToken && !isSkipAuthorization)
      (config.headers as AxiosHeaders).set(
        'Authorization',
        `Bearer ${accessToken}`
      );

    return config;
  },
  (error) => {
    if (error instanceof Error) {
      return Promise.reject(error);
    }

    return Promise.reject(new Error(String(error)));
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    const message = response.data?.message;

    if (message && message !== 'Success' && response.config.method !== 'get') {
      toast.success(CustomNotification, {
        data: {
          title: 'Thành công!',
          content: message,
        },
        style: { backgroundColor: 'var(--color-moderator-hover-bg)' },
      });
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    const isAuthEndpoint =
      originalRequest.url &&
      (originalRequest.url.includes(apiUrl.auth.phoneLogin) ||
        originalRequest.url.includes(apiUrl.auth.phoneVerify) ||
        originalRequest.url.includes(apiUrl.auth.refreshToken));
    const responseData = error.response?.data as ErrorResponse | undefined;

    const fieldErrors =
      typeof responseData?.data === 'object'
        ? (responseData.data as Record<string, string[]>)
        : undefined;

    if (error.response?.status === 401 && !isAuthEndpoint) {
      const currentRefreshToken = tokenManagement.getRefreshToken();

      if (!currentRefreshToken) {
        tokenManagement.clearTokens();
        return Promise.reject(error);
      }

      if (!isRefreshing && !originalRequest._retry) {
        isRefreshing = true;

        try {
          const refreshPayload: RefreshTokenRequest = {
            refreshToken: currentRefreshToken,
          };

          const response = await axios.post<RefreshTokenResponse>(
            `${ENV.api.baseUrl}${apiUrl.auth.refreshToken}`,
            refreshPayload
          );

          const newAccessToken = response.data.data.token;

          if (!newAccessToken) {
            throw new Error('Refresh token succeeded without access token');
          }

          tokenManagement.setTokens({
            newAccessToken,
          });

          originalRequest._retry = true;

          if (originalRequest.headers) {
            (originalRequest.headers as AxiosHeaders).set(
              'Authorization',
              `Bearer ${newAccessToken}`
            );
          } else {
            originalRequest.headers = {
              Authorization: `Bearer ${newAccessToken}`,
            };
          }

          refreshAndRetryQueue.forEach(({ config, resolve, reject }) => {
            axiosInstance
              .request(config)
              .then((response) => resolve(response))
              .catch((err: AxiosError) => reject(err));
          });

          refreshAndRetryQueue.length = 0;

          return axiosInstance(originalRequest);
        } catch (refreshError) {
          const refreshErrorAsAxios =
            refreshError instanceof AxiosError
              ? refreshError
              : new AxiosError('Refresh token request failed');

          refreshAndRetryQueue.forEach(({ reject }) =>
            reject(refreshErrorAsAxios)
          );
          refreshAndRetryQueue.length = 0;
          tokenManagement.clearTokens();
          return Promise.reject(refreshErrorAsAxios);
        } finally {
          isRefreshing = false;
        }
      }

      return new Promise((resolve, reject) => {
        refreshAndRetryQueue.push({
          config: originalRequest,
          resolve,
          reject,
        });
      });
    }

    if (!fieldErrors) {
      const message =
        responseData?.message ?? error.message ?? 'Something went wrong';

      if (message && originalRequest?.method !== 'get') {
        toast.error(CustomNotification, {
          data: {
            title: 'Có lỗi xảy ra!',
            content: message,
          },
          style: { backgroundColor: 'var(--color-error-hover-bg)' },
        });
      }
    }

    return Promise.reject(error);
  }
);

export class AxiosApiService implements ApiService {
  private axios = axiosInstance;

  async call<TResponse, TRequest>(
    axiosRequestConfig: AxiosRequestConfig<TRequest>
  ): Promise<AxiosResponse<TResponse>> {
    const res = await this.axios.request(axiosRequestConfig);
    return res;
  }

  isApiError(error: unknown): boolean {
    if (error instanceof AxiosError) {
      return true;
    }

    return false;
  }
}
