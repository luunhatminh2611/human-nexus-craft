import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, UserRole } from '../types';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      role: null,
      employeeId: null,
      setRole: (role: UserRole, employeeId?: string) => set({ role, employeeId: employeeId || null }),
      logout: () => set({ role: null, employeeId: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
