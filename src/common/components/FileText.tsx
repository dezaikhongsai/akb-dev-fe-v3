import React, { useState } from 'react';
import { Space, Typography, Button, message, Modal, Image } from 'antd';
import { 
  DownloadOutlined, 
  EyeOutlined,
  FileWordOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  FileImageOutlined,
  FileOutlined
} from '@ant-design/icons';
import { downloadFile } from '../../services/document/document.service';
import { Tooltip } from 'antd/lib';

interface FileTextProps {
  originalName: string;
  filePath: string;
  fileType?: string; // Optional file type parameter
}

const FileText: React.FC<FileTextProps> = ({ originalName, filePath, fileType }) => {
  const [previewVisible, setPreviewVisible] = useState(false);

  // Function to get file extension
  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  // Function to get file icon based on file type or extension
  const getFileIcon = () => {
    const ext = fileType?.toLowerCase() || getFileExtension(originalName);
    
    switch (ext) {
      case 'doc':
      case 'docx':
      case 'word':
        return <FileWordOutlined style={{ color: '#2B579A' }} />; // Word blue color
      
      case 'pdf':
        return <FilePdfOutlined style={{ color: '#FF0000' }} />; // PDF red color
      
      case 'xls':
      case 'xlsx':
      case 'excel':
        return <FileExcelOutlined style={{ color: '#217346' }} />; // Excel green color
      
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'image':
        return <FileImageOutlined style={{ color: '#774ABC' }} />; // Purple for images
      
      default:
        return <FileOutlined />; // Default file icon
    }
  };

  // Check if file is previewable (PDF or image)
  const isPreviewable = (filename: string): boolean => {
    const ext = getFileExtension(filename);
    return ['pdf', 'jpg', 'jpeg', 'png', 'gif'].includes(ext);
  };

  // Check if file is an image
  const isImage = (filename: string): boolean => {
    const ext = getFileExtension(filename);
    return ['jpg', 'jpeg', 'png', 'gif'].includes(ext);
  };

  // Handle download click
  const handleDownload = async () => {
    try {
      const response = await downloadFile(filePath);
      
      // Create blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      message.error('Failed to download file');
    }
  };

  // Handle preview click
  const handlePreview = () => {
    if (!isPreviewable(originalName)) {
      message.info('Preview is not available for this file type');
      return;
    }
    setPreviewVisible(true);
  };
  const isProd = import.meta.env.VITE_IS_PROD === 'true';
  const API_UPLOADS_URL = isProd ? import.meta.env.VITE_API_UPLOAD_PROD + `/${filePath}`: import.meta.env.VITE_API_UPLOAD_URL + `/${filePath}`;

  return (
    <>
      <Space>
        {getFileIcon()}
        <Typography.Text>{originalName}</Typography.Text>
        <Space size="small">
          <Tooltip title="Tải xuống">
            <Button
            type="text"
            icon={<DownloadOutlined />}
            onClick={handleDownload}
            title="Download"
          />
          </Tooltip>
         <Tooltip title = {'Xem trước'}>
           <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={handlePreview}
            disabled={!isPreviewable(originalName)}
            title={isPreviewable(originalName) ? 'Preview' : 'Preview not available'}
          />
         </Tooltip>
        </Space>
      </Space>

      {/* Preview Modal */}
      {isImage(originalName) ? (
        <Image
          style={{ display: 'none' }}
          src={API_UPLOADS_URL}
          preview={{
            visible: previewVisible,
            onVisibleChange: (visible) => setPreviewVisible(visible),
          }}
        />
      ) : (
        <Modal
          title={originalName}
          open={previewVisible}
          onCancel={() => setPreviewVisible(false)}
           width="100vw" 
          // height={'100%'}
          footer={null}
          style={{ top: 24, padding: 0 }}
        >
          <iframe
            src={API_UPLOADS_URL}
             style={{ width: '100%', height: '85vh', border: 'none' }}
            title={originalName}
          />
        </Modal>
      )}
    </>
  );
};

export default FileText;
