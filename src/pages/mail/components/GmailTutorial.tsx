import React from 'react';
import { Modal, Typography, Steps, Button, Space } from 'antd';
import {
  LockOutlined,
  SafetyCertificateOutlined,
  GoogleOutlined,
  SecurityScanOutlined,
  KeyOutlined,
  CopyOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
const { Title, Paragraph } = Typography;

interface GmailTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  t: (key: string) => string; // Translation function
}

const GmailTutorial: React.FC<GmailTutorialProps> = ({ isOpen, onClose }) => {
  const [t] = useTranslation('emailConfig')
  const steps = [
    {
      title: t('gmailAppPasswordTutorial.steps.step1.title'),
      description: (
        <>
          <Paragraph>
            {t('gmailAppPasswordTutorial.steps.step1.description')}
            <br />
            <a href={t('gmailAppPasswordTutorial.steps.step1.url')} target="_blank" rel="noopener noreferrer">
              {t('gmailAppPasswordTutorial.steps.step1.url')}
            </a>
          </Paragraph>
        </>
      ),
      icon: <GoogleOutlined />
    },
    {
      title: t('gmailAppPasswordTutorial.steps.step2.title'),
      description: (
        <>
          <Paragraph>
            {t('gmailAppPasswordTutorial.steps.step2.description').split('\n').map((line, index) => (
              <React.Fragment key={index}>
                {line}
                {index < t('gmailAppPasswordTutorial.steps.step2.description').split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </Paragraph>
        </>
      ),
      icon: <SecurityScanOutlined />
    },
    {
      title: t('gmailAppPasswordTutorial.steps.step3.title'),
      description: (
        <>
          <Paragraph>
            {t('gmailAppPasswordTutorial.steps.step3.description')}
            <br />
            <a href={t('gmailAppPasswordTutorial.steps.step3.url')} target="_blank" rel="noopener noreferrer">
              {t('gmailAppPasswordTutorial.steps.step3.url')}
            </a>
          </Paragraph>
        </>
      ),
      icon: <KeyOutlined />
    },
    {
      title: t('gmailAppPasswordTutorial.steps.step4.title'),
      description: (
        <>
          <Paragraph>
            {t('gmailAppPasswordTutorial.steps.step4.description').split('\n').map((line, index) => (
              <React.Fragment key={index}>
                {line}
                {index < t('gmailAppPasswordTutorial.steps.step4.description').split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </Paragraph>
        </>
      ),
      icon: <SafetyCertificateOutlined />
    },
    {
      title: t('gmailAppPasswordTutorial.steps.step5.title'),
      description: (
        <>
          <Paragraph>
            {t('gmailAppPasswordTutorial.steps.step5.description').split('\n').map((line, index) => (
              <React.Fragment key={index}>
                {line}
                {index < t('gmailAppPasswordTutorial.steps.step5.description').split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </Paragraph>
        </>
      ),
      icon: <CopyOutlined />
    },
  ];

  return (
    <Modal
      title={
        <Space>
          <LockOutlined />
          <Title level={4} style={{ margin: 0 }}>
            {t('gmailAppPasswordTutorial.title')}
          </Title>
        </Space>
      }
      open={isOpen}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="close" icon={<CloseCircleOutlined />} onClick={onClose}>
          {t('gmailAppPasswordTutorial.closeButton')}
        </Button>
      ]}
    >
      <div style={{ padding: '20px 0' }}>
        <div style={{ marginBottom: 24 }}>
          <Title level={5}>{t('gmailAppPasswordTutorial.requirements.title')}</Title>
          <ul>
            <li>{t('gmailAppPasswordTutorial.requirements.item1')}</li>
            <li>{t('gmailAppPasswordTutorial.requirements.item2')}</li>
          </ul>
        </div>

        <Steps
          direction="vertical"
          current={-1}
          items={steps}
          style={{ maxWidth: '100%' }}
        />
      </div>
    </Modal>
  );
};

export default GmailTutorial;