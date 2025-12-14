import { api } from "../../../lib/axios";

export const ppeItemApi = {
    // Lấy tất cả danh mục đồ bảo hộ
    getAll: async () => {
        try {
            const response = await api.get("/admin/ppe-items");
            return response.data.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách đồ bảo hộ:", error);
            throw error;
        }
    },

    // Lấy chi tiết đồ bảo hộ theo ID
    getById: async (id: number | string) => {
        try {
            const response = await api.get(`/admin/ppe-items/${id}`);
            return response.data.data;
        } catch (error) {
            console.error("Lỗi khi lấy đồ bảo hộ theo ID:", error);
            throw error;
        }
    },

    // Tạo mới đồ bảo hộ
    create: async (data: {
        name: string;
        description?: string;
        size?: string;
    }) => {
        try {
            const response = await api.post("/admin/ppe-items", data);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi tạo đồ bảo hộ:", error);
            throw error;
        }
    },

    // Cập nhật đồ bảo hộ
    update: async (id: number | string, data: {
        name?: string;
        description?: string;
        size?: string;
    }) => {
        try {
            const response = await api.put(`/admin/ppe-items/${id}`, data);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi cập nhật đồ bảo hộ:", error);
            throw error;
        }
    },

    // Xóa đồ bảo hộ
    delete: async (id: number | string) => {
        try {
            const response = await api.delete(`/admin/ppe-items/${id}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi xóa đồ bảo hộ:", error);
            throw error;
        }
    },
};