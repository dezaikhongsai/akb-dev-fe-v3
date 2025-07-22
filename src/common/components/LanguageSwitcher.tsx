import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import vnFlag from '../../assets/vn.webp';
import jpFlag from '../../assets/jp.webp';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = () => {
    const newLang = i18n.language === 'vi' ? 'ja' : 'vi';
    i18n.changeLanguage(newLang);
  };

  const getCurrentLanguage = () => {
    switch (i18n.language) {
      case 'vi':
        return {
          code: 'Tiếng Việt',
          flag: vnFlag
        };
      case 'ja':
        return {
          code: '日本語',
          flag: jpFlag
        };
      default:
        return {
          code: 'Tiếng Việt',
          flag: vnFlag
        };
    }
  };

  const currentLang = getCurrentLanguage();

  return (
    <Button
      type="text"
      // size='middle'
      onClick={changeLanguage}
      style={{
        width: '150px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'none',
        background: 'transparent',
        fontSize: 16,
        padding: 0,
        border: '1px solid',
        borderColor: '#f0f0f0',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <img
          src={currentLang.flag}
          alt="flag"
          style={{ width: 24, height: 16, objectFit: 'cover', borderRadius: 2 }}
        />
        <span>{currentLang.code}</span>
      </div>
    </Button>
  );
};

export default LanguageSwitcher;
