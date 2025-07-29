import { Form, Input, DatePicker, Button, Space } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import React from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

interface IPhase {
  name: string;
  description: string;
  startDate: string;
}

interface AddPhaseInputProps {
  phase: IPhase;
  index: number;
  onChange: (index: number, value: Partial<IPhase>) => void;
  onRemove: (index: number) => void;
  disableRemove?: boolean;
}

const AddPhaseInput: React.FC<AddPhaseInputProps> = ({ phase, index, onChange, onRemove, disableRemove }) => {
  const { t } = useTranslation(['phase']);
  
  return (
    <Form layout="vertical">
      <Form.Item label={t('phase.form.name')} required>
        <Input
          value={phase?.name}
          onChange={e => onChange(index, { name: e.target.value })}
          placeholder={t('phase.form.name.placeholder')}
        />
      </Form.Item>
      <Form.Item label={t('phase.form.description')}>
        <Input.TextArea
          value={phase?.description}
          onChange={e => onChange(index, { description: e.target.value })}
          placeholder={t('phase.form.description.placeholder')}
        />
      </Form.Item>
      <Form.Item label={t('phase.form.startDate')} required>
        <DatePicker
          style={{ width: '100%' }}
          value={phase?.startDate ? dayjs(phase.startDate) : undefined}
          onChange={date => onChange(index, { startDate: date ? date.format('YYYY-MM-DD') : '' })}
          format="YYYY-MM-DD"
          placeholder={t('phase.form.startDate.placeholder')}
        />
      </Form.Item>
      <Space>
        <Button 
          icon={<CloseOutlined />}
          danger
          onClick={() => onRemove(index)}
          disabled={disableRemove}
        >
          {t('phase.delete')}
        </Button>
      </Space>
    </Form>
  );
};

export default AddPhaseInput;
