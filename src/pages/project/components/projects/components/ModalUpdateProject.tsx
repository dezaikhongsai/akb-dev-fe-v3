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

const statusOptions = [
  { value: 'processing', label: <><SyncOutlined spin /> Processing</> },
  { value: 'pending', label: <><ClockCircleOutlined /> Pending</> },
];

const ModalUpdateProject: React.FC<ModalUpdateProjectProps> = ({
  open,
  onCancel,
  onSubmit,
  initialValues,
  loading = false,
  phasesCount
}) => {
  const { t } = useTranslation(['project', 'common']);
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
          {t('modal.update.title', { ns: 'project', defaultValue: 'Cập nhật dự án' })}
        </Space>
      }
      onCancel={onCancel}
      footer={[
        <Button
          key="cancel"
          onClick={onCancel}
          icon={<CloseOutlined />}
        >
          {t('modal.update.button.cancel', { ns: 'project', defaultValue: 'Hủy' })}
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          loading={loading}
          icon={<SaveOutlined />}
          disabled={!isChanged}
        >
          {t('modal.update.button.update', { ns: 'project', defaultValue: 'Cập nhật' })}
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
          label={t('form.status', { ns: 'project', defaultValue: 'Trạng thái' })}
          rules={[{ required: true, message: t('validation.status.required', { ns: 'common', defaultValue: 'Vui lòng chọn trạng thái' }) }]}
        >
          <Select options={statusOptions} placeholder={t('form.status.placeholder', { ns: 'project', defaultValue: 'Chọn trạng thái' })} />
        </Form.Item>
        <Form.Item
          name="currentPhase"
          label={t('form.currentPhase', { ns: 'project', defaultValue: 'Giai đoạn hiện tại' })}
          rules={[
            { required: true, message: t('validation.currentPhase.required', { ns: 'common', defaultValue: 'Vui lòng nhập giai đoạn hiện tại' }) },
            { type: 'number', min: 1, max: phasesCount, message: t('validation.currentPhase.range', { ns: 'common', defaultValue: `Giai đoạn phải từ 1 đến ${phasesCount}` }) }
          ]}
        >
          <InputNumber min={1} max={phasesCount} prefix={<SwapOutlined />} style={{ width: '100%' }} placeholder={t('form.currentPhase.placeholder', { ns: 'project', defaultValue: 'Nhập số giai đoạn hiện tại' })} />
        </Form.Item>
        <Form.Item
          name="startDate"
          label={t('form.startDate', { ns: 'project', defaultValue: 'Ngày bắt đầu' })}
          rules={[{ required: true, message: t('validation.startDate.required', { ns: 'common', defaultValue: 'Vui lòng chọn ngày bắt đầu' }) }]}
        >
          <DatePicker
            style={{ width: '100%' }}
            format="DD/MM/YYYY"
            placeholder={t('form.startDate.placeholder', { ns: 'project', defaultValue: 'Chọn ngày bắt đầu' })}
            prefix={<CalendarOutlined />}
          />
        </Form.Item>
        <Form.Item
          name="endDate"
          label={t('form.endDate', { ns: 'project', defaultValue: 'Ngày kết thúc' })}
          rules={[
            { required: true, message: t('validation.endDate.required', { ns: 'common', defaultValue: 'Vui lòng chọn ngày kết thúc' }) },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || !getFieldValue('startDate') || value.isAfter(getFieldValue('startDate'))) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error(t('validation.endDate.afterStart', { ns: 'common', defaultValue: 'Ngày kết thúc phải sau ngày bắt đầu' })));
              },
            }),
          ]}
        >
          <DatePicker
            style={{ width: '100%' }}
            format="DD/MM/YYYY"
            placeholder={t('form.endDate.placeholder', { ns: 'project', defaultValue: 'Chọn ngày kết thúc' })}
            prefix={<CalendarOutlined />}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalUpdateProject;
