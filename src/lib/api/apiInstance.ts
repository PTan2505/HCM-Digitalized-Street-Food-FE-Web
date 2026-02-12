import { AxiosApiService } from '@config/axiosApiService';
import { LoginApi } from '@features/auth/api/loginApi';
import { UserProfileApi } from '@features/user/api/profileApi';
import { BadgeApi } from '@features/admin/api/badgeApi';
import ApiClient from '@lib/api/apiClient';

const axiosService = new AxiosApiService();
const axiosClient = new ApiClient(axiosService);

export const axiosApi = {
  loginApi: new LoginApi(axiosClient),
  userProfileApi: new UserProfileApi(axiosClient),
  badgeApi: new BadgeApi(axiosClient),
};
