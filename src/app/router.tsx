import RootLayout from '@app/routes/RootLayout';
import { createBrowserRouter } from 'react-router';

export const ROUTES = {
  BASE: '/:userType?',
  LOGIN: '/:userType?/login',
  NEW_PATIENT_PROFILE: '/new-patient-profile',
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
  },
]);
