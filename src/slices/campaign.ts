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
  JoinSystemCampaignResponse,
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
  // Branch campaigns
  branchCampaigns: VendorCampaign[];
  branchTotalCount: number;
  // Joinable system campaigns for vendor branches
  joinableSystemCampaigns: VendorCampaign[];
  joinableSystemTotalCount: number;
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: unknown;
}

const initialState: CampaignState = {
  campaigns: [],
  totalCount: 0,
  vendorCampaigns: [],
  vendorTotalCount: 0,
  branchCampaigns: [],
  branchTotalCount: 0,
  joinableSystemCampaigns: [],
  joinableSystemTotalCount: 0,
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

export const getCampaignImage = createAppAsyncThunk(
  'campaign/getCampaignImage',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await axiosApi.campaignApi.getCampaignImage(id);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const postCampaignImage = createAppAsyncThunk(
  'campaign/postCampaignImage',
  async (payload: { id: number; data: FormData }, { rejectWithValue }) => {
    try {
      const response = await axiosApi.campaignApi.postCampaignImage(
        payload.id,
        payload.data
      );
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const deleteCampaignImage = createAppAsyncThunk(
  'campaign/deleteCampaignImage',
  async (id: number, { rejectWithValue }) => {
    try {
      await axiosApi.campaignApi.deleteCampaignImage(id);
      return undefined;
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

export const getBranchCampaigns = createAppAsyncThunk(
  'campaign/getBranchCampaigns',
  async (
    payload: { branchId: number; pageNumber: number; pageSize: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosApi.vendorCampaignApi.getBranchCampaigns(
        payload.branchId,
        payload.pageNumber,
        payload.pageSize
      );
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const createBranchCampaign = createAppAsyncThunk(
  'campaign/createBranchCampaign',
  async (
    payload: { branchId: number } & VendorCampaignCreate,
    { rejectWithValue }
  ) => {
    try {
      const { branchId, ...data } = payload;
      const response = await axiosApi.vendorCampaignApi.createBranchCampaign(
        branchId,
        data
      );
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getJoinableSystemCampaigns = createAppAsyncThunk(
  'campaign/getJoinableSystemCampaigns',
  async (
    payload: { pageNumber: number; pageSize: number },
    { rejectWithValue }
  ) => {
    try {
      const response =
        await axiosApi.vendorCampaignApi.getJoinableSystemCampaigns(
          payload.pageNumber,
          payload.pageSize
        );
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const joinBranchToSystemCampaign = createAppAsyncThunk(
  'campaign/joinBranchToSystemCampaign',
  async (
    payload: { branchId: number; campaignId: number },
    { rejectWithValue }
  ): Promise<
    JoinSystemCampaignResponse | ReturnType<typeof rejectWithValue>
  > => {
    try {
      const response =
        await axiosApi.vendorCampaignApi.joinBranchToSystemCampaign(
          payload.branchId,
          payload.campaignId
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
    const updateImageInLists = (
      state: CampaignState,
      campaignId: number,
      imageUrl: string | null
    ): void => {
      const lists: (Campaign[] | VendorCampaign[])[] = [
        state.campaigns,
        state.vendorCampaigns,
        state.branchCampaigns,
      ];
      lists.forEach((list) => {
        const index = list.findIndex((c) => c.campaignId === campaignId);
        if (index !== -1) {
          list[index].imageUrl = imageUrl;
        }
      });
    };

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
      .addCase(getCampaignImage.fulfilled, (state, action) => {
        const campaignId = action.meta.arg;
        const imageUrl = action.payload.length > 0 ? action.payload[0] : null;
        updateImageInLists(state, campaignId, imageUrl);
      })
      .addCase(postCampaignImage.fulfilled, (state, action) => {
        const { id: campaignId } = action.meta.arg;
        const imageUrl = action.payload;
        updateImageInLists(state, campaignId, imageUrl);
      })
      .addCase(deleteCampaignImage.fulfilled, (state, action) => {
        const campaignId = action.meta.arg;
        updateImageInLists(state, campaignId, null);
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
      .addCase(getBranchCampaigns.fulfilled, (state, action) => {
        state.branchCampaigns = action.payload.items;
        state.branchTotalCount = action.payload.totalCount;
      })
      .addCase(createBranchCampaign.fulfilled, (state, action) => {
        if (action.payload) {
          state.branchCampaigns.unshift(action.payload);
          state.branchTotalCount += 1;
        }
      })
      .addCase(getJoinableSystemCampaigns.fulfilled, (state, action) => {
        state.joinableSystemCampaigns = action.payload.items;
        state.joinableSystemTotalCount = action.payload.totalCount;
      })
      .addCase(joinBranchToSystemCampaign.fulfilled, (state, action) => {
        if (!action.payload?.success) {
          return;
        }

        const joinedCampaignId = action.meta.arg.campaignId;
        const joinedCampaign = state.joinableSystemCampaigns.find(
          (campaign) => campaign.campaignId === joinedCampaignId
        );

        state.joinableSystemCampaigns = state.joinableSystemCampaigns.filter(
          (campaign) => campaign.campaignId !== joinedCampaignId
        );
        state.joinableSystemTotalCount = Math.max(
          0,
          state.joinableSystemTotalCount - 1
        );

        if (!joinedCampaign) {
          return;
        }

        const existedIndex = state.branchCampaigns.findIndex(
          (campaign) => campaign.campaignId === joinedCampaignId
        );

        if (existedIndex === -1) {
          state.branchCampaigns.unshift(joinedCampaign);
          state.branchTotalCount += 1;
        }
      })
      .addMatcher(
        isPending(
          getAllCampaigns,
          createCampaign,
          updateCampaign,
          getVendorCampaigns,
          createVendorCampaign,
          updateVendorCampaign,
          getBranchCampaigns,
          createBranchCampaign,
          getJoinableSystemCampaigns,
          joinBranchToSystemCampaign,
          getCampaignImage,
          postCampaignImage,
          deleteCampaignImage
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
          updateVendorCampaign,
          getBranchCampaigns,
          createBranchCampaign,
          getJoinableSystemCampaigns,
          joinBranchToSystemCampaign,
          getCampaignImage,
          postCampaignImage,
          deleteCampaignImage
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
          updateVendorCampaign,
          getBranchCampaigns,
          createBranchCampaign,
          getJoinableSystemCampaigns,
          joinBranchToSystemCampaign,
          getCampaignImage,
          postCampaignImage,
          deleteCampaignImage
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

export const selectBranchCampaigns = (state: RootState): VendorCampaign[] =>
  state.campaign.branchCampaigns;

export const selectBranchCampaignTotalCount = (state: RootState): number =>
  state.campaign.branchTotalCount;

export const selectJoinableSystemCampaigns = (
  state: RootState
): VendorCampaign[] => state.campaign.joinableSystemCampaigns;

export const selectJoinableSystemCampaignTotalCount = (
  state: RootState
): number => state.campaign.joinableSystemTotalCount;

export default campaignSlice.reducer;
