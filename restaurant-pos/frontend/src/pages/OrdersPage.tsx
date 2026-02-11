import { Card, Button, Empty } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

export default function OrdersPage() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1>Orders</h1>
        <Button type="primary" icon={<PlusOutlined />}>
          New Order
        </Button>
      </div>
      <Card>
        <Empty description="No active orders" />
      </Card>
    </div>
  );
}
