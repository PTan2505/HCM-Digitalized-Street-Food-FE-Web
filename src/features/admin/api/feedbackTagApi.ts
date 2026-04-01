import type {
  CreateOrUpdateFeedbackTagRequest,
  CreateOrUpdateFeedbackTagResponse,
  FeedbackTag,
} from '../types/feedbackTag';
import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

export class FeedbackTagApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getAllFeedbackTags(): Promise<FeedbackTag[]> {
    const res = await this.apiClient.get<FeedbackTag[]>({
      url: apiUrl.feedbackTag.getAllOrPostFeedbackTag,
    });
    return res.data;
  }

  async createFeedbackTag(
    data: CreateOrUpdateFeedbackTagRequest
  ): Promise<CreateOrUpdateFeedbackTagResponse> {
    const res = await this.apiClient.post<
      CreateOrUpdateFeedbackTagResponse,
      CreateOrUpdateFeedbackTagRequest
    >({
      url: apiUrl.feedbackTag.getAllOrPostFeedbackTag,
      data,
    });
    return res.data;
  }

  async updateFeedbackTag(
    id: number,
    data: CreateOrUpdateFeedbackTagRequest
  ): Promise<CreateOrUpdateFeedbackTagResponse> {
    const res = await this.apiClient.put<
      CreateOrUpdateFeedbackTagResponse,
      CreateOrUpdateFeedbackTagRequest
    >({
      url: apiUrl.feedbackTag.updateOrDeleteFeedbackTag(id),
      data,
    });
    return res.data;
  }

  async deleteFeedbackTag(id: number): Promise<{ message: string }> {
    const res = await this.apiClient.delete<{ message: string }>({
      url: apiUrl.feedbackTag.updateOrDeleteFeedbackTag(id),
    });
    return res.data;
  }
}
