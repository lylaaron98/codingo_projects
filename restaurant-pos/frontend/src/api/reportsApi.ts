import http from './http';

export interface DailyReport {
  date: string;
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
}

export interface TopItem {
  name: string;
  category: string;
  totalQty: number;
  totalRevenue: number;
}

export interface CompletedOrderItem {
  name: string;
  price: number;
  qty: number;
  subtotal: number;
  notes?: string;
}

export interface CompletedOrder {
  sessionId: string;
  tableNumber: number | string;
  items: CompletedOrderItem[];
  totalAmount: number;
  paymentMethod: 'CASH' | 'CARD';
  openedAt: string;
  closedAt: string;
  paidAt: string;
}

export const reportsApi = {
  getDailyReport: async (date: string): Promise<DailyReport> => {
    const response = await http.get<{ report: DailyReport }>(`/reports/daily`, {
      params: { date },
    });
    return response.data.report;
  },

  getTopItems: async (from: string, to: string): Promise<TopItem[]> => {
    const response = await http.get<{ items: TopItem[] }>(`/reports/top-items`, {
      params: { from, to },
    });
    return response.data.items;
  },

  getCompletedOrders: async (startDate: string, endDate: string): Promise<CompletedOrder[]> => {
    const response = await http.get<{ orders: CompletedOrder[] }>(`/reports/completed-orders`, {
      params: { startDate, endDate },
    });
    return response.data.orders;
  },
};
