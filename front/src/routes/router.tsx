import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { AuthGuard } from '@/guards/auth-guard';
import { GuestGuard } from '@/guards/guest-guard';
import { AuthLayout } from '@/layouts/auth';
import { DashboardLayout } from '@/layouts/dashboard';
import { LazyPage } from './lazy-page';
import { paths } from './paths';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to={paths.dashboard.root} replace />,
  },
  {
    path: paths.auth.root,
    element: (
      <GuestGuard>
        <AuthLayout />
      </GuestGuard>
    ),
    children: [
      {
        index: true,
        path: paths.auth.root,
        element: <Navigate to={paths.auth.login} replace />,
      },
      {
        path: paths.auth.login,
        element: LazyPage(() => import('@/pages/auth/login')),
      },
    ],
  },
  {
    path: paths.dashboard.root,
    element: (
      <AuthGuard>
        <DashboardLayout />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        path: paths.dashboard.root,
        element: <Navigate to={paths.dashboard.home} replace />,
      },
      {
        path: paths.dashboard.home,
        element: LazyPage(() => import('@/pages/dashboard/home')),
      },
      /* ------------------------------- MANAGEMENT ------------------------------- */
      {
        path: paths.dashboard.management.root,
        children: [
          {
            index: true,
            path: paths.dashboard.management.root,
            element: <Navigate to={paths.dashboard.management.admins.root} replace />,
          },
          {
            path: paths.dashboard.management.admins.root,
            children: [
              {
                index: true,
                path: paths.dashboard.management.admins.root,
                element: <Navigate to={paths.dashboard.management.admins.list} replace />,
              },
              {
                path: paths.dashboard.management.admins.list,
                element: LazyPage(() => import('@/pages/dashboard/management/admins/list')),
              },
            ],
          },
        ],
      },
      /* ------------------------------- LOCALIZATION ------------------------------- */
      {
        path: paths.dashboard.localization.root,
        children: [
          {
            index: true,
            path: paths.dashboard.localization.root,
            element: <Navigate to={paths.dashboard.localization.langs.root} replace />,
          },
          {
            path: paths.dashboard.localization.langs.root,
            children: [
              {
                index: true,
                path: paths.dashboard.localization.langs.root,
                element: <Navigate to={paths.dashboard.localization.langs.list} replace />,
              },
              {
                path: paths.dashboard.localization.langs.list,
                element: LazyPage(() => import('@/pages/dashboard/localization/langs/list')),
              },
            ],
          },
          {
            path: paths.dashboard.localization.wordbooks.root,
            children: [
              {
                index: true,
                path: paths.dashboard.localization.wordbooks.root,
                element: <Navigate to={paths.dashboard.localization.wordbooks.list} replace />,
              },
              {
                path: paths.dashboard.localization.wordbooks.list,
                element: LazyPage(() => import('@/pages/dashboard/localization/wordbooks/list')),
              },
              {
                path: paths.dashboard.localization.wordbooks.edit,
                element: LazyPage(() => import('@/pages/dashboard/localization/wordbooks/edit')),
              },
            ],
          },
        ],
      },
    ],
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
