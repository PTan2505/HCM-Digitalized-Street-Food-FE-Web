import ManagerLayout from '@app/routes/ManagerLayout';
import ModeratorLayout from '@app/routes/ModeratorLayout';
import RootLayout from '@app/routes/RootLayout';
import VendorLayout from '@app/routes/VendorLayout';
import UserLayout from '@app/routes/UserLayout';
import { ROUTES } from '@constants/routes';
import AdminBadgePage from '@features/admin/pages/BadgePage';
import AdminCategoryPage from '@features/admin/pages/CategoryPage';
import AdminTastePage from '@features/admin/pages/TastePage';
import AdminFeedbackTagPage from '@features/admin/pages/FeedbackTagPage';
import AdminDietaryPage from '@features/admin/pages/DietaryPage';
import AdminRevenuePage from '@features/admin/pages/RevenuePage';
import AdminTransactionsPage from '@features/admin/pages/TransactionsPage';
import UserBadgeManagement from '@features/admin/pages/UserBadgeManagementPage';
import AdminUsersPage from '@features/admin/pages/UsersPage';
import UsersWithDietaryPreferencesPage from '@features/admin/pages/UsersWithDietaryPreferencesPage';
import AdminVendorsPage from '@features/admin/pages/VendorsPage';
import AdminBranchPage from '@features/admin/pages/BranchPage';
import AdminCampaignPage from '@features/admin/pages/CampaignPage';
import AdminVendorCampaignPage from '@features/admin/pages/AdminVendorCampaignPage';
import AdminQuestPage from '@features/admin/pages/QuestPage';
import AdminSettingPage from '@features/admin/pages/SettingPage';
import AdminVoucherPage from '@features/admin/pages/VoucherPage';
import AdminVendorVerificationPage from '@features/admin/pages/VendorVerificationPage';
import PaymentPayoutPage from '@features/admin/pages/PaymentPayoutPage';
import AdminDashboardPage from '@features/admin/pages/DashboardPage';
import LoginPage from '@features/auth/pages/LoginPage';
import ModeratorCashoutPage from '@features/moderator/pages/CashoutPage';
import ModeratorPostsPage from '@features/moderator/pages/PostsPage';
import ModeratorRevenuePage from '@features/moderator/pages/RevenuePage';
import ModeratorTransactionsPage from '@features/moderator/pages/TransactionsPage';
import ModeratorUsersPage from '@features/moderator/pages/UsersPage';
import ModeratorBranchPage from '@features/moderator/pages/BranchPage';
import GhostPinVerificationPage from '@features/moderator/pages/GhostPinVerificationPage';
import PendingVendorVerificationPage from '@features/moderator/pages/PendingVendorVerificationPage';
import OwnershipRequestVerificationPage from '@features/moderator/pages/OwnershipRequestVerificationPage';
import OrderManagementPage from '@features/manager/pages/OrderManagementPage';
import BranchManagementPage from '@features/manager/pages/BranchManagementPage';
import DishManagementPage from '@features/manager/pages/DishManagementPage';
import FeedbackManagementPage from '@features/manager/pages/FeedbackManagementPage';
import WorkScheduleManagementPage from '@features/manager/pages/WorkScheduleManagementPage';
import DayOffManagementPage from '@features/manager/pages/DayOffManagementPage';
import VendorDashboardPage from '@features/vendor/pages/DashboardPage';
import VendorBranchPage from '@features/vendor/pages/BranchPage';
import VendorRegistrationHistoryPage from '@features/vendor/pages/RegistrationHistoryPage';
import VendorPaymentHistoryPage from '@features/vendor/pages/PaymentHistoryPage';
import VendorDishPage from '@features/vendor/pages/DishPage';
import VendorOrderPage from '@features/vendor/pages/OrderPage';
import VendorDietaryPreferencesPage from '@features/vendor/pages/DietaryPreferencesPage';
import GhostPinPage from '@features/vendor/pages/GhostPinPage';
import VendorCampaignPage from '@features/vendor/pages/VendorCampaignPage';
import VendorSystemCampaignPage from '@features/vendor/pages/VendorSystemCampaignPage';
import EditUserProfilePage from '@features/user/pages/EditUserProfilePage';
import { createBrowserRouter, Navigate } from 'react-router';
import AdminLayout from './routes/AdminLayout';
import HomePage from '@features/home/pages/HomePage';
import DeepLinkRedirectPage from '@features/home/pages/DeepLinkRedirectPage';
import PaymentSuccess from '@features/vendor/pages/PaymentSuccess';
import PaymentCancel from '@features/vendor/pages/PaymentCancel';

export const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: <HomePage />,
  },
  {
    path: ROUTES.LOGIN,
    element: <LoginPage />,
  },
  {
    path: ROUTES.PAYMENT.SUCCESS,
    element: <PaymentSuccess />,
  },
  {
    path: ROUTES.PAYMENT.CANCEL,
    element: <PaymentCancel />,
  },
  {
    path: '*',
    element: <DeepLinkRedirectPage />,
  },
  {
    path: ROUTES.ROOT,
    element: <RootLayout />,
    children: [
      {
        path: ROUTES.USER_INFO_SETUP,
        element: <EditUserProfilePage />,
      },
      {
        path: ROUTES.MODERATOR.BASE,
        element: <ModeratorLayout />,
        children: [
          {
            index: true,
            element: (
              <Navigate
                to={ROUTES.MODERATOR.PATHS.VERIFICATION_VENDOR}
                replace
              />
            ),
          },
          {
            path: ROUTES.MODERATOR.PATHS.REVENUE,
            element: <ModeratorRevenuePage />,
          },
          {
            path: ROUTES.MODERATOR.PATHS.TRANSACTIONS,
            element: <ModeratorTransactionsPage />,
          },
          {
            path: ROUTES.MODERATOR.PATHS.VERIFICATION,
            element: (
              <Navigate
                to={`/${ROUTES.MODERATOR.BASE.replace('/', '')}/${ROUTES.MODERATOR.PATHS.VERIFICATION_VENDOR}`}
                replace
              />
            ),
          },
          {
            path: ROUTES.MODERATOR.PATHS.VERIFICATION_GHOST_PIN,
            element: <GhostPinVerificationPage />,
          },
          {
            path: ROUTES.MODERATOR.PATHS.VERIFICATION_VENDOR,
            element: <PendingVendorVerificationPage />,
          },
          {
            path: ROUTES.MODERATOR.PATHS.VERIFICATION_OWNERSHIP_REQUEST,
            element: <OwnershipRequestVerificationPage />,
          },
          {
            path: ROUTES.MODERATOR.PATHS.POSTS,
            element: <ModeratorPostsPage />,
          },
          {
            path: ROUTES.MODERATOR.PATHS.USERS,
            element: <ModeratorUsersPage />,
          },
          {
            path: ROUTES.MODERATOR.PATHS.CASHOUT,
            element: <ModeratorCashoutPage />,
          },
          {
            path: ROUTES.MODERATOR.PATHS.BRANCH,
            element: <ModeratorBranchPage />,
          },
        ],
      },
      {
        path: ROUTES.MANAGER.BASE,
        element: <ManagerLayout />,
        children: [
          {
            index: true,
            element: <Navigate to={ROUTES.MANAGER.PATHS.ORDER} replace />,
          },
          {
            path: ROUTES.MANAGER.PATHS.ORDER,
            element: <OrderManagementPage />,
          },
          {
            path: ROUTES.MANAGER.PATHS.BRANCH,
            element: <BranchManagementPage />,
          },
          {
            path: ROUTES.MANAGER.PATHS.DISH,
            element: <DishManagementPage />,
          },
          {
            path: ROUTES.MANAGER.PATHS.FEEDBACK,
            element: <FeedbackManagementPage />,
          },
          {
            path: ROUTES.MANAGER.PATHS.WORK_SCHEDULE,
            element: <WorkScheduleManagementPage />,
          },
          {
            path: ROUTES.MANAGER.PATHS.DAY_OFF,
            element: <DayOffManagementPage />,
          },
        ],
      },
      {
        path: ROUTES.VENDOR.BASE,
        element: <VendorLayout />,
        children: [
          {
            index: true,
            element: <Navigate to={ROUTES.VENDOR.PATHS.DASHBOARD} replace />,
          },
          {
            path: ROUTES.VENDOR.PATHS.DASHBOARD,
            element: <VendorDashboardPage />,
          },
          {
            path: ROUTES.VENDOR.PATHS.BRANCH,
            element: <VendorBranchPage />,
          },
          {
            path: ROUTES.VENDOR.PATHS.REGISTRATION_HISTORY,
            element: <VendorRegistrationHistoryPage />,
          },
          {
            path: ROUTES.VENDOR.PATHS.PAYMENT_HISTORY,
            element: <VendorPaymentHistoryPage />,
          },
          {
            path: ROUTES.VENDOR.PATHS.DISH,
            element: <VendorDishPage />,
          },
          {
            path: ROUTES.VENDOR.PATHS.ORDER,
            element: <VendorOrderPage />,
          },
          {
            path: ROUTES.VENDOR.PATHS.DIETARY,
            element: <VendorDietaryPreferencesPage />,
          },
          {
            path: ROUTES.VENDOR.PATHS.GHOST_PIN,
            element: <GhostPinPage />,
          },
          {
            path: ROUTES.VENDOR.PATHS.CAMPAIGN,
            element: <VendorCampaignPage />,
          },
          {
            path: ROUTES.VENDOR.PATHS.CAMPAIGN_SYSTEM,
            element: <VendorSystemCampaignPage />,
          },
        ],
      },
      {
        path: ROUTES.USER.BASE,
        element: <UserLayout />,
        children: [
          {
            index: true,
            element: <Navigate to={ROUTES.USER.PATHS.BRANCH} replace />,
          },
          {
            path: ROUTES.USER.PATHS.BRANCH,
            element: <VendorBranchPage />,
          },
          {
            path: ROUTES.USER.PATHS.GHOST_PIN,
            element: <GhostPinPage />,
          },
          {
            path: ROUTES.USER.PATHS.REGISTRATION_HISTORY,
            element: <VendorRegistrationHistoryPage />,
          },
          // {
          //   path: ROUTES.USER.PATHS.PAYMENT_HISTORY,
          //   element: <VendorPaymentHistoryPage />,
          // },
        ],
      },
      {
        path: ROUTES.ADMIN.BASE,
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <Navigate to={ROUTES.ADMIN.PATHS.DASHBOARD} replace />,
          },
          {
            path: ROUTES.ADMIN.PATHS.DASHBOARD,
            element: <AdminDashboardPage />,
          },
          { path: ROUTES.ADMIN.PATHS.REVENUE, element: <AdminRevenuePage /> },
          {
            path: ROUTES.ADMIN.PATHS.TRANSACTIONS,
            element: <AdminTransactionsPage />,
          },
          {
            path: ROUTES.ADMIN.PATHS.BADGE_USERS,
            element: <UserBadgeManagement />,
          },
          {
            path: ROUTES.ADMIN.PATHS.USER_DIETARY,
            element: <AdminDietaryPage />,
          },
          {
            path: ROUTES.ADMIN.PATHS.USER_WITH_DIETARY,
            element: <UsersWithDietaryPreferencesPage />,
          },
          {
            path: ROUTES.ADMIN.PATHS.USERS,
            element: (
              <Navigate
                to={`/${ROUTES.ADMIN.BASE.replace('/', '')}/${ROUTES.ADMIN.PATHS.USERS_CUSTOMER}`}
                replace
              />
            ),
          },
          {
            path: ROUTES.ADMIN.PATHS.USERS_CUSTOMER,
            element: <AdminUsersPage />,
          },
          {
            path: ROUTES.ADMIN.PATHS.USERS_VENDOR,
            element: <AdminUsersPage />,
          },
          {
            path: ROUTES.ADMIN.PATHS.USERS_SYSTEM,
            element: <AdminUsersPage />,
          },
          { path: ROUTES.ADMIN.PATHS.VENDORS, element: <AdminVendorsPage /> },
          { path: ROUTES.ADMIN.PATHS.BRANCH, element: <AdminBranchPage /> },
          { path: ROUTES.ADMIN.PATHS.BADGE, element: <AdminBadgePage /> },
          { path: ROUTES.ADMIN.PATHS.CATEGORY, element: <AdminCategoryPage /> },
          { path: ROUTES.ADMIN.PATHS.TASTE, element: <AdminTastePage /> },
          {
            path: ROUTES.ADMIN.PATHS.FEEDBACK_TAG,
            element: <AdminFeedbackTagPage />,
          },
          {
            path: ROUTES.ADMIN.PATHS.CAMPAIGN,
            element: <AdminCampaignPage />,
          },
          {
            path: ROUTES.ADMIN.PATHS.CAMPAIGN_VENDOR,
            element: <AdminVendorCampaignPage />,
          },
          {
            path: ROUTES.ADMIN.PATHS.QUEST,
            element: <AdminQuestPage />,
          },
          {
            path: ROUTES.ADMIN.PATHS.SETTING,
            element: <AdminSettingPage />,
          },
          {
            path: ROUTES.ADMIN.PATHS.VOUCHER,
            element: <AdminVoucherPage />,
          },
          {
            path: ROUTES.ADMIN.PATHS.VERIFICATION,
            element: <AdminVendorVerificationPage />,
          },
          {
            path: ROUTES.ADMIN.PATHS.PAYOUT,
            element: <PaymentPayoutPage />,
          },
        ],
      },
    ],
  },
]);
