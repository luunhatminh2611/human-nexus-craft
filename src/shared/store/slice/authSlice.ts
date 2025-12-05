import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "../../../features/auth/api/authApi";

export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ username, password }: { username: string; password: string }) => {
    try {
      const response = await authService.login(username, password);
      return response;
    } catch (error: any) {
      throw new Error(error.message || "Đăng nhập thất bại");
    }
  }
);

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  try {
    await authService.logout();
    return null;
  } catch (error: any) {
    // Always logout locally even if API fails
    return null;
  }
});

export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async () => {
    try {
      const response = await authService.getCurrentUser();
      return response;
    } catch (error: any) {
      throw new Error(error.message || "Không thể lấy thông tin user");
    }
  }
);

// Simple initial state
const initialState = {
  user: null,
  token: localStorage.getItem("clinic_auth_token"),
  isAuthenticated: !!localStorage.getItem("clinic_auth_token"),
  loading: false,
  error: null,
};

export const checkAuth = createAsyncThunk("auth/checkAuth", async () => {
  const token = localStorage.getItem("clinic_auth_token");
  const userData = localStorage.getItem("clinic_user_data");

  if (!token || !userData) {
    throw new Error("No token or user data");
  }

  return {
    token,
    user: JSON.parse(userData),
  };
});

// Simple slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("clinic_auth_token");
      localStorage.removeItem("clinic_user_data");
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        localStorage.setItem("clinic_auth_token", action.payload.token);
        localStorage.setItem("clinic_user_data", JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Đăng nhập thất bại";
      })

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem("clinic_auth_token");
        localStorage.removeItem("clinic_user_data");
      })

      // Get Current User
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Không thể lấy thông tin user";
        // If get user fails, logout
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem("clinic_auth_token");
        localStorage.removeItem("clinic_user_data");
      })
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.isAuthenticated = false; // reset temporarily
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false;
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
        localStorage.removeItem("clinic_auth_token");
        localStorage.removeItem("clinic_user_data");
      })
      .addCase(logoutUser.rejected, (state) => {
        // Dù API fail, vẫn logout locally
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem("clinic_auth_token");
        localStorage.removeItem("clinic_user_data");
        localStorage.removeItem("refreshToken");
      })
},
});

export const { clearError, setUser, logout } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectAuth = (state: { auth: typeof initialState }) => state.auth;
export const selectUser = (state: { auth: typeof initialState }) =>
  state.auth.user;
export const selectIsAuthenticated = (state: { auth: typeof initialState }) =>
  state.auth.isAuthenticated;
