import type {
  Badge,
  CreateOrUpdateBadgeRequest,
  CreateOrUpdateBadgeResponse,
  UserWithBadges,
  AwardOrRevokeBadgeRequest,
  AwardOrRevokeBadgeResponse,
} from '@features/admin/types/badge';
import { useAppDispatch } from '@hooks/reduxHooks';
import {
  createBadge,
  getAllBadges,
  updateBadge,
  deleteBadge,
  getUsersWithBadges,
  awardBadgeToUser,
  revokeBadgeFromUser,
} from '@slices/badge';
import { useCallback } from 'react';

export default function useBadge(): {
  onGetAllBadges: () => Promise<Badge[]>;
  onCreateBadge: (
    payload: CreateOrUpdateBadgeRequest
  ) => Promise<CreateOrUpdateBadgeResponse>;
  onUpdateBadge: (
    payload: { id: number } & CreateOrUpdateBadgeRequest
  ) => Promise<CreateOrUpdateBadgeResponse>;
  onDeleteBadge: (id: number) => Promise<void>;
  onGetUsersWithBadges: () => Promise<UserWithBadges[]>;
  onAwardBadgeToUser: (
    payload: AwardOrRevokeBadgeRequest
  ) => Promise<AwardOrRevokeBadgeResponse>;
  onRevokeBadgeFromUser: (payload: AwardOrRevokeBadgeRequest) => Promise<void>;
} {
  const dispatch = useAppDispatch();

  const onGetAllBadges = useCallback(async (): Promise<Badge[]> => {
    const response = await dispatch(getAllBadges()).unwrap();
    return response;
  }, [dispatch]);

  const onCreateBadge = useCallback(
    async (
      payload: CreateOrUpdateBadgeRequest
    ): Promise<CreateOrUpdateBadgeResponse> => {
      const response = await dispatch(createBadge(payload)).unwrap();
      return response;
    },
    [dispatch]
  );

  const onUpdateBadge = useCallback(
    async (
      payload: { id: number } & CreateOrUpdateBadgeRequest
    ): Promise<CreateOrUpdateBadgeResponse> => {
      const response = await dispatch(updateBadge(payload)).unwrap();
      return response;
    },
    [dispatch]
  );

  const onDeleteBadge = useCallback(
    async (id: number): Promise<void> => {
      await dispatch(deleteBadge(id)).unwrap();
    },
    [dispatch]
  );

  const onGetUsersWithBadges = useCallback(async (): Promise<
    UserWithBadges[]
  > => {
    const response = await dispatch(getUsersWithBadges()).unwrap();
    return response;
  }, [dispatch]);

  const onAwardBadgeToUser = useCallback(
    async (
      payload: AwardOrRevokeBadgeRequest
    ): Promise<AwardOrRevokeBadgeResponse> => {
      const response = await dispatch(awardBadgeToUser(payload)).unwrap();
      return response;
    },
    [dispatch]
  );

  const onRevokeBadgeFromUser = useCallback(
    async (payload: AwardOrRevokeBadgeRequest): Promise<void> => {
      await dispatch(revokeBadgeFromUser(payload)).unwrap();
    },
    [dispatch]
  );

  return {
    onGetAllBadges,
    onCreateBadge,
    onUpdateBadge,
    onDeleteBadge,
    onGetUsersWithBadges,
    onAwardBadgeToUser,
    onRevokeBadgeFromUser,
  };
}
