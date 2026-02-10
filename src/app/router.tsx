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
    path: '/',
    element: <RootLayout />,
    children: [{ index: true, element: <UserProfilePage /> }],
  },
  {
    path: '/moderator',
    element: <ModeratorLayout />,
    children: [
      { index: true, element: <ModeratorRevenuePage /> },
      { path: 'revenue', element: <ModeratorRevenuePage /> },
      { path: 'transactions', element: <ModeratorTransactionsPage /> },
      { path: 'verification', element: <ModeratorVendorVerification /> },
      { path: 'posts', element: <ModeratorPostsPage /> },
      { path: 'users', element: <ModeratorUsersPage /> },
      { path: 'cashout', element: <ModeratorCashoutPage /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminRevenuePage /> },
      { path: 'revenue', element: <AdminRevenuePage /> },
      { path: 'transactions', element: <AdminTransactionsPage /> },
      { path: 'badge-users', element: <UserBadgeManagement /> },
      { path: 'user-dietary', element: <AdminDietaryPage /> },
      { path: 'users', element: <AdminUsersPage /> },
      { path: 'badge', element: <AdminBadgePage /> },
    ],
  },
]);
