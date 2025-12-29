import type { ApiService } from '@config/axiosApiService';
import type {
  APIErrorResponse,
  ApiResponse,
  ErrorResponse,
} from '@custom-types/apiResponse';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

export interface RawAPIError {
  response?: AxiosResponse<ErrorResponse>;
}
interface IFormatAxiosResponse {
  formatResponse: <TResponse>(
    promiseResponse: AxiosResponse<TResponse>
  ) => ApiResponse<TResponse>;
  formatError: (error: RawAPIError) => APIErrorResponse;
}

class FormatAxiosResponse implements IFormatAxiosResponse {
  formatResponse<TResponse>(
    response: AxiosResponse<TResponse>
  ): ApiResponse<TResponse> {
    return {
      data: response.data,
      status: response.status,
    };
  }
  formatError(error: RawAPIError): APIErrorResponse {
    return {
      code: error.response?.data.errorCode,
      status: error.response?.status ?? 500,
      message: error.response?.data.message,
      fieldErrors: error.response?.data.fieldErrors ?? [],
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
      const res = await this.service.call<TResponse>({
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
