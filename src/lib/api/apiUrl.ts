export const apiUrl = {
  auth: {
    facebookLogin: '/Auth/facebook-login',
    phoneLogin: '/Auth/phone-login',
    phoneVerify: '/Auth/phone-verify',
    login: '/Auth/login',
    googleLogin: '/Auth/google-login',
    profile: '/User/profile',
    register: '/Auth/register',
    verifyRegistration: '/Auth/verify-registration',
    resendRegistrationOTP: '/Auth/resend-registration-otp',
    forgetPassword: '/Auth/forget-password',
    resetPassword: '/Auth/reset-password',
    resendForgetPasswordOTP: '/Auth/resend-forget-password-otp',
    contactVerification: '/Auth/contact-verification',
    verifyOTPProfile: '/User/profile/verify-otp',
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
    getUsers: '/User',
    getUserById: (id: number): string => `/User/${id}`,
    banUser: (id: number): string => `/User/${id}/ban`,
    unbanUser: (id: number): string => `/User/${id}/unban`,
    promoteModerator: (id: number): string => `/User/${id}/promote-moderator`,
    search: '/User/search',
    userSetup: {
      userinfo: '/UserSetup/userinfo-setup',
      dietary: '/UserSetup/dietary-setup',
    },
  },
  vendor: {
    //For vendor
    register: '/Vendor',
    getAllGhostPins: '/Branch/all-ghost-pins',
    claimBranch: '/Vendor/claim-branch',
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
    updateBranchManager: (branchId: number): string =>
      `/Branch/${branchId}/manager`,
    //WorkSchedules
    createOrGetWorkSchedulesOfABranch: (branchId: number): string =>
      `/Branch/${branchId}/work-schedules`,
    deleteOrUpdateWorkScheduleOfABranch: (workScheduleId: number): string =>
      `/Branch/work-schedules/${workScheduleId}`,
    //Day-offs
    createOrGetDayOffsOfABranch: (branchId: number): string =>
      `/Branch/${branchId}/day-offs`,
    deleteOrUpdateDayOffOfABranch: (dayOffId: number): string =>
      `/Branch/day-offs/${dayOffId}`,
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
    GetFeedbackDetails: (feedbackId: number): string =>
      `/Feedback/${feedbackId}`,
  },
  feedbackTag: {
    getAllOrPostFeedbackTag: '/FeedbackTag',
    updateOrDeleteFeedbackTag: (id: number): string => `/FeedbackTag/${id}`,
  },
  notification: {
    getNotifications: '/notifications',
    getUnreadCount: '/notifications/unread-count',
    markAsRead: (id: number): string => `/notifications/${id}/read`,
    markAllAsRead: '/notifications/read-all',
  },
  order: {
    getVendorBranchOrders: (branchId: number): string =>
      `/order/vendor/branches/${branchId}/orders`,
    decideVendorOrder: (orderId: number): string =>
      `/order/vendor/orders/${orderId}/decision`,
    getOrderPickupCode: (orderId: number): string =>
      `/order/${orderId}/pickup-code`,
    getManagerOrders: '/order/manager/orders',
    completeVendorOrder: (orderId: number): string =>
      `/order/vendor/orders/${orderId}/complete`,
    getVendorOrders: 'order/vendor/orders',
    getOrderDetails: (orderId: number): string => `/order/${orderId}`,
    updateOrder: (orderId: number): string => `/Order/${orderId}`,
  },
  manager: {
    getMyBranch: '/Branch/manager/my-branch',
  },
  campaign: {
    GetPublicCampaigns: '/Campaign/public',
    GetOrPostSystemCampaign: '/Campaign/system',
    GetOrPostVendorCampaign: '/Campaign/vendor',
    GetCampaignDetail: (campaignId: number): string =>
      `/Campaign/${campaignId}`,
    GetOrPostBranchCampaign: (branchId: number): string =>
      `/Campaign/branch/${branchId}`,
    GetJoinableSystemCampaigns: '/Campaign/system/joinable',
    BranchJoinASystemCampaign: (campaignId: number): string =>
      `/Campaign/join/system/${campaignId}/branch`,
    VendorJoinASystemCampaign: '/Campaign/vendor/join​',
    GetDetailsOfASystemCampaign: (campaignId: number): string =>
      `/Campaign/system/${campaignId}`,
    UpdateCampaign: (campaignId: number): string => `/Campaign/${campaignId}`,
    GetOrPostAImageOfACampaign: (campaignId: number): string =>
      `/Campaign/${campaignId}/images`,
    DeleteAImageOfACampaign: (campaignId: number): string =>
      `/Campaign/${campaignId}/image`,
    GetBranchesOfACampaign: (campaignId: number): string =>
      `/Campaign/system/${campaignId}/branches`,
    GetVendorBranchesOfACampaign: (campaignId: number): string =>
      `/Campaign/vendor/${campaignId}/branches`,
    AddBranchesToACampaign: (campaignId: number): string =>
      `/Campaign/vendor/${campaignId}/branches/add`,
    RemoveBranchesFromACampaign: (campaignId: number): string =>
      `/Campaign/vendor/${campaignId}/branches/remove`,
  },
  quest: {
    getOrPostQuest: '/Quest',
    updateOrDeleteQuest: (questId: number): string => `/Quest/${questId}`,
    updateQuestTasks: (questId: number): string => `/Quest/${questId}/tasks`,
    postQuestImage: (questId: number): string => `/Quest/${questId}/image`,
    getUserQuestTasks: '/Quest/user-quest-tasks',
  },
  tier: {
    getAllTiers: '/Tier',
  },
  setting: {
    getSettings: '/Setting',
    updateSetting: (name: string): string => `/Setting/${name}`,
    reloadSettings: '/Setting/reload',
  },
  voucher: {
    GetOrPostVouchers: '/vouchers',
    UpdateOrDeleteVoucher: (voucherId: number): string =>
      `/vouchers/${voucherId}`,
    GetVouchersOfACampaign: (campaignId: number): string =>
      `/vouchers/campaign/${campaignId}`,
  },
  vendorDashboard: {
    getRevenue: '/VendorDashboard/revenue',
    getVouchers: '/VendorDashboard/vouchers',
    getDishes: '/VendorDashboard/dishes',
  },
  adminDashboard: {
    getUserSignUps: '/AdminDashboard/user-signups',
    getMoney: '/AdminDashboard/money',
    getCompensation: '/AdminDashboard/compensation',
    getUserToVendorConversions: '/AdminDashboard/user-to-vendor-conversions',
  },
  branch: {
    getBranches: '/Branch',
  },
};
