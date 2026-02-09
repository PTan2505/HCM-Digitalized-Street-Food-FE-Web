import RootLayout from '@app/routes/RootLayout';
import ModeratorLayout from '@app/routes/ModeratorLayout';
import { ROUTES } from '@constants/routes';
import LoginPage from '@features/auth/pages/LoginPage';
import { UserProfilePage } from '@features/user/UserProfilePage';
import RevenuePage from '@features/moderator/pages/RevenuePage';
import TransactionsPage from '@features/moderator/pages/TransactionsPage';
import PostsPage from '@features/moderator/pages/PostsPage';
import UsersPage from '@features/moderator/pages/UsersPage';
import CashoutPage from '@features/moderator/pages/CashoutPage';
import { createBrowserRouter } from 'react-router';
import VendorVerification from '@features/moderator/pages/VendorVerification';

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
      { index: true, element: <RevenuePage /> },
      { path: 'revenue', element: <RevenuePage /> },
      { path: 'transactions', element: <TransactionsPage /> },
      { path: 'verification', element: <VendorVerification /> },
      { path: 'posts', element: <PostsPage /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'cashout', element: <CashoutPage /> },
    ],
  },
]);
