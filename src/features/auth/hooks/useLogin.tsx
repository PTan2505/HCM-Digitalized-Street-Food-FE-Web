import type { LoginWithPhoneNumberRequest } from '@auth/types/login';
import { ROUTES } from '@constants/routes';
import {
  initFacebookSDK,
  loginWithFacebook,
} from '@features/auth/libs/FacebookSDK';
import { useAppDispatch } from '@hooks/reduxHooks';
import { useGoogleLogin } from '@react-oauth/google';
import {
  logout,
  userLoginWithFacebook,
  userLoginWithGoogle,
  userLoginWithPhoneNumber,
  verifyPhoneNumber,
} from '@slices/auth';
import { resetVendorState } from '@slices/vendor';
import { resetPaymentState } from '@slices/payment';
import { useNavigate } from 'react-router';

export default function useLogin(): {
  onGoogleLoginSubmit: () => void;
  onFacebookLoginSubmit: () => Promise<void>;
  onPhoneNumberLoginSubmit: (
    values: LoginWithPhoneNumberRequest
  ) => Promise<void>;
  onVerifyPhoneNumberSubmit: (payload: {
    phoneNumber: string;
    otp: string;
  }) => Promise<void>;
  onLogout: () => void;
} {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onGoogleLoginSubmit = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      await dispatch(
        userLoginWithGoogle({ accessToken: tokenResponse.access_token })
      ).unwrap();
      navigate(ROUTES.ROOT);
    },
  });

  async function onFacebookLoginSubmit(): Promise<void> {
    await initFacebookSDK();
    const accessToken = await loginWithFacebook();
    await dispatch(userLoginWithFacebook({ accessToken })).unwrap();
    navigate(ROUTES.ROOT);
  }

  async function onPhoneNumberLoginSubmit(
    values: LoginWithPhoneNumberRequest
  ): Promise<void> {
    await dispatch(userLoginWithPhoneNumber(values)).unwrap();
    navigate(ROUTES.LOGIN);
  }

  async function onVerifyPhoneNumberSubmit(payload: {
    phoneNumber: string;
    otp: string;
  }): Promise<void> {
    await dispatch(verifyPhoneNumber(payload)).unwrap();
    navigate(ROUTES.ROOT);
  }

  function onLogout(): void {
    dispatch(logout());
    // dispatch(resetVendorState());
    // dispatch(resetPaymentState());
    navigate(ROUTES.LOGIN);
  }
  return {
    onGoogleLoginSubmit,
    onFacebookLoginSubmit,
    onPhoneNumberLoginSubmit,
    onVerifyPhoneNumberSubmit,
    onLogout,
  };
}
