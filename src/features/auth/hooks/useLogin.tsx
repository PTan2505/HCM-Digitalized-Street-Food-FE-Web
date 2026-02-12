import type { LoginWithPhoneNumberRequest } from '@auth/types/login';
import { useAppDispatch } from '@hooks/reduxHooks';
import { useGoogleLogin } from '@react-oauth/google';
import {
  logout,
  userLoginWithGoogle,
  userLoginWithPhoneNumber,
  verifyPhoneNumber,
} from '@slices/auth';
import { useNavigate } from 'react-router';

export default function useLogin(): {
  onGoogleLoginSubmit: () => void;
  // onFacebookLoginSubmit: () => Promise<void>;
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

  // async function onFacebookLoginSubmit(): Promise<void> {
  //   await dispatch(userLoginWithFacebook()).unwrap();
  // }

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
    await dispatch(verifyPhoneNumber(payload)).unwrap();
    navigation('/');
  }

  function onLogout(): void {
    dispatch(logout());
    navigation('/login');
    // Implementation for logout if needed
  }
  return {
    onGoogleLoginSubmit,
    // onFacebookLoginSubmit,
    onPhoneNumberLoginSubmit,
    onVerifyPhoneNumberSubmit,
    onLogout,
  };
}
