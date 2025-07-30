import { Modal, Typography, Space, Button, Upload, List, Tooltip, message, Input, Tag } from 'antd';
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
  WarningFilled,
  UserOutlined,
  CalendarOutlined,
  EditOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import type { UploadFile } from 'antd/es/upload/interface';
import { addContent } from '../../../../../services/document/document.service';
import { displayFileName } from '../../../../../common/utils/fileName.util';

const { Text } = Typography;

interface FileItem {
  uid: string;
  name: string;
  filepath: string;
  type: string;
  size?: number;
  isNew?: boolean;
  originFileObj?: File;
}

interface ModalAddContentProps {
  open: boolean;
  onClose: () => void;
  documentId: string;
  documentName: string;
  creator: string;
  createdAt: string;
  updatedAt: string;
  onSuccess?: () => void;
}

const ModalAddContent: React.FC<ModalAddContentProps> = ({
  open,
  onClose,
  documentId,
  documentName,
  creator,
  createdAt,
  updatedAt,
  onSuccess
}) => {
  const { t } = useTranslation(['document', 'common']);
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const URL_UPLOAD = import.meta.env.VITE_IS_PROD === 'true' ? import.meta.env.VITE_API_UPLOAD_PROD : import.meta.env.VITE_API_UPLOAD_URL;

  const ACCEPTED_FILE_TYPES = {
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'pdf': 'application/pdf',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'bmp': 'image/bmp',
    'webp': 'image/webp',
    'txt': 'text/plain',
    'csv': 'text/csv',
  };
  const ACCEPTED_FILE_EXTENSIONS = Object.keys(ACCEPTED_FILE_TYPES).map(ext => `.${ext}`).join(',');

  const isValidFileType = (file: File): boolean => {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const expectedMimeType = ACCEPTED_FILE_TYPES[extension as keyof typeof ACCEPTED_FILE_TYPES];
    return (
      expectedMimeType !== undefined && 
      (file.type === expectedMimeType || file.type.startsWith('application/') || file.type.startsWith('image/'))
    );
  };

  const handleUploadFiles = (newFiles: UploadFile[]) => {
    // Kiểm tra file trùng tên và size đã có trong files
    const duplicateFiles = newFiles.filter(
      newFile => files.some(existingFile =>
        existingFile.name === newFile.name && existingFile.size === newFile.size
      )
    );
    if (duplicateFiles.length > 0) {
      message.error(t('content.duplicate_file_error', { fileName: duplicateFiles[0].name }));
      return;
    }
    setFiles(prev => [
      ...prev,
      ...newFiles.map(file => ({
        uid: file.uid,
        name: file.name,
        filepath: file.name,
        type: file.type || file.name.split('.').pop() || '',
        size: file.size,
        isNew: true,
        originFileObj: file.originFileObj as File
      }))
    ]);
  };

  const handleDeleteFile = (fileId: string, fileName: string) => {
    Modal.confirm({
      title: t('content.delete_file_confirm_title'),
      icon: <WarningFilled style={{ color: '#faad14' }} />,
              content: t('content.delete_file_confirm_content', { fileName }),
      okText: t('common.confirm'),
      cancelText: t('common.cancel'),
      okButtonProps: { danger: true, icon: <DeleteOutlined /> },
      onOk: () => {
        setFiles(prev => prev.filter(file => file.uid !== fileId));
        message.success(t('content.delete_success'));
      }
    });
  };

  const getFileIcon = (fileType: string) => {
    const type = fileType.toLowerCase();
    if (
      type.includes('sheet') ||
      type.includes('excel') ||
      type.includes('xls') ||
      type.includes('xlsx') ||
      type === 'application/vnd.ms-excel' ||
      type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      return <FileExcelOutlined style={{ fontSize: 24, color: '#217346' }} />;
    } else if (type.includes('word') || type.includes('doc')) {
      return <FileWordOutlined style={{ fontSize: 24, color: '#2B579A' }} />;
    } else if (type.includes('pdf')) {
      return <FilePdfOutlined style={{ fontSize: 24, color: '#FF0000' }} />;
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
        if (file.isNew && file.originFileObj) {
          const previewUrl = URL.createObjectURL(file.originFileObj);
          setPreviewUrl(previewUrl);
          setPreviewTitle(file.name);
          setPreviewOpen(true);
          return;
        }
        const fullPath = `${URL_UPLOAD}/${file.filepath}`;
        setPreviewUrl(fullPath);
        setPreviewTitle(file.name);
        setPreviewOpen(true);
      } catch (error) {
                    message.error(t('content.preview_error'));
      }
    } else {
              message.info(t('content.preview_not_supported'));
    }
  };

  const handleDownload = async (file: any) => {
    try {
      if (file.isNew && file.originFileObj) {
        const downloadUrl = URL.createObjectURL(file.originFileObj);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);
      } else {
        const fullPath = `${URL_UPLOAD}/${file.filepath}`;
        const response = await fetch(fullPath);
        if (!response.ok) throw new Error('Network response was not ok');
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }
    } catch (error) {
              message.error(t('content.download_error'));
    }
  };

  const  handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('content', content);
      files.forEach(file => {
        if (file.isNew && file.originFileObj) {
          formData.append('files', file.originFileObj);
        }
      });
      await addContent(documentId, formData);
      if (onSuccess) onSuccess();
      setFiles([]);
      setContent('');
      setIsSubmitting(false);
      onClose();
    } catch (error) {
      setIsSubmitting(false);
              message.error(t('content.prepare_files_error'));
    }
  };

  return (
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
          <Space align="center" style={{ fontSize: '14px', marginLeft: 24 }}>
            <Input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('content.enter_content')}
              style={{ width: '300px' }}
              required={true}
              
            />
          </Space>
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
            document.getElementById('file-upload-add')?.click();
          }}
        >
                      {t('content.upload_file')}
        </Button>,
        <Button
          key="confirm"
          type="primary"
          icon={<CheckOutlined />}
          onClick={handleConfirm}
          loading={isSubmitting}
          disabled={files.length === 0}
        >
          {t('common.confirm')}
        </Button>
      ]}
    >
      {/* Metadata section giống ModalContent */}
      <div style={{ color: '#8C8C8C', marginBottom: 16 }}>
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <Space>
            <UserOutlined />
                            <Text>{t('creator')}: {creator}</Text>
          </Space>
          <Space>
            <CalendarOutlined />
                          <Text>{t('created_at')}: {createdAt}</Text>
          </Space>
          <Space>
            <EditOutlined />
                          <Text>{t('updated_at')}: {updatedAt}</Text>
          </Space>
        </Space>
      </div>
      <List
        dataSource={files}
        renderItem={(file) => (
          <List.Item
            key={file.uid}
            actions={[
              (file.type.toLowerCase().includes('pdf') || 
               file.type.toLowerCase().includes('image') ||
               /\.(jpg|jpeg|png|gif|pdf)$/i.test(file.name)) && (
                                  <Tooltip title={t('content.preview')}>
                  <Button
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={() => handlePreview(file)}
                  />
                </Tooltip>
              ),
                              <Tooltip title={t('content.download')}>
                <Button
                  type="text"
                  icon={<DownloadOutlined />}
                  onClick={() => handleDownload(file)}
                />
              </Tooltip>,
                              <Tooltip title={t('content.delete')}>
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteFile(file.uid, file.name)}
                />
              </Tooltip>
            ].filter(Boolean)}
          >
            <List.Item.Meta
              avatar={getFileIcon(file.type)}
              title={
                <Space>
                  <Text>{displayFileName(file.name)}</Text>
                  {file.isNew && (
                    <Tag color="processing">{t('content.new_file')}</Tag>
                  )}
                </Space>
              }
            />
          </List.Item>
        )}
      />
      <Upload
        id="file-upload-add"
        style={{ display: 'none' }}
        accept={ACCEPTED_FILE_EXTENSIONS}
        multiple={false}
        fileList={[]}
        beforeUpload={(file) => {
          if (!isValidFileType(file)) {
            message.error(t('content.invalid_file_type'));
            return Upload.LIST_IGNORE;
          }
          const maxSize = 50 * 1024 * 1024; // 50MB
          if (file.size > maxSize) {
                          message.error(t('content.file_too_large', { maxSize: '50MB' }));
            return Upload.LIST_IGNORE;
          }
          return false;
        }}
        onChange={({ fileList }) => {
          if (fileList.length > 0) {
            handleUploadFiles([fileList[0]]);
          }
        }}
      >
        <Button type="primary" icon={<UploadOutlined />}>
          {t('document.content.select_files')}
        </Button>
      </Upload>
      <Modal
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={() => {
          setPreviewOpen(false);
          if (previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl);
          }
        }}
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
  );
};

export default ModalAddContent;
