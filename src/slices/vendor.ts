import type { RootState } from '@app/store';
import type {
  VendorRegistrationRequest,
  VendorRegistrationResponse,
  SubmitLicenseResponse,
  GetMyVendorResponse,
} from '@features/vendor/types/vendor';
import type {
  WorkSchedule,
  WorkScheduleResponse,
  DayOff,
  DayOffResponse,
} from '@features/vendor/types/workSchedule';
import { createAppAsyncThunk } from '@hooks/reduxHooks';
import { axiosApi } from '@lib/api/apiInstance';
import {
  createSlice,
  isFulfilled,
  isPending,
  isRejected,
} from '@reduxjs/toolkit';
import type { CheckLicenseStatusResponse } from '@features/vendor/types/vendor';

export interface VendorState {
  vendorId: number | null;
  branchId: number | null;
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: unknown;
  myVendor: GetMyVendorResponse | null;
  licenseStatus: CheckLicenseStatusResponse | null;
}

const initialState: VendorState = {
  vendorId: null,
  branchId: null,
  status: 'idle',
  error: null,
  myVendor: null,
  licenseStatus: null,
};

export const registerVendor = createAppAsyncThunk(
  'vendor/registerVendor',
  async (payload: VendorRegistrationRequest, { rejectWithValue }) => {
    try {
      const response: VendorRegistrationResponse =
        await axiosApi.vendorApi.registerVendor(payload);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const submitLicense = createAppAsyncThunk(
  'vendor/submitLicense',
  async (
    payload: { branchId: number; licenseImages: File[] },
    { rejectWithValue }
  ) => {
    try {
      const response: SubmitLicenseResponse =
        await axiosApi.vendorApi.submitLicense(
          payload.branchId,
          payload.licenseImages
        );
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getMyVendor = createAppAsyncThunk(
  'vendor/getMyVendor',
  async (_, { rejectWithValue }) => {
    try {
      const response: GetMyVendorResponse =
        await axiosApi.vendorApi.getMyVendor();
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const checkLicenseStatus = createAppAsyncThunk(
  'vendor/checkLicenseStatus',
  async (branchId: number, { rejectWithValue }) => {
    try {
      const response: CheckLicenseStatusResponse =
        await axiosApi.vendorApi.checkLicenseStatus(branchId);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const submitWorkSchedule = createAppAsyncThunk(
  'vendor/submitWorkSchedule',
  async (
    payload: { branchId: number; data: WorkSchedule },
    { rejectWithValue }
  ) => {
    try {
      const response: WorkScheduleResponse =
        await axiosApi.vendorApi.submitWorkSchedule(
          payload.branchId,
          payload.data
        );
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const submitDayOff = createAppAsyncThunk(
  'vendor/submitDayOff',
  async (payload: { branchId: number; data: DayOff }, { rejectWithValue }) => {
    try {
      const response: DayOffResponse = await axiosApi.vendorApi.submitDayOff(
        payload.branchId,
        payload.data
      );
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const vendorSlice = createSlice({
  name: 'vendor',
  initialState,
  reducers: {
    resetVendorState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerVendor.fulfilled, (state, action) => {
        state.vendorId = action.payload.vendorId;
        state.branchId = action.payload.branchId;
      })
      .addCase(submitLicense.fulfilled, (state) => {
        // License submitted successfully
        state.status = 'succeeded';
      })
      .addCase(getMyVendor.fulfilled, (state, action) => {
        state.myVendor = action.payload;
      })
      .addCase(checkLicenseStatus.fulfilled, (state, action) => {
        state.licenseStatus = action.payload;
      })
      // Matcher: Handle all pending cases
      .addMatcher(isPending, (state) => {
        state.status = 'pending';
        state.error = null;
      })
      // Matcher: Handle all rejected cases
      .addMatcher(isRejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? { message: 'An error occurred' };
      })
      // Matcher: Handle all fulfilled cases
      .addMatcher(isFulfilled, (state) => {
        state.status = 'succeeded';
      });
  },
});

export const { resetVendorState } = vendorSlice.actions;

export default vendorSlice.reducer;

// Selectors
export const selectVendorId = (state: RootState): number | null =>
  state.vendor.vendorId;

export const selectBranchId = (state: RootState): number | null =>
  state.vendor.branchId;

export const selectVendorStatus = (
  state: RootState
): 'idle' | 'pending' | 'succeeded' | 'failed' => state.vendor.status;

export const selectVendorError = (state: RootState): unknown =>
  state.vendor.error;

export const selectLicenseStatus = (
  state: RootState
): CheckLicenseStatusResponse | null => state.vendor.licenseStatus;

export const selectMyVendor = (state: RootState): GetMyVendorResponse | null =>
  state.vendor.myVendor;
