import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Typography, Spin } from 'antd';
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

  if (loading || !stats) return <Spin />;

  // Tính toán các giá trị phần trăm
  const phasePercent = Math.round((stats.currentPhase / stats.totalPhase) * 100);

  const parseDate = (str: string): Date => {
    const [d, m, y] = str.split('/').map(Number);
    return new Date(y, m - 1, d);
  };
  const start = parseDate(stats.startDateProject).getTime();
  const now = parseDate(stats.nowDate).getTime();
  const latestPhase = parseDate(stats.latestTimePhase).getTime();

  const totalDuration = latestPhase - start;
  const nowToLatestDuration = latestPhase - now;
  const startToNowDuration = now - start;

  const percentStartToLatest = totalDuration > 0 ? Math.min(100, Math.round((startToNowDuration / totalDuration) * 100)) : 0;
  const percentNowToLatest = totalDuration > 0 ? Math.max(0, Math.round((nowToLatestDuration / totalDuration) * 100)) : 0;

  // Dữ liệu cho Bar chart 3 cột
  const barData = {
    labels: [
      'Tiến độ giai đoạn',
      'Thời gian còn lại (hiện tại → kết thúc)',
      'Thời gian đã qua (bắt đầu → hiện tại)'
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
              title="Tổng tài liệu"
              value={stats.totalDocument}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Tổng báo cáo"
              value={stats.totalReport}
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Tổng yêu cầu"
              value={stats.totalRequest}
              prefix={<FormOutlined />}
            />
          </Card>
        </Col>
          <Col span={4}>
          <Card>
            <Statistic
              title="Tổng yêu cầu đã hoàn thành"
              value={stats.totalDocCompleted || 0}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Yêu cầu mới"
              value={stats.totalNewRequest || 0}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
       
      </Row>
      <Card>
        <Title level={5}>Tiến độ dự án</Title>
        <Card
        >
            <Bar data={barData} options={barOptions} height={100} />
        </Card>
      </Card>
    </div>
  );
};

export default ProjectDetailStatistic;
