// ===== TYPES =====
export type JobType = 'UNDERGROUND' | 'HAZARDOUS' | 'OFFICE';
export type PPERole = 'EMPLOYEE' | 'MANAGER' | 'HR';
export type BatchStatus = 'DRAFT' | 'ISSUING' | 'COMPLETED';
export type BatchItemStatus = 'NOT_RECEIVED' | 'PARTIAL' | 'FULL';
export type ReplacementReason = 'BROKEN' | 'LOST';
export type ReplacementStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type HistoryType = 'ISSUE' | 'REPLACEMENT';

export interface PPEEmployee {
  id: number;
  name: string;
  jobType: JobType;
  department: string;
}

export interface PPEItemDef {
  id: number;
  name: string;
  jobTypes: JobType[];
  issueCycleMonths: number;
  quantityPerCycle: number;
}

export interface PPEHistory {
  id: number;
  employeeId: number;
  itemId: number;
  issueDate: string;
  expireDate: string;
  type: HistoryType;
}

export interface PPEBatch {
  id: number;
  department: string;
  createdDate: string;
  status: BatchStatus;
}

export interface PPEBatchItem {
  id: number;
  batchId: number;
  employeeId: number;
  itemId: number;
  requiredQuantity: number;
  receivedQuantity: number;
  status: BatchItemStatus;
}

export interface PPERequest {
  id: number;
  employeeId: number;
  itemId: number;
  reason: ReplacementReason;
  status: ReplacementStatus;
  createdAt: string;
  note?: string;
}

// ===== MOCK DATA =====
export const ppeEmployees: PPEEmployee[] = [
  { id: 1, name: 'Nguyễn Văn A', jobType: 'UNDERGROUND', department: 'Phân xưởng lò 1' },
  { id: 2, name: 'Trần Thị B', jobType: 'OFFICE', department: 'Phòng kế toán' },
  { id: 3, name: 'Lê Văn C', jobType: 'UNDERGROUND', department: 'Phân xưởng lò 1' },
  { id: 4, name: 'Phạm Thị D', jobType: 'HAZARDOUS', department: 'Phân xưởng cơ điện' },
  { id: 5, name: 'Hoàng Văn E', jobType: 'UNDERGROUND', department: 'Phân xưởng lò 2' },
];

export const ppeItemDefs: PPEItemDef[] = [
  { id: 1, name: 'Mũ bảo hộ', jobTypes: ['UNDERGROUND', 'HAZARDOUS'], issueCycleMonths: 12, quantityPerCycle: 1 },
  { id: 2, name: 'Giày bảo hộ', jobTypes: ['UNDERGROUND'], issueCycleMonths: 6, quantityPerCycle: 1 },
  { id: 3, name: 'Quần áo bảo hộ', jobTypes: ['UNDERGROUND'], issueCycleMonths: 6, quantityPerCycle: 2 },
  { id: 4, name: 'Kính bảo hộ', jobTypes: ['UNDERGROUND', 'HAZARDOUS'], issueCycleMonths: 12, quantityPerCycle: 1 },
  { id: 5, name: 'Găng tay chịu nhiệt', jobTypes: ['HAZARDOUS'], issueCycleMonths: 6, quantityPerCycle: 2 },
];

export const initialHistories: PPEHistory[] = [
  { id: 1, employeeId: 1, itemId: 2, issueDate: '2026-01-01', expireDate: '2026-07-01', type: 'ISSUE' },
  { id: 2, employeeId: 1, itemId: 1, issueDate: '2025-06-01', expireDate: '2026-06-01', type: 'ISSUE' },
  { id: 3, employeeId: 4, itemId: 5, issueDate: '2025-12-01', expireDate: '2026-06-01', type: 'ISSUE' },
];

export const initialBatches: PPEBatch[] = [
  { id: 1, department: 'Phân xưởng lò 1', createdDate: '2026-04-01', status: 'ISSUING' },
];

export const initialBatchItems: PPEBatchItem[] = [
  { id: 1, batchId: 1, employeeId: 1, itemId: 3, requiredQuantity: 2, receivedQuantity: 1, status: 'PARTIAL' },
  { id: 2, batchId: 1, employeeId: 3, itemId: 3, requiredQuantity: 2, receivedQuantity: 0, status: 'NOT_RECEIVED' },
  { id: 3, batchId: 1, employeeId: 3, itemId: 2, requiredQuantity: 1, receivedQuantity: 1, status: 'FULL' },
];

export const initialRequests: PPERequest[] = [
  { id: 1, employeeId: 1, itemId: 2, reason: 'BROKEN', status: 'PENDING', createdAt: '2026-04-01' },
];

// ===== RULE ENGINE =====
export function getLastHistory(histories: PPEHistory[], employeeId: number, itemId: number): PPEHistory | undefined {
  return histories
    .filter(h => h.employeeId === employeeId && h.itemId === itemId)
    .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())[0];
}

export function canIssue(histories: PPEHistory[], employeeId: number, itemId: number): boolean {
  const last = getLastHistory(histories, employeeId, itemId);
  if (!last) return true;
  return new Date() >= new Date(last.expireDate);
}

export function canRequestReplacement(histories: PPEHistory[], employeeId: number, itemId: number): { allowed: boolean; reason?: string } {
  const last = getLastHistory(histories, employeeId, itemId);
  if (!last) return { allowed: false, reason: 'Chưa được cấp vật tư này' };
  if (new Date() >= new Date(last.expireDate)) return { allowed: false, reason: 'Đã hết hạn, sẽ cấp theo đợt cấp phát' };
  return { allowed: true };
}

export function getBatchItemStatus(received: number, required: number): BatchItemStatus {
  if (received === 0) return 'NOT_RECEIVED';
  if (received < required) return 'PARTIAL';
  return 'FULL';
}

export function addMonths(date: string, months: number): string {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split('T')[0];
}

export function getEligibleItems(employee: PPEEmployee, items: PPEItemDef[]): PPEItemDef[] {
  return items.filter(i => i.jobTypes.includes(employee.jobType));
}

export const jobTypeLabels: Record<JobType, string> = {
  UNDERGROUND: 'Hầm lò',
  HAZARDOUS: 'Nặng nhọc',
  OFFICE: 'Văn phòng',
};

export const batchStatusLabels: Record<BatchStatus, string> = {
  DRAFT: 'Nháp',
  ISSUING: 'Đang cấp phát',
  COMPLETED: 'Hoàn thành',
};

export const batchItemStatusColors: Record<BatchItemStatus, string> = {
  NOT_RECEIVED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  PARTIAL: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  FULL: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
};

export const batchItemStatusLabels: Record<BatchItemStatus, string> = {
  NOT_RECEIVED: 'Chưa nhận',
  PARTIAL: 'Nhận một phần',
  FULL: 'Đã nhận đủ',
};

export const replacementStatusColors: Record<ReplacementStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export const replacementStatusLabels: Record<ReplacementStatus, string> = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
};

export const departments = [...new Set(ppeEmployees.map(e => e.department))];
