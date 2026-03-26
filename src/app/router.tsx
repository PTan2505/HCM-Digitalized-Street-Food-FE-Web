import ManagerLayout from '@app/routes/ManagerLayout';
import ModeratorLayout from '@app/routes/ModeratorLayout';
import RootLayout from '@app/routes/RootLayout';
import VendorLayout from '@app/routes/VendorLayout';
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
import AdminCampaignPage from '@features/admin/pages/CampaignPage';
import LoginPage from '@features/auth/pages/LoginPage';
import ModeratorCashoutPage from '@features/moderator/pages/CashoutPage';
import ModeratorPostsPage from '@features/moderator/pages/PostsPage';
import ModeratorRevenuePage from '@features/moderator/pages/RevenuePage';
import ModeratorTransactionsPage from '@features/moderator/pages/TransactionsPage';
import ModeratorUsersPage from '@features/moderator/pages/UsersPage';
import ModeratorVendorVerificationPage from '@features/moderator/pages/VendorVerificationPage';
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
import EditUserProfilePage from '@features/user/pages/EditUserProfilePage';
import { createBrowserRouter, Navigate } from 'react-router';
import AdminLayout from './routes/AdminLayout';
import HomePage from '@features/home/pages/HomePage';
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
    path: ROUTES.USER_INFO_SETUP,
    element: <EditUserProfilePage />,
  },
  {
    path: ROUTES.PAYMENT_SUCCESS,
    element: <PaymentSuccess />,
  },
  {
    path: ROUTES.PAYMENT_CANCEL,
    element: <PaymentCancel />,
  },
  {
    path: ROUTES.ROOT,
    element: <RootLayout />,
    children: [
      {
        path: ROUTES.MODERATOR.BASE,
        element: <ModeratorLayout />,
        children: [
          {
            index: true,
            element: <Navigate to={ROUTES.MODERATOR.PATHS.REVENUE} replace />,
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
            element: <ModeratorVendorVerificationPage />,
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
        ],
      },
      {
        path: ROUTES.ADMIN.BASE,
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <Navigate to={ROUTES.ADMIN.PATHS.REVENUE} replace />,
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
          { path: ROUTES.ADMIN.PATHS.USERS, element: <AdminUsersPage /> },
          { path: ROUTES.ADMIN.PATHS.VENDORS, element: <AdminVendorsPage /> },
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
        ],
      },
    ],
  },
]);
