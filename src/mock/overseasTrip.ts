// mock/overseasTrip.ts

export interface OverseasTrip {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  departmentId: string;
  departmentName: string;
  positionId: string;
  positionName: string;
  
  decisionNumber: string;
  decisionDate: string;
  
  country: string;
  purpose: string;
  fundingSource: 'COMPANY' | 'PERSONAL' | 'PARTNER';
  
  departureDate: string;
  returnDate: string;
  durationDays: number;
  
  estimatedCost: number;
  actualCost: number | null;
  
  attachments?: string[];
  notes?: string;
  
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedBy?: string;
  updatedByName?: string;
  updatedAt?: string;
}

export interface OverseasTripHistory {
  id: string;
  tripId: string;
  action: 'CREATED' | 'UPDATED' | 'DELETED';
  performedBy: string;
  performedByName: string;
  performedDate: string;
  notes?: string;
}

export const mockOverseasTrips: OverseasTrip[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    employeeName: 'Nguyễn Văn An',
    employeeCode: 'NV001',
    departmentId: 'DEPT001',
    departmentName: 'Phòng Kỹ thuật',
    positionId: 'POS001',
    positionName: 'Trưởng phòng',
    
    decisionNumber: 'QĐ-001/2024',
    decisionDate: '2024-01-15',
    
    country: 'Singapore',
    purpose: 'Tham dự hội nghị công nghệ châu Á',
    fundingSource: 'COMPANY',
    
    departureDate: '2024-02-10',
    returnDate: '2024-02-15',
    durationDays: 5,
    
    estimatedCost: 50000000,
    actualCost: 48500000,
    
    attachments: ['visa-scan.pdf', 'flight-ticket.pdf'],
    notes: 'Hội nghị diễn ra tại Marina Bay Sands',
    
    createdBy: 'ADMIN001',
    createdByName: 'Trần Thị Bích (HR)',
    createdAt: '2024-01-10T09:00:00',
    updatedAt: '2024-02-15T18:00:00',
  },
  {
    id: '2',
    employeeId: 'EMP002',
    employeeName: 'Lê Thị Hương',
    employeeCode: 'NV002',
    departmentId: 'DEPT002',
    departmentName: 'Phòng Nhân sự',
    positionId: 'POS002',
    positionName: 'Nhân viên',
    
    decisionNumber: 'QĐ-005/2024',
    decisionDate: '2024-03-10',
    
    country: 'Nhật Bản',
    purpose: 'Đào tạo chuyên môn về quản lý nhân sự',
    fundingSource: 'COMPANY',
    
    departureDate: '2024-03-20',
    returnDate: '2024-03-27',
    durationDays: 7,
    
    estimatedCost: 80000000,
    actualCost: 78000000,
    
    notes: 'Khóa đào tạo tại Tokyo',
    
    createdBy: 'ADMIN001',
    createdByName: 'Trần Thị Bích (HR)',
    createdAt: '2024-02-20T14:30:00',
  },
  {
    id: '3',
    employeeId: 'EMP003',
    employeeName: 'Phạm Minh Tuấn',
    employeeCode: 'NV003',
    departmentId: 'DEPT003',
    departmentName: 'Phòng Kinh doanh',
    positionId: 'POS003',
    positionName: 'Giám đốc',
    
    decisionNumber: 'QĐ-002/2024',
    decisionDate: '2024-02-01',
    
    country: 'Hàn Quốc',
    purpose: 'Gặp gỡ đối tác chiến lược',
    fundingSource: 'COMPANY',
    
    departureDate: '2024-02-25',
    returnDate: '2024-02-28',
    durationDays: 3,
    
    estimatedCost: 35000000,
    actualCost: 33000000,
    
    attachments: ['meeting-schedule.pdf'],
    notes: 'Buổi họp tại Seoul',
    
    createdBy: 'ADMIN001',
    createdByName: 'Trần Thị Bích (HR)',
    createdAt: '2024-01-25T16:00:00',
  },
  {
    id: '4',
    employeeId: 'EMP004',
    employeeName: 'Hoàng Văn Đức',
    employeeCode: 'NV004',
    departmentId: 'DEPT001',
    departmentName: 'Phòng Kỹ thuật',
    positionId: 'POS002',
    positionName: 'Nhân viên',
    
    decisionNumber: 'QĐ-008/2023',
    decisionDate: '2023-11-20',
    
    country: 'Thái Lan',
    purpose: 'Hội thảo kỹ thuật',
    fundingSource: 'PARTNER',
    
    departureDate: '2023-12-10',
    returnDate: '2023-12-13',
    durationDays: 3,
    
    estimatedCost: 15000000,
    actualCost: 14500000,
    
    createdBy: 'ADMIN001',
    createdByName: 'Trần Thị Bích (HR)',
    createdAt: '2023-11-15T10:00:00',
  },
  {
    id: '5',
    employeeId: 'EMP005',
    employeeName: 'Đỗ Thị Mai',
    employeeCode: 'NV005',
    departmentId: 'DEPT004',
    departmentName: 'Phòng Marketing',
    positionId: 'POS001',
    positionName: 'Trưởng phòng',
    
    decisionNumber: 'QĐ-003/2024',
    decisionDate: '2024-02-10',
    
    country: 'Malaysia',
    purpose: 'Triển lãm sản phẩm quốc tế',
    fundingSource: 'COMPANY',
    
    departureDate: '2024-03-05',
    returnDate: '2024-03-08',
    durationDays: 3,
    
    estimatedCost: 25000000,
    actualCost: 26000000,
    
    attachments: ['exhibition-info.pdf'],
    
    createdBy: 'ADMIN001',
    createdByName: 'Trần Thị Bích (HR)',
    createdAt: '2024-02-05T13:00:00',
  },
  {
    id: '6',
    employeeId: 'EMP006',
    employeeName: 'Vũ Quang Hải',
    employeeCode: 'NV006',
    departmentId: 'DEPT002',
    departmentName: 'Phòng Nhân sự',
    positionId: 'POS001',
    positionName: 'Trưởng phòng',
    
    decisionNumber: 'QĐ-010/2023',
    decisionDate: '2023-10-15',
    
    country: 'Úc',
    purpose: 'Workshop về phát triển tổ chức',
    fundingSource: 'COMPANY',
    
    departureDate: '2023-11-15',
    returnDate: '2023-11-22',
    durationDays: 7,
    
    estimatedCost: 120000000,
    actualCost: 118000000,
    
    notes: 'Workshop tại Sydney',
    
    createdBy: 'ADMIN001',
    createdByName: 'Trần Thị Bích (HR)',
    createdAt: '2023-10-10T11:30:00',
  },
  {
    id: '7',
    employeeId: 'EMP001',
    employeeName: 'Nguyễn Văn An',
    employeeCode: 'NV001',
    departmentId: 'DEPT001',
    departmentName: 'Phòng Kỹ thuật',
    positionId: 'POS001',
    positionName: 'Trưởng phòng',
    
    decisionNumber: 'QĐ-015/2023',
    decisionDate: '2023-09-05',
    
    country: 'Mỹ',
    purpose: 'Hội nghị công nghệ Silicon Valley',
    fundingSource: 'COMPANY',
    
    departureDate: '2023-10-01',
    returnDate: '2023-10-07',
    durationDays: 6,
    
    estimatedCost: 150000000,
    actualCost: 145000000,
    
    notes: 'Hội nghị tại San Francisco',
    
    createdBy: 'ADMIN001',
    createdByName: 'Trần Thị Bích (HR)',
    createdAt: '2023-08-20T09:00:00',
  },
];

export const mockOverseasTripHistory: OverseasTripHistory[] = [
  {
    id: 'HIST001',
    tripId: '1',
    action: 'CREATED',
    performedBy: 'ADMIN001',
    performedByName: 'Trần Thị Bích (HR)',
    performedDate: '2024-01-10T09:00:00',
    notes: 'Tạo hồ sơ xuất cảnh cho nhân viên',
  },
  {
    id: 'HIST002',
    tripId: '1',
    action: 'UPDATED',
    performedBy: 'ADMIN001',
    performedByName: 'Trần Thị Bích (HR)',
    performedDate: '2024-02-15T18:00:00',
    notes: 'Cập nhật chi phí thực tế',
  },
  {
    id: 'HIST003',
    tripId: '2',
    action: 'CREATED',
    performedBy: 'ADMIN001',
    performedByName: 'Trần Thị Bích (HR)',
    performedDate: '2024-02-20T14:30:00',
    notes: 'Tạo hồ sơ xuất cảnh mới',
  },
];

export function calculateOverseasStatistics(trips: OverseasTrip[]) {
  const currentYear = new Date().getFullYear();
  const thisYearTrips = trips.filter(t => new Date(t.departureDate).getFullYear() === currentYear);
  
  return {
    total: trips.length,
    thisYear: thisYearTrips.length,
    totalEstimatedCost: trips.reduce((sum, t) => sum + t.estimatedCost, 0),
    totalActualCost: trips.reduce((sum, t) => sum + (t.actualCost || 0), 0),
    byFundingSource: {
      company: trips.filter(t => t.fundingSource === 'COMPANY').length,
      personal: trips.filter(t => t.fundingSource === 'PERSONAL').length,
      partner: trips.filter(t => t.fundingSource === 'PARTNER').length,
    },
    totalDays: trips.reduce((sum, t) => sum + t.durationDays, 0),
  };
}

export const fundingSourceLabels = {
  COMPANY: 'Công ty',
  PERSONAL: 'Cá nhân',
  PARTNER: 'Đối tác',
} as const;