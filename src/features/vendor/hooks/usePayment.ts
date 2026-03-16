import type {
  CreatePaymentLinkRequest,
  CreatePaymentLinkResponse,
  ConfirmPaymentRequest,
  ConfirmPaymentResponse,
  GetPaymentStatusResponse,
  GetPaymentHistoryResponse,
  GetPaymentSuccessResponse,
  GetPaymentCancelResponse,
} from '@features/vendor/types/payment';
import { useAppDispatch } from '@hooks/reduxHooks';
import {
  createPaymentLink,
  getPaymentStatus,
  confirmPayment,
  getPaymentHistory,
  getPaymentSuccess,
  getPaymentCancel,
  resetPaymentState,
} from '@slices/payment';
import { useCallback } from 'react';

export default function usePayment(): {
  onCreatePaymentLink: (
    payload: CreatePaymentLinkRequest
  ) => Promise<CreatePaymentLinkResponse>;
  onGetPaymentStatus: (orderCode: string) => Promise<GetPaymentStatusResponse>;
  onConfirmPayment: (
    payload: ConfirmPaymentRequest
  ) => Promise<ConfirmPaymentResponse>;
  onGetPaymentHistory: () => Promise<GetPaymentHistoryResponse>;
  onGetPaymentSuccess: (params: {
    orderCode: number;
    status: string;
  }) => Promise<GetPaymentSuccessResponse>;
  onGetPaymentCancel: (params: {
    orderCode: number;
  }) => Promise<GetPaymentCancelResponse>;
  onResetPaymentState: () => void;
} {
  const dispatch = useAppDispatch();

  const onCreatePaymentLink = useCallback(
    async (
      payload: CreatePaymentLinkRequest
    ): Promise<CreatePaymentLinkResponse> => {
      const response = await dispatch(createPaymentLink(payload)).unwrap();
      return response;
    },
    [dispatch]
  );

  const onGetPaymentStatus = useCallback(
    async (orderCode: string): Promise<GetPaymentStatusResponse> => {
      const response = await dispatch(getPaymentStatus(orderCode)).unwrap();
      return response;
    },
    [dispatch]
  );

  const onConfirmPayment = useCallback(
    async (payload: ConfirmPaymentRequest): Promise<ConfirmPaymentResponse> => {
      const response = await dispatch(confirmPayment(payload)).unwrap();
      return response;
    },
    [dispatch]
  );

  const onGetPaymentHistory =
    useCallback(async (): Promise<GetPaymentHistoryResponse> => {
      const response = await dispatch(getPaymentHistory()).unwrap();
      return response;
    }, [dispatch]);

  const onGetPaymentSuccess = useCallback(
    async (params: {
      orderCode: number;
      status: string;
    }): Promise<GetPaymentSuccessResponse> => {
      const response = await dispatch(getPaymentSuccess(params)).unwrap();
      return response;
    },
    [dispatch]
  );

  const onGetPaymentCancel = useCallback(
    async (params: {
      orderCode: number;
    }): Promise<GetPaymentCancelResponse> => {
      const response = await dispatch(getPaymentCancel(params)).unwrap();
      return response;
    },
    [dispatch]
  );

  const onResetPaymentState = useCallback(() => {
    dispatch(resetPaymentState());
  }, [dispatch]);

  return {
    onCreatePaymentLink,
    onGetPaymentStatus,
    onConfirmPayment,
    onGetPaymentHistory,
    onGetPaymentSuccess,
    onGetPaymentCancel,
    onResetPaymentState,
  };
}
