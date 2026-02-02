export const ROUTES = {
  BASE: '/:userType?',
  LOGIN: '/:userType?/login',
  NEW_CUSTOMER_PROFILE: '/new-customer-profile',

  // Admin routes
  ADMIN: {
    REVENUE: '/admin/revenue',
    TRANSACTIONS: '/admin/transactions',
    VERIFICATION: '/admin/verification',
    POSTS: '/admin/posts',
    USERS: '/admin/users',
    CASHOUT: '/admin/cashout',
  },
};
