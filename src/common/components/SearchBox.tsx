import React from 'react';
import { AutoComplete, theme, Empty, Spin, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

interface Option {
  alias: string;
  name: string;
  pId: string;
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
  theme.useToken();

  const transformedOptions = options.map(opt => ({
    value: opt.alias,
    label: `${opt.name} (${opt.alias})`,
  }));

  const notFoundContent = loading ? (
    <div style={{ padding: '12px', textAlign: 'center' }}><Spin size="small" /></div>
  ) : (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={noDataMessage}
      style={{ margin: '12px 0', padding: '12px' }}
    />
  );

  return (
    <AutoComplete
      value={value}
      options={transformedOptions}
      onChange={onChange}
      onSelect={(alias) => {
        const selected = options.find(opt => opt.alias === alias);
        if (selected) {
          window.location.href = `/project/${selected.pId}`;
        }
      }}
      filterOption={(inputValue, option) =>
        option && option.label
          ? option.label.toLowerCase().includes(inputValue.toLowerCase())
          : false
      }
      style={style}
      notFoundContent={notFoundContent}
    >
      <Input
        prefix={<SearchOutlined style={{ color: '#444746' }} />}
        placeholder={placeholder}
        style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#444746' }}
      />
    </AutoComplete>
  );
};

export default SearchBox;
