import { api } from "../../../lib/axios";
import { jwtDecode } from "jwt-decode";

const TOKEN_KEY = "clinic_auth_token";
const USER_KEY = "clinic_user_data";


interface DecodedToken {
  fullName: string;
  roles: string;
  userId: string;
  exp: number;
  iat: number;
}

export const authService = {
  register: async (data) => {
    try {
      const response = await api.post("/auth/register", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  login: async (username, password) => {
    try {
      const response = await api.post("/auth/login", { username, password });

      const { token, refreshToken } = response.data.data;
      const user = jwtDecode<DecodedToken>(token);
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(user));

      return { user, token: token };
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      const response = await api.put("/user/logout");
    } catch (error) {
      console.error("API Error:", error);
    } finally {
      console.log("Clearing localStorage...");
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem("refreshToken");
      localStorage.removeItem(USER_KEY);
      console.log("LocalStorage cleared");
    }
  },

  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      const response = await api.post("/Auth/refresh", { refreshToken });
      const { accessToken } = response.data;
      if (accessToken) localStorage.setItem(TOKEN_KEY, accessToken);
      return response;
    } catch (error) {
      throw error;
    }
  },

  getCurrentUser: () => {
    try {
      const userData = localStorage.getItem(USER_KEY);
      if (!userData) return null;
      return JSON.parse(userData);
    } catch {
      return null;
    }
  },

  getAccessToken: () => localStorage.getItem(TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem("refreshToken"),
  isAuthenticated: () => !!localStorage.getItem(TOKEN_KEY),

  forgotPassword: async (email: string) => {
    const response = await api.put(`/user/token-password?email=${encodeURIComponent(email)}`);
    return response.data;
  },

  resetPassword: async ({ email, token, password }) => {
    const response = await api.post("/user/reset-password", {
      email,
      token,
      password,
    });
    return response.data;
  },

  changePassword: async (password, newPassword) => {
    const response = await api.put("/user/password", {
      password,
      newPassword
    });
    return response.data;
  },

  getUserDetail: async () => {
    const token = localStorage.getItem("clinic_auth_token");
    try {
      const response = await api.get(`/users/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data?.data;
    } catch (error) {
      console.error("Lỗi khi xóa văn bản:", error);
      throw error;
    }
  },

  getUserRole: async (userId: number) => {
    try {
      const response = await api.get(`/userrole/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy role:", error);
      throw error;
    }
  },

  createUserRole: async (userId: number, roleId: number) => {
    try {
      const response = await api.post("/userrole", {
        userId,
        roleId,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tạo role:", error);
      throw error;
    }
  },

  updateUserRole: async (id: number, data: {
    id: number;
    userId: number;
    roleId: number;
    isActive: boolean;
    createdAt?: string;
    updatedAt: string;
    deleted: boolean;
  }) => {
    try {
      const response = await api.put(`/userrole/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi cập nhật role:", error);
      throw error;
    }
  },
};

export default authService;
