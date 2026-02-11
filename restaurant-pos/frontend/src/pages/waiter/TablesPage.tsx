import { Card, Row, Col, Tag, Spin, message, Button } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { tablesApi } from '@/api/tablesApi';
import { sessionsApi } from '@/api/sessionsApi';
import type { Table } from '@/api/tablesApi';

export default function TablesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: tables, isLoading } = useQuery({
    queryKey: ['tables'],
    queryFn: tablesApi.getTables,
    refetchInterval: 3000, // Refresh every 3 seconds
  });

  const openSessionMutation = useMutation({
    mutationFn: (tableId: string) => sessionsApi.openSession({ tableId }),
    onSuccess: async (session) => {
      message.success('Session opened successfully!');
      await queryClient.invalidateQueries({ queryKey: ['tables'] });
      // Small delay to ensure state updates
      setTimeout(() => {
        navigate(`/waiter/order/${session._id}`);
      }, 300);
    },
    onError: (error: any) => {
      message.error(
        error.response?.data?.error?.message || 'Failed to open session'
      );
    },
  });

  const closeSessionMutation = useMutation({
    mutationFn: (sessionId: string) => sessionsApi.closeSession(sessionId),
    onSuccess: async () => {
      message.success('Table freed successfully!');
      await queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
    onError: (error: any) => {
      message.error(
        error.response?.data?.error?.message || 'Failed to free table'
      );
    },
  });

  const handleTableClick = (table: Table) => {
    if (table.status === 'FREE') {
      openSessionMutation.mutate(table._id);
    } else if (table.currentSessionId) {
      navigate(`/waiter/order/${table.currentSessionId}`);
    }
  };

  const handleFreeTable = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation(); // Prevent card click
    closeSessionMutation.mutate(sessionId);
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <h1>Tables</h1>
      <Row gutter={[16, 16]}>
        {tables?.map((table: Table) => (
          <Col key={table._id} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              onClick={() => handleTableClick(table)}
              style={{
                textAlign: 'center',
                cursor: 'pointer',
                borderColor:
                  table.status === 'OCCUPIED' ? '#faad14' : '#52c41a',
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '8px' }}>
                🪑
              </div>
              <h2 style={{ margin: 0 }}>Table {table.tableNumber}</h2>
              <Tag
                color={table.status === 'FREE' ? 'green' : 'orange'}
                style={{ marginTop: '8px' }}
              >
                {table.status}
              </Tag>
              {table.status === 'OCCUPIED' && table.currentSessionId && (
                <Button
                  danger
                  size="small"
                  style={{ marginTop: '8px' }}
                  onClick={(e) => handleFreeTable(e, table.currentSessionId!)}
                  loading={closeSessionMutation.isPending}
                >
                  Free Table
                </Button>
              )}
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
