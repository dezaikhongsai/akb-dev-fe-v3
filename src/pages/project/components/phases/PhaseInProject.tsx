import { Card, Steps, Space, Typography, Tooltip, Button, Modal, message } from 'antd';
import { IPhase } from '../../interfaces/project.interface';
import {
  ProjectOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import type { StepProps } from 'antd';
import ModalAddPhase from './components/ModalAddPhase';
import { useState } from 'react';
import ModalUpdatePhase from './components/ModalUpdatePhase';
import { deletePhase } from '../../../../services/phase/phase.service';

interface PhaseInProjectProps {
  phases: IPhase[];
  currentPhase: number;
  projectId: string;
  onReloadPhases?: () => void;
  loadingPhase?: boolean;
  projectStatus: string;
}

const { Text } = Typography;

const PhaseInProject: React.FC<PhaseInProjectProps> = ({ phases, currentPhase , projectId, onReloadPhases, loadingPhase, projectStatus }) => {
  const { t } = useTranslation(['project']);
  const [isModalAddPhaseOpen, setIsModalAddPhaseOpen] = useState(false);
  const [isModalUpdatePhaseOpen , setIsModalUpdatePhaseOpen] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedPhaseIndex, setSelectedPhaseIndex] = useState<number>(0);
  const getPhaseStatus = (index: number) => {
    if (index + 1 < currentPhase) return 'finish';
    if (index + 1 === currentPhase) {
      // Nếu project đã hoàn thành, step cuối là success
      if (currentPhase === phases.length && projectStatus === 'completed') return 'finish';
      return 'process';
    }
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

  const handleDeletePhase = (phaseId: string) => {
    Modal.confirm({
      title: t('confirm_delete_phase'),
      content: t('confirm_delete_phase_content'),
      okText: t('delete'),
      okType: 'danger',
      cancelText: t('cancel'),
      onOk: async () => {
        setDeleting(phaseId);
        try {
          await deletePhase(phaseId);
          message.success(t('delete_phase_success'));
          onReloadPhases && onReloadPhases();
        } catch (err: any) {
          message.error(err.message || t('delete_phase_failed'));
        } finally {
          setDeleting(null);
        }
      },
    });
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
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
              loading={deleting === phase._id}
              onClick={e => {
                e.stopPropagation();
                handleDeletePhase(phase._id);
              }}
            />
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

  const handleAddPhase = () => {
    setIsModalAddPhaseOpen(true);
  }
  const handleUpdatePhase = () => {
    setIsModalUpdatePhaseOpen(true);
  }

  // Thêm hàm xử lý khi click vào step
  const handleStepClick = (current: number) => {
    setSelectedPhaseIndex(current);
    setIsModalUpdatePhaseOpen(true);
  };

  return (
    <Card
      title={
        <Space>
          <ProjectOutlined />
          {t('phases')}
        </Space>
      }
      extra = {
        phases.length > 0 ? (
          <Button type="primary" icon={<EditOutlined />} onClick={handleUpdatePhase}>
            {t('update_phase')}
          </Button>
        ) : (
          <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleAddPhase}
          >
            {t('add_phase')}
          </Button>
        )
      }
      style={{ marginBottom: 24 }}
    >
      {phases.length > 0 ? (
        <>
        <div style={{ padding: '24px 0' }}>
          {loadingPhase ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 100 }}>
              <LoadingOutlined style={{ fontSize: 32 }} spin />
            </div>
          ) : (
           <>
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
              onChange={handleStepClick}
            />
           </>
          )}
        </div>
        <div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddPhase}
          >
            {t('add_one')}
          </Button>
        </div>
        </>
      ) : (
        <Text type="secondary">{t('no_phases')}</Text>
      )}
      <ModalAddPhase
        open={isModalAddPhaseOpen}
        onClose={() => setIsModalAddPhaseOpen(false)}
        onSuccess={onReloadPhases || (() => {})}
        projectId={projectId}
      />
      <ModalUpdatePhase
        open={isModalUpdatePhaseOpen}
        onClose={() => setIsModalUpdatePhaseOpen(false)}
        onSuccess={onReloadPhases || (() => {})}
        phases={phases}
        initialPage={selectedPhaseIndex}
      />
    </Card>
  );
};

export default PhaseInProject;
