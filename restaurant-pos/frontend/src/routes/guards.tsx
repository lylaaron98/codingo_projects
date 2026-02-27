import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import type { Role } from '@/utils/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();
  const location = useLocation();

  // Wait for store to hydrate before making routing decisions
  if (!_hasHydrated) {
    return null; // Or a loading spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to role's home page
    const roleRoutes: Record<Role, string> = {
      WAITER: '/waiter/tables',
      KITCHEN: '/kitchen',
      CASHIER: '/cashier',
      MANAGER: '/manager/menu',
    };
    return <Navigate to={roleRoutes[user.role]} replace />;
  }

  return <>{children}</>;
}

export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();

  // Wait for store to hydrate before making routing decisions
  if (!_hasHydrated) {
    return null; // Or a loading spinner
  }

  if (isAuthenticated && user) {
    // Redirect to role's home page
    const roleRoutes: Record<Role, string> = {
      WAITER: '/waiter/tables',
      KITCHEN: '/kitchen',
      CASHIER: '/cashier',
      MANAGER: '/manager/menu',
    };
    return <Navigate to={roleRoutes[user.role]} replace />;
  }

  return <>{children}</>;
}
