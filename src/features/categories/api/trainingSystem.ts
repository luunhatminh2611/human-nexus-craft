import { api } from "@/lib/axios";

export interface TrainingSystem {
  id?: number;
  code: string;
  name: string;
  description?: string;
};

export const trainingSystemApi = {
  getAll: async () => {
    try {
      const response = await api.get("/training_system");
      return response.data.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách hệ đào tạo:", error);
      throw error;
    }
  },
  createBulk: async (data: TrainingSystem[]) => {
    try {
      const response = await api.post("/training_system/batch-create", data);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tạo hàng loạt hệ đào tạo:", error);
      throw error;
    }
  },
  updateBulk: async (data: TrainingSystem[]) => {
    try {
      const response = await api.put("/training_system/batch-update", data);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi cập nhật hàng loạt hệ đào tạo:", error);
      throw error;
    }
  },
  update: async (data: TrainingSystem) => {
    try {
      const response = await api.put(`/training_system`, data);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật hệ đào tạo.`, error);
      throw error;
    }
  },
  delete: async (id: number) => {
    try {
      const response = await api.delete(`/training_system/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi xóa hệ đào tạo có id ${id}.`, error);
      throw error;
    }
  } 
};
