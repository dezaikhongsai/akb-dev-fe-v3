import { FileAddOutlined, SaveOutlined, PlusOutlined, DeleteOutlined, LeftOutlined, RightOutlined, UploadOutlined, FileTextOutlined, FileDoneOutlined, FileProtectOutlined, DownloadOutlined, CloseOutlined } from "@ant-design/icons";
import { Button, Modal, Space, Typography, Input, Radio, Form, message, Card, Divider, List, Tooltip } from "antd";
import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { addDocument } from '../../../../../services/document/document.service';
import SearchBox from '../../../../../common/components/SearchBox';
import { autoSearchProject } from '../../../../../services/home/home.service';
import { Project } from '../../../../../common/components/SearchBox';
import { useDebounce } from '../../../../../common/hooks/useDebounce';
        
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
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [touched, setTouched] = useState<{[key: string]: boolean}>({});

    // Project search states for mode 'out'
    const [searchValue, setSearchValue] = useState('');
    const [searchResults, setSearchResults] = useState<Project[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const debouncedSearchValue = useDebounce(searchValue, 400);

    // Hàm reset form và tất cả state
    const resetForm = useCallback(() => {
        // Reset form fields
        form.resetFields();
        
        // Reset all states
        setContents([{ content: '', fileIndexes: [] }]);
        setFiles([]);
        setCurrentPage(1);
        setSelectedProject(null);
        setSearchValue('');
        setSearchResults([]);
        setLoading(false);
        setTouched({});
        
        // Clear validation errors
        form.validateFields().catch(() => {});
    }, [form]);

    // Reset form when modal opens
    useEffect(() => {
        if (open) {
            resetForm();
        }
    }, [open, resetForm]);

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
    const handleProjectSelect = (project: Project) => {
        setSelectedProject(project);
        setSearchValue(project.name);
        setSearchResults([]);
        // Set the form field value for validation
        form.setFieldValue('projectId', project._id);
        // Mark as touched
        setTouched(prev => ({ ...prev, projectId: true }));
        // Clear any validation errors
        form.validateFields(['projectId']).catch(() => {});
    };

    // Handle field blur to mark as touched
    const handleFieldBlur = (fieldName: string) => {
        setTouched(prev => ({ ...prev, [fieldName]: true }));
    };

    // Xử lý upload file cho content hiện tại
    const handleUploadFiles = (newFiles: File[]) => {
        setFiles(prevFiles => {
            const startIdx = prevFiles.length;
            const newFileIndexes = newFiles.map((_, idx) => startIdx + idx);
            setContents(prevContents => prevContents.map((c, idx) =>
                idx === currentPage - 1
                    ? { ...c, fileIndexes: [...c.fileIndexes, ...newFileIndexes] }
                    : c
            ));
            return [...prevFiles, ...newFiles];
        });
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
        if (!expectedMimeType || !(file.type === expectedMimeType || file.type.startsWith('application/') || file.type.startsWith('image/'))) {
            return false;
        }
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
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
            
            setLoading(true);
            const data: IDocumentData = {
                document: {
                    projectId: mode === 'in' ? projectId! : selectedProject!._id,
                    type: form.getFieldValue('type'),
                    name: form.getFieldValue('name'),
                    contents: contents
                },
                files: files
            };
            const formData = new FormData();
            formData.append("document", JSON.stringify(data.document));
            files.forEach(file => formData.append("files", file));
            await addDocument(formData);
            message.success(t("add"));
            if (onSuccess) onSuccess(form.getFieldValue('type'));
            resetForm();
            onClose();
        } catch (err: any) {
            // Don't show error message popup, let form validation handle it
            console.error('Save error:', err);
        } finally {
            setLoading(false);
        }
    };

    const currentContent = contents[currentPage - 1];

    return (
        <Modal
            open={open}
            onCancel={() => {
                resetForm();
                onClose();
            }}
            width={900}
            bodyStyle={{ maxHeight: '60vh', overflow: 'auto' }}
            title={
                <Space>
                    <FileAddOutlined />
                    <Typography.Text>{t("add")}</Typography.Text>
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
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{ type: "request" }}
                style={{ marginBottom: 24 }}
            >
                {/* Project selection for mode 'out' */}
                {mode === 'out' && (
                    <Form.Item
                        label={<Space><FileTextOutlined />{t("project", { ns: "common" })}</Space>}
                        name="projectId"
                        validateStatus={touched.projectId && !selectedProject ? 'error' : undefined}
                        help={touched.projectId && !selectedProject ? t("content.select_project_required") : undefined}
                        rules={[{ 
                            required: true, 
                            validator: (_, _value) => {
                                if (!selectedProject) {
                                    return Promise.reject(new Error(t("content.select_project_required")));
                                }
                                return Promise.resolve();
                            }
                        }]}
                    >
                        <div>
                            <SearchBox
                                options={searchResults}
                                placeholder={t("content.search_project")}
                                value={searchValue}
                                onChange={setSearchValue}
                                onSelectProject={handleProjectSelect}
                                loading={searchLoading}
                                noDataMessage={t("content.no_projects_found")}
                                style={{ width: '100%' }}
                            />
                            {selectedProject && (
                                <div style={{ 
                                    marginTop: 8, 
                                    padding: 8, 
                                    backgroundColor: '#f6ffed', 
                                    border: '1px solid #b7eb8f', 
                                    borderRadius: 6,
                                    fontSize: '12px',
                                    position: 'relative'
                                }}>
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<CloseOutlined />}
                                        style={{
                                            position: 'absolute',
                                            top: 4,
                                            right: 4,
                                            color: '#666'
                                        }}
                                        onClick={() => {
                                            setSelectedProject(null);
                                            setSearchValue('');
                                            form.setFieldValue('projectId', undefined);
                                            setTouched(prev => ({ ...prev, projectId: true }));
                                            // Clear validation errors
                                            form.validateFields(['projectId']).catch(() => {});
                                        }}
                                    />
                                    <div><strong>{t("content.selected")}:</strong> {selectedProject.name}</div>
                                    <div style={{ color: '#666' }}>
                                        {selectedProject.alias} • {selectedProject.pm?.profile.name || 'N/A'}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Form.Item>
                )}
                
                <Form.Item
                    label={<Space><FileProtectOutlined />{t("type")}</Space>}
                    name="type"
                    validateStatus={touched.type && !form.getFieldValue('type') ? 'error' : undefined}
                    help={touched.type && !form.getFieldValue('type') ? t("type") + " is required" : undefined}
                    rules={[{ required: true, message: t("type") + " is required" }]}
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
                    help={touched.name && !form.getFieldValue('name') ? t("name") + " is required" : undefined}
                    rules={[{ required: true, message: t("name") + " is required" }]}
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
                        renderItem={idx => (
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
                                    title={<span>{files[idx]?.name}</span>}
                                />
                            </List.Item>
                        )}
                    />
                    <input
                        type="file"
                        multiple
                        accept={ACCEPTED_FILE_EXTENSIONS}
                        style={{ display: 'none' }}
                        id="file-upload-inline"
                        onChange={e => {
                            const fileList = Array.from(e.target.files || []);
                            const validFiles = fileList.filter(beforeUpload);
                            if (validFiles.length > 0) {
                                handleUploadFiles(validFiles);
                            }
                            e.target.value = '';
                        }}
                    />
                    <Button
                        type="primary"
                        icon={<UploadOutlined />}
                        style={{ marginTop: 16, background: '#722ED1', borderColor: '#722ED1' }}
                        onClick={() => document.getElementById('file-upload-inline')?.click()}
                    >
                        {t('content.upload_file')}
                    </Button>
                </Card>
            )}
        </Modal>
    );
};

export default ModalAddDocument;
