import { AxiosApiService } from '@config/axiosApiService';
import { OTPApi } from '@features/auth/api/generateOTPApi';
import { LoginApi } from '@features/auth/api/loginApi';
import { UserProfileApi } from '@features/user/api/profileApi';
import ApiClient from '@lib/api/apiClient';

const axiosService = new AxiosApiService();
const axiosClient = new ApiClient(axiosService);

export const axiosApi = {
  loginApi: new LoginApi(axiosClient),
  userProfileApi: new UserProfileApi(axiosClient),
  otpApi: new OTPApi(axiosClient),
};
