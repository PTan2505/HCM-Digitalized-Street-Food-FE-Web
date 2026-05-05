import type { RootState } from '@app/store';
import type {
  VendorDashboardRevenue,
  VendorDashboardVoucher,
  VendorDashboardDishes,
  VendorDashboardCampaigns,
  VendorRevenueBarResponse,
} from '@features/vendor/types/dashboard';
import { createAppAsyncThunk } from '@hooks/reduxHooks';
import { axiosApi } from '@lib/api/apiInstance';
import {
  createSlice,
  isFulfilled,
  isPending,
  isRejected,
} from '@reduxjs/toolkit';

export interface VendorDashboardState {
  revenue: VendorDashboardRevenue | null;
  vouchers: VendorDashboardVoucher | null;
  dishes: VendorDashboardDishes | null;
  campaigns: VendorDashboardCampaigns | null;
  vendorRevenueBar: VendorRevenueBarResponse | null;
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: unknown;
  revenueBarStatus: 'idle' | 'pending' | 'succeeded' | 'failed';
  revenueBarError: unknown;
}

const initialState: VendorDashboardState = {
  revenue: null,
  vouchers: null,
  dishes: null,
  campaigns: null,
  vendorRevenueBar: null,
  status: 'idle',
  error: null,
  revenueBarStatus: 'idle',
  revenueBarError: null,
};

// ─── Thunks ───────────────────────────────────────────────

export const getRevenue = createAppAsyncThunk(
  'vendorDashboard/getRevenue',
  async (
    payload: {
      fromDate: string;
      toDate: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response: VendorDashboardRevenue =
        await axiosApi.dashboardApi.getRevenue(payload);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getVouchers = createAppAsyncThunk(
  'vendorDashboard/getVouchers',
  async (
    payload: {
      fromDate: string;
      toDate: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response: VendorDashboardVoucher =
        await axiosApi.dashboardApi.getVouchers(payload);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getDishes = createAppAsyncThunk(
  'vendorDashboard/getDishes',
  async (
    payload: {
      fromDate: string;
      toDate: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response: VendorDashboardDishes =
        await axiosApi.dashboardApi.getDishes(payload);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getCampaigns = createAppAsyncThunk(
  'vendorDashboard/getCampaigns',
  async (
    payload: {
      fromDate: string;
      toDate: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response: VendorDashboardCampaigns =
        await axiosApi.dashboardApi.getCampaigns(payload);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getVendorRevenueBar = createAppAsyncThunk(
  'vendorDashboard/getVendorRevenueBar',
  async (
    payload: { fromDate: string; toDate: string },
    { rejectWithValue }
  ) => {
    try {
      const response: VendorRevenueBarResponse =
        await axiosApi.dashboardApi.getVendorRevenueBar(payload);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// ─── Slice ────────────────────────────────────────────────

const allThunks = [getRevenue, getVouchers, getDishes, getCampaigns] as const;

export const vendorDashboardSlice = createSlice({
  name: 'vendorDashboard',
  initialState,
  reducers: {
    resetVendorDashboardState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getRevenue.fulfilled, (state, action) => {
        state.revenue = action.payload;
      })
      .addCase(getVouchers.fulfilled, (state, action) => {
        state.vouchers = action.payload;
      })
      .addCase(getDishes.fulfilled, (state, action) => {
        state.dishes = action.payload;
      })
      .addCase(getCampaigns.fulfilled, (state, action) => {
        state.campaigns = action.payload;
      })
      .addCase(getVendorRevenueBar.pending, (state) => {
        state.revenueBarStatus = 'pending';
        state.revenueBarError = null;
      })
      .addCase(getVendorRevenueBar.fulfilled, (state, action) => {
        state.revenueBarStatus = 'succeeded';
        state.vendorRevenueBar = action.payload;
      })
      .addCase(getVendorRevenueBar.rejected, (state, action) => {
        state.revenueBarStatus = 'failed';
        state.revenueBarError = (action as { payload?: unknown }).payload ?? {
          message: 'An error occurred',
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

export const { resetVendorDashboardState } = vendorDashboardSlice.actions;

export default vendorDashboardSlice.reducer;

// ─── Selectors ────────────────────────────────────────────

export const selectVendorDashboardStatus = (
  state: RootState
): 'idle' | 'pending' | 'succeeded' | 'failed' => state.vendorDashboard.status;

export const selectVendorDashboardError = (state: RootState): unknown =>
  state.vendorDashboard.error;

export const selectVendorDashboardRevenue = (
  state: RootState
): VendorDashboardRevenue | null => state.vendorDashboard.revenue;

export const selectVendorDashboardVouchers = (
  state: RootState
): VendorDashboardVoucher | null => state.vendorDashboard.vouchers;

export const selectVendorDashboardDishes = (
  state: RootState
): VendorDashboardDishes | null => state.vendorDashboard.dishes;

export const selectVendorDashboardCampaigns = (
  state: RootState
): VendorDashboardCampaigns | null => state.vendorDashboard.campaigns;

export const selectVendorDashboardRevenueBar = (
  state: RootState
): VendorRevenueBarResponse | null => state.vendorDashboard.vendorRevenueBar;

export const selectVendorDashboardRevenueBarStatus = (
  state: RootState
): 'idle' | 'pending' | 'succeeded' | 'failed' =>
  state.vendorDashboard.revenueBarStatus;

export const selectVendorDashboardRevenueBarError = (
  state: RootState
): unknown => state.vendorDashboard.revenueBarError;
