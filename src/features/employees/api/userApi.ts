import api from '@/lib/axios';
import type { Employee } from '../types';

export const userApi = {
  getAll: async () => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách user:", error);
      throw error;
    }
  },

  getById: async (id: number) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin user ${id}:`, error);
      throw error;
    }
  },

  getActive: async () => {
    try {
      const response = await api.get('/users/active');
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách user hoạt động:", error);
      throw error;
    }
  },

  // Cập nhật thông tin user
  update: async (id: number, data) => {
    try {
      const response = await api.put(`/users/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật user ${id}:`, error);
      throw error;
    }
  },

  // Kích hoạt user
  activate: async (id: number) => {
    try {
      const response = await api.put(`/users/${id}/active`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi kích hoạt user ${id}:`, error);
      throw error;
    }
  },

  // Vô hiệu hóa user
  deactivate: async (id: number) => {
    try {
      const response = await api.put(`/users/${id}/inactive`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi vô hiệu hóa user ${id}:`, error);
      throw error;
    }
  },

  // Toggle status (helper function)
  toggleStatus: async (id: number, currentStatus: 'Active' | 'Inactive') => {
    try {
      if (currentStatus === 'Active') {
        return await userApi.deactivate(id);
      } else {
        return await userApi.activate(id);
      }
    } catch (error) {
      console.error(`Lỗi khi thay đổi trạng thái user ${id}:`, error);
      throw error;
    }
  },
};