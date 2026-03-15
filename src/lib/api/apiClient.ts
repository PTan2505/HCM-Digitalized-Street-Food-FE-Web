import type { ApiService } from '@config/axiosApiService';
import type {
  APIErrorResponse,
  ApiResponse,
  BackendResponse,
  ErrorResponse,
} from '@custom-types/apiResponse';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

export interface RawAPIError {
  response?: AxiosResponse<ErrorResponse>;
}
interface IFormatAxiosResponse {
  formatResponse: <TResponse>(
    promiseResponse: AxiosResponse<BackendResponse<TResponse>>
  ) => ApiResponse<TResponse>;
  formatError: (error: RawAPIError) => APIErrorResponse;
}

class FormatAxiosResponse implements IFormatAxiosResponse {
  formatResponse<TResponse>(
    response: AxiosResponse<BackendResponse<TResponse>>
  ): ApiResponse<TResponse> {
    const backendResponse = response.data;

    return {
      data: backendResponse.data,
      status: backendResponse.status,
      message: backendResponse.message,
    };
  }
  formatError(error: RawAPIError): APIErrorResponse {
    const errorData = error.response?.data;

    // Handle different error response formats
    let fieldErrors: Record<string, string[]> | undefined = undefined;
    let errorMessage = errorData?.message ?? 'An error occurred';

    // If data is an object, it might be field errors
    if (errorData?.data && typeof errorData.data === 'object') {
      fieldErrors = errorData.data as Record<string, string[]>;
    }
    // If data is a string, it's the error message
    else if (errorData?.data && typeof errorData.data === 'string') {
      errorMessage = errorData.data;
    }

    return {
      code: errorData?.errorCode,
      status: errorData?.status ?? error.response?.status ?? 500,
      message: errorMessage,
      fieldErrors,
    };
  }
}

export default class ApiClient {
  private service: ApiService;
  private formatResponse: FormatAxiosResponse;

  constructor(service: ApiService) {
    this.service = service;
    this.formatResponse = new FormatAxiosResponse();
  }

  private async handleRequest<TResponse, TRequest>(
    requestConfig: AxiosRequestConfig<TRequest>
  ): Promise<ApiResponse<TResponse>> {
    try {
      const res = await this.service.call<BackendResponse<TResponse>>({
        ...requestConfig,
      });
      return this.formatResponse.formatResponse(res);
    } catch (error) {
      if (this.service.isApiError(error)) {
        const formattedError = this.formatResponse.formatError(
          error as RawAPIError
        );
        throw formattedError;
      }
      throw error;
    }
  }

  get<TResponse>(
    requestConfig: AxiosRequestConfig<null>
  ): Promise<ApiResponse<TResponse>> {
    return this.handleRequest<TResponse, null>({
      ...requestConfig,
      method: 'GET',
    });
  }

  post<TResponse, TRequest>(
    requestConfig: AxiosRequestConfig<TRequest>
  ): Promise<ApiResponse<TResponse>> {
    return this.handleRequest<TResponse, TRequest>({
      ...requestConfig,
      method: 'POST',
    });
  }

  put<TResponse, TRequest>(
    requestConfig: AxiosRequestConfig<TRequest>
  ): Promise<ApiResponse<TResponse>> {
    return this.handleRequest<TResponse, TRequest>({
      ...requestConfig,
      method: 'PUT',
    });
  }

  patch<TResponse, TRequest>(
    requestConfig: AxiosRequestConfig<TRequest>
  ): Promise<ApiResponse<TResponse>> {
    return this.handleRequest<TResponse, TRequest>({
      ...requestConfig,
      method: 'PATCH',
    });
  }

  delete<TResponse>(
    requestConfig: AxiosRequestConfig<null>
  ): Promise<ApiResponse<TResponse>> {
    return this.handleRequest<TResponse, null>({
      ...requestConfig,
      method: 'DELETE',
    });
  }
}
