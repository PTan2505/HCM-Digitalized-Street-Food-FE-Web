import type {
  GetFeedbacksByBranchParams,
  GetFeedbacksByBranchResponse,
  ReplyFeedbackRequest,
  ReplyFeedbackResponse,
  GetFeedbackDetailsResponse,
} from '@features/vendor/types/feedback';
import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

export class FeedbackApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getFeedbacksByBranch(
    branchId: number,
    params: GetFeedbacksByBranchParams
  ): Promise<GetFeedbacksByBranchResponse> {
    const res = await this.apiClient.get<GetFeedbacksByBranchResponse>({
      url: apiUrl.feedback.GetFeedbacksByBranch(branchId),
      params,
    });
    return res.data;
  }

  async createReply(
    feedbackId: number,
    data: ReplyFeedbackRequest
  ): Promise<ReplyFeedbackResponse> {
    const res = await this.apiClient.post<
      ReplyFeedbackResponse,
      ReplyFeedbackRequest
    >({
      url: apiUrl.feedback.CreateOrUpdateOrDeleteReply(feedbackId),
      data,
    });
    return res.data;
  }

  async updateReply(
    feedbackId: number,
    data: ReplyFeedbackRequest
  ): Promise<ReplyFeedbackResponse> {
    const res = await this.apiClient.put<
      ReplyFeedbackResponse,
      ReplyFeedbackRequest
    >({
      url: apiUrl.feedback.CreateOrUpdateOrDeleteReply(feedbackId),
      data,
    });
    return res.data;
  }

  async deleteReply(feedbackId: number): Promise<ReplyFeedbackResponse> {
    const res = await this.apiClient.delete<ReplyFeedbackResponse>({
      url: apiUrl.feedback.CreateOrUpdateOrDeleteReply(feedbackId),
    });
    return res.data;
  }

  async getFeedbackDetails(
    feedbackId: number
  ): Promise<GetFeedbackDetailsResponse> {
    const res = await this.apiClient.get<GetFeedbackDetailsResponse>({
      url: apiUrl.feedback.GetFeedbackDetails(feedbackId),
    });
    return res.data;
  }
}
