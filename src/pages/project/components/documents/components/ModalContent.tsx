import { Modal, Typography, Space, Button, Upload, List, Tooltip, message, Divider, Input } from 'antd';
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
  EditOutlined,
  WarningFilled
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useMemo } from 'react';
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
    filepath: string;
    type: string;
    size?: number;
    originFileObj?: File;
    isNew?: boolean;
  }>;
  creator: string;
  createdAt: string;
  updatedAt: string;
  onDeleteFile: (fileId: string) => void;
  onUploadFiles: (files: UploadFile[]) => void;
  onConfirm: () => void;
  onContentChange?: (newContent: string) => void;
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
  onConfirm,
  onContentChange
}) => {
  const { t } = useTranslation(['project', 'common']);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [editedContent, setEditedContent] = useState(contentName);
  const [currentFiles, setCurrentFiles] = useState(files);
  const [originalContent] = useState(contentName);
  const [originalFiles] = useState(files);
  const URL_UPLOAD = import.meta.env.VITE_API_UPLOAD_URL;
  const formatFileSize = (bytes: number): string => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  // Cập nhật state khi props thay đổi
  useEffect(() => {
    setEditedContent(contentName);
    setCurrentFiles(files);
  }, [contentName, files]);

  // Reset data khi đóng modal
  const handleClose = () => {
    setEditedContent(contentName);
    setCurrentFiles(files);
    setIsEditingContent(false);
    setPreviewOpen(false);
    setPreviewUrl('');
    setPreviewTitle('');
    onClose();
  };

  // Kiểm tra xem có thay đổi gì không
  const hasChanges = useMemo(() => {
    const contentChanged = editedContent !== originalContent;
    const filesChanged = JSON.stringify(currentFiles) !== JSON.stringify(originalFiles);
    return contentChanged || filesChanged;
  }, [editedContent, currentFiles, originalContent, originalFiles]);

  const handleContentSubmit = () => {
    setIsEditingContent(false);
    onContentChange?.(editedContent);
  };

  const handleDeleteFileClick = (fileId: string, fileName: string) => {
    Modal.confirm({
      title: t('document.content.delete_file_confirm_title'),
      icon: <WarningFilled style={{ color: '#faad14' }} />,
      content: t('document.content.delete_file_confirm_content', { fileName }),
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
      onOk: () => {
        onDeleteFile(fileId);
        setCurrentFiles(prev => prev.filter(file => file.uid !== fileId));
      }
    });
  };

  const handleUploadFiles = (newFiles: UploadFile[]) => {
    // Lọc ra các file mới chưa có trong danh sách
    const uniqueNewFiles = newFiles.filter(newFile => 
      !currentFiles.some(existingFile => existingFile.uid === newFile.uid)
    ).map(file => ({
      uid: file.uid,
      name: file.name,
      filepath: file.name,
      type: file.type || file.name.split('.').pop() || '',
      size: file.size,
      originFileObj: file.originFileObj,
      isNew: true
    }));
    
    setCurrentFiles(prev => [...prev, ...uniqueNewFiles]);
  };

  // Chuyển đổi currentFiles sang định dạng UploadFile cho antd Upload
  const uploadFileList = currentFiles
    .filter(file => file.isNew)
    .map(file => ({
      uid: file.uid,
      name: file.name,
      status: 'done' as const,
      url: file.filepath,
      type: file.type,
      size: file.size,
    }));

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
        onCancel={handleClose}
        width={800}
        title={
          <Space direction="vertical" size={4}>
            <Space>
              <FileTextOutlined />
              <Text>{documentName}</Text>
            </Space>
            <Space align="center" style={{ fontSize: '14px', marginLeft: 24 }}>
              {isEditingContent ? (
                <Input
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  onPressEnter={handleContentSubmit}
                  onBlur={handleContentSubmit}
                  autoFocus
                  style={{ width: '300px' }}
                />
              ) : (
                <>
                  <Text type="secondary">{editedContent}</Text>
                  <Tooltip title={t('document.content.edit')}>
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => setIsEditingContent(true)}
                      style={{ marginLeft: 8 }}
                    />
                  </Tooltip>
                </>
              )}
            </Space>
          </Space>
        }
        footer={[
          <Button key="close" icon={<CloseOutlined />} onClick={handleClose}>
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
            disabled={!hasChanges}
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
                    onClick={() => handleDeleteFileClick(file.uid, file.name)}
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
          showUploadList={false}
          fileList={uploadFileList}
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
          onChange={({ fileList }) => {
            // Không cần check duplicate, để BE xử lý
            const newFiles = fileList.map(file => ({
              uid: file.uid,
              name: file.name,
              filepath: file.name,
              type: file.type || file.name.split('.').pop() || '',
              size: file.size,
              originFileObj: file.originFileObj,
              isNew: true
            }));
            setCurrentFiles(prev => [...prev, ...newFiles]);
          }}
        />

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
