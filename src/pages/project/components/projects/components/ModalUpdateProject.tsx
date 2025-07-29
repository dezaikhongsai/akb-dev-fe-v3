import React from 'react';
import { Modal, Form, Select, Button, Space, DatePicker, InputNumber } from 'antd';
import { useTranslation } from 'react-i18next';
import {
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  CalendarOutlined,
  SwapOutlined,
  SyncOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

interface ModalUpdateProjectProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
  initialValues?: {
    status: string;
    currentPhase: number;
    startDate: string;
    endDate: string;
    isActive?: boolean;
  };
  loading?: boolean;
  phasesCount: number;
}

const ModalUpdateProject: React.FC<ModalUpdateProjectProps> = ({
  open,
  onCancel,
  onSubmit,
  initialValues,
  loading = false,
  phasesCount
}) => {
  const { t } = useTranslation(['project', 'common']);
  
  const statusOptions = [
    { value: 'processing', label: <><SyncOutlined spin /> {t('statusValues.processing')}</> },
    { value: 'pending', label: <><ClockCircleOutlined /> {t('statusValues.pending')}</> },
  ];
  const [form] = Form.useForm();
  const [isChanged, setIsChanged] = React.useState(false);

  React.useEffect(() => {
    if (open && initialValues) {
      form.setFieldsValue({
        ...initialValues,
        startDate: initialValues.startDate ? dayjs(initialValues.startDate) : undefined,
        endDate: initialValues.endDate ? dayjs(initialValues.endDate) : undefined
      });
      setIsChanged(false);
    }
    if (!open) {
      form.resetFields();
      setIsChanged(false);
    }
  }, [open, initialValues, form]);

  const handleValuesChange = (_: any, allValues: any) => {
    if (!initialValues) return;
    const changed =
      allValues.status !== initialValues.status ||
      Number(allValues.currentPhase) !== Number(initialValues.currentPhase) ||
      (allValues.startDate && allValues.startDate.format('YYYY-MM-DD')) !== initialValues.startDate ||
      (allValues.endDate && allValues.endDate.format('YYYY-MM-DD')) !== initialValues.endDate;
    setIsChanged(changed);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit({
        ...values,
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate.format('YYYY-MM-DD')
      });
      form.resetFields();
    } catch (error) {
      // Validation failed
    }
  };

  return (
    <Modal
      open={open}
      title={
        <Space>
          <EditOutlined />
          {t('modal.update.title')}
        </Space>
      }
      onCancel={onCancel}
      footer={[
        <Button
          key="cancel"
          onClick={onCancel}
          icon={<CloseOutlined />}
        >
          {t('modal.update.button.cancel')}
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          loading={loading}
          icon={<SaveOutlined />}
          disabled={!isChanged}
        >
          {t('modal.update.button.update')}
        </Button>
      ]}
      maskClosable={false}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        preserve={false}
        onValuesChange={handleValuesChange}
      >
        <Form.Item
          name="status"
          label={t('form.status')}
          rules={[{ required: true, message: t('validation.status.required', { ns: 'common' }) }]}
        >
          <Select options={statusOptions} placeholder={t('form.status.placeholder')} />
        </Form.Item>
        <Form.Item
          name="currentPhase"
          label={t('form.currentPhase')}
          rules={[
            { required: true, message: t('validation.currentPhase.required', { ns: 'common' }) },
            { type: 'number', min: 1, max: phasesCount, message: t('validation.currentPhase.range', { ns: 'common', max: phasesCount }) }
          ]}
        >
                      <InputNumber min={1} max={phasesCount} prefix={<SwapOutlined />} style={{ width: '100%' }} placeholder={t('form.currentPhase.placeholder')} />
        </Form.Item>
        <Form.Item
          name="startDate"
          label={t('form.startDate')}
          rules={[{ required: true, message: t('validation.startDate.required', { ns: 'common' }) }]}
        >
          <DatePicker
            style={{ width: '100%' }}
            format="DD/MM/YYYY"
            placeholder={t('form.startDate.placeholder')}
            prefix={<CalendarOutlined />}
          />
        </Form.Item>
        <Form.Item
          name="endDate"
          label={t('form.endDate')}
          rules={[
            { required: true, message: t('validation.endDate.required', { ns: 'common' }) },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || !getFieldValue('startDate') || value.isAfter(getFieldValue('startDate'))) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error(t('validation.endDate.afterStart', { ns: 'common' })));
              },
            }),
          ]}
        >
          <DatePicker
            style={{ width: '100%' }}
            format="DD/MM/YYYY"
            placeholder={t('form.endDate.placeholder')}
            prefix={<CalendarOutlined />}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalUpdateProject;
