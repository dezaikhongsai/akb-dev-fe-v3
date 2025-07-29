import api from '../../common/configs/axios.config';

export const downloadFile = async (fileId: string) => {
  const response = await api.get(`/document/download/${fileId}`);
  return response.data;
};

export const deleteFile = async (fileId: string) => {
  try {
    const response = await api.delete(`/document/delete-file/${fileId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
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

export const updateContent = async (contentId: string, formData: FormData) => {
  try {
    const response = await api.put(`/document/update-content/${contentId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
}

export const addContent = async (documentId: string, formData: FormData) => {
  try {
    const response = await api.post(`/document/add-content/${documentId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
}

export const addDocument = async ( formData: FormData) => {
  try {
    const response = await api.post(`/document/create`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
}

export const changeIsCompleted = async (documentId : string) => {
  try {
    const response = await api.patch(`/document/change-isCompleted/${documentId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
}

export const messageDocStatus = async (projectId : string) => {
  try {
    const response = await api.get(`/document/message-doc-status/${projectId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
}