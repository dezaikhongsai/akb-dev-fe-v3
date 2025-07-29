import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { statisticsRequestInProject } from '../../services/project';
import { ProjectRequestStatistics } from './interfaces/project.interface';
import { Table, Tag, Alert, Button, Dropdown, DatePicker } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import { EyeOutlined, MoreOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs, { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;

const ProjectRequest = () => {
  const { t } = useTranslation(['projectRequest', 'document']);
  const [statistics, setStatistics] = useState<ProjectRequestStatistics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const navigate = useNavigate();

  // Helper function to convert Dayjs to MM/YYYY format
  const formatDateToMonthYear = (date: Dayjs): string => {
    return date.format('MM/YYYY');
  };

  // Helper function to get current month/year
  const getCurrentMonthYear = (): string => {
    return dayjs().format('MM/YYYY');
  };

  const fetchStatistics = async (startDate?: string, endDate?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const params: { monthYearStart?: string; monthYearEnd?: string } = {};
      
      if (startDate && endDate) {
        params.monthYearStart = startDate;
        params.monthYearEnd = endDate;
      }
      
      const response = await statisticsRequestInProject(params);
      console.log('API Response:', response);
      
      // API trả về { status: "success", message: "...", data: { success: true, data: [...] } }
      if (response && response.data && response.data.success && Array.isArray(response.data.data)) {
        setStatistics(response.data.data);
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
    // Lần đầu load với tháng hiện tại
    const currentMonthYear = getCurrentMonthYear();
    fetchStatistics(currentMonthYear, currentMonthYear);
  }, []);

  const handleDateRangeChange = (dates: any) => {
    setDateRange(dates);
    
    if (dates && dates[0] && dates[1]) {
      const [startDate, endDate] = dates;
      const startMonthYear = formatDateToMonthYear(startDate);
      const endMonthYear = formatDateToMonthYear(endDate);
      
      fetchStatistics(startMonthYear, endMonthYear);
    } else {
      // Nếu không chọn date range, sử dụng tháng hiện tại
      const currentMonthYear = getCurrentMonthYear();
      fetchStatistics(currentMonthYear, currentMonthYear);
    }
  };

  const headerStyle = {
    backgroundColor: '#1890ff',
    color: '#ffffff',
    fontWeight: 500
  };

  const columns: ColumnsType<ProjectRequestStatistics> = [
    {
      title: t('statistics.columns.stt'),
      key: 'index',
      width: 60,
      align: 'center',
      fixed: 'left',
      render: (_: any, record: ProjectRequestStatistics, index: number) => (
        <div style={{ position: 'relative' }}>
          {record.incompleteDocumentsList.length > 0 && (
            <div style={{
              position: 'absolute',
              top: -2,
              right: -2,
              width: 8,
              height: 8,
              backgroundColor: '#faad14',
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
      title: t('statistics.columns.projectAlias'),
      dataIndex: 'projectAlias',
      key: 'projectAlias',
      width: 100,
      align: 'center',
      fixed: 'left',
      onHeaderCell: () => ({
        style: headerStyle
      })
    },
    {
      title: t('statistics.columns.projectName'),
      dataIndex: 'projectName',
      key: 'projectName',
      width: 200,
      onHeaderCell: () => ({
        style: headerStyle
      })
    },
    {
      title: t('statistics.columns.pm'),
      dataIndex: ['pm', 'name'],
      key: 'pm',
      width: 150,
      render: (text: string) => (
        <Tag color="blue">{text}</Tag>
      ),
      onHeaderCell: () => ({
        style: headerStyle
      })
    },
    {
      title: t('statistics.columns.customer'),
      dataIndex: ['customer', 'name'],
      key: 'customer',
      width: 150,
      render: (text: string) => (
        <Tag color="green">{text}</Tag>
      ),
      onHeaderCell: () => ({
        style: headerStyle
      })
    },
    {
      title: t('statistics.columns.totalDocuments'),
      dataIndex: 'totalDocuments',
      key: 'totalDocuments',
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
      title: t('statistics.columns.incompleteDocuments'),
      dataIndex: 'incompleteDocuments',
      key: 'incompleteDocuments',
      width: 150,
      align: 'center',
      render: (value: number, record: ProjectRequestStatistics) => (
        <div>
          <span style={{ fontWeight: '600', color: '#faad14' }}>{value}</span>
          {record.totalDocuments > 0 && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              {Math.round(((record.totalDocuments - value) / record.totalDocuments) * 100)}% {t('statistics.completionRate')}
            </div>
          )}
        </div>
      ),
      onHeaderCell: () => ({
        style: headerStyle
      })
    },
    {
      title: t('statistics.columns.action'),
      key: 'action',
      width: 80,
      align: 'center',
      fixed: 'right',
      render: (_: any, record: ProjectRequestStatistics) => (
        <Dropdown menu={{ items: getActionItems(record) }} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
      onHeaderCell: () => ({
        style: headerStyle
      })
    },
  ];

  const documentColumns = [
    {
      title: t('statistics.documentColumns.name'),
      dataIndex: 'name',
      key: 'name',
      onHeaderCell: () => ({
        style: headerStyle
      })
    },
    {
      title: t('statistics.documentColumns.type'),
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={
          type === 'document' ? 'blue' :
          type === 'report' ? 'green' : 'orange'
        }>
          {t(`type_options.${type}`)}
        </Tag>
      ),
      onHeaderCell: () => ({
        style: headerStyle
      })
    },
    {
      title: t('statistics.documentColumns.createdBy'),
      dataIndex: ['createdBy', 'name'],
      key: 'createdBy',
      onHeaderCell: () => ({
        style: headerStyle
      })
    },
    {
      title: t('statistics.documentColumns.updatedBy'),
      dataIndex: ['updatedBy', 'name'],
      key: 'updatedBy',
      onHeaderCell: () => ({
        style: headerStyle
      })
    },
    {
      title: t('statistics.documentColumns.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
      onHeaderCell: () => ({
        style: headerStyle
      })
    },
    {
      title: t('statistics.documentColumns.updatedAt'),
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
      onHeaderCell: () => ({
        style: headerStyle
      })
    },
  ];

  const handleViewDetails = (project: ProjectRequestStatistics) => {
    // Navigate đến tab Documents (tab 3) khi click xem chi tiết
    navigate(`/project/${project.projectId}?tab=3`);
  };

  const getActionItems = (record: ProjectRequestStatistics): MenuProps['items'] => [
    {
      key: 'detail',
      label: t('statistics.actions.viewDetails'),
      icon: <EyeOutlined />,
      onClick: () => handleViewDetails(record)
    }
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
            
            /* Highlight rows with incomplete documents */
            .highlight-incomplete-row {
              background-color: #fffbe6 !important;
              border-left: 4px solid #faad14 !important;
            }
            
            .highlight-incomplete-row:hover {
              background-color: #fff7cc !important;
            }
            
            .highlight-incomplete-row td {
              border-color: #ffe7ba !important;
            }
            
            /* Highlight rows with no documents (totalDocuments === 0) */
            .highlight-no-documents-row {
              background-color: #e6f7ff !important;
              border-left: 4px solid #1890ff !important;
            }
            
            .highlight-no-documents-row:hover {
              background-color: #bae7ff !important;
            }
            
            .highlight-no-documents-row td {
              border-color: #91d5ff !important;
            }
            
            /* Highlight rows with 100% completion */
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
          `}
        </style>

        {/* Simple DatePicker */}
        <div style={{ marginBottom: 16, textAlign: 'left' }}>
          <RangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            picker="month"
            format="MM/YYYY"
            placeholder={[t('statistics.filter.startDate'), t('statistics.filter.endDate')]}
            style={{ width: 300 }}
            allowClear={true}
          />
        </div>

        <Table
          columns={columns}
          dataSource={statistics}
          rowKey="projectId"
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
            if (record.totalDocuments === 0) {
              return 'highlight-no-documents-row';
            } else if (record.incompleteDocumentsList.length > 0) {
              return 'highlight-incomplete-row';
            } else if (record.totalDocuments > 0 && record.incompleteDocumentsList.length === 0) {
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
          scroll={{ x: 1200 }}
          expandable={{
            expandedRowRender: (record) => (
              <div style={{ padding: '16px' }}>
                <h4 style={{ marginBottom: '16px' }}>{t('statistics.expandable.title')}</h4>
                {record.incompleteDocumentsList.length > 0 ? (
                  <Table
                    columns={documentColumns}
                    dataSource={record.incompleteDocumentsList}
                    rowKey="_id"
                    pagination={false}
                    size="small"
                    bordered={true}
                  />
                ) : (
                  <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                    {t('statistics.expandable.noIncompleteDocuments')}
                  </div>
                )}
              </div>
            ),
            rowExpandable: (record) => record.incompleteDocumentsList.length > 0,
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

export default ProjectRequest;
