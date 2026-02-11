import { useState } from 'react';
import { Card, Table, Button, Modal, Radio, App, Spin, Tag, DatePicker } from 'antd';
import { DollarOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tablesApi } from '@/api/tablesApi';
import { sessionsApi, type PayRequest } from '@/api/sessionsApi';
import { paymentsApi } from '@/api/paymentsApi';
import { formatMoney } from '@/utils/money';
import { formatDateTime, getTodayISO, formatDateISO } from '@/utils/dates';
import dayjs, { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;

export default function CashierPage() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD'>('CASH');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [dateRange, setDateRange] = useState<[string, string]>([
    getTodayISO(),
    getTodayISO(),
  ]);

  const { data: tables, isLoading } = useQuery({
    queryKey: ['tables'],
    queryFn: tablesApi.getTables,
    refetchInterval: 5000,
  });

  const { data: paymentHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['payment-history', ...dateRange],
    queryFn: () => paymentsApi.getHistory(dateRange[0], dateRange[1]),
    refetchInterval: 3000,
  });

  const { data: bill, isLoading: billLoading } = useQuery({
    queryKey: ['bill', selectedSessionId],
    queryFn: () => sessionsApi.getBill(selectedSessionId!),
    enabled: !!selectedSessionId,
  });

  const payMutation = useMutation({
    mutationFn: (data: { sessionId: string; method: PayRequest['method'] }) =>
      sessionsApi.pay(data.sessionId, { method: data.method }),
    onSuccess: () => {
      message.success('Payment processed successfully!');
      setIsModalVisible(false);
      setSelectedSessionId(null);
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      queryClient.invalidateQueries({ queryKey: ['payment-history'] });
    },
    onError: (error: any) => {
      message.error(
        error.response?.data?.error?.message || 'Payment failed'
      );
    },
  });

  const handleViewBill = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setIsModalVisible(true);
  };

  const handlePay = () => {
    if (!selectedSessionId) return;
    payMutation.mutate({
      sessionId: selectedSessionId,
      method: paymentMethod,
    });
  };

  const handleRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange([
        formatDateISO(dates[0].toDate()),
        formatDateISO(dates[1].toDate()),
      ]);
    }
  };

  const occupiedTables = tables?.filter((t: any) => t.status === 'OCCUPIED');

  const openSessionColumns = [
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
      render: (status: string) => (
        <Tag color={status === 'OCCUPIED' ? 'orange' : 'green'}>{status}</Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => (
        <Button
          type="primary"
          icon={<DollarOutlined />}
          onClick={() => handleViewBill(record.currentSessionId)}
          disabled={!record.currentSessionId}
        >
          View Bill & Pay
        </Button>
      ),
    },
  ];

  const historyColumns = [
    {
      title: 'Table',
      dataIndex: 'tableNumber',
      key: 'tableNumber',
      render: (num: number) => `Table ${num}`,
    },
    {
      title: 'Order IDs',
      dataIndex: 'orderIds',
      key: 'orderIds',
      render: (orderIds: string[]) => (
        <div>
          {orderIds && orderIds.length > 0 ? (
            orderIds.map(id => (
              <Tag key={id} color="blue" style={{ marginBottom: '4px' }}>
                #{id.slice(-6)}
              </Tag>
            ))
          ) : (
            <span style={{ color: '#999' }}>N/A</span>
          )}
        </div>
      ),
    },
    {
      title: 'Bill Items',
      dataIndex: 'items',
      key: 'items',
      render: (items: any[]) => (
        <div>
          {items && items.length > 0 ? (
            items.map((item, index) => (
              <div key={index} style={{ fontSize: '12px' }}>
                <strong>{item.qty}x</strong> {item.name} - {formatMoney(item.subtotal)}
              </div>
            ))
          ) : (
            <span style={{ color: '#999' }}>No items</span>
          )}
        </div>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => formatMoney(amount),
    },
    {
      title: 'Payment Method',
      dataIndex: 'method',
      key: 'method',
      render: (method: string) => (
        <Tag color={method === 'CASH' ? 'green' : 'blue'}>{method}</Tag>
      ),
    },
    {
      title: 'Paid At',
      dataIndex: 'paidAt',
      key: 'paidAt',
      render: (date: string) => formatDateTime(date),
    },
    {
      title: 'Session Duration',
      key: 'duration',
      render: (_: any, record: any) => {
        const opened = new Date(record.openedAt);
        const closed = new Date(record.closedAt);
        const minutes = Math.round((closed.getTime() - opened.getTime()) / 60000);
        return `${minutes} min`;
      },
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
    <div>
      <h1>Cashier - Open Sessions</h1>
      <Card style={{ marginBottom: '24px' }}>
        <Table
          dataSource={occupiedTables}
          columns={openSessionColumns}
          rowKey="_id"
          pagination={false}
          locale={{ emptyText: 'No open sessions' }}
        />
      </Card>

      <h2>Payment History</h2>
      <Card>
        <div style={{ marginBottom: '16px' }}>
          <RangePicker
            value={[dayjs(dateRange[0]), dayjs(dateRange[1])]}
            onChange={handleRangeChange}
            format="YYYY-MM-DD"
          />
        </div>
        <Table
          dataSource={paymentHistory}
          columns={historyColumns}
          rowKey="_id"
          loading={historyLoading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'No payment records for selected date range' }}
        />
      </Card>

      <Modal
        title="Bill Details"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedSessionId(null);
        }}
        footer={null}
        width={600}
      >
        {billLoading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin />
          </div>
        ) : bill ? (
          <>
            <div style={{ marginBottom: '16px' }}>
              <h3>Table {bill.tableNumber}</h3>
              <p>Session opened: {formatDateTime(bill.openedAt)}</p>
            </div>

            <Table
              dataSource={bill.items}
              columns={[
                {
                  title: 'Item',
                  dataIndex: 'name',
                  key: 'name',
                },
                {
                  title: 'Price',
                  dataIndex: 'price',
                  key: 'price',
                  render: (price: number) => formatMoney(price),
                },
                {
                  title: 'Qty',
                  dataIndex: 'qty',
                  key: 'qty',
                },
                {
                  title: 'Subtotal',
                  dataIndex: 'subtotal',
                  key: 'subtotal',
                  render: (subtotal: number) => formatMoney(subtotal),
                },
              ]}
              pagination={false}
              size="small"
              rowKey="name"
            />

            <div
              style={{
                marginTop: '16px',
                padding: '16px',
                background: '#f5f5f5',
                borderRadius: '4px',
              }}
            >
              <h2 style={{ margin: 0, textAlign: 'right' }}>
                Total: {formatMoney(bill.total)}
              </h2>
            </div>

            <div style={{ marginTop: '24px' }}>
              <h4>Payment Method:</h4>
              <Radio.Group
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ marginBottom: '16px' }}
              >
                <Radio.Button value="CASH">Cash</Radio.Button>
                <Radio.Button value="CARD">Card</Radio.Button>
              </Radio.Group>

              <Button
                type="primary"
                size="large"
                block
                onClick={handlePay}
                loading={payMutation.isPending}
              >
                Process Payment
              </Button>
            </div>
          </>
        ) : null}
      </Modal>
    </div>
  );
}
