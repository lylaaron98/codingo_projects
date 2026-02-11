import http from './http';
import type { Role } from '@/utils/types';

export interface User {
  id: string;
  username: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  role: Role;
}

export interface CreateUserResponse {
  user: User;
}

export interface GetUsersResponse {
  users: User[];
}

export const usersApi = {
  getUsers: async (): Promise<User[]> => {
    const response = await http.get<GetUsersResponse>('/users');
    return response.data.users;
  },

  createUser: async (data: CreateUserRequest): Promise<User> => {
    const response = await http.post<CreateUserResponse>('/users/create', data);
    return response.data.user;
  },
};
