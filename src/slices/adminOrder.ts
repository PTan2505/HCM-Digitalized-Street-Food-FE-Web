import type { RootState } from '@app/store';
import type {
  GetAdminOrdersPayload,
  GetAdminOrdersResponse,
} from '@features/admin/types/order';
import { createAppAsyncThunk } from '@hooks/reduxHooks';
import { axiosApi } from '@lib/api/apiInstance';
import {
  createSlice,
  isFulfilled,
  isPending,
  isRejected,
} from '@reduxjs/toolkit';

type PaginationState = {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
};

const defaultPagination: PaginationState = {
  currentPage: 1,
  pageSize: 10,
  totalPages: 1,
  totalCount: 0,
  hasPrevious: false,
  hasNext: false,
};

export interface AdminOrderState {
  orders: GetAdminOrdersResponse['items'];
  pagination: PaginationState;
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: unknown;
}

const initialState: AdminOrderState = {
  orders: [],
  pagination: { ...defaultPagination },
  status: 'idle',
  error: null,
};

export const getAdminOrders = createAppAsyncThunk(
  'adminOrder/getAdminOrders',
  async (params: GetAdminOrdersPayload, { rejectWithValue }) => {
    try {
      const response: GetAdminOrdersResponse =
        await axiosApi.adminOrderApi.getAdminOrders(params);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const allThunks = [getAdminOrders] as const;

export const adminOrderSlice = createSlice({
  name: 'adminOrder',
  initialState,
  reducers: {
    resetAdminOrderState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAdminOrders.fulfilled, (state, action) => {
        state.orders = action.payload.items;
        state.pagination = {
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          totalPages: action.payload.totalPages,
          totalCount: action.payload.totalCount,
          hasPrevious: action.payload.hasPrevious,
          hasNext: action.payload.hasNext,
        };
      })
      .addMatcher(isPending(...allThunks), (state) => {
        state.status = 'pending';
        state.error = null;
      })
      .addMatcher(isFulfilled(...allThunks), (state) => {
        state.status = 'succeeded';
      })
      .addMatcher(isRejected(...allThunks), (state, action) => {
        state.status = 'failed';
        state.error = (action as { payload?: unknown }).payload ?? {
          message: 'An error occurred',
        };
      });
  },
});

export const { resetAdminOrderState } = adminOrderSlice.actions;

export default adminOrderSlice.reducer;

export const selectAdminOrders = (
  state: RootState
): AdminOrderState['orders'] => state.adminOrder.orders;

export const selectAdminOrdersPagination = (
  state: RootState
): AdminOrderState['pagination'] => state.adminOrder.pagination;

export const selectAdminOrderStatus = (
  state: RootState
): AdminOrderState['status'] => state.adminOrder.status;

export const selectAdminOrderError = (state: RootState): unknown =>
  state.adminOrder.error;
