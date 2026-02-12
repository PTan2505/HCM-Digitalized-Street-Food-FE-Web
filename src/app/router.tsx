import RootLayout from '@app/routes/RootLayout';
import ModeratorLayout from '@app/routes/ModeratorLayout';
import { ROUTES } from '@constants/routes';
import LoginPage from '@features/auth/pages/LoginPage';
import { UserProfilePage } from '@features/user/UserProfilePage';
import ModeratorRevenuePage from '@features/moderator/pages/RevenuePage';
import ModeratorTransactionsPage from '@features/moderator/pages/TransactionsPage';
import ModeratorPostsPage from '@features/moderator/pages/PostsPage';
import ModeratorUsersPage from '@features/moderator/pages/UsersPage';
import ModeratorCashoutPage from '@features/moderator/pages/CashoutPage';
import ModeratorVendorVerification from '@features/moderator/pages/VendorVerification';
import AdminRevenuePage from '@features/admin/pages/RevenuePage';
import AdminTransactionsPage from '@features/admin/pages/TransactionsPage';
import AdminDietaryPage from '@features/admin/pages/DietaryPage';
import AdminUsersPage from '@features/admin/pages/UsersPage';
import AdminBadgePage from '@features/admin/pages/BadgePage';
import UserBadgeManagement from '@features/admin/pages/UserBadgeManagement';
import { createBrowserRouter } from 'react-router';
import AdminLayout from './routes/AdminLayout';

export const router = createBrowserRouter([
  {
    path: ROUTES.LOGIN,
    element: <LoginPage />,
  },
  {
    path: ROUTES.HOME,
    element: <RootLayout />,
    children: [{ index: true, element: <UserProfilePage /> }],
  },
  {
    path: ROUTES.MODERATOR.BASE,
    element: <ModeratorLayout />,
    children: [
      { index: true, element: <ModeratorRevenuePage /> },
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
      { path: ROUTES.MODERATOR.PATHS.POSTS, element: <ModeratorPostsPage /> },
      { path: ROUTES.MODERATOR.PATHS.USERS, element: <ModeratorUsersPage /> },
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
      { index: true, element: <AdminRevenuePage /> },
      { path: ROUTES.ADMIN.PATHS.REVENUE, element: <AdminRevenuePage /> },
      {
        path: ROUTES.ADMIN.PATHS.TRANSACTIONS,
        element: <AdminTransactionsPage />,
      },
      {
        path: ROUTES.ADMIN.PATHS.BADGE_USERS,
        element: <UserBadgeManagement />,
      },
      { path: ROUTES.ADMIN.PATHS.USER_DIETARY, element: <AdminDietaryPage /> },
      { path: ROUTES.ADMIN.PATHS.USERS, element: <AdminUsersPage /> },
      { path: ROUTES.ADMIN.PATHS.BADGE, element: <AdminBadgePage /> },
    ],
  },
]);
