import { create } from 'zustand';
import type { SafetyItem, IssuedSafetyItem, SafetyReplacementRequest } from '../types';

interface SafetyState {
  safetyItems: SafetyItem[];
  issuedItems: IssuedSafetyItem[];
  replacementRequests: SafetyReplacementRequest[];
  selectedSafetyItem: SafetyItem | null;
  setSafetyItems: (items: SafetyItem[]) => void;
  setIssuedItems: (items: IssuedSafetyItem[]) => void;
  setReplacementRequests: (requests: SafetyReplacementRequest[]) => void;
  setSelectedSafetyItem: (item: SafetyItem | null) => void;
}

export const useSafetyStore = create<SafetyState>((set) => ({
  safetyItems: [],
  issuedItems: [],
  replacementRequests: [],
  selectedSafetyItem: null,
  setSafetyItems: (items) => set({ safetyItems: items }),
  setIssuedItems: (items) => set({ issuedItems: items }),
  setReplacementRequests: (requests) => set({ replacementRequests: requests }),
  setSelectedSafetyItem: (item) => set({ selectedSafetyItem: item }),
}));

