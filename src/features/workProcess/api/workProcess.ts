import { api } from "@/lib/axios";

export const workProcessApi = {
    getAll: async (params) => {
        try {
            const response = await api.get("/work-process/employee-work-process/all", {
                page: params?.page,
                limit: params?.limit,
                department: params?.department,
                keyword: params?.keyword,
            });
            return response.data.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách quá trình công tác:", error);
            throw error;
        }
    },
    getById: async (id) => {
        try {
            const response = await api.get(`/work-process/employee-work-process/${id}`);
            return response.data.data;
        } catch (error) {
            console.error(`Lỗi khi lấy quá trình công tác với id ${id}:`, error);
            throw error;
        }
    },
    create: async (data) => {
        try {
            const response = await api.post("/work-process/employee-work-process/batch-create", data);
            return response.data.data;
        } catch (error) {
            console.error("Lỗi khi tạo quá trình công tác:", error);
            throw error;
        }
    },
    updateBulk: async (data) => {
        try {
            const response = await api.put(`/work-process/employee-work-process/batch-update`, data);
            return response.data.data;
        } catch (error) {
            console.error(`Lỗi khi cập nhật quá trình công tác với id ${data.id}:`, error);
            throw error;
        }
    },
    update: async (data) => {
        try {
            const response = await api.put(`/work-process/employee-work-process`, data);
            return response.data.data;
        } catch (error) {
            console.error(`Lỗi khi cập nhật quá trình công tác với id ${data.id}:`, error);
            throw error;
        }
    },
};