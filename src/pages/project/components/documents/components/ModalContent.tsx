import { Modal, Typography, Space, Button, Upload, List, Tooltip, message, Divider, Input, Tag } from 'antd';
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
import { useState, useEffect } from 'react';
import type { UploadFile } from 'antd/es/upload/interface';
import type { RcFile } from 'antd/es/upload';
import dayjs from 'dayjs';

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

interface ModalContentProps {
  open: boolean;
  onClose: () => void;
  contentId: string;
  contentName: string;
  documentName: string;
  files: FileItem[];
  creator: string;
  createdAt: string;
  updatedAt: string;
  onDeleteFile: (fileId: string) => void;
  onUploadFiles: (files: UploadFile[]) => void;
  onConfirm: (data: { contentId: string; content: string; files: File[] }, onSuccess?: () => void) => void;
  onSuccess?: () => void;
  onContentChange?: (newContent: string) => void;
}

// const getSafeFileName = (file: RcFile | UploadFile): string => {
//   // Lấy tên file gốc
//   const originalName = file instanceof File ? file.name : file.originFileObj?.name || file.name;
  
//   // Chuyển đổi tên file thành chuỗi UTF-8 an toàn
//   const encoder = new TextEncoder();
//   const decoder = new TextDecoder('utf-8');
//   const bytes = encoder.encode(originalName);
//   return decoder.decode(bytes);
// };

const ModalContent: React.FC<ModalContentProps> = ({
  open,
  onClose,
  contentId,
  contentName,
  documentName,
  files: initialFiles,
  creator,
  createdAt,
  updatedAt,
  onDeleteFile,
  onUploadFiles,
  onConfirm,
  onSuccess,
  onContentChange
}) => {
  const { t } = useTranslation(['document', 'common']);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [editedContent, setEditedContent] = useState(contentName);
  const [currentFiles, setCurrentFiles] = useState(initialFiles);
  const [deletedFileIds, setDeletedFileIds] = useState<string[]>([]);
  const URL_UPLOAD = import.meta.env.VITE_API_UPLOAD_URL;
  // const [hasChanges, setHasChanges] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);


  // Reset state when modal opens
  useEffect(() => {
    setEditedContent(contentName);
    setCurrentFiles(initialFiles);
  }, [contentName, initialFiles]);

  // Reset data khi đóng modal
  const handleClose = () => {
    setEditedContent(contentName);
    setCurrentFiles(initialFiles.map(f => ({
      ...f,
      originFileObj: undefined
    })));
    setIsEditingContent(false);
    setPreviewOpen(false);
    setPreviewUrl('');
    setPreviewTitle('');
    onClose();
  };
  const handleContentSubmit = () => {
    setIsEditingContent(false);
    onContentChange?.(editedContent);
  };

  const handleDeleteFileClick = (fileId: string, fileName: string) => {
    Modal.confirm({
      title: t('content.delete_file_confirm_title'),
      icon: <WarningFilled style={{ color: '#faad14' }} />,
              content: t('content.delete_file_confirm_content', { fileName }),
      okText: t('common.confirm'),
      cancelText: t('common.cancel'),
      okButtonProps: { 
        danger: true,
        icon: <DeleteOutlined />
      },
      onOk: async () => {
        try {
          // Nếu là file cũ (không phải file mới upload)
          if (!currentFiles.find(f => f.uid === fileId)?.isNew) {
            await onDeleteFile(fileId);
            setDeletedFileIds(prev => [...prev, fileId]);
          }
          
          // Chỉ cần cập nhật state, useEffect sẽ xử lý hasChanges
          setCurrentFiles(prev => prev.filter(file => file.uid !== fileId));
          message.success(t('content.delete_success'));
        } catch (error) {
          console.error('Error deleting file:', error);
                      message.error(t('content.delete_error'));
        }
      }
    });
  };

  const ACCEPTED_FILE_TYPES = {
    // Microsoft Office
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    
    // PDF
    'pdf': 'application/pdf',
    
    // Images
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'bmp': 'image/bmp',
    'webp': 'image/webp',
    
    // Text
    'txt': 'text/plain',
    'csv': 'text/csv',
  };

  const ACCEPTED_FILE_EXTENSIONS = Object.keys(ACCEPTED_FILE_TYPES).map(ext => `.${ext}`).join(',');

  const isValidFileType = (file: File): boolean => {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const expectedMimeType = ACCEPTED_FILE_TYPES[extension as keyof typeof ACCEPTED_FILE_TYPES];
    
    // Kiểm tra extension và mime type
    return (
      expectedMimeType !== undefined && 
      (file.type === expectedMimeType || file.type.startsWith('application/') || file.type.startsWith('image/'))
    );
  };

  const handleUploadFiles = (newFiles: UploadFile[]) => {
    // Kiểm tra file trùng tên và size đã có trong currentFiles
    const duplicateFiles = newFiles.filter(
      newFile => currentFiles.some(existingFile =>
        existingFile.name === newFile.name && existingFile.size === newFile.size
      )
    );
    if (duplicateFiles.length > 0) {
      message.error(t('content.duplicate_file_error', { fileName: duplicateFiles[0].name }));
      return;
    }
    // Gộp file mới vào currentFiles, đánh dấu isNew
    setCurrentFiles(prev => [
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
    onUploadFiles(newFiles);
  };

  const handleConfirmChanges = () => {
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      
      // 1. Thêm content
      formData.append('content', editedContent);

      // 2. Xử lý files
      // 2.1. Files mới
      const newFiles = currentFiles
        .filter(file => file.isNew)
        .map(file => file.originFileObj as RcFile);

      // 2.2. Files cũ chưa bị xóa
      const existingFiles = currentFiles
        .filter(file => !file.isNew && !deletedFileIds.includes(file.uid))
        .map(file => ({
          _id: file.uid,
          originalName: file.name,
          path: file.filepath,
          type: file.type,
          size: file.size
        }));

      // Thêm files mới vào formData
      newFiles.forEach(file => {
        formData.append('files', file);
      });

      // Thêm files cũ vào formData
      existingFiles.forEach(file => {
        formData.append('files', JSON.stringify(file));
      });

      // 3. Thêm danh sách file đã xóa
      if (deletedFileIds.length > 0) {
        formData.append('deletedFileIds', JSON.stringify(deletedFileIds));
      }

      // Log để kiểm tra
      console.log('Content:', editedContent);
      console.log('New files:', newFiles);
      console.log('Existing files:', existingFiles);
      console.log('Deleted files:', deletedFileIds);

      // Gọi API cập nhật
      onConfirm({
        contentId,
        content: editedContent,
        files: newFiles,
      }, () => {
        // Sau khi xác nhận, gộp pendingFiles vào currentFiles
        setCurrentFiles(prev => [
          ...prev,
          ...currentFiles.map(file => ({
            uid: file.uid,
            name: file.name,
            filepath: file.name,
            type: file.type || file.name.split('.').pop() || '',
            size: file.size,
            isNew: true,
            originFileObj: file.originFileObj as File
          }))
        ]);
        setCurrentFiles(prev => [
          ...prev,
          ...currentFiles.map(file => ({
            uid: file.uid,
            name: file.name,
            filepath: file.name,
            type: file.type || file.name.split('.').pop() || '',
            size: file.size,
            isNew: true,
            originFileObj: file.originFileObj as File
          }))
        ]);
        setDeletedFileIds([]);
        setIsSubmitting(false);
        // message.success(t('document.content.update_success'));
        if (onSuccess) onSuccess();
        handleClose();
      });
    } catch (error) {
      setIsSubmitting(false);
      console.error('Error preparing files:', error);
              message.error(t('content.prepare_files_error'));
    }
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
        // For new files, create object URL
        if (file.isNew && file.originFileObj) {
          const previewUrl = URL.createObjectURL(file.originFileObj);
          setPreviewUrl(previewUrl);
          setPreviewTitle(file.name);
          setPreviewOpen(true);
          return;
        }

        // For existing files, use server URL
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
        // For new files, create and trigger download link
        const downloadUrl = URL.createObjectURL(file.originFileObj);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);
      } else {
        // For existing files, fetch as blob and trigger download with correct name
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

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

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
                  <Tooltip title={t('content.edit')}>
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
            {t('content.upload_file')}
          </Button>,
          <Button
            key="confirm"
            type="primary"
            icon={<CheckOutlined />}
            onClick={handleConfirmChanges}
            loading={isSubmitting}
          >
            {t('common.confirm')}
          </Button>
        ]}
      >
        <div style={{ color: '#8C8C8C', marginBottom: 16 }}>
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <Space>
              <UserOutlined />
                                <Text>{t('creator')}: {creator}</Text>
            </Space>
            <Space>
              <CalendarOutlined />
                              <Text>{t('created_at')}: {dayjs(createdAt).format('DD/MM/YYYY HH:mm')}</Text>
            </Space>
            <Space>
              <EditOutlined />
                              <Text>{t('updated_at')}: {dayjs(updatedAt).format('DD/MM/YYYY HH:mm')}</Text>
            </Space>
          </Space>
        </div>

        <Divider style={{ margin: '12px 0' }} />

        <List
          dataSource={currentFiles}
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
                    onClick={() => handleDeleteFileClick(file.uid, file.name)}
                  />
                </Tooltip>
              ].filter(Boolean)}
            >
              <List.Item.Meta
                avatar={getFileIcon(file.type)}
                title={
                  <Space>
                    <Text>{file.name}</Text>
                    {file.isNew && (
                      <Tag color="processing">{t('content.new_file')}</Tag>
                    )}
                  </Space>
                }
                // XÓA description: chỉ hiển thị tên file
              />
            </List.Item>
          )}
        />
        <Upload
          id="file-upload"
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
            // Chỉ lấy file đầu tiên, thêm vào currentFiles
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
    </>
  );
};

export default ModalContent;

