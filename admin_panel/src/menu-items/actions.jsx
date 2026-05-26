import { CalendarOutlined, QrcodeOutlined, SafetyCertificateOutlined, ScheduleOutlined } from '@ant-design/icons';

const actions = {
  id: 'more-actions',
  title: 'More Actions',
  type: 'group',
  children: [
    {
      id: 'today-schedule',
      title: "Today's Schedule",
      type: 'item',
      url: '/manage/bookings?filter=TODAY',
      icon: ScheduleOutlined,
      permission: { resource: 'bookings', action: 'view' }
    },
    {
      id: 'cancellation-requests',
      title: 'Cancellation Requests',
      type: 'item',
      url: '/manage/bookings?filter=REQUESTED',
      icon: CalendarOutlined,
      permission: { resource: 'bookings', action: 'view' }
    },
    {
      id: 'gate-checkins',
      title: 'Gate QR & Arrivals',
      type: 'item',
      url: '/manage/check-ins',
      icon: QrcodeOutlined,
      permission: { resource: 'checkins', action: 'view' }
    },
    {
      id: 'staff-permissions',
      title: 'Staff Permissions',
      type: 'item',
      url: '/manage/employees',
      icon: SafetyCertificateOutlined,
      roles: ['SUPER_ADMIN', 'TURF_ADMIN']
    }
  ]
};

export default actions;
