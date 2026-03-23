import { LoginBoxBlur } from '@auth/components/LoginBox';
import { LoginIntroCarousel } from '@auth/components/LoginIntroCarousel';
import { PhoneNumberLoginForm } from '@features/auth/components/customerLogin/PhoneNumberLoginForm';
import { LoginOptions } from '@features/auth/components/LoginOptions';
import Box from '@mui/material/Box';
import { useState, type JSX } from 'react';

export default function LoginPage(): JSX.Element {
  const [loginOption, setLoginOption] = useState<'phoneNumber' | ''>('');

  return (
    <Box className="bg-gradient-moderator flex h-screen w-screen overflow-hidden">
      <Box className="flex h-full w-full flex-col-reverse lg:flex-row">
        <Box className="flex w-full flex-1 items-stretch p-4 md:p-6 lg:basis-3/5 lg:p-10">
          <LoginIntroCarousel />
        </Box>

        <Box className="flex w-full items-center justify-center p-4 md:p-6 lg:basis-2/5 lg:p-10">
          <LoginBoxBlur>
            {loginOption === 'phoneNumber' ? (
              <PhoneNumberLoginForm onBack={() => setLoginOption('')} />
            ) : (
              <LoginOptions setLoginOption={setLoginOption} />
            )}
          </LoginBoxBlur>
        </Box>
      </Box>
    </Box>
  );
}
