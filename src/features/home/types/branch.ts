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
  isVerified: boolean;
  distanceKm: number;
  dishes: unknown[];
}

export interface GetActiveBranchesResponse {
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
