import type { RootState } from '@app/store';
import type {
  Quest,
  QuestCreate,
  QuestListResponse,
  QuestUpdate,
} from '@features/admin/types/quest';
import { createAppAsyncThunk } from '@hooks/reduxHooks';
import { axiosApi } from '@lib/api/apiInstance';
import {
  createSlice,
  isFulfilled,
  isPending,
  isRejected,
} from '@reduxjs/toolkit';

export interface QuestState {
  quests: Quest[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: unknown;
}

const initialState: QuestState = {
  quests: [],
  totalCount: 0,
  currentPage: 1,
  pageSize: 10,
  totalPages: 0,
  hasPrevious: false,
  hasNext: false,
  status: 'idle',
  error: null,
};

export const getAllQuests = createAppAsyncThunk(
  'quest/getAllQuests',
  async (
    payload: {
      pageNumber: number;
      pageSize: number;
      isActive?: boolean;
      campaignId?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const response: QuestListResponse =
        await axiosApi.questApi.getQuests(payload);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getQuestById = createAppAsyncThunk(
  'quest/getQuestById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response: Quest = await axiosApi.questApi.getQuestById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const createQuest = createAppAsyncThunk(
  'quest/createQuest',
  async (payload: QuestCreate, { rejectWithValue }) => {
    try {
      const response: Quest = await axiosApi.questApi.createQuest(payload);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateQuest = createAppAsyncThunk(
  'quest/updateQuest',
  async (payload: { id: number; data: QuestUpdate }, { rejectWithValue }) => {
    try {
      const response: Quest = await axiosApi.questApi.updateQuest(
        payload.id,
        payload.data
      );
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const deleteQuest = createAppAsyncThunk(
  'quest/deleteQuest',
  async (id: number, { rejectWithValue }) => {
    try {
      await axiosApi.questApi.deleteQuest(id);
      return id;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const postQuestImage = createAppAsyncThunk(
  'quest/postQuestImage',
  async (payload: { id: number; data: FormData }, { rejectWithValue }) => {
    try {
      const response: Quest = await axiosApi.questApi.postQuestImage(
        payload.id,
        payload.data
      );
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const questSlice = createSlice({
  name: 'quest',
  initialState,
  reducers: {
    resetQuestState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllQuests.fulfilled, (state, action) => {
        state.quests = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.currentPage = action.payload.currentPage;
        state.pageSize = action.payload.pageSize;
        state.totalPages = action.payload.totalPages;
        state.hasPrevious = action.payload.hasPrevious;
        state.hasNext = action.payload.hasNext;
      })
      .addCase(createQuest.fulfilled, (state, action) => {
        if (action.payload) {
          state.quests.unshift(action.payload);
          state.totalCount += 1;
        }
      })
      .addCase(updateQuest.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.quests.findIndex(
            (quest) => quest.questId === action.payload.questId
          );
          if (index !== -1) {
            state.quests[index] = action.payload;
          }
        }
      })
      .addCase(deleteQuest.fulfilled, (state, action) => {
        state.quests = state.quests.filter(
          (quest) => quest.questId !== action.payload
        );
        if (state.totalCount > 0) {
          state.totalCount -= 1;
        }
      })
      .addCase(postQuestImage.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.quests.findIndex(
            (quest) => quest.questId === action.payload.questId
          );
          if (index !== -1) {
            state.quests[index] = action.payload;
          }
        }
      })
      .addMatcher(
        isPending(
          getAllQuests,
          getQuestById,
          createQuest,
          updateQuest,
          deleteQuest,
          postQuestImage
        ),
        (state) => {
          state.status = 'pending';
        }
      )
      .addMatcher(
        isFulfilled(
          getAllQuests,
          getQuestById,
          createQuest,
          updateQuest,
          deleteQuest,
          postQuestImage
        ),
        (state) => {
          state.status = 'succeeded';
          state.error = null;
        }
      )
      .addMatcher(
        isRejected(
          getAllQuests,
          getQuestById,
          createQuest,
          updateQuest,
          deleteQuest,
          postQuestImage
        ),
        (state, action) => {
          state.status = 'failed';
          state.error = action.payload;
        }
      );
  },
});

export const { resetQuestState } = questSlice.actions;

export const selectQuestStatus = (
  state: RootState
): 'idle' | 'pending' | 'succeeded' | 'failed' => state.quest.status;

export const selectQuests = (state: RootState): Quest[] => state.quest.quests;

export const selectQuestTotalCount = (state: RootState): number =>
  state.quest.totalCount;

export const selectQuestHasPrevious = (state: RootState): boolean =>
  state.quest.hasPrevious;

export const selectQuestHasNext = (state: RootState): boolean =>
  state.quest.hasNext;

export default questSlice.reducer;
