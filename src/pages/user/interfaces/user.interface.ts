export interface UserProfile {
    name: string;
    emailContact: string;
    phoneContact: string;
    dob?: string;
    companyName?: string;
    address?: string;
    note?: string;
  }
  
  export interface UpdatedByUser {
    profile: {
      name: string;
    };
    _id: string;
    email: string;
  }
  
  export interface User {
    profile?: UserProfile;
    _id?: string;
    email?: string;
    role?: 'admin' | 'customer' | 'pm';
    alias?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: UpdatedByUser;
    updatedBy?: UpdatedByUser;
  }
  
  export interface PaginationData {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
  
  export interface UserResponse {
    users: User[];
    pagination: PaginationData;
  }
  
  export interface UserStatistic {
    totalUser: number;
    totalActiveUser: number;
    totalInactiveUser: number;
    totalAdmin: number;
    totalCustomer: number;
    totalPM: number;
    percentActiveUser: number;
    percentInactiveUser: number;
    percentAdmin: number;
    percentCustomer: number;
    percentPM: number;
  }

  export interface IProjectStatistics {
    totalProjects: number;
    pendingProjects: number;
    processingProjects: number;
    completedProjects: number;
    percentPending: number;
    percentProcessing: number;
    percentCompleted: number;
  }

  export interface ICompletedProject {
    _id: string;
    name: string;
    alias: string;
    status: 'completed';
    startDate?: string;
    endDate?: string;
    createdAt: string;
    pm: {
      _id: string;
      alias: string;
      profile?: {
        name: string;
      };
    };
    customer: {
      _id: string;
      alias: string;
      profile?: {
        name: string;
      };
    };
  }

  export interface IUserProjectStatistic {
    user: {
      _id: string;
      alias: string;
      email: string;
      role: 'admin' | 'customer' | 'pm';
      profile?: {
        name: string;
        emailContact: string;
        phoneContact: string;
        companyName?: string;
        dob?: string;
        address?: string;
        note?: string;
      };
      createdBy?: {
        _id: string;
        email: string;
        profile?: {
          name: string;
        };
      };
      updatedBy?: {
        _id: string;
        email: string;
        profile?: {
          name: string;
        };
      };
    };
    projectStatistics: IProjectStatistics;
    completedProjectsList: ICompletedProject[];
  }

  export interface IStatisticUserProjectResponse {
    totalUsers: number;
    statistics: IUserProjectStatistic[];
  }