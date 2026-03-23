export interface Branch {
  id: string;

  // Địa chỉ
  province: string;
  district: string;
  ward: string;
  detailAddress: string;
  mapLocation: string;
  latitude: number | null;
  longitude: number | null;

  // Thông tin hoạt động
  openTime: string;
  closeTime: string;
  workingDays: string[];
  closedDates: string;
  serviceTypes: string[];

  // Upload files
  storeAvatar: File | null;
  storeFrontImage: File | null;
  businessLicense: File | null;
  idCard: File | null;
}

export const createEmptyBranch = (): Branch => ({
  id: `branch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  province: 'TP. Hồ Chí Minh',
  district: '',
  ward: '',
  detailAddress: '',
  mapLocation: '',
  latitude: null,
  longitude: null,
  openTime: '08:00',
  closeTime: '22:00',
  workingDays: [],
  closedDates: '',
  serviceTypes: [],
  storeAvatar: null,
  storeFrontImage: null,
  businessLicense: null,
  idCard: null,
});
