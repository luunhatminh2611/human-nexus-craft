// ============ TYPES ============
export type Role = 'EMPLOYEE' | 'MANAGER' | 'HR';
export type LeaveType = 'ANNUAL' | 'SOCIAL' | 'PERSONAL_PAID' | 'UNPAID';
export type LeaveSubType = 'SICK' | 'MATERNITY' | 'FUNERAL' | 'WEDDING' | 'CHILD_WEDDING';
export type LeaveStatus = 'PENDING' | 'WAITING_HR' | 'APPROVED' | 'REJECTED';

export interface Employee {
  id: number;
  name: string;
  jobType: 'UNDERGROUND' | 'OFFICE' | 'HAZARDOUS' | 'NORMAL';
  workingMonths: number;
  yearsWorked: number;
  leaveBalance: {
    annual: number;
    used: number;
    remaining: number;
  };
}

export interface LeaveRequest {
  id: number;
  employeeId: number;
  type: LeaveType;
  subType?: LeaveSubType;
  days: number;
  status: LeaveStatus;
  isEmergency?: boolean;
  documents?: string[];
  flowNote?: string;
  reason?: string;
  startDate?: string;
  createdAt?: string;
}

// ============ MOCK DATA ============
export const employees: Employee[] = [
  {
    id: 1,
    name: 'Nguyễn Văn A',
    jobType: 'UNDERGROUND',
    workingMonths: 14,
    yearsWorked: 2,
    leaveBalance: { annual: 16, used: 5, remaining: 11 },
  },
  {
    id: 2,
    name: 'Trần Thị B',
    jobType: 'OFFICE',
    workingMonths: 8,
    yearsWorked: 0,
    leaveBalance: { annual: 0, used: 0, remaining: 0 },
  },
];

export const initialLeaveRequests: LeaveRequest[] = [
  {
    id: 1,
    employeeId: 1,
    type: 'SOCIAL',
    subType: 'SICK',
    days: 5,
    status: 'WAITING_HR',
    isEmergency: true,
    documents: ['file.pdf'],
    flowNote: 'Social leave flow',
    createdAt: '2026-03-15',
  },
  {
    id: 2,
    employeeId: 2,
    type: 'ANNUAL',
    days: 3,
    status: 'REJECTED',
    reason: 'Not enough 12 months',
    flowNote: 'Invalid annual leave',
    createdAt: '2026-03-10',
  },
  {
    id: 3,
    employeeId: 1,
    type: 'ANNUAL',
    days: 3,
    status: 'APPROVED',
    flowNote: 'Valid annual leave',
    createdAt: '2026-02-20',
  },
  {
    id: 4,
    employeeId: 1,
    type: 'PERSONAL_PAID',
    subType: 'FUNERAL',
    days: 3,
    status: 'APPROVED',
    flowNote: 'Paid personal leave',
    createdAt: '2026-01-10',
  },
  {
    id: 5,
    employeeId: 1,
    type: 'UNPAID',
    days: 10,
    status: 'PENDING',
    flowNote: 'Unpaid leave',
    createdAt: '2026-03-25',
  },
];

// ============ HELPERS ============
export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  ANNUAL: 'Nghỉ phép năm',
  SOCIAL: 'Nghỉ chế độ BHXH',
  PERSONAL_PAID: 'Nghỉ việc riêng (hưởng lương)',
  UNPAID: 'Nghỉ không lương',
};

export const LEAVE_SUBTYPE_LABELS: Record<LeaveSubType, string> = {
  SICK: 'Ốm đau',
  MATERNITY: 'Thai sản',
  FUNERAL: 'Tang lễ',
  WEDDING: 'Kết hôn',
  CHILD_WEDDING: 'Con kết hôn',
};

export const STATUS_LABELS: Record<LeaveStatus, string> = {
  PENDING: 'Chờ duyệt',
  WAITING_HR: 'Chờ HR duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
};

export function getEmployeeName(id: number): string {
  return employees.find((e) => e.id === id)?.name ?? 'N/A';
}

export function getLeaveTypeTags(type: LeaveType): { label: string; color: string }[] {
  const tags: { label: string; color: string }[] = [];
  switch (type) {
    case 'SOCIAL':
      tags.push({ label: 'Không trừ phép', color: 'bg-blue-100 text-blue-700' });
      tags.push({ label: 'Cần giấy tờ', color: 'bg-amber-100 text-amber-700' });
      break;
    case 'UNPAID':
      tags.push({ label: 'Ảnh hưởng lương', color: 'bg-red-100 text-red-700' });
      break;
    case 'PERSONAL_PAID':
      tags.push({ label: 'Ngày cố định', color: 'bg-emerald-100 text-emerald-700' });
      break;
    case 'ANNUAL':
      tags.push({ label: 'Trừ phép năm', color: 'bg-violet-100 text-violet-700' });
      break;
  }
  return tags;
}
