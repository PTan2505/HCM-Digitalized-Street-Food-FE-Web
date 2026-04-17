export interface CreateOrUpdateTasteRequest {
  name: string;
  description: string | null;
}

export interface CreateOrUpdateTasteResponse {
  message?: string;
  data: Taste;
}

export interface Taste {
  tasteId: number;
  name: string;
  description: string | null;
  isActive?: boolean;
}
