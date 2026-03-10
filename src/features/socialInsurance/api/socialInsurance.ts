import { api } from "../../../lib/axios";

export const employeeSocialInsuranceApi = {
    getById: async (id) => {
        try {
            const response = await api.get(`/employee-social-insurances/${id}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy thông tin BHXH:", error);
            throw error;
        }
    },

    getByEmployeeId: async (employeeId) => {
        try {
            const response = await api.get(`/employee-social-insurances/employee/${employeeId}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách BHXH theo nhân viên:", error);
            throw error;
        }
    },

    create: async (data, file?) => {
        try {
            const formData = new FormData();
            formData.append("data", JSON.stringify(data));
            if (file) formData.append("file", file);
            const response = await api.post("/employee-social-insurances", formData);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi tạo BHXH:", error);
            throw error;
        }
    },

    update: async (id, data, file?) => {
        try {
            const formData = new FormData();
            formData.append("data", JSON.stringify(data));
            if (file) formData.append("file", file);
            const response = await api.put(`/employee-social-insurances/${id}`, formData);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi cập nhật BHXH:", error);
            throw error;
        }
    },

    delete: async (id) => {
        try {
            const response = await api.delete(`/employee-social-insurances/${id}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi xóa BHXH:", error);
            throw error;
        }
    },

    download: async (id) => {
        try {
            const response = await api.get(`/employee-social-insurances/${id}/download`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi tải file BHXH:", error);
            throw error;
        }
    },
};