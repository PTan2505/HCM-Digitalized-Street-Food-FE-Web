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
      POSTS: 'posts',
      USERS: 'users',
      CASHOUT: 'cashout',
    },
  },

  // Manager routes
  MANAGER: {
    BASE: '/manager',
    // Child paths
    PATHS: {
      ORDER: 'orders',
      BRANCH: 'branches',
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
      REVENUE: 'revenue',
      TRANSACTIONS: 'transactions',
      BADGE_USERS: 'badge-users',
      USER_DIETARY: 'user-dietary',
      USERS: 'users',
      VENDORS: 'vendors',
      BADGE: 'badge',
      USER_WITH_DIETARY: 'users-with-dietary',
      CATEGORY: 'category',
      TASTE: 'taste',
      FEEDBACK_TAG: 'feedback-tag',
      CAMPAIGN: 'campaign',
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
    },
  },

  // Payment routes (standalone, outside vendor layout)
  PAYMENT: {
    SUCCESS: '/Payment/success',
    CANCEL: '/Payment/cancel',
  },
};
