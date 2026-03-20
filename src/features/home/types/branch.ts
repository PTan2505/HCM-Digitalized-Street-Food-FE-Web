export interface BranchDish {
  categoryName?: string;
}

export interface ActiveBranch {
  branchId: number;
  vendorId: number;
  vendorName: string;
  name: string;
  phoneNumber: string;
  email: string;
  addressDetail: string;
  ward: string;
  city: string;
  lat: number;
  long: number;
  avgRating: number;
  totalReviewCount: number;
  totalRatingSum: number;
  isVerified: boolean;
  finalScore: number;
  dishes: BranchDish[];
  dietaryPreferenceNames: string[];
}

export interface GetActiveBranchesResponse {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: ActiveBranch[];
}

export interface GetActiveBranchesParams {
  Lat?: number;
  Long?: number;
  Distance?: number;
  DietaryIds?: string;
  TasteIds?: string;
  MinPrice?: number;
  MaxPrice?: number;
  pageNumber?: number;
  pageSize?: number;
  SearchTerm?: string;
}
