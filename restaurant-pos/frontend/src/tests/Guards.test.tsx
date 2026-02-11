import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from '@/routes/guards';
import { useAuthStore } from '@/stores/authStore';

vi.mock('@/stores/authStore');

const TestComponent = ({ text }: { text: string }) => <div>{text}</div>;

describe('Route Guards', () => {
  describe('ProtectedRoute', () => {
    it('redirects to login when not authenticated', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        isAuthenticated: false,
        user: null,
        token: null,
        login: vi.fn(),
        logout: vi.fn(),
      });

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/login" element={<TestComponent text="Login Page" />} />
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <TestComponent text="Protected Content" />
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Login Page')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('allows access when authenticated', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        isAuthenticated: true,
        user: { id: '1', username: 'testuser', role: 'WAITER' },
        token: 'test-token',
        login: vi.fn(),
        logout: vi.fn(),
      });

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/login" element={<TestComponent text="Login Page" />} />
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <TestComponent text="Protected Content" />
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
    });

    it('redirects when role not allowed', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        isAuthenticated: true,
        user: { id: '1', username: 'testuser', role: 'WAITER' },
        token: 'test-token',
        login: vi.fn(),
        logout: vi.fn(),
      });

      render(
        <MemoryRouter initialEntries={['/manager']}>
          <Routes>
            <Route path="/waiter/tables" element={<TestComponent text="Waiter Home" />} />
            <Route
              path="/manager"
              element={
                <ProtectedRoute allowedRoles={['MANAGER']}>
                  <TestComponent text="Manager Content" />
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Waiter Home')).toBeInTheDocument();
      expect(screen.queryByText('Manager Content')).not.toBeInTheDocument();
    });
  });

  describe('PublicRoute', () => {
    it('allows access when not authenticated', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        isAuthenticated: false,
        user: null,
        token: null,
        login: vi.fn(),
        logout: vi.fn(),
      });

      render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <TestComponent text="Login Page" />
                </PublicRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    it('redirects to role home when authenticated', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        isAuthenticated: true,
        user: { id: '1', username: 'testuser', role: 'WAITER' },
        token: 'test-token',
        login: vi.fn(),
        logout: vi.fn(),
      });

      render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/waiter/tables" element={<TestComponent text="Waiter Home" />} />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <TestComponent text="Login Page" />
                </PublicRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Waiter Home')).toBeInTheDocument();
      expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
    });
  });
});
