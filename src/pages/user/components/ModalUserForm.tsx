import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Space, DatePicker } from 'antd';
import { useTranslation } from 'react-i18next';
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  BankOutlined, 
  HomeOutlined, 
  SaveOutlined, 
  CloseOutlined,
  LockOutlined,
  UserAddOutlined,
  EditOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { User } from '../interfaces/user.interface';

interface ModalUserFormProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
  mode: 'create' | 'update';
  initialValues?: User;
  loading?: boolean;
}

const ModalUserForm: React.FC<ModalUserFormProps> = ({
  open,
  onCancel,
  onSubmit,
  mode,
  initialValues,
  loading = false
}) => {
  const { t } = useTranslation(['user', 'common']);
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const roleOptions = [
    { value: 'admin', label: t('role.admin', { ns: 'user' }) },
    { value: 'customer', label: t('role.customer', { ns: 'user' }) },
    { value: 'pm', label: t('role.pm', { ns: 'user' }) }
  ];

  // Reset form when mode changes or modal closes
  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open, form]);

  // Set initial values when in update mode
  useEffect(() => {
    if (mode === 'update' && initialValues) {
      form.setFieldsValue({
        email: initialValues.email,
        role: initialValues.role,
        'profile.name': initialValues.profile?.name,
        'profile.emailContact': initialValues.profile?.emailContact,
        'profile.phoneContact': initialValues.profile?.phoneContact,
        'profile.companyName': initialValues.profile?.companyName,
        'profile.address': initialValues.profile?.address,
        'profile.note': initialValues.profile?.note,
        'profile.dob': initialValues.profile?.dob ? dayjs(initialValues.profile.dob) : undefined
      });
    }
  }, [mode, initialValues, form]);

  return (
    <Modal
      open={open}
      title={
        <Space>
          {mode === 'create' ? <UserAddOutlined /> : <EditOutlined />}
          {mode === 'create' ? t('modal.create.title', { ns: 'user' }) : t('modal.update.title', { ns: 'user' })}
        </Space>
      }
      onCancel={onCancel}
      footer={[
        <Button 
          key="cancel" 
          onClick={onCancel}
          icon={<CloseOutlined />}
        >
          {mode === 'create' ? t('modal.create.button.cancel', { ns: 'user' }) : t('modal.update.button.cancel', { ns: 'user' })}
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          onClick={handleSubmit}
          loading={loading}
          icon={<SaveOutlined />}
        >
          {mode === 'create' ? t('modal.create.button.create', { ns: 'user' }) : t('modal.update.button.update', { ns: 'user' })}
        </Button>
      ]}
      maskClosable={false}
      destroyOnClose
    >
      <Form
        form={form}
        layout="horizontal"
        preserve={false}
      >
        {mode === 'create' && (
          <Form.Item
            name="email"
            label={t('form.email', { ns: 'user' })}
            rules={[
              { required: true, message: t('validation.email.required', { ns: 'common' }) },
              { type: 'email', message: t('validation.email.invalid', { ns: 'common' }) }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder={t('form.email.placeholder', { ns: 'user' })} />
          </Form.Item>
        )}

        {mode === 'create' && (
          <Form.Item
            name="password"
            label={t('form.password', { ns: 'user' })}
            rules={[
              { required: true, message: t('validation.password.required', { ns: 'common' }) },
              { min: 6, message: t('validation.password.min', { ns: 'common' }) }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder={t('form.password.placeholder', { ns: 'user' })} />
          </Form.Item>
        )}

        <Form.Item
          name="role"
          label={t('form.role', { ns: 'user' })}
          rules={[{ required: true, message: t('validation.role.required', { ns: 'common' }) }]}
        >
          <Select
            options={roleOptions}
            placeholder={t('form.role.placeholder', { ns: 'user' })}
            disabled={mode === 'update'}
          />
        </Form.Item>

        <Form.Item
          name="profile.name"
          label={t('form.name', { ns: 'user' })}
          rules={[{ required: true, message: t('validation.name.required', { ns: 'common' }) }]}
        >
          <Input prefix={<UserOutlined />} placeholder={t('form.name.placeholder', { ns: 'user' })} />
        </Form.Item>

        <Form.Item
          name="profile.dob"
          label={t('form.dob', { ns: 'user' })}
        >
          <DatePicker 
            format="DD/MM/YYYY" 
            placeholder={t('form.dob.placeholder', { ns: 'user' })}
            style={{ width: '100%' }}
            prefix={<CalendarOutlined />}
          />
        </Form.Item>

        <Form.Item
          name="profile.emailContact"
          label={t('form.emailContact', { ns: 'user' })}
          rules={[
            { required: true, message: t('validation.emailContact.required', { ns: 'common' }) },
            { type: 'email', message: t('validation.email.invalid', { ns: 'common' }) }
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder={t('form.emailContact.placeholder', { ns: 'user' })} />
        </Form.Item>

        <Form.Item
          name="profile.phoneContact"
          label={t('form.phoneContact', { ns: 'user' })}
          rules={[{ required: true, message: t('validation.phoneContact.required', { ns: 'common' }) }]}
        >
          <Input prefix={<PhoneOutlined />} placeholder={t('form.phoneContact.placeholder', { ns: 'user' })} />
        </Form.Item>

        <Form.Item
          name="profile.companyName"
          label={t('form.companyName', { ns: 'user' })}
        >
          <Input prefix={<BankOutlined />} placeholder={t('form.companyName.placeholder', { ns: 'user' })} />
        </Form.Item>

        <Form.Item
          name="profile.address"
          label={t('form.address', { ns: 'user' })}
        >
          <Input prefix={<HomeOutlined />} placeholder={t('form.address.placeholder', { ns: 'user' })} />
        </Form.Item>

        <Form.Item
          name="profile.note"
          label={t('form.note', { ns: 'user' })}
        >
          <Input.TextArea placeholder={t('form.note.placeholder', { ns: 'user' })} rows={4} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalUserForm;
