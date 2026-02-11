import { Layout, Button, Typography } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/stores/authStore';
import RoleNav from './RoleNav';

const { Header, Content } = Layout;
const { Text } = Typography;

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flex: 1, maxWidth: '70%' }}>
          <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
            Restaurant POS
          </div>
          {user && <RoleNav role={user.role} />}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {user && (
            <>
              <Text style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                {user.username} ({user.role})
              </Text>
              <Button
                type="text"
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                style={{ color: 'white' }}
              >
                Logout
              </Button>
            </>
          )}
        </div>
      </Header>
      <Content style={{ padding: '24px' }}>{children}</Content>
    </Layout>
  );
}
