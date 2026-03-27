// ============ CHỨC VỤ (Position) ============
export interface Position {
  id: string;
  name: string;
  baseLeaveDays: number; // Tổng ngày phép cơ bản theo chức vụ
}

export const POSITIONS: Position[] = [
  { id: 'pos1', name: 'Công nhân', baseLeaveDays: 12 },
  { id: 'pos2', name: 'Kỹ thuật viên', baseLeaveDays: 12 },
  { id: 'pos3', name: 'Nhân viên văn phòng', baseLeaveDays: 12 },
  { id: 'pos4', name: 'Kỹ sư', baseLeaveDays: 14 },
  { id: 'pos5', name: 'Trưởng phòng', baseLeaveDays: 16 },
  { id: 'pos6', name: 'Phó phòng', baseLeaveDays: 15 },
  { id: 'pos7', name: 'Giám đốc', baseLeaveDays: 18 },
];

// ============ PHÒNG BAN ============
export interface Department {
  id: string;
  name: string;
  isOrgDept: boolean; // Phòng tổ chức (duyệt cuối)
}

export const DEPARTMENTS: Department[] = [
  { id: 'dept1', name: 'Xưởng sản xuất 1', isOrgDept: false },
  { id: 'dept2', name: 'Phòng kỹ thuật', isOrgDept: false },
  { id: 'dept3', name: 'Phòng nhân sự', isOrgDept: false },
  { id: 'dept4', name: 'Phòng tổ chức', isOrgDept: true },
  { id: 'dept5', name: 'Phòng kế toán', isOrgDept: false },
];

// ============ NHÂN VIÊN ============
export interface MockEmployee {
  id: string;
  name: string;
  positionId: string;
  departmentId: string;
  startDate: string; // ISO date - ngày vào làm
  role: 'EMPLOYEE' | 'MANAGER'; // role trong hệ thống
}

export const MOCK_EMPLOYEES: MockEmployee[] = [
  { id: 'emp1', name: 'Nguyễn Văn An', positionId: 'pos1', departmentId: 'dept1', startDate: '2015-03-15', role: 'EMPLOYEE' },
  { id: 'emp2', name: 'Trần Thị Bình', positionId: 'pos4', departmentId: 'dept2', startDate: '2018-07-01', role: 'EMPLOYEE' },
  { id: 'emp3', name: 'Lê Văn Cường', positionId: 'pos3', departmentId: 'dept3', startDate: '2020-01-10', role: 'EMPLOYEE' },
  { id: 'emp4', name: 'Phạm Minh Đức', positionId: 'pos2', departmentId: 'dept1', startDate: '2022-06-01', role: 'EMPLOYEE' },
  { id: 'emp5', name: 'Hoàng Thị Em', positionId: 'pos3', departmentId: 'dept5', startDate: '2019-09-15', role: 'EMPLOYEE' },
  // Managers
  { id: 'mgr1', name: 'Vũ Đình Phong', positionId: 'pos5', departmentId: 'dept1', startDate: '2012-01-01', role: 'MANAGER' },
  { id: 'mgr2', name: 'Đỗ Thanh Hà', positionId: 'pos5', departmentId: 'dept2', startDate: '2014-05-01', role: 'MANAGER' },
  { id: 'mgr3', name: 'Ngô Văn Khoa', positionId: 'pos5', departmentId: 'dept3', startDate: '2013-08-15', role: 'MANAGER' },
  { id: 'mgr4', name: 'Bùi Thị Lan', positionId: 'pos5', departmentId: 'dept4', startDate: '2011-02-01', role: 'MANAGER' },
  { id: 'mgr5', name: 'Trịnh Văn Minh', positionId: 'pos5', departmentId: 'dept5', startDate: '2015-11-01', role: 'MANAGER' },
];

// ============ DANH MỤC LOẠI NGHỈ CHẾ ĐỘ ============
export interface LeaveCategory {
  id: string;
  code: string;
  name: string;
  maxDays: number; // Số ngày nghỉ tối đa
}

export const LEAVE_CATEGORIES: LeaveCategory[] = [
  { id: 'cat1', code: 'HIEU', name: 'Nghỉ chế độ hiếu', maxDays: 5 },
  { id: 'cat2', code: 'HI', name: 'Nghỉ chế độ hỉ (kết hôn)', maxDays: 3 },
  { id: 'cat3', code: 'HI_CON', name: 'Nghỉ chế độ hỉ (con kết hôn)', maxDays: 1 },
  { id: 'cat4', code: 'THAI_SAN', name: 'Nghỉ thai sản', maxDays: 180 },
  { id: 'cat5', code: 'TAI_NAN', name: 'Nghỉ tai nạn lao động', maxDays: 30 },
  { id: 'cat6', code: 'BENH', name: 'Nghỉ ốm (có giấy bác sĩ)', maxDays: 30 },
  { id: 'cat7', code: 'CON_OM', name: 'Nghỉ con ốm', maxDays: 20 },
];

// ============ LEAVE REQUEST ============
export type LeaveType = 'REGULAR' | 'POLICY'; // Nghỉ thường vs Nghỉ chế độ

export type LeaveStatus = 
  | 'DRAFT'
  | 'PENDING_MANAGER'    // Chờ trưởng phòng duyệt
  | 'MANAGER_APPROVED'   // Trưởng phòng đã duyệt, chờ phòng tổ chức
  | 'PENDING_ORG'        // Chờ phòng tổ chức duyệt
  | 'APPROVED'           // Đã duyệt (phòng tổ chức)
  | 'REJECTED_MANAGER'   // Trưởng phòng từ chối
  | 'REJECTED_ORG';      // Phòng tổ chức từ chối

export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveType: LeaveType;
  categoryId?: string;       // Nếu là nghỉ chế độ
  title: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  managerId: string;         // Người duyệt cấp 1 (trưởng phòng)
  orgManagerId?: string;     // Người duyệt cấp 2 (phòng tổ chức)
  managerComment?: string;
  orgComment?: string;
  createdAt: string;
  fileName?: string;
}

// ============ MOCK LEAVE REQUESTS ============
export const MOCK_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'lr1',
    employeeId: 'emp1',
    leaveType: 'REGULAR',
    title: 'Nghỉ phép năm - du lịch',
    startDate: '2026-01-10',
    endDate: '2026-01-12',
    totalDays: 3,
    reason: 'Du lịch cùng gia đình',
    status: 'APPROVED',
    managerId: 'mgr1',
    orgManagerId: 'mgr4',
    createdAt: '2026-01-05',
  },
  {
    id: 'lr2',
    employeeId: 'emp1',
    leaveType: 'POLICY',
    categoryId: 'cat1',
    title: 'Nghỉ chế độ hiếu - ông nội',
    startDate: '2026-02-15',
    endDate: '2026-02-19',
    totalDays: 5,
    reason: 'Ông nội mất',
    status: 'APPROVED',
    managerId: 'mgr1',
    orgManagerId: 'mgr4',
    createdAt: '2026-02-14',
  },
  {
    id: 'lr3',
    employeeId: 'emp2',
    leaveType: 'REGULAR',
    title: 'Nghỉ việc riêng',
    startDate: '2026-03-20',
    endDate: '2026-03-21',
    totalDays: 2,
    reason: 'Giải quyết việc cá nhân',
    status: 'PENDING_MANAGER',
    managerId: 'mgr2',
    createdAt: '2026-03-18',
  },
  {
    id: 'lr4',
    employeeId: 'emp3',
    leaveType: 'POLICY',
    categoryId: 'cat2',
    title: 'Nghỉ kết hôn',
    startDate: '2026-04-01',
    endDate: '2026-04-03',
    totalDays: 3,
    reason: 'Kết hôn',
    status: 'MANAGER_APPROVED',
    managerId: 'mgr3',
    orgManagerId: 'mgr4',
    createdAt: '2026-03-25',
  },
  {
    id: 'lr5',
    employeeId: 'emp4',
    leaveType: 'REGULAR',
    title: 'Nghỉ phép',
    startDate: '2026-03-05',
    endDate: '2026-03-06',
    totalDays: 2,
    reason: 'Nghỉ ngơi',
    status: 'REJECTED_MANAGER',
    managerId: 'mgr1',
    managerComment: 'Thiếu nhân lực, đề nghị dời lịch',
    createdAt: '2026-03-01',
  },
  {
    id: 'lr6',
    employeeId: 'emp1',
    leaveType: 'POLICY',
    categoryId: 'cat1',
    title: 'Nghỉ chế độ hiếu - bà ngoại',
    startDate: '2026-03-10',
    endDate: '2026-03-16',
    totalDays: 7,
    reason: 'Bà ngoại mất, nghỉ 7 ngày (5 chế độ + 2 trừ phép)',
    status: 'APPROVED',
    managerId: 'mgr1',
    orgManagerId: 'mgr4',
    createdAt: '2026-03-09',
  },
  {
    id: 'lr7',
    employeeId: 'emp5',
    leaveType: 'REGULAR',
    title: 'Nghỉ phép năm',
    startDate: '2026-02-01',
    endDate: '2026-02-02',
    totalDays: 2,
    reason: 'Về quê',
    status: 'APPROVED',
    managerId: 'mgr5',
    orgManagerId: 'mgr4',
    createdAt: '2026-01-28',
  },
];

// ============ HELPER FUNCTIONS ============

/** Tính số ngày phép tồn = base + seniority bonus - used regular - excess policy */
export function calculateLeaveBalance(
  employeeId: string,
  allRequests: LeaveRequest[]
): {
  baseDays: number;
  seniorityBonus: number;
  totalEntitled: number;
  regularUsed: number;
  policyExcess: number;
  remaining: number;
  policyUsage: { categoryId: string; categoryName: string; used: number; max: number; excess: number }[];
} {
  const emp = MOCK_EMPLOYEES.find(e => e.id === employeeId);
  if (!emp) return { baseDays: 0, seniorityBonus: 0, totalEntitled: 0, regularUsed: 0, policyExcess: 0, remaining: 0, policyUsage: [] };

  const pos = POSITIONS.find(p => p.id === emp.positionId);
  const baseDays = pos?.baseLeaveDays || 12;

  // Seniority bonus: floor((today - startDate) / 5 years)
  const today = new Date();
  const start = new Date(emp.startDate);
  const yearsWorked = (today.getTime() - start.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  const seniorityBonus = Math.floor(yearsWorked / 5);

  const totalEntitled = baseDays + seniorityBonus;

  // Only count APPROVED requests
  const approvedRequests = allRequests.filter(r => r.employeeId === employeeId && r.status === 'APPROVED');

  // Regular leave used
  const regularUsed = approvedRequests
    .filter(r => r.leaveType === 'REGULAR')
    .reduce((sum, r) => sum + r.totalDays, 0);

  // Policy leave: calculate excess per category
  const policyByCategory = new Map<string, number>();
  approvedRequests
    .filter(r => r.leaveType === 'POLICY' && r.categoryId)
    .forEach(r => {
      const current = policyByCategory.get(r.categoryId!) || 0;
      policyByCategory.set(r.categoryId!, current + r.totalDays);
    });

  let policyExcess = 0;
  const policyUsage: { categoryId: string; categoryName: string; used: number; max: number; excess: number }[] = [];

  LEAVE_CATEGORIES.forEach(cat => {
    const used = policyByCategory.get(cat.id) || 0;
    const excess = Math.max(0, used - cat.maxDays);
    policyExcess += excess;
    if (used > 0) {
      policyUsage.push({ categoryId: cat.id, categoryName: cat.name, used, max: cat.maxDays, excess });
    }
  });

  const remaining = totalEntitled - regularUsed - policyExcess;

  return { baseDays, seniorityBonus, totalEntitled, regularUsed, policyExcess, remaining, policyUsage };
}

/** Lấy danh sách managers trong cùng phòng ban */
export function getDepartmentManagers(departmentId: string): MockEmployee[] {
  return MOCK_EMPLOYEES.filter(e => e.departmentId === departmentId && e.role === 'MANAGER');
}

/** Lấy danh sách managers phòng tổ chức */
export function getOrgManagers(): MockEmployee[] {
  const orgDept = DEPARTMENTS.find(d => d.isOrgDept);
  if (!orgDept) return [];
  return MOCK_EMPLOYEES.filter(e => e.departmentId === orgDept.id && e.role === 'MANAGER');
}

/** Helper: lấy tên nhân viên */
export function getEmployeeName(id: string): string {
  return MOCK_EMPLOYEES.find(e => e.id === id)?.name || 'N/A';
}

/** Helper: lấy tên phòng ban */
export function getDepartmentName(id: string): string {
  return DEPARTMENTS.find(d => d.id === id)?.name || 'N/A';
}

/** Helper: lấy tên chức vụ */
export function getPositionName(id: string): string {
  return POSITIONS.find(p => p.id === id)?.name || 'N/A';
}

/** Helper: lấy tên danh mục nghỉ */
export function getCategoryName(id: string): string {
  return LEAVE_CATEGORIES.find(c => c.id === id)?.name || 'N/A';
}
