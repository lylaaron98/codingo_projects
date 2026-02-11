import http from './http';

export type SessionStatus = 'OPEN' | 'CLOSED';

export interface Session {
  _id: string;
  tableId: string;
  status: SessionStatus;
  openedAt: string;
  closedAt?: string;
}

export interface OpenSessionRequest {
  tableId: string;
}

export interface BillItem {
  name: string;
  price: number;
  qty: number;
  subtotal: number;
}

export interface Bill {
  sessionId: string;
  tableNumber: number;
  items: BillItem[];
  total: number;
  openedAt: string;
}

export interface PayRequest {
  method: 'CASH' | 'CARD';
}

export interface PayResponse {
  message: string;
  payment: {
    _id: string;
    sessionId: string;
    amount: number;
    method: string;
    paidAt: string;
  };
}

export const sessionsApi = {
  openSession: async (data: OpenSessionRequest): Promise<Session> => {
    const response = await http.post<{ session: Session }>('/sessions/open', data);
    return response.data.session;
  },

  getBill: async (sessionId: string): Promise<Bill> => {
    const response = await http.get<{ bill: Bill }>(`/sessions/${sessionId}/bill`);
    return response.data.bill;
  },

  pay: async (sessionId: string, data: PayRequest): Promise<PayResponse> => {
    const response = await http.post<PayResponse>(
      `/sessions/${sessionId}/pay`,
      data
    );
    return response.data;
  },

  closeSession: async (sessionId: string): Promise<Session> => {
    const response = await http.post<{ session: Session }>(`/sessions/${sessionId}/close`);
    return response.data.session;
  },
};
