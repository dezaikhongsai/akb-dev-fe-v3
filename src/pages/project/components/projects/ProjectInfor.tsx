import { Card, Descriptions, Tag, Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import {
  ProjectOutlined,
  UserOutlined,
  CalendarOutlined,
  TagOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  NumberOutlined,
  MailOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { IProject } from '../../interfaces/project.interface';

interface ProjectInforProps {
  project: IProject;
}

const { Text } = Typography;

const ProjectInfor: React.FC<ProjectInforProps> = ({ project }) => {
  const { t } = useTranslation(['project', 'common']);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'processing';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleOutlined />;
      case 'processing':
        return <SyncOutlined spin />;
      case 'pending':
        return <ClockCircleOutlined />;
      case 'cancelled':
        return <CloseCircleOutlined />;
      default:
        return null;
    }
  };

  return (
    <Card
      title={
        <Space>
          <ProjectOutlined />
          {t('project.information')}
        </Space>
      }
      style={{ marginBottom: 24 }}
    >
      <Descriptions
        bordered
        column={2}
        size="small"
        labelStyle={{ fontWeight: 500 }}
      >
        <Descriptions.Item 
          label={
            <Space>
              <TagOutlined />
              {t('project.name')}
            </Space>
          }
          span={1}
        >
          {project.name}
        </Descriptions.Item>

        <Descriptions.Item 
          label={
            <Space>
              <NumberOutlined />
              {t('project.alias')}
            </Space>
          }
          span={1}
        >
          {project.alias}
        </Descriptions.Item>

        <Descriptions.Item 
          label={
            <Space>
              <UserOutlined />
              {t('project.pm')}
            </Space>
          }
          span={1}
        >
          <Space direction="vertical" size={0}>
            <Text>{project.pm.profile.name}</Text>
            {project.pm.profile.emailContact && (
              <Text type="secondary">
                <Space>
                  <MailOutlined />
                  {project.pm.profile.emailContact}
                </Space>
              </Text>
            )}
          </Space>
        </Descriptions.Item>

        <Descriptions.Item 
          label={
            <Space>
              <UserOutlined />
              {t('project.customer')}
            </Space>
          }
          span={1}
        >
          <Space direction="vertical" size={0}>
            <Text>{project.customer.profile.name}</Text>
            {project.customer.profile.emailContact && (
              <Text type="secondary">
                <Space>
                  <MailOutlined />
                  {project.customer.profile.emailContact}
                </Space>
              </Text>
            )}
          </Space>
        </Descriptions.Item>

        <Descriptions.Item 
          label={
            <Space>
              <CalendarOutlined />
              {t('project.startDate')}
            </Space>
          }
          span={1}
        >
          {dayjs(project.startDate).format('DD/MM/YYYY')}
        </Descriptions.Item>

        <Descriptions.Item 
          label={
            <Space>
              <CalendarOutlined />
              {t('project.endDate')}
            </Space>
          }
          span={1}
        >
          {dayjs(project.endDate).format('DD/MM/YYYY')}
        </Descriptions.Item>

        <Descriptions.Item 
          label={
            <Space>
              <ClockCircleOutlined />
              {t('project.status')}
            </Space>
          }
          span={2}
        >
          <Tag color={getStatusColor(project.status)} icon={getStatusIcon(project.status)}>
            {t(`project.status.${project.status}`)}
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item 
          label={
            <Space>
              <ClockCircleOutlined />
              {t('project.currentPhase')}
            </Space>
          }
          span={2}
        >
          {project.currentPhase}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default ProjectInfor;
