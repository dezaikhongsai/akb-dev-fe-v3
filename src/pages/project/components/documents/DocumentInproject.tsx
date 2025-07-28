import { Card, Tabs, Table, Space, Typography, Tag, Button, Modal, Row, Col, Input, Dropdown, Pagination, message, Select, Alert } from 'antd';
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
  WarningFilled,
  TeamOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import { useState, useEffect } from 'react';
import { useDebounce } from '../../../../common/hooks/useDebounce';
import { useParams } from 'react-router-dom';
import { 
  getDocumentByProjectId, 
  deleteContent, 
  deleteDocument, 
  updateContent,
  changeIsCompleted,
} from '../../../../services/document/document.service';
import ModalContent from './components/ModalContent';
import type { UploadFile } from 'antd/es/upload/interface';
import ModalAddContent from './components/ModalAddContent';
import ModalAddDocument from './components/ModalAddDocument';

interface DocumentInprojectProps {
  onReloadStatistic?: () => void;
}

const { Text } = Typography;

const DocumentInproject: React.FC<DocumentInprojectProps> = ({ onReloadStatistic }) => {
  const { t } = useTranslation(['document', 'common']);
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
    id: string; // Add content ID
    name: string;
    documentName: string;
    files: Array<{
      uid: string;
      name: string;
      filepath: string;
      type: string;
      size?: number;
      isNew?: boolean;
      originFileObj?: File;  // Thêm trường này để lưu File gốc
    }>;
    creator: string;
    createdAt: string;
    updatedAt: string;
  } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isModalAddContentOpen, setIsModalAddContentOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<IDocument | null>(null);
  const [isModalAddDocumentOpen , setIsModalAddDocumentOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'in_progress'>('all');
  const debouncedSearchTerm = useDebounce(searchTerm);
  const pendingCount = documents.filter(doc => !doc.isCompleted).length;

  const fetchDocuments = async () => {
    if (!pid) return;
    
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: pagination.limit,
        type: currentTab,
        name: debouncedSearchTerm,
        sort: 'createdAt:desc'
      };
      if (statusFilter === 'completed') params.isCompleted = true;
      else if (statusFilter === 'in_progress') params.isCompleted = false;

      const response = await getDocumentByProjectId(pid, params);
      
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
  }, [pid, currentPage, currentTab, debouncedSearchTerm, statusFilter]);

  const handleViewContent = (record: IDocument, content: any) => {
    setSelectedContent({
      id: content._id, // Ensure we store the content ID
      name: content.content,
      documentName: record.name,
      files: Array.isArray(content.files) ? content.files.map((file: any) => ({
        uid: file._id,
        name: file.originalName,
        filepath: file.path,
        type: file.type,
        size: file.size,
        isNew: false
      })) : [],
      creator: record.createdBy?.profile?.name || 'N/A',
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    });
    setIsModalOpen(true);
  };

  const handleDeleteContent = async (contentId: string) => {
    Modal.confirm({
      title: t('content.delete_confirm_title'),
      icon: <WarningFilled style={{ color: '#faad14' }} />,
              content: t('content.delete_confirm_content'),
      okText: t('common.confirm'),
      cancelText: t('common.cancel'),
      okButtonProps: { 
        danger: true,
        icon: <DeleteOutlined />
      },
      onOk: async () => {
        try {
          await deleteContent(contentId);
          message.success(t('content.delete_success'));
          fetchDocuments(); // Refresh data
          if (onReloadStatistic) onReloadStatistic();
        } catch (error) {
          message.error(t('content.delete_error'));
        }
      }
    });
  };

  const handleDeleteDocument = async (documentId: string) => {
    Modal.confirm({
      title: t('delete_confirm_title'),
      icon: <WarningFilled style={{ color: '#faad14' }} />,
              content: t('delete_confirm_content'),
      okText: t('common.confirm'),
      cancelText: t('common.cancel'),
      okButtonProps: { 
        danger: true,
        icon: <DeleteOutlined />
      },
      onOk: async () => {
        try {
          await deleteDocument(documentId);
          message.success(t('delete_success'));
          fetchDocuments(); // Refresh data
          if (onReloadStatistic) onReloadStatistic();
        } catch (error) {
          message.error(t('delete_error'));
        }
      }
    });
  };

  const handleOpenAddDocument = () => {
    // TODO: Implement add document
    setIsModalAddDocumentOpen(true);
    console.log('Add document');
  };

  const handleAddContent = (documentId: string) => {
    setSelectedDocument(documents.find(doc => doc._id === documentId) || null);
    setIsModalAddContentOpen(true);
  };

  const handleDeleteFile = (fileId: string) => {
    if (!selectedContent) return;
    
    setSelectedContent(prev => {
      if (!prev) return null;
      return {
        ...prev,
        files: prev.files.filter(file => file.uid !== fileId)
      };
    });
  };

  const handleUploadFiles = (files: UploadFile[]) => {
    if (!selectedContent) return;
    
    const newFiles = files.map(file => ({
      uid: file.uid,
      name: file.name,
      filepath: file.name,
      type: file.type || file.name.split('.').pop() || '',
      size: file.size,
      isNew: true,
      originFileObj: file.originFileObj as File  // Lưu File gốc
    }));

    setSelectedContent(prev => {
      if (!prev) return null;
      return {
        ...prev,
        files: [...prev.files, ...newFiles]
      };
    });
  };

  const handleChangeIsCompleted = async (documentId: string) => {
    setLoading(true);
    try {
      await changeIsCompleted(documentId);
      message.success(t('status_update_success'));
      fetchDocuments();
    } catch (error) {
      message.error(t('status_update_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    setSuccessMessage(t('content.update_success'));
    fetchDocuments();
    if (onReloadStatistic) onReloadStatistic();
  };

  useEffect(() => {
    if (!loading && successMessage) {
      message.success(successMessage);
      setSuccessMessage(null);
    }
  }, [loading, successMessage]);

  const getContentActionItems = (record: IDocument, content: any): MenuProps['items'] => [
    {
      key: 'view',
      label: t('content.view'),
      icon: <EyeOutlined />,
      onClick: () => handleViewContent(record, content)
    },
    {
      key: 'delete',
      label: t('content.delete'),
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => handleDeleteContent(content._id)
    }
  ];

  const getDocumentActionItems = (record: IDocument): MenuProps['items'] => [
    {
      key: 'add_content',
      label: t('action.add_content'),
      icon: <FileAddOutlined />,
      onClick: () => handleAddContent(record._id)
    },
    {
      key: 'change_status',
      label: record.isCompleted ? t('action.mark_processing') : t('action.mark_done'),
      icon: record.isCompleted ? <FormOutlined /> : <BarChartOutlined />,
      onClick: () => handleChangeIsCompleted(record._id)
    },
    {
      key: 'delete',
      label: t('action.delete'),
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
      title: t('name'),
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
      title: t('type'),
      key: 'type',
      width: 120,
      align: 'center',
      onHeaderCell: () => ({
        style: headerStyle
      }),
      render: (_, record) => (
        <Tag color={
          record.type === 'document' ? 'blue' :
          record.type === 'report' ? 'green' : 'orange'
        }>
          {t(`type_options.${record.type}`)}
        </Tag>
      )
    },
    {
      title: t('status'),
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
            {t('completed')}
          </Tag>
        ) : (
          <Tag color="processing">
            {t('in_progress')}
          </Tag>
        )
      )
    },
    {
      title: t('creator'),
      key: 'creator',
      width: 200,
      responsive: ['lg'],
      onHeaderCell: () => ({
        style: headerStyle
      }),
      render: (_, record) => (
        <Space>
          {record.createdBy.role === 'customer' ? <TeamOutlined /> : <UserOutlined />}
          <Text>{record.createdBy.profile.name}</Text>
        </Space>
      )
    },
    {
      title: t('contents'),
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
      title: t('created_at'),
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
        {!loading && (
          documents.length === 0 ? (
            <Alert
              message={t('messages.no_documents')}
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
          ) : (
            pendingCount > 0 && (
              <Alert
                message={t('messages.pending_documents', { count: pendingCount })}
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )
          )
        )}
        <Row justify="start" style={{ marginBottom: 16 }} gutter={8}>
          <Col>
            <Input
              placeholder={t('search.placeholder')}
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
          </Col>
          <Col>
            <Select
              value={statusFilter}
              style={{ width: 160 }}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: t('common.all') },
                { value: 'completed', label: t('completed') },
                { value: 'in_progress', label: t('in_progress') },
              ]}
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
          {t('tab.documents')}
        </Space>
      ),
      children: renderDocumentTable()
    },
    {
      key: 'report',
      label: (
        <Space>
          <BarChartOutlined />
          {t('tab.reports')}
        </Space>
      ),
      children: renderDocumentTable()
    },
    {
      key: 'request',
      label: (
        <Space>
          <FormOutlined />
          {t('tab.requests')}
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
            {t('title')}
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenAddDocument}
          >
            {t('add')}
          </Button>
        }
        style={{ marginBottom: 24 }}
      >
        <Tabs 
          items={items}
          activeKey={currentTab}
          onChange={handleTabChange}
        />
      </Card>

      {selectedContent && (
        <ModalContent
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          contentId={selectedContent.id}
          contentName={selectedContent.name}
          documentName={selectedContent.documentName}
          files={selectedContent.files}
          creator={selectedContent.creator}
          createdAt={selectedContent.createdAt}
          updatedAt={selectedContent.updatedAt}
          onDeleteFile={handleDeleteFile}
          onUploadFiles={handleUploadFiles}
          onConfirm={async (data, onSuccess) => {
            try {
              const formData = new FormData();
              
              // Add content
              formData.append('content', data.content);

              // Separate new and existing files
              const { newFiles, existingFiles } = selectedContent.files.reduce((acc, file) => {
                if (file.isNew && file.originFileObj) {
                  acc.newFiles.push(file.originFileObj);
                } else {
                  acc.existingFiles.push({
                    originalName: file.name,
                    path: file.filepath,
                    type: file.type,
                    size: file.size
                  });
                }
                return acc;
              }, { newFiles: [] as File[], existingFiles: [] as any[] });

              // Add existing files as JSON string
              formData.append('existingFiles', JSON.stringify(existingFiles));
              
              // Add new files
              newFiles.forEach((file) => {
                formData.append('files', file);
              });

              // Call the API to update content
              await updateContent(data.contentId, formData);
              if (onSuccess) onSuccess();
            } catch (error) {
              console.error('Error updating content:', error);
              message.error(t('document.content.update_error'));
            }
          }}
          onSuccess={handleModalSuccess}
        />
      )}
      <ModalAddContent
        open={isModalAddContentOpen}
        onClose={() => setIsModalAddContentOpen(false)}
        documentId={selectedDocument?._id || ''}
        documentName={selectedDocument?.name || ''}
        creator={selectedDocument?.createdBy?.profile?.name || ''}
        createdAt={dayjs(selectedDocument?.createdAt).format('DD/MM/YYYY HH:mm') || ''}
        updatedAt={dayjs(selectedDocument?.updatedAt).format('DD/MM/YYYY HH:mm') || ''}
        onSuccess={handleModalSuccess}
      />
      <ModalAddDocument
        open={isModalAddDocumentOpen}
        onClose={() => setIsModalAddDocumentOpen(false)}
        projectId={pid || ''}
        mode='in'
        onSuccess={(type) => {
          setIsModalAddDocumentOpen(false);
          if (type) {
            setCurrentTab(type);
            handleTabChange(type);
          }
          fetchDocuments();
          if (onReloadStatistic) onReloadStatistic();
        }}
      />
      </>
  );
};

export default DocumentInproject;