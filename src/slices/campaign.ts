import type { RootState } from '@app/store';
import type {
  Campaign,
  CampaignCreate,
  CampaignUpdate,
} from '@features/admin/types/campaign';
import type {
  VendorCampaign,
  VendorCampaignCreate,
  VendorCampaignUpdate,
} from '@features/vendor/types/campaign';
import { createAppAsyncThunk } from '@hooks/reduxHooks';
import { axiosApi } from '@lib/api/apiInstance';
import {
  createSlice,
  isFulfilled,
  isPending,
  isRejected,
} from '@reduxjs/toolkit';

export interface CampaignState {
  // Admin system campaigns
  campaigns: Campaign[];
  totalCount: number;
  // Vendor campaigns
  vendorCampaigns: VendorCampaign[];
  vendorTotalCount: number;
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: unknown;
}

const initialState: CampaignState = {
  campaigns: [],
  totalCount: 0,
  vendorCampaigns: [],
  vendorTotalCount: 0,
  status: 'idle',
  error: null,
};

// ── Admin Campaign Thunks ────────────────────────────────────────────────────

export const getAllCampaigns = createAppAsyncThunk(
  'campaign/getAllCampaigns',
  async (
    payload: { pageNumber: number; pageSize: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosApi.campaignApi.getCampaigns(
        payload.pageNumber,
        payload.pageSize
      );
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const createCampaign = createAppAsyncThunk(
  'campaign/createCampaign',
  async (payload: CampaignCreate, { rejectWithValue }) => {
    try {
      const response = await axiosApi.campaignApi.createCampaign(payload);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateCampaign = createAppAsyncThunk(
  'campaign/updateCampaign',
  async (payload: { id: number } & CampaignUpdate, { rejectWithValue }) => {
    try {
      const response = await axiosApi.campaignApi.updateCampaign(
        payload.id,
        payload
      );
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// ── Vendor Campaign Thunks ───────────────────────────────────────────────────

export const getVendorCampaigns = createAppAsyncThunk(
  'campaign/getVendorCampaigns',
  async (
    payload: { pageNumber: number; pageSize: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosApi.vendorCampaignApi.getVendorCampaigns(
        payload.pageNumber,
        payload.pageSize
      );
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const createVendorCampaign = createAppAsyncThunk(
  'campaign/createVendorCampaign',
  async (payload: VendorCampaignCreate, { rejectWithValue }) => {
    try {
      const response =
        await axiosApi.vendorCampaignApi.createVendorCampaign(payload);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateVendorCampaign = createAppAsyncThunk(
  'campaign/updateVendorCampaign',
  async (
    payload: { id: number } & VendorCampaignUpdate,
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosApi.vendorCampaignApi.updateVendorCampaign(
        payload.id,
        payload
      );
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const campaignSlice = createSlice({
  name: 'campaign',
  initialState,
  reducers: {
    resetCampaignState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // ── Admin cases ────────────────────────────────────────────────────────
      .addCase(getAllCampaigns.fulfilled, (state, action) => {
        state.campaigns = action.payload.items;
        state.totalCount = action.payload.totalCount;
      })
      .addCase(createCampaign.fulfilled, (state, action) => {
        if (action.payload) {
          state.campaigns.unshift(action.payload);
          state.totalCount += 1;
        }
      })
      .addCase(updateCampaign.fulfilled, (state, action) => {
        if (action.payload) {
          const campaign = action.payload;
          const index = state.campaigns.findIndex(
            (c) => c.campaignId === campaign.campaignId
          );
          if (index !== -1) {
            state.campaigns[index] = campaign;
          }
        }
      })
      // ── Vendor cases ───────────────────────────────────────────────────────
      .addCase(getVendorCampaigns.fulfilled, (state, action) => {
        state.vendorCampaigns = action.payload.items;
        state.vendorTotalCount = action.payload.totalCount;
      })
      .addCase(createVendorCampaign.fulfilled, (state, action) => {
        if (action.payload) {
          state.vendorCampaigns.unshift(action.payload);
          state.vendorTotalCount += 1;
        }
      })
      .addCase(updateVendorCampaign.fulfilled, (state, action) => {
        if (action.payload) {
          const campaign = action.payload;
          const index = state.vendorCampaigns.findIndex(
            (c) => c.campaignId === campaign.campaignId
          );
          if (index !== -1) {
            state.vendorCampaigns[index] = campaign;
          }
        }
      })
      .addMatcher(
        isPending(
          getAllCampaigns,
          createCampaign,
          updateCampaign,
          getVendorCampaigns,
          createVendorCampaign,
          updateVendorCampaign
        ),
        (state) => {
          state.status = 'pending';
        }
      )
      .addMatcher(
        isFulfilled(
          getAllCampaigns,
          createCampaign,
          updateCampaign,
          getVendorCampaigns,
          createVendorCampaign,
          updateVendorCampaign
        ),
        (state) => {
          state.status = 'succeeded';
          state.error = null;
        }
      )
      .addMatcher(
        isRejected(
          getAllCampaigns,
          createCampaign,
          updateCampaign,
          getVendorCampaigns,
          createVendorCampaign,
          updateVendorCampaign
        ),
        (state, action) => {
          state.status = 'failed';
          state.error = action.payload;
        }
      );
  },
});

export const { resetCampaignState } = campaignSlice.actions;

// Admin selectors
export const selectCampaignStatus = (
  state: RootState
): 'idle' | 'pending' | 'succeeded' | 'failed' => state.campaign.status;

export const selectCampaigns = (state: RootState): Campaign[] =>
  state.campaign.campaigns;

export const selectCampaignTotalCount = (state: RootState): number =>
  state.campaign.totalCount;

// Vendor selectors
export const selectVendorCampaigns = (state: RootState): VendorCampaign[] =>
  state.campaign.vendorCampaigns;

export const selectVendorCampaignTotalCount = (state: RootState): number =>
  state.campaign.vendorTotalCount;

export default campaignSlice.reducer;
