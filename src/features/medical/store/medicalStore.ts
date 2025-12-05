import { create } from 'zustand';
import type { MedicalRecord } from '../types';

interface MedicalState {
  medicalRecords: MedicalRecord[];
  selectedMedicalRecord: MedicalRecord | null;
  setMedicalRecords: (records: MedicalRecord[]) => void;
  setSelectedMedicalRecord: (record: MedicalRecord | null) => void;
  addMedicalRecord: (record: MedicalRecord) => void;
  updateMedicalRecord: (id: string, record: Partial<MedicalRecord>) => void;
}

export const useMedicalStore = create<MedicalState>((set) => ({
  medicalRecords: [],
  selectedMedicalRecord: null,
  setMedicalRecords: (records) => set({ medicalRecords: records }),
  setSelectedMedicalRecord: (record) => set({ selectedMedicalRecord: record }),
  addMedicalRecord: (record) =>
    set((state) => ({ medicalRecords: [...state.medicalRecords, record] })),
  updateMedicalRecord: (id, updates) =>
    set((state) => ({
      medicalRecords: state.medicalRecords.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
      selectedMedicalRecord:
        state.selectedMedicalRecord?.id === id
          ? { ...state.selectedMedicalRecord, ...updates }
          : state.selectedMedicalRecord,
    })),
}));

