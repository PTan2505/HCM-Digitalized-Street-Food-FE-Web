export interface Setting {
  id: number;
  name: string;
  value: string;
}

export interface UpdateSettingRequest {
  value: string;
}
