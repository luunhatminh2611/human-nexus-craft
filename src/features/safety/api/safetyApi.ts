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

    getRegistrationsByPlanId: async (planId: number) => {
        try {
            const response = await api.get(`/admin/ppe/registrations/plan/${planId}`);
            return response.data.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách đăng ký theo Plan ID:", error);
            throw error;
        }
    },

    // ========== MANAGER - PPE REGISTRATIONS ==========

    // Lấy danh sách đăng ký của manager
    getManagerRegistrations: async () => {
        try {
            const response = await api.get("/manager/ppe/registrations");
            return response.data.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách đăng ký của manager:", error);
            throw error;
        }
    },

    getRegistrationsByPlan: async (planId: number) => {
        try {
            const response = await api.get(`/manager/ppe/registrations/plan/${planId}`);
            return response.data.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách đăng ký theo kế hoạch:", error);
            throw error;
        }
    },

    // Tạo đăng ký bảo hộ mới
    createRegistration: async (data: {
        planId: number;
        notes: string;
        registrationDetails: Array<{
            ppeItemId: number;
            requestedQuantity: number;
        }>;
    }) => {
        try {
            const response = await api.post("/manager/ppe/registrations", data);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi tạo đăng ký bảo hộ:", error);
            throw error;
        }
    },

    // Cập nhật đăng ký bảo hộ
    updateRegistration: async (data: {
        id: number;
        notes: string;
    }) => {
        try {
            const response = await api.put("/manager/ppe/registrations", data);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi cập nhật đăng ký bảo hộ:", error);
            throw error;
        }
    },

    // Gửi đăng ký để phê duyệt
    submitRegistration: async (id: number) => {
        try {
            const response = await api.post(`/manager/ppe/registrations/${id}/submit`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi gửi đăng ký bảo hộ:", error);
            throw error;
        }
    },

    // Xác nhận đã nhận hàng
    confirmReceived: async (registrationId: number) => {
        try {
            const response = await api.post("/manager/ppe/registrations/confirm-received", {
                registrationId,
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi xác nhận đã nhận hàng:", error);
            throw error;
        }
    },

    // ========== MANAGER - PPE PLANS ==========

    // Lấy kế hoạch đang hoạt động theo năm
    getActivePlanByYear: async (year: number) => {
        try {
            const response = await api.get(`/manager/ppe/plans/active/${year}`);
            return response.data.data;
        } catch (error) {
            console.error("Lỗi khi lấy kế hoạch đang hoạt động:", error);
            throw error;
        }
    },

    // ========== MANAGER - PPE DISTRIBUTIONS ==========

    // Lấy danh sách phân phối
    getDistributions: async () => {
        try {
            const response = await api.get("/manager/ppe/distributions");
            return response.data.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách phân phối:", error);
            throw error;
        }
    },

    // Tạo phân phối bảo hộ cho nhân viên
    createDistribution: async (data: {
        employeeId: number;
        registrationId: number;
        items: Array<{
            ppeItemId: number;
            quantity: number;
        }>;
    }) => {
        try {
            const response = await api.post("/manager/ppe/distributions", data);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi tạo phân phối bảo hộ:", error);
            throw error;
        }
    },

    // Export danh sách phân phối theo phòng ban
    exportDistributions: async (departmentId: number) => {
        try {
            const response = await api.get(`/manager/ppe/distributions/export/${departmentId}`);
            return response.data.data;
        } catch (error) {
            console.error("Lỗi khi export danh sách phân phối:", error);
            throw error;
        }
    },

    getDistributionsByRegistration: async (registrationId: number) => {
        try {
            const response = await api.get(`/manager/ppe/distributions/${registrationId}`);
            return response.data.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách phân phối theo đơn đăng ký:", error);
            throw error;
        }
    },

    getMyDistributions: async () => {
        try {
            const response = await api.get("/employee/ppe/my-distributions");
            return response.data.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách phân phối của nhân viên:", error);
            throw error;
        }
    },

    // Lấy danh sách vật phẩm bảo hộ của nhân viên
    getMyPPEItems: async () => {
        try {
            const response = await api.get("/employee/ppe/my-ppe-items");
            return response.data.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách vật phẩm bảo hộ của nhân viên:", error);
            throw error;
        }
    },

    // Lấy lịch sử phân phối của nhân viên
    getDistributionHistory: async () => {
        try {
            const response = await api.get("/employee/ppe/distribution-history");
            return response.data.data;
        } catch (error) {
            console.error("Lỗi khi lấy lịch sử phân phối của nhân viên:", error);
            throw error;
        }
    },

    // Xác nhận nhận bảo hộ
    confirmReceipt: async (distributionItemId: number) => {
        try {
            const response = await api.post("/employee/ppe/confirm-receipt", {
                distributionItemId,
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi xác nhận nhận bảo hộ:", error);
            throw error;
        }
    },
};