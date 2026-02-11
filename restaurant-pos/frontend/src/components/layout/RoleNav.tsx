import { Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  TableOutlined,
  CoffeeOutlined,
  DollarOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import type { Role } from '@/utils/types';

interface RoleNavProps {
  role: Role;
}

export default function RoleNav({ role }: RoleNavProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = {
    WAITER: [
      {
        key: '/waiter/tables',
        label: 'Tables',
        icon: <TableOutlined />,
      },
    ],
    KITCHEN: [
      {
        key: '/kitchen',
        label: 'Kitchen Orders',
        icon: <CoffeeOutlined />,
      },
    ],
    CASHIER: [
      {
        key: '/cashier',
        label: 'Cashier',
        icon: <DollarOutlined />,
      },
    ],
    MANAGER: [
      {
        key: '/manager/menu',
        label: 'Menu',
        icon: <AppstoreOutlined />,
      },
      {
        key: '/manager/reports',
        label: 'Reports',
        icon: <BarChartOutlined />,
      },
      {
        key: '/manager/users',
        label: 'Users',
        icon: <TeamOutlined />,
      },
    ],
  };

  const items = menuItems[role] || [];

  // Find the current selected key
  const selectedKey = items.find((item) =>
    location.pathname.startsWith(item.key)
  )?.key;

  return (
    <Menu
      mode="horizontal"
      theme="dark"
      selectedKeys={selectedKey ? [selectedKey] : []}
      items={items}
      onClick={({ key }) => navigate(key)}
      style={{ flex: 1, border: 'none' }}
    />
  );
}
