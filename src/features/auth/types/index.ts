export type UserRole = 'Admin' | 'Manager' | 'Employee';

export interface AuthState {
  role: UserRole | null;
  employeeId: string | null;
  setRole: (role: UserRole, employeeId?: string) => void;
  logout: () => void;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: UserRole;
  employeeId: string;
}

