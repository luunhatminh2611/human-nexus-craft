// mock/contract.ts

export type ContractType = 
  | 'INDEFINITE'           // Hợp đồng không xác định thời hạn
  | 'DEFINITE_1_YEAR'      // Hợp đồng xác định thời hạn 1 năm
  | 'DEFINITE_2_YEAR'      // Hợp đồng xác định thời hạn 2 năm
  | 'DEFINITE_3_YEAR'      // Hợp đồng xác định thời hạn 3 năm
  | 'PROBATION'            // Hợp đồng thử việc
  | 'SEASONAL'             // Hợp đồng theo mùa vụ
  | 'PROJECT_BASED';       // Hợp đồng theo dự án

export type ContractStatus = 
  | 'ACTIVE'               // Đang hiệu lực
  | 'EXPIRING_SOON'        // Sắp hết hạn (< 30 ngày)
  | 'EXPIRED'              // Đã hết hạn
  | 'SUSPENDED'            // Tạm hoãn
  | 'TERMINATED'           // Đã chấm dứt
  | 'RENEWED'              // Đã gia hạn (HĐ cũ)
  | 'REPLACED';            // Đã thay thế (HĐ cũ khi tái ký)

export type TerminationType = 
  | 'RESIGNATION'          // Thôi việc (do NV)
  | 'DISMISSAL'            // Sa thải (do công ty)
  | 'EXPIRY_NO_RENEWAL'    // Hết hạn không gia hạn
  | 'MUTUAL_AGREEMENT'     // Thỏa thuận 2 bên
  | 'RETIREMENT';          // Nghỉ hưu

export type SuspensionReason = 
  | 'MATERNITY_LEAVE'      // Thai sản
  | 'SICK_LEAVE'           // Ốm đau dài hạn
  | 'STUDY_LEAVE'          // Đi học
  | 'UNPAID_LEAVE'         // Nghỉ không lương
  | 'OTHER';               // Lý do khác

export interface Suspension {
  id: string;
  reason: SuspensionReason;
  reasonDetail: string;
  startDate: string;
  endDate: string | null;        // null = chưa xác định
  actualEndDate?: string;        // Ngày kết thúc thực tế
  documents: string[];
  createdBy: string;
  createdByName: string;
  createdDate: string;
}

export interface TerminationInfo {
  terminationType: TerminationType;
  terminationDate: string;
  reason: string;
  severancePay?: number;         // Trợ cấp thôi việc
  approvedBy: string;
  approvedByName: string;
  documents: string[];
  notes?: string;
}

export interface Contract {
  id: string;
  contractNumber: string;
  contractType: ContractType;
  
  // Nhân viên
  employeeId: string;
  employeeName: string;
  departmentName: string;
  position: string;
  
  // Thời hạn
  startDate: string;
  endDate: string | null;         // null = không xác định thời hạn
  signDate: string;
  
  // Trạng thái
  status: ContractStatus;
  
  // Lương & phúc lợi
  baseSalary: number;
  allowances?: string;            // Mô tả phụ cấp
  
  // File hợp đồng
  fileUrl: string;
  
  // Quan hệ với HĐ khác
  previousContractId?: string;    // HĐ trước (nếu là tái ký)
  renewalCount: number;           // Số lần gia hạn
  originalContractId?: string;    // HĐ gốc đầu tiên
  
  // Tạm hoãn
  currentSuspension?: Suspension; // Tạm hoãn hiện tại
  suspensionHistory: Suspension[]; // Lịch sử tạm hoãn
  
  // Chấm dứt
  terminationInfo?: TerminationInfo;
  
  // Người tạo (HR)
  createdBy: string;
  createdByName: string;
  createdDate: string;
  
  // Cập nhật
  updatedBy?: string;
  updatedByName?: string;
  updatedDate?: string;
  
  notes?: string;
}

export const contractTypeLabels: Record<ContractType, string> = {
  INDEFINITE: 'Không xác định thời hạn',
  DEFINITE_1_YEAR: 'Xác định thời hạn - 1 năm',
  DEFINITE_2_YEAR: 'Xác định thời hạn - 2 năm',
  DEFINITE_3_YEAR: 'Xác định thời hạn - 3 năm',
  PROBATION: 'Thử việc',
  SEASONAL: 'Theo mùa vụ',
  PROJECT_BASED: 'Theo dự án',
};

export const statusLabels: Record<ContractStatus, string> = {
  ACTIVE: 'Đang hiệu lực',
  EXPIRING_SOON: 'Sắp hết hạn',
  EXPIRED: 'Đã hết hạn',
  SUSPENDED: 'Tạm hoãn',
  TERMINATED: 'Đã chấm dứt',
  RENEWED: 'Đã gia hạn',
  REPLACED: 'Đã thay thế',
};

export const terminationTypeLabels: Record<TerminationType, string> = {
  RESIGNATION: 'Thôi việc',
  DISMISSAL: 'Sa thải',
  EXPIRY_NO_RENEWAL: 'Hết hạn không gia hạn',
  MUTUAL_AGREEMENT: 'Thỏa thuận 2 bên',
  RETIREMENT: 'Nghỉ hưu',
};

export const suspensionReasonLabels: Record<SuspensionReason, string> = {
  MATERNITY_LEAVE: 'Nghỉ thai sản',
  SICK_LEAVE: 'Nghỉ ốm dài hạn',
  STUDY_LEAVE: 'Nghỉ học tập',
  UNPAID_LEAVE: 'Nghỉ không lương',
  OTHER: 'Lý do khác',
};

// Helper function để tính số ngày đến khi hết hạn
export function getDaysUntilExpiry(endDate: string | null): number | null {
  if (!endDate) return null;
  const today = new Date();
  const expiry = new Date(endDate);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Helper function để xác định trạng thái dựa vào ngày hết hạn
export function determineContractStatus(
  endDate: string | null,
  currentStatus: ContractStatus
): ContractStatus {
  if (currentStatus === 'SUSPENDED' || 
      currentStatus === 'TERMINATED' || 
      currentStatus === 'RENEWED' || 
      currentStatus === 'REPLACED') {
    return currentStatus;
  }

  if (!endDate) return 'ACTIVE'; // HĐ không xác định thời hạn

  const daysLeft = getDaysUntilExpiry(endDate);
  if (daysLeft === null) return 'ACTIVE';
  
  if (daysLeft < 0) return 'EXPIRED';
  if (daysLeft <= 30) return 'EXPIRING_SOON';
  return 'ACTIVE';
}

// Mock data
export const mockContracts: Contract[] = [
  // HĐ đang hiệu lực - Không xác định thời hạn
  {
    id: 'CT-001',
    contractNumber: 'HĐ-2023-001',
    contractType: 'INDEFINITE',
    employeeId: 'EMP-001',
    employeeName: 'Nguyễn Văn An',
    departmentName: 'Phòng IT',
    position: 'Senior Developer',
    startDate: '2023-01-15',
    endDate: null,
    signDate: '2023-01-10',
    status: 'ACTIVE',
    baseSalary: 25000000,
    allowances: 'Phụ cấp xăng xe: 2tr, Phụ cấp ăn trưa: 1tr',
    fileUrl: '/contracts/HD-2023-001.pdf',
    renewalCount: 0,
    suspensionHistory: [],
    createdBy: 'ADMIN-001',
    createdByName: 'Nguyễn Văn E',
    createdDate: '2023-01-10',
  },
  
  // HĐ đang hiệu lực - Xác định thời hạn 2 năm
  {
    id: 'CT-002',
    contractNumber: 'HĐ-2023-015',
    contractType: 'DEFINITE_2_YEAR',
    employeeId: 'EMP-002',
    employeeName: 'Lê Thị Cẩm',
    departmentName: 'Phòng Kinh doanh',
    position: 'Sales Executive',
    startDate: '2023-06-01',
    endDate: '2025-05-31',
    signDate: '2023-05-25',
    status: 'ACTIVE',
    baseSalary: 15000000,
    allowances: 'Hoa hồng theo doanh số, Phụ cấp điện thoại: 500k',
    fileUrl: '/contracts/HD-2023-015.pdf',
    renewalCount: 0,
    suspensionHistory: [],
    createdBy: 'ADMIN-001',
    createdByName: 'Nguyễn Văn E',
    createdDate: '2023-05-25',
  },
  
  // HĐ sắp hết hạn (20 ngày nữa)
  {
    id: 'CT-003',
    contractNumber: 'HĐ-2024-008',
    contractType: 'DEFINITE_1_YEAR',
    employeeId: 'EMP-003',
    employeeName: 'Hoàng Minh F',
    departmentName: 'Phòng Kế toán',
    position: 'Accountant',
    startDate: '2024-01-15',
    endDate: '2025-01-14',
    signDate: '2024-01-10',
    status: 'EXPIRING_SOON',
    baseSalary: 18000000,
    allowances: 'Phụ cấp trách nhiệm: 2tr',
    fileUrl: '/contracts/HD-2024-008.pdf',
    renewalCount: 0,
    suspensionHistory: [],
    createdBy: 'ADMIN-001',
    createdByName: 'Nguyễn Văn E',
    createdDate: '2024-01-10',
  },
  
  // HĐ đã hết hạn
  {
    id: 'CT-004',
    contractNumber: 'HĐ-2023-025',
    contractType: 'DEFINITE_1_YEAR',
    employeeId: 'EMP-004',
    employeeName: 'Đỗ Văn H',
    departmentName: 'Phòng Hành chính',
    position: 'Admin Staff',
    startDate: '2023-12-01',
    endDate: '2024-11-30',
    signDate: '2023-11-25',
    status: 'EXPIRED',
    baseSalary: 12000000,
    allowances: 'Phụ cấp ăn trưa: 1tr',
    fileUrl: '/contracts/HD-2023-025.pdf',
    renewalCount: 1,
    originalContractId: 'CT-004-ORIG',
    suspensionHistory: [],
    createdBy: 'ADMIN-001',
    createdByName: 'Nguyễn Văn E',
    createdDate: '2023-11-25',
  },
  
  // HĐ đang tạm hoãn (thai sản)
  {
    id: 'CT-005',
    contractNumber: 'HĐ-2022-010',
    contractType: 'INDEFINITE',
    employeeId: 'EMP-005',
    employeeName: 'Bùi Thị K',
    departmentName: 'Phòng Marketing',
    position: 'Marketing Specialist',
    startDate: '2022-03-01',
    endDate: null,
    signDate: '2022-02-25',
    status: 'SUSPENDED',
    baseSalary: 20000000,
    allowances: 'Phụ cấp điện thoại: 1tr',
    fileUrl: '/contracts/HD-2022-010.pdf',
    renewalCount: 0,
    currentSuspension: {
      id: 'SUS-001',
      reason: 'MATERNITY_LEAVE',
      reasonDetail: 'Nghỉ thai sản',
      startDate: '2024-11-01',
      endDate: '2025-04-30',
      documents: ['giay-nghi-thai-san.pdf'],
      createdBy: 'ADMIN-001',
      createdByName: 'Nguyễn Văn E',
      createdDate: '2024-10-25',
    },
    suspensionHistory: [
      {
        id: 'SUS-001',
        reason: 'MATERNITY_LEAVE',
        reasonDetail: 'Nghỉ thai sản',
        startDate: '2024-11-01',
        endDate: '2025-04-30',
        documents: ['giay-nghi-thai-san.pdf'],
        createdBy: 'ADMIN-001',
        createdByName: 'Nguyễn Văn E',
        createdDate: '2024-10-25',
      },
    ],
    createdBy: 'ADMIN-001',
    createdByName: 'Nguyễn Văn E',
    createdDate: '2022-02-25',
  },
  
  // HĐ đã chấm dứt (thôi việc)
  {
    id: 'CT-006',
    contractNumber: 'HĐ-2023-018',
    contractType: 'DEFINITE_2_YEAR',
    employeeId: 'EMP-006',
    employeeName: 'Trịnh Văn M',
    departmentName: 'Phòng IT',
    position: 'Junior Developer',
    startDate: '2023-07-01',
    endDate: '2025-06-30',
    signDate: '2023-06-25',
    status: 'TERMINATED',
    baseSalary: 15000000,
    fileUrl: '/contracts/HD-2023-018.pdf',
    renewalCount: 0,
    terminationInfo: {
      terminationType: 'RESIGNATION',
      terminationDate: '2024-12-15',
      reason: 'Nhân viên xin thôi việc để theo học cao học',
      approvedBy: 'ADMIN-001',
      approvedByName: 'Nguyễn Văn E',
      documents: ['don-xin-thoi-viec.pdf', 'bien-ban-cham-dut-hd.pdf'],
      notes: 'Đã thanh toán đầy đủ lương và phép còn lại',
    },
    suspensionHistory: [],
    createdBy: 'ADMIN-001',
    createdByName: 'Nguyễn Văn E',
    createdDate: '2023-06-25',
  },
  
  // HĐ đã gia hạn (HĐ cũ)
  {
    id: 'CT-007',
    contractNumber: 'HĐ-2022-005',
    contractType: 'DEFINITE_1_YEAR',
    employeeId: 'EMP-007',
    employeeName: 'Phan Thị N',
    departmentName: 'Phòng Nhân sự',
    position: 'HR Specialist',
    startDate: '2022-05-01',
    endDate: '2023-04-30',
    signDate: '2022-04-25',
    status: 'RENEWED',
    baseSalary: 16000000,
    fileUrl: '/contracts/HD-2022-005.pdf',
    renewalCount: 1,
    suspensionHistory: [],
    createdBy: 'ADMIN-001',
    createdByName: 'Nguyễn Văn E',
    createdDate: '2022-04-25',
  },
  
  // HĐ mới sau khi gia hạn
  {
    id: 'CT-008',
    contractNumber: 'HĐ-2023-045',
    contractType: 'DEFINITE_2_YEAR',
    employeeId: 'EMP-007',
    employeeName: 'Phan Thị N',
    departmentName: 'Phòng Nhân sự',
    position: 'HR Specialist',
    startDate: '2023-05-01',
    endDate: '2025-04-30',
    signDate: '2023-04-25',
    status: 'ACTIVE',
    baseSalary: 18000000,
    allowances: 'Phụ cấp trách nhiệm: 1.5tr',
    fileUrl: '/contracts/HD-2023-045.pdf',
    previousContractId: 'CT-007',
    renewalCount: 0,
    originalContractId: 'CT-007',
    suspensionHistory: [],
    createdBy: 'ADMIN-001',
    createdByName: 'Nguyễn Văn E',
    createdDate: '2023-04-25',
  },
  
  // HĐ thử việc
  {
    id: 'CT-009',
    contractNumber: 'HĐ-2024-055',
    contractType: 'PROBATION',
    employeeId: 'EMP-008',
    employeeName: 'Võ Thị P',
    departmentName: 'Phòng Kinh doanh',
    position: 'Sales Intern',
    startDate: '2024-12-01',
    endDate: '2025-02-28',
    signDate: '2024-11-28',
    status: 'ACTIVE',
    baseSalary: 8000000,
    fileUrl: '/contracts/HD-2024-055.pdf',
    renewalCount: 0,
    suspensionHistory: [],
    createdBy: 'ADMIN-001',
    createdByName: 'Nguyễn Văn E',
    createdDate: '2024-11-28',
    notes: 'Hợp đồng thử việc 3 tháng',
  },
  
  // HĐ sắp hết hạn (10 ngày nữa) - cần gia hạn gấp
  {
    id: 'CT-010',
    contractNumber: 'HĐ-2024-012',
    contractType: 'DEFINITE_1_YEAR',
    employeeId: 'EMP-009',
    employeeName: 'Lý Văn Q',
    departmentName: 'Phòng IT',
    position: 'DevOps Engineer',
    startDate: '2024-01-10',
    endDate: '2025-01-09',
    signDate: '2024-01-05',
    status: 'EXPIRING_SOON',
    baseSalary: 28000000,
    allowances: 'Phụ cấp on-call: 3tr',
    fileUrl: '/contracts/HD-2024-012.pdf',
    renewalCount: 0,
    suspensionHistory: [],
    createdBy: 'ADMIN-001',
    createdByName: 'Nguyễn Văn E',
    createdDate: '2024-01-05',
  },
];

export function calculateContractStatistics(contracts: Contract[]) {
  return {
    total: contracts.length,
    active: contracts.filter(c => c.status === 'ACTIVE').length,
    expiringSoon: contracts.filter(c => c.status === 'EXPIRING_SOON').length,
    expired: contracts.filter(c => c.status === 'EXPIRED').length,
    suspended: contracts.filter(c => c.status === 'SUSPENDED').length,
    terminated: contracts.filter(c => c.status === 'TERMINATED').length,
  };
}

// Helper: Lấy các HĐ hiệu lực (ACTIVE, EXPIRING_SOON, SUSPENDED)
export function getActiveContracts(contracts: Contract[]): Contract[] {
  return contracts.filter(c => 
    c.status === 'ACTIVE' || 
    c.status === 'EXPIRING_SOON' || 
    c.status === 'SUSPENDED'
  );
}

// Helper: Lấy các HĐ hết hiệu lực (EXPIRED, TERMINATED, RENEWED, REPLACED)
export function getInactiveContracts(contracts: Contract[]): Contract[] {
  return contracts.filter(c => 
    c.status === 'EXPIRED' || 
    c.status === 'TERMINATED' || 
    c.status === 'RENEWED' || 
    c.status === 'REPLACED'
  );
}