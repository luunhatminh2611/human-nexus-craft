import apiClient from '@/lib/axios';
import type { Training, TrainingEnrollment, TrainingFeedback } from '../types';

export const trainingApi = {
  // Trainings
  getAllTrainings: async (): Promise<Training[]> => {
    const response = await apiClient.get<Training[]>('/trainings');
    return response.data;
  },

  getTrainingById: async (id: string): Promise<Training> => {
    const response = await apiClient.get<Training>(`/trainings/${id}`);
    return response.data;
  },

  createTraining: async (training: Partial<Training>): Promise<Training> => {
    const response = await apiClient.post<Training>('/trainings', training);
    return response.data;
  },

  updateTraining: async (id: string, training: Partial<Training>): Promise<Training> => {
    const response = await apiClient.put<Training>(`/trainings/${id}`, training);
    return response.data;
  },

  deleteTraining: async (id: string): Promise<void> => {
    await apiClient.delete(`/trainings/${id}`);
  },

  // Enrollments
  getEnrollmentsByEmployee: async (employeeId: string): Promise<TrainingEnrollment[]> => {
    const response = await apiClient.get<TrainingEnrollment[]>(`/enrollments?employeeId=${employeeId}`);
    return response.data;
  },

  enrollEmployee: async (enrollment: Partial<TrainingEnrollment>): Promise<TrainingEnrollment> => {
    const response = await apiClient.post<TrainingEnrollment>('/enrollments', enrollment);
    return response.data;
  },

  updateEnrollment: async (id: string, enrollment: Partial<TrainingEnrollment>): Promise<TrainingEnrollment> => {
    const response = await apiClient.put<TrainingEnrollment>(`/enrollments/${id}`, enrollment);
    return response.data;
  },

  // Feedbacks
  submitFeedback: async (feedback: Partial<TrainingFeedback>): Promise<TrainingFeedback> => {
    const response = await apiClient.post<TrainingFeedback>('/feedbacks', feedback);
    return response.data;
  },
};

