import { api } from "../../../lib/axios";

export const unitApi = {
  // Lấy tất cả đơn vị
  getAll: async () => {
    try {
      const response = await api.get("/department");
      console.log("Response data:", response);
      return response.data.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đơn vị:", error);
      throw error;
    }
  },

  // Lấy đơn vị theo ID
  getById: async (id) => {
    try {
      const response = await api.get(`/department/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy đơn vị:", error);
      throw error;
    }
  },

  // Tạo đơn vị mới
  create: async (data) => {
    try {
      const response = await api.post("/department", {
        ...data,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tạo đơn vị:", error);
      throw error;
    }
  },

  // Cập nhật đơn vị
  update: async (data) => {
    try {
      const response = await api.put(`/department`, {
        ...data,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi cập nhật đơn vị:", error);
      throw error;
    }
  },

  // Xóa đơn vị
  delete: async (id) => {
    try {
      const response = await api.delete(`/department/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi xóa đơn vị:", error);
      throw error;
    }
  },

  // Lấy đơn vị con theo parent_id
  getByParentId: async (parentId) => {
    try {
      const response = await api.get(`/department?parent_id=${parentId}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy đơn vị con:", error);
      throw error;
    }
  },

  filter: async (params) => {
    try {
      const requestBody = {
        pageSize: params.pageSize || 10,
        pageNumber: params.pageNumber || 1,
        sortField: params.sortField || "id",
        sortOder: params.sortOder || "asc",
        name: params.name || "",
        code: params.code || "",
      };

      const response = await api.put("/department/filter", requestBody);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi filter đơn vị:", error);
      throw error;
    }
  },
};