// ============ TYPES ============
export type Role = 'EMPLOYEE' | 'MANAGER' | 'HR';

export type LeaveType = 'ANNUAL' | 'SOCIAL' | 'PERSONAL_PAID' | 'UNPAID';
export type LeaveSubType = 'SICK' | 'MATERNITY' | 'FUNERAL' | 'WEDDING' | 'CHILD_WEDDING';

export type LeaveStatus =
  | 'DRAFT'
  | 'PENDING_MANAGER'
  | 'REJECTED_MANAGER'
  | 'PENDING_HR'
  | 'REJECTED_HR'
  | 'APPROVED';

export type ApprovalFlow = 'MANAGER_ONLY' | 'MANAGER_HR' | 'HR_ONLY';

export interface WorkingTime {
  actualMonths: number;
  probationMonths: number;
  sickLeaveMonths: number;   // max 2 counted
  maternityMonths: number;
  unpaidLeaveMonths: number; // max 1 counted
  accidentMonths: number;
}

export type JobType = 'NORMAL' | 'HAZARDOUS' | 'UNDERGROUND';

export interface Employee {
  id: number;
  name: string;
  jobType: JobType;
  workingTime: WorkingTime;
  startDate: string; // ISO date
}

export interface EmergencyFlow {
  notifiedAt?: string;
  documentsDeadline?: string;
  isValid?: boolean;
}

export interface LeaveRequest {
  id: number;
  employeeId: number;
  type: LeaveType;
  subType?: LeaveSubType;
  days: number;
  status: LeaveStatus;
  approvalFlow: ApprovalFlow;
  isEmergency?: boolean;
  emergencyFlow?: EmergencyFlow;
  documents?: string[];
  flowNote?: string;
  reason?: string;
  rejectionReason?: string;
  startDate?: string;
  createdAt?: string;
  managerApprovedAt?: string;
  hrApprovedAt?: string;
  timeline?: { action: string; by: string; at: string; note?: string }[];
}

// ============ CONSTANTS ============
export const JOB_TYPE_BASE_LEAVE: Record<JobType, number> = {
  NORMAL: 12,
  HAZARDOUS: 14,
  UNDERGROUND: 16,
};

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  NORMAL: 'Bình thường',
  HAZARDOUS: 'Nặng nhọc, độc hại',
  UNDERGROUND: 'Đặc biệt nặng nhọc (hầm lò)',
};

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
  DRAFT: 'Nháp',
  PENDING_MANAGER: 'Chờ Quản lý duyệt',
  REJECTED_MANAGER: 'Quản lý từ chối',
  PENDING_HR: 'Chờ HR duyệt',
  REJECTED_HR: 'HR từ chối',
  APPROVED: 'Đã duyệt',
};

export const STATUS_STYLES: Record<LeaveStatus, string> = {
  DRAFT: 'bg-muted text-muted-foreground border-border',
  PENDING_MANAGER: 'bg-orange-100 text-orange-700 border-orange-200',
  REJECTED_MANAGER: 'bg-red-100 text-red-700 border-red-200',
  PENDING_HR: 'bg-blue-100 text-blue-700 border-blue-200',
  REJECTED_HR: 'bg-red-100 text-red-700 border-red-200',
  APPROVED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

export const APPROVAL_FLOW_MAP: Record<LeaveType, ApprovalFlow> = {
  ANNUAL: 'MANAGER_ONLY',
  PERSONAL_PAID: 'MANAGER_ONLY',
  UNPAID: 'MANAGER_HR',
  SOCIAL: 'HR_ONLY',
};

// ============ BUSINESS LOGIC ============

/** Calculate effective working months (TKV rules) */
export function calculateEffectiveMonths(wt: WorkingTime): number {
  return (
    wt.actualMonths +
    wt.probationMonths +
    Math.min(wt.sickLeaveMonths, 2) +
    wt.maternityMonths +
    Math.min(wt.unpaidLeaveMonths, 1) +
    wt.accidentMonths
  );
}

/** Calculate effective years worked from startDate */
export function calculateYearsWorked(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  return (now.getTime() - start.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
}

/** Calculate annual leave entitlement */
export function calculateAnnualLeave(jobType: JobType, yearsWorked: number): number {
  const base = JOB_TYPE_BASE_LEAVE[jobType];
  const seniorityBonus = Math.floor(yearsWorked / 5);
  return base + seniorityBonus;
}

/** Calculate leave balance for an employee */
export function calculateLeaveBalance(
  employee: Employee,
  requests: LeaveRequest[]
): {
  effectiveMonths: number;
  yearsWorked: number;
  baseDays: number;
  seniorityBonus: number;
  totalEntitled: number;
  usedAnnual: number;
  remaining: number;
  eligible: boolean;
  eligibilityExplanation?: string;
} {
  const effectiveMonths = calculateEffectiveMonths(employee.workingTime);
  const yearsWorked = calculateYearsWorked(employee.startDate);
  const baseDays = JOB_TYPE_BASE_LEAVE[employee.jobType];
  const seniorityBonus = Math.floor(yearsWorked / 5);
  const totalEntitled = baseDays + seniorityBonus;
  const eligible = effectiveMonths >= 12;

  // Count used annual leave (only APPROVED ANNUAL requests)
  const usedAnnual = requests
    .filter((r) => r.employeeId === employee.id && r.type === 'ANNUAL' && r.status === 'APPROVED')
    .reduce((sum, r) => sum + r.days, 0);

  const remaining = Math.max(0, totalEntitled - usedAnnual);

  let eligibilityExplanation: string | undefined;
  if (!eligible) {
    const wt = employee.workingTime;
    const lines: string[] = [];
    lines.push(`Thời gian thực tế: ${wt.actualMonths} tháng`);
    if (wt.probationMonths > 0) lines.push(`Thử việc: +${wt.probationMonths} tháng`);
    if (wt.sickLeaveMonths > 0) lines.push(`Nghỉ ốm: +${Math.min(wt.sickLeaveMonths, 2)} tháng (tối đa 2)`);
    if (wt.maternityMonths > 0) lines.push(`Thai sản: +${wt.maternityMonths} tháng`);
    if (wt.unpaidLeaveMonths > 0) lines.push(`Không lương: +${Math.min(wt.unpaidLeaveMonths, 1)} tháng (tối đa 1)`);
    if (wt.accidentMonths > 0) lines.push(`Tai nạn LĐ: +${wt.accidentMonths} tháng`);
    lines.push(`→ Tổng: ${effectiveMonths} tháng (cần ≥ 12)`);
    eligibilityExplanation = lines.join('\n');
  }

  return { effectiveMonths, yearsWorked, baseDays, seniorityBonus, totalEntitled, usedAnnual, remaining, eligible, eligibilityExplanation };
}

// ============ MOCK DATA ============
export const employees: Employee[] = [
  {
    id: 1,
    name: 'Nguyễn Văn A',
    jobType: 'UNDERGROUND',
    startDate: '2024-01-15',
    workingTime: {
      actualMonths: 14,
      probationMonths: 2,
      sickLeaveMonths: 1,
      maternityMonths: 0,
      unpaidLeaveMonths: 0,
      accidentMonths: 0,
    },
  },
  {
    id: 2,
    name: 'Trần Thị B',
    jobType: 'NORMAL',
    startDate: '2025-07-01',
    workingTime: {
      actualMonths: 5,
      probationMonths: 2,
      sickLeaveMonths: 0,
      maternityMonths: 0,
      unpaidLeaveMonths: 1,
      accidentMonths: 0,
    },
  },
];

export const initialLeaveRequests: LeaveRequest[] = [
  {
    id: 1,
    employeeId: 1,
    type: 'SOCIAL',
    subType: 'SICK',
    days: 5,
    status: 'PENDING_HR',
    approvalFlow: 'HR_ONLY',
    isEmergency: true,
    emergencyFlow: { notifiedAt: '2026-03-15T08:30:00', documentsDeadline: '2026-03-18', isValid: true },
    documents: ['giay_bac_si.pdf'],
    flowNote: 'Nghỉ ốm → HR duyệt trực tiếp',
    createdAt: '2026-03-15',
    startDate: '2026-03-15',
    timeline: [
      { action: 'Tạo đơn', by: 'Nguyễn Văn A', at: '2026-03-15 08:30', note: 'Nghỉ khẩn cấp — thông báo trong 2h' },
      { action: 'Gửi HR', by: 'Hệ thống', at: '2026-03-15 08:31', note: 'Auto-route: SOCIAL → HR_ONLY' },
    ],
  },
  {
    id: 2,
    employeeId: 2,
    type: 'ANNUAL',
    days: 3,
    status: 'REJECTED_MANAGER',
    approvalFlow: 'MANAGER_ONLY',
    rejectionReason: 'Nhân viên mới làm 8 tháng (chỉ tính 8 tháng hiệu lực). Cần ≥ 12 tháng để nghỉ phép năm.',
    flowNote: 'Từ chối: chưa đủ 12 tháng',
    createdAt: '2026-03-10',
    startDate: '2026-03-20',
    timeline: [
      { action: 'Tạo đơn', by: 'Trần Thị B', at: '2026-03-10 09:00' },
      { action: 'Gửi Quản lý', by: 'Trần Thị B', at: '2026-03-10 09:01' },
      { action: 'Từ chối', by: 'Quản lý', at: '2026-03-10 14:00', note: 'Chưa đủ 12 tháng hiệu lực' },
    ],
  },
  {
    id: 3,
    employeeId: 1,
    type: 'ANNUAL',
    days: 3,
    status: 'APPROVED',
    approvalFlow: 'MANAGER_ONLY',
    flowNote: 'Phép năm hợp lệ',
    createdAt: '2026-02-20',
    startDate: '2026-02-25',
    managerApprovedAt: '2026-02-21',
    timeline: [
      { action: 'Tạo đơn', by: 'Nguyễn Văn A', at: '2026-02-20 08:00' },
      { action: 'Gửi Quản lý', by: 'Nguyễn Văn A', at: '2026-02-20 08:01' },
      { action: 'Duyệt', by: 'Quản lý', at: '2026-02-21 10:00' },
    ],
  },
  {
    id: 4,
    employeeId: 1,
    type: 'PERSONAL_PAID',
    subType: 'FUNERAL',
    days: 3,
    status: 'APPROVED',
    approvalFlow: 'MANAGER_ONLY',
    flowNote: 'Tang lễ ông nội — 3 ngày cố định',
    createdAt: '2026-01-10',
    startDate: '2026-01-12',
    managerApprovedAt: '2026-01-10',
    timeline: [
      { action: 'Tạo đơn', by: 'Nguyễn Văn A', at: '2026-01-10 07:00' },
      { action: 'Duyệt', by: 'Quản lý', at: '2026-01-10 07:30' },
    ],
  },
  {
    id: 5,
    employeeId: 1,
    type: 'UNPAID',
    days: 10,
    status: 'PENDING_MANAGER',
    approvalFlow: 'MANAGER_HR',
    flowNote: 'Nghỉ không lương → Quản lý + HR',
    createdAt: '2026-03-25',
    startDate: '2026-04-01',
    timeline: [
      { action: 'Tạo đơn', by: 'Nguyễn Văn A', at: '2026-03-25 08:00' },
      { action: 'Gửi Quản lý', by: 'Nguyễn Văn A', at: '2026-03-25 08:01' },
    ],
  },
];

// ============ HELPERS ============
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
      tags.push({ label: 'Cần HR duyệt', color: 'bg-blue-100 text-blue-700' });
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

export function getApprovalFlowLabel(flow: ApprovalFlow): string {
  switch (flow) {
    case 'MANAGER_ONLY': return 'Quản lý duyệt';
    case 'MANAGER_HR': return 'Quản lý → HR';
    case 'HR_ONLY': return 'HR duyệt trực tiếp';
  }
}
