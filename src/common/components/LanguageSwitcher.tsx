import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import vnFlag from '../../assets/vn.webp';
import jpFlag from '../../assets/jp.png';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const languages = {
    vi: {
      code: 'Tiếng Việt',
      flag: vnFlag
    },
    ja: {
      code: '日本語',
      flag: jpFlag
    }
  };

  const currentLangKey = i18n.language === 'ja' ? 'ja' : 'vi';
  const currentLang = languages[currentLangKey];

  // items dropdown
  const items: MenuProps['items'] = Object.entries(languages).map(([key, lang]) => ({
    key,
    label: (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <img
          src={lang.flag}
          alt="flag"
          style={{ width: 24, height: 16, objectFit: 'cover' }}
        />
        <span>{lang.code}</span>
      </div>
    ),
    onClick: () => {
      i18n.changeLanguage(key);
    }
  }));

  return (
    <Dropdown menu={{ items }} trigger={['click']}
      placement="bottom"
    >
      <div
        style={{
          padding: '22px 10px',
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}

        onClick={e => e.preventDefault()} // ngăn reload nếu dùng thẻ a
      >
        <img
          src={currentLang.flag}
          alt="flag"
          style={{ width: 24, height: 16, objectFit: 'cover', borderRadius: 2 }}
        />
      </div>
    </Dropdown>
  );
};

export default LanguageSwitcher;

