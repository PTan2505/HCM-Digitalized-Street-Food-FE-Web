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
    getUsersWithBadges: '/Badge/users',
    updateOrDeleteBadge: (id: number): string => `/Badge/${id}`,
    awardUserBadge: (userId: number, badgeId: number): string =>
      `/Badge/user/${userId}/award/${badgeId}`,
    revokeUserBadge: (userId: number, badgeId: number): string =>
      `/Badge/user/${userId}/badge/${badgeId}`,
  },
  userDietaryPreference: {
    getAllOrPostDietaryPreference: '/DietaryPreference',
    getUsersWithDietaryPreferences: '/UserDietary/users',
    updateOrDeleteDietaryPreference: (id: number): string =>
      `/DietaryPreference/${id}`,
  },
  category: {
    getAllOrPostCategory: '/categories',
    updateOrDeleteCategory: (id: number): string => `/categories/${id}`,
  },
  user: {
    userSetup: {
      userinfo: '/UserSetup/userinfo-setup',
      dietary: '/UserSetup/dietary-setup',
    },
  },
  vendor: {
    register: '/Vendor',
    getMyVendor: '/Vendor/my-vendor',
    submitLicense: (branchId: number): string =>
      `/Branch/${branchId}/submit-license`,
    checkLicenseStatus: (branchId: number): string =>
      `/Branch/${branchId}/license-status`,
  },
};
