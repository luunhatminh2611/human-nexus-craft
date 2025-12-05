// src/features/roles/api/userRoleApi.ts
import api from '@/lib/axios';

export const userRoleApi = {
  // Lấy roles của một user
  getUserRoles: async (userId) => {
    const response = await api.get(
      `/userrole?userId=${userId}`
    );
    return response.data;
  },

  // Tạo user role mới
  createUserRole: async (data) => {
    const response = await api.post('/userrole', {
      ...data,
      isActive: data.isActive ?? true,
      deleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return response.data;
  },

  // Cập nhật user role
  updateUserRole: async (
    id: number, 
    data
  ) => {
    const response = await api.put(
      `/userrole/${id}`,
      {
        ...data,
        updatedAt: new Date().toISOString(),
      }
    );
    return response.data;
  },

  // Xóa user role
  deleteUserRole: async (id: number) => {
    const response = await api.delete(
      `/userrole/${id}`
    );
    return response.data;
  },
};