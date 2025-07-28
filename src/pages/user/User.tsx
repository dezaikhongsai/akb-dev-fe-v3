import { Table, Pagination, Select, Input, Space, Tag, Dropdown, Button, Modal, Card, Row, Col, Statistic, Skeleton, Alert, Tabs } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { getUser, deleteUser, getUserStatistic, createUser, updateUserProfile } from '../../services/user/user.service';
import { useTranslation } from 'react-i18next';
import { useDebounce } from '../../common/hooks/useDebounce';
import { 
  MoreOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ExclamationCircleOutlined,
  SearchOutlined,
  UserOutlined,
  SortAscendingOutlined,
  CheckCircleOutlined,
  UserAddOutlined,
  TeamOutlined,
  UserSwitchOutlined,
  UsergroupAddOutlined,
  CheckCircleFilled,
  WarningFilled,
  CloseOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ModalUserForm from './components/ModalUserForm';
import ModalUserDetail from './components/ModalUserDetail';
import type { UserResponse, UserStatistic, User } from './interfaces/user.interface';
import CustomerStatistic from './components/CustomerStatistic';
import PmStatistic from './components/PmStatistic';

ChartJS.register(ArcElement, Tooltip, Legend);


const User = () => {
  const { t } = useTranslation(['user']);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<UserResponse | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statistic, setStatistic] = useState<UserStatistic | null>(null);
  const debouncedSearchTerm = useDebounce(searchTerm);
  const [modal, contextHolder] = Modal.useModal();
  const [queryParams, setQueryParams] = useState({
    limit: 10,
    page: 1,
    search: '',
    role: '',
    sort: 'asc',
    isActive: true
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'update'>('create');
  const [selectedUser, setSelectedUser] = useState<User | undefined>();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState<User | null>(null);
  const [showTabs, setShowTabs] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUser(
        queryParams.limit,
        queryParams.page,
        queryParams.search,
        queryParams.role,
        queryParams.sort,
        queryParams.isActive
      );
      setUserData(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistic = async () => {
    try {
      const response = await getUserStatistic();
      setStatistic(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchStatistic();
  }, [queryParams]);

  useEffect(() => {
    setQueryParams(prev => ({ ...prev, search: debouncedSearchTerm, page: 1 }));
  }, [debouncedSearchTerm]);

  const handleEdit = (record: User) => {
    setSelectedUser(record);
    setModalMode('update');
    setModalOpen(true);
  };

  const handleDelete = async (userId: string) => {
    modal.confirm({
      title: t('modal.delete.title'),
      icon: <ExclamationCircleOutlined />,
      content: t('modal.delete.content'),
      okText: <><DeleteOutlined /> {t('modal.delete.ok')}</>,
      cancelText: <><CloseOutlined /> {t('modal.delete.cancel')}</>,
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          setLoading(true);
          await deleteUser(userId);
          fetchUsers(); // Refresh the table
          fetchStatistic();
        } catch (error) {
          console.error('Error deleting user:', error);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleCreateUser = () => {
    setSelectedUser(undefined);
    setModalMode('create');
    setModalOpen(true);
  };

  const handleModalSubmit = async (values: any) => {
    try {
      setSubmitLoading(true);
      const formattedData = {
        email: values.email,
        password: values.password,
        role: values.role,
        profile: {
          name: values['profile.name'],
          emailContact: values['profile.emailContact'],
          phoneContact: values['profile.phoneContact'],
          companyName: values['profile.companyName'],
          address: values['profile.address'],
          note: values['profile.note'],
          dob: values['profile.dob'] ? values['profile.dob'].format('YYYY-MM-DD') : undefined
        }
      };

      if (modalMode === 'create') {
        await createUser(formattedData);
      } else {
        // For update, we don't need email and password
        const { email, password, ...updateData } = formattedData;
        await updateUserProfile(selectedUser?._id!, updateData);
      }
      setModalOpen(false);
      fetchUsers();
      fetchStatistic();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setSubmitLoading(false);
    }
  };

  const getActionItems = (record: any): MenuProps['items'] => [
    {
      key: 'edit',
      label: t('action.edit'),
      icon: <EditOutlined />,
      onClick: () => handleEdit(record)
    },
    {
      key: 'delete',
      label: t('action.delete'),
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => handleDelete(record._id)
    }
  ];

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

  const roleOptions = [
    { value: '', label: <Tag>{t('filter.all')}</Tag> },
    { value: 'admin', label: <Tag color={getRoleTagColor('admin')}>{t('role.admin')}</Tag> },
    { value: 'customer', label: <Tag color={getRoleTagColor('customer')}>{t('role.customer')}</Tag> },
    { value: 'pm', label: <Tag color={getRoleTagColor('pm')}>{t('role.pm')}</Tag> }
  ];

  const statusOptions = [
    { value: '', label: <Tag>{t('filter.all')}</Tag> },
    { value: true, label: <Tag color="success">{t('filter.active')}</Tag> },
    { value: false, label: <Tag color="warning">{t('filter.inactive')}</Tag> }
  ];

  const headerStyle = {
    backgroundColor: '#1890ff',
    color: '#ffffff',
    fontWeight: 500
  };

  const columns: ColumnsType<any> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      align: 'center',
      fixed: 'left' as const,
      render: (_: any, __: any, index: number) => (queryParams.page - 1) * queryParams.limit + index + 1,
      onHeaderCell: () => ({
        style: headerStyle
      })
    },
    {
      title: t('table.alias'),
      dataIndex: 'alias',
      key: 'alias',
      width: 100,
      align: 'center',
      fixed: 'left' as const,
      onHeaderCell: () => ({
        style: headerStyle
      })
    },
    {
      title: t('table.name'),
      dataIndex: ['profile', 'name'],
      key: 'name',
      width: 150,
      onHeaderCell: () => ({
        style: headerStyle
      })
    },
    {
      title: t('table.email'),
      dataIndex: 'email',
      key: 'email',
      width: 200,
      onHeaderCell: () => ({
        style: headerStyle
      })
    },
    {
      title: t('table.emailContact'),
      dataIndex: ['profile', 'emailContact'],
      key: 'emailContact',
      width: 200,
      onHeaderCell: () => ({
        style: headerStyle
      })
    },
    {
      title: t('table.phoneContact'),
      dataIndex: ['profile', 'phoneContact'],
      key: 'phoneContact',
      width: 120,
      onHeaderCell: () => ({
        style: headerStyle
      })
    },
    {
      title: t('table.status'),
      dataIndex: 'isActive',
      key: 'isActive',
      width: 120,
      onHeaderCell: () => ({
        style: headerStyle
      }),
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'warning'}>
          {isActive ? t('filter.active') : t('filter.inactive')}
        </Tag>
      )
    },
    {
      title: t('table.role'),
      dataIndex: 'role',
      key: 'role',
      width: 120,
      onHeaderCell: () => ({
        style: headerStyle
      }),
      render: (role: string) => (
        <Tag color={getRoleTagColor(role)}>
          {t(`role.${role}`)}
        </Tag>
      )
    },
    {
      title: t('table.actions'),
      key: 'actions',
      fixed: 'right' as const,
      width: 80,
      align: 'center',
      onHeaderCell: () => ({
        style: headerStyle
      }),
      onCell: () => ({
        onClick: (e: React.MouseEvent) => {
          // Prevent row click event when clicking on actions cell
          e.stopPropagation();
        }
      }),
      render: (_, record) => (
        <Dropdown
          menu={{ items: getActionItems(record) }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button 
            type="text" 
            icon={<MoreOutlined />}
            onClick={(e) => e.stopPropagation()} 
          />
        </Dropdown>
      )
    }
  ];

  const ExtraContent = () => (
    <Button 
      type="primary" 
      icon={<UserAddOutlined />}
      onClick={handleCreateUser}
    >
      {t('action.create')}
    </Button>
  );

  return (
    <div className="p-6 space-y-6 ">
      <Card className="shadow-sm" title={<Space><TeamOutlined />{t('statistic.title')}</Space>}>
        {/* Alert section */}
        <div className="mb-6 mt-6" style={{ paddingTop : '6px' }}>
          {loading ? (
            <Skeleton active paragraph={{ rows: 1 }} />
          ) : (
            statistic?.totalInactiveUser === 0 ? (
              <Alert
                message={t('statistic.fullActivation')}
                type="success"
                showIcon
                icon={<CheckCircleFilled />}
              />
            ) : (
              <Alert
                message={t('statistic.inactiveUsers', { count: statistic?.totalInactiveUser })}
                type="warning"
                showIcon
                icon={<WarningFilled />}
              />
            )
          )}
        </div>

        {/* Statistics cards - 5 cards in a row */}
        <Row gutter={[24, 24]} className="mb-6" style={{ paddingTop : '15px' }}>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              {loading ? (
                <Skeleton active paragraph={false} />
              ) : (
                <Statistic
                  title={t('statistic.totalUser')}
                  value={statistic?.totalUser}
                  prefix={<TeamOutlined />}
                />
              )}
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8} lg={4}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              {loading ? (
                <Skeleton active paragraph={false} />
              ) : (
                <Statistic
                  title={t('statistic.totalCustomer')}
                  value={statistic?.totalCustomer}
                  prefix={<UsergroupAddOutlined style={{ color: '#52c41a' }} />}
                  valueStyle={{ color: '#52c41a' }}
                />
              )}
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8} lg={4}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              {loading ? (
                <Skeleton active paragraph={false} />
              ) : (
                <Statistic
                  title={t('statistic.totalAdmin')}
                  value={statistic?.totalAdmin}
                  prefix={<UserOutlined style={{ color: '#ff4d4f' }} />}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              )}
            </Card>
          </Col>

          <Col xs={12} sm={12} md={8} lg={4}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              {loading ? (
                <Skeleton active paragraph={false} />
              ) : (
                <Statistic
                  title={t('statistic.totalPM')}
                  value={statistic?.totalPM}
                  prefix={<UserSwitchOutlined style={{ color: '#1890ff' }} />}
                  valueStyle={{ color: '#1890ff' }}
                />
              )}
            </Card>
          </Col>

          
        </Row>
        <Row style={{ paddingTop : '10px' }}>
          <Col xs={24}>
            <div className="flex justify-between items-center mb-4">
              <Button
                type="default"
                icon={showTabs ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                onClick={() => setShowTabs(!showTabs)}
              >
                {showTabs ? t('action.hide') : t('action.show')}
              </Button>
            </div>
            {showTabs && (
              <Tabs
                items={[
                  {
                    key: 'customer',
                    label: t('statistic.customer'),
                    children: <CustomerStatistic />
                  },
                  {
                    key: 'pm',
                    label: t('statistic.pm'),
                    children: <PmStatistic />
                  }
                ]}
              />
            )}
          </Col>
        </Row>
      </Card>

      <div style={{ paddingTop : '20px' }}>
      <Card 
        className="shadow-sm " 
        title={<Space><UserOutlined />{t('table.title')}</Space>}
        extra={<ExtraContent />}
        style={{ paddingTop : '10px' }}
      >
        <div className="space-y-6">           
           <div style={{ paddingBottom : '20px' }}>
           <Space size="middle" wrap className="w-full justify-start" style={{ paddingTop : '10px' }}>
              <Input
                placeholder={t('search.placeholder')}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: 250 }}
                value={searchTerm}
                prefix={<SearchOutlined />}
                allowClear
              />
              <Select
                style={{ width: 200 }}
                placeholder={t('filter.role')}
                onChange={(value) => setQueryParams(prev => ({ ...prev, role: value, page: 1 }))}
                options={roleOptions}
                suffixIcon={<UserOutlined />}
                allowClear
              />
              <Select
                style={{ width: 150 }}
                value={queryParams.sort}
                onChange={(value) => setQueryParams(prev => ({ ...prev, sort: value }))}
                options={[
                  { value: 'asc', label: t('sort.asc') },
                  { value: 'desc', label: t('sort.desc') }
                ]}
                suffixIcon={<SortAscendingOutlined />}
              />
              <Select
                style={{ width: 180 }}
                value={queryParams.isActive}
                onChange={(value) => setQueryParams(prev => ({ ...prev, isActive: value, page: 1 }))}
                options={statusOptions}
                suffixIcon={<CheckCircleOutlined />}
                allowClear
              />
            </Space>
           </div>

          <Table
            columns={columns}
            dataSource={userData?.users}
            loading={loading}
            rowKey="_id"
            pagination={false}
            bordered={true}
            scroll={{ x: 1500 }}
            onRow={(record) => ({
              onClick: () => {
                setSelectedUserDetail(record);
                setDetailModalVisible(true);
              },
              style: { cursor: 'pointer' }
            })}
            footer={() => (
              userData?.pagination && (
                <div className="flex justify-center">
                  <Pagination
                    current={userData.pagination.page}
                    total={userData.pagination.total}
                    pageSize={userData.pagination.limit}
                    onChange={(page) => setQueryParams(prev => ({ ...prev, page }))}
                    showSizeChanger
                    onShowSizeChange={(_, size) => setQueryParams(prev => ({ ...prev, limit: size, page: 1 }))}
                    align='center'
                  />
                </div>
              )
            )}
          />
        </div>
      </Card>
      </div>
      <ModalUserForm
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        mode={modalMode}
        initialValues={selectedUser}
        loading={submitLoading}
      />
      <ModalUserDetail
        user={selectedUserDetail}
        visible={detailModalVisible}
        onClose={() => setDetailModalVisible(false)}
      />
      {contextHolder}
    </div>
  );
};

export default User;
