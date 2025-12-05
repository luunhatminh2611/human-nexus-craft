import apiClient from '@/lib/axios';
import type { PerformanceReview, Goal } from '../types';

export const performanceApi = {
  // Performance Reviews
  getPerformanceReviews: async (employeeId?: string): Promise<PerformanceReview[]> => {
    const url = employeeId ? `/performance-reviews?employeeId=${employeeId}` : '/performance-reviews';
    const response = await apiClient.get<PerformanceReview[]>(url);
    return response.data;
  },

  getPerformanceReviewById: async (id: string): Promise<PerformanceReview> => {
    const response = await apiClient.get<PerformanceReview>(`/performance-reviews/${id}`);
    return response.data;
  },

  createPerformanceReview: async (review: Partial<PerformanceReview>): Promise<PerformanceReview> => {
    const response = await apiClient.post<PerformanceReview>('/performance-reviews', review);
    return response.data;
  },

  updatePerformanceReview: async (id: string, review: Partial<PerformanceReview>): Promise<PerformanceReview> => {
    const response = await apiClient.put<PerformanceReview>(`/performance-reviews/${id}`, review);
    return response.data;
  },

  submitSelfAssessment: async (id: string, assessment: any): Promise<PerformanceReview> => {
    const response = await apiClient.post<PerformanceReview>(`/performance-reviews/${id}/self-assessment`, assessment);
    return response.data;
  },

  // Goals
  getGoals: async (employeeId?: string): Promise<Goal[]> => {
    const url = employeeId ? `/goals?employeeId=${employeeId}` : '/goals';
    const response = await apiClient.get<Goal[]>(url);
    return response.data;
  },

  createGoal: async (goal: Partial<Goal>): Promise<Goal> => {
    const response = await apiClient.post<Goal>('/goals', goal);
    return response.data;
  },

  updateGoal: async (id: string, goal: Partial<Goal>): Promise<Goal> => {
    const response = await apiClient.put<Goal>(`/goals/${id}`, goal);
    return response.data;
  },
};

