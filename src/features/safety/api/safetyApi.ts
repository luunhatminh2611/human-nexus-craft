import { api } from "../../../lib/axios";

export const ppeApi = {
    // ========== PPE PLANS ==========
    
    // Lấy danh sách kế hoạch bảo hộ lao động
    getAllPlans: async () => {
        try {
            const response = await api.get("/admin/ppe/plans");
            return response.data.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách kế hoạch bảo hộ:", error);
            throw error;
        }
    },

    // Lấy kế hoạch bảo hộ theo ID
    getPlanById: async (id: number) => {
        try {
            const response = await api.get(`/admin/ppe/plans/${id}`);
            return response.data.data;
        } catch (error) {
            console.error("Lỗi khi lấy kế hoạch bảo hộ theo ID:", error);
            throw error;
        }
    },

    // Tạo kế hoạch bảo hộ mới
    createPlan: async (data: {
        year: number;
        notes: string;
        planDetails: Array<{
            ppeItemId: number;
            standardQuantity: number;
        }>;
    }) => {
        try {
            const response = await api.post("/admin/ppe/plans", data);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi tạo kế hoạch bảo hộ:", error);
            throw error;
        }
    },

    // Cập nhật kế hoạch bảo hộ
    updatePlan: async (data: {
        id: number;
        notes: string;
    }) => {
        try {
            const response = await api.put("/admin/ppe/plans", data);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi cập nhật kế hoạch bảo hộ:", error);
            throw error;
        }
    },

    // Đóng kế hoạch bảo hộ
    closePlan: async (id: number) => {
        try {
            const response = await api.put(`/admin/ppe/plans/${id}/close`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi đóng kế hoạch bảo hộ:", error);
            throw error;
        }
    },

    // ========== PPE REGISTRATIONS ==========

    // Lấy danh sách đăng ký bảo hộ
    getAllRegistrations: async () => {
        try {
            const response = await api.get("/admin/ppe/registrations");
            return response.data.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách đăng ký bảo hộ:", error);
            throw error;
        }
    },

    // Phê duyệt đăng ký bảo hộ
    approveRegistration: async (id: number, data: {
        id: number;
        reason: string;
    }) => {
        try {
            const response = await api.post(`/admin/ppe/registrations/${id}/approve`, data);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi phê duyệt đăng ký bảo hộ:", error);
            throw error;
        }
    },

    // Từ chối đăng ký bảo hộ
    rejectRegistration: async (id: number, data: {
        id: number;
        reason: string;
    }) => {
        try {
            const response = await api.post(`/admin/ppe/registrations/${id}/reject`, data);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi từ chối đăng ký bảo hộ:", error);
            throw error;
        }
    },
};