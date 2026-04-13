import api from '@/lib/axios';

export const organizationApi = {
    getAll: async () => {
        const response = await api.get('/organizations');
        // BE trả về array thẳng (không wrap data)
        return Array.isArray(response.data) ? response.data : response.data?.data ?? [];
    },

    getById: async (id: number) => {
        const response = await api.get(`/organizations/${id}`);
        return response.data;
    },

    create: async (data: {
        name: string;
        code?: string;
    }) => {
        const response = await api.post('/organizations', data);
        return response.data;
    },

    update: async (data: {
        id: number;
        name: string;
        code?: string;
    }) => {
        const response = await api.put(`/organizations/${data.id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await api.delete(`/organizations/${id}`);
        return response.data;
    },
};