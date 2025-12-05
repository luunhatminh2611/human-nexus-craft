import apiClient from '@/lib/axios';
import type { SafetyItem, IssuedSafetyItem, SafetyReplacementRequest } from '../types';

export const safetyApi = {
  // Safety Items
  getAllSafetyItems: async (): Promise<SafetyItem[]> => {
    const response = await apiClient.get<SafetyItem[]>('/safety-items');
    return response.data;
  },

  getSafetyItemById: async (id: string): Promise<SafetyItem> => {
    const response = await apiClient.get<SafetyItem>(`/safety-items/${id}`);
    return response.data;
  },

  createSafetyItem: async (item: Partial<SafetyItem>): Promise<SafetyItem> => {
    const response = await apiClient.post<SafetyItem>('/safety-items', item);
    return response.data;
  },

  updateSafetyItem: async (id: string, item: Partial<SafetyItem>): Promise<SafetyItem> => {
    const response = await apiClient.put<SafetyItem>(`/safety-items/${id}`, item);
    return response.data;
  },

  // Issued Items
  getIssuedItemsByEmployee: async (employeeId: string): Promise<IssuedSafetyItem[]> => {
    const response = await apiClient.get<IssuedSafetyItem[]>(`/safety-items/issued?employeeId=${employeeId}`);
    return response.data;
  },

  issueSafetyItem: async (issue: Partial<IssuedSafetyItem>): Promise<IssuedSafetyItem> => {
    const response = await apiClient.post<IssuedSafetyItem>('/safety-items/issued', issue);
    return response.data;
  },

  replaceSafetyItem: async (id: string, replacedById: string): Promise<IssuedSafetyItem> => {
    const response = await apiClient.post<IssuedSafetyItem>(`/safety-items/issued/${id}/replace`, { replacedById });
    return response.data;
  },

  // Replacement Requests
  createReplacementRequest: async (request: Partial<SafetyReplacementRequest>): Promise<SafetyReplacementRequest> => {
    const response = await apiClient.post<SafetyReplacementRequest>('/safety-items/requests', request);
    return response.data;
  },

  approveReplacementRequest: async (id: string): Promise<SafetyReplacementRequest> => {
    const response = await apiClient.post<SafetyReplacementRequest>(`/safety-items/requests/${id}/approve`);
    return response.data;
  },
};

