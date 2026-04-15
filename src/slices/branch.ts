import type { RootState } from '@app/store';
import type {
  ActiveBranch,
  GetActiveBranchesParams,
  GetActiveBranchesResponse,
} from '@features/home/types/branch';
import type {
  BranchRegisterRequest,
  GetPendingRegistrationsParams,
  GetPendingRegistrationsResponse,
  VerifyRegistrationRequest,
  RejectRegistrationRequest,
} from '@features/moderator/types/branch';
import type {
  BranchAdmin,
  GetBranchesAdminParams,
} from '@features/admin/types/branch';
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
  activeBranches: ActiveBranch[];
  pendingRegistrationsPagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
    hasPrevious: boolean;
    hasNext: boolean;
  };
  adminBranches: BranchAdmin[];
  adminBranchesPagination: {
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
  activeBranches: [],
  pendingRegistrationsPagination: {
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
    totalCount: 0,
    hasPrevious: false,
    hasNext: false,
  },
  adminBranches: [],
  adminBranchesPagination: {
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

export const getActiveBranches = createAppAsyncThunk(
  'vendor/getActiveBranches',
  async (params: GetActiveBranchesParams | undefined, { rejectWithValue }) => {
    try {
      const response: GetActiveBranchesResponse =
        await axiosApi.homeBranchApi.getActiveBranches(params);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getPendingRegistrations = createAppAsyncThunk(
  'vendor/getPendingRegistrations',
  async (params: GetPendingRegistrationsParams, { rejectWithValue }) => {
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

export const getAdminBranches = createAppAsyncThunk(
  'admin/getAdminBranches',
  async (params: GetBranchesAdminParams | undefined, { rejectWithValue }) => {
    try {
      const response = await axiosApi.branchAdminApi.getBranches(params);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const branchSlice = createSlice({
  name: 'branch',
  initialState,
  reducers: {
    resetBranchState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getActiveBranches.fulfilled, (state, action) => {
        state.activeBranches = action.payload.items;
      })
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
      .addCase(getAdminBranches.fulfilled, (state, action) => {
        state.adminBranches = action.payload.items;
        state.adminBranchesPagination = {
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          totalPages: action.payload.totalPages,
          totalCount: action.payload.totalCount,
          hasPrevious: action.payload.hasPrevious,
          hasNext: action.payload.hasNext,
        };
      })
      .addMatcher(
        isPending(
          getActiveBranches,
          getPendingRegistrations,
          verifyBranchRegistration,
          rejectBranchRegistration,
          getAdminBranches
        ),
        (state) => {
          state.status = 'pending';
        }
      )
      .addMatcher(
        isFulfilled(
          getActiveBranches,
          getPendingRegistrations,
          verifyBranchRegistration,
          rejectBranchRegistration,
          getAdminBranches
        ),
        (state) => {
          state.status = 'succeeded';
        }
      )
      .addMatcher(
        isRejected(
          getActiveBranches,
          getPendingRegistrations,
          verifyBranchRegistration,
          rejectBranchRegistration,
          getAdminBranches
        ),
        (state, action) => {
          state.status = 'failed';
          state.error = action.payload;
        }
      );
  },
});

export const { resetBranchState } = branchSlice.actions;

export default branchSlice.reducer;

export const selectActiveBranches = (state: RootState): ActiveBranch[] =>
  state.branch.activeBranches;

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

export const selectAdminBranches = (state: RootState): BranchAdmin[] =>
  state.branch.adminBranches;

export const selectAdminBranchesPagination = (
  state: RootState
): BranchState['adminBranchesPagination'] =>
  state.branch.adminBranchesPagination;
