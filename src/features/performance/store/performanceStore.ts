import { create } from 'zustand';
import type { PerformanceReview, Goal } from '../types';

interface PerformanceState {
  performanceReviews: PerformanceReview[];
  goals: Goal[];
  selectedReview: PerformanceReview | null;
  setPerformanceReviews: (reviews: PerformanceReview[]) => void;
  setGoals: (goals: Goal[]) => void;
  setSelectedReview: (review: PerformanceReview | null) => void;
}

export const usePerformanceStore = create<PerformanceState>((set) => ({
  performanceReviews: [],
  goals: [],
  selectedReview: null,
  setPerformanceReviews: (reviews) => set({ performanceReviews: reviews }),
  setGoals: (goals) => set({ goals }),
  setSelectedReview: (review) => set({ selectedReview: review }),
}));

