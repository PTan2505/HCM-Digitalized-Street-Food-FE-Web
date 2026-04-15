import type {
  CompleteVendorOrderResponse,
  DecideVendorOrderResponse,
  GetOrderPickupCodeResponse,
  GetVendorBranchOrdersResponse,
  OrderDetailsResponse,
  UpdateOrderPayload,
  UpdateOrderResponse,
} from '@features/vendor/types/order';
import { useAppDispatch } from '@hooks/reduxHooks';
import {
  completeVendorOrder,
  decideVendorOrder,
  getOrderPickupCode,
  getVendorBranchOrders,
  getVendorOrders,
  getOrderDetails,
  updateOrder,
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
  onGetOrderDetails: (orderId: number) => Promise<OrderDetailsResponse>;
  onUpdateOrder: (payload: {
    orderId: number;
    data: UpdateOrderPayload;
  }) => Promise<UpdateOrderResponse>;
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

  const onGetOrderDetails = useCallback(
    async (orderId: number): Promise<OrderDetailsResponse> => {
      return await dispatch(getOrderDetails(orderId)).unwrap();
    },
    [dispatch]
  );

  const onUpdateOrder = useCallback(
    async (payload: {
      orderId: number;
      data: UpdateOrderPayload;
    }): Promise<UpdateOrderResponse> => {
      return await dispatch(updateOrder(payload)).unwrap();
    },
    [dispatch]
  );

  return {
    onGetVendorOrders,
    onGetVendorBranchOrders,
    onDecideVendorOrder,
    onGetOrderPickupCode,
    onCompleteVendorOrder,
    onGetOrderDetails,
    onUpdateOrder,
    onResetOrderState,
  };
}
