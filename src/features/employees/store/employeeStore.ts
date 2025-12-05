import { create } from 'zustand';
import type { Employee } from '../types';

interface EmployeeState {
  employees: Employee[];
  selectedEmployee: Employee | null;
  setEmployees: (employees: Employee[]) => void;
  setSelectedEmployee: (employee: Employee | null) => void;
  addEmployee: (employee: Employee) => void;
  updateEmployee: (id: string, employee: Partial<Employee>) => void;
  removeEmployee: (id: string) => void;
}

export const useEmployeeStore = create<EmployeeState>((set) => ({
  employees: [],
  selectedEmployee: null,
  setEmployees: (employees) => set({ employees }),
  setSelectedEmployee: (employee) => set({ selectedEmployee: employee }),
  addEmployee: (employee) =>
    set((state) => ({ employees: [...state.employees, employee] })),
  updateEmployee: (id, updates) =>
    set((state) => ({
      employees: state.employees.map((emp) =>
        emp.id === id ? { ...emp, ...updates } : emp
      ),
      selectedEmployee:
        state.selectedEmployee?.id === id
          ? { ...state.selectedEmployee, ...updates }
          : state.selectedEmployee,
    })),
  removeEmployee: (id) =>
    set((state) => ({
      employees: state.employees.filter((emp) => emp.id !== id),
      selectedEmployee: state.selectedEmployee?.id === id ? null : state.selectedEmployee,
    })),
}));

