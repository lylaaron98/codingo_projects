import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Role, User } from '@/utils/types';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  _version: number; // Version for store migration
  setHasHydrated: (state: boolean) => void;
  login: (token: string, username: string, role: Role) => void;
  logout: () => void;
}

const STORE_VERSION = 1; // Increment this when store structure changes

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      _hasHydrated: false,
      _version: STORE_VERSION,
      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },
      login: (token: string, username: string, role: Role) => {
        localStorage.setItem('auth_token', token);
        set({
          token,
          user: { id: '', username, role },
          isAuthenticated: true,
        });
      },
      logout: () => {
        localStorage.removeItem('auth_token');
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'auth-storage',
      version: STORE_VERSION,
      migrate: (persistedState: any, version: number) => {
        // Clear old incompatible state
        if (version !== STORE_VERSION || !persistedState._hasHydrated) {
          return {
            token: null,
            user: null,
            isAuthenticated: false,
            _hasHydrated: false,
            _version: STORE_VERSION,
          };
        }
        return persistedState;
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
