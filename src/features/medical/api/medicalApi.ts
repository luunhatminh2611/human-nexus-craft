import apiClient from '@/lib/axios';
import type { MedicalRecord } from '../types';

export const medicalApi = {
  getAllMedicalRecords: async (): Promise<MedicalRecord[]> => {
    const response = await apiClient.get<MedicalRecord[]>('/medical-records');
    return response.data;
  },

  getMedicalRecordById: async (id: string): Promise<MedicalRecord> => {
    const response = await apiClient.get<MedicalRecord>(`/medical-records/${id}`);
    return response.data;
  },

  getMedicalRecordByPatientId: async (patientId: string): Promise<MedicalRecord> => {
    const response = await apiClient.get<MedicalRecord>(`/medical-records/patient/${patientId}`);
    return response.data;
  },

  createMedicalRecord: async (record: Partial<MedicalRecord>): Promise<MedicalRecord> => {
    const response = await apiClient.post<MedicalRecord>('/medical-records', record);
    return response.data;
  },

  updateMedicalRecord: async (id: string, record: Partial<MedicalRecord>): Promise<MedicalRecord> => {
    const response = await apiClient.put<MedicalRecord>(`/medical-records/${id}`, record);
    return response.data;
  },

  approveMedicalRecord: async (id: string): Promise<MedicalRecord> => {
    const response = await apiClient.post<MedicalRecord>(`/medical-records/${id}/approve`);
    return response.data;
  },

  rejectMedicalRecord: async (id: string, reason: string): Promise<MedicalRecord> => {
    const response = await apiClient.post<MedicalRecord>(`/medical-records/${id}/reject`, { reason });
    return response.data;
  },
};

