import { api } from "../../../lib/axios";

export const workScheduleApi = {
    // Lấy danh sách lịch công tác (có phân trang hoặc không)
    getAll: async () => {
        try {
            const response = await api.get("/work_schedule", {
                pageSize: 1000000,
            });
            // Backend trả: data.data.data
            return response.data.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách lịch công tác:", error);
            throw error;
        }
    },

    // Lấy lịch công tác theo ID
    getById: async (id: number) => {
        try {
            const response = await api.get(`/work_schedule/${id}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy lịch công tác theo ID:", error);
            throw error;
        }
    },

    // Tạo lịch công tác
    create: async (data) => {
        try {
            const response = await api.post("/work_schedule", data);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi tạo lịch công tác:", error);
            throw error;
        }
    },

    // Cập nhật lịch công tác
    update: async (workScheduleId, data) => {
        try {
            const response = await api.put(`/work_schedule/${workScheduleId}`, {
                ...data,
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi cập nhật lịch công tác:", error);
            throw error;
        }
    },

    // Xóa lịch công tác
    delete: async (workScheduleId) => {
        try {
            const response = await api.delete(`/work_schedule/${workScheduleId}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi xóa lịch công tác:", error);
            throw error;
        }
    },

    // Cập nhật trạng thái lịch công tác
    updateStatus: async (workScheduleId: number, data: { status: string }) => {
        try {
            const response = await api.put(
                `/work_schedule/${workScheduleId}/status`,
                data
            );
            return response.data;
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái lịch công tác:", error);
            throw error;
        }
    },

    // Lấy lịch công tác theo user
    getByUser: async (employeeId: number) => {
        try {
            const response = await api.get(`/work_schedule/employee/${employeeId}`, {
                pageSize: 1000000,
            });
            return response.data.data.data; // tùy backend trả kiểu gì
        } catch (error) {
            console.error("Lỗi khi lấy lịch công tác theo user:", error);
            throw error;
        }
    },

    getByDepartment: async (departmentId: string | number) => {
        try {
            const response = await api.get(`/work_schedule/department/${departmentId}`, {
                pageSize: 1000000,
            });
            return response.data.data;
        } catch (error) {
            console.error("Lỗi khi lấy lịch công tác theo phòng ban:", error);
            throw error;
        }
    },

    confirm: async (id) => {
        try {
            const response = await api.post(`/work_schedule/${id}/confirm`);
            return response.data;
        } catch (error) {
            console.error("Lỗi xác nhận", error);
            throw error;
        }
    },
};
