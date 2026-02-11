import { Card, Button, Empty } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

export default function TablesPage() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1>Table Management</h1>
        <Button type="primary" icon={<PlusOutlined />}>
          Add Table
        </Button>
      </div>
      <Card>
        <Empty description="No tables configured yet" />
      </Card>
    </div>
  );
}
