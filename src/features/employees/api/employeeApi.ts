import api from '@/lib/axios';

export const employeeApi = {
  // Lấy danh sách tất cả nhân viên
  getAll: async () => {
    try {
      const response = await api.get('/employee');
      return response.data.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách nhân viên:", error);
      throw error;
    }
  },

  getProfile: async (userId: number) => {
    try {
      const response = await api.get(`/employee/profile/${userId}`);
      return response.data.data;
    } catch (error) {
      console.error(`Lỗi khi lấy profile nhân viên ${userId}:`, error);
      throw error;
    }
  },

  // Lấy thông tin nhân viên theo ID
  getById: async (id) => {
    try {
      const response = await api.get(`/employee/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin nhân viên ${id}:`, error);
      throw error;
    }
  },

  // Tạo nhân viên mới
  create: async (payload) => {
    try {
      const response = await api.post('/employee', payload);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tạo nhân viên:", error);
      throw error;
    }
  },

  // Cập nhật thông tin nhân viên
  update: async (id: number, payload) => {
    try {
      const response = await api.put(`/employee`, payload);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật nhân viên ${id}:`, error);
      throw error;
    }
  },

  // Xóa nhân viên (soft delete)
  delete: async (id: number) => {
    try {
      const response = await api.delete(`/employee/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi xóa nhân viên ${id}:`, error);
      throw error;
    }
  },

  // Tìm kiếm nhân viên theo mã hoặc tên
  search: async (query: string) => {
    try {
      const response = await api.get('/api/employee/search', {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tìm kiếm nhân viên:", error);
      throw error;
    }
  },

  // Lọc nhân viên theo phòng ban
  getByDepartment: async (departmentId) => {
    try {
      const response = await api.get(`/employee/${departmentId}`)
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy nhân viên theo phòng ban:", error);
      throw error;
    }
  },

  // Lọc nhân viên theo trạng thái
  getByStatus: async (status: 'Đang làm việc' | 'Nghỉ việc' | 'Tạm nghỉ') => {
    try {
      const response = await api.get('/api/employee', {
        params: { status }
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy nhân viên theo trạng thái:", error);
      throw error;
    }
  }
};

export default employeeApi;