import { useCallback } from 'react';
import { useAppDispatch } from '@hooks/reduxHooks';
import { getActiveBranches } from '@slices/branch';
import type {
  GetActiveBranchesParams,
  GetActiveBranchesResponse,
} from '../types/branch';

export default function useBranch(): {
  onGetActiveBranches: (
    params?: GetActiveBranchesParams
  ) => Promise<GetActiveBranchesResponse>;
} {
  const dispatch = useAppDispatch();

  const onGetActiveBranches = useCallback(
    async (
      params?: GetActiveBranchesParams
    ): Promise<GetActiveBranchesResponse> => {
      const response = await dispatch(getActiveBranches(params)).unwrap();
      return response;
    },
    [dispatch]
  );

  return {
    onGetActiveBranches,
  };
}
