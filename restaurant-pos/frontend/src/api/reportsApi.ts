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

export const reportsApi = {
  getDailyReport: async (date: string): Promise<DailyReport> => {
    const response = await http.get<DailyReport>(`/reports/daily`, {
      params: { date },
    });
    return response.data;
  },

  getTopItems: async (from: string, to: string): Promise<TopItem[]> => {
    const response = await http.get<{ items: TopItem[] }>(`/reports/top-items`, {
      params: { from, to },
    });
    return response.data.items;
  },
};
