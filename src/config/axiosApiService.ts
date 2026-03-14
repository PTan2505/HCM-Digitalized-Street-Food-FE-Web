import { apiUrl } from '@lib/api/apiUrl';
import { tokenManagement } from '@utils/tokenManagement';
import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios';
import type { ErrorResponse } from '@custom-types/apiResponse';
import { toast } from 'react-toastify';
import CustomNotification from '@components/CustomNotification';

// interface RefreshTokenResponse {
//   config: AxiosRequestConfig & { _retry?: boolean };
//   resolve: (value: AxiosResponse) => void;
//   reject: (error: AxiosError) => void;
// }

// let isRefreshing = false;
// const refreshAndRetryQueue: RefreshTokenResponse[] = [];

const skipAuthorizationPaths = [apiUrl.auth.phoneLogin];

export interface ApiService {
  // TODO: Standardize the error response
  call<TResponse = unknown, TRequest = unknown>(
    requestConfig: AxiosRequestConfig<TRequest>
  ): Promise<AxiosResponse<TResponse>>;
  isApiError(error: unknown): boolean;
}

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
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

    if (message && response.config.method !== 'get') {
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
        originalRequest.url.includes(apiUrl.auth.phoneVerify));
    const responseData = error.response?.data as ErrorResponse | undefined;

    const fieldErrors =
      typeof responseData?.data === 'object'
        ? (responseData.data as Record<string, string[]>)
        : undefined;

    // if (error.response?.status === 401 && !isAuthenEndpoint) {
    //   if (!isRefreshing && !originalRequest._retry) {
    //     isRefreshing = true;

    //     try {
    //       // Refresh the access token
    //       const response = await axios.post(
    //         `${import.meta.env.VITE_API_URL}${apiUrl.token.refresh}`,
    //         {
    //           refresh: tokenManagement.getRefreshToken(),
    //         }
    //       );
    //       const newAccessToken = response.data.access;

    //       if (newAccessToken) {
    //         tokenManagement.setTokens({ newAccessToken });

    //         originalRequest._retry = true;

    //         if (originalRequest.headers) {
    //           (originalRequest.headers as AxiosHeaders).set(
    //             'Authorization',
    //             `Bearer ${newAccessToken}`
    //           );
    //         } else {
    //           originalRequest.headers = {
    //             Authorization: `Bearer ${newAccessToken}`,
    //           };
    //         }

    //         // Retry all requests in the queue with the new token
    //         refreshAndRetryQueue.forEach(({ config, resolve, reject }) => {
    //           axiosInstance
    //             .request(config)
    //             .then((response) => resolve(response))
    //             .catch((err) => reject(err));
    //         });

    //         // Clear the queue
    //         refreshAndRetryQueue.length = 0;

    //         // Retry the original request
    //         return axiosInstance(originalRequest);
    //       }
    //     } catch {
    //       const isAdminUrl = location.pathname.includes('admin');
    //       tokenManagement.clearTokens();
    //       window.location.href = isAdminUrl ? '/admin/login' : '/login';
    //     } finally {
    //       isRefreshing = false;
    //     }
    //   }

    //   // Add the original request to the queue
    //   return new Promise((resolve, reject) => {
    //     refreshAndRetryQueue.push({ config: originalRequest, resolve, reject });
    //   });
    // }

    if (error.response?.status === 401 && !isAuthEndpoint) {
      tokenManagement.clearTokens();
    }
    if (!fieldErrors) {
      const message =
        responseData?.message ?? error.message ?? 'Something went wrong';

      if (message) {
        toast.error(CustomNotification, {
          data: {
            title: 'Có lỗi xảy ra!',
            content: message,
          },
          theme: 'colored',
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
