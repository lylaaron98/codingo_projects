import { useLocation } from 'react-router-dom';
import { App as AntdApp } from 'antd';
import AppShell from './components/layout/AppShell';
import AppRoutes from './routes';
import './App.css';

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  // Don't show AppShell on login page
  if (isLoginPage) {
    return (
      <AntdApp>
        <AppRoutes />
      </AntdApp>
    );
  }

  return (
    <AntdApp>
      <AppShell>
        <AppRoutes />
      </AppShell>
    </AntdApp>
  );
}

export default App;
