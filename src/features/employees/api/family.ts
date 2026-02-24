// import { api } from "../../../lib/axios";
import axios from "axios";
import type { AxiosRequestConfig } from "axios";

const apiClient = axios.create({
  baseURL: "https://118.71.208.17:1234",
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


export const familyApi = {
    getByEmployeeId: async (employeeId) => {
        try {
            const response = await api.get(`/family/employee/${employeeId}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách thân nhân:", error);
            throw error;
        }
    },

    // Lấy chi tiết thân nhân theo ID
    getById: async (employeeFamilyId) => {
        try {
            const response = await api.get(`/family/${employeeFamilyId}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy thông tin thân nhân:", error);
            throw error;
        }
    },

    // Tạo mới thân nhân
    create: async (data) => {
        try {
            const response = await api.post("/family", data);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi tạo thân nhân:", error);
            throw error;
        }
    },

    // Cập nhật thông tin thân nhân
    update: async (data) => {
        try {
            const response = await api.put("/family", data);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi cập nhật thân nhân:", error);
            throw error;
        }
    },

    // Xóa thân nhân
    delete: async (employeeFamilyId) => {
        try {
            const response = await api.delete(`/family/${employeeFamilyId}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi xóa thân nhân:", error);
            throw error;
        }
    },
};