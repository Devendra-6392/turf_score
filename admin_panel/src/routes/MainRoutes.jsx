import { lazy } from 'react';

// project imports
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';

// render- Dashboard
const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/default')));

// render - sample page
const SamplePage = Loadable(lazy(() => import('pages/extra-pages/sample-page')));

// render - management
const TurfManagement = Loadable(lazy(() => import('pages/management/TurfManagement')));
const BookingManagement = Loadable(lazy(() => import('pages/management/BookingManagement')));
const AdminManagement = Loadable(lazy(() => import('pages/management/AdminManagement')));
const EmployeeManagement = Loadable(lazy(() => import('pages/management/EmployeeManagement')));
const SlotManagement = Loadable(lazy(() => import('pages/management/SlotManagement')));
const CheckInManagement = Loadable(lazy(() => import('pages/management/CheckInManagement')));
const BannerManagement = Loadable(lazy(() => import('pages/management/BannerManagement')));
const WalletManagement = Loadable(lazy(() => import('pages/management/WalletManagement')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <DashboardLayout />,
  children: [
    {
      path: '/',
      element: <DashboardDefault />
    },
    {
      path: 'dashboard',
      children: [
        {
          path: 'default',
          element: <DashboardDefault />
        }
      ]
    },
    {
      path: 'manage',
      children: [
        {
          path: 'turfs',
          element: <TurfManagement />
        },
        {
          path: 'bookings',
          element: <BookingManagement />
        },
        {
          path: 'admins',
          element: <AdminManagement />
        },
        {
          path: 'employees',
          element: <EmployeeManagement />
        },
        {
          path: 'turfs/:id/slots',
          element: <SlotManagement />
        },
        {
          path: 'check-ins',
          element: <CheckInManagement />
        },
        {
          path: 'banners',
          element: <BannerManagement />
        },
        {
          path: 'wallets',
          element: <WalletManagement />
        }
      ]
    },
    {
      path: 'sample-page',
      element: <SamplePage />
    }
  ]
};

export default MainRoutes;
