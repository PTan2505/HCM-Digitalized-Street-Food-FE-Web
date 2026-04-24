import type { RootState } from '@app/store';
import type { Tier } from '@features/admin/types/tier';
import { createAppAsyncThunk } from '@hooks/reduxHooks';
import { axiosApi } from '@lib/api/apiInstance';
import {
  createSlice,
  isFulfilled,
  isPending,
  isRejected,
} from '@reduxjs/toolkit';

export interface TierState {
  tiers: Tier[];
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: unknown;
}

const initialState: TierState = {
  tiers: [],
  status: 'idle',
  error: null,
};

export const getAllTiers = createAppAsyncThunk(
  'tier/getAllTiers',
  async (_, { rejectWithValue }) => {
    try {
      const response: Tier[] = await axiosApi.tierApi.getTiers();
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const tierSlice = createSlice({
  name: 'tier',
  initialState,
  reducers: {
    resetTierState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllTiers.fulfilled, (state, action) => {
        state.tiers = action.payload;
      })
      .addMatcher(isPending(getAllTiers), (state) => {
        state.status = 'pending';
      })
      .addMatcher(isFulfilled(getAllTiers), (state) => {
        state.status = 'succeeded';
        state.error = null;
      })
      .addMatcher(isRejected(getAllTiers), (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { resetTierState } = tierSlice.actions;

export const selectTierStatus = (
  state: RootState
): 'idle' | 'pending' | 'succeeded' | 'failed' => state.tier.status;

export const selectTiers = (state: RootState): Tier[] => state.tier.tiers;

export default tierSlice.reducer;
