import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios';
import Cookies from 'js-cookie';
import i18n from './i18n.config';
import { logout as logoutRedux } from '../stores/auth/authSlice';
import { store } from '../stores/store';

const isProd = import.meta.env.VITE_IS_PROD === 'true';
const getBaseURL = () => {
  const language = i18n.language || 'vi';
  return `${isProd ? import.meta.env.VITE_API_PROD : import.meta.env.VITE_API_BASE_URL}/${language}`;
};

// Create an Axios instance
const api: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
});

// Update baseURL when language changes
i18n.on('languageChanged', () => {
  api.defaults.baseURL = getBaseURL();
});

// Type for failed queue items
interface FailedQueueItem {
  resolve: (token: string) => void;
  reject: (err: AxiosError) => void;
}

// Flag to prevent multiple refresh calls
let isRefreshing = false;
let failedQueue: FailedQueueItem[] = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Helper function to handle logout
const handleLogout = () => {
  // Clear cookies
  Cookies.remove('accessToken', { path: '/' });
  Cookies.remove('refreshToken', { path: '/' });
  
  // Clear Redux store
  store.dispatch(logoutRedux());
  
  // Redirect to login
  window.location.href = '/login';
};

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = Cookies.get('accessToken');
    if (accessToken) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${accessToken}`,
      } as any;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor with refresh token logic
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;

    // Handle specific error cases
    if (status === 401) {
      // If we're already on login page, just return the error
      if (window.location.pathname === '/login') {
        return Promise.reject(error);
      }

      // If this is a logout request, handle it normally
      if (originalRequest.url?.includes('/auth/logout')) {
        handleLogout();
        return Promise.reject(error);
      }

      // Don't retry if we've already tried
      if (originalRequest._retry) {
        handleLogout();
        return Promise.reject(error);
      }

      // Handle refresh token
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers = {
                ...originalRequest.headers,
                Authorization: `Bearer ${token}`,
              } as any;
              resolve(api(originalRequest));
            },
            reject: (err: AxiosError) => reject(err),
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(
          `${getBaseURL()}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        const { accessToken } = refreshResponse.data.data || {};
        if (accessToken) {
          Cookies.set('accessToken', accessToken, {
            path: '/',
            secure: false, // Thay đổi từ true thành false cho localhost
            sameSite: 'lax' // Thay đổi từ 'strict' thành 'lax' cho localhost
          });
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${accessToken}`,
          } as any;
          processQueue(null, accessToken);
          return api(originalRequest);
        } else {
          throw new Error('No access token in refresh response');
        }
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
        handleLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    if (error.response) {
      switch (status) {
        case 403:
          console.error('Access forbidden');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          console.error('An error occurred:', error.message);
      }
    } else if (error.request) {
      console.error('Network error - no response received');
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;

