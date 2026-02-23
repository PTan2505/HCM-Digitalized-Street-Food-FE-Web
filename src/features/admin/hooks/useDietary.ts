import type {
  UserDietaryPreference,
  CreateOrUpdateUserDietaryPreferenceRequest,
  CreateOrUpdateUserDietaryPreferenceResponse,
  GetUsersWithDietaryPreferencesResponse,
} from '@features/admin/types/userDietaryPreference';
import { useAppDispatch } from '@hooks/reduxHooks';
import {
  createUserDietaryPreference,
  getAllUserDietaryPreferences,
  updateUserDietaryPreference,
  deleteUserDietaryPreference,
  getUsersWithDietaryPreferences,
} from '@slices/userPreferenceDietary';
import { useCallback } from 'react';

export default function useDietary(): {
  onGetAllUserDietaryPreferences: () => Promise<UserDietaryPreference[]>;
  onGetUsersWithDietaryPreferences: (params: {
    pageNumber: number;
    pageSize: number;
  }) => Promise<GetUsersWithDietaryPreferencesResponse>;
  onCreateUserDietaryPreference: (
    payload: CreateOrUpdateUserDietaryPreferenceRequest
  ) => Promise<CreateOrUpdateUserDietaryPreferenceResponse>;
  onUpdateUserDietaryPreference: (
    payload: { id: number } & CreateOrUpdateUserDietaryPreferenceRequest
  ) => Promise<CreateOrUpdateUserDietaryPreferenceResponse>;
  onDeleteUserDietaryPreference: (id: number) => Promise<void>;
} {
  const dispatch = useAppDispatch();

  const onGetAllUserDietaryPreferences = useCallback(async (): Promise<
    UserDietaryPreference[]
  > => {
    const response = await dispatch(getAllUserDietaryPreferences()).unwrap();
    return response;
  }, [dispatch]);

  const onCreateUserDietaryPreference = useCallback(
    async (
      payload: CreateOrUpdateUserDietaryPreferenceRequest
    ): Promise<CreateOrUpdateUserDietaryPreferenceResponse> => {
      const response = await dispatch(
        createUserDietaryPreference(payload)
      ).unwrap();
      return response;
    },
    [dispatch]
  );

  const onUpdateUserDietaryPreference = useCallback(
    async (
      payload: { id: number } & CreateOrUpdateUserDietaryPreferenceRequest
    ): Promise<CreateOrUpdateUserDietaryPreferenceResponse> => {
      const response = await dispatch(
        updateUserDietaryPreference(payload)
      ).unwrap();
      return response;
    },
    [dispatch]
  );

  const onDeleteUserDietaryPreference = useCallback(
    async (id: number): Promise<void> => {
      await dispatch(deleteUserDietaryPreference(id)).unwrap();
    },
    [dispatch]
  );

  const onGetUsersWithDietaryPreferences = useCallback(
    async (params: {
      pageNumber: number;
      pageSize: number;
    }): Promise<GetUsersWithDietaryPreferencesResponse> => {
      const response = await dispatch(
        getUsersWithDietaryPreferences(params)
      ).unwrap();
      return response;
    },
    [dispatch]
  );

  return {
    onGetAllUserDietaryPreferences,
    onCreateUserDietaryPreference,
    onUpdateUserDietaryPreference,
    onDeleteUserDietaryPreference,
    onGetUsersWithDietaryPreferences,
  };
}
