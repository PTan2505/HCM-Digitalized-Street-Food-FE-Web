import ModeratorLayout from '@app/routes/ModeratorLayout';
import RootLayout from '@app/routes/RootLayout';
import { ROUTES } from '@constants/routes';
import AdminBadgePage from '@features/admin/pages/BadgePage';
import AdminDietaryPage from '@features/admin/pages/DietaryPage';
import AdminRevenuePage from '@features/admin/pages/RevenuePage';
import AdminTransactionsPage from '@features/admin/pages/TransactionsPage';
import UserBadgeManagement from '@features/admin/pages/UserBadgeManagementPage';
import AdminUsersPage from '@features/admin/pages/UsersPage';
import UsersWithDietaryPreferencesPage from '@features/admin/pages/UsersWithDietaryPreferencesPage';
import LoginPage from '@features/auth/pages/LoginPage';
import ModeratorCashoutPage from '@features/moderator/pages/CashoutPage';
import ModeratorPostsPage from '@features/moderator/pages/PostsPage';
import ModeratorRevenuePage from '@features/moderator/pages/RevenuePage';
import ModeratorTransactionsPage from '@features/moderator/pages/TransactionsPage';
import ModeratorUsersPage from '@features/moderator/pages/UsersPage';
import ModeratorVendorVerification from '@features/moderator/pages/VendorVerification';
import VendorRegistration from '@features/vendor/pages/VendorRegistration';
import { createBrowserRouter, Navigate } from 'react-router';
import AdminLayout from './routes/AdminLayout';

export const router = createBrowserRouter([
  {
    path: ROUTES.LOGIN,
    element: <LoginPage />,
  },
  {
    path: ROUTES.ROOT,
    element: <RootLayout />,
    children: [
      {
        path: ROUTES.VENDOR_REGISTRATION,
        element: <VendorRegistration />,
      },
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
            element: <ModeratorVendorVerification />,
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
          { path: ROUTES.ADMIN.PATHS.BADGE, element: <AdminBadgePage /> },
        ],
      },
    ],
  },
]);
