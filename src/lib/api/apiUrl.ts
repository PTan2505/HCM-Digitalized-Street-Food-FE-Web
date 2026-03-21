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
  admin: {
    vendor: {
      getAllVendors: '/Vendor',
      getVendorDetail: (id: number): string => `/Vendor/${id}`,
      getActiveVendors: '/Vendor/active',
      deleteVendor: (id: number): string => `/Vendor/${id}`,
      suspendVendor: (id: number): string => `/Vendor/${id}/suspend`,
      reactivateVendor: (id: number): string => `/Vendor/${id}/reactivate`,
    },
  },
  user: {
    userSetup: {
      userinfo: '/UserSetup/userinfo-setup',
      dietary: '/UserSetup/dietary-setup',
    },
  },
  vendor: {
    //For vendor
    register: '/Vendor',
    updateVendorName: '/Vendor',
    getMyVendor: '/Vendor/my-vendor',
    getDietaryPreferencesOfAVendor(vendorId: number): string {
      return `/Vendor/${vendorId}/dietary-preferences`;
    },
    updateDietaryPreferencesOfMyVendor: '/Vendor/my-vendor/dietary-preferences',
    submitLicense: (branchId: number): string =>
      `/Branch/${branchId}/submit-license`,
    checkLicenseStatus: (branchId: number): string =>
      `/Branch/${branchId}/license-status`,
    //Branches
    createOrGetBranchesOfAVendor: (vendorId: number): string =>
      `/Branch/vendor/${vendorId}`,
    updateOrDeleteBranch: (branchId: number): string => `/Branch/${branchId}`,
    //WorkSchedules
    createOrGetWorkSchedulesOfABranch: (branchId: number): string =>
      `/Branch/${branchId}/work-schedules`,
    deleteOrUpdateWorkScheduleOfABranch: (workScheduleId: number): string =>
      `/Branch/work-schedules/${workScheduleId}`,
    //Day-offs
    createOrGetDayOffsOfABranch: (branchId: number): string =>
      `/Branch/${branchId}/day-offs`,
    deleteDayOffOfABranch: (dayOffId: number): string =>
      `/Branch/day-offs/${dayOffId}`,
    //Images
    createOrGetImagesOfABranch: (branchId: number): string =>
      `/Branch/${branchId}/images`,
    deleteImagesOfABranch: (imageId: number): string =>
      `/Branch/images/${imageId}`,
    //For moderator
    getPendingRegistrations: '/Branch/pending-registrations',
    getActiveBranches: '/Branch/active',
    verifyBranch: (branchId: number): string => `/Branch/${branchId}/verify`,
    rejectBranch: (branchId: number): string => `/Branch/${branchId}/reject`,
  },
  taste: {
    getAllOrPostTaste: '/tastes',
    updateOrDeleteTaste: (id: number): string => `/tastes/${id}`,
  },
  payment: {
    createPaymentLink: '/Payment/create-link',
    getPaymentStatus: (orderCode: string): string =>
      `/Payment/status/${orderCode}`,
    getPaymentHistory: '/Payment/history',
    getPaymentSuccess: '/Payment/success',
    getPaymentCancel: '/Payment/cancel',
    confirmPayment: '/Payment/confirm/',
    getVendorBalance: '/Payment/vendor/balance',
    vendorRequestTransfer: '/Payment/vendor/transfer',
  },
  dish: {
    CreateOrGetDishesOfAVendor: (vendorId: number): string =>
      `/dishes/vendor/${vendorId}`,
    UpdateOrDeleteDish: (dishId: number): string => `/dishes/${dishId}`,
    GetDishesByBranch: (branchId: number): string =>
      `/dishes/branch/${branchId}`,
    AssignOrUnassignDishToBranch: (branchId: number): string =>
      `/dishes/branch/${branchId}`,
    UpdateDishAvailabilityByBranch: (
      dishId: number,
      branchId: number
    ): string => `dishes/${dishId}/branch/${branchId}/availability`,
  },
  feedback: {
    GetFeedbacksByBranch: (branchId: number): string =>
      `/Feedback/branch/${branchId}`,
    CreateOrUpdateOrDeleteReply: (feedbackId: number): string =>
      `/Feedback/${feedbackId}/reply`,
  },
  order: {
    getVendorBranchOrders: (branchId: number): string =>
      `/order/vendor/branches/${branchId}/orders`,
    decideVendorOrder: (orderId: number): string =>
      `/order/vendor/orders/${orderId}/decision`,
    getOrderPickupCode: (orderId: number): string =>
      `/order/${orderId}/pickup-code`,
    completeVendorOrder: (orderId: number): string =>
      `/order/vendor/orders/${orderId}/complete`,
  },
};
