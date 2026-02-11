import type { RootState } from '@app/store';
import type { LoginResponse } from '@auth/types/login';
import type { User } from '@custom-types/user';
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
  loginResponse: LoginResponse | null;
  isGeneratedOTP: boolean;
  registerEmail: string | null;
  forgetPasswordEmail: string | null;
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: unknown;
}

const initialState: AuthState = {
  value: null,
  loginResponse: null,
  registerEmail: null,
  isGeneratedOTP: false,
  forgetPasswordEmail: null,
  status: 'idle',
  error: null,
};

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

      return { user };
    } catch (error) {
      // API errors are already formatted by ApiClient
      return rejectWithValue(error);
    }
  }
);

export const loadUserFromStorage = createAppAsyncThunk(
  'user/loadUserFromStorage',
  async () => {
    if (
      !tokenManagement.getAccessToken() ||
      !tokenManagement.getRefreshToken()
    ) {
      tokenManagement.clearTokens();
      return null;
    }

    const userProfile = await axiosApi.userProfileApi.getUserProfile();
    return userProfile;
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
      .addCase(userLoginWithPhoneNumber.fulfilled, (state) => {
        state.isGeneratedOTP = true;
      })
      .addCase(verifyPhoneNumber.fulfilled, (state, action) => {
        state.value = action.payload.user;
      })
      .addCase(loadUserFromStorage.fulfilled, (state, action) => {
        state.value = action.payload;
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
