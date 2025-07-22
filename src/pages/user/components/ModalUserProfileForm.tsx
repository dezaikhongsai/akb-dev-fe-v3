import { Modal, Form, Input, message, Button, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { selectAuthUser } from '../../../common/stores/auth/authSelector';
import { updateUserProfile } from '../../../services/user/user.service';
import { updateProfile } from '../../../common/stores/auth/authSlice';
import { useState, useEffect } from 'react';
import {
  SaveOutlined,
  CloseCircleOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  BankOutlined,
  HomeOutlined,
} from '@ant-design/icons';

interface ModalUserProfileFormProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  initialValues?: {
    name?: string;
    emailContact?: string;
    phoneContact?: string;
    companyName?: string;
    address?: string;
    note?: string;
  };
}
const ModalUserProfileForm: React.FC<ModalUserProfileFormProps> = ({
  open,
  onCancel,
  onSuccess,
  initialValues
}) => {
  const { t } = useTranslation(['user', 'common']);
  const [form] = Form.useForm();
  const user = useSelector(selectAuthUser);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [isFormChanged, setIsFormChanged] = useState(false);
  const isUpdate = !!initialValues;
  // Reset form change state when modal opens/closes
  useEffect(() => {
    if (open) {
      setIsFormChanged(false);
    }
  }, [open]);

  // Watch for form changes
  const handleFormChange = () => {
    if (!isUpdate) {
      setIsFormChanged(true);
      return;
    }
    const currentValues = form.getFieldsValue();
    const hasChanges = Object.keys(currentValues).some(key => {
      const initialValue = initialValues?.[key as keyof typeof initialValues] || '';
      const currentValue = currentValues[key] || '';
      return initialValue !== currentValue;
    });
    
    setIsFormChanged(hasChanges);
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      if (!user?._id) {
        throw new Error('User ID not found');
      }

      // Call API to update profile
      const response = await updateUserProfile(user._id, {
        profile: values
      });

      if (response.data) {
        // Update Redux store with new profile data
        dispatch(updateProfile(values));
        message.success(t(`common:messages.success.${isUpdate ? 'update' : 'create'}`));
        form.resetFields();
        onSuccess();
      }
    } catch (error: any) {
      message.error(error.message || t('common:messages.error.default'));
    } finally {
      setLoading(false);
    }
  };

  const modalFooter = (
    <Space size="middle">
      <Button
        icon={<CloseCircleOutlined />}
        onClick={onCancel}
        size="large"
      >
        {t('modal_profile_form.cancel_button', { ns: 'user' })}
      </Button>
      <Button
        type="primary"
        icon={<SaveOutlined />}
        onClick={form.submit}
        loading={loading}
        disabled={isUpdate && !isFormChanged}
        size="large"
      >
        {t('modal_profile_form.save_button', { ns: 'user' })}
      </Button>
    </Space>
  );

  return (
    <Modal
      open={open}
      title={t(`modal_profile_form.${isUpdate ? 'edit_title' : 'add_title'}`, { ns: 'user' })}
      onCancel={onCancel}
      footer={modalFooter}
      width={720}
      destroyOnHidden
      maskClosable={false}
    >
      <Form
        form={form}
        layout="horizontal"
        onFinish={handleSubmit}
        initialValues={initialValues}
        preserve={false}
        onValuesChange={handleFormChange}
      >
        <Form.Item
          name="name"
          label={t('modal_profile_form.name_label', { ns: 'user' })}
          rules={[
            {
              required: true,
              message: t('modal_profile_form.name_required', { ns: 'user' })
            }
          ]}
        >
          <Input 
            prefix={<UserOutlined />} 
            placeholder={t('modal_profile_form.name_placeholder', { ns: 'user' })}
          />
        </Form.Item>

        <Form.Item
          name="emailContact"
          label={t('modal_profile_form.email_contact_label', { ns: 'user' })}
          rules={[
            {
              required: true,
              message: t('modal_profile_form.email_contact_required', { ns: 'user' })
            },
            {
              type: 'email',
              message: t('modal_profile_form.email_contact_invalid', { ns: 'user' })
            }
          ]}
        >
          <Input 
            prefix={<MailOutlined />} 
            placeholder={t('modal_profile_form.email_placeholder', { ns: 'user' })}
          />
        </Form.Item>

        <Form.Item
          name="phoneContact"
          label={t('modal_profile_form.phone_contact_label', { ns: 'user' })}
          rules={[
            {
              required: true,
              message: t('modal_profile_form.phone_contact_required', { ns: 'user' })
            }
          ]}
        >
          <Input 
            prefix={<PhoneOutlined />} 
            placeholder={t('modal_profile_form.phone_placeholder', { ns: 'user' })}
          />
        </Form.Item>

        <Form.Item
          name="companyName"
          label={t('modal_profile_form.company_name_label', { ns: 'user' })}
        >
          <Input 
            prefix={<BankOutlined />} 
            placeholder={t('modal_profile_form.company_placeholder', { ns: 'user' })}
          />
        </Form.Item>

        <Form.Item
          name="address"
          label={t('modal_profile_form.address_label', { ns: 'user' })}
        >
          <Input 
            prefix={<HomeOutlined />} 
            placeholder={t('modal_profile_form.address_placeholder', { ns: 'user' })}
          />
        </Form.Item>

        <Form.Item
          name="note"
          label={t('modal_profile_form.note_label', { ns: 'user' })}
        >
          <Input.TextArea 
            rows={4} 
            placeholder={t('modal_profile_form.note_placeholder', { ns: 'user' })}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalUserProfileForm;
