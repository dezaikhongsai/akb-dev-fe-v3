import { Card, Tabs, Table, Space, Typography, Tag, Tooltip } from 'antd';
import { IDocumentResponse, IDocument } from '../../interfaces/project.interface';
import {
  ProjectOutlined,
  FileTextOutlined,
  BarChartOutlined,
  FormOutlined,
  UserOutlined,
  CalendarOutlined,
  PaperClipOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  MoreOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';

interface DocumentInprojectProps {
  documents: IDocumentResponse;
}

const { Text } = Typography;

const DocumentInproject: React.FC<DocumentInprojectProps> = ({ documents }) => {
  const { t } = useTranslation(['project', 'common']);

  const getDocumentsByType = (type: string) => {
    return documents.documents.filter(doc => doc.type === type);
  };

  const columns: ColumnsType<IDocument> = [
    {
      title: t('document.name'),
      key: 'name',
      render: (_, record) => (
        <Space>
          <FileTextOutlined style={{ color: '#1890ff' }} />
          <Text strong>{record.name}</Text>
        </Space>
      )
    },
    {
      title: t('document.status'),
      key: 'status',
      width: 150,
      render: (_, record) => (
        record.isCompleted ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            {t('document.completed')}
          </Tag>
        ) : (
          <Tag icon={<ClockCircleOutlined />} color="processing">
            {t('document.in_progress')}
          </Tag>
        )
      )
    },
    {
      title: t('document.creator'),
      key: 'creator',
      width: 200,
      render: (_, record) => (
        <Space>
          <UserOutlined />
          <Text>{record.createdBy.profile.name}</Text>
        </Space>
      )
    },
    {
      title: t('document.contents'),
      key: 'contents',
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          {record.contents.map(content => (
            <div key={content._id}>
              <Text type="secondary">
                {content.content}
                {content.files.length > 0 && (
                  <Tooltip title={content.files.map(file => file.originalName).join(', ')}>
                    <Tag style={{ marginLeft: 8 }}>
                      <Space>
                        <PaperClipOutlined />
                        {content.files.length} {t('document.files')}
                      </Space>
                    </Tag>
                  </Tooltip>
                )}
              </Text>
            </div>
          ))}
        </Space>
      )
    },
    {
      title: t('document.created_at'),
      key: 'createdAt',
      width: 180,
      render: (_, record) => (
        <Space>
          <CalendarOutlined />
          <Text>{dayjs(record.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
        </Space>
      )
    }
  ];

  const renderDocumentTable = (type: string) => {
    const filteredDocs = getDocumentsByType(type);
    
    return (
      <Table
        columns={columns}
        dataSource={filteredDocs}
        rowKey="_id"
        pagination={false}
        locale={{
          emptyText: t('document.no_documents')
        }}
      />
    );
  };

  const items = [
    {
      key: 'document',
      label: (
        <Space>
          <FileTextOutlined />
          {t('document.tab.documents')}
        </Space>
      ),
      children: renderDocumentTable('document')
    },
    {
      key: 'report',
      label: (
        <Space>
          <BarChartOutlined />
          {t('document.tab.reports')}
        </Space>
      ),
      children: renderDocumentTable('report')
    },
    {
      key: 'request',
      label: (
        <Space>
          <FormOutlined />
          {t('document.tab.requests')}
        </Space>
      ),
      children: renderDocumentTable('request')
    }
  ];

  return (
    <Card
      title={
        <Space>
          <ProjectOutlined />
          {t('document.title')}
        </Space>
      }
      style={{ marginBottom: 24 }}
    >
      <Tabs 
        items={items}
        defaultActiveKey="document"
      />
    </Card>
  );
};

export default DocumentInproject;
