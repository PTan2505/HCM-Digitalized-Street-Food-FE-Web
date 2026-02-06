export const apiUrl = {
  otp: {
    generate: '/users/otp/generate/',
  },
  token: {
    verify: '/users/token/verify/',
    refresh: '/users/token/refresh/',
  },
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
};
