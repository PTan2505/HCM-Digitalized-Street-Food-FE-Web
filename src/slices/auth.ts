import type { RootState } from '@app/store';
import type { LoginRequest, LoginType, OTPResponse } from '@auth/types/login';
import type { APIErrorResponse } from '@custom-types/apiResponse';
import type { User } from '@custom-types/user';
import { createAppAsyncThunk } from '@hooks/reduxHooks';
import { axiosApi } from '@lib/api/apiInstance';
import { createSlice } from '@reduxjs/toolkit';
import { tokenManagement } from '@utils/tokenManagement';

// Define a type for the slice state
export interface UserState {
  value: User | OTPResponse | null;
  isGeneratedOTP: boolean;
  isNewUser: boolean;
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: APIErrorResponse | unknown | null;
}

interface LoginPayload {
  data: LoginRequest;
  loginType: LoginType;
}

// Define the initial state using that type
const initialState: UserState = {
  value: null,
  isGeneratedOTP: false,
  isNewUser: false,
  status: 'idle',
  error: null,
};

export const userLogin = createAppAsyncThunk(
  'user/login',
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      const tokenData = await axiosApi.loginApi.login(
        payload.data,
        payload.loginType
      );
      tokenManagement.setTokens({
        newAccessToken: tokenData.accessToken,
        newRefreshToken: tokenData.refreshToken,
      });

      const userProfile = await axiosApi.userProfileApi.getUserProfile();
      return userProfile;
    } catch (error) {
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

export const generateOTP = createAppAsyncThunk(
  'user/generateOTP',
  async (payload: LoginRequest) => {
    const OTPResponse = await axiosApi.otpApi.generateOTP(payload);
    return OTPResponse;
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
      .addCase(userLogin.pending, (state) => {
        state.status = 'pending';
        state.error = null;
      })
      .addCase(userLogin.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.value = action.payload;
      })
      .addCase(userLogin.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? { message: 'Login failed' };
      })
      .addCase(loadUserFromStorage.pending, (state) => {
        state.status = 'pending';
        state.error = null;
      })
      .addCase(loadUserFromStorage.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.value = action.payload;
      })
      .addCase(loadUserFromStorage.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? { message: 'Load user failed' };
        state.value = null;
      })
      .addCase(generateOTP.pending, (state) => {
        state.status = 'pending';
        state.error = null;
      })
      .addCase(generateOTP.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.isGeneratedOTP = true;
        state.isNewUser = action.payload.isNewUser;
      })
      .addCase(generateOTP.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? { message: 'Generate OTP failed' };
      });
  },
});

// Action creators are generated for each case reducer function
export const { logout, changeAccount } = authSlice.actions;

export default authSlice.reducer;

export const selectUser = (state: RootState): User | OTPResponse | null =>
  state.user.value;

export const selectIsGeneratedOTP = (state: RootState): boolean =>
  state.user.isGeneratedOTP;

export const selectUserStatus = (
  state: RootState
): 'idle' | 'pending' | 'succeeded' | 'failed' => state.user.status;

export const selectUserError = (
  state: RootState
): APIErrorResponse | unknown | null => state.user.error;

export const selectIsNewUser = (state: RootState): boolean =>
  state.user.isNewUser;
