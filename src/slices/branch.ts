import type { RootState } from '@app/store';
import type {
  BranchRegisterRequest,
  GetPendingRegistrationsResponse,
  VerifyRegistrationRequest,
  RejectRegistrationRequest,
} from '@features/moderator/types/branch';
import { createAppAsyncThunk } from '@hooks/reduxHooks';
import { axiosApi } from '@lib/api/apiInstance';
import {
  createSlice,
  isFulfilled,
  isPending,
  isRejected,
} from '@reduxjs/toolkit';

export interface BranchState {
  pendingRegistrations: BranchRegisterRequest[];
  pendingRegistrationsPagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
    hasPrevious: boolean;
    hasNext: boolean;
  };
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: unknown;
}

const initialState: BranchState = {
  pendingRegistrations: [],
  pendingRegistrationsPagination: {
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
    totalCount: 0,
    hasPrevious: false,
    hasNext: false,
  },
  status: 'idle',
  error: null,
};

export const getPendingRegistrations = createAppAsyncThunk(
  'vendor/getPendingRegistrations',
  async (
    params: { pageNumber: number; pageSize: number },
    { rejectWithValue }
  ) => {
    try {
      const response: GetPendingRegistrationsResponse =
        await axiosApi.branchApi.getPendingRegistrations(params);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const verifyBranchRegistration = createAppAsyncThunk(
  'vendor/verifyBranchRegistration',
  async (
    payload: { branchId: number; data: VerifyRegistrationRequest },
    { rejectWithValue }
  ) => {
    try {
      await axiosApi.branchApi.verifyBranchRegistration(
        payload.branchId,
        payload.data
      );
      return payload.branchId;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const rejectBranchRegistration = createAppAsyncThunk(
  'vendor/rejectBranchRegistration',
  async (
    payload: { branchId: number; data: RejectRegistrationRequest },
    { rejectWithValue }
  ) => {
    try {
      await axiosApi.branchApi.rejectBranchRegistration(
        payload.branchId,
        payload.data
      );
      return payload.branchId;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const branchSlice = createSlice({
  name: 'branch',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getPendingRegistrations.fulfilled, (state, action) => {
        state.pendingRegistrations = action.payload.items;
        state.pendingRegistrationsPagination = {
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          totalPages: action.payload.totalPages,
          totalCount: action.payload.totalCount,
          hasPrevious: action.payload.hasPrevious,
          hasNext: action.payload.hasNext,
        };
      })
      .addCase(verifyBranchRegistration.fulfilled, (state, action) => {
        // state.status = 'succeeded';
        if (action.payload) {
          state.pendingRegistrations = state.pendingRegistrations.filter(
            (registration) => registration.branchId !== action.payload
          );
        }
      })
      .addCase(rejectBranchRegistration.fulfilled, (state, action) => {
        if (action.payload) {
          state.pendingRegistrations = state.pendingRegistrations.filter(
            (registration) => registration.branchId !== action.payload
          );
        }
      })
      .addMatcher(
        isPending(
          getPendingRegistrations,
          verifyBranchRegistration,
          rejectBranchRegistration
        ),
        (state) => {
          state.status = 'pending';
        }
      )
      .addMatcher(
        isFulfilled(
          getPendingRegistrations,
          verifyBranchRegistration,
          rejectBranchRegistration
        ),
        (state) => {
          state.status = 'succeeded';
        }
      )
      .addMatcher(
        isRejected(
          getPendingRegistrations,
          verifyBranchRegistration,
          rejectBranchRegistration
        ),
        (state, action) => {
          state.status = 'failed';
          state.error = action.payload;
        }
      );
  },
});

export default branchSlice.reducer;

export const selectBranchStatus = (
  state: RootState
): 'idle' | 'pending' | 'succeeded' | 'failed' => state.branch.status;

export const selectPendingRegistrations = (
  state: RootState
): BranchRegisterRequest[] => state.branch.pendingRegistrations;

export const selectPendingRegistrationsPagination = (
  state: RootState
): BranchState['pendingRegistrationsPagination'] =>
  state.branch.pendingRegistrationsPagination;
