import React, { useState, useRef, useEffect } from 'react';
import { Input, InputRef, Spin, Empty } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

export interface Project {
  _id: string;
  name: string;
  alias: string;
  pm?: {
    _id: string;
    profile: {
      name: string;
      emailContact?: string;
    };
  };
  customer?: {
    _id: string;
    profile: {
      name: string;
      emailContact?: string;
    };
  };
}

interface SearchBoxProps {
  options: Project[];
  placeholder?: string;
  style?: React.CSSProperties;
  onChange?: (value: string) => void;
  onSelectProject?: (project: Project) => void;
  loading?: boolean;
  noDataMessage?: string;
  value?: string;
}

const SearchBox: React.FC<SearchBoxProps> = ({
  options,
  placeholder = 'Tìm kiếm dự án...',
  style,
  onChange,
  onSelectProject,
  loading = false,
  noDataMessage = 'Không có kết quả',
  value
}) => {
  const { t } = useTranslation(['common']);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<InputRef>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange?.(inputValue);
    setIsOpen(inputValue.trim().length > 0);
    setSelectedIndex(-1);
  };

  const handleItemClick = (project: Project) => {
    onSelectProject?.(project);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || options.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < options.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : options.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < options.length) {
          handleItemClick(options[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleFocus = () => {
    if (value && value.trim()) {
      setIsOpen(true);
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsOpen(false);
      setSelectedIndex(-1);
    }, 200);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showDropdown = isOpen && value && value.trim();

  return (
    <>
      <style>{`
       
        .search-input:focus {
  box-shadow: 0 0 0 2px rgba(0, 255, 170, 0.2) !important;
}
.search-dropdown {
  scrollbar-width: thin;
  scrollbar-color: #d9d9d9 transparent;
}
.search-dropdown::-webkit-scrollbar {
  width: 3px;
}
.search-dropdown::-webkit-scrollbar-track {
  background: transparent;
}
.search-dropdown::-webkit-scrollbar-thumb {
  background-color: #c9c9c9ff;
  border-radius: 3px;
}
.search-dropdown::-webkit-scrollbar-thumb:hover {
  background-color: #bfbfbf;
}
.project-item-info {
  display: flex;
  flex-direction: column;
  gap: 0; /* Đổi từ 1px thành 0 */
}
.project-item-meta {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: #595959;
  flex-wrap: wrap;
  margin: 0; /* Thêm margin: 0 để reset */
  padding: 0; /* Thêm padding: 0 để reset */
}



      `}</style>
      <div style={{ position: 'relative', ...style }} ref={dropdownRef}>
        <Input
          ref={inputRef}
          prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={{
            width: '200px',
            borderRadius: '5px',
            border: '1px solid #d9d9d9',
            transition: 'all 0.2s ease',
            fontSize: '14px'
          }}
          className="search-input"
        />

        {showDropdown && (
          <div
            className="search-dropdown"
            style={{
              width: '380px', // Tăng độ rộng để hiển thị thêm thông tin
              position: 'absolute',
              top: '100%',
              left: 0,
              backgroundColor: '#fff',
              border: '1px solid #e8e8e8',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08)',
              zIndex: 1050,
              maxHeight: '320px',
              overflowY: 'auto',
              marginTop: '5px',
            }}
          >
            {loading ? (
              <div style={{
                padding: '',
                textAlign: 'center',
                color: '#666'
              }}>
                <Spin size="small" />
                <div style={{ marginTop: '8px', fontSize: '13px' }}>Đang tìm kiếm...</div>
              </div>
            ) : options.length > 0 ? (
              <div style={{ padding: '5px 5px' }}>
                {options.map((project, index) => (
                  <div
                    key={project._id}
                    style={{
                      padding: '14px 8px', // Đổi thành padding đồng nhất
                      cursor: 'pointer',
                      backgroundColor: selectedIndex === index ? '#e6f7ff' : 'transparent',
                      transition: 'background 0.2s ease',
                      borderBottom: index < options.length - 1 ? '1px solid #f0f0f0' : 'none'
                    }}
                    onClick={() => handleItemClick(project)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="project-item-info">
                      {/* Tên + alias */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        fontWeight: 600,
                        color: '#1f1f1f',
                        fontSize: '15px',
                        lineHeight: '1.2', // Thêm line-height cụ thể
                        marginBottom: '8px' // Thêm margin-bottom thay vì dùng gap
                      }}>
                        <div style={{
                          fontWeight: 500,
                          color: '#1890ff',
                          backgroundColor: '#e6f4ff',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          marginRight: '8px',
                          fontSize: '12px',
                        }}>
                          {project.alias}
                        </div>
                        {project.name}
                      </div>

                      {/* Meta thông tin: PM - Customer */}
                      <div
                        className="project-item-meta"
                        style={{
                          maxHeight: '60px',
                          lineHeight: '1.2' // Thêm line-height cụ thể
                        }}
                      >
                        {project.pm && (
                          <div>
                            {t('pm.label')}: {project.pm.profile.name}
                          </div>
                        )}

                        {project.pm && project.customer && (
                          <div style={{ color: '#ccc' }}>-</div>
                        )}

                        {project.customer && (
                          <div>
                            Khách hàng: {project.customer.profile.name}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                padding: '20px 16px',
                textAlign: 'center',
                color: '#999'
              }}>
                <Empty
                  description={noDataMessage}
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  style={{ margin: 0 }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default SearchBox;