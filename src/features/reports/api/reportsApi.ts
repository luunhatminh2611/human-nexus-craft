import apiClient from '@/lib/axios';

export interface ReportsData {
  totalEmployees: number;
  activeEmployees: number;
  newHires: number;
  onLeave: number;
  departmentsCount: number;
  trainingCompleted: number;
  upcomingTrainings: number;
}

export const reportsApi = {
  getDashboardData: async (): Promise<ReportsData> => {
    const response = await apiClient.get<ReportsData>('/reports/dashboard');
    return response.data;
  },

  getEmployeeReport: async (dateRange: { start: string; end: string }): Promise<any> => {
    const response = await apiClient.get('/reports/employees', { params: dateRange });
    return response.data;
  },

  getSalaryReport: async (month: string, year: number): Promise<any> => {
    const response = await apiClient.get('/reports/salary', { params: { month, year } });
    return response.data;
  },

  getTrainingReport: async (): Promise<any> => {
    const response = await apiClient.get('/reports/training');
    return response.data;
  },

  getAttendanceReport: async (dateRange: { start: string; end: string }): Promise<any> => {
    const response = await apiClient.get('/reports/attendance', { params: dateRange });
    return response.data;
  },
};

