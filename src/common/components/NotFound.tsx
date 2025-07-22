import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const [t] = useTranslation('common')
  return (
    <Result
      status="404"
      title="404"
      subTitle={t('notFound')}
      extra={
        <Button type="primary" onClick={() => navigate('/')}>
          {t('backToHomePage')}
        </Button>
      }
    />
  );
};

export default NotFound;