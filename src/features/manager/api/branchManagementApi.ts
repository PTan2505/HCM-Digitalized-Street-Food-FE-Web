import type { Branch } from '@features/vendor/types/vendor';
import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

export class BranchManagementApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getManagerMyBranch(): Promise<Branch> {
    const res = await this.apiClient.get<Branch>({
      url: apiUrl.manager.getMyBranch,
    });
    return res.data;
  }
}
