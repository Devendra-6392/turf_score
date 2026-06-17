// assets
import { AppstoreAddOutlined, CalendarOutlined, UsergroupAddOutlined, PictureOutlined, WalletOutlined, BellOutlined } from '@ant-design/icons';

// icons
const icons = {
  AppstoreAddOutlined,
  CalendarOutlined,
  UsergroupAddOutlined,
  PictureOutlined,
  WalletOutlined,
  BellOutlined
};

// ==============================|| MENU ITEMS - MANAGEMENT ||============================== //

const management = {
  id: 'management',
  title: 'Management',
  type: 'group',
  children: [
    {
      id: 'turf-manage',
      title: 'My Turf',
      type: 'item',
      url: '/manage/turfs',
      icon: icons.AppstoreAddOutlined,
      permission: { resource: 'turfs', action: 'view' }
    },
    {
      id: 'booking-manage',
      title: 'Bookings',
      type: 'item',
      url: '/manage/bookings',
      icon: icons.CalendarOutlined,
      permission: { resource: 'bookings', action: 'view' }
    },
    {
      id: 'slot-manage',
      title: 'Availability Slots',
      type: 'item',
      url: '/manage/turfs/:assignedTurfId/slots',
      icon: icons.CalendarOutlined,
      roles: ['TURF_ADMIN', 'EMPLOYEE'],
      assignedTurf: true,
      permission: { resource: 'slots', action: 'view' }
    },
    {
      id: 'admin-manage',
      title: 'Team Management',
      type: 'item',
      url: '/manage/admins',
      icon: icons.UsergroupAddOutlined,
      roles: ['SUPER_ADMIN']
    },
    {
      id: 'employee-manage',
      title: 'Employee Access',
      type: 'item',
      url: '/manage/employees',
      icon: icons.UsergroupAddOutlined,
      roles: ['SUPER_ADMIN', 'TURF_ADMIN']
    },
    {
      id: 'banner-manage',
      title: 'Banners',
      type: 'item',
      url: '/manage/banners',
      icon: icons.PictureOutlined,
      roles: ['SUPER_ADMIN']
    },
    {
      id: 'wallet-manage',
      title: 'Wallet Management',
      type: 'item',
      url: '/manage/wallets',
      icon: icons.WalletOutlined,
      roles: ['SUPER_ADMIN']
    },
    {
      id: 'notification-manage',
      title: 'Push Notifications',
      type: 'item',
      url: '/manage/notifications',
      icon: icons.BellOutlined
    }
  ]
};

export default management;
