import { useAppDispatch } from '@hooks/reduxHooks';
import { useCallback } from 'react';
import type {
  GetAdminOrdersPayload,
  GetAdminOrdersResponse,
} from '@features/admin/types/order';
import { getAdminOrders } from '@slices/adminOrder';

export default function useAdminOrder(): {
  onGetAdminOrders: (
    payload: GetAdminOrdersPayload
  ) => Promise<GetAdminOrdersResponse>;
} {
  const dispatch = useAppDispatch();

  const onGetAdminOrders = useCallback(
    async (
      payload: GetAdminOrdersPayload
    ): Promise<GetAdminOrdersResponse> => {
      const response = await dispatch(getAdminOrders(payload)).unwrap();
      return response;
    },
    [dispatch]
  );

  return {
    onGetAdminOrders,
  };
}
