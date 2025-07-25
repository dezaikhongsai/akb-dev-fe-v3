import { Card, Descriptions, Avatar, Button, Row, Col, Typography, Spin } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  MailOutlined,
  PhoneOutlined,
  BankOutlined,
  HomeOutlined,
  FileTextOutlined,
  IdcardOutlined,
  KeyOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EditOutlined,
  PlusOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { getMe } from "../../services/user/user.service";
import dayjs from "dayjs";
import ModalUserProfileForm from "./components/ModalUserProfileForm";
import { useDispatch } from "react-redux";
import { updateUser } from "../../common/stores/auth/authSlice";

const { Title } = Typography;

interface Profile {
  name?: string;
  emailContact?: string;
  phoneContact?: string;
  companyName?: string;
  address?: string;
  note?: string;
}

interface UserInfo {
  profile?: {
    name?: string;
  };
  _id: string;
  email: string;
}

interface UserData {
  profile: Profile;
  _id: string;
  email: string;
  role: string;
  alias: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: UserInfo;
  updatedBy?: UserInfo;
  __v: number;
}

const UserProfile = () => {
  const { t } = useTranslation(["user", "common"]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const dispatch = useDispatch();

  const fetchUserProfile = async () => {
    try {
      setRefreshing(true);
      const response = await getMe();
      setUserData(response.data);
      // Update Redux store with full user data
      dispatch(updateUser(response.data));
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Get avatar text from name or email
  const getAvatarText = () => {
    if (userData?.profile?.name) {
      const words = userData.profile.name.trim().split(' ');
      const lastWord = words[words.length - 1];
      return lastWord[0].toUpperCase();
    }
    if (userData?.email) {
      return userData.email[0].toUpperCase();
    }
    return '?';
  };

  // Get consistent avatar color based on email or name
  const getAvatarColor = () => {
    const colors = [
      '#f56a00', '#7265e6', '#ffbf00', '#00a2ae',
      '#f56a00', '#7265e6', '#ffbf00', '#00a2ae'
    ];
    const str = userData?.email || userData?.profile?.name || '';
    const index = str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  // Get display name
  const displayName = userData?.profile?.name || userData?.alias || userData?.email || '---';

  // Check if user has profile
  const hasProfile = !!(userData?.profile?.name || userData?.profile?.emailContact || 
                       userData?.profile?.phoneContact || userData?.profile?.companyName || 
                       userData?.profile?.address || userData?.profile?.note);

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    fetchUserProfile(); // Refresh user data
  };

  const renderUserActionInfo = () => {
    if (!userData) return null;

    const createdInfo = userData.createdBy ? t('profile.created_info', {
      name: userData.createdBy.profile?.name || userData.createdBy.email,
      email: userData.createdBy.email,
      date: dayjs(userData.updatedAt).format('DD/MM/YYYY'),
      ns: 'user'
    }) : null;

    const updatedInfo = userData.updatedBy ? t('profile.updated_info', {
      name: userData.updatedBy.profile?.name || userData.updatedBy.email,
      email: userData.updatedBy.email,
      date: dayjs(userData.updatedAt).format('DD/MM/YYYY'),
      ns: 'user'
    }) : null;

    return (
      <div style={{ marginTop: 16, color: '#666', fontSize: 13 }}>
        {createdInfo && (
          <div style={{ marginBottom: 4 }}>
            {createdInfo}
          </div>
        )}
        {updatedInfo && userData.updatedBy?._id !== userData.createdBy?._id && (
          <div>
            {updatedInfo}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <Row gutter={[24, 24]} align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Avatar 
              size={100}
              style={{ 
                backgroundColor: getAvatarColor(),
                fontSize: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {getAvatarText()}
            </Avatar>
          </Col>
          <Col flex="1">
            <Title level={2} style={{ margin: 0 }}>{displayName}</Title>
            <div style={{ color: '#666' }}>{userData?.email}</div>
          </Col>
          <Col>
            <Button 
              type="primary"
              icon={hasProfile ? <EditOutlined /> : <PlusOutlined />}
              size= 'middle'
              onClick={() => setIsModalOpen(true)}
            >
              {hasProfile ? t('profile.edit', { ns: 'user' }) : t('profile.add', { ns: 'user' })}
            </Button>
          </Col>
        </Row>

        <Spin spinning={refreshing} indicator={<SyncOutlined spin />}>
          <Descriptions
            bordered
            column={2}
           styles={{
              label: {
                fontWeight: "bold",
                width: "200px"
              }
            }}
          >
            <Descriptions.Item 
              label={
                <span>
                  <MailOutlined className="label-icon" />
                  {t("profile.emailContact", { ns: "user" })}
                </span>
              }
            >
              {userData?.profile?.emailContact || t("profile.notUpdated", { ns: "user" })}
            </Descriptions.Item>
            <Descriptions.Item 
              label={
                <span>
                  <PhoneOutlined className="label-icon" />
                  {t("profile.phoneContact", { ns: "user" })}
                </span>
              }
            >
              {userData?.profile?.phoneContact || t("profile.notUpdated", { ns: "user" })}
            </Descriptions.Item>
            <Descriptions.Item 
              label={
                <span>
                  <BankOutlined className="label-icon" />
                  {t("profile.company", { ns: "user" })}
                </span>
              }
            >
              {userData?.profile?.companyName || t("profile.notUpdated", { ns: "user" })}
            </Descriptions.Item>
            <Descriptions.Item 
              label={
                <span>
                  <HomeOutlined className="label-icon" />
                  {t("profile.address", { ns: "user" })}
                </span>
              }
            >
              {userData?.profile?.address || t("profile.notUpdated", { ns: "user" })}
            </Descriptions.Item>
            <Descriptions.Item 
              label={
                <span>
                  <FileTextOutlined className="label-icon" />
                  {t("profile.note", { ns: "user" })}
                </span>
              } 
              span={2}
            >
              {userData?.profile?.note || t("profile.notUpdated", { ns: "user" })}
            </Descriptions.Item>
            <Descriptions.Item 
              label={
                <span>
                  <KeyOutlined className="label-icon" />
                  {t("profile.role", { ns: "user" })}
                </span>
              }
            >
              {userData?.role}
            </Descriptions.Item>
            <Descriptions.Item 
              label={
                <span>
                  <IdcardOutlined className="label-icon" />
                  {t("profile.alias", { ns: "user" })}
                </span>
              }
            >
              {userData?.alias}
            </Descriptions.Item>
            <Descriptions.Item 
              label={
                <span>
                  <CheckCircleOutlined className="label-icon" />
                  {t("profile.status", { ns: "user" })}
                </span>
              }
            >
              {userData?.isActive ? t("active", { ns: "common" }) : t("inactive", { ns: "common" })}
            </Descriptions.Item>
            <Descriptions.Item 
              label={
                <span>
                  <ClockCircleOutlined className="label-icon" />
                  {t("profile.createdAt", { ns: "user" })}
                </span>
              }
            >
              {dayjs(userData?.createdAt).format("DD/MM/YYYY")}
            </Descriptions.Item>
          </Descriptions>
          {renderUserActionInfo()}
        </Spin>
      </Card>

      <ModalUserProfileForm
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        initialValues={hasProfile ? userData?.profile : undefined}
      />
    </div>
  );
};

export default UserProfile;
