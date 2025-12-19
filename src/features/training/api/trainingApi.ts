import { api } from "../../../lib/axios";

export const trainingApi = {
    getAll: async (params) => {
        try {
            const response = await api.get("/manager/training-courses", {
                pageSize: params?.pageSize,
                pageNumber: params?.pageNumber,
                sortField: params?.sortField,
                sortOrder: params?.sortOrder,
                departmentId: params?.departmentId,
                status: params?.status,
                keyword: params?.keyword,
            });
            return response.data.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách khóa đào tạo:", error);
            throw error;
        }
    },

    getAllAdmin: async (params) => {
        try {
            const response = await api.get("/admin/training-courses", {
                pageSize: params?.pageSize,
                pageNumber: params?.pageNumber,
                sortField: params?.sortField,
                sortOrder: params?.sortOrder,
                status: params?.status,
                keyword: params?.keyword,
            });
            return response.data.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách khóa đào tạo (Admin):", error);
            throw error;
        }
    },

    getEmployeeAssignments: async (params) => {
        try {
            const response = await api.get("/employee/training-assignments", {
                pageSize: params?.pageSize,
                pageNumber: params?.pageNumber,
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách khóa đào tạo được giao:", error);
            throw error;
        }
    },

    getEmployeeCoursesAdmin: async (employeeId) => {
        try {
            const response = await api.get(`/admin/training-courses/employee/${employeeId}`);
            return response.data.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách khóa đào tạo của nhân viên:", error);
            throw error;
        }
    },

    getById: async (id) => {
        try {
            const response = await api.get(`/manager/training-courses/${id}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết khóa đào tạo:", error);
            throw error;
        }
    },

    update: async (id, data) => {
        try {
            const response = await api.put(`/manager/training-courses/${id}`, data);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi cập nhật khóa đào tạo:", error);
            throw error;
        }
    },

    delete: async (id) => {
        try {
            const response = await api.delete(`/manager/training-courses/${id}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi xóa khóa đào tạo:", error);
            throw error;
        }
    },

    create: async (data) => {
        try {
            const response = await api.post("/manager/training-courses", data);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi tạo khóa đào tạo:", error);
            throw error;
        }
    },

    submitApproval: async (id) => {
        try {
            const response = await api.post(`/manager/training-courses/${id}/submit-approval`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi gửi yêu cầu phê duyệt khóa đào tạo:", error);
            throw error;
        }
    },

    assignEmployees: async (data) => {
        try {
            const response = await api.post("/manager/training-courses/assign/employees", data);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi phân công nhân viên vào khóa đào tạo:", error);
            throw error;
        }
    },

    getProgress: async (id) => {
        try {
            const response = await api.get(`/manager/training-courses/${id}/progress`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy tiến độ khóa đào tạo:", error);
            throw error;
        }
    },

    approveCourse: async (data) => {
        try {
            const response = await api.post("/admin/training-courses/approve", data);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi phê duyệt khóa đào tạo:", error);
            throw error;
        }
    },

    rejectCourse: async (data) => {
        try {
            const response = await api.post("/admin/training-courses/reject", data);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi từ chối khóa đào tạo:", error);
            throw error;
        }
    },

    startEmployeeAssignment: async (id) => {
        try {
            const response = await api.post(`/employee/training-assignments/${id}/start`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi bắt đầu khóa đào tạo:", error);
            throw error;
        }
    },

    // Hoàn thành khóa đào tạo
    completeEmployeeAssignment: async (id) => {
        try {
            const response = await api.post(`/employee/training-assignments/${id}/complete`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi hoàn thành khóa đào tạo:", error);
            throw error;
        }
    },

    getEmployeeAssignmentById: async (id) => {
        try {
            const response = await api.get(`/employee/training-assignments/${id}`);
            return response.data.data;
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết khóa đào tạo:", error);
            throw error;
        }
    },

    getEmployeesWithTrainingStatus: async (courseId, departmentId) => {
        try {
            const response = await api.get(
                `/manager/training-courses/${courseId}/departments/${departmentId}/employees`
            );
            return response.data;
        } catch (error) {
            console.error(
                "Lỗi khi lấy danh sách nhân viên theo trạng thái khóa đào tạo:",
                error
            );
            throw error;
        }
    },
};