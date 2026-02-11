import { Card, Table, Button, Tag, Space, App, Spin } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi, type Order, type OrderStatus } from '@/api/ordersApi';
import { formatDateTime } from '@/utils/dates';

export default function KitchenPage() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['kitchen-orders'],
    queryFn: () => ordersApi.getKitchenOrders('NEW,IN_PROGRESS'),
    refetchInterval: 2000, // Poll every 2 seconds
  });

  const { data: completedOrders, isLoading: isLoadingCompleted } = useQuery({
    queryKey: ['kitchen-completed-orders'],
    queryFn: () => ordersApi.getKitchenOrders('READY,SERVED'),
    refetchInterval: 5000, // Poll every 5 seconds
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      ordersApi.updateOrderStatus(orderId, { status }),
    onSuccess: () => {
      message.success('Order status updated!');
      queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });
      queryClient.invalidateQueries({ queryKey: ['kitchen-completed-orders'] });
    },
    onError: (error: any) => {
      message.error(
        error.response?.data?.error?.message || 'Failed to update status'
      );
    },
  });

  const handleUpdateStatus = (orderId: string, status: OrderStatus) => {
    updateStatusMutation.mutate({ orderId, status });
  };

  const activeColumns = [
    {
      title: 'Order ID',
      dataIndex: '_id',
      key: '_id',
      render: (id: string) => `#${id.slice(-6)}`,
    },
    {
      title: 'Table',
      dataIndex: 'tableNumber',
      key: 'tableNumber',
      render: (num: number) => `Table ${num}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: OrderStatus) => {
        const colors: Record<OrderStatus, string> = {
          NEW: 'red',
          IN_PROGRESS: 'orange',
          READY: 'green',
          SERVED: 'blue',
        };
        return <Tag color={colors[status]}>{status}</Tag>;
      },
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: (items: any[]) => (
        <div>
          {items.map((item, index) => (
            <div key={index}>
              <strong>{item.qty}x</strong> {item.nameSnapshot}
              {item.notes && (
                <div style={{ color: '#999', fontSize: '12px' }}>
                  Note: {item.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'Time',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => formatDateTime(date),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Order) => (
        <Space>
          {record.status === 'NEW' && (
            <Button
              type="primary"
              onClick={() => handleUpdateStatus(record._id, 'IN_PROGRESS')}
              loading={updateStatusMutation.isPending}
            >
              Start Preparing
            </Button>
          )}
          {record.status === 'IN_PROGRESS' && (
            <Button
              type="primary"
              style={{ backgroundColor: '#52c41a' }}
              onClick={() => handleUpdateStatus(record._id, 'READY')}
              loading={updateStatusMutation.isPending}
            >
              Mark Ready
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const completedColumns = [
    {
      title: 'Order ID',
      dataIndex: '_id',
      key: '_id',
      render: (id: string) => `#${id.slice(-6)}`,
      sorter: (a: Order, b: Order) => a._id.localeCompare(b._id),
    },
    {
      title: 'Table',
      dataIndex: 'tableNumber',
      key: 'tableNumber',
      render: (num: number) => `Table ${num}`,
      sorter: (a: Order, b: Order) => (a.tableNumber || 0) - (b.tableNumber || 0),
      filters: Array.from(
        new Set(
          completedOrders
            ?.map((o: Order) => o.tableNumber)
            .filter((num): num is number => num !== undefined)
        )
      )
        .sort((a, b) => a - b)
        .map((num) => ({ text: `Table ${num}`, value: num })),
      onFilter: (value: any, record: Order) => record.tableNumber === value,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: OrderStatus) => {
        const colors: Record<OrderStatus, string> = {
          NEW: 'red',
          IN_PROGRESS: 'orange',
          READY: 'green',
          SERVED: 'blue',
        };
        return <Tag color={colors[status]}>{status}</Tag>;
      },
      filters: [
        { text: 'Ready', value: 'READY' },
        { text: 'Served', value: 'SERVED' },
      ],
      onFilter: (value: any, record: Order) => record.status === value,
      defaultFilteredValue: null,
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: (items: any[]) => (
        <div>
          {items.map((item, index) => (
            <div key={index}>
              <strong>{item.qty}x</strong> {item.nameSnapshot}
              {item.notes && (
                <div style={{ color: '#999', fontSize: '12px' }}>
                  Note: {item.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'Completed At',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: string) => formatDateTime(date),
      sorter: (a: Order, b: Order) =>
        new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
      defaultSortOrder: 'descend' as const,
    },
  ];

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <h1>Kitchen Orders</h1>
      
      <Card title="Active Orders" style={{ marginBottom: '24px' }}>
        <Table
          dataSource={orders}
          columns={activeColumns}
          rowKey="_id"
          pagination={false}
          locale={{ emptyText: 'No orders in queue' }}
        />
      </Card>

      <Card title="Completed Orders">
        <Table
          dataSource={completedOrders}
          columns={completedColumns}
          rowKey="_id"
          loading={isLoadingCompleted}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} completed orders`,
          }}
          locale={{ emptyText: 'No completed orders' }}
        />
      </Card>
    </div>
  );
}
