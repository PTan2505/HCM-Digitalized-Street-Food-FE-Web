import type { GetManagerOrdersResponse } from '@features/manager/types/orderManagement';
import { useAppDispatch } from '@hooks/reduxHooks';
import { getManagerOrders } from '@slices/order';
import { useCallback } from 'react';

export default function useOrderManagement(): {
  onGetManagerOrders: (params: {
    pageNumber: number;
    pageSize: number;
  }) => Promise<GetManagerOrdersResponse>;
} {
  const dispatch = useAppDispatch();

  const onGetManagerOrders = useCallback(
    async (params: {
      pageNumber: number;
      pageSize: number;
    }): Promise<GetManagerOrdersResponse> => {
      return await dispatch(getManagerOrders(params)).unwrap();
    },
    [dispatch]
  );

  return {
    onGetManagerOrders,
  };
}
