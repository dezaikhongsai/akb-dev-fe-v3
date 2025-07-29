import { Modal, Form, Input, Select, Button, Space, DatePicker } from 'antd';
import { useTranslation } from 'react-i18next';
import { 
  ProjectOutlined,
  SaveOutlined,
  CloseOutlined,
  UserOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { useState, useEffect } from 'react';
import type { User } from '../../../user/interfaces/user.interface';
import type { Dayjs } from 'dayjs';
import { useDebounce } from '../../../../common/hooks/useDebounce';
import { getUser } from '../../../../services/user/user.service';
import { useSelector } from 'react-redux';
import { selectAuthUser } from '../../../../common/stores/auth/authSelector';

interface ModalAddProjectProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
  loading?: boolean;
}

const ModalAddProject: React.FC<ModalAddProjectProps> = ({
  open,
  onCancel,
  onSubmit,
  loading = false
}) => {
  const { t } = useTranslation(['project', 'common']);
  const [form] = Form.useForm();
  const [pmOptions, setPmOptions] = useState<{ label: string; value: string }[]>([]);
  const [customerOptions, setCustomerOptions] = useState<{ label: string; value: string }[]>([]);
  const [searchingPm, setSearchingPm] = useState(false);
  const [searchingCustomer, setSearchingCustomer] = useState(false);
  const [pmSearchText, setPmSearchText] = useState('');
  const [customerSearchText, setCustomerSearchText] = useState('');
  const debouncedPmSearch = useDebounce(pmSearchText);
  const debouncedCustomerSearch = useDebounce(customerSearchText);
  const currentUser = useSelector(selectAuthUser);
  const isCustomer = currentUser?.role === 'customer';

  const statusOptions = [
            { value: 'completed', label: t('statusValues.completed') },
        { value: 'processing', label: t('statusValues.processing') },
        { value: 'pending', label: t('statusValues.pending') }
  ];

  const fetchUsers = async (role: 'pm' | 'customer', searchText: string = '') => {
    try {
      const isSearchingPm = role === 'pm';
      if (isSearchingPm) {
        setSearchingPm(true);
      } else {
        setSearchingCustomer(true);
      }

      const response = await getUser(10, 1, searchText, role, 'asc', true);
      const options = response.data.users.map((user: User) => ({
        label: user.profile?.name || user.email || '',
        value: user._id || ''
      }));

      if (isSearchingPm) {
        setPmOptions(options);
      } else {
        setCustomerOptions(options);
      }
    } catch (error) {
      console.error(`Error fetching ${role}s:`, error);
    } finally {
      if (role === 'pm') {
        setSearchingPm(false);
      } else {
        setSearchingCustomer(false);
      }
    }
  };

  useEffect(() => {
    if (open) {
      // Initial load of users
      fetchUsers('pm');
      // Only fetch customers if not a customer user
      if (!isCustomer) {
        fetchUsers('customer');
      }
      
      // Set initial form values
      form.setFieldsValue({
        status: 'pending',
        ...(isCustomer && currentUser?._id && {
          customer: currentUser._id
        })
      });
    }
  }, [open, isCustomer, currentUser]);

  useEffect(() => {
    if (debouncedPmSearch !== undefined) {
      fetchUsers('pm', debouncedPmSearch);
    }
  }, [debouncedPmSearch]);

  useEffect(() => {
    if (debouncedCustomerSearch !== undefined && !isCustomer) {
      fetchUsers('customer', debouncedCustomerSearch);
    }
  }, [debouncedCustomerSearch]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit({
        ...values,
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate.format('YYYY-MM-DD'),
        isActive: true,
        status: 'pending' // Always send pending status
      });
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const disabledDate = (current: Dayjs) => {
    return current && current.isBefore(new Date(), 'day');
  };

  // If user is customer, set their info in customer options
  useEffect(() => {
    if (isCustomer && currentUser?._id && currentUser?.profile?.name) {
      setCustomerOptions([{
        label: currentUser.profile.name,
        value: currentUser._id
      }]);
    }
  }, [isCustomer, currentUser]);

  return (
    <Modal
      open={open}
      title={
        <Space>
          <ProjectOutlined />
          {t('modal.create.title')}
        </Space>
      }
      onCancel={onCancel}
      footer={[
        <Button 
          key="cancel" 
          onClick={onCancel}
          icon={<CloseOutlined />}
        >
          {t('modal.create.button.cancel')}
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          onClick={handleSubmit}
          loading={loading}
          icon={<SaveOutlined />}
        >
          {t('modal.create.button.create')}
        </Button>
      ]}
      maskClosable={false}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        preserve={false}
      >
        <Form.Item
          name="name"
          label={t('form.name')}
          rules={[{ required: true, message: t('validation.name.required', { ns: 'common' }) }]}
        >
          <Input prefix={<ProjectOutlined />} placeholder={t('form.name.placeholder')} />
        </Form.Item>

        <Form.Item
          name="pm"
          label={t('form.pm')}
          rules={[{ required: true, message: t('validation.pm.required', { ns: 'common' }) }]}
        >
          <Select
            showSearch
            placeholder={t('form.pm.placeholder')}
            options={pmOptions}
            loading={searchingPm}
            onSearch={(value) => setPmSearchText(value)}
            filterOption={false}
            prefix={<UserOutlined />}
          />
        </Form.Item>

        <Form.Item
          name="customer"
          label={t('form.customer')}
          rules={[{ required: true, message: t('validation.customer.required', { ns: 'common' }) }]}
        >
          <Select
            showSearch
            placeholder={t('form.customer.placeholder')}
            options={customerOptions}
            loading={searchingCustomer}
            onSearch={(value) => setCustomerSearchText(value)}
            filterOption={false}
            prefix={<UserOutlined />}
            disabled={isCustomer}
          />
        </Form.Item>

        <Form.Item
          name="startDate"
          label={t('form.startDate')}
          rules={[{ required: true, message: t('validation.startDate.required', { ns: 'common' }) }]}
        >
          <DatePicker 
            style={{ width: '100%' }}
            format="DD/MM/YYYY"
            disabledDate={disabledDate}
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
            disabledDate={disabledDate}
            placeholder={t('form.endDate.placeholder')}
            prefix={<CalendarOutlined />}
          />
        </Form.Item>

        <Form.Item
          name="status"
          label={t('form.status')}
          initialValue="pending"
          hidden
        >
          <Select
            options={statusOptions}
            disabled
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalAddProject;
