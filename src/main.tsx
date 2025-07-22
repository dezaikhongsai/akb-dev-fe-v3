import '@ant-design/v5-patch-for-react-19';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Provider } from 'react-redux';
import { store } from './common/stores/store.ts';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor } from './common/stores/store.ts';
import './common/configs/i18n.config.ts';
import 'antd/dist/reset.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <Provider store={store}>
      <PersistGate  persistor={persistor}>
          <App />
      </PersistGate>
    </Provider>
);