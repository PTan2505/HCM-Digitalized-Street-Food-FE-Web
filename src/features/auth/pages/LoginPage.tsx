import { AdminLoginForm } from '@auth/components/adminLogin/AdminLoginForm';
import { LoginBoxBlur } from '@auth/components/LoginBox';
import { CustomerLoginForm } from '@features/auth/components/customerLogin/CustomerLoginForm';
import Box from '@mui/material/Box';
import type { JSX } from 'react';
import { useParams } from 'react-router';

export type UserTypeParam = {
  userType?: string;
};

export default function LoginPage(): JSX.Element {
  const { userType } = useParams<UserTypeParam>();

  return (
    <Box className="bg-gradient-primary flex h-screen w-screen items-center justify-center">
      <LoginBoxBlur>
        {userType === 'moderator' ? <AdminLoginForm /> : <CustomerLoginForm />}
      </LoginBoxBlur>
    </Box>
  );
}
