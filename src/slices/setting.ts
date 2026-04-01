import type { RootState } from '@app/store';
import type {
  Setting,
  UpdateSettingRequest,
} from '@features/admin/types/setting';
import { createAppAsyncThunk } from '@hooks/reduxHooks';
import { axiosApi } from '@lib/api/apiInstance';
import {
  createSlice,
  isFulfilled,
  isPending,
  isRejected,
} from '@reduxjs/toolkit';

interface SettingState {
  settings: Setting[];
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: unknown;
}

const initialState: SettingState = {
  settings: [],
  status: 'idle',
  error: null,
};

export const getAllSettings = createAppAsyncThunk(
  'setting/getAllSettings',
  async (_, { rejectWithValue }) => {
    try {
      return await axiosApi.settingApi.getSettings();
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateSetting = createAppAsyncThunk(
  'setting/updateSetting',
  async (
    payload: { name: string; data: UpdateSettingRequest },
    { rejectWithValue }
  ) => {
    try {
      return await axiosApi.settingApi.updateSetting(
        payload.name,
        payload.data
      );
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const reloadSettings = createAppAsyncThunk(
  'setting/reloadSettings',
  async (_, { rejectWithValue }) => {
    try {
      await axiosApi.settingApi.reloadSettings();
      return undefined;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const settingSlice = createSlice({
  name: 'setting',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
      })
      .addCase(updateSetting.fulfilled, (state, action) => {
        const index = state.settings.findIndex(
          (setting) => setting.name === action.payload.name
        );

        if (index !== -1) {
          state.settings[index] = action.payload;
        }
      })
      .addMatcher(
        isPending(getAllSettings, updateSetting, reloadSettings),
        (state) => {
          state.status = 'pending';
        }
      )
      .addMatcher(
        isFulfilled(getAllSettings, updateSetting, reloadSettings),
        (state) => {
          state.status = 'succeeded';
          state.error = null;
        }
      )
      .addMatcher(
        isRejected(getAllSettings, updateSetting, reloadSettings),
        (state, action) => {
          state.status = 'failed';
          state.error = action.payload;
        }
      );
  },
});

export const selectSettings = (state: RootState): Setting[] =>
  state.setting.settings;

export const selectSettingStatus = (
  state: RootState
): 'idle' | 'pending' | 'succeeded' | 'failed' => state.setting.status;

export default settingSlice.reducer;
