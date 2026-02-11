import http from './http';

export interface MenuItem {
  _id: string;
  name: string;
  price: number;
  category: string;
  isAvailable: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMenuItemRequest {
  name: string;
  price: number;
  category: string;
  isAvailable?: boolean;
}

export interface UpdateMenuItemRequest {
  name?: string;
  price?: number;
  category?: string;
  isAvailable?: boolean;
}

export const menuApi = {
  getItems: async (): Promise<MenuItem[]> => {
    const response = await http.get<{ items: MenuItem[] }>('/menu/items');
    return response.data.items;
  },

  createItem: async (data: CreateMenuItemRequest): Promise<MenuItem> => {
    const response = await http.post<{ item: MenuItem }>('/menu/items', data);
    return response.data.item;
  },

  updateItem: async (
    id: string,
    data: UpdateMenuItemRequest
  ): Promise<MenuItem> => {
    const response = await http.patch<{ item: MenuItem }>(`/menu/items/${id}`, data);
    return response.data.item;
  },

  deleteItem: async (id: string): Promise<void> => {
    await http.delete(`/menu/items/${id}`);
  },
};
