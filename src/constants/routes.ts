export const ROUTES = {
  LOGIN: '/login',
  ROOT: '/',
  NEW_CUSTOMER_PROFILE: '/new-customer-profile',
  VENDOR_REGISTRATION: '/vendor-registration',
  USER_INFO_SETUP: '/user-info-setup',

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
      BADGE: 'badge',
      USER_WITH_DIETARY: 'users-with-dietary',
      CATEGORY: 'category',
    },
  },
};
