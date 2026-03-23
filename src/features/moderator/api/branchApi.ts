import type {
  GetPendingRegistrationsParams,
  GetPendingRegistrationsResponse,
  RejectRegistrationRequest,
  RejectRegistrationResponse,
  VerifyRegistrationRequest,
  VerifyRegistrationResponse,
} from '@features/moderator/types/branch';
import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

export class BranchApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getPendingRegistrations(
    params: GetPendingRegistrationsParams
  ): Promise<GetPendingRegistrationsResponse> {
    const res = await this.apiClient.get<GetPendingRegistrationsResponse>({
      url: apiUrl.vendor.getPendingRegistrations,
      params,
    });
    return res.data;
  }

  async verifyBranchRegistration(
    branchId: number,
    data: VerifyRegistrationRequest
  ): Promise<VerifyRegistrationResponse> {
    const res = await this.apiClient.put<
      VerifyRegistrationResponse,
      VerifyRegistrationRequest
    >({
      url: apiUrl.vendor.verifyBranch(branchId),
      data,
    });
    return res.data;
  }

  async rejectBranchRegistration(
    branchId: number,
    data: RejectRegistrationRequest
  ): Promise<RejectRegistrationResponse> {
    const res = await this.apiClient.put<
      RejectRegistrationResponse,
      RejectRegistrationRequest
    >({
      url: apiUrl.vendor.rejectBranch(branchId),
      data,
    });
    return res.data;
  }
}
