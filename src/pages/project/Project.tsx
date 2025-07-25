import { Table, Select, Input, Space, Tag, Dropdown, Button, Modal, Card, Row, Col, DatePicker, Alert } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
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
  CloseOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  UnorderedListOutlined,
  BarChartOutlined,
  FileTextOutlined
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
  const [showChart, setShowChart] = useState(false);
  const { t } = useTranslation(['project']);
  const currentUser = useSelector(selectAuthUser);
  const isCustomer = currentUser?.role === 'customer';

  type SortType = 'asc' | 'desc';

  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<IProject[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statistic, setStatistic] = useState<IProjectStatistic | null>(null);
  const debouncedSearchTerm = useDebounce(searchTerm);
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
  const navigate = useNavigate();
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await getProjects({
        ...queryParams,
        search: queryParams.search.trim()
      });
      setProjects(response.data.data.data || []);
      setTotalItems(response.data.data.pagination.total);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistic = async () => {
    try {
      const params: ProjectStatisticParams = dateRange[0] && dateRange[1] ? {
        monthYearStart: dateRange[0].format('MM/YYYY'),
        monthYearEnd: dateRange[1].format('MM/YYYY')
      } : {
        monthYearStart: '',
        monthYearEnd: ''
      };

      const response = await projectStatistics(params);
      setStatistic(response.data.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [queryParams]);

  useEffect(() => {
    fetchStatistic();
  }, [dateRange]);

  useEffect(() => {
    setQueryParams(prev => ({ ...prev, search: debouncedSearchTerm }));
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
          fetchStatistic();
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
      // TODO: Call API to create project
      console.log('Create project with values:', values);
      const response = await createProject(values);
      console.log('Response:', response);
      setModalAddOpen(false);
      // Refresh project list
      fetchProjects();
      // Refresh statistics
      fetchStatistic();
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
    { value: 'completed', label: <Tag color="success">{t('status.completed')}</Tag> },
    { value: 'processing', label: <Tag color="processing">{t('status.processing')}</Tag> },
    { value: 'pending', label: <Tag color="warning">{t('status.pending')}</Tag> }
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
        <Tag color={getStatusTagColor(status)}>{t(`status.${status}`)}</Tag>
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

  // Thay đổi StatisticCards component
  const StatisticCards = () => {
    const getPercentageChangeColor = (change: number | undefined) => {
      if (change === undefined) return '#000000';
      return change >= 0 ? '#7cff80ff' : '#ff3243ff';
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
      // Hàng statistic cards - sử dụng flexbox với flex-wrap
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        width: '100%',

      }}>
        {/* thẻ tổng dự án hiện tại*/}
        <div
          style={{
            background: '#1890ff',
            color: 'white',
            borderRadius: 6,
            padding: 8,
            height: 70,
            minWidth: 240,
            flex: '1 1 240px',
            maxWidth: 280,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            {/* Icon bên trái */}
            <div style={{
              backgroundColor: 'white',
              padding: 8,
              borderRadius: 6,
              marginRight: 10,
              flexShrink: 0,
            }}>
              <ProjectOutlined style={{ fontSize: 32, color: '#1890ff' }} />
            </div>

            {/* Nội dung bên phải */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, lineHeight: 1.4, fontWeight: 500 }}>{t('statistic.active')}</div>
              <div style={{
                fontSize: 20,
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                flexWrap: 'wrap'
              }}>
                <span>{statistic?.totalActiveProjects.current || 0}</span>
                <span style={{
                  fontSize: 11,
                  color: getPercentageChangeColor(statistic?.totalActiveProjects.percentageChange)
                }}>
                  {renderPercentageChange(statistic?.totalActiveProjects.percentageChange)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/*  Thẻ dự án đang tiến hành */}
        <div
          style={{
            background: '#ffb302ff',
            color: 'white',
            borderRadius: 6,
            padding: 8,
            height: 70,
            minWidth: 240,
            flex: '1 1 240px',
            maxWidth: 280,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            {/* Icon bên trái */}
            <div style={{
              backgroundColor: 'white',
              padding: 8,
              borderRadius: 6,
              marginRight: 10,
              flexShrink: 0,
            }}>
              <ClockCircleOutlined style={{ fontSize: 32, color: '#ffb302ff' }} />
            </div>

            {/* Nội dung bên phải */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, lineHeight: 1.4, fontWeight: 500 }}>{t('statistic.processing')}</div>
              <div style={{
                fontSize: 20,
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                flexWrap: 'wrap'
              }}>
                <span>{statistic?.totalProcessingProjects.current || 0}</span>
                <span style={{
                  fontSize: 11,
                  color: getPercentageChangeColor(statistic?.totalProcessingProjects.percentageChange)
                }}>
                  {renderPercentageChange(statistic?.totalProcessingProjects.percentageChange)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* thẻ dự án đã hoàn thành */}
        <div
          style={{
            background: '#52C41A',
            color: 'white',
            borderRadius: 6,
            padding: 8,
            height: 70,
            minWidth: 240,
            flex: '1 1 240px',
            maxWidth: 280,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            {/* Icon bên trái */}
            <div style={{
              backgroundColor: 'white',
              padding: 8,
              borderRadius: 6,
              marginRight: 10,
              flexShrink: 0,
            }}>
              <CheckCircleFilled style={{ fontSize: 32, color: '#52C41A' }} />
            </div>

            {/* Nội dung bên phải */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, lineHeight: 1.4, fontWeight: 500 }}>{t('statistic.completed')}</div>
              <div style={{
                fontSize: 20,
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                flexWrap: 'wrap'
              }}>
                <span>{statistic?.totalCompletedProjects.current || 0}</span>
                <span style={{
                  fontSize: 11,
                  color: getPercentageChangeColor(statistic?.totalCompletedProjects.percentageChange)
                }}>
                  {renderPercentageChange(statistic?.totalCompletedProjects.percentageChange)}
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* thẻ tài liệu */}
        <div
          style={{
            background: '#ff724fff',
            color: 'white',
            borderRadius: 6,
            padding: 8,
            height: 70,
            minWidth: 240,
            flex: '1 1 240px',
            maxWidth: 280,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            {/* Icon bên trái */}
            <div style={{
              backgroundColor: 'white',
              padding: 8,
              borderRadius: 6,
              marginRight: 10,
              flexShrink: 0,
            }}>
              <FileTextOutlined style={{ fontSize: 32, color: '#ff724fff' }} />
            </div>

            {/* Nội dung bên phải */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, lineHeight: 1.4, fontWeight: 500 }}>{'Số báo cáo đã gửi'}</div>
              <div style={{
                fontSize: 20,
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                flexWrap: 'wrap'
              }}>
                <span>322</span>
                <span style={{
                  fontSize: 11,
                  color: getPercentageChangeColor(statistic?.totalCompletedProjects.percentageChange)
                }}>
                  1.233 tài liệu đã được gửi
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ActiveProjectsProgress = () => {
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
                `PM: ${project.pm.name}`,
                `Customer: ${project.customer.name}`,
                `Phase: ${project.currentPhase}/${project.totalPhases}`
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
  };

  const handleDateRangeChange = async (dates: [Dayjs | null, Dayjs | null] | null) => {
    setDateRange(dates || [null, null]);
    try {
      setLoading(true);
      const params: ProjectStatisticParams = dates?.[0] && dates?.[1] ? {
        monthYearStart: dates[0].format('MM/YYYY'),
        monthYearEnd: dates[1].format('MM/YYYY')
      } : {
        monthYearStart: '',
        monthYearEnd: ''
      };

      const response = await projectStatistics(params);
      setStatistic(response.data.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleListDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    setListDateRange(dates || [null, null]);
    setQueryParams(prev => ({
      ...prev,
      monthYearStart: dates?.[0] ? dates[0].format('MM/YYYY') : '',
      monthYearEnd: dates?.[1] ? dates[1].format('MM/YYYY') : '',
      page: 1
    }));
  };

  const handleStatusChange = (value: string) => {
    setQueryParams(prev => ({
      ...prev,
      status: value,
      page: 1
    }));
  };

  const handleSortChange = (value: SortType) => {
    setQueryParams(prev => ({
      ...prev,
      sort: value,
      page: 1
    }));
  };

  const handlePageChange = (page: number) => {
    setQueryParams(prev => ({
      ...prev,
      page
    }));
  };

  useEffect(() => {
    // Fetch initial statistics with empty date range
    handleDateRangeChange(null);
  }, []);

  return (
    <>
      {contextHolder}
      {/* Danh sách */}
      <Row >
        <Col span={24}>
          <Card
            title={
              <Space>
                <UnorderedListOutlined />
                {t('project.list')}
              </Space>
            }

          >

            <div style={{
              marginBottom: 10,
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              alignItems: 'flex-start'
            }}>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                alignItems: 'center',
                flex: '1 1 auto',
                minWidth: '300px'
              }}>
                <Input
                  placeholder={t('search.placeholder')}
                  prefix={<SearchOutlined />}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{ width: 180, minWidth: 150 }}
                />
                <Select
                  style={{ width: 110, minWidth: 100 }}
                  options={statusOptions}
                  value={queryParams.status}
                  onChange={handleStatusChange}
                  placeholder={t('filter.status')}
                />
                <Select
                  style={{ width: 110, minWidth: 100 }}
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
                  style={{ minWidth: 200 }}
                />
              </div>

              <div style={{
                display: 'flex',
                gap: '8px',
                flexShrink: 0,
              }}>
                <Button
                  onClick={() => setShowChart(prev => !prev)}
                  style={{ width: '160px', height: '32px', minWidth: '140px' }}
                  icon={<BarChartOutlined />}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f5f5f5';
                    e.currentTarget.style.color = '#444746be';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#fff';
                    e.currentTarget.style.color = '#444746be';
                  }}
                >
                  {showChart ? 'Ẩn biểu đồ tiến độ' : 'Mở biểu đồ tiến độ'}
                </Button>

                <Button
                  style={{ width: '140px', height: '32px', minWidth: '120px' }}
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreateProject}
                >
                  {t('button.create')}
                </Button>
              </div>
            </div>
            {/* Hàng 1: Các card */}
            <Row gutter={[24, 24]} style={{ marginBottom: 18 }}>
              <Col span={24}>
                <div style={{ height: 'auto' }}>
                  <StatisticCards />
                </div>
              </Col>
            </Row>
            {/* box thông báo  */}
            {statistic && statistic.totalPendingProjects && statistic.totalPendingProjects.current > 0 && (
              <Alert
                message={t('alert.pending.message', {
                  count: statistic.totalPendingProjects.current,
                  message: t(isCustomer ? 'alert.pending.customer' : 'alert.pending.admin')
                })}
                type="warning"
                showIcon
                style={{ marginBottom: 10 }}
              />
            )}


            {/* Hàng 2: Biểu đồ */}
            {showChart && (
              <Row gutter={[24, 24]}>
                <Col span={24}>
                  <div style={{
                    borderTop: '1px solid #f0f0f0',
                    paddingTop: 24
                  }}>
                    <div style={{ marginBottom: 16, fontWeight: 500 }}>
                      {t('progress.title')}
                    </div>
                    <ActiveProjectsProgress />
                  </div>
                </Col>
              </Row>
            )}
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
                    }}
                    align='center'
                  />
                </div>
              )}
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
    </>
  );
};

export default Project;
