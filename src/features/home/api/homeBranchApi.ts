import type {
  GetActiveBranchesResponse,
  GetActiveBranchesParams,
} from '@features/home/types/branch';
import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

export class HomeBranchApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getActiveBranches(
    params?: GetActiveBranchesParams
  ): Promise<GetActiveBranchesResponse> {
    const res = await this.apiClient.get<GetActiveBranchesResponse>({
      url: apiUrl.vendor.getActiveBranches,
      params,
    });
    return res.data;
  }
}
