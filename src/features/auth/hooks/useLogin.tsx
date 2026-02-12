import type { LoginWithPhoneNumberRequest } from '@auth/types/login';
import { useAppDispatch } from '@hooks/reduxHooks';
import {
  logout,
  userLoginWithPhoneNumber,
  verifyPhoneNumber,
} from '@slices/auth';
import { useNavigate } from 'react-router';
import { ROLES } from '@constants/role';

export default function useLogin(): {
  // onGoogleLoginSubmit: () => Promise<void>;
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

  // async function onGoogleLoginSubmit(): Promise<void> {
  //   await dispatch(userLoginWithGoogle()).unwrap();
  // }

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
    // onGoogleLoginSubmit,
    // onFacebookLoginSubmit,
    onPhoneNumberLoginSubmit,
    onVerifyPhoneNumberSubmit,
    onLogout,
  };
}
