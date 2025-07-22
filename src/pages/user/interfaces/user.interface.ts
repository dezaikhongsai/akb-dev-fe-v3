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