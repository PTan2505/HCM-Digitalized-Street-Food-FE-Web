import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';
import type {
  GetBranchesAdminParams,
  GetBranchesAdminResponse,
} from '../types/branch';

export class BranchAdminApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getBranches(
    params?: GetBranchesAdminParams
  ): Promise<GetBranchesAdminResponse> {
    const res = await this.apiClient.get<GetBranchesAdminResponse>({
      url: apiUrl.branch.getBranches,
      params,
    });
    return res.data;
  }
}
