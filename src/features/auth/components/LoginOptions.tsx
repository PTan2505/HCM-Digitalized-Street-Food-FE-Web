import FacebookIcon from '@assets/logos/facebookLogo.svg';
import GoogleIcon from '@assets/logos/googleLogo.svg';
import useLogin from '@features/auth/hooks/useLogin';
import PhoneIcon from '@mui/icons-material/Phone';
import logoImage from '@assets/lowca-logo.png';
import { Box, Button, Icon } from '@mui/material';
import { type JSX } from 'react';

type Props = {
  setLoginOption: (option: 'phoneNumber' | '') => void;
};

export const LoginOptions = ({ setLoginOption }: Props): JSX.Element => {
  const { onGoogleLoginSubmit, onFacebookLoginSubmit } = useLogin();

  return (
    <Box className="flex w-full flex-col gap-4">
      <Box className="mb-6 flex flex-col items-center text-center">
        <Box className="mb-4 inline-flex items-center justify-center rounded-2xl bg-green-50 p-3">
          <img
            src={logoImage}
            alt="Lowca"
            className="h-10 w-10 object-contain"
          />
        </Box>
        <h2 className="title-lg text-[#103b1c]">Cổng Đối Tác Lowca</h2>
        <p className="body-medium mt-2 text-[#3d6647]">
          Đăng nhập để bắt đầu quản lý cửa hàng và kinh doanh hiệu quả hơn.
        </p>
      </Box>
      <Button
        variant="contained"
        fullWidth
        className="relative flex flex-row items-center justify-center gap-2 rounded-full border border-gray-300 bg-white p-4 font-semibold text-black normal-case shadow-none hover:opacity-50"
        onClick={() => onGoogleLoginSubmit()}
      >
        <Icon className="absolute left-4">
          <img src={GoogleIcon} alt="Google Logo" className="h-6 w-6" />
        </Icon>
        Đăng nhập với Google
      </Button>
      <Button
        variant="contained"
        fullWidth
        className="relative flex flex-row items-center justify-center gap-2 rounded-full bg-[#1877F2] p-4 font-semibold text-white normal-case shadow-none hover:opacity-50"
        onClick={() => onFacebookLoginSubmit()}
      >
        <Icon className="absolute left-4">
          <img src={FacebookIcon} alt="Facebook Logo" className="h-6 w-6" />
        </Icon>
        Đăng nhập với Facebook
      </Button>
      <Button
        variant="contained"
        fullWidth
        className="relative flex flex-row items-center justify-center gap-2 rounded-full bg-black p-4 font-semibold text-white normal-case shadow-none hover:opacity-50"
        onClick={() => setLoginOption('phoneNumber')}
      >
        <PhoneIcon className="absolute left-4 h-6 w-6" />
        Đăng nhập với Số điện thoại
      </Button>
    </Box>
  );
};
