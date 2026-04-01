import { LoginBoxBlur } from '@auth/components/LoginBox';
import { LoginIntroCarousel } from '@auth/components/LoginIntroCarousel';
import { PhoneNumberLoginForm } from '@features/auth/components/customerLogin/PhoneNumberLoginForm';
import { LoginOptions } from '@features/auth/components/LoginOptions';
import Box from '@mui/material/Box';
import { useState, type JSX } from 'react';

export default function LoginPage(): JSX.Element {
  const [loginOption, setLoginOption] = useState<'phoneNumber' | ''>('');

  return (
    <Box className="bg-gradient-moderator min-h-screen w-full overflow-x-hidden">
      <Box className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col-reverse lg:flex-row">
        <Box className="hidden w-full flex-1 items-stretch p-4 md:flex md:min-h-[40vh] md:p-6 lg:min-h-0 lg:basis-3/5 lg:p-10">
          <LoginIntroCarousel />
        </Box>

        <Box className="flex w-full items-start justify-center p-4 py-6 sm:items-center md:p-6 lg:basis-2/5 lg:p-10">
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
