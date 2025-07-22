import { Card, Tabs, Table, Space, Typography, Tag, Button, Modal, Row, Col, Input, Dropdown, Pagination, message } from 'antd';
import { IDocument } from '../../interfaces/project.interface';
import {
  ProjectOutlined,
  FileTextOutlined,
  BarChartOutlined,
  FormOutlined,
  UserOutlined,
  CalendarOutlined,
  SearchOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
  MoreOutlined,
  FileAddOutlined,
  ExclamationCircleFilled,
  WarningFilled,
  CloseOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import { useState, useEffect } from 'react';
import { useDebounce } from '../../../../common/hooks/useDebounce';
import { useParams } from 'react-router-dom';
import { getDocumentByProjectId, deleteContent, deleteDocument } from '../../../../services/document/document.service';
import ModalContent from './components/ModalContent';
import type { UploadFile } from 'antd/es/upload/interface';

interface DocumentInprojectProps {}

const { Text } = Typography;

const DocumentInproject: React.FC<DocumentInprojectProps> = () => {
  const { t } = useTranslation(['project', 'common']);
  const { pid } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTab, setCurrentTab] = useState('document');
  const [currentPage, setCurrentPage] = useState(1);
  const [documents, setDocuments] = useState<IDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });
  
  // Add new states for modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<{
    name: string;
    documentName: string;
    files: Array<{
      uid: string;
      name: string;
      filepath: string;
      type: string;
      size?: number;
    }>;
    creator: string;
    createdAt: string;
    updatedAt: string;
  } | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm);

  const fetchDocuments = async () => {
    if (!pid) return;
    
    setLoading(true);
    try {
      const response = await getDocumentByProjectId(pid, {
        page: currentPage,
        limit: pagination.limit,
        type: currentTab,
        name: debouncedSearchTerm,
        sort: 'createdAt:desc'
      });
      
      setDocuments(response.data.documents);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [pid, currentPage, currentTab, debouncedSearchTerm]);

  const handleViewContent = (record: IDocument, content: any) => {
    setSelectedContent({
      name: content.content,
      documentName: record.name,
      files: Array.isArray(content.files) ? content.files.map((file: any) => ({
        uid: file._id,
        name: file.originalName,
        filepath: file.path,
        type: file.type,
        size: file.size
      })) : [],
      creator: record.createdBy?.profile?.name || 'N/A',
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    });
    setIsModalOpen(true);
    console.log("selectedContent", selectedContent);
    console.log("record", record);
  };

  const handleDeleteContent = async (documentId: string, contentId: string) => {
    Modal.confirm({
      title: t('document.content.delete_confirm_title'),
      icon: <WarningFilled style={{ color: '#faad14' }} />,
      content: t('document.content.delete_confirm_content'),
      okText: (
        <Space>
          <DeleteOutlined />
          {t('common.confirm')}
        </Space>
      ),
      cancelText: (
        <Space>
          <CloseOutlined />
          {t('common.cancel')}
        </Space>
      ),
      okButtonProps: { 
        danger: true,
        icon: <DeleteOutlined />
      },
      onOk: async () => {
        try {
          await deleteContent(contentId);
          message.success(t('document.content.delete_success'));
          fetchDocuments(); // Refresh data
        } catch (error) {
          message.error(t('document.content.delete_error'));
        }
      }
    });
  };

  const handleDeleteDocument = async (documentId: string) => {
    Modal.confirm({
      title: t('document.delete_confirm_title'),
      icon: <WarningFilled style={{ color: '#faad14' }} />,
      content: t('document.delete_confirm_content'),
      okText: (
        <Space>
          <DeleteOutlined />
          {t('common.confirm')}
        </Space>
      ),
      cancelText: (
        <Space>
          <CloseOutlined />
          {t('common.cancel')}
        </Space>
      ),
      okButtonProps: { 
        danger: true,
        icon: <DeleteOutlined />
      },
      onOk: async () => {
        try {
          await deleteDocument(documentId);
          message.success(t('document.delete_success'));
          fetchDocuments(); // Refresh data
        } catch (error) {
          message.error(t('document.delete_error'));
        }
      }
    });
  };

  const handleAddDocument = () => {
    // TODO: Implement add document
    console.log('Add document');
  };

  const handleAddContent = (documentId: string) => {
    // TODO: Implement add content
    console.log('Add content to document:', documentId);
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!selectedContent) return;
    
    try {
      // TODO: Call API to delete file
      // Sau khi xóa thành công, cập nhật lại state
      setSelectedContent(prev => {
        if (!prev) return null;
        return {
          ...prev,
          files: prev.files.filter(file => file.uid !== fileId)
        };
      });
      // Refresh lại data table nếu cần
      fetchDocuments();
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleUploadFiles = async (files: UploadFile[]) => {
    if (!selectedContent) return;
    
    try {
      // TODO: Call API to upload files
      // Sau khi upload thành công, cập nhật lại state
      const newFiles = files.map(file => ({
        uid: file.uid,
        name: file.name,
        filepath: file.name, // Temporary filepath, should be updated with actual path from server
        type: file.name.split('.').pop() || ''
      }));

      setSelectedContent(prev => {
        if (!prev) return null;
        return {
          ...prev,
          files: [...prev.files, ...newFiles]
        };
      });
      // Refresh lại data table nếu cần
      fetchDocuments();
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  };

  const handleConfirmContent = async () => {
    try {
      // TODO: Call API to save changes if needed
      setIsModalOpen(false);
      // Refresh lại data table nếu cần
      fetchDocuments();
    } catch (error) {
      console.error('Error saving content:', error);
    }
  };

  const getContentActionItems = (record: IDocument, content: any): MenuProps['items'] => [
    {
      key: 'view',
      label: t('document.content.view'),
      icon: <EyeOutlined />,
      onClick: () => handleViewContent(record, content)
    },
    {
      key: 'delete',
      label: t('document.content.delete'),
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => handleDeleteContent(record._id, content._id)
    }
  ];

  const getDocumentActionItems = (record: IDocument): MenuProps['items'] => [
    {
      key: 'add_content',
      label: t('document.action.add_content'),
      icon: <FileAddOutlined />,
      onClick: () => handleAddContent(record._id)
    },
    {
      key: 'delete',
      label: t('document.action.delete'),
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => handleDeleteDocument(record._id)
    }
  ];

  const headerStyle = {
    backgroundColor: '#1890ff',
    color: '#ffffff',
    fontWeight: 500
  };

  const columns: ColumnsType<IDocument> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_: any, __: any, index: number) => (currentPage - 1) * pagination.limit + index + 1,
      onHeaderCell: () => ({
        style: headerStyle
      })
    },
    {
      title: t('document.name'),
      key: 'name',
      onHeaderCell: () => ({
        style: headerStyle
      }),
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
      align: 'center',
      responsive: ['md'],
      onHeaderCell: () => ({
        style: headerStyle
      }),
      render: (_, record) => (
        record.isCompleted ? (
          <Tag color="success">
            {t('document.completed')}
          </Tag>
        ) : (
          <Tag color="processing">
            {t('document.in_progress')}
          </Tag>
        )
      )
    },
    {
      title: t('document.creator'),
      key: 'creator',
      width: 200,
      responsive: ['lg'],
      onHeaderCell: () => ({
        style: headerStyle
      }),
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
      onHeaderCell: () => ({
        style: headerStyle
      }),
      render: (_, record) => (
        <div style={{ width: '100%' }}>
          {record.contents.map((content, index) => (
            <Row 
              key={content._id} 
              style={{ 
                padding: '8px 0',
                borderBottom: index < record.contents.length - 1 ? '1px solid #f0f0f0' : 'none'
              }}
            >
              <Col flex="auto">
                <Text>{content.content}</Text>
              </Col>
              <Col>
                <Dropdown menu={{ items: getContentActionItems(record, content) }} trigger={['click']}>
                  <Button type="text" icon={<MoreOutlined />} />
                </Dropdown>
              </Col>
            </Row>
          ))}
        </div>
      )
    },
    {
      title: t('document.created_at'),
      key: 'createdAt',
      width: 180,
      responsive: ['lg'],
      onHeaderCell: () => ({
        style: headerStyle
      }),
      render: (_, record) => (
        <Space>
          <CalendarOutlined />
          <Text>{dayjs(record.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
        </Space>
      )
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 80,
      align: 'center',
      fixed: 'right' as const,
      onHeaderCell: () => ({
        style: headerStyle
      }),
      render: (_, record) => (
        <Dropdown menu={{ items: getDocumentActionItems(record) }} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      )
    }
  ];

  const renderDocumentTable = () => {
    return (
      <div>
        <Row justify="start" style={{ marginBottom: 16 }}>
          <Col>
            <Input
              placeholder={t('document.search.placeholder')}
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
          </Col>
        </Row>
        <Table
          columns={columns}
          dataSource={documents}
          rowKey="_id"
          loading={loading}
          pagination={false}
          bordered
          scroll={{ x: 800 }}
          footer={() => (
            <div style={{ 
              backgroundColor: '#fafafa', 
              padding: '16px 0',
              textAlign: 'center'
            }}>
              <Pagination
                current={pagination.page}
                total={pagination.total}
                pageSize={pagination.limit}
                onChange={(page) => setCurrentPage(page)}
                showSizeChanger={true}
                onShowSizeChange={(_current, size) => {
                  setPagination(prev => ({
                    ...prev,
                    limit: size,
                    page: 1
                  }));
                }}
                align='center'
              />
            </div>
          )}
        />
      </div>
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
      children: renderDocumentTable()
    },
    {
      key: 'report',
      label: (
        <Space>
          <BarChartOutlined />
          {t('document.tab.reports')}
        </Space>
      ),
      children: renderDocumentTable()
    },
    {
      key: 'request',
      label: (
        <Space>
          <FormOutlined />
          {t('document.tab.requests')}
        </Space>
      ),
      children: renderDocumentTable()
    }
  ];

  const handleTabChange = (activeKey: string) => {
    setCurrentTab(activeKey);
    setCurrentPage(1);
    setSearchTerm('');
  };

  return (
    <>
      <Card
        title={
          <Space>
            <ProjectOutlined />
            {t('document.title')}
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddDocument}
          >
            {t('document.add')}
          </Button>
        }
        style={{ marginBottom: 24 }}
      >
        <Tabs 
          items={items}
          defaultActiveKey="document"
          onChange={handleTabChange}
        />
      </Card>

      {selectedContent && (
        <ModalContent
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          contentName={selectedContent.name}
          documentName={selectedContent.documentName}
          files={selectedContent.files}
          creator={selectedContent.creator}
          createdAt={selectedContent.createdAt}
          updatedAt={selectedContent.updatedAt}
          onDeleteFile={handleDeleteFile}
          onUploadFiles={handleUploadFiles}
          onConfirm={handleConfirmContent}
        />
      )}
    </>
  );
};

export default DocumentInproject;
