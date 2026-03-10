import { api, default as apiClient } from "../../../lib/axios";

export const certificateApi = {
    getAll: async () => {
        try {
            const response = await api.get("/certificate");
            return response.data.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách bằng cấp:", error);
            throw error;
        }
    },

    getById: async (id: number) => {
        try {
            const response = await api.get(`/certificate/${id}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy bằng cấp:", error);
            throw error;
        }
    },

    getByEmployeeId: async (employeeId: number) => {
        try {
            const response = await api.get(`/certificate/employee/${employeeId}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy bằng cấp theo nhân viên:", error);
            throw error;
        }
    },

    create: async (data: object, file?: File) => {
        try {
            const formData = new FormData();

            // ✅ Tạo File object với type application/json
            // Spring Boot đọc được content-type của từng part qua File object
            const jsonFile = new File(
                [JSON.stringify(data)],
                'data.json',
                { type: 'application/json' }
            );
            formData.append('data', jsonFile);

            if (file) {
                formData.append('file', file);
            }

            const response = await apiClient.post('/certificate', formData, {
                headers: { 'Content-Type': undefined },
            });
            return response.data;
        } catch (error) {
            console.error('Lỗi khi tạo bằng cấp:', error);
            throw error;
        }
    },

    update: async (data: object, file?: File) => {
        try {
            const formData = new FormData();

            const jsonFile = new File(
                [JSON.stringify(data)],
                'data.json',
                { type: 'application/json' }
            );
            formData.append('data', jsonFile);

            if (file) {
                formData.append('file', file);
            }

            const response = await apiClient.put('/certificate', formData, {
                headers: { 'Content-Type': undefined },
            });
            return response.data;
        } catch (error) {
            console.error('Lỗi khi cập nhật bằng cấp:', error);
            throw error;
        }
    },

    delete: async (id: number) => {
        try {
            const response = await api.delete(`/certificate/${id}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi xóa bằng cấp:", error);
            throw error;
        }
    },

    download: async (id: number) => {
        try {
            const response = await apiClient.get(`/certificate/${id}/download`, {
                responseType: "blob",
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi tải file bằng cấp:", error);
            throw error;
        }
    },
};