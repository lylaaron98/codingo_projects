export type Role = 'WAITER' | 'KITCHEN' | 'CASHIER' | 'MANAGER';

export interface User {
  id: string;
  username: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    role: Role;
  };
}
