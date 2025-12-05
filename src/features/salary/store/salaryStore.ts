import { create } from 'zustand';
import type { SalaryStructure, PayrollHistory } from '../types';

interface SalaryState {
  salaryStructures: SalaryStructure[];
  payrollHistory: PayrollHistory[];
  selectedSalaryStructure: SalaryStructure | null;
  setSalaryStructures: (structures: SalaryStructure[]) => void;
  setPayrollHistory: (history: PayrollHistory[]) => void;
  setSelectedSalaryStructure: (structure: SalaryStructure | null) => void;
  addSalaryStructure: (structure: SalaryStructure) => void;
  updateSalaryStructure: (id: string, structure: Partial<SalaryStructure>) => void;
}

export const useSalaryStore = create<SalaryState>((set) => ({
  salaryStructures: [],
  payrollHistory: [],
  selectedSalaryStructure: null,
  setSalaryStructures: (structures) => set({ salaryStructures: structures }),
  setPayrollHistory: (history) => set({ payrollHistory: history }),
  setSelectedSalaryStructure: (structure) => set({ selectedSalaryStructure: structure }),
  addSalaryStructure: (structure) =>
    set((state) => ({ salaryStructures: [...state.salaryStructures, structure] })),
  updateSalaryStructure: (id, updates) =>
    set((state) => ({
      salaryStructures: state.salaryStructures.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
      selectedSalaryStructure:
        state.selectedSalaryStructure?.id === id
          ? { ...state.selectedSalaryStructure, ...updates }
          : state.selectedSalaryStructure,
    })),
}));

