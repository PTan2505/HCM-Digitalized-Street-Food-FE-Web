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
    const formData = new FormData();
    formData.append('name', data.name);
    if (data.description) {
      formData.append('description', data.description);
    }
    if (data.imageFile) {
      formData.append('imageFile', data.imageFile);
    }

    const res = await this.apiClient.post<
      CreateOrUpdateCategoryResponse,
      FormData
    >({
      url: apiUrl.category.getAllOrPostCategory,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  }

  async updateCategory(
    categoryId: number,
    data: CreateOrUpdateCategoryRequest
  ): Promise<CreateOrUpdateCategoryResponse> {
    const formData = new FormData();
    formData.append('name', data.name);
    if (data.description) {
      formData.append('description', data.description);
    }
    if (data.imageFile) {
      formData.append('imageFile', data.imageFile);
    }

    const res = await this.apiClient.put<
      CreateOrUpdateCategoryResponse,
      FormData
    >({
      url: apiUrl.category.updateOrDeleteCategory(categoryId),
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
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
