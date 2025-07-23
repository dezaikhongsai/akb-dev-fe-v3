import React from 'react'
import { BellOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Dropdown, Space, Badge } from 'antd';

const items: MenuProps['items'] = [
    {
        label: (
            <a target="_blank" rel="noopener noreferrer">
                1st menu item
            </a>
        ),
        key: '0',
    },
    {
        label: (
            <a target="_blank" rel="noopener noreferrer">
                2nd menu item
            </a>
        ),
        key: '1',
    },
    {
        type: 'divider',
    },
    {
        label: '3rd menu item',
        key: '3',
    },
];

const Notification: React.FC = () => {
    return (
        <Dropdown menu={{ items }} trigger={['click']}>
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
                        <BellOutlined style={{ fontSize: '17px', color: '#ffffffff' }} />
                    </Badge>
                </Space>
            </a>
        </Dropdown>
    );
};

export default Notification;