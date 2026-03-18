import type {
  CreateOrUpdateDishRequest,
  AssignOrUnassignDishToBranchRequest,
  UpdateDishAvailabilityByBranchRequest,
  CreateOrUpdateDishResponse,
  GetDishesOfAVendorResponse,
  GetDishesByBranchResponse,
  AssignOrUnassignDishToBranchResponse,
  UpdateDishAvailabilityByBranchResponse,
} from '@features/vendor/types/dish';
import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

export class DishApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async createDish(
    data: CreateOrUpdateDishRequest,
    vendorId: number
  ): Promise<CreateOrUpdateDishResponse> {
    const res = await this.apiClient.post<
      CreateOrUpdateDishResponse,
      CreateOrUpdateDishRequest
    >({
      url: apiUrl.dish.CreateOrGetDishesOfAVendor(vendorId),
      data,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  }

  async updateDish(
    data: CreateOrUpdateDishRequest,
    dishId: number
  ): Promise<CreateOrUpdateDishResponse> {
    const res = await this.apiClient.put<
      CreateOrUpdateDishResponse,
      CreateOrUpdateDishRequest
    >({
      url: apiUrl.dish.UpdateOrDeleteDish(dishId),
      data,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  }

  async deleteDish(dishId: number): Promise<void> {
    await this.apiClient.delete({
      url: apiUrl.dish.UpdateOrDeleteDish(dishId),
    });
  }

  async getDishesOfAVendor(
    vendorId: number,
    params: {
      pageNumber: number;
      pageSize: number;
      categoryId?: number;
      keyword?: string;
    }
  ): Promise<GetDishesOfAVendorResponse> {
    const res = await this.apiClient.get<GetDishesOfAVendorResponse>({
      url: apiUrl.dish.CreateOrGetDishesOfAVendor(vendorId),
      params,
    });
    return res.data;
  }

  async getDishesByBranch(
    branchId: number,
    params: {
      pageNumber: number;
      pageSize: number;
      categoryId?: number;
      keyword?: string;
    }
  ): Promise<GetDishesByBranchResponse> {
    const res = await this.apiClient.get<GetDishesByBranchResponse>({
      url: apiUrl.dish.GetDishesByBranch(branchId),
      params,
    });
    return res.data;
  }

  async assignDishToBranch(
    data: AssignOrUnassignDishToBranchRequest,
    branchId: number
  ): Promise<AssignOrUnassignDishToBranchResponse> {
    const res = await this.apiClient.post<
      AssignOrUnassignDishToBranchResponse,
      AssignOrUnassignDishToBranchRequest
    >({
      url: apiUrl.dish.AssignOrUnassignDishToBranch(branchId),
      data,
    });
    return res.data;
  }

  async unassignDishToBranch(
    data: AssignOrUnassignDishToBranchRequest,
    branchId: number
  ): Promise<AssignOrUnassignDishToBranchResponse> {
    const res = await this.apiClient.delete<
      AssignOrUnassignDishToBranchResponse,
      AssignOrUnassignDishToBranchRequest
    >({
      url: apiUrl.dish.AssignOrUnassignDishToBranch(branchId),
      data,
    });
    return res.data;
  }

  async updateDishAvailabilityByBranch(
    data: UpdateDishAvailabilityByBranchRequest,
    dishId: number,
    branchId: number
  ): Promise<UpdateDishAvailabilityByBranchResponse> {
    const res = await this.apiClient.patch<
      UpdateDishAvailabilityByBranchResponse,
      UpdateDishAvailabilityByBranchRequest
    >({
      url: apiUrl.dish.UpdateDishAvailabilityByBranch(dishId, branchId),
      data,
    });
    return res.data;
  }
}
