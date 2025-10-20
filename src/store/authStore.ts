import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'Admin' | 'Manager' | 'Employee';

interface AuthState {
  role: UserRole | null;
  employeeId: string | null;
  setRole: (role: UserRole, employeeId?: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      role: null,
      employeeId: null,
      setRole: (role, employeeId) => set({ role, employeeId: employeeId || null }),
      logout: () => set({ role: null, employeeId: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
