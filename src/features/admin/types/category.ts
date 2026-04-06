export interface Category {
  categoryId: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
}

export interface CreateOrUpdateCategoryRequest {
  name: string;
  description: string | null;
  imageFile?: File | null;
}

export interface CreateOrUpdateCategoryResponse {
  message?: string;
  data: Category;
}
