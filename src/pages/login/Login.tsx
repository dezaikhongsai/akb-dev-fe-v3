import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import Cookies from 'js-cookie';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../common/stores/auth/authSlice';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../common/components/LanguageSwitcher';
import { login } from '../../services/auth';
import { useNavigate } from 'react-router-dom';

interface LoginForm {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const { t } = useTranslation(['login', 'common']);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const isProd = import.meta.env.VITE_IS_PROD === 'true';

  const onFinish = async (values: LoginForm) => {
    setLoading(true);
    try {
      // 1. Đăng nhập và lấy token
      const response = await login(values.email, values.password);
      
      if (response?.data?.accessToken) {
        const { accessToken, refreshToken, user } = response.data;
        
        // 2. Clear existing cookies first
        Cookies.remove('accessToken', { path: '/' });
        Cookies.remove('refreshToken', { path: '/' });
        
        // 3. Set new tokens with specific path
        Cookies.set('accessToken', accessToken, { 
          expires: 7,
          path: '/',
          secure: isProd, // Thay đổi từ true thành false cho localhost
          sameSite: isProd ? 'strict' : 'lax' // Thay đổi từ 'strict' thành 'lax' cho localhost
        });

        Cookies.set('refreshToken', refreshToken, {
          expires: 7,
          path: '/',
          secure: isProd  , // Thay đổi từ true thành false cho localhost
          sameSite: isProd ? 'strict' : 'lax' // Thay đổi từ 'strict' thành 'lax' cho localhost
        });

        // Debug logging
        console.log('🍪 Login Cookie Debug:', {
          accessTokenSet: Cookies.get('accessToken') ? 'SUCCESS' : 'FAILED',
          refreshTokenSet: Cookies.get('refreshToken') ? 'SUCCESS' : 'FAILED',
          allCookies: document.cookie,
          timestamp: new Date().toISOString()
        });

        // 4. Update redux store with complete user data
        dispatch(loginSuccess({
          user,
          accessToken,
          refreshToken
        }));

        // 5. Chuyển hướng và thông báo thành công
        message.success(t('common:messages.success.login'));
        
        // Đảm bảo Redux được update hoàn toàn trước khi navigate
        // Sử dụng Promise để đảm bảo state được update
        await new Promise(resolve => setTimeout(resolve, 200));
        navigate('/projects');
      } else {
        throw new Error(t('common:messages.error.invalid_response'));
      }
    } catch (error: any) {
      message.error(error.message || t('common:messages.error.login_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#f0f2f5'
    }}>
      <Card style={{ width: 400, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 25, fontSize: '40px' }}>
          <img
            src="/akb-icon.ico"
            alt="Logo"
            style={{
              width: '100px',
              marginBottom: '10px'
            }}
          />
          <p style={{ fontSize: '15px', color: '#333', fontWeight: 500 }}>
            {t('slogan')}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <LanguageSwitcher />
          </div>
        </div>

        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: t('email_required') },
              { type: 'email', message: t('email_invalid') }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder={t('email')}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: t('password_required') }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={t('password')}
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" loading={loading} icon={<LoginOutlined />}>
              {t('login')}
            </Button>
          </Form.Item>
        </Form>

        <div style={{
          textAlign: 'center',
          fontSize: '12px',
          color: '#8c8c8c',
          marginTop: '16px'
        }}>
          <span style={{ fontSize: '12px', color: '#8c8c8c' }}><em>{t('footer')}</em></span>
        </div>
      </Card>
    </div>
  );
};

export default Login;