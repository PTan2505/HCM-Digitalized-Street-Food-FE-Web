import type { User } from '@custom-types/user';
import { useAppDispatch } from '@hooks/reduxHooks';
import {
  markUserInfoSetup,
  requestContactVerification,
  updateProfile,
  verifyProfileOTP,
} from '@slices/auth';
import { useCallback } from 'react';

export default function useProfile(): {
  updateUserProfile: (
    data: Partial<User>,
    skipMarkSetup?: boolean
  ) => Promise<void>;
  requestProfileContactVerification: () => Promise<void>;
  verifyProfileContactOTP: (payload: {
    otp: string;
    field: 'email' | 'phoneNumber';
  }) => Promise<void>;
} {
  const dispatch = useAppDispatch();

  const updateUserProfile = useCallback(
    async (data: Partial<User>, skipMarkSetup = false): Promise<void> => {
      const updatedUser = await dispatch(updateProfile(data)).unwrap();
      if (!updatedUser?.userInfoSetup && !skipMarkSetup) {
        await dispatch(markUserInfoSetup());
      }
    },
    [dispatch]
  );

  const requestProfileContactVerification =
    useCallback(async (): Promise<void> => {
      await dispatch(requestContactVerification()).unwrap();
    }, [dispatch]);

  const verifyProfileContactOTP = useCallback(
    async (payload: {
      otp: string;
      field: 'email' | 'phoneNumber';
    }): Promise<void> => {
      await dispatch(verifyProfileOTP(payload)).unwrap();
    },
    [dispatch]
  );

  return {
    updateUserProfile,
    requestProfileContactVerification,
    verifyProfileContactOTP,
  };
}
