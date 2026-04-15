import type {
  Quest,
  QuestCreate,
  QuestListResponse,
  QuestUpdate,
} from '@features/admin/types/quest';
import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

export class QuestApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getQuests(params: {
    pageNumber: number;
    pageSize: number;
    isActive?: boolean;
    campaignId?: number;
  }): Promise<QuestListResponse> {
    const res = await this.apiClient.get<QuestListResponse>({
      url: apiUrl.quest.getOrPostQuest,
      params,
    });
    return res.data;
  }

  async getQuestById(id: number): Promise<Quest> {
    const res = await this.apiClient.get<Quest>({
      url: apiUrl.quest.updateOrDeleteQuest(id),
    });
    return res.data;
  }

  async createQuest(data: QuestCreate): Promise<Quest> {
    const res = await this.apiClient.post<Quest, QuestCreate>({
      url: apiUrl.quest.getOrPostQuest,
      data,
    });
    return res.data;
  }

  async updateQuest(id: number, data: QuestUpdate): Promise<Quest> {
    const res = await this.apiClient.put<Quest, QuestUpdate>({
      url: apiUrl.quest.updateOrDeleteQuest(id),
      data,
    });
    return res.data;
  }

  async deleteQuest(id: number): Promise<void> {
    await this.apiClient.delete<void>({
      url: apiUrl.quest.updateOrDeleteQuest(id),
    });
  }

  async postQuestImage(id: number, data: FormData): Promise<Quest> {
    const res = await this.apiClient.post<Quest, FormData>({
      url: apiUrl.quest.postQuestImage(id),
      data,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  }
}
