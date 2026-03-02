import { AxiosApiService } from '@config/axiosApiService';
import { LoginApi } from '@features/auth/api/loginApi';
import { UserProfileApi } from '@features/user/api/profileApi';
import { BadgeApi } from '@features/admin/api/badgeApi';
import { userDietaryPreferenceApi } from '@features/admin/api/userDietaryPreferenceApi';
import { CategoryApi } from '@features/admin/api/categoryApi';
import { VendorApi } from '@features/vendor/api/vendorApi';
import { BranchApi } from '@features/moderator/api/branchApi';
import ApiClient from '@lib/api/apiClient';

const axiosService = new AxiosApiService();
const axiosClient = new ApiClient(axiosService);

export const axiosApi = {
  loginApi: new LoginApi(axiosClient),
  userProfileApi: new UserProfileApi(axiosClient),
  badgeApi: new BadgeApi(axiosClient),
  userDietaryPreferenceApi: new userDietaryPreferenceApi(axiosClient),
  categoryApi: new CategoryApi(axiosClient),
  vendorApi: new VendorApi(axiosClient),
  branchApi: new BranchApi(axiosClient),
};
