import { LoginBoxBlur } from '@auth/components/LoginBox';
import { PhoneNumberLoginForm } from '@features/auth/components/customerLogin/PhoneNumberLoginForm';
import { LoginOptions } from '@features/auth/components/LoginOptions';
import Box from '@mui/material/Box';
import { useState, type JSX } from 'react';

export default function LoginPage(): JSX.Element {
  const [loginOption, setLoginOption] = useState<'phoneNumber' | ''>('');

  return (
    <Box className="bg-gradient-moderator flex h-screen w-screen items-center justify-center">
      <LoginBoxBlur>
        {loginOption === 'phoneNumber' ? (
          <PhoneNumberLoginForm />
        ) : (
          <LoginOptions setLoginOption={setLoginOption} />
        )}
      </LoginBoxBlur>
    </Box>
  );
}
