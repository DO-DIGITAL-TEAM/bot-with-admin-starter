export const paths = {
  auth: {
    root: '/auth',
    login: '/auth/login',
  },

  dashboard: {
    root: '/dashboard',
    home: '/dashboard/home',
    management: {
      root: '/dashboard/management',
      admins: {
        root: '/dashboard/management/admins',
        list: '/dashboard/management/admins/list',
      },
    },
  },
};
