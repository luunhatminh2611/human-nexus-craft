// import { api } from "../../../lib/axios";
import axios from "axios";
import type { AxiosRequestConfig } from "axios";

const apiClient = axios.create({
    baseURL: "https://113.22.157.246:1234",
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("clinic_auth_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error("Request error:", error);
        return Promise.reject(error);
    }
);

interface CustomError extends Error {
    response?: any;
    status?: number;
    statusText?: string;
}

apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error("Response error:", error);

        // Handle specific HTTP status codes
        if (error.response?.status === 401) {
            // Token expired, redirect to login
            localStorage.removeItem("clinic_auth_token");
            localStorage.removeItem("clinic_user_data");
            // Optional: redirect to login page
            // window.location.href = '/login';
        }

        // Extract the most detailed error message
        let message = "Có lỗi xảy ra";

        if (error.response?.data) {
            // Try different possible message fields from backend
            if (typeof error.response.data === 'string') {
                message = error.response.data;
            } else if (error.response.data.Message) {
                message = error.response.data.Message;
            } else if (error.response.data.message) {
                message = error.response.data.message;
            } else if (error.response.data.error) {
                message = error.response.data.error;
            } else if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
                message = error.response.data.errors.join(', ');
            }
        } else if (error.message) {
            message = error.message;
        }


        // Trả về error message đơn giản
        message =
            error.response?.data?.message || error.message || "Có lỗi xảy ra";
        return Promise.reject(error);
    }
);

// Đơn giản hóa API methods
export const api = {
    // GET request
    get: async (url: string, params?: any, config?: any) => {
        try {
            return await apiClient.get(url, {
                params,
                ...config  // merge thêm config như headers
            });
        } catch (error) {
            throw error;
        }
    },

    // POST request
    post: async (url: string, data?: any, config: AxiosRequestConfig = {}) => {
        try {
            const isFormData = data instanceof FormData;

            const headers = isFormData
                ? { "Content-Type": "multipart/form-data" }
                : { "Content-Type": "application/json" };

            return await apiClient.post(url, data, {
                ...config,
                headers: {
                    ...headers,
                    ...(config.headers || {}),
                },
            });
        } catch (error) {
            throw error;
        }
    },

    // PUT request
    put: async (url: string, data?: any, config: AxiosRequestConfig = {}) => {
        try {
            const isFormData = data instanceof FormData;

            const headers = isFormData
                ? { "Content-Type": "multipart/form-data" }
                : { "Content-Type": "application/json" };

            return await apiClient.put(url, data, {
                ...config,
                headers: {
                    ...headers,
                    ...(config.headers || {}),
                },
            });
        } catch (error) {
            throw error;
        }
    },

    // DELETE request
    delete: async (url: string) => {
        try {
            return await apiClient.delete(url);
        } catch (error) {
            throw error;
        }
    },

    // PATCH request
    patch: async (url: string, data?: any) => {
        try {
            return await apiClient.patch(url, data);
        } catch (error) {
            throw error;
        }
    },
};

export default apiClient;

export interface EhrProfile {
    id?: string;
    bloodType?: string;
    lastCheckDate?: string;
    height?: number;
    weight?: number;
    allergy?: string;
    chronicDisease?: string;
    occupationalDisease?: string;
    medication?: string;
    healthClassification?: string;
    employeeId: number;
}

// Type definitions cho EHR Medical Checkup
export interface EhrCheckup {
    id?: string;
    employeeId?: number;
    checkupDate?: string;
    [key: string]: any; // Cho phép thêm các trường khác
}

/**
 * API cho EHR Profile
 */
export const ehrProfileApi = {
    /**
     * Cập nhật hồ sơ sức khỏe
     * PUT /api/ehr-profile
     */
    update: async (data: EhrProfile) => {
        try {
            const response = await api.put("/api/ehr-profile", data);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi cập nhật hồ sơ sức khỏe:", error);
            throw error;
        }
    },

    /**
     * Lấy hồ sơ sức khỏe theo Employee ID
     * GET /api/ehr-profile/employee/{employee-id}
     */
    getByEmployeeId: async (employeeId: number) => {
        try {
            const response = await api.get(`/api/ehr-profile/employee/${employeeId}`);
            return response;
        } catch (error) {
            console.error("Lỗi khi lấy hồ sơ sức khỏe:", error);
            throw error;
        }
    },
};

/**
 * API cho EHR Medical Checkup
 */
export const ehrCheckupApi = {
    /**
     * Cập nhật thông tin khám sức khỏe
     * PUT /ehr-checkup
     */
    create: async (formData: FormData) => {
        const res = await api.post('/ehr-checkup', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data;
    },

    update: async (formData: FormData) => {
        const res = await api.put('/ehr-checkup', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data;
    },

    getById: async (id: string | number) => {
        const res = await api.get(`/ehr-checkup/${id}`);
        return res.data;
    },

    /**
     * Xóa thông tin khám sức khỏe
     * DELETE /ehr-checkup/{ehr-checkup-id}
     */
    delete: async (ehrCheckupId: string) => {
        try {
            const response = await api.delete(`/ehr-checkup/${ehrCheckupId}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi xóa thông tin khám sức khỏe:", error);
            throw error;
        }
    },

    /**
     * Lấy danh sách khám sức khỏe theo Employee ID
     * GET /ehr-checkup/employee/{employeeId}
     */
    getByEmployeeId: async (employeeId: number) => {
        try {
            const response = await api.get(`/ehr-checkup/employee/${employeeId}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách khám sức khỏe:", error);
            throw error;
        }
    },
};

export const ehrApi = {
    profile: ehrProfileApi,
    checkup: ehrCheckupApi,
};