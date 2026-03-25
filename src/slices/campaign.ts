import type { RootState } from '@app/store';
import type {
  Campaign,
  CampaignCreate,
  CampaignUpdate,
} from '@features/admin/types/campaign';
import { createAppAsyncThunk } from '@hooks/reduxHooks';
import { axiosApi } from '@lib/api/apiInstance';
import {
  createSlice,
  isFulfilled,
  isPending,
  isRejected,
} from '@reduxjs/toolkit';

export interface CampaignState {
  campaigns: Campaign[];
  totalCount: number;
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: unknown;
}

const initialState: CampaignState = {
  campaigns: [],
  totalCount: 0,
  status: 'idle',
  error: null,
};

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

export const campaignSlice = createSlice({
  name: 'campaign',
  initialState,
  reducers: {
    resetCampaignState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
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
      .addMatcher(
        isPending(getAllCampaigns, createCampaign, updateCampaign),
        (state) => {
          state.status = 'pending';
        }
      )
      .addMatcher(
        isFulfilled(getAllCampaigns, createCampaign, updateCampaign),
        (state) => {
          state.status = 'succeeded';
          state.error = null;
        }
      )
      .addMatcher(
        isRejected(getAllCampaigns, createCampaign, updateCampaign),
        (state, action) => {
          state.status = 'failed';
          state.error = action.payload;
        }
      );
  },
});

export const { resetCampaignState } = campaignSlice.actions;

export const selectCampaignStatus = (
  state: RootState
): 'idle' | 'pending' | 'succeeded' | 'failed' => state.campaign.status;

export const selectCampaigns = (state: RootState): Campaign[] =>
  state.campaign.campaigns;

export const selectCampaignTotalCount = (state: RootState): number =>
  state.campaign.totalCount;

export default campaignSlice.reducer;
