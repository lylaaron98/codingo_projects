import http from './http';

export interface PaymentHistoryItem {
  _id: string;
  tableNumber: number;
  amount: number;
  method: 'CASH' | 'CARD';
  paidAt: string;
  sessionId: string;
  openedAt: string;
  closedAt: string;
}

export interface PaymentHistoryResponse {
  history: PaymentHistoryItem[];
}

export const paymentsApi = {
  getHistory: async (startDate?: string, endDate?: string): Promise<PaymentHistoryItem[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await http.get<PaymentHistoryResponse>(
      `/payments/history${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data.history;
  },
};
