import apiClient from './client';

export interface HealthResponse {
  status: string;
  timestamp: string;
  database?: string;
}

export const healthApi = {
  check: async (): Promise<HealthResponse> => {
    const response = await apiClient.get<HealthResponse>('/health');
    return response.data;
  },
};
