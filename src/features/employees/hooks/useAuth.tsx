import { useAppSelector, useAppDispatch } from "../../../shared/store";
import {
  loginUser,
  logoutUser,
  getCurrentUser,
  logout,
  clearError,
  checkAuth,
} from "../../../shared/store/slice/authSlice";

export const useAuthStore = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  // Login function
  const login = async (username: string, password: string) => {
    try {
      const result = await dispatch(loginUser({ username, password })).unwrap();
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logoutAction = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      return { success: true };
    } catch (error: any) {
      // Even if API fails, logout locally
      dispatch(logout());
      return { success: true };
    }
  };

  // Get current user
  const refreshUser = async () => {
    try {
      const result = await dispatch(getCurrentUser()).unwrap();
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // Check auth from localStorage
  const checkAuthentication = () => {
    dispatch(checkAuth());
  };

  // Clear auth error
  const clearAuthError = () => {
    dispatch(clearError());
  };

  return {
    user: auth.user,
    token: auth.token,
    isAuthenticated: auth.isAuthenticated,
    loading: auth.loading,
    error: auth.error,

    // Actions
    login,
    logout: logoutAction,
    refreshUser,
    checkAuthentication,
    clearError: clearAuthError,
  };
};
