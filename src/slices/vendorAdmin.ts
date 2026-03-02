import type { RootState } from '@app/store';
import type {
  AdminVendor,
  GetAllVendorsResponse,
  GetAllVendorsParams,
  VendorDetail,
} from '@features/admin/types/vendor';
import { createAppAsyncThunk } from '@hooks/reduxHooks';
import { axiosApi } from '@lib/api/apiInstance';
import {
  createSlice,
  isFulfilled,
  isPending,
  isRejected,
} from '@reduxjs/toolkit';

export interface VendorAdminState {
  vendors: AdminVendor[];
  selectedVendorDetail: VendorDetail | null;
  pagination: {
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

const initialState: VendorAdminState = {
  vendors: [],
  selectedVendorDetail: null,
  pagination: {
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

export const getAllVendors = createAppAsyncThunk(
  'vendorAdmin/getAllVendors',
  async (params: GetAllVendorsParams, { rejectWithValue }) => {
    try {
      const response: GetAllVendorsResponse =
        await axiosApi.vendorAdminApi.getAllVendors(params);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getActiveVendors = createAppAsyncThunk(
  'vendorAdmin/getActiveVendors',
  async (params: GetAllVendorsParams, { rejectWithValue }) => {
    try {
      const response: GetAllVendorsResponse =
        await axiosApi.vendorAdminApi.getActiveVendors(params);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const deleteVendor = createAppAsyncThunk(
  'vendorAdmin/deleteVendor',
  async (id: number, { rejectWithValue }) => {
    try {
      await axiosApi.vendorAdminApi.deleteVendor(id);
      return id;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const suspendVendor = createAppAsyncThunk(
  'vendorAdmin/suspendVendor',
  async (id: number, { rejectWithValue }) => {
    try {
      await axiosApi.vendorAdminApi.suspendVendor(id);
      return id;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const reactivateVendor = createAppAsyncThunk(
  'vendorAdmin/reactivateVendor',
  async (id: number, { rejectWithValue }) => {
    try {
      await axiosApi.vendorAdminApi.reactivateVendor(id);
      return id;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getVendorDetail = createAppAsyncThunk(
  'vendorAdmin/getVendorDetail',
  async (id: number, { rejectWithValue }) => {
    try {
      const response: VendorDetail =
        await axiosApi.vendorAdminApi.getVendorDetail(id);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const vendorAdminSlice = createSlice({
  name: 'vendorAdmin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllVendors.fulfilled, (state, action) => {
        state.vendors = action.payload.items;
        state.pagination = {
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          totalPages: action.payload.totalPages,
          totalCount: action.payload.totalCount,
          hasPrevious: action.payload.hasPrevious,
          hasNext: action.payload.hasNext,
        };
      })
      .addCase(getActiveVendors.fulfilled, (state, action) => {
        state.vendors = action.payload.items;
        state.pagination = {
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          totalPages: action.payload.totalPages,
          totalCount: action.payload.totalCount,
          hasPrevious: action.payload.hasPrevious,
          hasNext: action.payload.hasNext,
        };
      })
      .addCase(deleteVendor.fulfilled, (state, action) => {
        state.vendors = state.vendors.filter(
          (vendor) => vendor.vendorId !== action.payload
        );
      })
      .addCase(suspendVendor.fulfilled, (state, action) => {
        const vendor = state.vendors.find((v) => v.vendorId === action.payload);
        if (vendor) {
          vendor.isActive = false;
        }
      })
      .addCase(reactivateVendor.fulfilled, (state, action) => {
        const vendor = state.vendors.find((v) => v.vendorId === action.payload);
        if (vendor) {
          vendor.isActive = true;
        }
      })
      .addCase(getVendorDetail.fulfilled, (state, action) => {
        state.selectedVendorDetail = action.payload;
      })
      .addMatcher(
        isPending(
          getAllVendors,
          getActiveVendors,
          deleteVendor,
          suspendVendor,
          reactivateVendor,
          getVendorDetail
        ),
        (state) => {
          state.status = 'pending';
        }
      )
      .addMatcher(
        isFulfilled(
          getAllVendors,
          getActiveVendors,
          deleteVendor,
          suspendVendor,
          reactivateVendor,
          getVendorDetail
        ),
        (state) => {
          state.status = 'succeeded';
        }
      )
      .addMatcher(
        isRejected(
          getAllVendors,
          getActiveVendors,
          deleteVendor,
          suspendVendor,
          reactivateVendor,
          getVendorDetail
        ),
        (state, action) => {
          state.status = 'failed';
          state.error = action.payload;
        }
      );
  },
});

export const selectVendors = (state: RootState): AdminVendor[] =>
  state.vendorAdmin.vendors;
export const selectVendorsPagination = (
  state: RootState
): VendorAdminState['pagination'] => state.vendorAdmin.pagination;
export const selectVendorStatus = (
  state: RootState
): VendorAdminState['status'] => state.vendorAdmin.status;
export const selectVendorError = (
  state: RootState
): VendorAdminState['error'] => state.vendorAdmin.error;
export const selectVendorDetail = (state: RootState): VendorDetail | null =>
  state.vendorAdmin.selectedVendorDetail;

export default vendorAdminSlice.reducer;
