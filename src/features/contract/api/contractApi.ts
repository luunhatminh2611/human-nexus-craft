import { api } from "../../../lib/axios";

export const contractApi = {
    // Lấy danh sách hợp đồng
    getAll: async () => {
        try {
            const response = await api.get("/contract");
            return response.data.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách hợp đồng:", error);
            throw error;
        }
    },

    // Lấy hợp đồng theo ID
    getById: async (id: number) => {
        try {
            const response = await api.get(`/contract/${id}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy hợp đồng theo ID:", error);
            throw error;
        }
    },

    // Lấy hợp đồng theo employee ID
    getByEmployeeId: async (employeeId: number) => {
        try {
            const response = await api.get(`/contract/employee/${employeeId}`);
            return response.data.data;
        } catch (error) {
            console.error("Lỗi khi lấy hợp đồng theo nhân viên:", error);
            throw error;
        }
    },

    // Tạo hợp đồng mới (với file đính kèm)
    create: async (data: any, file?: File) => {
        try {
            const formData = new FormData();
            
            // Thêm data dạng JSON string
            formData.append('data', new Blob([JSON.stringify(data)], {
                type: 'application/json'
            }));
            
            // Thêm file (bắt buộc khi tạo mới)
            if (file) {
                formData.append('file', file);
            }

            const response = await api.post("/contract", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi tạo hợp đồng:", error);
            throw error;
        }
    },

    // Cập nhật hợp đồng
    update: async (contractId: number, data: any, file?: File) => {
        try {
            const formData = new FormData();
            
            // Đảm bảo data object LUÔN có id
            const payloadWithId = {
                ...data,
                id: contractId
            };
            
            console.log('📤 Update request - contractId:', contractId);
            console.log('📤 Update request - data:', payloadWithId);
            console.log('📤 Update request - has file:', !!file);
            
            // Thêm data dạng JSON string
            formData.append('data', new Blob([JSON.stringify(payloadWithId)], {
                type: 'application/json'
            }));
            
            // CHỈ thêm file nếu có file mới
            if (file) {
                formData.append('file', file);
                console.log('📎 Uploading new file:', file.name);
            } else {
                console.log('⚠️ No new file - keeping existing file');
            }

            const response = await api.put(`/contract`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            console.log('✅ Update response:', response.data);
            console.log('📄 Response fileName:', response.data?.fileName);
            
            return response.data;
        } catch (error) {
            console.error("Lỗi khi cập nhật hợp đồng:", error);
            throw error;
        }
    },

    // Cập nhật danh sách hợp đồng
    updateList: async (contracts: any[]) => {
        try {
            const response = await api.put("/contract/update_list", contracts);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi cập nhật danh sách hợp đồng:", error);
            throw error;
        }
    },

    // Xóa hợp đồng
    delete: async (contractId: number) => {
        try {
            const response = await api.delete(`/contract/${contractId}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi xóa hợp đồng:", error);
            throw error;
        }
    },

    // Lọc hợp đồng
    filter: async (filterData: any) => {
        try {
            const response = await api.put("/contract/filter", filterData);
            return response.data.data;
        } catch (error) {
            console.error("Lỗi khi lọc hợp đồng:", error);
            throw error;
        }
    },

    // Import hợp đồng từ Excel
    import: async (file: File) => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post("/contract/import", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi import hợp đồng:", error);
            throw error;
        }
    },

    // Export hợp đồng ra Excel
    export: async (filterData?: any) => {
        try {
            const response = await api.post("/contract/export", filterData, {
                responseType: 'blob',
            });
            
            // Tạo URL để download file
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `contracts_${new Date().toISOString().split('T')[0]}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            return response.data;
        } catch (error) {
            console.error("Lỗi khi export hợp đồng:", error);
            throw error;
        }
    },
};