import { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  App,
  Space,
  Tag,
} from 'antd';
import { PlusOutlined, UserOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  usersApi,
  type User,
  type CreateUserRequest,
} from '@/api/usersApi';
import type { Role } from '@/utils/types';
import dayjs from 'dayjs';

const { Option } = Select;

const roleColors: Record<Role, string> = {
  WAITER: 'blue',
  KITCHEN: 'orange',
  CASHIER: 'green',
  MANAGER: 'purple',
};

export default function UsersPage() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getUsers,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateUserRequest) => usersApi.createUser(data),
    onSuccess: () => {
      message.success('User created successfully!');
      setIsModalVisible(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      message.error(
        error.response?.data?.error?.message || 'Failed to create user'
      );
    },
  });

  const handleAdd = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleSubmit = (values: CreateUserRequest) => {
    createMutation.mutate(values);
  };

  const columns = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      render: (text: string) => (
        <Space>
          <UserOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: Role) => (
        <Tag color={roleColors[role]}>{role}</Tag>
      ),
      filters: [
        { text: 'Waiter', value: 'WAITER' },
        { text: 'Kitchen', value: 'KITCHEN' },
        { text: 'Cashier', value: 'CASHIER' },
        { text: 'Manager', value: 'MANAGER' },
      ],
      onFilter: (value: any, record: User) => record.role === value,
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('MMM D, YYYY h:mm A'),
      sorter: (a: User, b: User) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title="User Management"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Create User
          </Button>
        }
      >
        <Table
          dataSource={users}
          columns={columns}
          loading={isLoading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} users`,
          }}
        />
      </Card>

      <Modal
        title="Create New User"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: '24px' }}
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[
              { required: true, message: 'Please enter a username' },
              { min: 3, message: 'Username must be at least 3 characters' },
            ]}
          >
            <Input placeholder="Enter username" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please enter a password' },
              { min: 6, message: 'Password must be at least 6 characters' },
            ]}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select a role' }]}
          >
            <Select placeholder="Select a role">
              <Option value="WAITER">
                <Tag color={roleColors.WAITER}>Waiter</Tag>
              </Option>
              <Option value="KITCHEN">
                <Tag color={roleColors.KITCHEN}>Kitchen</Tag>
              </Option>
              <Option value="CASHIER">
                <Tag color={roleColors.CASHIER}>Cashier</Tag>
              </Option>
              <Option value="MANAGER">
                <Tag color={roleColors.MANAGER}>Manager</Tag>
              </Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createMutation.isPending}
              >
                Create User
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
