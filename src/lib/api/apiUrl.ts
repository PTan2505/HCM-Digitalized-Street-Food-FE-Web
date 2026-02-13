export const apiUrl = {
  auth: {
    facebookLogin: '/Auth/facebook-login',
    phoneLogin: '/Auth/phone-login',
    phoneVerify: '/Auth/phone-verify',
    login: '/Auth/login',
    googleLogin: '/Auth/google-login',
    profile: '/Auth/profile',
    register: '/Auth/register',
    verifyRegistration: '/Auth/verify-registration',
    resendRegistrationOTP: '/Auth/resend-registration-otp',
    forgetPassword: '/Auth/forget-password',
    resetPassword: '/Auth/reset-password',
    resendForgetPasswordOTP: '/Auth/resend-forget-password-otp',
  },
  // dietaryPreference: {
  //   getAll: '/DietaryPreference',
  // },
  login: {
    moderator: 'users/moderator-login/',
    customer: '/users/login/',
  },
  profile: {
    moderator: '/users/profile/',
    customer: '/users/profile/',
  },
  users: {
    list: '/users/',
  },
  badge: {
    getAllOrPostBadge: '/Badge',
    updateOrDeleteBadge: (id: number): string => `/Badge/${id}`,
  },
  userDietaryPreference: {
    getAllOrPostDietaryPreference: '/DietaryPreference',
    updateOrDeleteDietaryPreference: (id: number): string =>
      `/DietaryPreference/${id}`,
  },
};
