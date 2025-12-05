import { api } from "../../../lib/axios";

export const leaveRequestApi = {
    // Lấy tất cả đơn nghỉ phép
    getAll: async () => {
        try {
            const response = await api.get("/leaves");
            return response.data.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách đơn nghỉ phép:", error);
            throw error;
        }
    },

    getById: async (id: number) => {
        try {
            const response = await api.get(`/leaves/${id}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy đơn nghỉ phép:", error);
            throw error;
        }
    },

    getByManagerId: async (managerId: number) => {
        try {
            const response = await api.get(`/leaves/manager/${managerId}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy đơn nghỉ phép:", error);
            throw error;
        }
    },

    create: async (data: {
        title: string;
        startDate: string;
        endDate: string;
        reason: string;
    }, file?: File) => {
        try {
            const formData = new FormData();

            // Tạo blob từ data object với Content-Type là application/json
            const dataBlob = new Blob([JSON.stringify({
                title: data.title,
                startDate: data.startDate,
                endDate: data.endDate,
                reason: data.reason,
            })], { type: 'application/json' });

            formData.append('data', dataBlob);

            // Thêm file nếu có
            if (file) {
                formData.append('file', file);
            }

            const response = await api.post("/leaves", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi tạo đơn nghỉ phép:", error);
            throw error;
        }
    },

    update: async (leaveId: number, data: {
        title: string;
        startDate: string;
        endDate: string;
        reason: string;
    }, file?: File) => {
        try {
            const formData = new FormData();

            const dataBlob = new Blob([JSON.stringify({
                title: data.title,
                startDate: data.startDate,
                endDate: data.endDate,
                reason: data.reason,
            })], { type: 'application/json' });

            formData.append('data', dataBlob);

            if (file) {
                formData.append('file', file);
            }

            // XÓA headers config, để browser tự set
            const response = await api.put(`/leaves/${leaveId}`, formData);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi cập nhật đơn nghỉ phép:", error);
            throw error;
        }
    },

    // Xóa đơn nghỉ phép
    delete: async (leaveId: number) => {
        try {
            const response = await api.delete(`/leaves/${leaveId}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi xóa đơn nghỉ phép:", error);
            throw error;
        }
    },

    // Cập nhật trạng thái đơn nghỉ phép
    updateStatus: async (leaveId: number, data: {
        status: "PENDING" | "APPROVED" | "REJECTED";
        comment?: string;
    }) => {
        try {
            const response = await api.put(`/leaves/${leaveId}/status`, {
                ...data,
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái đơn nghỉ phép:", error);
            throw error;
        }
    },

    getByUser: async (userId: number) => {
        try {
            const response = await api.get(`/leaves/user/${userId}`);
            return response.data.data; // tùy backend trả kiểu gì
        } catch (error) {
            console.error("Lỗi khi lấy đơn nghỉ phép theo user:", error);
            throw error;
        }
    },
};