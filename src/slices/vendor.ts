import type { RootState } from '@app/store';
import type {
  VendorRegistrationRequest,
  VendorRegistrationResponse,
  SubmitLicenseResponse,
  GetMyVendorResponse,
  SubmitImagesResponse,
  GetImagesResponse,
  CreateOrUpdateBranchResponse,
  Branch,
  UpdateVendorNameRequest,
  UpdateVendorNameResponse,
} from '@features/vendor/types/vendor';
import type {
  WorkSchedule,
  WorkScheduleResponse,
  DayOff,
  DayOffResponse,
} from '@features/vendor/types/workSchedule';
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
import type { CheckLicenseStatusResponse } from '@features/vendor/types/vendor';

export interface VendorState {
  vendorId: number | null;
  branchId: number | null;
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: unknown;
  myVendor: GetMyVendorResponse | null;
  licenseStatus: CheckLicenseStatusResponse | null;
  images: GetImagesResponse | null;
  // Admin
  adminVendors: AdminVendor[];
  selectedVendorDetail: VendorDetail | null;
  adminPagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
    hasPrevious: boolean;
    hasNext: boolean;
  };
  adminStatus: 'idle' | 'pending' | 'succeeded' | 'failed';
  adminError: unknown;
}

const initialState: VendorState = {
  vendorId: null,
  branchId: null,
  status: 'idle',
  error: null,
  myVendor: null,
  licenseStatus: null,
  images: null,
  // Admin
  adminVendors: [],
  selectedVendorDetail: null,
  adminPagination: {
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
    totalCount: 0,
    hasPrevious: false,
    hasNext: false,
  },
  adminStatus: 'idle',
  adminError: null,
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

export const submitImages = createAppAsyncThunk(
  'vendor/submitImages',
  async (
    payload: { branchId: number; images: File[] },
    { rejectWithValue }
  ) => {
    try {
      const response: SubmitImagesResponse[] =
        await axiosApi.vendorApi.submitImages(payload.branchId, payload.images);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getImages = createAppAsyncThunk(
  'vendor/getImages',
  async (
    payload: {
      branchId: number;
      params: { pageNumber: number; pageSize: number };
    },
    { rejectWithValue }
  ) => {
    try {
      const response: GetImagesResponse = await axiosApi.vendorApi.getImages(
        payload.branchId,
        payload.params
      );
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const createBranch = createAppAsyncThunk(
  'vendor/createBranch',
  async (
    payload: { vendorId: number; data: VendorRegistrationRequest },
    { rejectWithValue }
  ) => {
    try {
      const response: CreateOrUpdateBranchResponse =
        await axiosApi.vendorApi.createBranch(payload.vendorId, payload.data);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateBranch = createAppAsyncThunk(
  'vendor/updateBranch',
  async (
    payload: { branchId: number; data: VendorRegistrationRequest },
    { rejectWithValue }
  ) => {
    try {
      const response: CreateOrUpdateBranchResponse =
        await axiosApi.vendorApi.updateBranch(payload.branchId, payload.data);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const deleteBranch = createAppAsyncThunk(
  'vendor/deleteBranch',
  async (branchId: number, { rejectWithValue }) => {
    try {
      await axiosApi.vendorApi.deleteBranch(branchId);
      return branchId;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateVendorName = createAppAsyncThunk(
  'vendor/updateVendorName',
  async (payload: UpdateVendorNameRequest, { rejectWithValue }) => {
    try {
      const response: UpdateVendorNameResponse =
        await axiosApi.vendorApi.updateVendorName(payload);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// ─── Admin Thunks ─────────────────────────────────────────

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

export const vendorSlice = createSlice({
  name: 'vendor',
  initialState,
  reducers: {
    resetVendorState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // ─── Vendor Cases ────────────────────────────────────
      .addCase(registerVendor.fulfilled, (state, action) => {
        state.vendorId = action.payload.vendorId;
        state.branchId = action.payload.branches[0]?.branchId;
        state.myVendor = action.payload;
      })
      .addCase(submitLicense.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(getMyVendor.fulfilled, (state, action) => {
        state.myVendor = action.payload;
      })
      .addCase(checkLicenseStatus.fulfilled, (state, action) => {
        state.licenseStatus = action.payload;
      })
      .addCase(submitImages.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(getImages.fulfilled, (state, action) => {
        state.images = action.payload;
      })
      .addCase(deleteBranch.fulfilled, (state, action) => {
        if (state.myVendor) {
          state.myVendor.branches = state.myVendor.branches.filter(
            (b) => b.branchId !== action.payload
          );
        }
      })
      .addCase(createBranch.fulfilled, (state, action) => {
        if (state.myVendor && action.payload) {
          state.myVendor.branches.push(action.payload as unknown as Branch);
        }
      })
      .addCase(updateBranch.fulfilled, (state, action) => {
        if (state.myVendor && action.payload) {
          const branchIndex = state.myVendor.branches.findIndex(
            (b) => b.branchId === action.payload.branchId
          );
          if (branchIndex > -1) {
            state.myVendor.branches[branchIndex] =
              action.payload as unknown as Branch;
          }
        }
      })
      .addCase(updateVendorName.fulfilled, (state, action) => {
        if (state.myVendor) {
          state.myVendor.name = action.payload.name;
        }
      })
      // ─── Admin Cases ─────────────────────────────────────
      .addCase(getAllVendors.fulfilled, (state, action) => {
        state.adminVendors = action.payload.items;
        state.adminPagination = {
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          totalPages: action.payload.totalPages,
          totalCount: action.payload.totalCount,
          hasPrevious: action.payload.hasPrevious,
          hasNext: action.payload.hasNext,
        };
      })
      .addCase(getActiveVendors.fulfilled, (state, action) => {
        state.adminVendors = action.payload.items;
        state.adminPagination = {
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          totalPages: action.payload.totalPages,
          totalCount: action.payload.totalCount,
          hasPrevious: action.payload.hasPrevious,
          hasNext: action.payload.hasNext,
        };
      })
      .addCase(deleteVendor.fulfilled, (state, action) => {
        state.adminVendors = state.adminVendors.filter(
          (vendor) => vendor.vendorId !== action.payload
        );
      })
      .addCase(suspendVendor.fulfilled, (state, action) => {
        const vendor = state.adminVendors.find(
          (v) => v.vendorId === action.payload
        );
        if (vendor) {
          vendor.isActive = false;
        }
      })
      .addCase(reactivateVendor.fulfilled, (state, action) => {
        const vendor = state.adminVendors.find(
          (v) => v.vendorId === action.payload
        );
        if (vendor) {
          vendor.isActive = true;
        }
      })
      .addCase(getVendorDetail.fulfilled, (state, action) => {
        state.selectedVendorDetail = action.payload;
      })
      // ─── Vendor Matchers ─────────────────────────────────
      .addMatcher(
        isPending(
          registerVendor,
          submitLicense,
          getMyVendor,
          checkLicenseStatus,
          submitWorkSchedule,
          submitDayOff,
          submitImages,
          getImages,
          createBranch,
          updateBranch,
          deleteBranch,
          updateVendorName
        ),
        (state) => {
          state.status = 'pending';
          state.error = null;
        }
      )
      .addMatcher(
        isRejected(
          registerVendor,
          submitLicense,
          getMyVendor,
          checkLicenseStatus,
          submitWorkSchedule,
          submitDayOff,
          submitImages,
          getImages,
          createBranch,
          updateBranch,
          deleteBranch,
          updateVendorName
        ),
        (state, action) => {
          state.status = 'failed';
          state.error = (action as { payload?: unknown }).payload ?? {
            message: 'An error occurred',
          };
        }
      )
      .addMatcher(
        isFulfilled(
          registerVendor,
          submitLicense,
          getMyVendor,
          checkLicenseStatus,
          submitWorkSchedule,
          submitDayOff,
          submitImages,
          getImages,
          createBranch,
          updateBranch,
          deleteBranch,
          updateVendorName
        ),
        (state) => {
          state.status = 'succeeded';
        }
      )
      // ─── Admin Matchers ──────────────────────────────────
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
          state.adminStatus = 'pending';
          state.adminError = null;
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
          state.adminStatus = 'succeeded';
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
          state.adminStatus = 'failed';
          state.adminError = action.payload;
        }
      );
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

export const selectImages = (state: RootState): GetImagesResponse | null =>
  state.vendor.images;

// ─── Admin Selectors ──────────────────────────────────────

export const selectAdminVendors = (state: RootState): AdminVendor[] =>
  state.vendor.adminVendors;

export const selectAdminVendorsPagination = (
  state: RootState
): VendorState['adminPagination'] => state.vendor.adminPagination;

export const selectAdminVendorStatus = (
  state: RootState
): VendorState['adminStatus'] => state.vendor.adminStatus;

export const selectAdminVendorError = (state: RootState): unknown =>
  state.vendor.adminError;

export const selectAdminVendorDetail = (
  state: RootState
): VendorDetail | null => state.vendor.selectedVendorDetail;
