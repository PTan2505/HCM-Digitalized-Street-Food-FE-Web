import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  getPaymentPayout,
  selectPaymentPayouts,
  selectPaymentStatus,
  selectPaymentError,
} from '@slices/payment';

export const usePaymentPayout = (pageNumber: number, pageSize: number) => {
  const dispatch = useAppDispatch();
  const payouts = useAppSelector(selectPaymentPayouts);
  const status = useAppSelector(selectPaymentStatus);
  const error = useAppSelector(selectPaymentError);

  const fetchPayouts = useCallback(async () => {
    await dispatch(getPaymentPayout({ pageNumber, pageSize }));
  }, [dispatch, pageNumber, pageSize]);

  useEffect(() => {
    fetchPayouts();
  }, [fetchPayouts]);

  return {
    payouts,
    status,
    error,
    refetch: fetchPayouts,
  };
};
