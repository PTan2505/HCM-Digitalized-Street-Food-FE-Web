import type {
  CreateOrUpdateTasteRequest,
  CreateOrUpdateTasteResponse,
  Taste,
} from '../types/taste';
import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

export class TasteApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async createTaste(
    data: CreateOrUpdateTasteRequest
  ): Promise<CreateOrUpdateTasteResponse> {
    let res = null;
    res = await this.apiClient.post<
      CreateOrUpdateTasteResponse,
      CreateOrUpdateTasteRequest
    >({
      url: apiUrl.taste.getAllOrPostTaste,
      data,
    });
    return res.data;
  }

  async updateTaste(
    tasteId: number,
    data: CreateOrUpdateTasteRequest
  ): Promise<CreateOrUpdateTasteResponse> {
    let res = null;
    res = await this.apiClient.put<
      CreateOrUpdateTasteResponse,
      CreateOrUpdateTasteRequest
    >({
      url: apiUrl.taste.updateOrDeleteTaste(tasteId),
      data,
    });
    return res.data;
  }

  async deleteTaste(tasteId: number): Promise<{ message: string }> {
    let res = null;
    res = await this.apiClient.patch<{ message: string }>({
      url: apiUrl.taste.updateOrDeleteTaste(tasteId),
    });
    return res.data;
  }

  async getAllTastes(): Promise<Taste[]> {
    let res = null;
    res = await this.apiClient.get<Taste[]>({
      url: apiUrl.taste.getAllOrPostTaste,
    });
    return res.data;
  }
}
