import { api } from "../../../lib/axios";

export const transferApi = {
    getAll: async (params) => {
        try {
            const response = await api.get("/transfer", {
                page: params?.page,
                limit: params?.limit,
                department: params?.department,
                keyword: params?.keyword,
                status: params?.status,
            });
            return response.data.content;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách điều chuyển:", error);
            throw error;
        }
    },

    update: async (data: FormData | any) => {
        try {
            const isFormData = data instanceof FormData;
            const response = await api.put("/transfer", data, {
                headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi cập nhật yêu cầu điều chuyển:", error);
            throw error;
        }
    },

    create: async (data: FormData | any) => {
        try {
            const isFormData = data instanceof FormData;
            const response = await api.post("/transfer", data, {
                headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi tạo yêu cầu điều chuyển:", error);
            throw error;
        }
    },

    getById: async (transferEmployeeId) => {
        try {
            const response = await api.get(`/transfer/${transferEmployeeId}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy điều chuyển theo ID:", error);
            throw error;
        }
    },

    delete: async (transferEmployeeId) => {
        try {
            const response = await api.delete(`/transfer/${transferEmployeeId}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi xóa yêu cầu điều chuyển:", error);
            throw error;
        }
    },

    getMy: async (params) => {
        try {
            const response = await api.get("/transfer/my", {
                page: params?.page || 0,
                limit: params?.limit || 1000000,
                department: params?.department,
                keyword: params?.keyword,
                status: params?.status,
            });
            return response.data.content;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách điều chuyển của tôi:", error);
            throw error;
        }
    },

    getHistory: async (transferEmployeeId) => {
        try {
            const response = await api.get(`/transfer/history/${transferEmployeeId}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy lịch sử điều chuyển:", error);
            throw error;
        }
    },

    updateStatus: async (data) => {
        const response = await fetch('/api/transfer/history', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return await response.json();
    },

    getFileUrl: (fileName) => {
        if (!fileName) return null;
        return `${import.meta.env.VITE_API_BASE_URL}/file/${fileName}`;
    },
};