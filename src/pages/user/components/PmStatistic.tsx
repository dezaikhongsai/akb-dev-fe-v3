import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getUserStatisticProject } from '../../../services/user/user.service';
import { IUserProjectStatistic } from '../interfaces/user.interface';
import { Table, Tag, Alert, Progress } from 'antd';
import type { ColumnsType } from 'antd/es/table';

const PmStatistic = () => {
  const { t } = useTranslation(['user']);
  const [statistics, setStatistics] = useState<IUserProjectStatistic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getUserStatisticProject('pm');
      console.log('PM Statistics Response:', response);
      
      if (response && response.data && Array.isArray(response.data.statistics)) {
        setStatistics(response.data.statistics);
      } else {
        console.error('Invalid response structure:', response);
        setError(t('statistics.invalidData'));
      }
    } catch (err: any) {
      console.error('API Error:', err);
      setError(err.message || t('statistics.errorMessage'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  const headerStyle = {
    backgroundColor: '#1890ff',
    color: '#ffffff',
    fontWeight: 500
  };

  const columns: ColumnsType<IUserProjectStatistic> = [
    {
      title: t('statistics.columns.stt'),
      key: 'index',
      width: 60,
      align: 'center',
      fixed: 'left',
      render: (_: any, record: IUserProjectStatistic, index: number) => (
        <div style={{ position: 'relative' }}>
          {record.completedProjectsList.length > 0 && (
            <div style={{
              position: 'absolute',
              top: -2,
              right: -2,
              width: 8,
              height: 8,
              backgroundColor: '#52c41a',
              borderRadius: '50%',
              border: '1px solid #fff'
            }} />
          )}
          {index + 1}
        </div>
      ),
      onHeaderCell: () => ({
        style: headerStyle
      })
    },
    {
      title: t('statistics.columns.userAlias'),
      dataIndex: ['user', 'alias'],
      key: 'userAlias',
      width: 100,
      align: 'center',
      fixed: 'left',
      onHeaderCell: () => ({
        style: headerStyle
      })
    },
    {
      title: t('statistics.columns.userName'),
      dataIndex: ['user', 'profile', 'name'],
      key: 'userName',
      width: 200,
      render: (text: string) => (
        <Tag color="blue">{text}</Tag>
      ),
      onHeaderCell: () => ({
        style: headerStyle
      })
    },
    {
      title: t('statistics.columns.email'),
      dataIndex: ['user', 'email'],
      key: 'email',
      width: 200,
      onHeaderCell: () => ({
        style: headerStyle
      })
    },
    {
      title: t('statistics.columns.totalProjects'),
      dataIndex: ['projectStatistics', 'totalProjects'],
      key: 'totalProjects',
      width: 120,
      align: 'center',
      render: (value: number) => (
        <span style={{ fontWeight: '600', color: '#1890ff' }}>{value}</span>
      ),
      onHeaderCell: () => ({
        style: headerStyle
      })
    },
    {
      title: t('statistics.columns.pendingProjects'),
      dataIndex: ['projectStatistics', 'pendingProjects'],
      key: 'pendingProjects',
      width: 150,
      align: 'center',
      render: (value: number, record: IUserProjectStatistic) => (
        <div>
          <span style={{ fontWeight: '600', color: '#faad14' }}>{value}</span>
          {record.projectStatistics.totalProjects > 0 && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.projectStatistics.percentPending}%
            </div>
          )}
        </div>
      ),
      onHeaderCell: () => ({
        style: headerStyle
      })
    },
    {
      title: t('statistics.columns.processingProjects'),
      dataIndex: ['projectStatistics', 'processingProjects'],
      key: 'processingProjects',
      width: 150,
      align: 'center',
      render: (value: number, record: IUserProjectStatistic) => (
        <div>
          <span style={{ fontWeight: '600', color: '#1890ff' }}>{value}</span>
          {record.projectStatistics.totalProjects > 0 && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.projectStatistics.percentProcessing}%
            </div>
          )}
        </div>
      ),
      onHeaderCell: () => ({
        style: headerStyle
      })
    },
    {
      title: t('statistics.columns.completedProjects'),
      dataIndex: ['projectStatistics', 'completedProjects'],
      key: 'completedProjects',
      width: 150,
      align: 'center',
      render: (value: number, record: IUserProjectStatistic) => (
        <div>
          <span style={{ fontWeight: '600', color: '#52c41a' }}>{value}</span>
          {record.projectStatistics.totalProjects > 0 && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.projectStatistics.percentCompleted}%
            </div>
          )}
        </div>
      ),
      onHeaderCell: () => ({
        style: headerStyle
      })
    },
    {
      title: t('statistics.columns.progress'),
      key: 'progress',
      width: 200,
      align: 'center',
      render: (_: any, record: IUserProjectStatistic) => {
        const { totalProjects, completedProjects, processingProjects } = record.projectStatistics;
        const completedPercent = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;
        const processingPercent = totalProjects > 0 ? (processingProjects / totalProjects) * 100 : 0;
        
        return (
          <div style={{ width: '100%' }}>
            <Progress
              percent={completedPercent}
              size="small"
              strokeColor="#52c41a"
              format={() => `${completedProjects}/${totalProjects}`}
            />
            {processingPercent > 0 && (
              <Progress
                percent={processingPercent}
                size="small"
                strokeColor="#1890ff"
                showInfo={false}
                style={{ marginTop: 4 }}
              />
            )}
          </div>
        );
      },
      onHeaderCell: () => ({
        style: headerStyle
      })
    },
  ];

  const completedProjectColumns = [
    {
      title: t('statistics.completedProjectColumns.name'),
      dataIndex: 'name',
      key: 'name',
      onHeaderCell: () => ({
        style: headerStyle
      })
    },
    {
      title: t('statistics.completedProjectColumns.alias'),
      dataIndex: 'alias',
      key: 'alias',
      onHeaderCell: () => ({
        style: headerStyle
      })
    },
    {
      title: t('statistics.completedProjectColumns.customer'),
      dataIndex: ['customer', 'profile', 'name'],
      key: 'customer',
      render: (text: string) => (
        <Tag color="green">{text}</Tag>
      ),
      onHeaderCell: () => ({
        style: headerStyle
      })
    },
    {
      title: t('statistics.completedProjectColumns.startDate'),
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date: string) => date ? new Date(date).toLocaleDateString('vi-VN') : '-',
      onHeaderCell: () => ({
        style: headerStyle
      })
    },
    {
      title: t('statistics.completedProjectColumns.endDate'),
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date: string) => date ? new Date(date).toLocaleDateString('vi-VN') : '-',
      onHeaderCell: () => ({
        style: headerStyle
      })
    },
    {
      title: t('statistics.completedProjectColumns.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
      onHeaderCell: () => ({
        style: headerStyle
      })
    },
  ];
  return (
    <>
      <style>
        {`
          .ant-pagination .ant-pagination-item-active {
            border-color: #1890ff !important;
            background-color: #1890ff !important;
          }
          .ant-pagination .ant-pagination-item-active a {
            color: #ffffff !important;
          }
          .ant-pagination .ant-pagination-item:hover {
            border-color: #1890ff !important;
          }
          .ant-pagination .ant-pagination-item:hover a {
            color: #1890ff !important;
          }
          .ant-pagination .ant-pagination-prev:hover .ant-pagination-item-link,
          .ant-pagination .ant-pagination-next:hover .ant-pagination-item-link {
            border-color: #1890ff !important;
            color: #1890ff !important;
          }
          .ant-pagination .ant-pagination-options .ant-select-selector {
            border-color: #1890ff !important;
          }
          .ant-pagination .ant-pagination-options .ant-select-focused .ant-select-selector {
            border-color: #1890ff !important;
            box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2) !important;
          }
          
          /* Highlight rows with completed projects */
          .highlight-completed-row {
            background-color: #f6ffed !important;
            border-left: 4px solid #52c41a !important;
          }
          
          .highlight-completed-row:hover {
            background-color: #d9f7be !important;
          }
          
          .highlight-completed-row td {
            border-color: #b7eb8f !important;
          }
          
          /* Highlight rows with no projects */
          .highlight-no-projects-row {
            background-color: #f5f5f5 !important;
            border-left: 4px solid #d9d9d9 !important;
          }
          
          .highlight-no-projects-row:hover {
            background-color: #e8e8e8 !important;
          }
          
          .highlight-no-projects-row td {
            border-color: #d9d9d9 !important;
          }
        `}
      </style>

      <Table
        columns={columns}
        dataSource={statistics}
        rowKey={(record) => record.user._id}
        bordered={true}
        loading={loading}
        locale={{
          emptyText: !loading && !error ? (
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
              <div style={{ fontSize: '16px', color: '#666', marginBottom: '8px' }}>
                {t('statistics.noData')}
              </div>
              <div style={{ fontSize: '14px', color: '#999' }}>
                {t('statistics.noDataMessage')}
              </div>
            </div>
          ) : undefined
        }}
        rowClassName={(record) => {
          if (record.projectStatistics.totalProjects === 0) {
            return 'highlight-no-projects-row';
          } else if (record.completedProjectsList.length > 0) {
            return 'highlight-completed-row';
          }
          return '';
        }}
        pagination={{
          align: 'center',
          position: ['bottomCenter'],
          current: currentPage,
          pageSize: pageSize,
          total: statistics.length,
          showSizeChanger: true,
          showQuickJumper: true,
          onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          },
          onShowSizeChange: (_current, size) => {
            setCurrentPage(1);
            setPageSize(size);
          },
          style: {
            backgroundColor: '#f5f5f5',
            padding: '16px',
            margin: 0,
            borderTop: '1px solid #d9d9d9'
          }
        }}
        scroll={{ x: 1400 }}
        expandable={{
          expandedRowRender: (record) => (
            <div style={{ padding: '16px' }}>
              <h4 style={{ marginBottom: '16px' }}>{t('statistics.expandable.completedProjects')}</h4>
              {record.completedProjectsList.length > 0 ? (
                <Table
                  columns={completedProjectColumns}
                  dataSource={record.completedProjectsList}
                  rowKey="_id"
                  pagination={false}
                  size="small"
                  bordered={true}
                />
              ) : (
                <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                  {t('statistics.expandable.noCompletedProjects')}
                </div>
              )}
            </div>
          ),
          rowExpandable: (record) => record.completedProjectsList.length > 0,
        }}
      />

      {/* Error Alert */}
      {error && (
        <Alert
          message={t('statistics.error')}
          description={error}
          type="error"
          showIcon
          style={{ marginTop: 16 }}
        />
      )}
    </>
  );
};

export default PmStatistic;
