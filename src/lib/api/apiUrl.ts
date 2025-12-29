export const apiUrl = {
  otp: {
    generate: '/users/otp/generate/',
  },
  token: {
    verify: '/users/token/verify/',
    refresh: '/users/token/refresh/',
  },
  login: {
    admin: 'users/admin-login/',
    customer: '/users/login/',
  },
  profile: {
    admin: '/users/profile/',
    customer: '/users/profile/',
  },
  users: {
    list: '/users/',
  },
};
