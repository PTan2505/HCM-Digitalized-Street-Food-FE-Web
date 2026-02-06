import RootLayout from '@app/routes/RootLayout';
import AdminLayout from '@app/routes/AdminLayout';
import { ROUTES } from '@constants/routes';
import LoginPage from '@features/auth/pages/LoginPage';
import { UserProfilePage } from '@features/user/UserProfilePage';
import RevenuePage from '@features/admin/pages/RevenuePage';
import TransactionsPage from '@features/admin/pages/TransactionsPage';
import PostsPage from '@features/admin/pages/PostsPage';
import UsersPage from '@features/admin/pages/UsersPage';
import CashoutPage from '@features/admin/pages/CashoutPage';
import { createBrowserRouter } from 'react-router';
import VendorVerification from '@features/admin/pages/VendorVerification';

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
    element: <AdminLayout />,
    children: [
      { path: ROUTES.MODERATOR.REVENUE, element: <RevenuePage /> },
      { path: ROUTES.MODERATOR.TRANSACTIONS, element: <TransactionsPage /> },
      { path: ROUTES.MODERATOR.VERIFICATION, element: <VendorVerification /> },
      { path: ROUTES.MODERATOR.POSTS, element: <PostsPage /> },
      { path: ROUTES.MODERATOR.USERS, element: <UsersPage /> },
      { path: ROUTES.MODERATOR.CASHOUT, element: <CashoutPage /> },
    ],
  },
]);
