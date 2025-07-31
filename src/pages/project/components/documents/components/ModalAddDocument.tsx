import { FileAddOutlined, SaveOutlined, PlusOutlined, DeleteOutlined, LeftOutlined, RightOutlined, UploadOutlined, FileTextOutlined, FileDoneOutlined, FileProtectOutlined, DownloadOutlined, CloseOutlined } from "@ant-design/icons";
import { Button, Modal, Space, Typography, Input, Radio, Form, message, Card, Divider, List, Tooltip } from "antd";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { addDocument } from '../../../../../services/document/document.service';
import { autoSearchProject } from '../../../../../services/home/home.service';
import { Project } from '../../../../../common/components/SearchBox';
import { useDebounce } from '../../../../../common/hooks/useDebounce';
import { displayFileName } from '../../../../../common/utils/fileName.util';
import { getProjectDetail } from '../../../../../services/project/project.service';
        
interface IDocumentData {
    document: {
        projectId: string,
        type: string,
        name: string,
        contents: IContentInput[];
    };
    files: File[];
}

interface IContentInput {
    content: string;
    fileIndexes: number[];
}

interface ModalAddDocumentProp {
    mode : 'in' | 'out',
    projectId?: string;
    open: boolean;
    onClose: () => void;
    onSuccess?: (type: string) => void;
}

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

const ModalAddDocument: React.FC<ModalAddDocumentProp> = ({
    open,
    onClose,
    onSuccess,
    projectId,
    mode,
}) => {
    const { t } = useTranslation(["document", "common"]);
    
    const typeOptions = [
        { value: "request", label: t("type_options.request"), color: "blue", icon: <FileProtectOutlined /> },
        { value: "report", label: t("type_options.report"), color: "orange", icon: <FileDoneOutlined /> },
        { value: "document", label: t("type_options.document"), color: "green", icon: <FileTextOutlined /> },
    ];
    const [form] = Form.useForm();
    const [contents, setContents] = useState<IContentInput[]>([{ content: '', fileIndexes: [] }]);
    const [files, setFiles] = useState<File[]>([]);
    const filesRef = useRef<File[]>([]);
    useEffect(() => {
        filesRef.current = files;
    }, [files]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [touched, setTouched] = useState<{[key: string]: boolean}>({});

    // Project search states for mode 'out'
    const [searchValue, setSearchValue] = useState('');
    const [_searchResults, setSearchResults] = useState<Project[]>([]);
    const [_searchLoading, setSearchLoading] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const debouncedSearchValue = useDebounce(searchValue, 400);

    // Project info state for mode 'in'
    const [projectInfo, setProjectInfo] = useState<Project | null>(null);
    const [projectLoading, setProjectLoading] = useState(false);

    // Thêm key để force remount input file khi mode hoặc modal mở
    const [inputFileKey, setInputFileKey] = useState(0);

    // Hàm reset form và tất cả state
    const resetForm = useCallback(() => {
        console.log('[LOG] resetForm CALLED');
        form.resetFields();
        setContents([{ content: '', fileIndexes: [] }]);
        setFiles([]);
        setCurrentPage(1);
        setSelectedProject(null);
        // setProjectInfo(null); // Không cần nữa
        setSearchValue('');
        setSearchResults([]);
        setLoading(false);
        // setProjectLoading(false); // Không cần nữa
        setTouched({});
        // Force remount input file bằng cách đổi key
        setInputFileKey(prev => prev + 1);
        form.validateFields().catch(() => {});
    }, [form]);

    useEffect(() => {
        const fetchProjectInfo = async () => {
            if (open && mode === 'in' && projectId) {
                try {
                    setProjectLoading(true);
                    const response = await getProjectDetail(projectId);
                    // Transform the response to match Project interface
                    const projectData = response.data.project;
                    const transformedProject: Project = {
                        _id: projectData._id,
                        name: projectData.name,
                        alias: projectData.alias,
                        pm: projectData.pm,
                        customer: projectData.customer
                    };
                    setProjectInfo(transformedProject);
                } catch (error) {
                    console.error('Error fetching project info:', error);
                    message.error(t("content.error_fetching_project"));
                } finally {
                    setProjectLoading(false);
                }
            }
        };

        fetchProjectInfo();
    }, [open, mode, projectId, t]);

    // Handle project search
    useEffect(() => {
        const fetchSearchResults = async () => {
            if (!debouncedSearchValue) {
                setSearchResults([]);
                return;
            }

            try {
                setSearchLoading(true);
                const response = await autoSearchProject(debouncedSearchValue);
                setSearchResults(response.data);
            } catch (error) {
                console.error('Search error:', error);
                setSearchResults([]);
            } finally {
                setSearchLoading(false);
            }
        };

        fetchSearchResults();
    }, [debouncedSearchValue]);

    // Handle project selection
    
    // Handle field blur to mark as touched
    const handleFieldBlur = (fieldName: string) => {
        setTouched(prev => ({ ...prev, [fieldName]: true }));
    };

    // Utility function to ensure files are properly formatted for multipart/form-data
    const ensureFileFormat = (file: File): File => {
        // Ensure filename is properly encoded for multipart/form-data
        const originalName = file.name;
        let safeName = originalName;
        
        // Try to decode if it's already encoded
        try {
            const decoded = decodeURIComponent(originalName);
            if (decoded !== originalName) {
                safeName = decoded;
            }
        } catch {
            // If decode fails, keep original name
        }
        
        // Ensure the filename is properly encoded for multipart/form-data
        // This helps prevent browser from double-encoding the filename
        const blob = file.slice(0, file.size, file.type);
        
        // Create a new File with the correct name encoding
        const newFile = new File([blob], safeName, { 
            type: file.type,
            lastModified: file.lastModified
        });
        
        // Log the file details for debugging
        console.log('File processing:', {
            originalName,
            safeName,
            fileType: file.type,
            fileSize: file.size
        });
        
        return newFile;
    };

    // Xử lý upload file cho content hiện tại
    const handleUploadFiles = (newFiles: File[]) => {
        console.log('[DEBUG] ModalAddDocument: handleUploadFiles called', { newFilesCount: newFiles.length, currentFilesCount: files.length });
        // Ensure all files are properly formatted
        const formattedFiles = newFiles.map(ensureFileFormat);
        setFiles(prevFiles => {
            const startIdx = prevFiles.length;
            const newFileIndexes = formattedFiles.map((_, idx) => startIdx + idx);
            setContents(prevContents => {
                const updated = prevContents.map((c, idx) =>
                    idx === currentPage - 1
                        ? { ...c, fileIndexes: [...c.fileIndexes, ...newFileIndexes] }
                        : c
                );
                // Log contents sau khi thêm file
                console.log('[LOG] contents after upload:', updated);
                return updated;
            });
            const updatedFiles = [...prevFiles, ...formattedFiles];
            // Log files sau khi thêm file
            console.log('[LOG] files after upload:', updatedFiles);
            return updatedFiles;
        });
        // Force remount input file sau khi upload
        setInputFileKey(prev => prev + 1);
    };

    // Xử lý xóa file khỏi content hiện tại
    const handleDeleteFile = (fileIdx: number) => {
        setFiles(prevFiles => {
            const newFiles = prevFiles.filter((_, idx) => idx !== fileIdx);
            setContents(prevContents => prevContents.map(content => {
                const newFileIndexes = content.fileIndexes
                    .filter(idx => idx !== fileIdx)
                    .map(idx => (idx > fileIdx ? idx - 1 : idx));
                return { ...content, fileIndexes: newFileIndexes };
            }));
            return newFiles;
        });
    };

    // Xử lý nhập nội dung cho content hiện tại
    const handleContentChange = (value: string) => {
        setContents(prev => prev.map((c, idx) => idx === currentPage - 1 ? { ...c, content: value } : c));
    };

    // Thêm content mới (trang mới)
    const handleAddContent = () => {
        setContents(prev => [...prev, { content: '', fileIndexes: [] }]);
        setCurrentPage(contents.length + 1);
    };

    // Xóa content hiện tại
    const handleDeleteContent = () => {
        if (contents.length === 1) return;
        const idxToRemove = currentPage - 1;
        const fileIndexesToRemove = contents[idxToRemove].fileIndexes;
        let newFiles = files.filter((_, idx) => !fileIndexesToRemove.includes(idx));
        let fileIndexMap: Record<number, number> = {};
        let newIdx = 0;
        files.forEach((_file, i) => {
            if (!fileIndexesToRemove.includes(i)) {
                fileIndexMap[i] = newIdx;
                newIdx++;
            }
        });
        const newContents = contents
            .filter((_, i) => i !== idxToRemove)
            .map(content => ({
                content: content.content,
                fileIndexes: content.fileIndexes
                    .filter(i => !fileIndexesToRemove.includes(i))
                    .map(i => fileIndexMap[i])
            }));
        setFiles(newFiles);
        setContents(newContents);
        setCurrentPage(prev => Math.max(1, prev > newContents.length ? newContents.length : prev));
    };

    // Validate file trước khi upload
    const beforeUpload = (file: File) => {
        const extension = file.name.split('.').pop()?.toLowerCase() || '';
        const expectedMimeType = ACCEPTED_FILE_TYPES[extension as keyof typeof ACCEPTED_FILE_TYPES];
        
        // Check file type
        if (!expectedMimeType) {
            message.error(`${file.name} - ${t("content.invalid_file_type")}`);
            return false;
        }
        
        // Check MIME type
        if (!(file.type === expectedMimeType || file.type.startsWith('application/') || file.type.startsWith('image/'))) {
            message.error(`${file.name} - ${t("content.invalid_file_type")}`);
            return false;
        }
        
        // Check file size (50MB)
        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
            message.error(`${file.name} - ${t("content.file_too_large", { maxSize: "50MB" })}`);
            return false;
        }
        
        return true;
    };

    // Khi submit
    const handleSave = async () => {
        try {
            // Mark all fields as touched when submitting
            setTouched({
                projectId: true,
                type: true,
                name: true
            });
            
            await form.validateFields();
            
            // Validate projectId for mode 'in'
            if (mode === 'in') {
                if (!projectId || projectId.trim() === '') {
                    console.error('ProjectId validation failed:', { projectId, mode });
                    message.error(t("content.project_id_required"));
                    return;
                }
                console.log('ProjectId validation passed:', { projectId, mode });
            }
            
            setLoading(true);
            const filesToSubmit = filesRef.current.length > 0 ? filesRef.current : files;
            const data: IDocumentData = {
                document: {
                    projectId: mode === 'in' ? projectId! : selectedProject!._id,
                    type: form.getFieldValue('type'),
                    name: form.getFieldValue('name'),
                    contents: contents
                },
                files: filesToSubmit
            };
            
            console.log('Submitting document data:', {
                mode,
                projectId: data.document.projectId,
                type: data.document.type,
                name: data.document.name,
                contentsCount: data.document.contents.length,
                filesCount: data.files.length,
                filesRefCount: filesRef.current.length,
                stateFilesCount: files.length
            });
            
            // Log toàn bộ state trước khi submit
            console.log('[LOG] handleSave - files:', files);
            console.log('[LOG] handleSave - contents:', contents);
            
            const formData = new FormData();
            formData.append("document", JSON.stringify(data.document));
            
            // Log tên file trước khi gửi và đảm bảo format đúng cho multipart/form-data
            filesToSubmit.forEach((file, index) => {
                console.log(`[LOG] File ${index + 1} name:`, file.name);
                console.log(`[LOG] File ${index + 1} type:`, file.type);
                console.log(`[LOG] File ${index + 1} size:`, file.size);
                
                // Ensure file is properly formatted for multipart/form-data
                const formattedFile = ensureFileFormat(file);
                
                // Log the final filename that will be sent
                console.log(`File ${index + 1} final name:`, formattedFile.name);
                
                // Thêm file vào FormData với tên được encode đúng cách
                formData.append("files", formattedFile, formattedFile.name);
            });
            
            // Log toàn bộ FormData
            for (let pair of formData.entries()) {
                if (pair[0] === 'files' && pair[1] instanceof File) {
                    const f = pair[1] as File;
                    console.log(`[LOG] FormData - files: name=${f.name}, type=${f.type}, size=${f.size}`);
                } else {
                    console.log(`[LOG] FormData - ${pair[0]}:`, pair[1]);
                }
            }
            
            await addDocument(formData);
            message.success(t("add"));
            if (onSuccess) onSuccess(form.getFieldValue('type'));
            resetForm();
            onClose();
        } catch (err: any) {
            // Show error message for better debugging
            console.error('Save error:', err);
            if (err.response?.data?.message) {
                message.error(err.response.data.message);
            } else {
                message.error(t("common.error_occurred"));
            }
        } finally {
            setLoading(false);
        }
    };

    const currentContent = contents[currentPage - 1];
    
    console.log('[DEBUG] ModalAddDocument: currentContent', { 
        currentContent, 
        currentPage, 
        contentsLength: contents.length,
        filesLength: files.length 
    });

    return (
        <Modal
            open={open}
            onCancel={() => {
                // resetForm();
                onClose();
            }}
            width={900}
            styles={{ body: { maxHeight: '60vh', overflow: 'auto' } }}
            title={
                <Space>
                    <FileAddOutlined />
                    <Typography.Text>
                        {mode === 'in' ? t("add_new_request") : t("add_quick_request")}
                    </Typography.Text>
                </Space>
            }
            footer={[
                <Button
                    icon={<CloseOutlined />}
                    onClick={onClose}
                    key="close"
                >
                    {t("common.close")}
                </Button>,
                <Button
                    icon={<SaveOutlined />}
                    onClick={handleSave}
                    key="save"
                    type="primary"
                    disabled={contents.length === 0}
                    loading={loading}
                >
                    {t("save")}
                </Button>
            ]}
            destroyOnHidden={true}
        >
            {/* Project Information Display */}
            {mode === 'in' && (
                <Card 
                    size="small" 
                    style={{ marginBottom: 16, backgroundColor: '#f8f9fa' }}
                    title={
                        <Space>
                            <FileTextOutlined style={{ color: '#1890ff' }} />
                            <Typography.Text strong>{t("content.project_information")}</Typography.Text>
                        </Space>
                    }
                >
                    {projectLoading ? (
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <Typography.Text type="secondary">{t("content.loading_project")}</Typography.Text>
                        </div>
                    ) : projectInfo ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Typography.Text strong style={{ minWidth: 80 }}>{t("content.project_name")}:</Typography.Text>
                                <Typography.Text>{projectInfo.name}</Typography.Text>
                            </div>
                            {projectInfo.alias && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Typography.Text strong style={{ minWidth: 80 }}>{t("content.project_alias")}:</Typography.Text>
                                    <Typography.Text type="secondary">{projectInfo.alias}</Typography.Text>
                                </div>
                            )}
                            {projectInfo.pm && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Typography.Text strong style={{ minWidth: 80 }}>{t("content.project_manager")}:</Typography.Text>
                                    <Typography.Text>{projectInfo.pm.profile.name}</Typography.Text>
                                </div>
                            )}
                            {projectInfo.customer && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Typography.Text strong style={{ minWidth: 80 }}>{t("content.customer")}:</Typography.Text>
                                    <Typography.Text>{projectInfo.customer.profile.name}</Typography.Text>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <Typography.Text type="secondary">{t("content.project_not_found")}</Typography.Text>
                        </div>
                    )}
                </Card>
            )}

            <Form
                form={form}
                layout="vertical"
                initialValues={{ type: "request" }}
                style={{ marginBottom: 24 }}
                key={`a`}
            >
                
                <Form.Item
                    label={<Space><FileProtectOutlined />{t("type")}</Space>}
                    name="type"
                    validateStatus={touched.type && !form.getFieldValue('type') ? 'error' : undefined}
                    help={touched.type && !form.getFieldValue('type') ? t("type") + "Là cần thiết" : undefined}
                    rules={[{ required: true, message: t("type") + "Là cần thiết" }]}
                >
                    <Radio.Group 
                        optionType="button" 
                        buttonStyle="solid" 
                        style={{ width: '100%' }}
                        onChange={() => setTouched(prev => ({ ...prev, type: true }))}
                    >
                        {typeOptions.map(opt => (
                            <Radio.Button value={opt.value} key={opt.value} style={{ width: 140, textAlign: 'center', marginRight: 8 }}>
                                <Space>
                                    {opt.icon}
                                    {opt.label}
                                </Space>
                            </Radio.Button>
                        ))}
                    </Radio.Group>
                </Form.Item>
                <Form.Item
                    label={<Space><FileTextOutlined />{t("name")}</Space>}
                    name="name"
                    validateStatus={touched.name && !form.getFieldValue('name') ? 'error' : undefined}
                    help={touched.name && !form.getFieldValue('name') ? t("name") + "Là cần thiết" : undefined}
                    // rules={[{ required: true, message: t("name") + " is required" }]}
                >
                    <Input 
                        placeholder={t("name")}
                        onBlur={() => handleFieldBlur('name')}
                    />
                </Form.Item>
            </Form>
            <Divider orientation="left"><Space><FileTextOutlined />{t("contents")}</Space></Divider>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <Button
                    icon={<PlusOutlined />}
                    type="dashed"
                    onClick={handleAddContent}
                >
                    {t("content.add")}
                </Button>
                <Space>
                    <Button
                        icon={<LeftOutlined />}
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                    />
                    <span>{currentPage} / {contents.length || 1}</span>
                    <Button
                        icon={<RightOutlined />}
                        disabled={currentPage === contents.length || contents.length === 0}
                        onClick={() => setCurrentPage(p => p + 1)}
                    />
                </Space>
            </div>
            {contents.length > 0 && currentContent && (
                <Card
                    title={
                        <Space>
                            <FileTextOutlined />
                            <Typography.Text strong>{t("content.add")}</Typography.Text>
                            {contents.length > 1 && (
                                <Button
                                    icon={<DeleteOutlined />}
                                    danger
                                    size="small"
                                    onClick={handleDeleteContent}
                                >
                                    {t("common.delete")}
                                </Button>
                            )}
                        </Space>
                    }
                    style={{ marginBottom: 16 }}
                >
                    <Input.TextArea
                        value={currentContent.content}
                        onChange={e => handleContentChange(e.target.value)}
                        placeholder={t('content.enter_content')}
                        style={{ marginBottom: 16 }}
                        autoSize={{ minRows: 2, maxRows: 4 }}
                    />
                    <Divider orientation="left"><Space><UploadOutlined style={{ color: '#722ED1' }} />{t('content.files')}</Space></Divider>
                    <List
                        header={<b>{t('content.files')}</b>}
                        dataSource={currentContent.fileIndexes}
                        locale={{ emptyText: t('content.no_files') }}
                        renderItem={idx => {
                            console.log('[DEBUG] ModalAddDocument: Rendering file item', { 
                                idx, 
                                fileIndexes: currentContent.fileIndexes,
                                filesLength: files.length,
                                file: files[idx] 
                            });
                            return (
                                <List.Item
                                    actions={[
                                        <Tooltip title={t('content.download')} key="download">
                                            <Button
                                                type="text"
                                                icon={<DownloadOutlined />}
                                                onClick={() => {
                                                    const file = files[idx];
                                                    if (file) {
                                                        const url = URL.createObjectURL(file);
                                                        const link = document.createElement('a');
                                                        link.href = url;
                                                        link.download = file.name;
                                                        document.body.appendChild(link);
                                                        link.click();
                                                        document.body.removeChild(link);
                                                        URL.revokeObjectURL(url);
                                                    }
                                                }}
                                            />
                                        </Tooltip>,
                                        <Tooltip title={t('content.delete')} key="delete">
                                            <Button
                                                type="text"
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={() => handleDeleteFile(idx)}
                                            />
                                        </Tooltip>
                                    ]}
                                >
                                    <List.Item.Meta
                                        avatar={<UploadOutlined style={{ color: '#722ED1' }} />}
                                        title={<span>{files[idx] ? displayFileName(files[idx].name) : ''}</span>}
                                    />
                                </List.Item>
                            );
                        }}
                    />
                    <input
                        key={inputFileKey}
                        type="file"
                        multiple
                        accept={ACCEPTED_FILE_EXTENSIONS}
                        style={{ display: 'none' }}
                        id={`file-upload-modal-add-${mode}`}
                        onChange={e => {
                            const fileList = Array.from(e.target.files || []);
                            const validFiles = fileList.filter(beforeUpload);
                            const invalidFiles = fileList.filter(file => !beforeUpload(file));
                            
                            if (validFiles.length > 0) {
                                // Ensure files are properly formatted for multipart/form-data
                                const formattedFiles = validFiles.map(ensureFileFormat);
                                
                                handleUploadFiles(formattedFiles);
                                message.success(`${formattedFiles.length} ${t("content.file_upload_success")}`);
                            }
                            
                            if (invalidFiles.length > 0) {
                                console.log(`${invalidFiles.length} files were rejected`);
                            }
                            
                            // Không cần e.target.value = '' vì đã force remount bằng key
                        }}
                    />
                    <Button
                        type="primary"
                        icon={<UploadOutlined />}
                        style={{ marginTop: 16, background: '#722ED1', borderColor: '#722ED1' }}
                        onClick={() => document.getElementById(`file-upload-modal-add-${mode}`)?.click()}
                    >
                        {t('content.upload_file')}
                    </Button>
                </Card>
            )}
        </Modal>
    );
};

export default ModalAddDocument;
