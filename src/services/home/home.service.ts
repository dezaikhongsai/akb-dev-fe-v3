import api from '../../common/configs/axios.config';

export const autoSearchProject = async (query: string) => {
    try {
        const response = await api.get(`/project/auto-search?search=${query}`);
        return response.data;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Lỗi không xác định");
    }
}