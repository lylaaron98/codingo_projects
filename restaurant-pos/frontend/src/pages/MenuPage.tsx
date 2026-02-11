import { Card, Button, Empty } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

export default function MenuPage() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1>Menu Management</h1>
        <Button type="primary" icon={<PlusOutlined />}>
          Add Menu Item
        </Button>
      </div>
      <Card>
        <Empty description="No menu items yet" />
      </Card>
    </div>
  );
}
