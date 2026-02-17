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
    localization: {
      root: '/dashboard/localization',
      langs: {
        root: '/dashboard/localization/langs',
        list: '/dashboard/localization/langs/list',
      },
      wordbooks: {
        root: '/dashboard/localization/wordbooks',
        list: '/dashboard/localization/wordbooks/list',
        edit: '/dashboard/localization/wordbooks/edit/:id',
      },
    },
  },
};
