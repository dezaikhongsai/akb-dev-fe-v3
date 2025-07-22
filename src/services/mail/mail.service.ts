import api from '../../common/configs/axios.config';

export const createEmailConfig = async (data: any) => {
    try {
        const response = await api.post('/mail/create-mail-config', data);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Lỗi không xác định")
    }
}

export const getEmailConfig = async () => {
    try {
        const response = await api.get('/mail/get-mail-config');
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Lỗi không xác định")
    }
}

export const updateEmailConfig = async (data: any) => {
    try {
        const response = await api.put('/mail/update-mail-config', data);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Lỗi không xác định")
    }
}

export const deleteEmailConfig = async () => {
    try {
        const response = await api.delete(`/mail/delete-mail-config`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Lỗi không xác định")
    }
}
