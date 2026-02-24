export interface Category {
  categoryId: number;
  name: string;
  description: string | null;
}

export interface CreateOrUpdateCategoryRequest {
  name: string;
  description: string | null;
}

export interface CreateOrUpdateCategoryResponse {
  message?: string;
  data: Category;
}
