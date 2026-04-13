import api from '@/lib/axios';
 
export const payrollApi = {
    getAll: async () => {
        const response = await api.get('/payrolls');
        return Array.isArray(response.data) ? response.data : response.data?.data ?? [];
    },
 
    getById: async (id: number) => {
        const response = await api.get(`/payrolls/${id}`);
        return response.data;
    },
 
    create: async (data: { name: string; code?: string }) => {
        const response = await api.post('/payrolls', data);
        return response.data;
    },
 
    update: async (data: { id: number; name: string; code?: string }) => {
        const response = await api.put(`/payrolls/${data.id}`, data);
        return response.data;
    },
 
    delete: async (id: number) => {
        const response = await api.delete(`/payrolls/${id}`);
        return response.data;
    },
};