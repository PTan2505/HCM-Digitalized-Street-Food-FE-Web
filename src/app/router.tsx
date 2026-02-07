import RootLayout from '@app/routes/RootLayout';
import { ROUTES } from '@constants/routes';
import LoginPage from '@features/auth/pages/LoginPage';
import { UserProfilePage } from '@features/user/UserProfilePage';
import { createBrowserRouter } from 'react-router';

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
]);
