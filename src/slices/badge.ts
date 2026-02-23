import type { RootState } from '@app/store';
import type {
  Badge,
  CreateOrUpdateBadgeRequest,
  CreateOrUpdateBadgeResponse,
  UserWithBadges,
  AwardOrRevokeBadgeRequest,
  AwardOrRevokeBadgeResponse,
} from '@features/admin/types/badge';
import { createAppAsyncThunk } from '@hooks/reduxHooks';
import { axiosApi } from '@lib/api/apiInstance';
import {
  createSlice,
  isFulfilled,
  isPending,
  isRejected,
} from '@reduxjs/toolkit';

export interface BadgeState {
  badges: Badge[];
  usersWithBadges: UserWithBadges[];
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: unknown;
}

const initialState: BadgeState = {
  badges: [],
  usersWithBadges: [],
  status: 'idle',
  error: null,
};

export const getAllBadges = createAppAsyncThunk(
  'badge/getAllBadges',
  async (_, { rejectWithValue }) => {
    try {
      const response: Badge[] = await axiosApi.badgeApi.getAllBadges();
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const createBadge = createAppAsyncThunk(
  'badge/createBadge',
  async (payload: CreateOrUpdateBadgeRequest, { rejectWithValue }) => {
    try {
      const response: CreateOrUpdateBadgeResponse =
        await axiosApi.badgeApi.createBadge(payload);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateBadge = createAppAsyncThunk(
  'badge/updateBadge',
  async (
    payload: { id: number } & CreateOrUpdateBadgeRequest,
    { rejectWithValue }
  ) => {
    try {
      const response: CreateOrUpdateBadgeResponse =
        await axiosApi.badgeApi.updateBadge(payload.id, payload);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const deleteBadge = createAppAsyncThunk(
  'badge/deleteBadge',
  async (id: number, { rejectWithValue }) => {
    try {
      await axiosApi.badgeApi.deleteBadge(id);
      return id;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getUsersWithBadges = createAppAsyncThunk(
  'badge/getUsersWithBadges',
  async (_, { rejectWithValue }) => {
    try {
      const response: UserWithBadges[] =
        await axiosApi.badgeApi.getUsersWithBadges();
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const awardBadgeToUser = createAppAsyncThunk(
  'badge/awardBadgeToUser',
  async (payload: AwardOrRevokeBadgeRequest, { rejectWithValue }) => {
    try {
      const response: AwardOrRevokeBadgeResponse =
        await axiosApi.badgeApi.awardBadgeToUser(payload);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const revokeBadgeFromUser = createAppAsyncThunk(
  'badge/revokeBadgeFromUser',
  async (payload: AwardOrRevokeBadgeRequest, { rejectWithValue }) => {
    try {
      await axiosApi.badgeApi.revokeBadgeFromUser(payload);
      return payload;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const badgeSlice = createSlice({
  name: 'badge',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllBadges.fulfilled, (state, action) => {
        state.badges = action.payload;
      })
      .addCase(createBadge.fulfilled, (state, action) => {
        if (action.payload) {
          state.badges.push(action.payload as unknown as Badge);
        }
      })
      .addCase(updateBadge.fulfilled, (state, action) => {
        if (action.payload) {
          const responseData = action.payload as unknown as { badge: Badge };
          const badge = responseData.badge;
          const index = state.badges.findIndex(
            (b) => b.badgeId === badge.badgeId
          );
          if (index !== -1) {
            state.badges[index] = badge;
          }
        }
      })
      .addCase(deleteBadge.fulfilled, (state, action) => {
        if (action.payload) {
          state.badges = state.badges.filter(
            (badge) => badge.badgeId !== action.payload
          );
        }
      })
      .addCase(getUsersWithBadges.fulfilled, (state, action) => {
        state.usersWithBadges = action.payload;
      })
      .addCase(awardBadgeToUser.fulfilled, (state, action) => {
        if (action.payload) {
          const { userId, badgeId, createdAt } = action.payload as unknown as {
            userId: number;
            badgeId: number;
            createdAt: string;
          };
          const user = state.usersWithBadges.find((u) => u.userId === userId);
          const badge = state.badges.find((b) => b.badgeId === badgeId);
          if (user && badge) {
            user.badges.push({
              ...badge,
              isEarned: true,
              earnedAt: createdAt,
            });
          }
        }
      })
      .addCase(revokeBadgeFromUser.fulfilled, (state, action) => {
        if (action.payload) {
          const { userId, badgeId } = action.payload;
          const user = state.usersWithBadges.find((u) => u.userId === userId);
          if (user) {
            user.badges = user.badges.filter((b) => b.badgeId !== badgeId);
          }
        }
      })
      .addMatcher(
        isPending(
          getAllBadges,
          createBadge,
          updateBadge,
          deleteBadge,
          getUsersWithBadges,
          awardBadgeToUser,
          revokeBadgeFromUser
        ),
        (state) => {
          state.status = 'pending';
        }
      )
      .addMatcher(
        isFulfilled(
          getAllBadges,
          createBadge,
          updateBadge,
          deleteBadge,
          getUsersWithBadges,
          awardBadgeToUser,
          revokeBadgeFromUser
        ),
        (state) => {
          state.status = 'succeeded';
          state.error = null;
        }
      )
      .addMatcher(
        isRejected(
          getAllBadges,
          createBadge,
          updateBadge,
          deleteBadge,
          getUsersWithBadges,
          awardBadgeToUser,
          revokeBadgeFromUser
        ),
        (state, action) => {
          state.status = 'failed';
          state.error = action.payload;
        }
      );
  },
});

export const selectBadgeStatus = (
  state: RootState
): 'idle' | 'pending' | 'succeeded' | 'failed' => state.badge.status;

export const selectBadges = (state: RootState): Badge[] => state.badge.badges;

export const selectUsersWithBadges = (state: RootState): UserWithBadges[] =>
  state.badge.usersWithBadges;

export default badgeSlice.reducer;
