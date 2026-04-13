import { useCallback } from 'react';
import { useAppDispatch } from '@hooks/reduxHooks';
import { getAdminBranches } from '@slices/branch';
import type {
  GetBranchesAdminParams,
  GetBranchesAdminResponse,
} from '../types/branch';

export default function useBranch(): {
  onGetAdminBranches: (
    params?: GetBranchesAdminParams
  ) => Promise<GetBranchesAdminResponse>;
} {
  const dispatch = useAppDispatch();

  const onGetAdminBranches = useCallback(
    async (
      params?: GetBranchesAdminParams
    ): Promise<GetBranchesAdminResponse> => {
      const response = await dispatch(getAdminBranches(params)).unwrap();
      return response;
    },
    [dispatch]
  );

  return { onGetAdminBranches };
}
