import apiClient from '@/lib/axios';

export interface EmployeeVisit {
    id: number;
    visitType: string;
    visitDate: string;
    visitedPerson: string;
    relationship: string;
    reason: string;
    giftAmount: number;
    giftDescription: string;
    representative: string;
    status: string;
    note: string;
    employeeId: number;
}

export type EmployeeVisitPayload = Omit<EmployeeVisit, 'id'>;

export const employeeVisitApi = {
    getById: async (id: number): Promise<EmployeeVisit> => {
        const res = await apiClient.get(`/employee-visits/${id}`);
        return res.data;
    },

    getByEmployee: async (employeeId: number): Promise<EmployeeVisit[]> => {
        const res = await apiClient.get(`/employee-visits/employee/${employeeId}`);
        return res.data;
    },

    getByEmployeeAndStatus: async (employeeId: number, status: string): Promise<EmployeeVisit[]> => {
        const res = await apiClient.get(`/employee-visits/employee/${employeeId}/status/${status}`);
        return res.data;
    },

    create: async (data: EmployeeVisitPayload): Promise<EmployeeVisit> => {
        const res = await apiClient.post('/employee-visits', data);
        return res.data;
    },

    update: async (id: number, data: EmployeeVisitPayload): Promise<EmployeeVisit> => {
        const res = await apiClient.put(`/employee-visits/${id}`, data);
        return res.data;
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/employee-visits/${id}`);
    },
};