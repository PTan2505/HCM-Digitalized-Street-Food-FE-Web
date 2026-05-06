import type { RootState } from '@app/store';
import type { PaymentPayoutResponse } from '@features/admin/types/payment';
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
import { createAppAsyncThunk } from '@hooks/reduxHooks';
import { axiosApi } from '@lib/api/apiInstance';
import { completeVendorOrder } from '@slices/order';
import {
  createSlice,
  isFulfilled,
  isPending,
  isRejected,
} from '@reduxjs/toolkit';

export interface PaymentState {
  paymentUrl: string | null;
  orderCode: string | null;
  paymentStatus: GetPaymentStatusResponse | null;
  paymentHistory: GetPaymentHistoryResponse | null;
  paymentSuccess: GetPaymentSuccessResponse | null;
  paymentCancel: GetPaymentCancelResponse | null;
  accountBalance: GetVendorBalanceResponse | null;
  vendorBalanceHistory: GetVendorBalanceHistoryResponse | null;
  payouts: PaymentPayoutResponse | null;
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: unknown;
}

const initialState: PaymentState = {
  paymentUrl: null,
  orderCode: null,
  paymentStatus: null,
  paymentHistory: null,
  paymentSuccess: null,
  paymentCancel: null,
  accountBalance: null,
  vendorBalanceHistory: null,
  payouts: null,
  status: 'idle',
  error: null,
};

export const createPaymentLink = createAppAsyncThunk(
  'payment/createPaymentLink',
  async (payload: CreatePaymentLinkRequest, { rejectWithValue }) => {
    try {
      const response: CreatePaymentLinkResponse =
        await axiosApi.paymentApi.createPaymentLink(payload);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getPaymentStatus = createAppAsyncThunk(
  'payment/getPaymentStatus',
  async (orderCode: string, { rejectWithValue }) => {
    try {
      const response: GetPaymentStatusResponse =
        await axiosApi.paymentApi.getPaymentStatus(orderCode);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const confirmPayment = createAppAsyncThunk(
  'payment/confirmPayment',
  async (payload: ConfirmPaymentRequest, { rejectWithValue }) => {
    try {
      const response: ConfirmPaymentResponse =
        await axiosApi.paymentApi.confirmPayment(payload);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getPaymentHistory = createAppAsyncThunk(
  'payment/getPaymentHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response: GetPaymentHistoryResponse =
        await axiosApi.paymentApi.getPaymentHistory();
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getPaymentSuccess = createAppAsyncThunk(
  'payment/getPaymentSuccess',
  async (
    params: { orderCode: number; status: string },
    { rejectWithValue }
  ) => {
    try {
      const response: GetPaymentSuccessResponse =
        await axiosApi.paymentApi.getPaymentSuccess(params);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getPaymentCancel = createAppAsyncThunk(
  'payment/getPaymentCancel',
  async (params: { orderCode: number }, { rejectWithValue }) => {
    try {
      const response: GetPaymentCancelResponse =
        await axiosApi.paymentApi.getPaymentCancel(params);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getVendorBalance = createAppAsyncThunk(
  'payment/getVendorBalance',
  async (_, { rejectWithValue }) => {
    try {
      const response: GetVendorBalanceResponse =
        await axiosApi.paymentApi.getVendorBalance();
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const vendorRequestTransfer = createAppAsyncThunk(
  'payment/vendorRequestTransfer',
  async (payload: VendorRequestTransferRequest, { rejectWithValue }) => {
    try {
      const response: VendorRequestTransferResponse =
        await axiosApi.paymentApi.vendorRequestTransfer(payload);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchVendorBalanceHistory = createAppAsyncThunk(
  'payment/fetchVendorBalanceHistory',
  async (filter: VendorBalanceHistoryFilter, { rejectWithValue }) => {
    try {
      const response: GetVendorBalanceHistoryResponse =
        await axiosApi.paymentApi.getVendorBalanceHistory(filter);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getPaymentPayout = createAppAsyncThunk(
  'payment/getPaymentPayout',
  async (
    params: { pageNumber: number; pageSize: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosApi.adminPaymentApi.getPaymentPayout(
        params.pageNumber,
        params.pageSize
      );
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    resetPaymentState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPaymentLink.fulfilled, (state, action) => {
        state.paymentUrl = action.payload.paymentUrl;
        state.orderCode = action.payload.orderCode;
      })
      .addCase(getPaymentStatus.fulfilled, (state, action) => {
        state.paymentStatus = action.payload;
      })
      .addCase(confirmPayment.fulfilled, (state, action) => {
        state.paymentStatus = action.payload;
      })
      .addCase(getPaymentHistory.fulfilled, (state, action) => {
        state.paymentHistory = action.payload;
      })
      .addCase(getPaymentSuccess.fulfilled, (state, action) => {
        state.paymentSuccess = action.payload;
      })
      .addCase(getPaymentCancel.fulfilled, (state, action) => {
        state.paymentCancel = action.payload;
      })
      .addCase(getVendorBalance.fulfilled, (state, action) => {
        state.accountBalance = action.payload;
      })
      .addCase(fetchVendorBalanceHistory.fulfilled, (state, action) => {
        state.vendorBalanceHistory = action.payload;
      })
      .addCase(getPaymentPayout.fulfilled, (state, action) => {
        state.payouts = action.payload;
      })
      .addCase(vendorRequestTransfer.fulfilled, (state, action) => {
        state.accountBalance = {
          balance: action.payload.currentVendorBalance,
        };
      })
      .addCase(completeVendorOrder.fulfilled, (state, action) => {
        if (
          state.accountBalance &&
          typeof action.payload.finalAmount === 'number'
        ) {
          state.accountBalance.balance += action.payload.finalAmount;
        }
      })
      .addMatcher(
        isPending(
          createPaymentLink,
          getPaymentStatus,
          confirmPayment,
          getPaymentHistory,
          getPaymentSuccess,
          getPaymentCancel,
          getVendorBalance,
          fetchVendorBalanceHistory,
          getPaymentPayout,
          vendorRequestTransfer
        ),
        (state) => {
          state.status = 'pending';
          state.error = null;
        }
      )
      .addMatcher(
        isFulfilled(
          createPaymentLink,
          getPaymentStatus,
          confirmPayment,
          getPaymentHistory,
          getPaymentSuccess,
          getPaymentCancel,
          getVendorBalance,
          fetchVendorBalanceHistory,
          getPaymentPayout,
          vendorRequestTransfer
        ),
        (state) => {
          state.status = 'succeeded';
          state.error = null;
        }
      )
      .addMatcher(
        isRejected(
          createPaymentLink,
          getPaymentStatus,
          confirmPayment,
          getPaymentHistory,
          getPaymentSuccess,
          getPaymentCancel,
          getVendorBalance,
          fetchVendorBalanceHistory,
          getPaymentPayout,
          vendorRequestTransfer
        ),
        (state, action) => {
          state.status = 'failed';
          state.error = action.payload;
        }
      );
  },
});

export const { resetPaymentState } = paymentSlice.actions;

export default paymentSlice.reducer;

// Selectors
export const selectPaymentStatus = (
  state: RootState
): 'idle' | 'pending' | 'succeeded' | 'failed' => state.payment.status;

export const selectPaymentError = (state: RootState): unknown =>
  state.payment.error;

export const selectPaymentUrl = (state: RootState): string | null =>
  state.payment.paymentUrl;

export const selectOrderCode = (state: RootState): string | null =>
  state.payment.orderCode;

export const selectPaymentStatusData = (
  state: RootState
): GetPaymentStatusResponse | null => state.payment.paymentStatus;

export const selectPaymentHistory = (
  state: RootState
): GetPaymentHistoryResponse | null => state.payment.paymentHistory;

export const selectPaymentSuccess = (
  state: RootState
): GetPaymentSuccessResponse | null => state.payment.paymentSuccess;

export const selectPaymentCancel = (
  state: RootState
): GetPaymentCancelResponse | null => state.payment.paymentCancel;

export const selectVendorAccountBalance = (
  state: RootState
): GetVendorBalanceResponse | null => state.payment.accountBalance;

export const selectPaymentPayouts = (
  state: RootState
): PaymentPayoutResponse | null => state.payment.payouts;

export const selectVendorBalanceHistory = (
  state: RootState
): GetVendorBalanceHistoryResponse | null => state.payment.vendorBalanceHistory;
