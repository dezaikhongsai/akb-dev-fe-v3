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
  WarningFilled,
  PlusOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useState, useMemo } from 'react';
import type { UploadFile } from 'antd/es/upload/interface';
import dayjs from 'dayjs';

const { Text } = Typography;

interface ModalAddContentProps {
  open: boolean;
  onClose: () => void;
  documentId: string;
  documentName: string;
  onConfirm: (content: string, files: UploadFile[]) => void;
}

const ModalAddContent: React.FC<ModalAddContentProps> = ({
  open,
  onClose,
  documentId,
  documentName,
  onConfirm
}) => {
  const { t } = useTranslation(['project', 'common']);
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<UploadFile[]>([]);

  // Reset data khi đóng modal
  const handleClose = () => {
    setContent('');
    setFiles([]);
    onClose();
  };

  // Kiểm tra có thay đổi để enable/disable nút confirm
  const hasChanges = useMemo(() => {
    return content.trim() !== '' || files.length > 0;
  }, [content, files]);

  const handleDeleteFile = (fileId: string, fileName: string) => {
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
        setFiles(prev => prev.filter(file => file.uid !== fileId));
      }
    });
  };

  const handleUploadFiles = (newFiles: UploadFile[]) => {
    // Lọc ra các file mới chưa có trong danh sách
    const uniqueNewFiles = newFiles.filter(newFile => 
      !files.some(existingFile => existingFile.uid === newFile.uid)
    );
    
    setFiles(prev => [...prev, ...uniqueNewFiles]);
  };

  // Chuyển đổi files sang định dạng UploadFile cho antd Upload
  const uploadFileList = files.map(file => ({
    uid: file.uid,
    name: file.name,
    status: 'done' as const,
    type: file.type,
    size: file.size,
  }));

  const handleConfirm = () => {
    if (!content.trim()) {
      message.error(t('document.content.content_required'));
      return;
    }
    onConfirm(content, files);
  };

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

  return (
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
            <Input
              placeholder={t('document.content.enter_content')}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{ width: '300px' }}
            />
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
            document.getElementById('file-upload-new')?.click();
          }}
        >
          {t('document.content.upload_file')}
        </Button>,
        <Button
          key="confirm"
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleConfirm}
          disabled={!hasChanges}
        >
          {t('document.content.add')}
        </Button>
      ]}
    >
      <div style={{ color: '#8C8C8C', marginBottom: 16 }}>
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <Space>
            <UserOutlined />
            <Text>{t('document.creator')}: {localStorage.getItem('userName') || 'N/A'}</Text>
          </Space>
          <Space>
            <CalendarOutlined />
            <Text>{t('document.created_at')}: {dayjs().format('DD/MM/YYYY HH:mm')}</Text>
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
              <Tooltip title={t('document.content.delete')}>
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteFile(file.uid, file.name)}
                />
              </Tooltip>
            ]}
          >
            <List.Item.Meta
              avatar={getFileIcon(file.type || file.name.split('.').pop() || '')}
              title={file.name}
              description={
                <Space>
                  <span>{file.type || file.name.split('.').pop()}</span>
                  {file.size && <span>{formatFileSize(file.size)}</span>}
                </Space>
              }
            />
          </List.Item>
        )}
      />

      <Upload
        id="file-upload-new"
        style={{ display: 'none' }}
        accept=".doc,.docx,.pdf,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
        multiple
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
        onChange={({ fileList }) => handleUploadFiles(fileList)}
      >
        <Button type="primary" icon={<UploadOutlined />}>
          {t('document.content.select_files')}
        </Button>
      </Upload>
    </Modal>
  );
};

export default ModalAddContent;
