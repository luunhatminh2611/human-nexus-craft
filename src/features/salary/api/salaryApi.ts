import apiClient from '@/lib/axios';
import type { SalaryStructure, PayrollHistory } from '../types';

export const salaryApi = {
  // Salary Structures
  getAllSalaryStructures: async (): Promise<SalaryStructure[]> => {
    const response = await apiClient.get<SalaryStructure[]>('/salary-structures');
    return response.data;
  },

  getSalaryStructureById: async (id: string): Promise<SalaryStructure> => {
    const response = await apiClient.get<SalaryStructure>(`/salary-structures/${id}`);
    return response.data;
  },

  createSalaryStructure: async (structure: Partial<SalaryStructure>): Promise<SalaryStructure> => {
    const response = await apiClient.post<SalaryStructure>('/salary-structures', structure);
    return response.data;
  },

  updateSalaryStructure: async (id: string, structure: Partial<SalaryStructure>): Promise<SalaryStructure> => {
    const response = await apiClient.put<SalaryStructure>(`/salary-structures/${id}`, structure);
    return response.data;
  },

  // Payroll History
  getPayrollHistory: async (employeeId?: string): Promise<PayrollHistory[]> => {
    const url = employeeId ? `/payroll?employeeId=${employeeId}` : '/payroll';
    const response = await apiClient.get<PayrollHistory[]>(url);
    return response.data;
  },

  getPayrollById: async (id: string): Promise<PayrollHistory> => {
    const response = await apiClient.get<PayrollHistory>(`/payroll/${id}`);
    return response.data;
  },

  generatePayroll: async (employeeId: string, month: string, year: number): Promise<PayrollHistory> => {
    const response = await apiClient.post<PayrollHistory>('/payroll/generate', { employeeId, month, year });
    return response.data;
  },
};

