// mock/salaryAdjustment.ts

export type AdjustmentStatus = 
  | 'DRAFT'              // Bản nháp
  | 'ACTIVE'             // Đang hiệu lực
  | 'EXPIRED';           // Đã hết hiệu lực

export type AdjustmentType = 
  | 'ANNUAL_INCREASE'      // Tăng lương định kỳ hàng năm
  | 'PROMOTION'            // Thăng chức
  | 'PERFORMANCE_BONUS'    // Tăng lương theo hiệu suất
  | 'MARKET_ADJUSTMENT'    // Điều chỉnh theo thị trường
  | 'POSITION_CHANGE'      // Thay đổi vị trí
  | 'PROBATION_END'        // Kết thúc thử việc
  | 'COST_OF_LIVING'       // Điều chỉnh theo CPI
  | 'SPECIAL_RECOGNITION'  // Ghi nhận đặc biệt
  | 'DEMOTION'             // Giảm lương (giáng chức)
  | 'OTHER';               // Lý do khác

export interface SalaryComponent {
  baseSalary: number;           // Lương cơ bản
  allowances?: {                // Phụ cấp
    position?: number;          // PC chức vụ
    responsibility?: number;    // PC trách nhiệm
    housing?: number;           // PC nhà ở
    transportation?: number;    // PC xăng xe
    lunch?: number;             // PC ăn trưa
    phone?: number;             // PC điện thoại
    other?: number;             // PC khác
  };
  totalSalary: number;          // Tổng lương
}

export interface SalaryAdjustment {
  id: string;
  
  // Thông tin nhân viên
  employeeId: string;
  employeeName: string;
  departmentName: string;
  position: string;
  currentPosition: string;      // Chức vụ hiện tại
  newPosition?: string;         // Chức vụ mới (nếu thăng chức)
  
  // Loại điều chỉnh
  adjustmentType: AdjustmentType;
  
  // Lương hiện tại và mới
  currentSalary: SalaryComponent;
  newSalary: SalaryComponent;
  
  // Tính toán
  increaseAmount: number;       // Số tiền tăng
  increasePercentage: number;   // Tỷ lệ tăng (%)
  
  // Thời gian
  effectiveDate: string;        // Ngày có hiệu lực
  expiryDate?: string;          // Ngày hết hiệu lực (nếu có)
  
  // Lý do và căn cứ
  reason: string;               // Lý do chi tiết
  performanceNote?: string;     // Ghi chú về hiệu suất
  attachments: string[];        // File đính kèm
  
  // Quyết định
  decisionNumber?: string;      // Số quyết định
  decisionDate?: string;        // Ngày quyết định
  
  // Trạng thái
  status: AdjustmentStatus;
  
  // Người tạo (Admin)
  createdBy: string;
  createdByName: string;
  createdDate: string;
  
  // Cập nhật
  updatedBy?: string;
  updatedByName?: string;
  updatedDate?: string;
  
  notes?: string;
}

export interface SalaryHistory {
  id: string;
  employeeId: string;
  adjustmentId: string;
  effectiveDate: string;
  oldSalary: number;
  newSalary: number;
  increaseAmount: number;
  increasePercentage: number;
  reason: string;
  decisionNumber: string;
}

export const statusLabels: Record<AdjustmentStatus, string> = {
  DRAFT: 'Bản nháp',
  ACTIVE: 'Đang hiệu lực',
  EXPIRED: 'Đã hết hạn',
};

export const adjustmentTypeLabels: Record<AdjustmentType, string> = {
  ANNUAL_INCREASE: 'Tăng lương định kỳ',
  PROMOTION: 'Thăng chức',
  PERFORMANCE_BONUS: 'Tăng theo hiệu suất',
  MARKET_ADJUSTMENT: 'Điều chỉnh theo thị trường',
  POSITION_CHANGE: 'Thay đổi vị trí',
  PROBATION_END: 'Kết thúc thử việc',
  COST_OF_LIVING: 'Điều chỉnh theo CPI',
  SPECIAL_RECOGNITION: 'Ghi nhận đặc biệt',
  DEMOTION: 'Giảm lương',
  OTHER: 'Lý do khác',
};

// Helper function: Tính tổng lương
export function calculateTotalSalary(component: SalaryComponent): number {
  const allowancesTotal = component.allowances
    ? Object.values(component.allowances).reduce((sum, val) => sum + (val || 0), 0)
    : 0;
  return component.baseSalary + allowancesTotal;
}

// Helper function: Tính số tiền và tỷ lệ tăng
export function calculateIncrease(oldTotal: number, newTotal: number) {
  const increaseAmount = newTotal - oldTotal;
  const increasePercentage = oldTotal > 0 ? (increaseAmount / oldTotal) * 100 : 0;
  return {
    increaseAmount,
    increasePercentage: Math.round(increasePercentage * 100) / 100,
  };
}

// Mock data
export const mockSalaryAdjustments: SalaryAdjustment[] = [
  // Đã có hiệu lực
  {
    id: 'SA-001',
    employeeId: 'EMP-001',
    employeeName: 'Nguyễn Văn An',
    departmentName: 'Phòng IT',
    position: 'Senior Developer',
    currentPosition: 'Senior Developer',
    adjustmentType: 'ANNUAL_INCREASE',
    currentSalary: {
      baseSalary: 20000000,
      allowances: {
        position: 3000000,
        transportation: 2000000,
        lunch: 1000000,
      },
      totalSalary: 26000000,
    },
    newSalary: {
      baseSalary: 23000000,
      allowances: {
        position: 3000000,
        transportation: 2000000,
        lunch: 1000000,
      },
      totalSalary: 29000000,
    },
    increaseAmount: 3000000,
    increasePercentage: 11.54,
    effectiveDate: '2024-01-01',
    createdDate: '2023-12-10',
    reason: 'Tăng lương định kỳ năm 2024 dựa trên đánh giá hiệu suất xuất sắc',
    performanceNote: 'Hoàn thành vượt 120% KPI, đóng góp quan trọng vào dự án X',
    attachments: ['danh-gia-hieu-suat-2023.pdf', 'bao-cao-kpi.pdf'],
    decisionNumber: 'QĐ-TL-2024-001',
    decisionDate: '2023-12-25',
    status: 'ACTIVE',
    createdBy: 'ADMIN-001',
    createdByName: 'Nguyễn Văn E',
  },
  
  // Đã có hiệu lực - Thăng chức
  {
    id: 'SA-002',
    employeeId: 'EMP-002',
    employeeName: 'Lê Thị Cẩm',
    departmentName: 'Phòng Kinh doanh',
    position: 'Senior Sales Executive',
    currentPosition: 'Sales Executive',
    newPosition: 'Senior Sales Executive',
    adjustmentType: 'PROMOTION',
    currentSalary: {
      baseSalary: 15000000,
      allowances: {
        position: 1500000,
        transportation: 1000000,
        phone: 500000,
      },
      totalSalary: 18000000,
    },
    newSalary: {
      baseSalary: 18000000,
      allowances: {
        position: 2500000,
        responsibility: 1000000,
        transportation: 1500000,
        phone: 500000,
      },
      totalSalary: 23500000,
    },
    increaseAmount: 5500000,
    increasePercentage: 30.56,
    effectiveDate: '2024-02-01',
    createdDate: '2024-01-05',
    reason: 'Thăng chức lên Senior Sales Executive do đạt doanh số xuất sắc và quản lý team hiệu quả',
    performanceNote: 'Đạt 150% doanh số năm 2023, training thành công 3 nhân viên mới',
    attachments: ['de-xuat-thang-chuc.pdf', 'bao-cao-doanh-so-2023.pdf'],
    decisionNumber: 'QĐ-TL-2024-002',
    decisionDate: '2024-01-15',
    status: 'ACTIVE',
    createdBy: 'ADMIN-001',
    createdByName: 'Nguyễn Văn E',
  },
  
  // Đã có hiệu lực
  {
    id: 'SA-003',
    employeeId: 'EMP-003',
    employeeName: 'Hoàng Minh F',
    departmentName: 'Phòng Kế toán',
    position: 'Accountant',
    currentPosition: 'Accountant',
    adjustmentType: 'PERFORMANCE_BONUS',
    currentSalary: {
      baseSalary: 16000000,
      allowances: {
        position: 2000000,
        lunch: 1000000,
      },
      totalSalary: 19000000,
    },
    newSalary: {
      baseSalary: 18000000,
      allowances: {
        position: 2000000,
        lunch: 1000000,
      },
      totalSalary: 21000000,
    },
    increaseAmount: 2000000,
    increasePercentage: 10.53,
    effectiveDate: '2024-12-01',
    createdDate: '2024-11-15',
    reason: 'Tăng lương dựa trên đánh giá hiệu suất Q4/2024 đạt loại A',
    performanceNote: 'Hoàn thành xuất sắc công tác báo cáo tài chính, không có sai sót',
    attachments: ['danh-gia-q4-2024.pdf'],
    decisionNumber: 'QĐ-TL-2024-025',
    decisionDate: '2024-11-20',
    status: 'ACTIVE',
    createdBy: 'ADMIN-001',
    createdByName: 'Nguyễn Văn E',
  },
  
  // Bản nháp
  {
    id: 'SA-004',
    employeeId: 'EMP-004',
    employeeName: 'Đỗ Văn H',
    departmentName: 'Phòng Hành chính',
    position: 'Admin Staff',
    currentPosition: 'Admin Staff',
    adjustmentType: 'ANNUAL_INCREASE',
    currentSalary: {
      baseSalary: 11000000,
      allowances: {
        lunch: 1000000,
      },
      totalSalary: 12000000,
    },
    newSalary: {
      baseSalary: 12000000,
      allowances: {
        lunch: 1000000,
      },
      totalSalary: 13000000,
    },
    increaseAmount: 1000000,
    increasePercentage: 8.33,
    effectiveDate: '2025-03-01',
    createdDate: '2025-01-06',
    reason: 'Tăng lương định kỳ năm 2025',
    attachments: [],
    status: 'DRAFT',
    createdBy: 'ADMIN-001',
    createdByName: 'Nguyễn Văn E',
    notes: 'Đang soạn thảo quyết định',
  },
  
  // Kết thúc thử việc - Đã có hiệu lực
  {
    id: 'SA-005',
    employeeId: 'EMP-008',
    employeeName: 'Võ Thị P',
    departmentName: 'Phòng Kinh doanh',
    position: 'Sales Staff',
    currentPosition: 'Sales Intern',
    newPosition: 'Sales Staff',
    adjustmentType: 'PROBATION_END',
    currentSalary: {
      baseSalary: 7000000,
      allowances: {
        lunch: 500000,
      },
      totalSalary: 7500000,
    },
    newSalary: {
      baseSalary: 11000000,
      allowances: {
        position: 1000000,
        transportation: 1000000,
        lunch: 1000000,
      },
      totalSalary: 14000000,
    },
    increaseAmount: 6500000,
    increasePercentage: 86.67,
    effectiveDate: '2024-09-01',
    createdDate: '2024-08-20',
    reason: 'Kết thúc thử việc, chuyển sang nhân viên chính thức',
    performanceNote: 'Hoàn thành tốt công việc trong thời gian thử việc',
    attachments: ['danh-gia-thu-viec.pdf'],
    decisionNumber: 'QĐ-TL-2024-018',
    decisionDate: '2024-08-25',
    status: 'ACTIVE',
    createdBy: 'ADMIN-001',
    createdByName: 'Nguyễn Văn E',
  },

  // Thăng chức - Đã có hiệu lực
  {
    id: 'SA-006',
    employeeId: 'EMP-007',
    employeeName: 'Phan Thị N',
    departmentName: 'Phòng Nhân sự',
    position: 'HR Manager',
    currentPosition: 'HR Specialist',
    newPosition: 'HR Manager',
    adjustmentType: 'PROMOTION',
    currentSalary: {
      baseSalary: 16000000,
      allowances: {
        position: 2000000,
        lunch: 1000000,
      },
      totalSalary: 19000000,
    },
    newSalary: {
      baseSalary: 22000000,
      allowances: {
        position: 4000000,
        responsibility: 2000000,
        lunch: 1000000,
      },
      totalSalary: 29000000,
    },
    increaseAmount: 10000000,
    increasePercentage: 52.63,
    effectiveDate: '2024-07-01',
    createdDate: '2024-06-10',
    reason: 'Thăng chức lên HR Manager do thể hiện năng lực lãnh đạo xuất sắc',
    performanceNote: 'Triển khai thành công hệ thống đánh giá hiệu suất mới, tuyển dụng đúng 95% nhân sự',
    attachments: ['de-xuat-thang-chuc.pdf', 'bao-cao-thanh-tich.pdf'],
    decisionNumber: 'QĐ-TL-2024-015',
    decisionDate: '2024-06-25',
    status: 'ACTIVE',
    createdBy: 'ADMIN-001',
    createdByName: 'Nguyễn Văn E',
  },

  // Điều chỉnh theo thị trường - Đã có hiệu lực
  {
    id: 'SA-007',
    employeeId: 'EMP-009',
    employeeName: 'Lý Văn Q',
    departmentName: 'Phòng IT',
    position: 'DevOps Engineer',
    currentPosition: 'DevOps Engineer',
    adjustmentType: 'MARKET_ADJUSTMENT',
    currentSalary: {
      baseSalary: 25000000,
      allowances: {
        position: 3000000,
        transportation: 2000000,
        phone: 1000000,
      },
      totalSalary: 31000000,
    },
    newSalary: {
      baseSalary: 28000000,
      allowances: {
        position: 3000000,
        transportation: 2000000,
        phone: 1000000,
      },
      totalSalary: 34000000,
    },
    increaseAmount: 3000000,
    increasePercentage: 9.68,
    effectiveDate: '2024-11-01',
    createdDate: '2024-10-15',
    reason: 'Điều chỉnh lương theo mức thị trường để giữ chân nhân tài',
    performanceNote: 'Nhân viên có kỹ năng cao, đang có nhiều offer từ công ty khác',
    attachments: ['bao-cao-thi-truong-luong.pdf'],
    decisionNumber: 'QĐ-TL-2024-022',
    decisionDate: '2024-10-20',
    status: 'ACTIVE',
    createdBy: 'ADMIN-001',
    createdByName: 'Nguyễn Văn E',
  },

  // Đã hết hạn (temporary salary increase)
  {
    id: 'SA-008',
    employeeId: 'EMP-005',
    employeeName: 'Bùi Thị K',
    departmentName: 'Phòng Marketing',
    position: 'Marketing Specialist',
    currentPosition: 'Marketing Specialist',
    adjustmentType: 'SPECIAL_RECOGNITION',
    currentSalary: {
      baseSalary: 17000000,
      allowances: {
        position: 2000000,
        phone: 1000000,
      },
      totalSalary: 20000000,
    },
    newSalary: {
      baseSalary: 17000000,
      allowances: {
        position: 2000000,
        phone: 1000000,
        other: 2000000, // Thưởng đặc biệt
      },
      totalSalary: 22000000,
    },
    increaseAmount: 2000000,
    increasePercentage: 10.0,
    effectiveDate: '2024-01-01',
    expiryDate: '2024-06-30',
    createdDate: '2023-12-20',
    reason: 'Thưởng đặc biệt 6 tháng cho chiến dịch marketing thành công vượt trội',
    performanceNote: 'Chiến dịch mang về 500M doanh thu, tăng 200% so với dự kiến',
    attachments: ['bao-cao-chien-dich.pdf'],
    decisionNumber: 'QĐ-TL-2024-003',
    decisionDate: '2023-12-28',
    status: 'EXPIRED',
    createdBy: 'ADMIN-001',
    createdByName: 'Nguyễn Văn E',
  },

  // Bản nháp - Giảm lương
  {
    id: 'SA-009',
    employeeId: 'EMP-010',
    employeeName: 'Trần Văn S',
    departmentName: 'Phòng Kinh doanh',
    position: 'Sales Staff',
    currentPosition: 'Senior Sales Executive',
    newPosition: 'Sales Staff',
    adjustmentType: 'DEMOTION',
    currentSalary: {
      baseSalary: 18000000,
      allowances: {
        position: 2500000,
        responsibility: 1000000,
        transportation: 1500000,
      },
      totalSalary: 23000000,
    },
    newSalary: {
      baseSalary: 14000000,
      allowances: {
        position: 1000000,
        transportation: 1000000,
      },
      totalSalary: 16000000,
    },
    increaseAmount: -7000000,
    increasePercentage: -30.43,
    effectiveDate: '2025-02-01',
    createdDate: '2025-01-08',
    reason: 'Giảm lương do giáng chức từ Senior về Staff do không đạt chỉ tiêu 3 quý liên tiếp',
    performanceNote: 'Chỉ đạt 60% KPI trong Q2, Q3, Q4/2024',
    attachments: [],
    status: 'DRAFT',
    createdBy: 'ADMIN-001',
    createdByName: 'Nguyễn Văn E',
    notes: 'Đang xem xét quyết định',
  },
];

export function calculateSalaryStatistics(adjustments: SalaryAdjustment[]) {
  return {
    total: adjustments.length,
    draft: adjustments.filter(a => a.status === 'DRAFT').length,
    active: adjustments.filter(a => a.status === 'ACTIVE').length,
    expired: adjustments.filter(a => a.status === 'EXPIRED').length,
    totalIncrease: adjustments
      .filter(a => a.status === 'ACTIVE')
      .reduce((sum, a) => sum + a.increaseAmount, 0),
    averageIncrease: adjustments
      .filter(a => a.status === 'ACTIVE')
      .reduce((sum, a, _, arr) => sum + a.increasePercentage / arr.length, 0),
  };
}

// Mock salary history
export const mockSalaryHistory: SalaryHistory[] = [
  {
    id: 'SH-001',
    employeeId: 'EMP-001',
    adjustmentId: 'SA-001',
    effectiveDate: '2024-01-01',
    oldSalary: 26000000,
    newSalary: 29000000,
    increaseAmount: 3000000,
    increasePercentage: 11.54,
    reason: 'Tăng lương định kỳ năm 2024',
    decisionNumber: 'QĐ-TL-2024-001',
  },
  {
    id: 'SH-002',
    employeeId: 'EMP-007',
    adjustmentId: 'SA-006',
    effectiveDate: '2024-07-01',
    oldSalary: 19000000,
    newSalary: 29000000,
    increaseAmount: 10000000,
    increasePercentage: 52.63,
    reason: 'Thăng chức lên HR Manager',
    decisionNumber: 'QĐ-TL-2024-015',
  },
];