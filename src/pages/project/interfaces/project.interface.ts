export interface IUserProfile {
  _id: string;
  profile: {
    name: string;
    emailContact?: string;
  };
}

export interface IProject {
  _id: string;
  name: string;
  alias: string;
  pm: IUserProfile;
  customer: IUserProfile;
  status: 'completed' | 'processing' | 'pending' | 'cancelled';
  startDate: string;
  endDate: string;
  isActive: boolean;
  currentPhase: number;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface IPhase {
  _id: string;
  projectId: string;
  name: string;
  description: string;
  startDate: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface IDocumentFile {
  originalName: string;
  path: string;
  size: number;
  type: string;
  _id: string;
}

export interface IDocumentContent {
  content: string;
  files: IDocumentFile[];
  _id: string;
}

export interface IDocumentCreator {
  _id: string;
  email: string;
  role: string;
  profile: {
    name: string;
  };
}

export interface IDocument {
  _id: string;
  projectId: string;
  type: 'document' | 'report' | 'request';
  name: string;
  isCompleted: boolean;
  contents: IDocumentContent[];
  createdBy: IDocumentCreator;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface IPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IDocumentResponse {
  documents: IDocument[];
  pagination: IPagination;
}

export interface IProjectDetailResponse {
  project: IProject;
  phases: IPhase[];
  documents: IDocumentResponse;
}

export interface IProjectCreate {
  name: string;
  pm: string;
  customer?: string;
  startDate: string;
  endDate: string;
}

export interface IProjectUpdate {
  _id: string;
  name?: string;
  status?: string;
  currentPhase?: number;
  isActive?: boolean;
}

export interface IProjectStatistic {
  totalActiveProjects: {
    current: number;
    previous: number;
    percentageChange: number;
  };
  totalPendingProjects: {
    current: number;
    previous: number;
    percentageChange: number;
  };
  totalProcessingProjects: {
    current: number;
    previous: number;
    percentageChange: number;
  };
  totalCompletedProjects: {
    current: number;
    previous: number;
    percentageChange: number;
  };
  activeProjectsProgress: {
    projectId: string;
    name: string;
    alias: string;
    timeProgress: number;
    phaseProgress: number;
    totalPhases: number;
    currentPhase: number;
    startDate: string;
    endDate: string;
    pm: {
      _id: string;
      name: string;
    };
    customer: {
      _id: string;
      name: string;
    };
  }[];
  timeRange: {
    current: {
      start: string;
      end: string;
    };
    previous: {
      start: string;
      end: string;
    };
  };
}