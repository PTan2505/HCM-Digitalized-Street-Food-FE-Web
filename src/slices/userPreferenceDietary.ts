import type { RootState } from '@app/store';
import type {
  UserDietaryPreference,
  CreateOrUpdateUserDietaryPreferenceRequest,
  CreateOrUpdateUserDietaryPreferenceResponse,
} from '@features/admin/types/userDietaryPreference';
import { createAppAsyncThunk } from '@hooks/reduxHooks';
import { axiosApi } from '@lib/api/apiInstance';
import {
  createSlice,
  isFulfilled,
  isPending,
  isRejected,
} from '@reduxjs/toolkit';

export interface UserDietaryPreferenceState {
  userDietaryPreferences: UserDietaryPreference[];
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: unknown;
}

const initialState: UserDietaryPreferenceState = {
  userDietaryPreferences: [],
  status: 'idle',
  error: null,
};

export const getAllUserDietaryPreferences = createAppAsyncThunk(
  'userDietaryPreference/getAllUserDietaryPreferences',
  async (_, { rejectWithValue }) => {
    try {
      const response: UserDietaryPreference[] =
        await axiosApi.userDietaryPreferenceApi.getAllUserDietaryPreferences();
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const createUserDietaryPreference = createAppAsyncThunk(
  'userDietaryPreference/createUserDietaryPreference',
  async (
    payload: CreateOrUpdateUserDietaryPreferenceRequest,
    { rejectWithValue }
  ) => {
    try {
      const response: CreateOrUpdateUserDietaryPreferenceResponse =
        await axiosApi.userDietaryPreferenceApi.createUserDietaryPreference(
          payload
        );
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateUserDietaryPreference = createAppAsyncThunk(
  'userDietaryPreference/updateUserDietaryPreference',
  async (
    payload: { id: number } & CreateOrUpdateUserDietaryPreferenceRequest,
    { rejectWithValue }
  ) => {
    try {
      const response: CreateOrUpdateUserDietaryPreferenceResponse =
        await axiosApi.userDietaryPreferenceApi.updateUserDietaryPreference(
          payload.id,
          payload
        );
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const deleteUserDietaryPreference = createAppAsyncThunk(
  'userDietaryPreference/deleteUserDietaryPreference',
  async (id: number, { rejectWithValue }) => {
    try {
      await axiosApi.userDietaryPreferenceApi.deleteUserDietaryPreference(id);
      return id;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const userDietaryPreferenceSlice = createSlice({
  name: 'userDietaryPreference',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllUserDietaryPreferences.fulfilled, (state, action) => {
        state.userDietaryPreferences = action.payload;
      })
      .addCase(createUserDietaryPreference.fulfilled, (state, action) => {
        if (action.payload) {
          state.userDietaryPreferences.push(
            action.payload as unknown as UserDietaryPreference
          );
        }
      })
      .addCase(updateUserDietaryPreference.fulfilled, (state, action) => {
        if (action.payload) {
          const responseData = action.payload as unknown as {
            userDietaryPreference: UserDietaryPreference;
          };
          const userDietaryPreference = responseData.userDietaryPreference;
          const index = state.userDietaryPreferences.findIndex(
            (b) =>
              b.dietaryPreferenceId ===
              userDietaryPreference.dietaryPreferenceId
          );
          if (index !== -1) {
            state.userDietaryPreferences[index] = userDietaryPreference;
          }
        }
      })
      .addCase(deleteUserDietaryPreference.fulfilled, (state, action) => {
        if (action.payload) {
          state.userDietaryPreferences = state.userDietaryPreferences.filter(
            (userDietaryPreference) =>
              userDietaryPreference.dietaryPreferenceId !== action.payload
          );
        }
      })
      .addMatcher(
        isPending(
          getAllUserDietaryPreferences,
          createUserDietaryPreference,
          updateUserDietaryPreference,
          deleteUserDietaryPreference
        ),
        (state) => {
          state.status = 'pending';
        }
      )
      .addMatcher(
        isFulfilled(
          getAllUserDietaryPreferences,
          createUserDietaryPreference,
          updateUserDietaryPreference,
          deleteUserDietaryPreference
        ),
        (state) => {
          state.status = 'succeeded';
          state.error = null;
        }
      )
      .addMatcher(
        isRejected(
          getAllUserDietaryPreferences,
          createUserDietaryPreference,
          updateUserDietaryPreference,
          deleteUserDietaryPreference
        ),
        (state, action) => {
          state.status = 'failed';
          state.error = action.payload;
        }
      );
  },
});

export const selectUserDietaryPreferenceStatus = (
  state: RootState
): 'idle' | 'pending' | 'succeeded' | 'failed' =>
  state.userDietaryPreference.status;

export const selectUserDietaryPreferences = (
  state: RootState
): UserDietaryPreference[] =>
  state.userDietaryPreference.userDietaryPreferences;

export default userDietaryPreferenceSlice.reducer;
