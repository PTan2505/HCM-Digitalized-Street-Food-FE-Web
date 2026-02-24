import type {
  Category,
  CreateOrUpdateCategoryRequest,
  CreateOrUpdateCategoryResponse,
} from '@features/admin/types/category';
import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

export class CategoryApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async createCategory(
    data: CreateOrUpdateCategoryRequest
  ): Promise<CreateOrUpdateCategoryResponse> {
    const res = await this.apiClient.post<
      CreateOrUpdateCategoryResponse,
      CreateOrUpdateCategoryRequest
    >({
      url: apiUrl.category.getAllOrPostCategory,
      data,
    });
    return res.data;
  }

  async updateCategory(
    categoryId: number,
    data: CreateOrUpdateCategoryRequest
  ): Promise<CreateOrUpdateCategoryResponse> {
    const res = await this.apiClient.put<
      CreateOrUpdateCategoryResponse,
      CreateOrUpdateCategoryRequest
    >({
      url: apiUrl.category.updateOrDeleteCategory(categoryId),
      data,
    });
    return res.data;
  }

  async deleteCategory(categoryId: number): Promise<{ message: string }> {
    const res = await this.apiClient.delete<{ message: string }>({
      url: apiUrl.category.updateOrDeleteCategory(categoryId),
    });
    return res.data;
  }

  async getAllCategories(): Promise<Category[]> {
    const res = await this.apiClient.get<Category[]>({
      url: apiUrl.category.getAllOrPostCategory,
    });
    return res.data;
  }
}
