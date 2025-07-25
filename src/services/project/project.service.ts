import axiosInstance from "../../common/configs/axios.config";

export interface ProjectQueryParams {
  limit: number;
  page: number;
  search: string;
  status: string;
  sort: string;
  monthYearStart: string;
  monthYearEnd: string;
}

export const getProjects = async (params: ProjectQueryParams) => {
  return axiosInstance.get('/project/pagination', { params });
};

export const createProject = async (data: any) => {
  return axiosInstance.post('/project/create', data);
};

export const updateProject = async (id: string, data: any) => {
  return axiosInstance.patch(`/project/update/${id}`, data);
};

export const deleteProject = async (id: string) => {
  return axiosInstance.delete(`/project/delete/${id}`);
};

export interface ProjectStatisticParams {
  monthYearStart?: string;
  monthYearEnd?: string;
}

export const projectStatistics = async (params?: ProjectStatisticParams) => {
  return axiosInstance.get('/project/statistics', { params });
};

export const getProjectDetail = async (pId : string) => {
  try {
    const response = await axiosInstance.get(`/project/get-by-id/${pId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const activeProject = async (pId : string) => {
  try {
    const response = await axiosInstance.patch(`/project/active/${pId}`);
    return response.data;
  } catch (error : any) {
    throw new Error(error.response.data.message);
  }
}

