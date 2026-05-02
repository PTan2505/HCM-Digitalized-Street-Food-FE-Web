import type { RootState } from '@app/store';
import type {
  GetUserSignUps,
  GetMoney,
  GetCompensation,
  GetConversions,
  SystemCampaignStatistics,
} from '@features/admin/types/dashboard';
import { createAppAsyncThunk } from '@hooks/reduxHooks';
import { axiosApi } from '@lib/api/apiInstance';
import {
  createSlice,
  isFulfilled,
  isPending,
  isRejected,
} from '@reduxjs/toolkit';

export interface AdminDashboardState {
  userSignUps: GetUserSignUps | null;
  money: GetMoney | null;
  compensation: GetCompensation | null;
  conversions: GetConversions | null;
  systemCampaignsStatistics: SystemCampaignStatistics[] | null;
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: unknown;
}

const initialState: AdminDashboardState = {
  userSignUps: null,
  money: null,
  compensation: null,
  conversions: null,
  systemCampaignsStatistics: null,
  status: 'idle',
  error: null,
};

// ─── Thunks ───────────────────────────────────────────────

export const getUserSignUps = createAppAsyncThunk(
  'adminDashboard/getUserSignUps',
  async (
    payload: {
      fromDate: string;
      toDate: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response: GetUserSignUps =
        await axiosApi.adminDashboardApi.getUserSignUps(payload);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getMoney = createAppAsyncThunk(
  'adminDashboard/getMoney',
  async (
    payload: {
      fromDate: string;
      toDate: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response: GetMoney =
        await axiosApi.adminDashboardApi.getMoney(payload);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getCompensation = createAppAsyncThunk(
  'adminDashboard/getCompensation',
  async (
    payload: {
      fromDate: string;
      toDate: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response: GetCompensation =
        await axiosApi.adminDashboardApi.getCompensation(payload);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getConversions = createAppAsyncThunk(
  'adminDashboard/getConversions',
  async (
    payload: {
      fromDate: string;
      toDate: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response: GetConversions =
        await axiosApi.adminDashboardApi.getUserToVendorConversions(payload);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getSystemCampaignsStatistics = createAppAsyncThunk(
  'adminDashboard/getSystemCampaignsStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response: SystemCampaignStatistics[] =
        await axiosApi.adminDashboardApi.getSystemCampaignsStatistics();
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// ─── Slice ────────────────────────────────────────────────

const allThunks = [
  getUserSignUps,
  getMoney,
  getCompensation,
  getConversions,
  getSystemCampaignsStatistics,
] as const;

export const adminDashboardSlice = createSlice({
  name: 'adminDashboard',
  initialState,
  reducers: {
    resetAdminDashboardState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserSignUps.fulfilled, (state, action) => {
        state.userSignUps = action.payload;
      })
      .addCase(getMoney.fulfilled, (state, action) => {
        state.money = action.payload;
      })
      .addCase(getCompensation.fulfilled, (state, action) => {
        state.compensation = action.payload;
      })
      .addCase(getConversions.fulfilled, (state, action) => {
        state.conversions = action.payload;
      })
      .addCase(getSystemCampaignsStatistics.fulfilled, (state, action) => {
        state.systemCampaignsStatistics = action.payload;
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

export const { resetAdminDashboardState } = adminDashboardSlice.actions;

export default adminDashboardSlice.reducer;

// ─── Selectors ────────────────────────────────────────────

export const selectAdminDashboardStatus = (
  state: RootState
): 'idle' | 'pending' | 'succeeded' | 'failed' => state.adminDashboard.status;

export const selectAdminDashboardError = (state: RootState): unknown =>
  state.adminDashboard.error;

export const selectAdminDashboardUserSignUps = (
  state: RootState
): GetUserSignUps | null => state.adminDashboard.userSignUps;

export const selectAdminDashboardMoney = (state: RootState): GetMoney | null =>
  state.adminDashboard.money;

export const selectAdminDashboardCompensation = (
  state: RootState
): GetCompensation | null => state.adminDashboard.compensation;

export const selectAdminDashboardConversions = (
  state: RootState
): GetConversions | null => state.adminDashboard.conversions;

export const selectAdminDashboardSystemCampaignsStatistics = (
  state: RootState
): SystemCampaignStatistics[] | null =>
  state.adminDashboard.systemCampaignsStatistics;
