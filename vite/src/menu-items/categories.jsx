import {
  UserOutlined,
  AppstoreOutlined,
  ShopOutlined,
  TableOutlined,
  UsergroupAddOutlined,
  CalendarOutlined,
  ShoppingOutlined,
  FireOutlined,
  FileTextOutlined,
  DatabaseOutlined,
  TeamOutlined,
  BarChartOutlined,
  SettingOutlined
} from '@ant-design/icons';

const icons = {
  UserOutlined,
  AppstoreOutlined,
  ShopOutlined,
  TableOutlined,
  UsergroupAddOutlined,
  CalendarOutlined,
  ShoppingOutlined,
  FireOutlined,
  FileTextOutlined,
  DatabaseOutlined,
  TeamOutlined,
  BarChartOutlined,
  SettingOutlined
};

const categories = {
  id: 'group-categories',
  title: 'Management',
  type: 'group',
  children: [
    {
      id: 'orders',
      title: 'Orders',
      type: 'item',
      url: '/orders',
      icon: icons.ShoppingOutlined,
      breadcrumbs: false
    },
    {
      id: 'kitchen',
      title: 'Kitchen',
      type: 'item',
      url: '/kitchen',
      icon: icons.FireOutlined,
      breadcrumbs: false
    },
    {
      id: 'tables',
      title: 'Tables',
      type: 'item',
      url: '/tables',
      icon: icons.TableOutlined,
      breadcrumbs: false
    },
    {
      id: 'reservations',
      title: 'Reservations',
      type: 'item',
      url: '/reservations',
      icon: icons.CalendarOutlined,
      breadcrumbs: false
    },
    {
      id: 'menu',
      title: 'Menu',
      type: 'item',
      url: '/menu',
      icon: icons.ShopOutlined,
      breadcrumbs: false
    },
    {
      id: 'categories',
      title: 'Categories',
      type: 'item',
      url: '/categories',
      icon: icons.AppstoreOutlined,
      breadcrumbs: false
    },

    {
      id: 'billing',
      title: 'Billing',
      type: 'item',
      url: '/billing',
      icon: icons.FileTextOutlined,
      breadcrumbs: false
    },
    {
      id: 'inventory',
      title: 'Inventory',
      type: 'item',
      url: '/inventory',
      icon: icons.DatabaseOutlined,
      breadcrumbs: false
    },
    {
      id: 'suppliers',
      title: 'Suppliers',
      type: 'item',
      url: '/suppliers',
      icon: icons.TeamOutlined,
      breadcrumbs: false
    },
    {
      id: 'reports',
      title: 'Reports',
      type: 'item',
      url: '/reports',
      icon: icons.BarChartOutlined,
      breadcrumbs: false
    },
    {
      id: 'settings',
      title: 'Settings',
      type: 'item',
      url: '/settings',
      icon: icons.SettingOutlined,
      breadcrumbs: false
    },
    {
      id: 'user-management',
      title: 'User Management',
      type: 'item',
      url: '/users',
      icon: icons.UserOutlined,
      breadcrumbs: false
    }
  ]
};

export default categories;
