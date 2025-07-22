import api from '../../common/configs/axios.config';

export const downloadFile = async (fileId: string) => {
  const response = await api.get(`/document/download/${fileId}`);
  return response.data;
};

export const getDocumentByProjectId = async (projectId: string, query: {
  page?: number;
  limit?: number;
  type?: string;
  name?: string;
  sort?: string;
}) => {
  const response = await api.get(`/document/get-in-project/${projectId}`, {
    params: query
  });
  return response.data;
}; 

export const deleteContent = async (contentId : string) => {
  try {
    const response = await api.delete(`/document/delete-content/${contentId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
}

export const deleteDocument = async (documentId : string) => {
  try {
    const response = await api.delete(`/document/delete/${documentId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
}

export const updateContent = async (contentId : string, data : any) => {
  try {
    const response = await api.put(`/document/update-content/${contentId}`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
}

export const addContent = async (documentId : string, data : any) => {
  try {
    const response = await api.post(`/document/add-content/${documentId}`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
}

