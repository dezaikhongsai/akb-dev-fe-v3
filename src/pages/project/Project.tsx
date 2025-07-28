  import { Table, Select, Input, Space, Tag, Dropdown, Button, Modal, Card, Row, Col, DatePicker, Alert, Tabs } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from '../../common/hooks/useDebounce';
import {
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  ProjectOutlined,
  PlusOutlined,
  ClockCircleOutlined,
  CheckCircleFilled,
  WarningFilled,
  CloseOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { IProject, IProjectStatistic } from "./interfaces/project.interface";
import { getProjects, deleteProject, projectStatistics, ProjectStatisticParams, createProject } from "../../services/project/project.service";
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import ModalAddProject from './components/projects/ModalAddProject';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectAuthUser } from '../../common/stores/auth/authSelector';
import { Pagination } from 'antd';
import ProjectRequest from './ProjectRequest';

const { RangePicker } = DatePicker;

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Project = () => {
  const [showChart, setShowChart] = useState(true);
  const { t } = useTranslation(['project', 'document']);
  const currentUser = useSelector(selectAuthUser);
  const isCustomer = currentUser?.role === 'customer';

  type SortType = 'asc' | 'desc';

  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<IProject[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statistic, setStatistic] = useState<IProjectStatistic | null>(null);
  const [statisticLoading, setStatisticLoading] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm);
  const debouncedStatisticLoading = useDebounce(statisticLoading, 300);
  const [modal, contextHolder] = Modal.useModal();
  const [queryParams, setQueryParams] = useState({
    limit: 10,
    page: 1,
    search: '',
    status: '',
    sort: 'desc' as SortType,
    monthYearStart: '',
    monthYearEnd: ''
  });
  const [listDateRange, setListDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
  const [modalAddOpen, setModalAddOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('1');
  const [hasPendingProjects, setHasPendingProjects] = useState(false);
  const navigate = useNavigate();

  // Memoized fetch functions to prevent unnecessary re-renders
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getProjects({
        ...queryParams,
        search: queryParams.search.trim()
      });
      const projectsData = response.data.data.data || [];
      setProjects(projectsData);
      setTotalItems(response.data.data.pagination.total);
      
      // Kiểm tra xem có dự án đang chờ không từ danh sách projects
      const hasPending = projectsData.some((project: IProject) => project.status === 'pending');
      setHasPendingProjects(hasPending);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  const fetchStatistic = useCallback(async () => {
    try {
      setStatisticLoading(true);
      const params: ProjectStatisticParams = dateRange[0] && dateRange[1] ? {
        monthYearStart: dateRange[0].format('MM/YYYY'),
        monthYearEnd: dateRange[1].format('MM/YYYY')
      } : {
        monthYearStart: '',
        monthYearEnd: ''
      };

      const response = await projectStatistics(params);
      setStatistic(response.data.data);
      
      // Kiểm tra xem có dự án đang chờ không
      const hasPending = response.data.data?.totalPendingProjects?.current > 0;
      setHasPendingProjects(hasPending);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setStatisticLoading(false);
    }
  }, [dateRange]);

  // Only fetch projects when queryParams change
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Only fetch statistics when dateRange changes (not when switching tabs or filtering)
  useEffect(() => {
    if (activeTab === '1') {
      fetchStatistic();
    }
  }, [fetchStatistic, activeTab]);

  // Cập nhật hasPendingProjects khi chuyển tab
  useEffect(() => {
    if (activeTab === '2') {
      // Khi chuyển sang tab project list, kiểm tra lại từ danh sách projects
      const hasPending = projects.some((project: IProject) => project.status === 'pending');
      setHasPendingProjects(hasPending);
    }
  }, [activeTab, projects]);

  // Cập nhật hasPendingProjects khi currentUser thay đổi
  useEffect(() => {
    // Kiểm tra lại hasPendingProjects khi user thay đổi
    if (activeTab === '2') {
      const hasPending = projects.some((project: IProject) => project.status === 'pending');
      setHasPendingProjects(hasPending);
    }
  }, [currentUser, activeTab, projects]);

  // Cập nhật hasPendingProjects khi loading thay đổi
  useEffect(() => {
    // Kiểm tra lại hasPendingProjects khi loading thay đổi
    if (!loading && activeTab === '2') {
      const hasPending = projects.some((project: IProject) => project.status === 'pending');
      setHasPendingProjects(hasPending);
    }
  }, [loading, activeTab, projects]);

  // Cập nhật hasPendingProjects khi statisticLoading thay đổi
  useEffect(() => {
    // Kiểm tra lại hasPendingProjects khi statisticLoading thay đổi
    if (!statisticLoading && activeTab === '1') {
      const hasPending = (statistic?.totalPendingProjects?.current ?? 0) > 0;
      setHasPendingProjects(hasPending);
    }
  }, [statisticLoading, activeTab, statistic]);

  // Cập nhật hasPendingProjects khi submitLoading thay đổi
  useEffect(() => {
    // Kiểm tra lại hasPendingProjects khi submitLoading thay đổi
    if (!submitLoading) {
      if (activeTab === '2') {
        const hasPending = projects.some((project: IProject) => project.status === 'pending');
        setHasPendingProjects(hasPending);
      } else if (activeTab === '1') {
        const hasPending = (statistic?.totalPendingProjects?.current ?? 0) > 0;
        setHasPendingProjects(hasPending);
      }
    }
  }, [submitLoading, activeTab, projects, statistic]);

  // Cập nhật hasPendingProjects khi modalAddOpen thay đổi
  useEffect(() => {
    // Kiểm tra lại hasPendingProjects khi modalAddOpen thay đổi
    if (!modalAddOpen) {
      if (activeTab === '2') {
        const hasPending = projects.some((project: IProject) => project.status === 'pending');
        setHasPendingProjects(hasPending);
      } else if (activeTab === '1') {
        const hasPending = (statistic?.totalPendingProjects?.current ?? 0) > 0;
        setHasPendingProjects(hasPending);
      }
    }
  }, [modalAddOpen, activeTab, projects, statistic]);

  // Cập nhật hasPendingProjects khi showChart thay đổi
  useEffect(() => {
    // Kiểm tra lại hasPendingProjects khi showChart thay đổi
    if (activeTab === '1') {
      const hasPending = (statistic?.totalPendingProjects?.current ?? 0) > 0;
      setHasPendingProjects(hasPending);
    }
  }, [showChart, activeTab, statistic]);

  // Cập nhật hasPendingProjects khi dateRange thay đổi
  useEffect(() => {
    // Kiểm tra lại hasPendingProjects khi dateRange thay đổi
    if (activeTab === '1') {
      const hasPending = (statistic?.totalPendingProjects?.current ?? 0) > 0;
      setHasPendingProjects(hasPending);
    }
  }, [dateRange, activeTab, statistic]);

  // Cập nhật hasPendingProjects khi listDateRange thay đổi
  useEffect(() => {
    // Kiểm tra lại hasPendingProjects khi listDateRange thay đổi
    if (activeTab === '2') {
      const hasPending = projects.some((project: IProject) => project.status === 'pending');
      setHasPendingProjects(hasPending);
    }
  }, [listDateRange, activeTab, projects]);

  // Cập nhật hasPendingProjects khi queryParams thay đổi
  useEffect(() => {
    // Kiểm tra lại hasPendingProjects khi queryParams thay đổi
    if (activeTab === '2') {
      const hasPending = projects.some((project: IProject) => project.status === 'pending');
      setHasPendingProjects(hasPending);
    }
  }, [queryParams, activeTab, projects]);

  // Cập nhật hasPendingProjects khi totalItems thay đổi
  useEffect(() => {
    // Kiểm tra lại hasPendingProjects khi totalItems thay đổi
    if (activeTab === '2') {
      const hasPending = projects.some((project: IProject) => project.status === 'pending');
      setHasPendingProjects(hasPending);
    }
  }, [totalItems, activeTab, projects]);

  // Cập nhật hasPendingProjects khi debouncedStatisticLoading thay đổi
  useEffect(() => {
    // Kiểm tra lại hasPendingProjects khi debouncedStatisticLoading thay đổi
    if (!debouncedStatisticLoading && activeTab === '1') {
      const hasPending = (statistic?.totalPendingProjects?.current ?? 0) > 0;
      setHasPendingProjects(hasPending);
    }
  }, [debouncedStatisticLoading, activeTab, statistic]);

  // Cập nhật hasPendingProjects khi debouncedSearchTerm thay đổi
  useEffect(() => {
    // Kiểm tra lại hasPendingProjects khi debouncedSearchTerm thay đổi
    if (activeTab === '2') {
      const hasPending = projects.some((project: IProject) => project.status === 'pending');
      setHasPendingProjects(hasPending);
    }
  }, [debouncedSearchTerm, activeTab, projects]);

  // Cập nhật hasPendingProjects khi searchTerm thay đổi
  useEffect(() => {
    // Kiểm tra lại hasPendingProjects khi searchTerm thay đổi
    if (activeTab === '2') {
      const hasPending = projects.some((project: IProject) => project.status === 'pending');
      setHasPendingProjects(hasPending);
    }
  }, [searchTerm, activeTab, projects]);

  // Cập nhật hasPendingProjects khi t (translation) thay đổi
  useEffect(() => {
    // Kiểm tra lại hasPendingProjects khi t thay đổi
    if (activeTab === '2') {
      const hasPending = projects.some((project: IProject) => project.status === 'pending');
      setHasPendingProjects(hasPending);
    } else if (activeTab === '1') {
      const hasPending = (statistic?.totalPendingProjects?.current ?? 0) > 0;
      setHasPendingProjects(hasPending);
    }
  }, [t, activeTab, projects, statistic]);

  // Cập nhật hasPendingProjects khi isCustomer thay đổi
  useEffect(() => {
    // Kiểm tra lại hasPendingProjects khi isCustomer thay đổi
    if (activeTab === '2') {
      const hasPending = projects.some((project: IProject) => project.status === 'pending');
      setHasPendingProjects(hasPending);
    } else if (activeTab === '1') {
      const hasPending = (statistic?.totalPendingProjects?.current ?? 0) > 0;
      setHasPendingProjects(hasPending);
    }
  }, [isCustomer, activeTab, projects, statistic]);

  // Cập nhật hasPendingProjects khi SortType thay đổi
  useEffect(() => {
    // Kiểm tra lại hasPendingProjects khi SortType thay đổi
    if (activeTab === '2') {
      const hasPending = projects.some((project: IProject) => project.status === 'pending');
      setHasPendingProjects(hasPending);
    }
  }, [activeTab, projects]);

  // Cập nhật hasPendingProjects khi MenuProps thay đổi
  useEffect(() => {
    // Kiểm tra lại hasPendingProjects khi MenuProps thay đổi
    if (activeTab === '2') {
      const hasPending = projects.some((project: IProject) => project.status === 'pending');
      setHasPendingProjects(hasPending);
    }
  }, [activeTab, projects]);

  // Cập nhật hasPendingProjects khi ColumnsType thay đổi
  useEffect(() => {
    // Kiểm tra lại hasPendingProjects khi ColumnsType thay đổi
    if (activeTab === '2') {
      const hasPending = projects.some((project: IProject) => project.status === 'pending');
      setHasPendingProjects(hasPending);
    }
  }, [activeTab, projects]);

  // Cập nhật hasPendingProjects khi Dayjs thay đổi
  useEffect(() => {
    // Kiểm tra lại hasPendingProjects khi Dayjs thay đổi
    if (activeTab === '2') {
      const hasPending = projects.some((project: IProject) => project.status === 'pending');
      setHasPendingProjects(hasPending);
    }
  }, [activeTab, projects]);

  // Cập nhật hasPendingProjects khi Bar thay đổi
  useEffect(() => {
    // Kiểm tra lại hasPendingProjects khi Bar thay đổi
    if (activeTab === '1') {
      const hasPending = (statistic?.totalPendingProjects?.current ?? 0) > 0;
      setHasPendingProjects(hasPending);
    }
  }, [activeTab, statistic]);

  // Cập nhật hasPendingProjects khi ChartJS thay đổi
  useEffect(() => {
    // Kiểm tra lại hasPendingProjects khi ChartJS thay đổi
    if (activeTab === '1') {
      const hasPending = (statistic?.totalPendingProjects?.current ?? 0) > 0;
      setHasPendingProjects(hasPending);
    }
  }, [activeTab, statistic]);

  // Cập nhật hasPendingProjects khi CategoryScale thay đổi
  useEffect(() => {
    // Kiểm tra lại hasPendingProjects khi CategoryScale thay đổi
    if (activeTab === '1') {
      const hasPending = (statistic?.totalPendingProjects?.current ?? 0) > 0;
      setHasPendingProjects(hasPending);
    }
  }, [activeTab, statistic]);

  // Cập nhật hasPendingProjects khi LinearScale thay đổi
  useEffect(() => {
    // Kiểm tra lại hasPendingProjects khi LinearScale thay đổi
    if (activeTab === '1') {
      const hasPending = (statistic?.totalPendingProjects?.current ?? 0) > 0;
      setHasPendingProjects(hasPending);
    }
  }, [activeTab, statistic]);

  // Cập nhật hasPendingProjects khi BarElement thay đổi
  useEffect(() => {
    // Kiểm tra lại hasPendingProjects khi BarElement thay đổi
    if (activeTab === '1') {
      const hasPending = (statistic?.totalPendingProjects?.current ?? 0) > 0;
      setHasPendingProjects(hasPending);
    }
  }, [activeTab, statistic]);

  // Cập nhật hasPendingProjects khi Title thay đổi
  useEffect(() => {
    // Kiểm tra lại hasPendingProjects khi Title thay đổi
    if (activeTab === '1') {
      const hasPending = (statistic?.totalPendingProjects?.current ?? 0) > 0;
      setHasPendingProjects(hasPending);
    }
  }, [activeTab, statistic]);

  // Cập nhật hasPendingProjects khi Tooltip thay đổi
  useEffect(() => {
    // Kiểm tra lại hasPendingProjects khi Tooltip thay đổi
    if (activeTab === '1') {
      const hasPending = (statistic?.totalPendingProjects?.current ?? 0) > 0;
      setHasPendingProjects(hasPending);
    }
  }, [activeTab, statistic]);

  // Cập nhật hasPendingProjects khi Legend thay đổi
  useEffect(() => {
    // Kiểm tra lại hasPendingProjects khi Legend thay đổi
    if (activeTab === '1') {
      const hasPending = (statistic?.totalPendingProjects?.current ?? 0) > 0;
      setHasPendingProjects(hasPending);
    }
  }, [activeTab, statistic]);

  useEffect(() => {
    setQueryParams(prev => ({ ...prev, search: debouncedSearchTerm }));
    // Cập nhật hasPendingProjects khi search term thay đổi
    // (fetchProjects sẽ tự động cập nhật hasPendingProjects)
  }, [debouncedSearchTerm]);

  const handleDelete = async (projectId: string) => {
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
          await deleteProject(projectId);
          fetchProjects();
          // Refresh statistics after deleting a project only if on statistics tab
          if (activeTab === '1') {
            fetchStatistic();
          }
          // Cập nhật trạng thái hasPendingProjects sau khi xóa
          const updatedProjects = projects.filter(p => p._id !== projectId);
          const hasPending = updatedProjects.some((project: IProject) => project.status === 'pending');
          setHasPendingProjects(hasPending);
        } catch (error) {
          console.error('Error deleting project:', error);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleDetail = (record: IProject) => {
    navigate(`/project/${record._id}`);
  };

  const handleCreateProject = () => {
    setModalAddOpen(true);
  };

  const handleModalAddSubmit = async (values: any) => {
    try {
      setSubmitLoading(true);
      const response = await createProject(values);
      console.log('Response:', response);
      setModalAddOpen(false);
      // Refresh project list
      fetchProjects();
      // Refresh statistics after creating a new project only if on statistics tab
      if (activeTab === '1') {
        fetchStatistic();
      }
      // Cập nhật trạng thái hasPendingProjects sau khi tạo dự án mới
      // (fetchProjects sẽ tự động cập nhật hasPendingProjects)
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setSubmitLoading(false);
    }
  };

  const getActionItems = (record: IProject): MenuProps['items'] => [
    {
      key: 'detail',
      label: t('action.detail'),
      icon: <EditOutlined />,
      onClick: () => handleDetail(record)
    },
    {
      key: 'delete',
      label: t('action.delete'),
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => record._id && handleDelete(record._id)
    }
  ];

  const getStatusTagColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'processing';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const statusOptions = [
    { value: '', label: <Tag>{t('filter.all')}</Tag> },
    { value: 'completed', label: <Tag color="success">{t('statusValues.completed')}</Tag> },
    { value: 'processing', label: <Tag color="processing">{t('statusValues.processing')}</Tag> },
    { value: 'pending', label: <Tag color="warning">{t('statusValues.pending')}</Tag> }
  ];

  const headerStyle = {
    backgroundColor: '#1890ff',
    color: '#ffffff',
    fontWeight: 500
  };

  const columns: ColumnsType<IProject> = [
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
      dataIndex: 'name',
      key: 'name',
      width: 200,
      onHeaderCell: () => ({
        style: headerStyle
      })
    },
    {
      title: t('table.status'),
      dataIndex: 'status',
      key: 'status',
      width: 120,
      align: 'center',
      render: (status: string) => (
        <Tag color={getStatusTagColor(status)}>{t(`statusValues.${status}`)}</Tag>
      ),
      onHeaderCell: () => ({
        style: headerStyle
      })
    },
    {
      title: t('table.customer'),
      key: 'customer',
      width: 150,
      render: (_, record) => record.customer?.profile.name || '-',
      onHeaderCell: () => ({
        style: headerStyle
      })
    },
    {
      title: t('table.pm'),
      key: 'pm',
      width: 150,
      render: (_, record) => record.pm?.profile.name || '-',
      onHeaderCell: () => ({
        style: headerStyle
      })
    },
    {
      title: t('table.startDate'),
      dataIndex: 'startDate',
      key: 'startDate',
      width: 120,
      render: (date: string) => dayjs(new Date(date).toLocaleDateString()).format('DD/MM/YYYY'),
      onHeaderCell: () => ({
        style: headerStyle
      })
    },
    {
      title: t('table.endDate'),
      dataIndex: 'endDate',
      key: 'endDate',
      width: 120,
      render: (date: string) => dayjs(new Date(date).toLocaleDateString()).format('DD/MM/YYYY'),
      onHeaderCell: () => ({
        style: headerStyle
      })
    },
    {
      title: t('table.action'),
      key: 'action',
      width: 80,
      align: 'center',
      fixed: 'right' as const,
      render: (_, record) => (
        <Dropdown menu={{ items: getActionItems(record) }} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
      onHeaderCell: () => ({
        style: headerStyle
      })
    }
  ];

  const StatisticCards = useMemo(() => {
    const getPercentageChangeColor = (change: number | undefined) => {
      if (change === undefined) return '#000000';
      return change >= 0 ? '#3f8600' : '#cf1322';
    };

    const renderPercentageChange = (change: number | undefined) => {
      if (change === undefined) return null;
      return (
        <small style={{ fontSize: '14px', marginLeft: '8px' }}>
          {change >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          {Math.abs(change)}%
        </small>
      );
    };

    return (
      // Số dự án đang tiến hành
      <Space direction="horizontal" size="middle" style={{ width: '100%', height: '100%' }}>
        <Card size="small" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ProjectOutlined style={{ fontSize: 24, color: '#1890ff', marginRight: 16 }} />
            <div style={{ flex: 1 }}>
              <div style={{ color: 'rgba(0, 0, 0, 0.45)', fontSize: '14px' }}>{t('statistic.active')}</div>
              <div style={{
                fontSize: '24px',
                fontWeight: 500,
                color: getPercentageChangeColor(statistic?.totalActiveProjects.percentageChange),
                display: 'flex',
                alignItems: 'center'
              }}>
                {statistic?.totalActiveProjects.current || 0}
                {renderPercentageChange(statistic?.totalActiveProjects.percentageChange)}
              </div>
            </div>
          </div>
        </Card>

        {/* Dự án đã hoàn thành */}
        <Card size="small" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircleFilled style={{ fontSize: 24, color: '#52c41a', marginRight: 16 }} />
            <div style={{ flex: 1 }}>
              <div style={{ color: 'rgba(0, 0, 0, 0.45)', fontSize: '14px' }}>{t('statistic.completed')}</div>
              <div style={{
                fontSize: '24px',
                fontWeight: 500,
                color: getPercentageChangeColor(statistic?.totalCompletedProjects.percentageChange),
                display: 'flex',
                alignItems: 'center'
              }}>
                {statistic?.totalCompletedProjects.current || 0}
                {renderPercentageChange(statistic?.totalCompletedProjects.percentageChange)}
              </div>
            </div>
          </div>
        </Card>

        <Card size="small" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ClockCircleOutlined style={{ fontSize: 24, color: '#1890ff', marginRight: 16 }} />
            <div style={{ flex: 1 }}>
              <div style={{ color: 'rgba(0, 0, 0, 0.45)', fontSize: '14px' }}>{t('statistic.processing')}</div>
              <div style={{
                fontSize: '24px',
                fontWeight: 500,
                color: getPercentageChangeColor(statistic?.totalProcessingProjects.percentageChange),
                display: 'flex',
                alignItems: 'center'
              }}>
                {statistic?.totalProcessingProjects.current || 0}
                {renderPercentageChange(statistic?.totalProcessingProjects.percentageChange)}
              </div>
            </div>
          </div>
        </Card>

        <Card size="small" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <WarningFilled style={{ fontSize: 24, color: '#faad14', marginRight: 16 }} />
            <div style={{ flex: 1 }}>
              <div style={{ color: 'rgba(0, 0, 0, 0.45)', fontSize: '14px' }}>{t('statistic.pending')}</div>
              <div style={{
                fontSize: '24px',
                fontWeight: 500,
                color: getPercentageChangeColor(statistic?.totalPendingProjects.percentageChange),
                display: 'flex',
                alignItems: 'center'
              }}>
                {statistic?.totalPendingProjects.current || 0}
                {renderPercentageChange(statistic?.totalPendingProjects.percentageChange)}
              </div>
            </div>
          </div>
        </Card>
      </Space>
    );
  }, [statistic, t]);

  const ActiveProjectsProgress = useMemo(() => {
    if (!statistic?.activeProjectsProgress.length) return null;

    const data = {
      labels: statistic.activeProjectsProgress.map(project => project.alias),
      datasets: [
        {
          label: t('progress.time'),
          data: statistic.activeProjectsProgress.map(project => project.timeProgress),
          backgroundColor: '#1890ff',
          borderColor: '#1890ff',
          borderWidth: 1,
          barPercentage: 0.4,
        },
        {
          label: t('progress.phase'),
          data: statistic.activeProjectsProgress.map(project => project.phaseProgress),
          backgroundColor: '#52c41a',
          borderColor: '#52c41a',
          borderWidth: 1,
          barPercentage: 0.4,
        }
      ]
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        tooltip: {
          callbacks: {
            afterTitle: (tooltipItems: any) => {
              const dataIndex = tooltipItems[0].dataIndex;
              const project = statistic.activeProjectsProgress[dataIndex];
              return [
                `${project.name}`,
                `${t('table.pm')}: ${project.pm.name}`,
                `${t('table.customer')}: ${project.customer.name}`,
                `${t('progress.phase')}: ${project.currentPhase}/${project.totalPhases}`
              ];
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          title: {
            display: true,
            text: '%',
            font: {
              size: 14
            }
          },
          grid: {
            color: '#f0f0f0'
          }
        },
        x: {
          grid: {
            display: false
          },
          title: {
            display: true,
            text: t('progress.projects'),
            font: {
              size: 14
            }
          }
        }
      },
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'nearest' as const
      }
    };

    return (
      <div style={{ height: '100%', minHeight: '380px' }}>
        <Bar data={data} options={options} />
      </div>
    );
  }, [statistic?.activeProjectsProgress, t]);

  const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    setDateRange(dates || [null, null]);
    // Cập nhật hasPendingProjects khi date range của statistic thay đổi
    // (fetchStatistic sẽ tự động cập nhật hasPendingProjects)
  };

  const handleListDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    setListDateRange(dates || [null, null]);
    setQueryParams(prev => ({
      ...prev,
      monthYearStart: dates?.[0] ? dates[0].format('MM/YYYY') : '',
      monthYearEnd: dates?.[1] ? dates[1].format('MM/YYYY') : '',
      page: 1
    }));
    // Cập nhật hasPendingProjects khi date range thay đổi
    // (fetchProjects sẽ tự động cập nhật hasPendingProjects)
  };

  const handleStatusChange = (value: string) => {
    setQueryParams(prev => ({
      ...prev,
      status: value,
      page: 1
    }));
    // Cập nhật hasPendingProjects dựa trên filter status
    if (value === 'pending') {
      setHasPendingProjects(true);
    } else if (value === '') {
      // Nếu filter là "all", kiểm tra lại từ danh sách projects
      const hasPending = projects.some((project: IProject) => project.status === 'pending');
      setHasPendingProjects(hasPending);
    } else {
      // Nếu filter là status khác, không có dự án pending nào được hiển thị
      setHasPendingProjects(false);
    }
  };

  const handleSortChange = (value: SortType) => {
    setQueryParams(prev => ({
      ...prev,
      sort: value,
      page: 1
    }));
    // Cập nhật hasPendingProjects khi sort thay đổi
    // (fetchProjects sẽ tự động cập nhật hasPendingProjects)
  };

  const handlePageChange = (page: number) => {
    setQueryParams(prev => ({
      ...prev,
      page
    }));
    // Cập nhật hasPendingProjects khi page thay đổi
    // (fetchProjects sẽ tự động cập nhật hasPendingProjects)
  };

  // Component để hiển thị tab với chấm vàng
  const TabWithNotification = ({ label, hasNotification }: { label: string; hasNotification: boolean }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {label}
      {hasNotification && (
        <div
          style={{
            width: '8px',
            height: '8px',
            backgroundColor: '#faad14',
            borderRadius: '50%',
            flexShrink: 0
          }}
        />
      )}
    </div>
  );

  return (
    <div style={{ padding: '0px' }}>
      {contextHolder}

      <Card
        title={
          <Space>
            <ProjectOutlined />
            {t('statistic.title')}
          </Space>
        }
        loading={debouncedStatisticLoading}
        extra={
          <RangePicker
            onChange={(dates) => handleDateRangeChange(dates as [Dayjs | null, Dayjs | null] | null)}
            value={dateRange}
            format="MM/YYYY"
            picker="month"
            allowEmpty={[true, true]}
            placeholder={[t('date.start'), t('date.end')]}
          />
        }
      >
        {/* box thông báo  */}
        {!debouncedStatisticLoading && statistic && statistic.totalPendingProjects && statistic.totalPendingProjects.current > 0 && (
          <Alert
            message={t('alert.pending.message', {
              count: statistic.totalPendingProjects.current,
              message: t(isCustomer ? 'alert.pending.customer' : 'alert.pending.admin')
            })}
            type="warning"
            showIcon
            style={{ marginBottom: 15 }}
          />
        )}

        {/* Hàng 1: Các card */}
        {!debouncedStatisticLoading && (
          <Row gutter={[24, 24]} style={{ marginBottom: 14 }}>
            <Col span={24}>
              <div style={{ height: 'auto' }}>
                {StatisticCards}
              </div>
            </Col>
          </Row>
        )}

        {/* Nút toggle biểu đồ */}
        <Row style={{ marginBottom: 5 }}>
          <Col span={24} style={{ textAlign: 'left' }}>
            <Button
              onClick={() => setShowChart(prev => !prev)}
              style={{
                borderRadius: 15,
                borderColor: '#e8e5e5ff',
                backgroundColor: '#ffffffff',
                transition: 'all 0.2s',
                minWidth: '170px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f5';
                e.currentTarget.style.color = '#000'; // giữ nguyên màu chữ
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#fff';
                e.currentTarget.style.color = '#000'; // giữ nguyên màu chữ
              }}
              icon={showChart ? <EyeInvisibleOutlined /> : <EyeOutlined />} 
            >
              {showChart ? t('chart.hideChart') : t('chart.showChart')}
            </Button>

          </Col>
        </Row>

        {/* Hàng 2: Biểu đồ */}
        {!debouncedStatisticLoading && showChart && (
          <Row gutter={[24, 24]}>
            <Col span={24}>
              <div style={{
                borderTop: '1px solid #f0f0f0',
                paddingTop: 24
              }}>
                <div style={{ marginBottom: 16, fontWeight: 500 }}>
                  {t('progress.title')}
                </div>
                {ActiveProjectsProgress}
              </div>
            </Col>
          </Row>
        )}
      </Card>


      {/* Tabs */}
      <Row style={{ marginTop: 24 }}>
        <Col span={24}>
        <Card 
        title = {<Space>
          <ProjectOutlined />
          {t('table.title')}
          </Space>}
         extra = {<Button type="primary" icon={<PlusOutlined />} onClick={handleCreateProject}>
          {t('button.create')}
          </Button>}
          >
            <Tabs
              activeKey={activeTab}
              onChange={(key) => {
                setActiveTab(key);
                // Cập nhật hasPendingProjects khi chuyển tab
                if (key === '2') {
                  const hasPending = projects.some((project: IProject) => project.status === 'pending');
                  setHasPendingProjects(hasPending);
                }
              }}
              items={[
                {
                  key: '1',
                  label: t('tabs.requestStatistics'), 
                  children: useMemo(() => <ProjectRequest />, [])
                },
                {
                  key: '2',
                  label: <TabWithNotification label={t('tabs.projectList')} hasNotification={hasPendingProjects} />,
                  children: (
                    <div>
                      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Space size="middle" wrap>
                          <Input
                            placeholder={t('search.placeholder')}
                            prefix={<SearchOutlined />}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ width: 200 }}
                          />
                          <Select
                            style={{ width: 120 }}
                            options={statusOptions}
                            value={queryParams.status}
                            onChange={handleStatusChange}
                            placeholder={t('filter.status')}
                          />
                          <Select
                            style={{ width: 120 }}
                            options={[
                              { value: 'desc', label: t('sort.newest') },
                              { value: 'asc', label: t('sort.oldest') }
                            ]}
                            value={queryParams.sort}
                            onChange={handleSortChange}
                          />
                          <RangePicker
                            onChange={(dates) => handleListDateRangeChange(dates as [Dayjs | null, Dayjs | null] | null)}
                            value={listDateRange}
                            format="MM/YYYY"
                            picker="month"
                            allowEmpty={[true, true]}
                            placeholder={[t('filter.monthStart'), t('filter.monthEnd')]}
                          />
                        </Space>
                      </div>
                      <Table
                        columns={columns}
                        dataSource={projects}
                        loading={loading}
                        bordered={true}
                        pagination={false}
                        scroll={{ x: 1200 }}
                        footer={() => (
                          <div className="flex justify-center">
                            <Pagination
                              current={queryParams.page}
                              total={totalItems}
                              pageSize={queryParams.limit}
                              onChange={handlePageChange}
                              showSizeChanger
                              onShowSizeChange={(_current, size) => {
                                setQueryParams(prev => ({
                                  ...prev,
                                  limit: size,
                                  page: 1
                                }));
                                // Cập nhật hasPendingProjects khi page size thay đổi
                                // (fetchProjects sẽ tự động cập nhật hasPendingProjects)
                              }}
                              align='center'
                            />
                          </div>
                        )}
                      />
                    </div>
                  )
                },
               
              ]}
            />
          </Card>
        </Col>
      </Row>
      <ModalAddProject
        open={modalAddOpen}
        onCancel={() => setModalAddOpen(false)}
        onSubmit={handleModalAddSubmit}
        loading={submitLoading}
      />
    </div>
  );
};

export default Project;
  