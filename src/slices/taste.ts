import type { RootState } from '@app/store';
import type {
  Taste,
  CreateOrUpdateTasteRequest,
  CreateOrUpdateTasteResponse,
} from '@features/admin/types/taste';
import { createAppAsyncThunk } from '@hooks/reduxHooks';
import { axiosApi } from '@lib/api/apiInstance';
import {
  createSlice,
  isFulfilled,
  isPending,
  isRejected,
} from '@reduxjs/toolkit';

export interface TasteState {
  tastes: Taste[];
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: unknown;
}

const initialState: TasteState = {
  tastes: [],
  status: 'idle',
  error: null,
};

export const getAllTastes = createAppAsyncThunk(
  'taste/getAllTastes',
  async (_, { rejectWithValue }) => {
    try {
      const response: Taste[] = await axiosApi.tasteApi.getAllTastes();
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const createTaste = createAppAsyncThunk(
  'taste/createTaste',
  async (payload: CreateOrUpdateTasteRequest, { rejectWithValue }) => {
    try {
      const response: CreateOrUpdateTasteResponse =
        await axiosApi.tasteApi.createTaste(payload);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateTaste = createAppAsyncThunk(
  'taste/updateTaste',
  async (
    payload: { id: number } & CreateOrUpdateTasteRequest,
    { rejectWithValue }
  ) => {
    try {
      const response: CreateOrUpdateTasteResponse =
        await axiosApi.tasteApi.updateTaste(payload.id, payload);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const deleteTaste = createAppAsyncThunk(
  'taste/deleteTaste',
  async (id: number, { rejectWithValue }) => {
    try {
      await axiosApi.tasteApi.deleteTaste(id);
      return id;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const tasteSlice = createSlice({
  name: 'taste',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllTastes.fulfilled, (state, action) => {
        state.tastes = action.payload;
      })
      .addCase(createTaste.fulfilled, (state, action) => {
        if (action.payload) {
          state.tastes.push(action.payload as unknown as Taste);
        }
      })
      .addCase(updateTaste.fulfilled, (state, action) => {
        if (action.payload) {
          const responseData = action.payload as unknown as { taste: Taste };
          const taste = responseData.taste;
          const index = state.tastes.findIndex(
            (t) => t.tasteId === taste.tasteId
          );
          if (index !== -1) {
            state.tastes[index] = taste;
          }
        }
      })
      .addCase(deleteTaste.fulfilled, (state, action) => {
        if (action.payload) {
          state.tastes = state.tastes.filter(
            (taste) => taste.tasteId !== action.payload
          );
        }
      })
      .addMatcher(
        isPending(getAllTastes, createTaste, updateTaste, deleteTaste),
        (state) => {
          state.status = 'pending';
        }
      )
      .addMatcher(
        isFulfilled(getAllTastes, createTaste, updateTaste, deleteTaste),
        (state) => {
          state.status = 'succeeded';
          state.error = null;
        }
      )
      .addMatcher(
        isRejected(getAllTastes, createTaste, updateTaste, deleteTaste),
        (state, action) => {
          state.status = 'failed';
          state.error = action.payload;
        }
      );
  },
});

export const selectTasteStatus = (
  state: RootState
): 'idle' | 'pending' | 'succeeded' | 'failed' => state.taste.status;

export const selectTastes = (state: RootState): Taste[] => state.taste.tastes;

export default tasteSlice.reducer;
