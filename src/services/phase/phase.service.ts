import api from '../../common/configs/axios.config';

export const createManyPhase = async (data : any) => {
    try {
        const response = await api.post('/phase/create-many', data);
        return response.data;
    } catch (error : any) {
        throw new Error(error.response.data.message);
    }
}

export const createPhase = async (data : any) => {
    try {
        const response = await api.post('/phase/create', data);
        return response.data;
    } catch (error : any) {
        throw new Error(error.response.data.message);
    }
}

export const updatePhase = async (id : string , data : any) => {
    try {
        const response = await api.put(`/phase/update/${id}`, data);
        return response.data;
    } catch (error : any) {
        throw new Error(error.response.data.message);
    }
}

export const updateManyPhase = async (data : any) => {
    try {
        const response = await api.patch('/phase/update-many', data);
        return response.data;
    } catch (error : any) {
        throw new Error(error.response.data.message);
    }
}

export const deletePhase = async (id : string) => {
    try {
        const response = await api.delete(`/phase/delete/${id}`);
        return response.data;
    } catch (error : any) {
        throw new Error(error.response.data.message);
    }
}