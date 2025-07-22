import { Modal, Descriptions, Space, Tag } from 'antd';
import { IdcardOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { User } from '../interfaces/user.interface';

interface ModalUserDetailProps {
  user: User | null;
  visible: boolean;
  onClose: () => void;
}

const ModalUserDetail: React.FC<ModalUserDetailProps> = ({ user, visible, onClose }) => {
  const { t } = useTranslation(['user', 'common']);

  if (!user) return null;

  const getRoleTagColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'red';
      case 'pm':
        return 'blue';
      case 'customer':
        return 'green';
      default:
        return 'default';
    }
  };

  return (
    <Modal
      title={<Space><IdcardOutlined /> {t('modal.detail.title', { ns: 'user' })}</Space>}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Descriptions column={2} bordered>
        <Descriptions.Item label={t('form.alias', { ns: 'user' })} span={1}>
          {user.alias || t('profile.notUpdated', { ns: 'common' })}
        </Descriptions.Item>
        <Descriptions.Item label={t('form.email', { ns: 'user' })} span={1}>
          {user.email || t('profile.notUpdated', { ns: 'common' })}
        </Descriptions.Item>
        <Descriptions.Item label={t('form.name', { ns: 'user' })} span={1}>
          {user.profile?.name || t('profile.notUpdated', { ns: 'common' })}
        </Descriptions.Item>
        <Descriptions.Item label={t('form.emailContact', { ns: 'user' })} span={1}>
          {user.profile?.emailContact || t('profile.notUpdated', { ns: 'common' })}
        </Descriptions.Item>
        <Descriptions.Item label={t('form.phoneContact', { ns: 'user' })} span={1}>
          {user.profile?.phoneContact || t('profile.notUpdated', { ns: 'common' })}
        </Descriptions.Item>
        <Descriptions.Item label={t('form.role', { ns: 'user' })} span={1}>
          <Tag color={getRoleTagColor(user.role || '')}>
            {t(`role.${user.role || 'unknown'}`, { ns: 'user' })}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label={t('form.status', { ns: 'user' })} span={1}>
          <Tag color={user.isActive ? 'success' : 'warning'}>
            {user.isActive ? t('status.active', { ns: 'common' }) : t('status.inactive', { ns: 'common' })}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label={t('form.companyName', { ns: 'user' })} span={1}>
          {user.profile?.companyName || t('profile.notUpdated', { ns: 'common' })}
        </Descriptions.Item>
        <Descriptions.Item label={t('form.address', { ns: 'user' })} span={2}>
          {user.profile?.address || t('profile.notUpdated', { ns: 'common' })}
        </Descriptions.Item>
        <Descriptions.Item label={t('form.note', { ns: 'user' })} span={2}>
          {user.profile?.note || t('profile.notUpdated', { ns: 'common' })}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default ModalUserDetail;
