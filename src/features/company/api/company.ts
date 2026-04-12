import api from '@/lib/axios';

export const companyApi = {
    getAll: async () => {
        const response = await api.get('/company');
        return response.data?.data ?? [];
    },

    getById: async (id: number) => {
        const response = await api.get(`/company/${id}`);
        return response.data;
    },

    create: async (data: {
        name: string;
        code: string;
        address?: string;
        phone?: string;
        email?: string;
    }) => {
        const response = await api.post('/company', {
            ...data,
            deleted: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
        return response.data;
    },

    update: async (data: {
        id: number;
        name: string;
        code: string;
        address?: string;
        phone?: string;
        email?: string;
    }) => {
        const response = await api.put('/company', {
            ...data,
            updatedAt: new Date().toISOString(),
        });
        return response.data;
    },

    delete: async (id: number) => {
        const response = await api.delete(`/company/${id}`);
        return response.data;
    },
};