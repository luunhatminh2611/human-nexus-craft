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
  
  decisionNumber: string | null;
  decisionDate: string | null;
  
  country: string;
  purpose: string;
  fundingSource: string;
  
  plannedDepartureDate: string;
  plannedReturnDate: string;
  actualDepartureDate: string | null;
  actualReturnDate: string | null;
  durationDays: number | null;
  
  estimatedCost: number;
  actualCost: number | null;
  
  status: 'PENDING' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
  
  createdBy: string;
  createdByName: string;
  approvedBy: string | null;
  approvedByName: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  
  attachments?: string[];
  notes?: string;
  
  createdAt: string;
  updatedAt: string;
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
    
    plannedDepartureDate: '2024-02-10',
    plannedReturnDate: '2024-02-15',
    actualDepartureDate: '2024-02-10',
    actualReturnDate: '2024-02-15',
    durationDays: 5,
    
    estimatedCost: 50000000,
    actualCost: 48500000,
    
    status: 'COMPLETED',
    
    createdBy: 'EMP001',
    createdByName: 'Nguyễn Văn An',
    approvedBy: 'ADMIN001',
    approvedByName: 'Trần Thị Bích',
    approvedAt: '2024-01-15T10:30:00',
    rejectionReason: null,
    
    attachments: ['visa-scan.pdf', 'flight-ticket.pdf'],
    notes: 'Hội nghị diễn ra tại Marina Bay Sands',
    
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
    
    decisionNumber: null,
    decisionDate: null,
    
    country: 'Nhật Bản',
    purpose: 'Đào tạo chuyên môn về quản lý nhân sự',
    fundingSource: 'COMPANY',
    
    plannedDepartureDate: '2024-03-20',
    plannedReturnDate: '2024-03-27',
    actualDepartureDate: null,
    actualReturnDate: null,
    durationDays: null,
    
    estimatedCost: 80000000,
    actualCost: null,
    
    status: 'PENDING',
    
    createdBy: 'EMP002',
    createdByName: 'Lê Thị Hương',
    approvedBy: null,
    approvedByName: null,
    approvedAt: null,
    rejectionReason: null,
    
    notes: 'Khóa đào tạo tại Tokyo',
    
    createdAt: '2024-02-20T14:30:00',
    updatedAt: '2024-02-20T14:30:00',
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
    
    plannedDepartureDate: '2024-02-25',
    plannedReturnDate: '2024-02-28',
    actualDepartureDate: '2024-02-25',
    actualReturnDate: null,
    durationDays: null,
    
    estimatedCost: 35000000,
    actualCost: null,
    
    status: 'IN_PROGRESS',
    
    createdBy: 'EMP003',
    createdByName: 'Phạm Minh Tuấn',
    approvedBy: 'ADMIN001',
    approvedByName: 'Trần Thị Bích',
    approvedAt: '2024-02-01T11:00:00',
    rejectionReason: null,
    
    attachments: ['meeting-schedule.pdf'],
    notes: 'Buổi họp tại Seoul',
    
    createdAt: '2024-01-25T16:00:00',
    updatedAt: '2024-02-25T08:00:00',
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
    
    decisionNumber: null,
    decisionDate: null,
    
    country: 'Thái Lan',
    purpose: 'Hội thảo kỹ thuật',
    fundingSource: 'PARTNER',
    
    plannedDepartureDate: '2024-04-10',
    plannedReturnDate: '2024-04-13',
    actualDepartureDate: null,
    actualReturnDate: null,
    durationDays: null,
    
    estimatedCost: 15000000,
    actualCost: null,
    
    status: 'REJECTED',
    
    createdBy: 'EMP004',
    createdByName: 'Hoàng Văn Đức',
    approvedBy: 'ADMIN001',
    approvedByName: 'Trần Thị Bích',
    approvedAt: null,
    rejectionReason: 'Không đủ ngân sách trong quý này',
    
    createdAt: '2024-02-15T10:00:00',
    updatedAt: '2024-02-18T15:30:00',
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
    
    plannedDepartureDate: '2024-03-05',
    plannedReturnDate: '2024-03-08',
    actualDepartureDate: null,
    actualReturnDate: null,
    durationDays: null,
    
    estimatedCost: 25000000,
    actualCost: null,
    
    status: 'APPROVED',
    
    createdBy: 'EMP005',
    createdByName: 'Đỗ Thị Mai',
    approvedBy: 'ADMIN001',
    approvedByName: 'Trần Thị Bích',
    approvedAt: '2024-02-10T09:15:00',
    rejectionReason: null,
    
    attachments: ['exhibition-info.pdf'],
    
    createdAt: '2024-02-05T13:00:00',
    updatedAt: '2024-02-10T09:15:00',
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
    
    decisionNumber: null,
    decisionDate: null,
    
    country: 'Úc',
    purpose: 'Workshop về phát triển tổ chức',
    fundingSource: 'COMPANY',
    
    plannedDepartureDate: '2024-05-15',
    plannedReturnDate: '2024-05-22',
    actualDepartureDate: null,
    actualReturnDate: null,
    durationDays: null,
    
    estimatedCost: 120000000,
    actualCost: null,
    
    status: 'PENDING',
    
    createdBy: 'EMP006',
    createdByName: 'Vũ Quang Hải',
    approvedBy: null,
    approvedByName: null,
    approvedAt: null,
    rejectionReason: null,
    
    notes: 'Workshop tại Sydney',
    
    createdAt: '2024-02-22T11:30:00',
    updatedAt: '2024-02-22T11:30:00',
  },
];

export function calculateOverseasStatistics(trips: OverseasTrip[]) {
  return {
    total: trips.length,
    pending: trips.filter(t => t.status === 'PENDING').length,
    approved: trips.filter(t => t.status === 'APPROVED').length,
    inProgress: trips.filter(t => t.status === 'IN_PROGRESS').length,
    completed: trips.filter(t => t.status === 'COMPLETED').length,
    rejected: trips.filter(t => t.status === 'REJECTED').length,
    totalEstimatedCost: trips.reduce((sum, t) => sum + t.estimatedCost, 0),
    totalActualCost: trips.reduce((sum, t) => sum + (t.actualCost || 0), 0),
  };
}

export const fundingSourceLabels = {
  COMPANY: 'Công ty',
  PERSONAL: 'Cá nhân',
  PARTNER: 'Đối tác',
};

export const statusLabels = {
  PENDING: 'Chờ phê duyệt',
  APPROVED: 'Đã phê duyệt',
  IN_PROGRESS: 'Đang thực hiện',
  COMPLETED: 'Hoàn thành',
  REJECTED: 'Từ chối',
};