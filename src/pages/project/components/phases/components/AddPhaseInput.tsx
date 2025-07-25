import { Form, Input, DatePicker, Button, Space } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import React from 'react';
import dayjs from 'dayjs';

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
  return (
    <Form layout="vertical">
      <Form.Item label="Tên giai đoạn" required>
        <Input
          value={phase?.name}
          onChange={e => onChange(index, { name: e.target.value })}
          placeholder="Nhập tên giai đoạn"
        />
      </Form.Item>
      <Form.Item label="Mô tả">
        <Input.TextArea
          value={phase?.description}
          onChange={e => onChange(index, { description: e.target.value })}
          placeholder="Nhập mô tả"
        />
      </Form.Item>
      <Form.Item label="Ngày bắt đầu" required>
        <DatePicker
          style={{ width: '100%' }}
          value={phase?.startDate ? dayjs(phase.startDate) : undefined}
          onChange={date => onChange(index, { startDate: date ? date.format('YYYY-MM-DD') : '' })}
          format="YYYY-MM-DD"
        />
      </Form.Item>
      <Space>
        <Button 
          icon={<CloseOutlined />}
          danger
          onClick={() => onRemove(index)}
          disabled={disableRemove}
        >
          Xóa
        </Button>
      </Space>
    </Form>
  );
};

export default AddPhaseInput;
