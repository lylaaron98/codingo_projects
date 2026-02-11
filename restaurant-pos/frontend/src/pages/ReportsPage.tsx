import { Card, Empty, DatePicker, Space } from 'antd';

const { RangePicker } = DatePicker;

export default function ReportsPage() {
  return (
    <div>
      <h1>Reports</h1>
      <Space style={{ marginBottom: 16 }}>
        <RangePicker />
      </Space>
      <Card>
        <Empty description="No data available" />
      </Card>
    </div>
  );
}
