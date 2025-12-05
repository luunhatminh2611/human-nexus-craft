import { create } from 'zustand';
import type { Department, JobTitle, Grade } from '../types';

interface DepartmentState {
  departments: Department[];
  jobTitles: JobTitle[];
  grades: Grade[];
  selectedDepartment: Department | null;
  setDepartments: (departments: Department[]) => void;
  setJobTitles: (jobTitles: JobTitle[]) => void;
  setGrades: (grades: Grade[]) => void;
  setSelectedDepartment: (department: Department | null) => void;
  addDepartment: (department: Department) => void;
  updateDepartment: (id: string, department: Partial<Department>) => void;
  removeDepartment: (id: string) => void;
}

export const useDepartmentStore = create<DepartmentState>((set) => ({
  departments: [],
  jobTitles: [],
  grades: [],
  selectedDepartment: null,
  setDepartments: (departments) => set({ departments }),
  setJobTitles: (jobTitles) => set({ jobTitles }),
  setGrades: (grades) => set({ grades }),
  setSelectedDepartment: (department) => set({ selectedDepartment: department }),
  addDepartment: (department) =>
    set((state) => ({ departments: [...state.departments, department] })),
  updateDepartment: (id, updates) =>
    set((state) => ({
      departments: state.departments.map((dept) =>
        dept.id === id ? { ...dept, ...updates } : dept
      ),
      selectedDepartment:
        state.selectedDepartment?.id === id
          ? { ...state.selectedDepartment, ...updates }
          : state.selectedDepartment,
    })),
  removeDepartment: (id) =>
    set((state) => ({
      departments: state.departments.filter((dept) => dept.id !== id),
      selectedDepartment: state.selectedDepartment?.id === id ? null : state.selectedDepartment,
    })),
}));

