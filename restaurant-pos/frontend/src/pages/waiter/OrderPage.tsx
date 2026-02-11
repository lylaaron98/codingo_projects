import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Input,
  Button,
  Table,
  InputNumber,
  message,
  Spin,
  Tag,
  Space,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  MinusOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menuApi, type MenuItem } from '@/api/menuApi';
import { ordersApi } from '@/api/ordersApi';
import { useCartStore, type CartItem } from '@/stores/cartStore';
import { formatMoney } from '@/utils/money';

const { Search } = Input;

export default function OrderPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState('');

  const { items: cartItems, addItem, updateQty, updateNotes, removeItem, clearCart, getTotal } = useCartStore();

  const { data: menuItems, isLoading } = useQuery({
    queryKey: ['menu'],
    queryFn: menuApi.getItems,
  });

  const createOrderMutation = useMutation({
    mutationFn: () => {
      if (!sessionId) throw new Error('No session ID');
      return ordersApi.createOrder(sessionId, {
        items: cartItems.map((item: CartItem) => ({
          menuItemId: item.menuItemId,
          qty: item.qty,
          notes: item.notes,
        })),
      });
    },
    onSuccess: () => {
      message.success('Order sent to kitchen!');
      clearCart();
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error: any) => {
      message.error(
        error.response?.data?.error?.message || 'Failed to create order'
      );
    },
  });

  const handleAddToCart = (item: MenuItem) => {
    addItem({
      menuItemId: item._id,
      name: item.name,
      price: item.price,
    });
    message.success(`${item.name} added to cart`);
  };

  const handleSubmitOrder = () => {
    if (cartItems.length === 0) {
      message.warning('Cart is empty');
      return;
    }
    createOrderMutation.mutate();
  };

  const filteredMenu = menuItems?.filter(
    (item: MenuItem) =>
      item.isAvailable &&
      item.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const cartColumns = [
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
      key: 'qty',
      render: (_: any, record: any) => (
        <Space>
          <Button
            size="small"
            icon={<MinusOutlined />}
            onClick={() => updateQty(record.menuItemId, record.qty - 1)}
          />
          <InputNumber
            size="small"
            min={1}
            value={record.qty}
            onChange={(val) => val && updateQty(record.menuItemId, val)}
            style={{ width: '60px' }}
          />
          <Button
            size="small"
            icon={<PlusOutlined />}
            onClick={() => updateQty(record.menuItemId, record.qty + 1)}
          />
        </Space>
      ),
    },
    {
      title: 'Subtotal',
      key: 'subtotal',
      render: (_: any, record: any) => formatMoney(record.price * record.qty),
    },
    {
      title: 'Notes',
      key: 'notes',
      render: (_: any, record: any) => (
        <Input.TextArea
          size="small"
          value={record.notes || ''}
          onChange={(e) => updateNotes(record.menuItemId, e.target.value)}
          placeholder="Special instructions..."
          rows={1}
        />
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => (
        <Button
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => removeItem(record.menuItemId)}
        />
      ),
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
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Create Order</h1>
        <Button onClick={() => navigate('/waiter/tables')}>
          Back to Tables
        </Button>
      </div>

      <Row gutter={16}>
        <Col span={14}>
          <Card title="Menu" extra={
            <Search
              placeholder="Search menu items..."
              allowClear
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
              prefix={<SearchOutlined />}
            />
          }>
            <Row gutter={[16, 16]}>
              {filteredMenu?.map((item: MenuItem) => (
                <Col key={item._id} xs={24} sm={12} lg={8}>
                  <Card
                    hoverable
                    onClick={() => handleAddToCart(item)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div style={{ textAlign: 'center' }}>
                      <h3 style={{ margin: 0 }}>{item.name}</h3>
                      <Tag color="blue">{item.category}</Tag>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '8px' }}>
                        {formatMoney(item.price)}
                      </div>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        style={{ marginTop: '8px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(item);
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        <Col span={10}>
          <Card
            title={
              <span>
                <ShoppingCartOutlined /> Cart ({cartItems.length})
              </span>
            }
          >
            <Table
              dataSource={cartItems}
              columns={cartColumns}
              rowKey="menuItemId"
              pagination={false}
              scroll={{ y: 400 }}
              footer={() => (
                <div style={{ textAlign: 'right', fontSize: '18px', fontWeight: 'bold' }}>
                  Total: {formatMoney(getTotal())}
                </div>
              )}
            />
            <Button
              type="primary"
              size="large"
              block
              style={{ marginTop: '16px' }}
              onClick={handleSubmitOrder}
              loading={createOrderMutation.isPending}
              disabled={cartItems.length === 0}
            >
              Submit Order to Kitchen
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
