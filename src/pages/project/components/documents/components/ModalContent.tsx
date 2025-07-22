import { Modal, Typography, Space, Button, Upload, List, Tooltip, message, Divider } from 'antd';
import {
  FileOutlined,
  FileWordOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  FileImageOutlined,
  EyeOutlined,
  DeleteOutlined,
  DownloadOutlined,
  CloseOutlined,
  UploadOutlined,
  CheckOutlined,
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined,
  EditOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import type { UploadFile } from 'antd/es/upload/interface';
import dayjs from 'dayjs';

const { Text } = Typography;

interface ModalContentProps {
  open: boolean;
  onClose: () => void;
  contentName: string;
  documentName: string;
  files: Array<{
    uid: string;
    name: string;
    filepath: string; // Đường dẫn file từ server
    type: string;
    size?: number;
  }>;
  creator: string;
  createdAt: string;
  updatedAt: string;
  onDeleteFile: (fileId: string) => void;
  onUploadFiles: (files: UploadFile[]) => void;
  onConfirm: () => void;
}

const ModalContent: React.FC<ModalContentProps> = ({
  open,
  onClose,
  contentName,
  documentName,
  files,
  creator,
  createdAt,
  updatedAt,
  onDeleteFile,
  onUploadFiles,
  onConfirm
}) => {
  const { t } = useTranslation(['project', 'common']);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const URL_UPLOAD = import.meta.env.VITE_API_UPLOAD_URL;
  const formatFileSize = (bytes: number): string => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const getFileIcon = (fileType: string) => {
    const type = fileType.toLowerCase();
    if (type.includes('word') || type.includes('doc')) {
      return <FileWordOutlined style={{ fontSize: 24, color: '#2B579A' }} />;
    } else if (type.includes('pdf')) {
      return <FilePdfOutlined style={{ fontSize: 24, color: '#FF0000' }} />;
    } else if (type.includes('sheet') || type.includes('excel') || type.includes('xls')) {
      return <FileExcelOutlined style={{ fontSize: 24, color: '#217346' }} />;
    } else if (type.includes('image') || /\.(jpg|jpeg|png|gif)$/i.test(fileType)) {
      return <FileImageOutlined style={{ fontSize: 24, color: '#4A90E2' }} />;
    }
    return <FileOutlined style={{ fontSize: 24, color: '#8C8C8C' }} />;
  };

  const handlePreview = (file: any) => {
    const isPreviewable = file.type.toLowerCase().includes('pdf') || 
                         file.type.toLowerCase().includes('image') ||
                         /\.(jpg|jpeg|png|gif|pdf)$/i.test(file.name);

    if (isPreviewable) {
      try {
        // Kết hợp URL_UPLOAD với filepath
        const fullPath = `${URL_UPLOAD}/${file.filepath}`;
        setPreviewUrl(fullPath);
        setPreviewTitle(file.name);
        setPreviewOpen(true);
      } catch (error) {
        message.error(t('document.content.preview_error'));
      }
    } else {
      message.info(t('document.content.preview_not_supported'));
    }
  };

  const handleDownload = (file: any) => {
    try {
      // Kết hợp URL_UPLOAD với filepath
      const fullPath = `${URL_UPLOAD}/${file.filepath}`;
      window.open(fullPath, '_blank');
    } catch (error) {
      message.error(t('document.content.download_error'));
    }
  };

  return (
    <>
      <Modal
        open={open}
        onCancel={onClose}
        width={800}
        title={
          <Space direction="vertical" size={4}>
            <Space>
              <FileTextOutlined />
              <Text>{documentName}</Text>
            </Space>
            <Text type="secondary" style={{ fontSize: '14px', marginLeft: 24 }}>
              {contentName}
            </Text>
          </Space>
        }
        footer={[
          <Button key="close" icon={<CloseOutlined />} onClick={onClose}>
            {t('common.close')}
          </Button>,
          <Button
            key="upload"
            type="primary"
            icon={<UploadOutlined />}
            style={{ backgroundColor: '#722ED1' }}
            onClick={() => {
              document.getElementById('file-upload')?.click();
            }}
          >
            {t('document.content.upload_file')}
          </Button>,
          <Button
            key="confirm"
            type="primary"
            icon={<CheckOutlined />}
            onClick={onConfirm}
          >
            {t('common.confirm')}
          </Button>
        ]}
      >
        <div style={{ color: '#8C8C8C', marginBottom: 16 }}>
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <Space>
              <UserOutlined />
              <Text>{t('document.creator')}: {creator}</Text>
            </Space>
            <Space>
              <CalendarOutlined />
              <Text>{t('document.created_at')}: {dayjs(createdAt).format('DD/MM/YYYY HH:mm')}</Text>
            </Space>
            <Space>
              <EditOutlined />
              <Text>{t('document.updated_at')}: {dayjs(updatedAt).format('DD/MM/YYYY HH:mm')}</Text>
            </Space>
          </Space>
        </div>

        <Divider style={{ margin: '12px 0' }} />

        <List
          dataSource={files}
          renderItem={(file) => (
            <List.Item
              key={file.uid}
              actions={[
                (file.type.toLowerCase().includes('pdf') || 
                 file.type.toLowerCase().includes('image') ||
                 /\.(jpg|jpeg|png|gif|pdf)$/i.test(file.name)) && (
                  <Tooltip title={t('document.content.preview')}>
                    <Button
                      type="text"
                      icon={<EyeOutlined />}
                      onClick={() => handlePreview(file)}
                    />
                  </Tooltip>
                ),
                <Tooltip title={t('document.content.download')}>
                  <Button
                    type="text"
                    icon={<DownloadOutlined />}
                    onClick={() => handleDownload(file)}
                  />
                </Tooltip>,
                <Tooltip title={t('document.content.delete')}>
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => onDeleteFile(file.uid)}
                  />
                </Tooltip>
              ].filter(Boolean)}
            >
              <List.Item.Meta
                avatar={getFileIcon(file.type)}
                title={file.name}
                description={
                  <Space>
                    <span>{file.type}</span>
                    {file.size && <span>{formatFileSize(file.size)}</span>}
                  </Space>
                }
              />
            </List.Item>
          )}
        />

        <Upload
          id="file-upload"
          style={{ display: 'none' }}
          accept=".doc,.docx,.pdf,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
          multiple
          beforeUpload={(file) => {
            const isValidType = [
              'doc', 'docx', 'pdf', 'xls', 'xlsx',
              'jpg', 'jpeg', 'png', 'gif'
            ].includes(file.name.split('.').pop()?.toLowerCase() || '');
            
            if (!isValidType) {
              message.error(t('document.content.invalid_file_type'));
              return Upload.LIST_IGNORE;
            }
            return false;
          }}
          onChange={({ fileList }) => onUploadFiles(fileList)}
        >
          <Button type="primary" icon={<UploadOutlined />}>
            {t('document.content.select_files')}
          </Button>
        </Upload>

        <Modal
          open={previewOpen}
          title={previewTitle}
          footer={null}
          onCancel={() => setPreviewOpen(false)}
          width="90vw"
          style={{ 
            top: 20,
            paddingBottom: 0
          }}
        >
          <div style={{ height: 'calc(90vh - 100px)' }}>
            {previewTitle.toLowerCase().endsWith('.pdf') ? (
              <iframe
                src={previewUrl}
                style={{ 
                  width: '100%', 
                  height: '100%',
                  border: 'none'
                }}
                title={previewTitle}
              />
            ) : (
              <img
                alt={previewTitle}
                style={{ 
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  display: 'block',
                  margin: '0 auto'
                }}
                src={previewUrl}
              />
            )}
          </div>
        </Modal>
      </Modal>
    </>
  );
};

export default ModalContent;
