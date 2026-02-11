import { Card, Row, Col, Statistic } from 'antd';
import { ShoppingOutlined, TableOutlined, DollarOutlined, UsergroupAddOutlined } from '@ant-design/icons';

export default function HomePage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Orders"
              value={0}
              prefix={<ShoppingOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Tables"
              value={0}
              prefix={<TableOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Today's Revenue"
              value={0}
              prefix={<DollarOutlined />}
              precision={2}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Customers Served"
              value={0}
              prefix={<UsergroupAddOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
