import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
const AccessLimit: React.FC = () => {
  const navigate = useNavigate();
  const [t] = useTranslation('common')
  return (
    <Result
      status="403"
      title="403"
      subTitle={t('accessLimit')}
      extra={
        <Button type="primary" onClick={() => navigate('/projects')}>
          {t('backToHomePage')}
        </Button>
      }
    />
  );
};

export default AccessLimit;