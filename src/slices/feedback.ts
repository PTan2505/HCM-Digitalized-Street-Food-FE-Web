import type { RootState } from '@app/store';
import type {
  BranchFeedbackResponse,
  GetFeedbacksByBranchResponse,
  GetFeedbacksByBranchParams,
  RawBranchFeedbackResponse,
  ReplyFeedbackRequest,
  GetFeedbackDetailsResponse,
} from '@features/vendor/types/feedback';
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

export interface FeedbackState {
  feedbacks: BranchFeedbackResponse[];
  pagination: PaginationState;
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: unknown;
  selectedFeedback: GetFeedbackDetailsResponse | null;
}

const initialState: FeedbackState = {
  feedbacks: [],
  pagination: { ...defaultPagination },
  status: 'idle',
  error: null,
  selectedFeedback: null,
};

const normalizeReply = (
  vendorReply?: RawBranchFeedbackResponse['vendorReply']
): { content: string | null; repliedAt: string | null } => {
  if (typeof vendorReply === 'string') {
    return { content: vendorReply, repliedAt: null };
  }

  if (!vendorReply || typeof vendorReply !== 'object') {
    return { content: null, repliedAt: null };
  }

  return {
    content:
      typeof vendorReply.content === 'string' ? vendorReply.content : null,
    repliedAt:
      typeof vendorReply.updatedAt === 'string'
        ? vendorReply.updatedAt
        : typeof vendorReply.createdAt === 'string'
          ? vendorReply.createdAt
          : null,
  };
};

const mapRawFeedback = (
  item: RawBranchFeedbackResponse,
  branchId: number
): BranchFeedbackResponse => {
  const reply = normalizeReply(item.vendorReply);

  return {
    feedbackId: item.id,
    branchId: item.branchId ?? branchId,
    userId: item.user?.id,
    userName:
      item.user?.name && item.user.name.trim() !== ''
        ? item.user.name
        : 'Ẩn danh',
    avatarUrl: item.user?.avatar ?? null,
    rating: item.rating,
    comment: item.comment,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    replyContent: reply.content,
    repliedAt: reply.repliedAt,
  };
};

export const getFeedbacksByBranch = createAppAsyncThunk(
  'feedback/getFeedbacksByBranch',
  async (
    payload: { branchId: number; params: GetFeedbacksByBranchParams },
    { rejectWithValue }
  ) => {
    try {
      const response: GetFeedbacksByBranchResponse =
        await axiosApi.feedbackApi.getFeedbacksByBranch(
          payload.branchId,
          payload.params
        );
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const createFeedbackReply = createAppAsyncThunk(
  'feedback/createFeedbackReply',
  async (
    payload: { feedbackId: number; data: ReplyFeedbackRequest },
    { rejectWithValue }
  ) => {
    try {
      await axiosApi.feedbackApi.createReply(payload.feedbackId, payload.data);
      return payload;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateFeedbackReply = createAppAsyncThunk(
  'feedback/updateFeedbackReply',
  async (
    payload: { feedbackId: number; data: ReplyFeedbackRequest },
    { rejectWithValue }
  ) => {
    try {
      await axiosApi.feedbackApi.updateReply(payload.feedbackId, payload.data);
      return payload;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const deleteFeedbackReply = createAppAsyncThunk(
  'feedback/deleteFeedbackReply',
  async (feedbackId: number, { rejectWithValue }) => {
    try {
      await axiosApi.feedbackApi.deleteReply(feedbackId);
      return feedbackId;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getFeedbackDetails = createAppAsyncThunk(
  'feedback/getFeedbackDetails',
  async (feedbackId: number, { rejectWithValue }) => {
    try {
      const response =
        await axiosApi.feedbackApi.getFeedbackDetails(feedbackId);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const allThunks = [
  getFeedbacksByBranch,
  createFeedbackReply,
  updateFeedbackReply,
  deleteFeedbackReply,
  getFeedbackDetails,
] as const;

const feedbackSlice = createSlice({
  name: 'feedback',
  initialState,
  reducers: {
    resetFeedbackState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getFeedbacksByBranch.fulfilled, (state, action) => {
        state.feedbacks = action.payload.items.map((item) =>
          mapRawFeedback(item, action.meta.arg.branchId)
        );
        state.pagination = {
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          totalPages: action.payload.totalPages,
          totalCount: action.payload.totalCount,
          hasPrevious: action.payload.hasPrevious,
          hasNext: action.payload.hasNext,
        };
      })
      .addCase(getFeedbackDetails.fulfilled, (state, action) => {
        state.selectedFeedback = action.payload;
      })
      .addCase(createFeedbackReply.fulfilled, (state, action) => {
        const feedback = state.feedbacks.find(
          (item) => item.feedbackId === action.payload.feedbackId
        );
        if (feedback) {
          feedback.replyContent = action.payload.data.content;
          feedback.repliedAt = new Date().toISOString();
        }
      })
      .addCase(updateFeedbackReply.fulfilled, (state, action) => {
        const feedback = state.feedbacks.find(
          (item) => item.feedbackId === action.payload.feedbackId
        );
        if (feedback) {
          feedback.replyContent = action.payload.data.content;
          feedback.repliedAt = new Date().toISOString();
        }
      })
      .addCase(deleteFeedbackReply.fulfilled, (state, action) => {
        const feedback = state.feedbacks.find(
          (item) => item.feedbackId === action.payload
        );
        if (feedback) {
          feedback.replyContent = null;
          feedback.repliedAt = null;
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

export const { resetFeedbackState } = feedbackSlice.actions;

export default feedbackSlice.reducer;

export const selectFeedbackStatus = (
  state: RootState
): 'idle' | 'pending' | 'succeeded' | 'failed' => state.feedback.status;

export const selectFeedbackError = (state: RootState): unknown =>
  state.feedback.error;

export const selectBranchFeedbacks = (
  state: RootState
): BranchFeedbackResponse[] => state.feedback.feedbacks;

export const selectBranchFeedbacksPagination = (
  state: RootState
): FeedbackState['pagination'] => state.feedback.pagination;

export const selectSelectedFeedback = (
  state: RootState
): GetFeedbackDetailsResponse | null => state.feedback.selectedFeedback;
