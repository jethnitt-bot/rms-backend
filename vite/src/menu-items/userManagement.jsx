import { UserOutlined } from '@ant-design/icons';

const icons = {
  UserOutlined
};

const userManagement = {
  id: 'user-management',
  title: 'User Management',
  type: 'group',
  children: [
    {
      id: 'users',
      title: 'Users List',
      type: 'item',
      url: '/users',
      icon: icons.UserOutlined
    }
  ]
};

export default userManagement;
