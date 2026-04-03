import type { User } from '@custom-types/user';
import { useAppDispatch } from '@hooks/reduxHooks';
import { markUserInfoSetup, updateProfile } from '@slices/auth';
import { useCallback } from 'react';

export default function useProfile(): {
  updateUserProfile: (
    data: Partial<User>,
    skipMarkSetup?: boolean
  ) => Promise<void>;
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

  return {
    updateUserProfile,
  };
}
