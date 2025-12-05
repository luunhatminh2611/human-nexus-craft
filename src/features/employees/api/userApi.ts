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

  getById: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  create: async (employee: Partial<Employee>): Promise<Employee> => {
    const response = await api.post<Employee>('/employees', employee);
    return response.data;
  },

  update: async (id: string, employee: Partial<Employee>): Promise<Employee> => {
    const response = await api.put<Employee>(`/employees/${id}`, employee);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/employees/${id}`);
  },

  getByDepartment: async (departmentId: string): Promise<Employee[]> => {
    const response = await api.get<Employee[]>(`/employees?departmentId=${departmentId}`);
    return response.data;
  },
};

