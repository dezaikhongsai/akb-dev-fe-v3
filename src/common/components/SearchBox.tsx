import React from 'react';
import { AutoComplete, theme, Empty, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

interface Option {
  alias: string;
  name: string;
}

interface SearchBoxProps {
  options: Option[];
  placeholder?: string;
  style?: React.CSSProperties;
  onChange?: (value: string) => void;
  loading?: boolean;
  noDataMessage?: string;
  value?: string;
}

const SearchBox: React.FC<SearchBoxProps> = ({ 
  options, 
  placeholder = "Bạn hãy nhập tên dự án",
  style,
  onChange,
  loading = false,
  noDataMessage = "Không tìm thấy dữ liệu",
  value
}) => {
  const { token } = theme.useToken();

  const transformedOptions = options.map(opt => ({
    value: opt.alias,
    label: `${opt.name} (${opt.alias})`
  }));

  const notFoundContent = (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={noDataMessage}
      style={{
        margin: '12px 0',
        padding: '12px'
      }}
    />
  );

  return (
    <AutoComplete
      style={{ 
        width: 200,
        ...style 
      }}
      value={value}
      options={transformedOptions}
      onChange={onChange}
      filterOption={(inputValue, option) =>
        option?.label?.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
      }
       styles={{
        popup: {
          root: {
            background: '#ffffff',
            color: token.colorText, // Use your token here if desired
          },
        },
      }}
      notFoundContent={loading ? <div style={{ padding: '12px', textAlign: 'center' }}><Spin size="small" /></div> : notFoundContent}
    >
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: token.borderRadius,
          border: 'none',
          padding: '4px 11px',
        }}
      >
        <SearchOutlined style={{ color: 'rgba(255, 255, 255, 0.65)', marginRight: 8 }} />
        <input
          className="header-search-input"
          style={{
            backgroundColor: 'transparent',
            color: '#fff',
            border: 'none',
            outline: 'none',
            width: '100%',
          }}
          placeholder={placeholder}
        />
      </div>
    </AutoComplete>    
  );
};

export default SearchBox;