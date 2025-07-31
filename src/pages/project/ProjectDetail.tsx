import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom"
import { getProjectDetail } from "../../services/project/project.service";
import ProjectInfor from "./components/projects/ProjectInfor";
import DocumentInproject from "./components/documents/DocumentInproject";
import PhaseInProject from "./components/phases/PhaseInProject";
import { Spin, Tabs } from "antd";
import { IProjectDetailResponse } from "./interfaces/project.interface";
import { BarChartOutlined, FileSearchOutlined, ProjectOutlined } from "@ant-design/icons";
import ProjectDetailStatistic from "./components/projects/ProjectDetailStatistic";
import { useTranslation } from 'react-i18next';

const ProjectDetail = () => {
  const { t } = useTranslation(['projectDetail']);
  const { pid } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [project, setProject] = useState<IProjectDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingPhase, setLoadingPhase] = useState(false);
  const [statisticReloadKey, setStatisticReloadKey] = useState(0);
  const [activeTab, setActiveTab] = useState(() => {
    // Lấy tab từ URL parameter, mặc định là '1' (Project Info)
    const tabFromUrl = searchParams.get('tab');
    const validTabs = ['1', '2', '3'];
    return validTabs.includes(tabFromUrl || '') ? tabFromUrl! : '1';
  });

  const reloadStatistic = () => setStatisticReloadKey(prev => prev + 1);

  const reloadPhases = async () => {
    setLoadingPhase(true);
    await fetchProjectDetail();
    setLoadingPhase(false);
  };

  const fetchProjectDetail = async () => {
    if (!pid) {
      setError("Project ID not found");
      setLoading(false);
      return;
    }

    try {
      const response = await getProjectDetail(pid);
      setProject(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching project detail:", error);
      setError("Failed to fetch project detail");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    fetchProjectDetail();
  }, [pid]);

  // Đảm bảo URL luôn có tab parameter khi component mount
  useEffect(() => {
    if (!searchParams.get('tab')) {
      setSearchParams({ tab: '1' });
    }
  }, [searchParams, setSearchParams]);

  // Theo dõi thay đổi của URL parameter tab
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && tabFromUrl !== activeTab) {
      // Kiểm tra tab hợp lệ (1, 2, 3)
      const validTabs = ['1', '2', '3'];
      if (validTabs.includes(tabFromUrl)) {
        setActiveTab(tabFromUrl);
      } else {
        // Nếu tab không hợp lệ, chuyển về tab 1 và cập nhật URL
        setActiveTab('1');
        setSearchParams({ tab: '1' });
      }
    }
  }, [searchParams, activeTab, setSearchParams]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Spin size="large" /></div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!project) {
    return <div>No project found</div>;
  }

  return (
    <div style={{ }}>
      <Tabs
        activeKey={activeTab}
        onChange={key => {
          setActiveTab(key);
          // Cập nhật URL parameter khi thay đổi tab
          setSearchParams({ tab: key });
          if (key === '2') reloadStatistic();
        }}
        items = {[
          {
            key: '1',
            icon: <ProjectOutlined />,
            label: t('statistics.tabs.projectInfo'),
            children: 
            <>
               <ProjectInfor project={project.project} onReloadProject={fetchProjectDetail} phasesCount={project.phases.length} onReloadStatistic={reloadStatistic} />
              <PhaseInProject 
                phases={project.phases} 
                currentPhase={project.project.currentPhase} 
                projectId={pid || ''} 
                onReloadPhases={reloadPhases}
                loadingPhase={loadingPhase}
                projectStatus={project.project.status}
              />
             
            </>
          },

          {
            key: '2',
            icon: <BarChartOutlined />,
            label: t('statistics.tabs.statistics'),
            children: <>{project.project.isActive ? <ProjectDetailStatistic reloadKey={statisticReloadKey} /> : <div style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ color: '#faad14', fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                {t('statistics.warning.notActivated')}
              </div>
              <div style={{ color: '#666' }}>
                {t('statistics.warning.notActivatedMessage')}
              </div>
            </div>}</>
          },
          
          {
            key: '3',
            icon: <FileSearchOutlined />,
            label: t('statistics.tabs.documents'),
            children:  <DocumentInproject onReloadStatistic={reloadStatistic} />  
          },
        ]}
      />
    </div>
  )
}

export default ProjectDetail
