import { TeamOutlined, TagOutlined, CustomerServiceOutlined } from '@ant-design/icons';

const icons = {
  TeamOutlined,
  TagOutlined,
  CustomerServiceOutlined
};

const operations = {
  id: 'operations',
  title: 'Platform Operations',
  type: 'group',
  children: [
    {
      id: 'users-manage',
      title: 'User Management',
      type: 'item',
      url: '/manage/users',
      icon: icons.TeamOutlined,
      roles: ['SUPER_ADMIN']
    },
    {
      id: 'coupons-manage',
      title: 'Coupons & Offers',
      type: 'item',
      url: '/manage/coupons',
      icon: icons.TagOutlined,
      roles: ['SUPER_ADMIN', 'TURF_ADMIN']
    },
    {
      id: 'support-manage',
      title: 'Support Tickets',
      type: 'item',
      url: '/manage/support',
      icon: icons.CustomerServiceOutlined,
      roles: ['SUPER_ADMIN', 'TURF_ADMIN']
    }
  ]
};

export default operations;
