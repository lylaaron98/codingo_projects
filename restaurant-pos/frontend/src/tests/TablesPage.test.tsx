import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TablesPage from '@/pages/waiter/TablesPage';
import { tablesApi } from '@/api/tablesApi';

vi.mock('@/api/tablesApi');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const renderTablesPage = () => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TablesPage />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('TablesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders tables from API', async () => {
    const mockTables = [
      { _id: '1', tableNumber: 1, status: 'FREE' as const },
      { _id: '2', tableNumber: 2, status: 'OCCUPIED' as const, currentSessionId: 'session-2' },
    ];

    vi.mocked(tablesApi.getTables).mockResolvedValue(mockTables);

    renderTablesPage();

    await waitFor(() => {
      expect(screen.getByText('Table 1')).toBeInTheDocument();
      expect(screen.getByText('Table 2')).toBeInTheDocument();
    });

    expect(screen.getByText('FREE')).toBeInTheDocument();
    expect(screen.getByText('OCCUPIED')).toBeInTheDocument();
  });
});
