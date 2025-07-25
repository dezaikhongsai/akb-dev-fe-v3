import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import viCommon from '../locales/vi/common.json';
import jaCommon from '../locales/ja/common.json';
import viLogin from '../locales/vi/login.json';
import jaLogin from '../locales/ja/login.json';
import jaMainLayout from '../locales/ja/mainLayout.json';
import viMainlayout from '../locales/vi/mainLayout.json';
import jaUser from '../locales/ja/user.json';
import viUser from '../locales/vi/user.json';
import jaCustomer from '../locales/ja/customer.json';
import viCustomer from '../locales/vi/customer.json';
import jaProjectRequest from '../locales/ja/projectRequest.json';
import viProjectRequest from '../locales/vi/projectRequest.json';
import viProject from '../locales/vi/project.json';
import jaProject from '../locales/ja/project.json';
import viProjectDetail from '../locales/vi/projectDetail.json';
import jaProjectDetail from '../locales/ja/projectDetail.json';
import viProjectResponse from '../locales/vi/projectResponse.json';
import jaProjectResponse from '../locales/ja/projectResponse.json';
import viEmailConfig from '../locales/vi/emailConfig.json';
import jaEmailConfig from '../locales/ja/emailConfig.json';
import viHome from '../locales/vi/home.json';
import jaHome from '../locales/ja/home.json';
import viDocument from '../locales/vi/document.json';
import jaDocument from '../locales/ja/document.json';



const savedLanguage = localStorage.getItem('language') || 'vi';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      vi: {
        common: viCommon,
        login: viLogin,
        mainLayout: viMainlayout,
        user: viUser,
        customer: viCustomer,
        projectRequest: viProjectRequest,
        project: viProject,
        projectDetail: viProjectDetail,
        projectResponse: viProjectResponse,
        emailConfig: viEmailConfig,
        home: viHome,
        document: viDocument
      },
      ja: {
        common: jaCommon,
        login: jaLogin,
        mainLayout: jaMainLayout,
        user: jaUser,
        customer: jaCustomer,
        projectRequest: jaProjectRequest,
        project: jaProject,
        projectDetail: jaProjectDetail,
        projectResponse: jaProjectResponse,
        emailConfig: jaEmailConfig,
        home: jaHome,
        document: jaDocument
        // login: jaLogin,
      },
    },
    lng: savedLanguage,
    fallbackLng: 'vi',
    ns: ['common', 'login', 'mainLayout', 'user', 'customer', 'projectRequest', 'project', 'projectDetail', 'projectResponse', 'emailConfig', 'home'], // Định nghĩa các namespace
    defaultNS: 'common', // Namespace mặc định
    interpolation: {
      escapeValue: false,
    },
  });

// Lưu ngôn ngữ vào localStorage khi thay đổi
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
});

export default i18n;