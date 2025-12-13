import { api } from "../../../lib/axios";

export const departmentTypeApi = {
  // Lấy tất cả loại phòng ban
  getAll: async () => {
    try {
      const response = await api.get("/department-types");
      console.log("Response data:", response);
      return response.data.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách loại phòng ban:", error);
      throw error;
    }
  },

  // Lấy loại phòng ban theo ID
  getById: async (id: number) => {
    try {
      const response = await api.get(`/department-types/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy loại phòng ban:", error);
      throw error;
    }
  },

  // Tạo loại phòng ban mới
  create: async (data: {
    code: string;
    name: string;
    description?: string;
    isActive?: boolean;
  }) => {
    try {
      const response = await api.post("/department-types", {
        ...data,
        isActive: data.isActive !== undefined ? data.isActive : true,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tạo loại phòng ban:", error);
      throw error;
    }
  },

  // Cập nhật loại phòng ban
  update: async (id: number, data: {
    code: string;
    name: string;
    description?: string;
    isActive?: boolean;
  }) => {
    try {
      const response = await api.put(`/department-types/${id}`, {
        ...data,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi cập nhật loại phòng ban:", error);
      throw error;
    }
  },

  // Xóa loại phòng ban
  delete: async (id: number) => {
    try {
      const response = await api.delete(`/department-types/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi xóa loại phòng ban:", error);
      throw error;
    }
  },
};