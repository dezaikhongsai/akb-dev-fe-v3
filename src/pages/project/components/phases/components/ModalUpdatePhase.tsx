import { CloseOutlined, SaveOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Form, Space, Typography, message, Spin, Pagination } from 'antd';
import { Modal } from 'antd/lib';
import React from 'react';
import { useTranslation } from 'react-i18next';
import AddPhaseInput from './AddPhaseInput';
import { updateManyPhase } from '../../../../../services/phase/phase.service';

interface IPhase {
  _id: string;
  name: string;
  description: string;
  startDate: string;
}

interface ModalUpdatePhaseProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  phases: IPhase[];
  initialPage?: number;
}

const ModalUpdatePhase: React.FC<ModalUpdatePhaseProps> = ({ open, onClose, onSuccess, phases, initialPage = 0 }) => {
  const { t } = useTranslation(['phase', 'common']);
  const [form] = Form.useForm();
  const [editPhases, setEditPhases] = React.useState<IPhase[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [changed, setChanged] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);

  React.useEffect(() => {
    if (open) {
      setEditPhases(phases.map(p => ({ ...p })));
      setChanged(false);
      setCurrentPage(initialPage + 1);
      form.resetFields();
    }
  }, [open, phases, initialPage]);

  const handlePhaseChange = (index: number, value: Partial<IPhase>) => {
    setEditPhases(prev => {
      const updated = prev.map((p, i) => i === index ? { ...p, ...value } : p);
      setChanged(JSON.stringify(updated) !== JSON.stringify(phases));
      return updated;
    });
  };

  const handleSave = async () => {
    try {
      await form.validateFields();
      setLoading(true);
      const data = { phases: editPhases };
      await updateManyPhase(data);
      message.success(t('phase.messages.updateSuccess'));
      setLoading(false);
      onSuccess && onSuccess();
      onClose();
    } catch (err: any) {
      setLoading(false);
      message.error(err.message || t('phase.messages.updateError'));
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={1000}
                  styles={{ body: { maxHeight: '60vh', overflow: 'auto' } }}
      title={
        <Space>
          <EditOutlined />
          <Typography.Text>{t('phase.update')}</Typography.Text>
        </Space>
      }
      footer={[
        <Button
          icon={<CloseOutlined />}
          onClick={onClose}
          key="close"
          disabled={loading}
        >
          {t('phase.common.close')}
        </Button>,
        <Button
          icon={<SaveOutlined />}
          onClick={handleSave}
          key="save"
          type="primary"
          loading={loading}
          disabled={!changed}
        >
          {t('phase.common.save')}
        </Button>
      ]}
    >
      <Spin spinning={loading}>
        <AddPhaseInput
          phase={editPhases[currentPage - 1]}
          index={currentPage - 1}
          onChange={handlePhaseChange}
          onRemove={() => {}}
          disableRemove={true}
        />
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Pagination
            current={currentPage}
            pageSize={1}
            total={editPhases.length}
            onChange={setCurrentPage}
            showSizeChanger={false}
          />
        </div>
      </Spin>
    </Modal>
  );
};

export default ModalUpdatePhase;
