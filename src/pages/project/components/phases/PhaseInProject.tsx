import { Card, Steps, Space, Typography, Tooltip } from 'antd';
import { IPhase } from '../../interfaces/project.interface';
import {
  ProjectOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import type { StepProps } from 'antd';

interface PhaseInProjectProps {
  phases: IPhase[];
  currentPhase: number;
}

const { Text } = Typography;

const PhaseInProject: React.FC<PhaseInProjectProps> = ({ phases, currentPhase }) => {
  const { t } = useTranslation(['project', 'common']);

  const getPhaseStatus = (index: number) => {
    if (index + 1 < currentPhase) return 'finish';
    if (index + 1 === currentPhase) return 'process';
    return 'wait' as const;
  };

  const getPhaseIcon = (status: 'finish' | 'process' | 'wait') => {
    switch (status) {
      case 'finish':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'process':
        return <LoadingOutlined style={{ color: '#1890ff' }} />;
      case 'wait':
        return <ClockCircleOutlined style={{ color: '#d9d9d9' }} />;
    }
  };

  const items: StepProps[] = phases.map((phase, index) => {
    const status = getPhaseStatus(index);
    const isCurrentPhase = index + 1 === currentPhase;

    return {
      title: (
        <Space direction="vertical" size={2} style={{ alignItems: 'flex-start' }}>
          <Space>
            <Text strong style={{ color: isCurrentPhase ? '#1890ff' : 'inherit' }}>
              {phase.name}
            </Text>
          </Space>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            <Space>
              <CalendarOutlined />
              {dayjs(phase.startDate).format('DD/MM/YYYY')}
            </Space>
          </Text>
        </Space>
      ),
      description: (
        <Tooltip title={phase.description}>
          <Text 
            type="secondary" 
            style={{ 
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '150px',
              display: 'block',
              fontSize: '12px',
              color: isCurrentPhase ? '#1890ff' : undefined
            }}
          >
            <InfoCircleOutlined style={{ marginRight: 4 }} />
            {phase.description}
          </Text>
        </Tooltip>
      ),
      status,
      icon: getPhaseIcon(status)
    };
  });

  return (
    <Card
      title={
        <Space>
          <ProjectOutlined />
          {t('project.phases')}
        </Space>
      }
      style={{ marginBottom: 24 }}
    >
      {phases.length > 0 ? (
        <div style={{ padding: '24px 0' }}>
          <Steps
            direction="horizontal"
            current={currentPhase - 1}
            items={items}
            progressDot={false}
            style={{ 
              maxWidth: '100%',
              overflowX: 'auto',
              overflowY: 'hidden',
              padding: '8px 0'
            }}
          />
        </div>
      ) : (
        <Text type="secondary">{t('project.no_phases')}</Text>
      )}
    </Card>
  );
};

export default PhaseInProject;
