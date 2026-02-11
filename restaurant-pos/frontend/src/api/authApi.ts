import http from './http';
import type { AuthResponse } from '@/utils/types';

export interface LoginRequest {
  username: string;
  password: string;
}

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await http.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  seed: async (): Promise<{ message: string }> => {
    const response = await http.post<{ message: string }>('/auth/seed');
    return response.data;
  },
};
