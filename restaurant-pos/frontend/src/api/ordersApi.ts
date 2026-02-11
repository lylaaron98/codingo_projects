import http from './http';

export type OrderStatus = 'NEW' | 'IN_PROGRESS' | 'READY' | 'SERVED';

export interface OrderItem {
  menuItemId: string;
  nameSnapshot: string;
  priceSnapshot: number;
  qty: number;
  notes?: string;
}

export interface Order {
  _id: string;
  sessionId: string;
  tableNumber?: number;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  items: Array<{
    menuItemId: string;
    qty: number;
    notes?: string;
  }>;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

export const ordersApi = {
  createOrder: async (
    sessionId: string,
    data: CreateOrderRequest
  ): Promise<Order> => {
    const response = await http.post<{ order: Order }>(
      `/sessions/${sessionId}/orders`,
      data
    );
    return response.data.order;
  },

  getKitchenOrders: async (status?: string): Promise<Order[]> => {
    const params = status ? { status } : {};
    const response = await http.get<{ orders: Order[] }>('/orders/kitchen', { params });
    return response.data.orders;
  },

  updateOrderStatus: async (
    orderId: string,
    data: UpdateOrderStatusRequest
  ): Promise<Order> => {
    const response = await http.patch<{ order: Order }>(
      `/orders/${orderId}/status`,
      data
    );
    return response.data.order;
  },
};
