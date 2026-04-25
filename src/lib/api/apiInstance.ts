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
import { HomeCampaignApi } from '@features/home/api/homeCampaignApi';
import { DishApi } from '@features/vendor/api/dishApi';
import { FeedbackApi } from '@features/vendor/api/feedbackApi';
import { OrderManagementApi } from '@features/manager/api/orderManagementApi';
import { BranchManagementApi } from '@features/manager/api/branchManagementApi';
import { OrderApi } from '@features/vendor/api/orderApi';
import { NotificationApi } from '@features/notification/api/notificationApi';
import { FeedbackTagApi } from '@features/admin/api/feedbackTagApi';
import { CampaignApi } from '@features/admin/api/campaignApi';
import { QuestApi } from '@features/admin/api/questApi';
import { SettingApi } from '@features/admin/api/settingApi';
import { VendorCampaignApi } from '@features/vendor/api/campaignApi';
import { VoucherApi } from '@features/admin/api/voucherApi';
import { UserAdminApi } from '@features/admin/api/userAdminApi';
import { DashboardApi } from '@features/vendor/api/dashboardApi';
import { AdminDashboardApi } from '@features/admin/api/dashboardApi';
import { BranchAdminApi } from '@features/admin/api/branchApi';
import { TierApi } from '@features/admin/api/tierApi';
import { AdminPaymentApi } from '@features/admin/api/paymentApi';
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
  homeCampaignApi: new HomeCampaignApi(axiosClient),
  dishApi: new DishApi(axiosClient),
  feedbackApi: new FeedbackApi(axiosClient),
  orderApi: new OrderApi(axiosClient),
  orderManagementApi: new OrderManagementApi(axiosClient),
  branchManagementApi: new BranchManagementApi(axiosClient),
  notificationApi: new NotificationApi(axiosClient),
  feedbackTagApi: new FeedbackTagApi(axiosClient),
  campaignApi: new CampaignApi(axiosClient),
  questApi: new QuestApi(axiosClient),
  settingApi: new SettingApi(axiosClient),
  vendorCampaignApi: new VendorCampaignApi(axiosClient),
  voucherApi: new VoucherApi(axiosClient),
  userAdminApi: new UserAdminApi(axiosClient),
  dashboardApi: new DashboardApi(axiosClient),
  adminDashboardApi: new AdminDashboardApi(axiosClient),
  branchAdminApi: new BranchAdminApi(axiosClient),
  tierApi: new TierApi(axiosClient),
  adminPaymentApi: new AdminPaymentApi(axiosClient),
};
