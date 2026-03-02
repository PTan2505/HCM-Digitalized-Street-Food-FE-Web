import type {
  GetPendingRegistrationsResponse,
  VerifyRegistrationRequest,
  RejectRegistrationRequest,
} from '@features/moderator/types/branch';
import { useAppDispatch } from '@hooks/reduxHooks';
import {
  getPendingRegistrations,
  verifyBranchRegistration,
  rejectBranchRegistration,
} from '@slices/branch';
import { useCallback } from 'react';

export default function useBranch(): {
  onGetPendingRegistrations: (params: {
    pageNumber: number;
    pageSize: number;
  }) => Promise<GetPendingRegistrationsResponse>;
  onVerifyBranchRegistration: (payload: {
    branchId: number;
    data: VerifyRegistrationRequest;
  }) => Promise<number>;
  onRejectBranchRegistration: (payload: {
    branchId: number;
    data: RejectRegistrationRequest;
  }) => Promise<number>;
} {
  const dispatch = useAppDispatch();

  const onGetPendingRegistrations = useCallback(
    async (params: {
      pageNumber: number;
      pageSize: number;
    }): Promise<GetPendingRegistrationsResponse> => {
      const response = await dispatch(getPendingRegistrations(params)).unwrap();
      return response;
    },
    [dispatch]
  );

  const onVerifyBranchRegistration = useCallback(
    async (payload: {
      branchId: number;
      data: VerifyRegistrationRequest;
    }): Promise<number> => {
      const response = await dispatch(
        verifyBranchRegistration(payload)
      ).unwrap();
      return response;
    },
    [dispatch]
  );

  const onRejectBranchRegistration = useCallback(
    async (payload: {
      branchId: number;
      data: RejectRegistrationRequest;
    }): Promise<number> => {
      const response = await dispatch(
        rejectBranchRegistration(payload)
      ).unwrap();
      return response;
    },
    [dispatch]
  );

  return {
    onGetPendingRegistrations,
    onVerifyBranchRegistration,
    onRejectBranchRegistration,
  };
}
