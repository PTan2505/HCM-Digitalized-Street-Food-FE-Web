import type { LoginRequest, LoginType } from '@auth/types/login';
import { ROUTES } from '@constants/routes';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  generateOTP,
  selectIsGeneratedOTP,
  selectIsNewUser,
  userLogin,
} from '@slices/auth';

import { useNavigate } from 'react-router';

export default function useLogin(): {
  onLoginSubmit: (values: LoginRequest, loginType: LoginType) => Promise<void>;
} {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isGeneratedOTP = useAppSelector(selectIsGeneratedOTP);
  const isNewUser = useAppSelector(selectIsNewUser);

  const handleLogin = async (
    values: LoginRequest,
    loginType: LoginType
  ): Promise<void> => {
    await dispatch(userLogin({ data: values, loginType })).unwrap();
    if (isNewUser && loginType === 'customer') {
      navigate(`${ROUTES.NEW_PATIENT_PROFILE}`);
    } else navigate(`/`);
  };

  async function onLoginSubmit(
    values: LoginRequest,
    loginType: LoginType
  ): Promise<void> {
    if (loginType === 'customer' && !isGeneratedOTP) {
      await dispatch(generateOTP(values)).unwrap();
      return;
    }

    await handleLogin(values, loginType);
  }

  return {
    onLoginSubmit,
  };
}
