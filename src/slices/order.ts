import type { RootState } from '@app/store';
import type { GetManagerOrdersResponse } from '@features/manager/types/orderManagement';
import type {
  CompleteVendorOrderResponse,
  DecideVendorOrderResponse,
  GetOrderPickupCodeResponse,
  GetVendorBranchOrdersResponse,
  OrderDetailsResponse,
} from '@features/vendor/types/order';
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

export interface OrderState {
  orders: GetVendorBranchOrdersResponse['items'];
  selectedOrder: OrderDetailsResponse | null;
  pagination: PaginationState;
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: unknown;
}

const initialState: OrderState = {
  orders: [],
  selectedOrder: null,
  pagination: { ...defaultPagination },
  status: 'idle',
  error: null,
};

export const getVendorOrders = createAppAsyncThunk(
  'order/getVendorOrders',
  async (
    params: {
      pageNumber: number;
      pageSize: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const response: GetVendorBranchOrdersResponse =
        await axiosApi.orderApi.getVendorOrders(params);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getVendorBranchOrders = createAppAsyncThunk(
  'order/getVendorBranchOrders',
  async (
    payload: {
      branchId: number;
      params: {
        pageNumber: number;
        pageSize: number;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      const response: GetVendorBranchOrdersResponse =
        await axiosApi.orderApi.getVendorBranchOrders(
          payload.branchId,
          payload.params
        );
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getManagerOrders = createAppAsyncThunk(
  'order/getManagerOrders',
  async (
    params: {
      pageNumber: number;
      pageSize: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const response: GetManagerOrdersResponse =
        await axiosApi.orderManagementApi.getManagerOrders(params);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const decideVendorOrder = createAppAsyncThunk(
  'order/decideVendorOrder',
  async (
    payload: { orderId: number; approve: boolean },
    { rejectWithValue }
  ) => {
    try {
      const response: DecideVendorOrderResponse =
        await axiosApi.orderApi.decideVendorOrder(
          payload.orderId,
          payload.approve
        );
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getOrderPickupCode = createAppAsyncThunk(
  'order/getOrderPickupCode',
  async (orderId: number, { rejectWithValue }) => {
    try {
      const response: GetOrderPickupCodeResponse =
        await axiosApi.orderApi.getOrderPickupCode(orderId);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const completeVendorOrder = createAppAsyncThunk(
  'order/completeVendorOrder',
  async (
    payload: { orderId: number; verificationCode: string },
    { rejectWithValue }
  ) => {
    try {
      const response: CompleteVendorOrderResponse =
        await axiosApi.orderApi.completeVendorOrder(
          payload.orderId,
          payload.verificationCode
        );
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getOrderDetails = createAppAsyncThunk(
  'order/getOrderDetails',
  async (orderId: number, { rejectWithValue }) => {
    try {
      return await axiosApi.orderApi.getOrderDetails(orderId);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const allThunks = [
  getVendorOrders,
  getVendorBranchOrders,
  getManagerOrders,
  decideVendorOrder,
  getOrderPickupCode,
  completeVendorOrder,
  getOrderDetails,
] as const;

export const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    resetOrderState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getVendorOrders.fulfilled, (state, action) => {
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
      .addCase(getVendorBranchOrders.fulfilled, (state, action) => {
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
      .addCase(getManagerOrders.fulfilled, (state, action) => {
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
      .addCase(decideVendorOrder.fulfilled, (state, action) => {
        const targetOrder = state.orders.find(
          (order) => order.orderId === action.payload.orderId
        );
        if (targetOrder) {
          targetOrder.status = action.payload.status;
          targetOrder.finalAmount = action.payload.finalAmount;
          targetOrder.updatedAt = new Date().toISOString();
        }
      })
      .addCase(completeVendorOrder.fulfilled, (state, action) => {
        const targetOrder = state.orders.find(
          (order) => order.orderId === action.payload.orderId
        );
        if (targetOrder) {
          targetOrder.status = action.payload.status;
          targetOrder.finalAmount = action.payload.finalAmount;
          targetOrder.updatedAt = new Date().toISOString();
        }
      })
      .addCase(getOrderDetails.fulfilled, (state, action) => {
        state.selectedOrder = action.payload;
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

export const { resetOrderState } = orderSlice.actions;

export default orderSlice.reducer;

export const selectVendorOrders = (state: RootState): OrderState['orders'] =>
  state.order.orders;

export const selectVendorOrdersPagination = (
  state: RootState
): OrderState['pagination'] => state.order.pagination;

export const selectSelectedOrder = (
  state: RootState
): OrderState['selectedOrder'] => state.order.selectedOrder;

export const selectOrderStatus = (state: RootState): OrderState['status'] =>
  state.order.status;

export const selectOrderError = (state: RootState): unknown =>
  state.order.error;
