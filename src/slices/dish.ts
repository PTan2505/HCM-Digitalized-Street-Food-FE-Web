import type { RootState } from '@app/store';
import type {
  CreateOrUpdateDishRequest,
  AssignOrUnassignDishToBranchRequest,
  UpdateDishAvailabilityByBranchRequest,
  CreateOrUpdateDishResponse,
  GetDishesOfAVendorResponse,
  GetDishesByBranchResponse,
} from '@features/vendor/types/dish';
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

export interface DishState {
  // Vendor dishes
  vendorDishes: CreateOrUpdateDishResponse[];
  vendorDishesPagination: PaginationState;
  // Branch dishes
  branchDishes: CreateOrUpdateDishResponse[];
  branchDishesPagination: PaginationState;
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: unknown;
}

const initialState: DishState = {
  vendorDishes: [],
  vendorDishesPagination: { ...defaultPagination },
  branchDishes: [],
  branchDishesPagination: { ...defaultPagination },
  status: 'idle',
  error: null,
};

// ─── Thunks ───────────────────────────────────────────────

export const createDish = createAppAsyncThunk(
  'dish/createDish',
  async (
    payload: { data: CreateOrUpdateDishRequest; vendorId: number },
    { rejectWithValue }
  ) => {
    try {
      const response: CreateOrUpdateDishResponse =
        await axiosApi.dishApi.createDish(payload.data, payload.vendorId);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateDish = createAppAsyncThunk(
  'dish/updateDish',
  async (
    payload: { data: CreateOrUpdateDishRequest; dishId: number },
    { rejectWithValue }
  ) => {
    try {
      const response: CreateOrUpdateDishResponse =
        await axiosApi.dishApi.updateDish(payload.data, payload.dishId);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const deleteDish = createAppAsyncThunk(
  'dish/deleteDish',
  async (dishId: number, { rejectWithValue }) => {
    try {
      await axiosApi.dishApi.deleteDish(dishId);
      return dishId;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getDishesOfAVendor = createAppAsyncThunk(
  'dish/getDishesOfAVendor',
  async (
    payload: {
      vendorId: number;
      params: {
        pageNumber: number;
        pageSize: number;
        categoryId?: number;
        keyword?: string;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      const response: GetDishesOfAVendorResponse =
        await axiosApi.dishApi.getDishesOfAVendor(
          payload.vendorId,
          payload.params
        );
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getDishesByBranch = createAppAsyncThunk(
  'dish/getDishesByBranch',
  async (
    payload: {
      branchId: number;
      params: {
        pageNumber: number;
        pageSize: number;
        categoryId?: number;
        keyword?: string;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      const response: GetDishesByBranchResponse =
        await axiosApi.dishApi.getDishesByBranch(
          payload.branchId,
          payload.params
        );
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const assignDishToBranch = createAppAsyncThunk(
  'dish/assignDishToBranch',
  async (
    payload: { data: AssignOrUnassignDishToBranchRequest; branchId: number },
    { rejectWithValue }
  ) => {
    try {
      await axiosApi.dishApi.assignDishToBranch(payload.data, payload.branchId);
      return;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const unassignDishToBranch = createAppAsyncThunk(
  'dish/unassignDishToBranch',
  async (
    payload: { data: AssignOrUnassignDishToBranchRequest; branchId: number },
    { rejectWithValue }
  ) => {
    try {
      await axiosApi.dishApi.unassignDishToBranch(
        payload.data,
        payload.branchId
      );
      return;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateDishAvailabilityByBranch = createAppAsyncThunk(
  'dish/updateDishAvailabilityByBranch',
  async (
    payload: {
      data: UpdateDishAvailabilityByBranchRequest;
      dishId: number;
      branchId: number;
    },
    { rejectWithValue }
  ) => {
    try {
      await axiosApi.dishApi.updateDishAvailabilityByBranch(
        payload.data,
        payload.dishId,
        payload.branchId
      );
      return { dishId: payload.dishId, isSoldOut: payload.data.isSoldOut };
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// ─── Slice ────────────────────────────────────────────────

const allThunks = [
  createDish,
  updateDish,
  deleteDish,
  getDishesOfAVendor,
  getDishesByBranch,
  assignDishToBranch,
  unassignDishToBranch,
  updateDishAvailabilityByBranch,
] as const;

export const dishSlice = createSlice({
  name: 'dish',
  initialState,
  reducers: {
    resetDishState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(createDish.fulfilled, (state, action) => {
        if (action.payload) {
          state.vendorDishes.push(action.payload);
          state.vendorDishesPagination.totalCount += 1;
        }
      })
      .addCase(updateDish.fulfilled, (state, action) => {
        if (action.payload) {
          const vendorIdx = state.vendorDishes.findIndex(
            (d) => d.dishId === action.payload.dishId
          );
          if (vendorIdx > -1) {
            state.vendorDishes[vendorIdx] = action.payload;
          }
          const branchIdx = state.branchDishes.findIndex(
            (d) => d.dishId === action.payload.dishId
          );
          if (branchIdx > -1) {
            state.branchDishes[branchIdx] = action.payload;
          }
        }
      })
      .addCase(deleteDish.fulfilled, (state, action) => {
        if (action.payload) {
          state.vendorDishes = state.vendorDishes.filter(
            (d) => d.dishId !== action.payload
          );
          state.vendorDishesPagination.totalCount -= 1;
          state.branchDishes = state.branchDishes.filter(
            (d) => d.dishId !== action.payload
          );
          state.branchDishesPagination.totalCount -= 1;
        }
      })
      .addCase(getDishesOfAVendor.fulfilled, (state, action) => {
        state.vendorDishes = action.payload.items;
        state.vendorDishesPagination = {
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          totalPages: action.payload.totalPages,
          totalCount: action.payload.totalCount,
          hasPrevious: action.payload.hasPrevious,
          hasNext: action.payload.hasNext,
        };
      })
      .addCase(getDishesByBranch.fulfilled, (state, action) => {
        state.branchDishes = action.payload.items;
        state.branchDishesPagination = {
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          totalPages: action.payload.totalPages,
          totalCount: action.payload.totalCount,
          hasPrevious: action.payload.hasPrevious,
          hasNext: action.payload.hasNext,
        };
      })
      .addCase(updateDishAvailabilityByBranch.fulfilled, (state, action) => {
        if (action.payload) {
          const dish = state.branchDishes.find(
            (d) => d.dishId === action.payload?.dishId
          );
          if (dish) {
            dish.isSoldOut = action.payload.isSoldOut;
          }
        }
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

export const { resetDishState } = dishSlice.actions;

export default dishSlice.reducer;

// ─── Selectors ────────────────────────────────────────────

export const selectDishStatus = (
  state: RootState
): 'idle' | 'pending' | 'succeeded' | 'failed' => state.dish.status;

export const selectDishError = (state: RootState): unknown => state.dish.error;

export const selectVendorDishes = (
  state: RootState
): CreateOrUpdateDishResponse[] => state.dish.vendorDishes;

export const selectVendorDishesPagination = (
  state: RootState
): DishState['vendorDishesPagination'] => state.dish.vendorDishesPagination;

export const selectBranchDishes = (
  state: RootState
): CreateOrUpdateDishResponse[] => state.dish.branchDishes;

export const selectBranchDishesPagination = (
  state: RootState
): DishState['branchDishesPagination'] => state.dish.branchDishesPagination;
