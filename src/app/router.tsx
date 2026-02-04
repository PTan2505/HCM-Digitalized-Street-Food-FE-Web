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
import VendorRegistration from '@features/vendor/pages/VendorRegistration';

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
    path: '/vendor',
    element: <VendorRegistration />,
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <RevenuePage /> },
      { path: ROUTES.ADMIN.TRANSACTIONS, element: <TransactionsPage /> },
      { path: ROUTES.ADMIN.VERIFICATION, element: <VendorVerification /> },
      { path: ROUTES.ADMIN.POSTS, element: <PostsPage /> },
      { path: ROUTES.ADMIN.USERS, element: <UsersPage /> },
      { path: ROUTES.ADMIN.CASHOUT, element: <CashoutPage /> },
    ],
  },
]);
