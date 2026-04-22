import type { Tier } from '@features/admin/types/tier';
import { useAppDispatch } from '@hooks/reduxHooks';
import { getAllTiers } from '@slices/tier';
import { useCallback } from 'react';

export default function useTier(): {
  onGetAllTiers: () => Promise<Tier[]>;
} {
  const dispatch = useAppDispatch();

  const onGetAllTiers = useCallback(async (): Promise<Tier[]> => {
    const response = await dispatch(getAllTiers()).unwrap();
    return response;
  }, [dispatch]);

  return {
    onGetAllTiers,
  };
}
