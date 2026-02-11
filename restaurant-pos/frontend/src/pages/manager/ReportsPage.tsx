import { useState } from 'react';
import { Card, DatePicker, Row, Col, Statistic, Table, Space } from 'antd';
import { DollarOutlined, ShoppingOutlined, TrophyOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/api/reportsApi';
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
    </div>
  );
}
