import React from 'react';
import { Layout, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

const { Footer } = Layout;
const { Text } = Typography;

const AppFooter: React.FC = () => {
  const { t } = useTranslation(['mainLayout']);

  return (
    <Footer
      style={{
        background: '#f5f5f5',
        padding: '24px',
        color: 'rgba(0, 0, 0, 0.65)',
        fontSize: 14,
        textAlign: 'center',
      }}
    >
      <Text >© {new Date().getFullYear()} {t('footer.copyright')}</Text>
    </Footer>
  );
};

export default AppFooter;