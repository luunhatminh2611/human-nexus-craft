// mock/socialInsurance.ts

export type InsuranceStatus = 
  | 'ACTIVE'          // Đang tham gia
  | 'SUSPENDED'       // Tạm dừng
  | 'TERMINATED';     // Đã dừng

export type InsuranceChangeType =
  | 'NEW_PARTICIPATION'     // Tham gia mới
  | 'SALARY_ADJUSTMENT'     // Điều chỉnh lương
  | 'SUSPENSION'            // Tạm dừng
  | 'RESUMPTION'            // Tiếp tục tham gia
  | 'TERMINATION'           // Chấm dứt
  | 'TRANSFER_IN'           // Chuyển đến
  | 'TRANSFER_OUT';         // Chuyển đi

export interface InsuranceRecord {
  id: string;
  
  // Thông tin nhân viên
  employeeId: string;
  employeeName: string;
  departmentName: string;
  position: string;
  
  // Thông tin sổ BHXH
  insuranceBookNumber: string;     // Số sổ BHXH
  insuranceCode: string;           // Mã số BHXH
  
  // Trạng thái
  status: InsuranceStatus;
  startDate: string;                // Ngày bắt đầu tham gia
  endDate?: string;                 // Ngày kết thúc (nếu có)
  
  // Mức đóng hiện tại
  currentSalaryBase: number;        // Mức lương đóng BHXH hiện tại
  
  // Tỷ lệ đóng (%)
  rates: {
    socialInsurance: {              // BHXH
      employee: number;             // NV đóng
      employer: number;             // Công ty đóng
    };
    healthInsurance: {              // BHYT
      employee: number;
      employer: number;
    };
    unemploymentInsurance: {        // BHTN
      employee: number;
      employer: number;
    };
  };
  
  // Tổng tháng đã đóng
  totalMonthsPaid: number;
  
  // Ghi chú
  notes?: string;
  
  // Người quản lý
  createdBy: string;
  createdByName: string;
  createdDate: string;
  updatedBy?: string;
  updatedByName?: string;
  updatedDate?: string;
}

export interface InsuranceChange {
  id: string;
  recordId: string;                 // ID của hồ sơ BHXH
  
  changeType: InsuranceChangeType;
  changeDate: string;
  effectiveDate: string;            // Ngày có hiệu lực
  
  // Thông tin thay đổi
  oldSalaryBase?: number;
  newSalaryBase?: number;
  reason: string;
  
  // File đính kèm
  documents: string[];
  
  // Người thực hiện
  processedBy: string;
  processedByName: string;
  processedDate: string;
  
  notes?: string;
}

export interface MonthlyInsuranceReport {
  id: string;
  month: string;                    // Format: YYYY-MM
  
  // Thống kê
  totalEmployees: number;           // Tổng số NV tham gia
  totalSalaryBase: number;          // Tổng lương đóng
  
  // Số tiền phải đóng
  amounts: {
    employeeTotal: number;          // Tổng NV phải đóng
    employerTotal: number;          // Tổng công ty phải đóng
    grandTotal: number;             // Tổng cộng
    
    socialInsurance: {
      employee: number;
      employer: number;
      total: number;
    };
    healthInsurance: {
      employee: number;
      employer: number;
      total: number;
    };
    unemploymentInsurance: {
      employee: number;
      employer: number;
      total: number;
    };
  };
  
  // Trạng thái đóng
  isPaid: boolean;
  paidDate?: string;
  paymentReference?: string;        // Mã tham chiếu thanh toán
  
  // File báo cáo
  reportFile?: string;
  
  createdBy: string;
  createdByName: string;
  createdDate: string;
}

export const statusLabels: Record<InsuranceStatus, string> = {
  ACTIVE: 'Đang tham gia',
  SUSPENDED: 'Tạm dừng',
  TERMINATED: 'Đã dừng',
};

export const changeTypeLabels: Record<InsuranceChangeType, string> = {
  NEW_PARTICIPATION: 'Tham gia mới',
  SALARY_ADJUSTMENT: 'Điều chỉnh lương',
  SUSPENSION: 'Tạm dừng',
  RESUMPTION: 'Tiếp tục tham gia',
  TERMINATION: 'Chấm dứt',
  TRANSFER_IN: 'Chuyển đến',
  TRANSFER_OUT: 'Chuyển đi',
};

// Tỷ lệ đóng chuẩn theo quy định (2024)
export const standardRates = {
  socialInsurance: {
    employee: 8,      // 8%
    employer: 17.5,   // 17.5%
  },
  healthInsurance: {
    employee: 1.5,    // 1.5%
    employer: 3,      // 3%
  },
  unemploymentInsurance: {
    employee: 1,      // 1%
    employer: 1,      // 1%
  },
};

// Helper function: Tính số tiền phải đóng
export function calculateInsuranceAmount(salaryBase: number) {
  return {
    socialInsurance: {
      employee: Math.round(salaryBase * standardRates.socialInsurance.employee / 100),
      employer: Math.round(salaryBase * standardRates.socialInsurance.employer / 100),
    },
    healthInsurance: {
      employee: Math.round(salaryBase * standardRates.healthInsurance.employee / 100),
      employer: Math.round(salaryBase * standardRates.healthInsurance.employer / 100),
    },
    unemploymentInsurance: {
      employee: Math.round(salaryBase * standardRates.unemploymentInsurance.employee / 100),
      employer: Math.round(salaryBase * standardRates.unemploymentInsurance.employer / 100),
    },
  };
}

// Mock data - Hồ sơ BHXH
export const mockInsuranceRecords: InsuranceRecord[] = [
  {
    id: 'INS-001',
    employeeId: 'EMP-001',
    employeeName: 'Nguyễn Văn An',
    departmentName: 'Phòng IT',
    position: 'Senior Developer',
    insuranceBookNumber: '0123456789',
    insuranceCode: '0123456789012',
    status: 'ACTIVE',
    startDate: '2023-01-15',
    currentSalaryBase: 20000000,
    rates: standardRates,
    totalMonthsPaid: 24,
    createdBy: 'ADMIN-001',
    createdByName: 'Nguyễn Văn E',
    createdDate: '2023-01-10',
  },
  {
    id: 'INS-002',
    employeeId: 'EMP-002',
    employeeName: 'Lê Thị Cẩm',
    departmentName: 'Phòng Kinh doanh',
    position: 'Sales Executive',
    insuranceBookNumber: '0234567890',
    insuranceCode: '0234567890123',
    status: 'ACTIVE',
    startDate: '2023-06-01',
    currentSalaryBase: 15000000,
    rates: standardRates,
    totalMonthsPaid: 19,
    createdBy: 'ADMIN-001',
    createdByName: 'Nguyễn Văn E',
    createdDate: '2023-05-25',
  },
  {
    id: 'INS-003',
    employeeId: 'EMP-003',
    employeeName: 'Hoàng Minh F',
    departmentName: 'Phòng Kế toán',
    position: 'Accountant',
    insuranceBookNumber: '0345678901',
    insuranceCode: '0345678901234',
    status: 'ACTIVE',
    startDate: '2024-01-15',
    currentSalaryBase: 18000000,
    rates: standardRates,
    totalMonthsPaid: 12,
    createdBy: 'ADMIN-001',
    createdByName: 'Nguyễn Văn E',
    createdDate: '2024-01-10',
  },
  {
    id: 'INS-004',
    employeeId: 'EMP-004',
    employeeName: 'Đỗ Văn H',
    departmentName: 'Phòng Hành chính',
    position: 'Admin Staff',
    insuranceBookNumber: '0456789012',
    insuranceCode: '0456789012345',
    status: 'ACTIVE',
    startDate: '2022-12-01',
    currentSalaryBase: 12000000,
    rates: standardRates,
    totalMonthsPaid: 25,
    createdBy: 'ADMIN-001',
    createdByName: 'Nguyễn Văn E',
    createdDate: '2022-11-25',
  },
  {
    id: 'INS-005',
    employeeId: 'EMP-005',
    employeeName: 'Bùi Thị K',
    departmentName: 'Phòng Marketing',
    position: 'Marketing Specialist',
    insuranceBookNumber: '0567890123',
    insuranceCode: '0567890123456',
    status: 'SUSPENDED',
    startDate: '2022-03-01',
    endDate: '2024-10-31',
    currentSalaryBase: 16000000,
    rates: standardRates,
    totalMonthsPaid: 32,
    notes: 'Tạm dừng do nghỉ thai sản từ 01/11/2024',
    createdBy: 'ADMIN-001',
    createdByName: 'Nguyễn Văn E',
    createdDate: '2022-02-25',
    updatedBy: 'ADMIN-001',
    updatedByName: 'Nguyễn Văn E',
    updatedDate: '2024-10-25',
  },
  {
    id: 'INS-006',
    employeeId: 'EMP-006',
    employeeName: 'Trịnh Văn M',
    departmentName: 'Phòng IT',
    position: 'Junior Developer',
    insuranceBookNumber: '0678901234',
    insuranceCode: '0678901234567',
    status: 'TERMINATED',
    startDate: '2023-07-01',
    endDate: '2024-12-15',
    currentSalaryBase: 13000000,
    rates: standardRates,
    totalMonthsPaid: 17,
    notes: 'Chấm dứt do nhân viên thôi việc',
    createdBy: 'ADMIN-001',
    createdByName: 'Nguyễn Văn E',
    createdDate: '2023-06-25',
    updatedBy: 'ADMIN-001',
    updatedByName: 'Nguyễn Văn E',
    updatedDate: '2024-12-15',
  },
  {
    id: 'INS-007',
    employeeId: 'EMP-007',
    employeeName: 'Phan Thị N',
    departmentName: 'Phòng Nhân sự',
    position: 'HR Specialist',
    insuranceBookNumber: '0789012345',
    insuranceCode: '0789012345678',
    status: 'ACTIVE',
    startDate: '2022-05-01',
    currentSalaryBase: 17000000,
    rates: standardRates,
    totalMonthsPaid: 32,
    createdBy: 'ADMIN-001',
    createdByName: 'Nguyễn Văn E',
    createdDate: '2022-04-25',
  },
];

// Mock data - Lịch sử thay đổi
export const mockInsuranceChanges: InsuranceChange[] = [
  {
    id: 'CHG-001',
    recordId: 'INS-001',
    changeType: 'NEW_PARTICIPATION',
    changeDate: '2023-01-10',
    effectiveDate: '2023-01-15',
    newSalaryBase: 18000000,
    reason: 'Tham gia BHXH lần đầu khi ký hợp đồng chính thức',
    documents: ['to-khai-tham-gia-bhxh.pdf', 'hop-dong-lao-dong.pdf'],
    processedBy: 'ADMIN-001',
    processedByName: 'Nguyễn Văn E',
    processedDate: '2023-01-10',
  },
  {
    id: 'CHG-002',
    recordId: 'INS-001',
    changeType: 'SALARY_ADJUSTMENT',
    changeDate: '2024-01-05',
    effectiveDate: '2024-01-01',
    oldSalaryBase: 18000000,
    newSalaryBase: 20000000,
    reason: 'Điều chỉnh tăng lương theo hiệu quả công việc',
    documents: ['quyet-dinh-tang-luong.pdf'],
    processedBy: 'ADMIN-001',
    processedByName: 'Nguyễn Văn E',
    processedDate: '2024-01-05',
  },
  {
    id: 'CHG-003',
    recordId: 'INS-005',
    changeType: 'SUSPENSION',
    changeDate: '2024-10-25',
    effectiveDate: '2024-11-01',
    oldSalaryBase: 16000000,
    reason: 'Tạm dừng BHXH do nghỉ thai sản',
    documents: ['giay-nghi-thai-san.pdf', 'bien-ban-tam-dung.pdf'],
    processedBy: 'ADMIN-001',
    processedByName: 'Nguyễn Văn E',
    processedDate: '2024-10-25',
  },
  {
    id: 'CHG-004',
    recordId: 'INS-006',
    changeType: 'TERMINATION',
    changeDate: '2024-12-15',
    effectiveDate: '2024-12-15',
    oldSalaryBase: 13000000,
    reason: 'Chấm dứt BHXH do nhân viên thôi việc',
    documents: ['don-xin-thoi-viec.pdf', 'bien-ban-cham-dut.pdf'],
    processedBy: 'ADMIN-001',
    processedByName: 'Nguyễn Văn E',
    processedDate: '2024-12-15',
  },
  {
    id: 'CHG-005',
    recordId: 'INS-007',
    changeType: 'SALARY_ADJUSTMENT',
    changeDate: '2023-05-10',
    effectiveDate: '2023-05-01',
    oldSalaryBase: 15000000,
    newSalaryBase: 17000000,
    reason: 'Điều chỉnh tăng lương định kỳ hàng năm',
    documents: ['quyet-dinh-dieu-chinh-luong.pdf'],
    processedBy: 'ADMIN-001',
    processedByName: 'Nguyễn Văn E',
    processedDate: '2023-05-10',
  },
];

// Mock data - Báo cáo tháng
export const mockMonthlyReports: MonthlyInsuranceReport[] = [
  {
    id: 'RPT-2024-12',
    month: '2024-12',
    totalEmployees: 6,
    totalSalaryBase: 101000000,
    amounts: {
      employeeTotal: 10605000,
      employerTotal: 21757500,
      grandTotal: 32362500,
      socialInsurance: {
        employee: 8080000,
        employer: 17675000,
        total: 25755000,
      },
      healthInsurance: {
        employee: 1515000,
        employer: 3030000,
        total: 4545000,
      },
      unemploymentInsurance: {
        employee: 1010000,
        employer: 1010000,
        total: 2020000,
      },
    },
    isPaid: true,
    paidDate: '2024-12-20',
    paymentReference: 'PAY-2024-12-001',
    reportFile: 'bao-cao-bhxh-thang-12-2024.pdf',
    createdBy: 'ADMIN-001',
    createdByName: 'Nguyễn Văn E',
    createdDate: '2024-12-05',
  },
  {
    id: 'RPT-2024-11',
    month: '2024-11',
    totalEmployees: 7,
    totalSalaryBase: 117000000,
    amounts: {
      employeeTotal: 12285000,
      employerTotal: 25207500,
      grandTotal: 37492500,
      socialInsurance: {
        employee: 9360000,
        employer: 20475000,
        total: 29835000,
      },
      healthInsurance: {
        employee: 1755000,
        employer: 3510000,
        total: 5265000,
      },
      unemploymentInsurance: {
        employee: 1170000,
        employer: 1170000,
        total: 2340000,
      },
    },
    isPaid: true,
    paidDate: '2024-11-20',
    paymentReference: 'PAY-2024-11-001',
    reportFile: 'bao-cao-bhxh-thang-11-2024.pdf',
    createdBy: 'ADMIN-001',
    createdByName: 'Nguyễn Văn E',
    createdDate: '2024-11-05',
  },
  {
    id: 'RPT-2024-10',
    month: '2024-10',
    totalEmployees: 7,
    totalSalaryBase: 117000000,
    amounts: {
      employeeTotal: 12285000,
      employerTotal: 25207500,
      grandTotal: 37492500,
      socialInsurance: {
        employee: 9360000,
        employer: 20475000,
        total: 29835000,
      },
      healthInsurance: {
        employee: 1755000,
        employer: 3510000,
        total: 5265000,
      },
      unemploymentInsurance: {
        employee: 1170000,
        employer: 1170000,
        total: 2340000,
      },
    },
    isPaid: true,
    paidDate: '2024-10-20',
    paymentReference: 'PAY-2024-10-001',
    reportFile: 'bao-cao-bhxh-thang-10-2024.pdf',
    createdBy: 'ADMIN-001',
    createdByName: 'Nguyễn Văn E',
    createdDate: '2024-10-05',
  },
];

export function calculateInsuranceStatistics(records: InsuranceRecord[]) {
  return {
    total: records.length,
    active: records.filter(r => r.status === 'ACTIVE').length,
    suspended: records.filter(r => r.status === 'SUSPENDED').length,
    terminated: records.filter(r => r.status === 'TERMINATED').length,
    totalMonths: records.reduce((sum, r) => sum + r.totalMonthsPaid, 0),
    totalSalaryBase: records
      .filter(r => r.status === 'ACTIVE')
      .reduce((sum, r) => sum + r.currentSalaryBase, 0),
  };
}