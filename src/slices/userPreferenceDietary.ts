import type { RootState } from '@app/store';
import type {
  UserDietaryPreference,
  CreateOrUpdateUserDietaryPreferenceRequest,
  CreateOrUpdateUserDietaryPreferenceResponse,
  UsersWithDietaryPreferences,
  GetUsersWithDietaryPreferencesResponse,
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
  usersWithDietaryPreferences: UsersWithDietaryPreferences[];
  usersWithDietaryPagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
    hasPrevious: boolean;
    hasNext: boolean;
  };
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: unknown;
}

const initialState: UserDietaryPreferenceState = {
  userDietaryPreferences: [],
  usersWithDietaryPreferences: [],
  usersWithDietaryPagination: {
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
    totalCount: 0,
    hasPrevious: false,
    hasNext: false,
  },
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

export const getUsersWithDietaryPreferences = createAppAsyncThunk(
  'userDietaryPreference/getUsersWithDietaryPreferences',
  async (
    params: { pageNumber: number; pageSize: number },
    { rejectWithValue }
  ) => {
    try {
      const response: GetUsersWithDietaryPreferencesResponse =
        await axiosApi.userDietaryPreferenceApi.getUsersWithDietaryPreferences(
          params
        );
      return response;
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
          const userDietaryPreference =
            action.payload as unknown as UserDietaryPreference;
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
      .addCase(getUsersWithDietaryPreferences.fulfilled, (state, action) => {
        state.usersWithDietaryPreferences = action.payload.items;
        state.usersWithDietaryPagination = {
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          totalPages: action.payload.totalPages,
          totalCount: action.payload.totalCount,
          hasPrevious: action.payload.hasPrevious,
          hasNext: action.payload.hasNext,
        };
      })
      .addMatcher(
        isPending(
          getAllUserDietaryPreferences,
          createUserDietaryPreference,
          updateUserDietaryPreference,
          deleteUserDietaryPreference,
          getUsersWithDietaryPreferences
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
          deleteUserDietaryPreference,
          getUsersWithDietaryPreferences
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
          deleteUserDietaryPreference,
          getUsersWithDietaryPreferences
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

export const selectUsersWithDietaryPreferences = (
  state: RootState
): UsersWithDietaryPreferences[] =>
  state.userDietaryPreference.usersWithDietaryPreferences;

export const selectUsersWithDietaryPagination = (
  state: RootState
): UserDietaryPreferenceState['usersWithDietaryPagination'] =>
  state.userDietaryPreference.usersWithDietaryPagination;

export default userDietaryPreferenceSlice.reducer;
