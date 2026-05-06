import type {
  CreatePaymentLinkRequest,
  CreatePaymentLinkResponse,
  ConfirmPaymentRequest,
  ConfirmPaymentResponse,
  GetPaymentStatusResponse,
  GetPaymentHistoryResponse,
  GetPaymentSuccessResponse,
  GetPaymentCancelResponse,
  GetVendorBalanceResponse,
  GetVendorBalanceHistoryResponse,
  VendorBalanceHistoryFilter,
  VendorRequestTransferRequest,
  VendorRequestTransferResponse,
} from '@features/vendor/types/payment';
import { useAppDispatch } from '@hooks/reduxHooks';
import {
  createPaymentLink,
  getPaymentStatus,
  confirmPayment,
  getPaymentHistory,
  getPaymentSuccess,
  getPaymentCancel,
  getVendorBalance,
  fetchVendorBalanceHistory,
  vendorRequestTransfer,
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
  onGetVendorBalance: () => Promise<GetVendorBalanceResponse>;
  onFetchVendorBalanceHistory: (filter: VendorBalanceHistoryFilter) => Promise<GetVendorBalanceHistoryResponse>;
  onVendorRequestTransfer: (
    payload: VendorRequestTransferRequest
  ) => Promise<VendorRequestTransferResponse>;
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

  const onGetVendorBalance =
    useCallback(async (): Promise<GetVendorBalanceResponse> => {
      const response = await dispatch(getVendorBalance()).unwrap();
      return response;
    }, [dispatch]);

  const onFetchVendorBalanceHistory = useCallback(
    async (filter: VendorBalanceHistoryFilter): Promise<GetVendorBalanceHistoryResponse> => {
      const response = await dispatch(fetchVendorBalanceHistory(filter)).unwrap();
      return response;
    },
    [dispatch]
  );

  const onVendorRequestTransfer = useCallback(
    async (
      payload: VendorRequestTransferRequest
    ): Promise<VendorRequestTransferResponse> => {
      const response = await dispatch(vendorRequestTransfer(payload)).unwrap();
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
    onGetVendorBalance,
    onFetchVendorBalanceHistory,
    onVendorRequestTransfer,
    onResetPaymentState,
  };
}
