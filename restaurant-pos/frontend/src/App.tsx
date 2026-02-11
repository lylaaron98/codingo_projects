import { useLocation } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import AppRoutes from './routes';
import './App.css';

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  // Don't show AppShell on login page
  if (isLoginPage) {
    return <AppRoutes />;
  }

  return (
    <AppShell>
      <AppRoutes />
    </AppShell>
  );
}

export default App;
