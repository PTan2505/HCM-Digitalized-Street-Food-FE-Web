import type {
  Setting,
  UpdateSettingRequest,
} from '@features/admin/types/setting';
import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

export class SettingApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getSettings(): Promise<Setting[]> {
    const res = await this.apiClient.get<Setting[]>({
      url: apiUrl.setting.getSettings,
    });
    return res.data;
  }

  async updateSetting(
    name: string,
    data: UpdateSettingRequest
  ): Promise<Setting> {
    const res = await this.apiClient.patch<Setting, UpdateSettingRequest>({
      url: apiUrl.setting.updateSetting(name),
      data,
    });
    return res.data;
  }

  async reloadSettings(): Promise<void> {
    await this.apiClient.post<unknown, null>({
      url: apiUrl.setting.reloadSettings,
      data: null,
    });
  }
}
