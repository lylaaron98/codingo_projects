import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/api/authApi';
import { useAuthStore } from '@/stores/authStore';
import type { LoginRequest } from '@/api/authApi';
import type { AuthResponse, Role } from '@/utils/types';

export default function LoginPage() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const getRoleRoute = (role: Role): string => {
    const routes: Record<Role, string> = {
      WAITER: '/waiter/tables',
      KITCHEN: '/kitchen',
      CASHIER: '/cashier',
      MANAGER: '/manager/menu',
    };
    return routes[role];
  };

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (data: AuthResponse) => {
      login(data.token, data.user.username, data.user.role);
      message.success('Login successful!');
      navigate(getRoleRoute(data.user.role), { replace: true });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || 'Invalid credentials';
      
      // Show notification
      message.error(errorMessage);
      
      // Only highlight password field to avoid username enumeration
      // (Standard security practice - don't reveal if username exists)
      form.setFields([
        { 
          name: 'password', 
          errors: [errorMessage],
          validating: false,
          touched: true,
        },
      ]);
    },
  });

  const onFinish = (values: LoginRequest) => {
    loginMutation.mutate(values);
  };

  const handleFieldChange = () => {
    // Clear errors when user starts typing
    const usernameErrors = form.getFieldError('username');
    const passwordErrors = form.getFieldError('password');
    
    if (usernameErrors.length > 0 || passwordErrors.length > 0) {
      form.setFields([
        { name: 'username', errors: [] },
        { name: 'password', errors: [] },
      ]);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f0f2f5',
      }}
    >
      <Card
        title="Restaurant POS"
        style={{ width: 400 }}
        styles={{ header: { textAlign: 'center', fontSize: '24px', fontWeight: 'bold' } }}
      >
        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Username"
              size="large"
              onChange={handleFieldChange}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
              onChange={handleFieldChange}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loginMutation.isPending}
            >
              Log in
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
