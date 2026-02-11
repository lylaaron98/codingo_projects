import http from './http';

export type TableStatus = 'FREE' | 'OCCUPIED';

export interface Table {
  _id: string;
  tableNumber: number;
  status: TableStatus;
  currentSessionId?: string;
}

export const tablesApi = {
  getTables: async (): Promise<Table[]> => {
    const response = await http.get<{ tables: Table[] }>('/tables');
    return response.data.tables;
  },
};
