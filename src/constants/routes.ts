export const ROUTES = {
  BASE: '/:userType?',
  LOGIN: '/:userType?/login',
  NEW_CUSTOMER_PROFILE: '/new-customer-profile',

  // Moderator routes
  MODERATOR: {
    REVENUE: '/moderator/revenue',
    TRANSACTIONS: '/moderator/transactions',
    VERIFICATION: '/moderator/verification',
    POSTS: '/moderator/posts',
    USERS: '/moderator/users',
    CASHOUT: '/moderator/cashout',
  },
};
