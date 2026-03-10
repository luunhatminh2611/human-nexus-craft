import { api } from "../../../lib/axios";

export const employeeTravelApi = {
    getById: async (id) => {
        try {
            const response = await api.get(`/employee-travels/${id}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy thông tin xuất cảnh:", error);
            throw error;
        }
    },

    getByEmployeeId: async (employeeId) => {
        try {
            const response = await api.get(`/employee-travels/employee/${employeeId}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách xuất cảnh theo nhân viên:", error);
            throw error;
        }
    },

    create: async (data, file?) => {
        try {
            const formData = new FormData();
            formData.append("data", JSON.stringify(data));
            if (file) formData.append("file", file);
            const response = await api.post("/employee-travels", formData);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi tạo xuất cảnh:", error);
            throw error;
        }
    },

    update: async (id, data, file?) => {
        try {
            const formData = new FormData();
            formData.append("data", JSON.stringify(data));
            if (file) formData.append("file", file);
            const response = await api.put(`/employee-travels/${id}`, formData);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi cập nhật xuất cảnh:", error);
            throw error;
        }
    },

    delete: async (id) => {
        try {
            const response = await api.delete(`/employee-travels/${id}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi xóa xuất cảnh:", error);
            throw error;
        }
    },

    download: async (id) => {
        try {
            const response = await api.get(`/employee-travels/${id}/download`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi tải file xuất cảnh:", error);
            throw error;
        }
    },
};