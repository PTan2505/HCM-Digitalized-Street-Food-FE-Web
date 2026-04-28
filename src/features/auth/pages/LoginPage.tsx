import { LoginBoxBlur } from '@auth/components/LoginBox';
import { LoginIntroCarousel } from '@auth/components/LoginIntroCarousel';
import { PhoneNumberLoginForm } from '@features/auth/components/customerLogin/PhoneNumberLoginForm';
import { LoginOptions } from '@features/auth/components/LoginOptions';
import { ROUTES } from '@constants/routes';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, IconButton } from '@mui/material';
import { useState, type JSX } from 'react';
import { Link } from 'react-router-dom';

export default function LoginPage(): JSX.Element {
  const [loginOption, setLoginOption] = useState<'phoneNumber' | ''>('');

  return (
    <Box className="bg-gradient-moderator min-h-screen w-full overflow-x-hidden">
      <IconButton
        component={Link}
        to={ROUTES.HOME}
        aria-label="Ve trang chu"
        className="absolute top-4 left-4 z-20 bg-white/80 text-[#103b1c] shadow-sm backdrop-blur transition hover:bg-white"
      >
        <ArrowBackIcon />
      </IconButton>
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
