import type { Branch } from '@features/vendor/types/vendor';
import { axiosApi } from '@lib/api/apiInstance';
import { useCallback } from 'react';

export default function useBranchManagement(): {
  onGetManagerMyBranch: () => Promise<Branch>;
} {
  const onGetManagerMyBranch = useCallback(async (): Promise<Branch> => {
    return await axiosApi.branchManagementApi.getManagerMyBranch();
  }, []);

  return {
    onGetManagerMyBranch,
  };
}
