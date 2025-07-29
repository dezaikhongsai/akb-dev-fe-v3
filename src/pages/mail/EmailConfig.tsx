import { SaveOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Card, Form, Input, Select, Switch, Button, message, Spin } from 'antd';
import { useState, useEffect, useMemo } from 'react';
import { createEmailConfig, getEmailConfig, updateEmailConfig } from '../../services/mail/mail.service';
import { selectUserProfile } from '../../common/stores/auth/authSelector';
import { useSelector } from 'react-redux';
import GmailTutorial from './components/GmailTutorial';
import { useTranslation } from 'react-i18next';

interface FormValues {
  emailService: string;
  encryptionMethod: string;
  emailAddress: string;
  password: string;
  senderName: string;
  host: string;
  port: string;
  secure: boolean;
  isActive: boolean;
  [key: string]: string | boolean; // Add index signature
}

interface MailConfig {
  _id: string;
  serviceName: string;
  host: string;
  port: number;
  encryptMethod: string;
  user: string;
  pass: string;
  secure: boolean;
  senderName: string;
  isActive: boolean;
}

const DEFAULT_VALUES: FormValues = {
  emailService: 'Gmail',
  encryptionMethod: 'SSL',
  emailAddress: '',
  password: '',
  senderName: '',
  host: 'smtp.gmail.com',
  port: '465',
  secure: true,
  isActive: false
};

const EmailConfig = () => {
  const { t } = useTranslation(['emailConfig', 'common']);
  const [form] = Form.useForm<FormValues>();
  const [messageApi, contextHolder] = message.useMessage();
  const [encryptionMethod, setEncryptionMethod] = useState('SSL');
  const [loading, setLoading] = useState(true);
  const [mailConfig, setMailConfig] = useState<MailConfig | null>(null);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [initialValues, setInitialValues] = useState<FormValues | null>(null);
  // const user = useSelector(selectAuthUser);
  const profile = useSelector(selectUserProfile);

  // Watch all form fields
  const formValues = Form.useWatch([], form);

  // Check if form has changes
  const isFormChanged = useMemo(() => {
    if (!initialValues || !formValues) return false;
    
    const fieldsToCompare = [
      'emailService',
      'encryptionMethod',
      'emailAddress',
      'password',
      'senderName',
      'host',
      'port',
      'isActive'
    ] as const;

    return fieldsToCompare.some(field => {
      const initialValue = initialValues[field];
      const currentValue = formValues[field];
      return initialValue !== currentValue;
    });
  }, [initialValues, formValues]);

  useEffect(() => {
    fetchMailConfig();
  }, []);

  useEffect(() => {
    form.setFieldValue('port', encryptionMethod === 'SSL' ? '465' : '587');
  }, [encryptionMethod, form]);

  const fetchMailConfig = async () => {
    try {
      const response = await getEmailConfig();
      if (response.success && response.data) {
        setMailConfig(response.data);
        const values: FormValues = {
          emailService: response.data.serviceName,
          encryptionMethod: response.data.encryptMethod,
          emailAddress: response.data.user,
          password: response.data.pass,
          senderName: response.data.senderName,
          host: response.data.host,
          port: response.data.port.toString(),
          secure: Boolean(response.data.secure),
          isActive: Boolean(response.data.isActive)
        };
        form.setFieldsValue(values);
        setInitialValues(values);
        setEncryptionMethod(response.data.encryptMethod);
      }
    } catch (error) {
      console.error('Error fetching mail config:', error);
      messageApi.error(t('emailConfig.message.loadConfigFail'));
    } finally {
      setLoading(false);
    }
  };

  const getInitialFormValues = (): FormValues => {
    if (!mailConfig) {
      return {
        ...DEFAULT_VALUES,
        emailAddress: profile?.emailContact || '',
        senderName: profile?.name || ''
      };
    }

    return {
      emailService: mailConfig.serviceName,
      encryptionMethod: mailConfig.encryptMethod,
      emailAddress: mailConfig.user || profile?.emailContact || '',
      senderName: mailConfig.senderName || profile?.name || '',
      host: mailConfig.host,
      port: mailConfig.port.toString(),
      password: mailConfig.pass,
      secure: mailConfig.secure,
      isActive: mailConfig.isActive
    };
  };

  const onFinish = async (values: any) => {
    // const loadingMessage = message.loading({
    //   content: mailConfig ? t('emailConfig.message.onUpdateConfig') : t('emailConfig.message.onCreateNewConfig'),
    //   key: 'mailConfigAction',
    //   duration: 0,
    // });

    try {
      setLoading(true);
      const mailData = {
        serviceName: values.emailService,
        host: values.host,
        port: parseInt(values.port),
        encryptMethod: values.encryptionMethod,
        user: values.emailAddress,
        pass: values.password,
        secure: parseInt(values.port) === 465 ? true : false,
        senderName: values.senderName,
        isActive: values.isActive
      };
      console.log("Data ====: " , mailData);
      if (mailConfig) {
        // Update existing config
        const response = await updateEmailConfig(mailData);
        if (response.success) {
          message.success({
            content: t('common:messages.success.updateEmailConfig'),
            key: 'mailConfigAction',
            duration: 3,
          });
          await fetchMailConfig();
        }
      } else {
        // Create new config
        const response = await createEmailConfig(mailData);
        if (response.success) {
          message.success({
            content: t('common:messages.success.createEmailConfig'),
            key: 'mailConfigAction',
            duration: 3,
          });
          await fetchMailConfig();
        }
      }
    } catch (error: any) {
      message.error({
        content: error.message || t('emailConfig.message.handleFail'),
        key: 'mailConfigAction',
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {contextHolder}
      <Card
        title={
          <div className="flex justify-between items-center">
            <span>{mailConfig ? t('emailConfig.form.updateConfigTitle') : t('emailConfig.form.createConfigTitle')}</span>
          </div>
        }
        className="w-full max-w-4xl mx-auto"
      >
        <div className="flex justify-end mb-4">
          <Button
            type="default"
            icon={<QuestionCircleOutlined />}
            onClick={() => setIsTutorialOpen(true)}
          >
            {t('emailConfig.form.createAppPasswordGuide')}
          </Button>
        </div>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={getInitialFormValues()}
        >
          <div className="flex justify-between items-center mb-4">
            <div className="text-lg"> {t('emailConfig.form.switchConfigMode')} </div>
            <Form.Item name="isActive" valuePropName="checked" noStyle>
              <Switch />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label={t('emailConfig.form.emailService')}
              name="emailService"
              rules={[{ required: true, message: t('emailConfig.message.emailServiceRequired') }]}
            >
              <Select>
                <Select.Option value="Gmail">Gmail</Select.Option>
                <Select.Option value="Zoho">Zoho</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label={t('emailConfig.form.encryptionMethod')}
              name="encryptionMethod"
              rules={[{ required: true, message: t('emailConfig.message.encryptionMethodRequired') }]}
            >
              <Select onChange={(value) => setEncryptionMethod(value)}>
                <Select.Option value="SSL">SSL</Select.Option>
                <Select.Option value="TLS">TLS</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label={t('emailConfig.form.emailAddress')}
              name="emailAddress"
              rules={[
                { required: true, message: t('emailConfig.message.emailAddressRequired') },
                { type: 'email', message: t('emailConfig.message.emailAddressInvalid') }
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label={t('emailConfig.form.password')}
              name="password"
              rules={[{ required: true, message: t('emailConfig.message.passwordRequired') }]}
              help={t('emailConfig.message.passwordDescription')}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              label={t('emailConfig.form.senderName')}
              name="senderName"
              rules={[{ required: true, message: t('emailConfig.message.senderNameRequired') }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label={t('emailConfig.form.host')}
              name="host"
              rules={[{ required: true, message: t('emailConfig.message.hostRequired') }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label={t('emailConfig.form.port')}
              name="port"
            >
              <Input disabled />
            </Form.Item>
          </div>

          <Form.Item className="flex justify-end mt-4">
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={loading}
              disabled={mailConfig ? !isFormChanged : false}
            >
              {mailConfig ? t('emailConfig.form.updateConfigTitle') : t('emailConfig.form.createConfigTitle')}
            </Button>
          </Form.Item>
        </Form>
      </Card>
      <GmailTutorial
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        t={t}
      />
    </div>
  );
};

export default EmailConfig;
