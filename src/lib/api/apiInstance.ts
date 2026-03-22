import { AxiosApiService } from '@config/axiosApiService';
import { LoginApi } from '@features/auth/api/loginApi';
import { UserProfileApi } from '@features/user/api/profileApi';
import { BadgeApi } from '@features/admin/api/badgeApi';
import { userDietaryPreferenceApi } from '@features/admin/api/userDietaryPreferenceApi';
import { CategoryApi } from '@features/admin/api/categoryApi';
import { VendorAdminApi } from '@features/admin/api/vendorApi';
import { VendorApi } from '@features/vendor/api/vendorApi';
import { BranchApi } from '@features/moderator/api/branchApi';
import { TasteApi } from '@features/admin/api/tasteApi';
import { PaymentApi } from '@features/vendor/api/paymentApi';
import { HomeBranchApi } from '@features/home/api/homeBranchApi';
import { DishApi } from '@features/vendor/api/dishApi';
import { FeedbackApi } from '@features/vendor/api/feedbackApi';
import { OrderManagementApi } from '@features/manager/api/orderManagementApi';
import { OrderApi } from '@features/vendor/api/orderApi';
import { NotificationApi } from '@features/notification/api/notificationApi';
import ApiClient from '@lib/api/apiClient';

const axiosService = new AxiosApiService();
const axiosClient = new ApiClient(axiosService);

export const axiosApi = {
  loginApi: new LoginApi(axiosClient),
  userProfileApi: new UserProfileApi(axiosClient),
  badgeApi: new BadgeApi(axiosClient),
  userDietaryPreferenceApi: new userDietaryPreferenceApi(axiosClient),
  categoryApi: new CategoryApi(axiosClient),
  vendorAdminApi: new VendorAdminApi(axiosClient),
  vendorApi: new VendorApi(axiosClient),
  branchApi: new BranchApi(axiosClient),
  tasteApi: new TasteApi(axiosClient),
  paymentApi: new PaymentApi(axiosClient),
  homeBranchApi: new HomeBranchApi(axiosClient),
  dishApi: new DishApi(axiosClient),
  feedbackApi: new FeedbackApi(axiosClient),
  orderApi: new OrderApi(axiosClient),
  orderManagementApi: new OrderManagementApi(axiosClient),
  notificationApi: new NotificationApi(axiosClient),
};
