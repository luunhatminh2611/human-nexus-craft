import api from '@/lib/axios';

export const religionApi = {
    getAll: async () => {
        const response = await api.get('/religion');
        return response.data?.data ?? [];
    },

    getById: async (id: number) => {
        const response = await api.get(`/religion/${id}`);
        return response.data;
    },

    create: async (data: {
        name: string;
        description?: string;
    }) => {
        const response = await api.post('/religion', {
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
        description?: string;
    }) => {
        const response = await api.put('/religion', {
            ...data,
            updatedAt: new Date().toISOString(),
        });
        return response.data;
    },

    delete: async (id: number) => {
        const response = await api.delete(`/religion/${id}`);
        return response.data;
    },
};