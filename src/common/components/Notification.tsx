import React from 'react'
import { BellOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Dropdown, Space, Badge } from 'antd';

const items: MenuProps['items'] = [
    {
        label: (
            <a target="_blank" rel="noopener noreferrer">
                Bạn có 2 thông báo
            </a>
        ),
        key: '0',
    },
    {
        type: 'divider',
    },
    {
        label: (
            <a target="_blank" rel="noopener noreferrer">
                Có 5 báo cáo mới được gửi
            </a>
        ),
        key: '1',
    },
    {
        label: (
            <a target="_blank" rel="noopener noreferrer">
                Có 2 yêu cầu dự án mới hôm nay
            </a>
        ),
        key: '2',
    }
];

const Notification: React.FC = () => {
    return (
        <Dropdown menu={{ items }} trigger={['click']}
            placement="bottom" >
            <div
                style={{
                    padding: '0px 15px',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    height: '60px'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                onClick={e => e.preventDefault()} // ngăn reload nếu dùng thẻ a
            >
                <a onClick={(e) => e.preventDefault()}>
                    <Space size={'large'}>
                        <Badge count={9} style={{
                            fontSize: 10,
                            height: 16,
                            minWidth: 16,
                            lineHeight: '16px',
                            padding: 0,
                            borderRadius: '50%',

                        }}>

                            <BellOutlined style={{ fontSize: '17px', color: '#0F0F0F' }} />
                        </Badge>
                    </Space>
                </a>
            </div>
        </Dropdown>
    );
};

export default Notification;