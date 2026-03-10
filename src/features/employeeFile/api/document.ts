// api/employeeDocumentApi.ts

import { api } from "../../../lib/axios";

export interface EmployeeDocument {
  id: number;
  documentType: string;
  documentName: string;
  description: string;
  fileName: string;
  fileType: string;
  employeeId: number;
  downloadUrl: string;
}

export interface EmployeeDocumentPayload {
  documentType: string;
  documentName: string;
  description?: string | null;
}

export const employeeDocumentApi = {
  getAll: async (): Promise<EmployeeDocument[]> => {
    try {
      const response = await api.get("/employee-documents");
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách tài liệu:", error);
      throw error;
    }
  },

  getById: async (id: number): Promise<EmployeeDocument> => {
    try {
      const response = await api.get(`/employee-documents/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy thông tin tài liệu:", error);
      throw error;
    }
  },

  getByEmployeeId: async (employeeId: number): Promise<EmployeeDocument[]> => {
    try {
      const response = await api.get(`/employee-documents/employee/${employeeId}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách tài liệu theo nhân viên:", error);
      throw error;
    }
  },

  // employeeId truyền qua query param, file bắt buộc
  create: async (
    employeeId: number,
    data: EmployeeDocumentPayload,
    file: File
  ): Promise<EmployeeDocument> => {
    try {
      const formData = new FormData();
      formData.append("data", JSON.stringify(data));
      formData.append("file", file);
      const response = await api.post(
        `/employee-documents?employeeId=${employeeId}`,
        formData
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tạo tài liệu:", error);
      throw error;
    }
  },

  update: async (
    id: number,
    data: EmployeeDocumentPayload,
    file?: File
  ): Promise<EmployeeDocument> => {
    try {
      const formData = new FormData();
      formData.append("data", JSON.stringify(data));
      if (file) formData.append("file", file);
      const response = await api.put(`/employee-documents/${id}`, formData);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi cập nhật tài liệu:", error);
      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/employee-documents/${id}`);
    } catch (error) {
      console.error("Lỗi khi xóa tài liệu:", error);
      throw error;
    }
  },

  download: async (id: number): Promise<string> => {
    try {
      const response = await api.get(`/employee-documents/${id}/download`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tải file tài liệu:", error);
      throw error;
    }
  },
};