import axios, {AxiosError, InternalAxiosRequestConfig, AxiosRequestConfig} from 'axios';
import {getIdToken} from 'firebase/auth';
import {auth} from '@/libs/firebaseConfig';

export interface ApiResponse<T = unknown> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
  path: string;
  error?: string;
}

const axiosInstance = axios.create({
  withCredentials: true,
  headers: {'Content-Type': 'application/json'},
});

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

axiosInstance.interceptors.request.use(
  async (config) => {
    if (auth.currentUser) {
      try {
        const token = await getIdToken(auth.currentUser);
        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error('Error fetching token:', error);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;
    if (error.response?.status === 401 && auth.currentUser && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const freshToken = await getIdToken(auth.currentUser, true);
        await fetch('/api/auth/session', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({token: freshToken}),
        });
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${freshToken}`;
        }
        return axiosInstance(originalRequest);
      } catch (e) {
        await auth.signOut();
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  }
);

export const apiClient = {
  post: async <T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosInstance.post<ApiResponse<T>>(url, body, config);
    return response.data.data;
  },
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosInstance.get<ApiResponse<T>>(url, config);
    return response.data.data;
  },
  put: async <T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosInstance.put<ApiResponse<T>>(url, body, config);
    return response.data.data;
  },
  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosInstance.delete<ApiResponse<T>>(url, config);
    return response.data.data;
  },
  patch: async <T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosInstance.patch<ApiResponse<T>>(url, body, config);
    return response.data.data;
  },
};
