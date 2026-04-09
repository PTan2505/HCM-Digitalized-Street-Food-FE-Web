export const ROUTES = {
  LOGIN: '/login',
  ROOT: '/',
  HOME: '/home',
  NEW_CUSTOMER_PROFILE: '/new-customer-profile',
  USER_INFO_SETUP: '/user-info-setup',
  PAYMENT_SUCCESS: '/Payment/success',
  PAYMENT_CANCEL: '/Payment/cancel',

  // Moderator routes
  MODERATOR: {
    BASE: '/moderator',
    // Child paths
    PATHS: {
      REVENUE: 'revenue',
      TRANSACTIONS: 'transactions',
      VERIFICATION: 'verification',
      VERIFICATION_GHOST_PIN: 'verification/ghost-pin',
      VERIFICATION_VENDOR: 'verification/vendor',
      VERIFICATION_OWNERSHIP_REQUEST: 'verification/ownership-request',
      POSTS: 'posts',
      USERS: 'users',
      CASHOUT: 'cashout',
      BRANCH: 'branch',
    },
  },

  // Manager routes
  MANAGER: {
    BASE: '/manager',
    // Child paths
    PATHS: {
      ORDER: 'orders',
      BRANCH: 'branches',
      DISH: 'dishes',
      FEEDBACK: 'feedbacks',
      WORK_SCHEDULE: 'work-schedule',
      DAY_OFF: 'day-offs',
      REVENUE: 'revenue',
      TRANSACTIONS: 'transactions',
      VERIFICATION: 'verification',
      POSTS: 'posts',
      USERS: 'users',
      CASHOUT: 'cashout',
    },
  },

  // Admin routes
  ADMIN: {
    BASE: '/admin',
    // Child paths
    PATHS: {
      DASHBOARD: 'dashboard',
      REVENUE: 'revenue',
      TRANSACTIONS: 'transactions',
      BADGE_USERS: 'badge-users',
      USER_DIETARY: 'user-dietary',
      USERS: 'users',
      USERS_CUSTOMER: 'users/customer',
      USERS_VENDOR: 'users/vendor',
      USERS_SYSTEM: 'users/system',
      VENDORS: 'vendors',
      BADGE: 'badge',
      USER_WITH_DIETARY: 'users-with-dietary',
      CATEGORY: 'category',
      BRANCH: 'branch',
      TASTE: 'taste',
      FEEDBACK_TAG: 'feedback-tag',
      CAMPAIGN: 'campaign',
      CAMPAIGN_VENDOR: 'campaign/vendor',
      QUEST: 'quest',
      SETTING: 'setting',
      VOUCHER: 'voucher',
      VERIFICATION: 'verification',
    },
  },

  // Vendor routes
  VENDOR: {
    BASE: '/vendor',
    // Child paths
    PATHS: {
      DASHBOARD: 'dashboard',
      BRANCH: 'branch',
      REGISTRATION_HISTORY: 'registration-history',
      PAYMENT_HISTORY: 'payment-history',
      DISH: 'dish',
      ORDER: 'orders',
      DIETARY: 'dietary-preferences',
      GHOST_PIN: 'ghost-pin',
      CAMPAIGN: 'campaign',
      CAMPAIGN_SYSTEM: 'campaign/system',
    },
  },

  // Payment routes (standalone, outside vendor layout)
  PAYMENT: {
    SUCCESS: '/Payment/success',
    CANCEL: '/Payment/cancel',
  },
};
