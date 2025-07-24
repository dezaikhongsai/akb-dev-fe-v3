import { ClockCircleOutlined, FileAddOutlined, SaveOutlined, PlusOutlined, DeleteOutlined, LeftOutlined, RightOutlined, UploadOutlined, FileTextOutlined, FileDoneOutlined, FileProtectOutlined, DownloadOutlined } from "@ant-design/icons";
import { Button, Modal, Space, Typography, Input, Radio, Form, message, Card, Divider, List, Tooltip } from "antd";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { addDocument } from '../../../../../services/document/document.service';
        
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
    projectId: string;
    open: boolean;
    onClose: () => void;
    onSuccess?: (type: string) => void;
}

const typeOptions = [
    { value: "request", label: "Request", color: "blue", icon: <FileProtectOutlined /> },
    { value: "report", label: "Report", color: "orange", icon: <FileDoneOutlined /> },
    { value: "document", label: "Document", color: "green", icon: <FileTextOutlined /> },
];

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
}) => {
    const { t } = useTranslation(["project", "common"]);
    const [form] = Form.useForm();
    const [contents, setContents] = useState<IContentInput[]>([{ content: '', fileIndexes: [] }]);
    const [files, setFiles] = useState<File[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);

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
            message.error(t('document.content.invalid_file_type'));
            return false;
        }
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
            message.error(t('document.content.file_too_large', { maxSize: '50MB' }));
            return false;
        }
        return true;
    };

    // Khi submit
    const handleSave = async () => {
        try {
            await form.validateFields();
            setLoading(true);
            const data: IDocumentData = {
                document: {
                    projectId: projectId,
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
            message.success(t("common.success"));
            if (onSuccess) onSuccess(form.getFieldValue('type'));
            onClose();
            setContents([{ content: '', fileIndexes: [] }]);
            setFiles([]);
            setCurrentPage(1);
            form.resetFields();
        } catch (err: any) {
            message.error(err?.message || t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    const currentContent = contents[currentPage - 1];

    return (
        <Modal
            open={open}
            onCancel={onClose}
            width={900}
            title={
                <Space>
                    <FileAddOutlined />
                    <Typography.Text>{t("document.add")}</Typography.Text>
                </Space>
            }
            footer={[
                <Button
                    icon={<ClockCircleOutlined />}
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
                    {t("document.save")}
                </Button>
            ]}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{ type: "request" }}
                style={{ marginBottom: 24 }}
            >
                <Form.Item
                    label={<Space><FileProtectOutlined />{t("document.type")}</Space>}
                    name="type"
                    rules={[{ required: true, message: t("document.type") + " is required" }]}
                >
                    <Radio.Group optionType="button" buttonStyle="solid" style={{ width: '100%' }}>
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
                    label={<Space><FileTextOutlined />{t("document.name")}</Space>}
                    name="name"
                    rules={[{ required: true, message: t("document.name") + " is required" }]}
                >
                    <Input placeholder={t("document.name")}/>
                </Form.Item>
            </Form>
            <Divider orientation="left"><Space><FileTextOutlined />{t("document.contents")}</Space></Divider>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <Button
                    icon={<PlusOutlined />}
                    type="dashed"
                    onClick={handleAddContent}
                >
                    {t("document.content.add")}
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
                            <Typography.Text strong>{t("document.content")}</Typography.Text>
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
                        placeholder={t('document.content.enter_content')}
                        style={{ marginBottom: 16 }}
                        autoSize={{ minRows: 2, maxRows: 4 }}
                    />
                    <Divider orientation="left"><Space><UploadOutlined style={{ color: '#722ED1' }} />{t('document.content.files')}</Space></Divider>
                    <List
                        header={<b>{t('document.content.files')}</b>}
                        dataSource={currentContent.fileIndexes}
                        locale={{ emptyText: t('document.content.no_files') }}
                        renderItem={idx => (
                            <List.Item
                                actions={[
                                    <Tooltip title={t('document.content.download')} key="download">
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
                                    <Tooltip title={t('document.content.delete')} key="delete">
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
                        {t('document.content.upload_file')}
                    </Button>
                </Card>
            )}
        </Modal>
    );
};

export default ModalAddDocument;
