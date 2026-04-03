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

// Item definition (generic, no quantity/cycle here)
export interface PPEItemDef {
  id: number;
  name: string;
}

// ===== FIX #1: PPENorm — separate norm table =====
export interface PPENorm {
  id: number;
  jobType: JobType;
  itemId: number;
  quantity: number;
  cycleMonths: number;
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
  isRecorded: boolean; // FIX #4: track if history was created
  source: 'BATCH' | 'REPLACEMENT'; // FIX #5: replacement also goes through batch
}

// ===== FIX #7: Receive Log =====
export interface PPEReceiveLog {
  id: number;
  batchItemId: number;
  quantity: number;
  date: string;
}

export interface PPERequest {
  id: number;
  employeeId: number;
  itemId: number;
  reason: ReplacementReason;
  status: ReplacementStatus;
  createdAt: string;
  note?: string;
  linkedBatchItemId?: number; // FIX #5: link to batch item
}

// ===== MOCK DATA =====
export const ppeEmployees: PPEEmployee[] = [
  { id: 1, name: 'Nguyễn Văn A', jobType: 'UNDERGROUND', department: 'Phân xưởng lò 1' },
  { id: 2, name: 'Trần Thị B', jobType: 'OFFICE', department: 'Phòng kế toán' },
  { id: 3, name: 'Lê Văn C', jobType: 'UNDERGROUND', department: 'Phân xưởng lò 1' },
  { id: 4, name: 'Phạm Thị D', jobType: 'HAZARDOUS', department: 'Phân xưởng cơ điện' },
  { id: 5, name: 'Hoàng Văn E', jobType: 'UNDERGROUND', department: 'Phân xưởng lò 2' },
];

// Items are now generic — no jobTypes/cycle here
export const ppeItemDefs: PPEItemDef[] = [
  { id: 1, name: 'Mũ bảo hộ' },
  { id: 2, name: 'Giày bảo hộ' },
  { id: 3, name: 'Quần áo bảo hộ' },
  { id: 4, name: 'Kính bảo hộ' },
  { id: 5, name: 'Găng tay chịu nhiệt' },
];

// FIX #1: Norm table — defines quantity & cycle per jobType + item
export const ppeNorms: PPENorm[] = [
  { id: 1, jobType: 'UNDERGROUND', itemId: 1, quantity: 1, cycleMonths: 12 },
  { id: 2, jobType: 'UNDERGROUND', itemId: 2, quantity: 1, cycleMonths: 6 },
  { id: 3, jobType: 'UNDERGROUND', itemId: 3, quantity: 2, cycleMonths: 6 },
  { id: 4, jobType: 'UNDERGROUND', itemId: 4, quantity: 1, cycleMonths: 12 },
  { id: 5, jobType: 'HAZARDOUS', itemId: 1, quantity: 1, cycleMonths: 12 },
  { id: 6, jobType: 'HAZARDOUS', itemId: 4, quantity: 1, cycleMonths: 12 },
  { id: 7, jobType: 'HAZARDOUS', itemId: 5, quantity: 2, cycleMonths: 6 },
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
  { id: 1, batchId: 1, employeeId: 1, itemId: 3, requiredQuantity: 2, receivedQuantity: 1, status: 'PARTIAL', isRecorded: false, source: 'BATCH' },
  { id: 2, batchId: 1, employeeId: 3, itemId: 3, requiredQuantity: 2, receivedQuantity: 0, status: 'NOT_RECEIVED', isRecorded: false, source: 'BATCH' },
  { id: 3, batchId: 1, employeeId: 3, itemId: 2, requiredQuantity: 1, receivedQuantity: 1, status: 'FULL', isRecorded: false, source: 'BATCH' },
];

export const initialReceiveLogs: PPEReceiveLog[] = [
  { id: 1, batchItemId: 1, quantity: 1, date: '2026-04-02' },
  { id: 2, batchItemId: 3, quantity: 1, date: '2026-04-02' },
];

export const initialRequests: PPERequest[] = [
  { id: 1, employeeId: 1, itemId: 2, reason: 'BROKEN', status: 'PENDING', createdAt: '2026-04-01' },
];

// ===== RULE ENGINE =====

// FIX #6: threshold days before expiry (allow issuance 15 days early)
export const ISSUE_THRESHOLD_DAYS = 15;

export function getLastHistory(histories: PPEHistory[], employeeId: number, itemId: number): PPEHistory | undefined {
  return histories
    .filter(h => h.employeeId === employeeId && h.itemId === itemId)
    .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())[0];
}

// FIX #6: canIssue with threshold
export function canIssue(histories: PPEHistory[], employeeId: number, itemId: number): boolean {
  const last = getLastHistory(histories, employeeId, itemId);
  if (!last) return true;
  const expireDate = new Date(last.expireDate);
  const threshold = new Date(expireDate);
  threshold.setDate(threshold.getDate() - ISSUE_THRESHOLD_DAYS);
  return new Date() >= threshold;
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

// FIX #1: Get norms for an employee's jobType
export function getEmployeeNorms(employee: PPEEmployee, norms: PPENorm[]): PPENorm[] {
  return norms.filter(n => n.jobType === employee.jobType);
}

// FIX #2: Check if employee+item already exists in active batches
export function isAlreadyInBatch(batchItems: PPEBatchItem[], batches: PPEBatch[], employeeId: number, itemId: number): boolean {
  const activeBatchIds = batches.filter(b => b.status !== 'COMPLETED').map(b => b.id);
  return batchItems.some(bi =>
    activeBatchIds.includes(bi.batchId) &&
    bi.employeeId === employeeId &&
    bi.itemId === itemId &&
    bi.status !== 'FULL'
  );
}

// FIX #3: Check if all batch items are FULL
export function isBatchComplete(batchItems: PPEBatchItem[], batchId: number): boolean {
  const items = batchItems.filter(bi => bi.batchId === batchId);
  return items.length > 0 && items.every(bi => bi.status === 'FULL');
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
