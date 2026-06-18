import axiosInstance from './axiosInstance';
import { AuthResponse, User } from '@/types/api';

export const authApi = {
  login: async (credentials: Record<string, string>): Promise<AuthResponse> => {
    console.log('Logging in with:', credentials);
    const response = await axiosInstance.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },
  
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
  },

  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
  },

  changePassword: async (passwords: Record<string, string>): Promise<void> => {
    await axiosInstance.post('/auth/change-password', passwords);
  },

  getUsers: async (): Promise<User[]> => {
    const response = await axiosInstance.get<User[]>('/auth/users');
    return response.data;
  },

  updateOtherUserPassword: async (userId: string, newPassword: string): Promise<void> => {
    await axiosInstance.patch(`/auth/users/${userId}/password`, { newPassword });
  },

  verify2FA: async (tempToken: string, code: string): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/verify-2fa', { tempToken, code });
    return response.data;
  }
};
