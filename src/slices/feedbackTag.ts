import type { RootState } from '@app/store';
import type {
  FeedbackTag,
  CreateOrUpdateFeedbackTagRequest,
} from '@features/admin/types/feedbackTag';
import { createAppAsyncThunk } from '@hooks/reduxHooks';
import { axiosApi } from '@lib/api/apiInstance';
import {
  createSlice,
  isFulfilled,
  isPending,
  isRejected,
} from '@reduxjs/toolkit';

export interface FeedbackTagState {
  feedbackTags: FeedbackTag[];
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: unknown;
}

const initialState: FeedbackTagState = {
  feedbackTags: [],
  status: 'idle',
  error: null,
};

export const getAllFeedbackTags = createAppAsyncThunk(
  'feedbackTag/getAllFeedbackTags',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosApi.feedbackTagApi.getAllFeedbackTags();
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const createFeedbackTag = createAppAsyncThunk(
  'feedbackTag/createFeedbackTag',
  async (payload: CreateOrUpdateFeedbackTagRequest, { rejectWithValue }) => {
    try {
      const response = await axiosApi.feedbackTagApi.createFeedbackTag(payload);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateFeedbackTag = createAppAsyncThunk(
  'feedbackTag/updateFeedbackTag',
  async (
    payload: { id: number } & CreateOrUpdateFeedbackTagRequest,
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosApi.feedbackTagApi.updateFeedbackTag(
        payload.id,
        payload
      );
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const deleteFeedbackTag = createAppAsyncThunk(
  'feedbackTag/deleteFeedbackTag',
  async (id: number, { rejectWithValue }) => {
    try {
      await axiosApi.feedbackTagApi.deleteFeedbackTag(id);
      return id;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const feedbackTagSlice = createSlice({
  name: 'feedbackTag',
  initialState,
  reducers: {
    resetFeedbackTagState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllFeedbackTags.fulfilled, (state, action) => {
        state.feedbackTags = action.payload;
      })
      .addCase(createFeedbackTag.fulfilled, (state, action) => {
        if (action.payload) {
          state.feedbackTags.push(action.payload);
        }
      })
      .addCase(updateFeedbackTag.fulfilled, (state, action) => {
        if (action.payload) {
          const tag = action.payload;
          const index = state.feedbackTags.findIndex(
            (t) => t.tagId === tag.tagId
          );
          if (index !== -1) {
            state.feedbackTags[index] = tag;
          }
        }
      })
      .addCase(deleteFeedbackTag.fulfilled, (state, action) => {
        if (action.payload) {
          state.feedbackTags = state.feedbackTags.map((tag) =>
            tag.tagId === action.payload
              ? {
                  ...tag,
                  isActive: !(tag.isActive ?? false),
                }
              : tag
          );
        }
      })
      .addMatcher(
        isPending(
          getAllFeedbackTags,
          createFeedbackTag,
          updateFeedbackTag,
          deleteFeedbackTag
        ),
        (state) => {
          state.status = 'pending';
        }
      )
      .addMatcher(
        isFulfilled(
          getAllFeedbackTags,
          createFeedbackTag,
          updateFeedbackTag,
          deleteFeedbackTag
        ),
        (state) => {
          state.status = 'succeeded';
          state.error = null;
        }
      )
      .addMatcher(
        isRejected(
          getAllFeedbackTags,
          createFeedbackTag,
          updateFeedbackTag,
          deleteFeedbackTag
        ),
        (state, action) => {
          state.status = 'failed';
          state.error = action.payload;
        }
      );
  },
});

export const { resetFeedbackTagState } = feedbackTagSlice.actions;

export const selectFeedbackTagStatus = (
  state: RootState
): 'idle' | 'pending' | 'succeeded' | 'failed' => state.feedbackTag.status;

export const selectFeedbackTags = (state: RootState): FeedbackTag[] =>
  state.feedbackTag.feedbackTags;

export default feedbackTagSlice.reducer;
