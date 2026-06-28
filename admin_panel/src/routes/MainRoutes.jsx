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
const UsersManagement = Loadable(lazy(() => import('pages/management/UsersManagement')));
const CouponsManagement = Loadable(lazy(() => import('pages/management/CouponsManagement')));
const SupportTicketsManagement = Loadable(lazy(() => import('pages/management/SupportTicketsManagement')));
const NotificationManagement = Loadable(lazy(() => import('pages/management/NotificationManagement')));
const SubscriptionManagement = Loadable(lazy(() => import('pages/management/SubscriptionManagement')));
const POSManagement = Loadable(lazy(() => import('pages/management/POSManagement')));
const EquipmentManagement = Loadable(lazy(() => import('pages/management/EquipmentManagement')));
const ExpenseManagement = Loadable(lazy(() => import('pages/management/ExpenseManagement')));

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
        },
        {
          path: 'users',
          element: <UsersManagement />
        },
        {
          path: 'coupons',
          element: <CouponsManagement />
        },
        {
          path: 'support',
          element: <SupportTicketsManagement />
        },
        {
          path: 'notifications',
          element: <NotificationManagement />
        },
        {
          path: 'subscriptions',
          element: <SubscriptionManagement />
        },
        {
          path: 'pos',
          element: <POSManagement />
        },
        {
          path: 'equipment',
          element: <EquipmentManagement />
        },
        {
          path: 'expenses',
          element: <ExpenseManagement />
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
