import api from '../../common/configs/axios.config';
import Cookies from 'js-cookie';

export const logout = async () => {
  try {
    const response = await api.post('/auth/logout');
    // Ensure cookies are cleared even if the server fails to clear them
    Cookies.remove('accessToken', { path: '/' });
    Cookies.remove('refreshToken', { path: '/' });
    return response.data;
  } catch (error: any) {
    // Still clear cookies on error
    Cookies.remove('accessToken', { path: '/' });
    Cookies.remove('refreshToken', { path: '/' });
    throw new Error(error.response?.data?.message || "Lỗi không xác định");
  }
};

export const login = async (email: string, password: string) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Lỗi không xác định");
  }
};

export const me = async () => {
  try {
    const response = await api.get(`/user/me/`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Lỗi không xác định");
  }
}