import { api } from "@/lib/axios";

export interface TrainingLevel {
  id?: number;
  code: string;
  name: string;
  description?: string;
};

export const trainingLevelApi = {
  getAll: async () => {
    try {
      const response = await api.get("/training_level");
      return response.data.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách trình độ đào tạo:", error);
      throw error;
    }
  },
  createBulk: async (data: TrainingLevel[]) => {
    try {
      const response = await api.post("/training_level/batch-create", data);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tạo hàng loạt hệ đào tạo:", error);
      throw error;
    }
  },
  updateBulk: async (data: TrainingLevel[]) => {
    try {
      const response = await api.put("/training_level/batch-update", data);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi cập nhật hàng loạt trình độ đào tạo:", error);
      throw error;
    }
  },
  update: async (data: TrainingLevel) => {
    try {
      const response = await api.put(`/training_level`, data);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật trình độ đào tạo.`, error);
      throw error;
    }
  },
  delete: async (id: number) => {
    try {
      const response = await api.delete(`/training_level/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi xóa trình độ đào tạo có id ${id}.`, error);
      throw error;
    }
  } 
};
