import type { RootState } from '@app/store';
import type { User } from '@custom-types/user';
import type {
  LoginWithFacebookRequest,
  LoginWithGoogleRequest,
} from '@features/auth/types/login';
import { createAppAsyncThunk } from '@hooks/reduxHooks';
import { axiosApi } from '@lib/api/apiInstance';
import {
  createSlice,
  isFulfilled,
  isPending,
  isRejected,
} from '@reduxjs/toolkit';
import { tokenManagement } from '@utils/tokenManagement';

// Define a type for the slice state
export interface AuthState {
  value: User | null;
  isGeneratedOTP: boolean;
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: unknown;
}

const initialState: AuthState = {
  value: null,
  isGeneratedOTP: false,
  status: 'idle',
  error: null,
};

export const userLoginWithGoogle = createAppAsyncThunk(
  'auth/loginWithGoogle',
  async (payload: LoginWithGoogleRequest, { rejectWithValue }) => {
    try {
      const { user, token } = await axiosApi.loginApi.loginWithGoogle({
        accessToken: payload.accessToken,
      });

      tokenManagement.setTokens({ newAccessToken: token });

      return user;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const userLoginWithFacebook = createAppAsyncThunk(
  'auth/loginWithFacebook',
  async (payload: LoginWithFacebookRequest, { rejectWithValue }) => {
    try {
      const { user, token } = await axiosApi.loginApi.loginWithFacebook({
        accessToken: payload.accessToken,
      });

      tokenManagement.setTokens({ newAccessToken: token });

      return user;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const userLoginWithPhoneNumber = createAppAsyncThunk(
  'auth/loginWithPhoneNumber',
  async (payload: { phoneNumber: string }, { rejectWithValue }) => {
    try {
      const response = await axiosApi.loginApi.loginWithPhoneNumber({
        phoneNumber: payload.phoneNumber,
      });
      console.log('Phone login response:', response);
      return response;
    } catch (error) {
      if (error && typeof error === 'object' && 'message' in error) {
        return rejectWithValue({
          code: 'PHONE_LOGIN_ERROR',
          message: (error as { message: string }).message,
        });
      }

      return rejectWithValue({
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred during phone login',
      });
    }
  }
);

export const verifyPhoneNumber = createAppAsyncThunk(
  'auth/verifyPhoneNumber',
  async (
    payload: { phoneNumber: string; otp: string },
    { rejectWithValue }
  ) => {
    try {
      const { user, token } = await axiosApi.loginApi.verifyPhoneNumber({
        phoneNumber: payload.phoneNumber,
        otp: payload.otp,
      });
      tokenManagement.setTokens({ newAccessToken: token });

      return user;
    } catch (error) {
      // API errors are already formatted by ApiClient
      return rejectWithValue(error);
    }
  }
);

export const loadUserFromStorage = createAppAsyncThunk(
  'user/loadUserFromStorage',
  async () => {
    if (!tokenManagement.getAccessToken()) {
      tokenManagement.clearTokens();
      return null;
    }

    const userProfile = await axiosApi.userProfileApi.getUserProfile();
    return userProfile;
  }
);

export const updateProfile = createAppAsyncThunk(
  'user/updateProfile',
  async (payload: Partial<User>, { rejectWithValue }) => {
    try {
      const user = await axiosApi.userProfileApi.updateUserProfile(payload);
      return user;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const markUserInfoSetup = createAppAsyncThunk(
  'user/markUserInfoSetup',
  async (_, { rejectWithValue }) => {
    try {
      await axiosApi.userProfileApi.markUserInfoSetup();
      return;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const authSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: () => {
      tokenManagement.clearTokens();
      return initialState;
    },
    changeAccount: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(userLoginWithGoogle.fulfilled, (state, action) => {
        state.value = action.payload;
      })
      .addCase(userLoginWithFacebook.fulfilled, (state, action) => {
        state.value = action.payload;
      })
      .addCase(userLoginWithPhoneNumber.fulfilled, (state) => {
        state.isGeneratedOTP = true;
      })
      .addCase(verifyPhoneNumber.fulfilled, (state, action) => {
        state.value = action.payload;
      })
      .addCase(loadUserFromStorage.fulfilled, (state, action) => {
        state.value = action.payload;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.value = action.payload;
      })
      .addCase(markUserInfoSetup.fulfilled, (state) => {
        if (state.value) state.value.userInfoSetup = true;
      })
      // Matcher: Gom tất cả các case đang chạy (pending)
      .addMatcher(isPending, (state) => {
        state.status = 'pending';
        state.error = null;
      })
      // Matcher: Gom tất cả các case thất bại (rejected)
      .addMatcher(isRejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? { message: 'An error occurred' };
      })
      // Matcher: Gom các case thành công (ngoại trừ logout) để set status succeeded
      .addMatcher(
        (action) => isFulfilled(action) && !action.type.includes('logout'),
        (state) => {
          state.status = 'succeeded';
        }
      );
  },
});

// Action creators are generated for each case reducer function
export const { logout, changeAccount } = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectUser = (state: RootState): User | null => state.user.value;

export const selectUserStatus = (
  state: RootState
): 'idle' | 'pending' | 'succeeded' | 'failed' => state.user.status;

export const selectIsGeneratedOTP = (state: RootState): boolean =>
  state.user.isGeneratedOTP;

export const selectAuthError = (state: RootState): unknown => state.user.error;
