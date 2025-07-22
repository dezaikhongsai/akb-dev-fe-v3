import React from 'react';
import { ConfigProvider } from 'antd';
import viVN from 'antd/lib/locale/vi_VN';
import jaJP from 'antd/lib/locale/ja_JP';
import { useTranslation } from 'react-i18next';
import { BrowserRouter } from 'react-router-dom';
import AppRoute from './common/routes/AppRoute';
import './styles/global.css';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor } from './common/stores/store';

const App: React.FC = () => {
  const { i18n } = useTranslation();
  const locale = i18n.language === 'vi' ? viVN : jaJP;

  return (
    <ConfigProvider locale={locale} >
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <AppRoute />
        </BrowserRouter>
      </PersistGate>
    </ConfigProvider>
  );
};

export default App;