import { Card, Descriptions, Tag, Space, Typography, Button } from 'antd';
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
  EditOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { IProject } from '../../interfaces/project.interface';
import { activeProject, updateProject } from '../../../../services/project/project.service';
import { useState } from 'react';
import ModalUpdateProject from './components/ModalUpdateProject';

interface ProjectInforProps {
  project: IProject;
  onReloadProject?: () => Promise<void>;
  phasesCount: number;
  onReloadStatistic?: () => void;
}

const { Text } = Typography;

const ProjectInfor: React.FC<ProjectInforProps> = ({ project, onReloadProject, phasesCount, onReloadStatistic }) => {
  const { t } = useTranslation(['project']);
  const [loadingActive, setLoadingActive] = useState(false);
  const [isModalUpdateProjectOpen, setIsModalUpdateProjectOpen] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const handleUpdateProject = async (values: any) => {
    setLoadingUpdate(true);
    try {
      await updateProject(project._id, values);
      if (onReloadProject) {
        await onReloadProject();
      }
      setIsModalUpdateProjectOpen(false); // Đóng modal khi thành công
      if (onReloadStatistic) onReloadStatistic();
    } catch (error) {
      // Có thể thêm thông báo lỗi ở đây nếu muốn
    } finally {
      setLoadingUpdate(false);  
    }
  };

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

  const handleActiveProject = async () => {
    setLoadingActive(true);
    try {
      await activeProject(project._id);
      if (onReloadProject) {
        await onReloadProject();
      }
      if (onReloadStatistic) onReloadStatistic();
    } catch (error) {
      // Có thể thêm thông báo lỗi ở đây nếu muốn
    } finally {
      setLoadingActive(false);
    }
  };

  const handleMarkAsDone = async () => {
    try {
      await updateProject(project._id, {
        status: 'completed',
        currentPhase: phasesCount
      });
      if (onReloadProject) {
        await onReloadProject();
      }
      if (onReloadStatistic) onReloadStatistic();
    } catch (error) {
      // Có thể thêm thông báo lỗi ở đây nếu muốn
    }
  };

  return (
    <Card
      title={
        <Space>
          <ProjectOutlined />
          {t('information')}
        </Space>
      }
      extra = {
        <Space>
          { project.isActive ? (
          <div style={{ display: 'flex', gap: 8 }}>
               <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => setIsModalUpdateProjectOpen(true)}
                loading={loadingUpdate}
                >
                {t('update')}
              </Button>
              <Button
                type='primary'
                icon={<CheckCircleOutlined/>}
                onClick={handleMarkAsDone}
                disabled={project.status === 'completed' || project.currentPhase < phasesCount}
                style={project.currentPhase >= phasesCount && project.status !== 'completed' ? { backgroundColor: 'green', borderColor: 'green' } : {}}
              >
                {t('mark_as_complete')}
              </Button>
          </div>
        ) : (
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            style={{ backgroundColor: 'gold', borderColor: 'gold' }}
            loading={loadingActive}
            onClick={handleActiveProject}
          >
            {t('active')}
          </Button>
        )}
        
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
              {t('name')}
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
              {t('alias')}
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
              {t('pm')}
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
              {t('customer')}
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
              {t('startDate')}
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
              {t('endDate')}
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
              {t('status')}
            </Space>
          }
          span={2}
        >
          <Tag color={getStatusColor(project.status)} icon={getStatusIcon(project.status)}>
            {t(`statusValues.${project.status}`)}
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item 
          label={
            <Space>
              <ClockCircleOutlined />
              {t('currentPhase')}
            </Space>
          }
          span={2}
        >
          {project.currentPhase}
        </Descriptions.Item>
      </Descriptions>
      <ModalUpdateProject
        open={isModalUpdateProjectOpen}
        onCancel={() => setIsModalUpdateProjectOpen(false)}
        onSubmit={handleUpdateProject}
        initialValues={project}
        loading={loadingUpdate}
        phasesCount={phasesCount}
      />
    </Card>
  );
};

export default ProjectInfor;

