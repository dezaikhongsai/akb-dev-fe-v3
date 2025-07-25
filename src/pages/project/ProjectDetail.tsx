import { useState, useEffect } from "react";
import { useParams } from "react-router-dom"
import { getProjectDetail } from "../../services/project/project.service";
import ProjectInfor from "./components/projects/ProjectInfor";
import DocumentInproject from "./components/documents/DocumentInproject";
import PhaseInProject from "./components/phases/PhaseInProject";
import { Spin } from "antd";
import { IProjectDetailResponse } from "./interfaces/project.interface";

const ProjectDetail = () => {
  const { pid } = useParams();
  const [project, setProject] = useState<IProjectDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingPhase, setLoadingPhase] = useState(false);

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
    <div style={{ padding: '24px' }}>
      <ProjectInfor project={project.project} onReloadProject={fetchProjectDetail} phasesCount={project.phases.length} />
      <PhaseInProject 
        phases={project.phases} 
        currentPhase={project.project.currentPhase} 
        projectId={pid || ''} 
        onReloadPhases={reloadPhases}
        loadingPhase={loadingPhase}
        projectStatus={project.project.status}
      />
      <DocumentInproject  />
    </div>
  )
}

export default ProjectDetail
