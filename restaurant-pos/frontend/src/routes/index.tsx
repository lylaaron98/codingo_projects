import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from './guards';
import LoginPage from '@/pages/LoginPage';
import WaiterTablesPage from '@/pages/waiter/TablesPage';
import WaiterOrderPage from '@/pages/waiter/OrderPage';
import KitchenPage from '@/pages/kitchen/KitchenPage';
import CashierPage from '@/pages/cashier/CashierPage';
import ManagerMenuPage from '@/pages/manager/MenuPage';
import ManagerReportsPage from '@/pages/manager/ReportsPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Waiter routes */}
      <Route
        path="/waiter/tables"
        element={
          <ProtectedRoute allowedRoles={['WAITER']}>
            <WaiterTablesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/waiter/order/:sessionId"
        element={
          <ProtectedRoute allowedRoles={['WAITER']}>
            <WaiterOrderPage />
          </ProtectedRoute>
        }
      />

      {/* Kitchen routes */}
      <Route
        path="/kitchen"
        element={
          <ProtectedRoute allowedRoles={['KITCHEN']}>
            <KitchenPage />
          </ProtectedRoute>
        }
      />

      {/* Cashier routes */}
      <Route
        path="/cashier"
        element={
          <ProtectedRoute allowedRoles={['CASHIER']}>
            <CashierPage />
          </ProtectedRoute>
        }
      />

      {/* Manager routes */}
      <Route
        path="/manager/menu"
        element={
          <ProtectedRoute allowedRoles={['MANAGER']}>
            <ManagerMenuPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/reports"
        element={
          <ProtectedRoute allowedRoles={['MANAGER']}>
            <ManagerReportsPage />
          </ProtectedRoute>
        }
      />

      {/* Default redirects */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
