import { create } from 'zustand';
import type { WorkSchedule, LeaveRequest } from '../types';

interface ScheduleState {
  workSchedules: WorkSchedule[];
  leaveRequests: LeaveRequest[];
  setWorkSchedules: (schedules: WorkSchedule[]) => void;
  setLeaveRequests: (requests: LeaveRequest[]) => void;
  addWorkSchedule: (schedule: WorkSchedule) => void;
  updateWorkSchedule: (id: string, schedule: Partial<WorkSchedule>) => void;
}

export const useScheduleStore = create<ScheduleState>((set) => ({
  workSchedules: [],
  leaveRequests: [],
  setWorkSchedules: (schedules) => set({ workSchedules: schedules }),
  setLeaveRequests: (requests) => set({ leaveRequests: requests }),
  addWorkSchedule: (schedule) =>
    set((state) => ({ workSchedules: [...state.workSchedules, schedule] })),
  updateWorkSchedule: (id, updates) =>
    set((state) => ({
      workSchedules: state.workSchedules.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    })),
}));

