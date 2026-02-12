import type { LoginWithPhoneNumberRequest } from '@auth/types/login';
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
import { useNavigate } from 'react-router';
import { ROLES } from '@constants/role';

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
  const navigation = useNavigate();

  const onGoogleLoginSubmit = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      await dispatch(
        userLoginWithGoogle({ accessToken: tokenResponse.access_token })
      ).unwrap();
      navigation('/');
    },
  });

  async function onFacebookLoginSubmit(): Promise<void> {
    await initFacebookSDK();
    const accessToken = await loginWithFacebook();
    await dispatch(userLoginWithFacebook({ accessToken })).unwrap();
    navigation('/');
  }

  async function onPhoneNumberLoginSubmit(
    values: LoginWithPhoneNumberRequest
  ): Promise<void> {
    await dispatch(userLoginWithPhoneNumber(values)).unwrap();
    navigation('/login');
  }

  async function onVerifyPhoneNumberSubmit(payload: {
    phoneNumber: string;
    otp: string;
  }): Promise<void> {
    const { user } = await dispatch(verifyPhoneNumber(payload)).unwrap();
    if (user.role === ROLES.ADMIN) {
      navigation('/admin');
    } else {
      navigation('/');
    }
  }

  function onLogout(): void {
    dispatch(logout());
    navigation('/login');
    // Implementation for logout if needed
  }
  return {
    onGoogleLoginSubmit,
    onFacebookLoginSubmit,
    onPhoneNumberLoginSubmit,
    onVerifyPhoneNumberSubmit,
    onLogout,
  };
}
