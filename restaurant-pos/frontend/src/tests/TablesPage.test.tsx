import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TablesPage from '@/pages/waiter/TablesPage';
import { tablesApi } from '@/api/tablesApi';
import { sessionsApi } from '@/api/sessionsApi';

vi.mock('@/api/tablesApi');
vi.mock('@/api/sessionsApi');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

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

  it('opens session for free table and navigates to order page', async () => {
    const user = userEvent.setup();
    const mockTables = [{ _id: '1', tableNumber: 1, status: 'FREE' as const }];
    const mockSession = { _id: 'new-session', tableId: '1', status: 'OPEN' as const, openedAt: new Date().toISOString() };

    vi.mocked(tablesApi.getTables).mockResolvedValue(mockTables);
    vi.mocked(sessionsApi.openSession).mockResolvedValue(mockSession);

    renderTablesPage();

    await waitFor(() => {
      expect(screen.getByText('Table 1')).toBeInTheDocument();
    });

    const tableCard = screen.getByText('Table 1').closest('.ant-card');
    await user.click(tableCard!);

    await waitFor(() => {
      expect(sessionsApi.openSession).toHaveBeenCalledWith({ tableId: '1' });
      expect(mockNavigate).toHaveBeenCalledWith('/waiter/order/new-session');
    });
  });

  it('navigates to existing session for occupied table', async () => {
    const user = userEvent.setup();
    const mockTables = [
      { _id: '2', tableNumber: 2, status: 'OCCUPIED' as const, currentSessionId: 'existing-session' },
    ];

    vi.mocked(tablesApi.getTables).mockResolvedValue(mockTables);

    renderTablesPage();

    await waitFor(() => {
      expect(screen.getByText('Table 2')).toBeInTheDocument();
    });

    const tableCard = screen.getByText('Table 2').closest('.ant-card');
    await user.click(tableCard!);

    expect(mockNavigate).toHaveBeenCalledWith('/waiter/order/existing-session');
  });
});
