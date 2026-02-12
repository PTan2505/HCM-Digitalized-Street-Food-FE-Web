import type {
  Badge,
  CreateOrUpdateBadgeRequest,
  CreateOrUpdateBadgeResponse,
} from '@features/admin/types/badge';
import { useAppDispatch } from '@hooks/reduxHooks';
import {
  createBadge,
  getAllBadges,
  updateBadge,
  deleteBadge,
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

  return {
    onGetAllBadges,
    onCreateBadge,
    onUpdateBadge,
    onDeleteBadge,
  };
}
