export interface CreateOrUpdateDishRequest {
  CategoryId: number;
  Description: string;
  DietaryPreferenceIds?: number[];
  imageFile?: File;
  IsActive: boolean;
  Name: string;
  Price: number;
  TasteIds: number[];
}

export interface AssignOrUnassignDishToBranchRequest {
  dishIds: number[];
}

export interface UpdateDishAvailabilityByBranchRequest {
  isSoldOut: boolean;
}

export interface CreateOrUpdateDishResponse {
  dishId: number;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  isSoldOut: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  vendorId: number;
  categoryId: number;
  categoryName: string;
  tasteNames: string[];
  dietaryPreferenceNames?: string[];
}

export interface GetDishesOfAVendorResponse {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: CreateOrUpdateDishResponse[];
}

export interface GetDishesByBranchResponse {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: CreateOrUpdateDishResponse[];
}

export type DeleteDishResponse = string;

export type AssignOrUnassignDishToBranchResponse = string;

export type UpdateDishAvailabilityByBranchResponse = string;
