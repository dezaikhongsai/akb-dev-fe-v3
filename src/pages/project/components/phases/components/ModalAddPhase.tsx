import { CloseOutlined, FolderAddFilled, SaveOutlined } from '@ant-design/icons';
import { Button, Form, Space, Typography } from 'antd';
import { Modal } from 'antd/lib';
import React from 'react'
import { useTranslation } from 'react-i18next';
import AddPhaseInput from './AddPhaseInput';
import { createManyPhase } from '../../../../../services/phase/phase.service';
import { Pagination, message, Spin } from 'antd';

interface ModalAddPhaseProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    projectId : string;
}

interface IPhase {
    name : string;
    description : string;
    startDate : string;
}

const ModalAddPhase: React.FC<ModalAddPhaseProps> = ({open , onClose , projectId, onSuccess}) => {
  const {t} = useTranslation(['phase' , 'common']);
  const [form] = Form.useForm();
  const [phases, setPhases] = React.useState<IPhase[]>([
    { name: '', description: '', startDate: '' }
  ]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [loading, setLoading] = React.useState(false);

  const handlePhaseChange = (index: number, value: Partial<IPhase>) => {
    setPhases(prev => prev.map((p, i) => i === index ? { ...p, ...value } : p));
  };

  const handleAddPhase = () => {
    setPhases(prev => ([...prev, { name: '', description: '', startDate: '' }]));
    setCurrentPage(phases.length + 1);
  };

  const handleRemovePhase = (index: number) => {
    if (phases.length === 1) return;
    const newPhases = phases.filter((_, i) => i !== index);
    setPhases(newPhases);
    setCurrentPage(prev => prev > newPhases.length ? newPhases.length : prev);
  };

  const handleSave = async () => {
    try {
      await form.validateFields();
      setLoading(true);
      const data = {
        projectId,
        phases: phases.map(p => ({ ...p }))
      };
      await createManyPhase(data);
      message.success(t('phase.messages.createSuccess'));
      setLoading(false);
      onSuccess && onSuccess();
      onClose();
    } catch (err: any) {
      setLoading(false);
      message.error(err.message || t('phase.messages.createError'));
    }
  };

  // Reset form/phases when modal opens
  React.useEffect(() => {
    if (open) {
      setPhases([{ name: '', description: '', startDate: '' }]);
      setCurrentPage(1);
      form.resetFields();
    }
  }, [open]);

  return (
   <Modal
    open={open}
    onCancel={onClose}
    width={1000}
                styles={{ body: { maxHeight: '60vh', overflow: 'auto' } }}
    title={
    <Space>
        <FolderAddFilled/>
        <Typography.Text>{t('phase.add')}</Typography.Text>
    </Space>}
    footer={[
        <Button
        icon={<CloseOutlined/>}
        onClick={onClose}
        key="close"
        disabled={loading}
        >
            {t('phase.common.close')}
        </Button>,
        <Button
        icon={<SaveOutlined/>}
        onClick={handleSave}
        key="save"
        type="primary"
        loading={loading}
        >
            {t('phase.common.save')}
        </Button>
    ]}
   >
    <Spin spinning={loading}>
      <div style={{ marginBottom: 16 }}>
        <Button onClick={handleAddPhase} type="dashed" disabled={loading}>
          + {t('phase.addPhase')}
        </Button>
      </div>
      <AddPhaseInput
        phase={phases[currentPage - 1]}
        index={currentPage - 1}
        onChange={handlePhaseChange}
        onRemove={handleRemovePhase}
        disableRemove={phases.length === 1}
      />
      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <Pagination
          current={currentPage}
          pageSize={1}
          total={phases.length}
          onChange={setCurrentPage}
          showSizeChanger={false}
        />
      </div>
    </Spin>
   </Modal>
  )
}

export default ModalAddPhase
