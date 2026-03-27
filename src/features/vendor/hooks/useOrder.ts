import type {
  CompleteVendorOrderResponse,
  DecideVendorOrderResponse,
  GetOrderPickupCodeResponse,
  GetVendorBranchOrdersResponse,
} from '@features/vendor/types/order';
import { useAppDispatch } from '@hooks/reduxHooks';
import {
  completeVendorOrder,
  decideVendorOrder,
  getOrderPickupCode,
  getVendorBranchOrders,
  getVendorOrders,
  resetOrderState,
} from '@slices/order';
import { useCallback } from 'react';

export default function useOrder(): {
  onGetVendorOrders: (params: {
    pageNumber: number;
    pageSize: number;
  }) => Promise<GetVendorBranchOrdersResponse>;
  onGetVendorBranchOrders: (payload: {
    branchId: number;
    params: {
      pageNumber: number;
      pageSize: number;
    };
  }) => Promise<GetVendorBranchOrdersResponse>;
  onDecideVendorOrder: (payload: {
    orderId: number;
    approve: boolean;
  }) => Promise<DecideVendorOrderResponse>;
  onGetOrderPickupCode: (
    orderId: number
  ) => Promise<GetOrderPickupCodeResponse>;
  onCompleteVendorOrder: (payload: {
    orderId: number;
    verificationCode: string;
  }) => Promise<CompleteVendorOrderResponse>;
  onResetOrderState: () => void;
} {
  const dispatch = useAppDispatch();

  const onGetVendorOrders = useCallback(
    async (params: {
      pageNumber: number;
      pageSize: number;
    }): Promise<GetVendorBranchOrdersResponse> => {
      return await dispatch(getVendorOrders(params)).unwrap();
    },
    [dispatch]
  );

  const onGetVendorBranchOrders = useCallback(
    async (payload: {
      branchId: number;
      params: {
        pageNumber: number;
        pageSize: number;
      };
    }): Promise<GetVendorBranchOrdersResponse> => {
      return await dispatch(getVendorBranchOrders(payload)).unwrap();
    },
    [dispatch]
  );

  const onDecideVendorOrder = useCallback(
    async (payload: {
      orderId: number;
      approve: boolean;
    }): Promise<DecideVendorOrderResponse> => {
      return await dispatch(decideVendorOrder(payload)).unwrap();
    },
    [dispatch]
  );

  const onGetOrderPickupCode = useCallback(
    async (orderId: number): Promise<GetOrderPickupCodeResponse> => {
      return await dispatch(getOrderPickupCode(orderId)).unwrap();
    },
    [dispatch]
  );

  const onCompleteVendorOrder = useCallback(
    async (payload: {
      orderId: number;
      verificationCode: string;
    }): Promise<CompleteVendorOrderResponse> => {
      return await dispatch(completeVendorOrder(payload)).unwrap();
    },
    [dispatch]
  );

  const onResetOrderState = useCallback(() => {
    dispatch(resetOrderState());
  }, [dispatch]);

  return {
    onGetVendorOrders,
    onGetVendorBranchOrders,
    onDecideVendorOrder,
    onGetOrderPickupCode,
    onCompleteVendorOrder,
    onResetOrderState,
  };
}
