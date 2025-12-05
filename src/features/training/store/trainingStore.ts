import { create } from 'zustand';
import type { Training, TrainingEnrollment } from '../types';

interface TrainingState {
  trainings: Training[];
  enrollments: TrainingEnrollment[];
  selectedTraining: Training | null;
  setTrainings: (trainings: Training[]) => void;
  setEnrollments: (enrollments: TrainingEnrollment[]) => void;
  setSelectedTraining: (training: Training | null) => void;
  addTraining: (training: Training) => void;
  updateTraining: (id: string, training: Partial<Training>) => void;
  removeTraining: (id: string) => void;
}

export const useTrainingStore = create<TrainingState>((set) => ({
  trainings: [],
  enrollments: [],
  selectedTraining: null,
  setTrainings: (trainings) => set({ trainings }),
  setEnrollments: (enrollments) => set({ enrollments }),
  setSelectedTraining: (training) => set({ selectedTraining: training }),
  addTraining: (training) =>
    set((state) => ({ trainings: [...state.trainings, training] })),
  updateTraining: (id, updates) =>
    set((state) => ({
      trainings: state.trainings.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      selectedTraining: state.selectedTraining?.id === id ? { ...state.selectedTraining, ...updates } : state.selectedTraining,
    })),
  removeTraining: (id) =>
    set((state) => ({
      trainings: state.trainings.filter((t) => t.id !== id),
      selectedTraining: state.selectedTraining?.id === id ? null : state.selectedTraining,
    })),
}));

