export interface WorkSchedule {
  id: string;
  employeeId: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  shift: string;
  startTime: string;
  endTime: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  fileName: string;
  uploadDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
export type LeaveRequestStatus = 'Pending' | 'Approved' | 'Rejected';

