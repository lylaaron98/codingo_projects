import { useState } from 'react';
import { Card, DatePicker, Row, Col, Statistic, Table, Space, Tag, TableColumnsType } from 'antd';
import { DollarOutlined, ShoppingOutlined, TrophyOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { reportsApi, CompletedOrder, CompletedOrderItem } from '@/api/reportsApi';
import { formatMoney } from '@/utils/money';
import { getTodayISO, formatDateISO } from '@/utils/dates';
import dayjs, { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;

export default function ReportsPage() {
  const [dailyDate, setDailyDate] = useState(getTodayISO());
  const [dateRange, setDateRange] = useState<[string, string]>([
    getTodayISO(),
    getTodayISO(),
  ]);
  const [ordersDateRange, setOrdersDateRange] = useState<[string, string]>([
    getTodayISO(),
    getTodayISO(),
  ]);

  const { data: dailyReport } = useQuery({
    queryKey: ['daily-report', dailyDate],
    queryFn: () => reportsApi.getDailyReport(dailyDate),
    refetchInterval: 3000, // Refresh every 3 seconds
  });

  const { data: topItems } = useQuery({
    queryKey: ['top-items', ...dateRange],
    queryFn: () => reportsApi.getTopItems(dateRange[0], dateRange[1]),
    refetchInterval: 3000, // Refresh every 3 seconds
  });

  const { data: completedOrders } = useQuery({
    queryKey: ['completed-orders', ...ordersDateRange],
    queryFn: () => reportsApi.getCompletedOrders(ordersDateRange[0], ordersDateRange[1]),
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const handleDailyDateChange = (date: Dayjs | null) => {
    if (date) {
      setDailyDate(formatDateISO(date.toDate()));
    }
  };

  const handleRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange([
        formatDateISO(dates[0].toDate()),
        formatDateISO(dates[1].toDate()),
      ]);
    }
  };

  const handleOrdersRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      setOrdersDateRange([
        formatDateISO(dates[0].toDate()),
        formatDateISO(dates[1].toDate()),
      ]);
    }
  };

  const topItemsColumns = [
    {
      title: 'Rank',
      key: 'rank',
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'Item',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Total Sold',
      dataIndex: 'totalQty',
      key: 'totalQty',
    },
    {
      title: 'Revenue',
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      render: (revenue: number) => formatMoney(revenue),
    },
  ];

  const completedOrdersColumns: TableColumnsType<CompletedOrder> = [
    {
      title: 'Session ID',
      dataIndex: 'sessionId',
      key: 'sessionId',
      render: (id: string) => id.slice(-6).toUpperCase(),
    },
    {
      title: 'Table',
      dataIndex: 'tableNumber',
      key: 'tableNumber',
      sorter: (a, b) => {
        const aNum = typeof a.tableNumber === 'number' ? a.tableNumber : 0;
        const bNum = typeof b.tableNumber === 'number' ? b.tableNumber : 0;
        return aNum - bNum;
      },
      filters: Array.from(new Set(completedOrders?.map((o) => o.tableNumber)))
        .sort()
        .map((num) => ({ text: `Table ${num}`, value: num })),
      onFilter: (value, record) => record.tableNumber === value,
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: (items: CompletedOrderItem[]) => (
        <div style={{ maxWidth: 300 }}>
          {items.map((item, idx) => (
            <div key={idx} style={{ marginBottom: 4 }}>
              <strong>{item.qty}x</strong> {item.name} - {formatMoney(item.subtotal)}
              {item.notes && <div style={{ fontSize: '12px', color: '#888' }}>Note: {item.notes}</div>}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => <strong>{formatMoney(amount)}</strong>,
      sorter: (a, b) => a.totalAmount - b.totalAmount,
    },
    {
      title: 'Payment Method',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method: string) => (
        <Tag color={method === 'CASH' ? 'green' : 'blue'}>{method}</Tag>
      ),
      filters: [
        { text: 'Cash', value: 'CASH' },
        { text: 'Card', value: 'CARD' },
      ],
      onFilter: (value, record) => record.paymentMethod === value,
    },
    {
      title: 'Closed At',
      dataIndex: 'closedAt',
      key: 'closedAt',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
      sorter: (a, b) => new Date(a.closedAt).getTime() - new Date(b.closedAt).getTime(),
      defaultSortOrder: 'descend' as const,
    },
  ];

  return (
    <div>
      <h1>Reports</h1>

      <Card title="Daily Report" style={{ marginBottom: '24px' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <DatePicker
            value={dayjs(dailyDate)}
            onChange={handleDailyDateChange}
            format="YYYY-MM-DD"
          />

          <Row gutter={16}>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Total Revenue"
                  value={dailyReport?.totalRevenue || 0}
                  prefix={<DollarOutlined />}
                  precision={2}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Total Orders"
                  value={dailyReport?.totalOrders || 0}
                  prefix={<ShoppingOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Customers Served"
                  value={dailyReport?.totalCustomers || 0}
                  prefix={<TrophyOutlined />}
                />
              </Card>
            </Col>
          </Row>
        </Space>
      </Card>

      <Card title="Top Selling Items">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <RangePicker
            value={[dayjs(dateRange[0]), dayjs(dateRange[1])]}
            onChange={handleRangeChange}
            format="YYYY-MM-DD"
          />

          <Table
            dataSource={topItems || []}
            columns={topItemsColumns}
            rowKey="name"
            pagination={false}
          />
        </Space>
      </Card>

      <Card title="Completed Orders & Bill Details" style={{ marginTop: '24px' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <RangePicker
            value={[dayjs(ordersDateRange[0]), dayjs(ordersDateRange[1])]}
            onChange={handleOrdersRangeChange}
            format="YYYY-MM-DD"
          />

          <Table
            dataSource={completedOrders || []}
            columns={completedOrdersColumns}
            rowKey="sessionId"
            pagination={{
              pageSize: 10,
              showTotal: (total) => `Total ${total} completed orders`,
            }}
          />
        </Space>
      </Card>
    </div>
  );
}
