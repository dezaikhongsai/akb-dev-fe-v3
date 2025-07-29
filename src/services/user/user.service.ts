import  api  from '../../common/configs/axios.config';

export const getMe = async () => {
    try {
        const response = await api.get('/user/me');
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Lỗi không xác định");
    }
}

export const updateUserProfile = async (userId: string, data: any) => {
    try {
        const response = await api.patch(`/user/update/${userId}`, data);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Lỗi không xác định");
    }
}

export const getUser = async (limit: number, page: number , search: string , role: string , sort: string , isActive: boolean) => {
    try {
        const response = await api.get(`/user/pagination?limit=${limit}&page=${page}&search=${search}&role=${role}&sort=${sort}&isActive=${isActive}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Lỗi không xác định");
    }
}

export const createUser = async (data: any) => {
    try {
        const response = await api.post('/user/create', data);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Lỗi không xác định");
    }
}

export const deleteUser = async (userId: string) => {
    try {
        const response = await api.delete(`/user/delete/${userId}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Lỗi không xác định");
    }
}

export const getUserStatistic = async () => {
    try {
        const response = await api.get('/user/statistic');
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Lỗi không xác định");
    }
}

export const getUserStatisticProject = async (role?: string) => {
    try {
        const url = role ? `/user/statistic-project?role=${role}` : '/user/statistic-project';
        const response = await api.get(url);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Lỗi không xác định");
    }
}