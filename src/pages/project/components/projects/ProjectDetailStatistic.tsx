import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Typography, Spin, Alert } from 'antd';
import { projectDetailStatistics } from '../../../../services/project/project.service';
import { useParams } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import {
  FileTextOutlined,
  BarChartOutlined,
  FormOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const { Title } = Typography;

interface ProjectStatisticData {
  currentPhase: number;
  totalDocument: number;
  totalPhase: number;
  totalReport: number;
  totalRequest: number;
  totalNewRequest?: number;
  latestTimePhase: string;
  nowDate: string;
  startDateProject: string;
  totalDocCompleted: number,

}

interface ProjectDetailStatisticProps {
  reloadKey?: number;
}

const ProjectDetailStatistic = ({ reloadKey }: ProjectDetailStatisticProps) => {
  const { t } = useTranslation(['projectDetail']);
  const { pid } = useParams();
  const [stats, setStats] = useState<ProjectStatisticData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!pid) return;
    setLoading(true);
    projectDetailStatistics(pid)
      .then(res => setStats(res.data))
      .finally(() => setLoading(false));
  }, [pid, reloadKey]);

  if (loading) return <Spin />;

  // Kiểm tra nếu không có dữ liệu thống kê
  if (!stats) {
    return (
      <Alert
        message={t('statistics.warning.noData')}
        description={t('statistics.warning.noDataMessage')}
        type="warning"
        showIcon
        style={{ margin: '24px' }}
      />
    );
  }

  // Kiểm tra nếu không có giai đoạn nào
  if (!stats.startDateProject || !stats.latestTimePhase || !stats.nowDate) {
    return (
      <Alert
        message={t('statistics.warning.noPhases')}
        description={t('statistics.warning.noPhasesMessage')}
        type="warning"
        showIcon
        style={{ margin: '24px' }}
      />
    );
  }

  // Tính toán các giá trị phần trăm
  const phasePercent = Math.round((stats.currentPhase / stats.totalPhase) * 100);

    const parseDate = (str: string): Date => {
    if (!str) {
      throw new Error('Date string is null or undefined');
    }
    const [d, m, y] = str.split('/').map(Number);
    return new Date(y, m - 1, d);
  };

  let start: number, now: number, latestPhase: number;
  let totalDuration: number, nowToLatestDuration: number, startToNowDuration: number;
  let percentStartToLatest: number, percentNowToLatest: number;

  try {
    start = parseDate(stats.startDateProject).getTime();
    now = parseDate(stats.nowDate).getTime();
    latestPhase = parseDate(stats.latestTimePhase).getTime();

    totalDuration = latestPhase - start;
    nowToLatestDuration = latestPhase - now;
    startToNowDuration = now - start;

    percentStartToLatest = totalDuration > 0 ? Math.min(100, Math.round((startToNowDuration / totalDuration) * 100)) : 0;
    percentNowToLatest = totalDuration > 0 ? Math.max(0, Math.round((nowToLatestDuration / totalDuration) * 100)) : 0;
  } catch (error) {
    return (
      <Alert
        message={t('statistics.warning.noData')}
        description={t('statistics.warning.noDataMessage')}
        type="warning"
        showIcon
        style={{ margin: '24px' }}
      />
    );
  }

  // Dữ liệu cho Bar chart 3 cột
  const barData = {
    labels: [
      t('statistics.progress.phaseProgress'),
      t('statistics.progress.remainingTime'),
      t('statistics.progress.elapsedTime')
    ],
    datasets: [
      {
        label: 'Phần trăm (%)',
        data: [phasePercent, percentNowToLatest, percentStartToLatest],
        backgroundColor: ['#52c41a', '#1890ff', '#faad14'],
        borderRadius: 8,
        barPercentage: 0.5,
        categoryPercentage: 0.5,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: {
          callback: function(tickValue: string | number) {
            return `${tickValue}%`;
          }
        },
        title: { display: true, text: '%' },
      },
      x: {
        title: { display: false },
      },
    },
  };

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={4}>
          <Card>
            <Statistic
              title={t('statistics.cards.totalDocuments')}
              value={stats.totalDocument}
              prefix={<FileTextOutlined style={{ color: 'purple' }}/>}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title={t('statistics.cards.totalReports')}
              value={stats.totalReport}
              prefix={<BarChartOutlined style={{ color: 'violet' }}/>}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title={t('statistics.cards.totalRequests')}
              value={stats.totalRequest}
              prefix={<FormOutlined style={{ color: '#faad14' }}/>}
            />
          </Card>
        </Col>
          <Col span={4}>
          <Card>
            <Statistic
              title={t('statistics.cards.completedRequests')}
              value={stats.totalDocCompleted || 0}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }}/>}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title={t('statistics.cards.newRequests')}
              value={stats.totalNewRequest || 0}
              prefix={<ExclamationCircleOutlined style={{ color: '#1890ff' }}/>}
            />
          </Card>
        </Col>
       
      </Row>
      <Card>
        <Title level={5}>{t('statistics.progress.title')}</Title>
        <Card
        >
            <Bar data={barData} options={barOptions} height={100} />
        </Card>
      </Card>
    </div>
  );
};

export default ProjectDetailStatistic;
