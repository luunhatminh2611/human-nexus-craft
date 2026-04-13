import api from '@/lib/axios';

export const salaryScaleApi = {
    getAll: async () => {
        const response = await api.get('/salary-scales');
        return Array.isArray(response.data) ? response.data : response.data?.data ?? [];
    },

    getById: async (id: number) => {
        const response = await api.get(`/salary-scales/${id}`);
        return response.data;
    },

    create: async (data: { name: string; code?: string }) => {
        const response = await api.post('/salary-scales', data);
        return response.data;
    },

    update: async (data: { id: number; name: string; code?: string }) => {
        const response = await api.put(`/salary-scales/${data.id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await api.delete(`/salary-scales/${id}`);
        return response.data;
    },
};