// Mock data cho quản lý bằng cấp

export interface Degree {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  position: string;
  type: 'EDUCATION' | 'CERTIFICATION' | 'LICENSE';
  name: string;
  institution: string;
  major?: string;
  level?: string;
  issueDate: string;
  expiryDate?: string;
  certificateNumber?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  documentUrl?: string;
  submittedDate: string;
  reviewedBy?: string;
  reviewedDate?: string;
  rejectionReason?: string;
  notes?: string;
}

export interface DegreeHistory {
  id: string;
  degreeId: string;
  action: 'CREATED' | 'UPDATED' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  performedBy: string;
  performedDate: string;
  notes?: string;
}

// Mock danh sách bằng cấp
export const mockDegrees: Degree[] = [
  {
    id: 'DEG001',
    employeeId: 'EMP001',
    employeeName: 'Nguyễn Văn An',
    employeeCode: 'NV001',
    department: 'Phòng IT',
    position: 'Trưởng phòng IT',
    type: 'EDUCATION',
    name: 'Cử nhân Khoa học Máy tính',
    institution: 'Đại học Bách Khoa Hà Nội',
    major: 'Khoa học Máy tính',
    level: 'Cử nhân',
    issueDate: '2019-06-15',
    certificateNumber: 'BKHN-2019-12345',
    status: 'APPROVED',
    documentUrl: '/documents/degree-001.pdf',
    submittedDate: '2024-01-15T10:30:00',
    reviewedBy: 'Trần Thị Hương (HR)',
    reviewedDate: '2024-01-16T14:20:00',
    notes: 'Đã xác minh với trường',
  },
  {
    id: 'DEG002',
    employeeId: 'EMP001',
    employeeName: 'Nguyễn Văn An',
    employeeCode: 'NV001',
    department: 'Phòng IT',
    position: 'Trưởng phòng IT',
    type: 'CERTIFICATION',
    name: 'PMP (Project Management Professional)',
    institution: 'PMI (Project Management Institute)',
    issueDate: '2022-03-20',
    expiryDate: '2025-03-20',
    certificateNumber: 'PMP-2022-67890',
    status: 'APPROVED',
    documentUrl: '/documents/cert-pmp-001.pdf',
    submittedDate: '2024-01-15T11:00:00',
    reviewedBy: 'Trần Thị Hương (HR)',
    reviewedDate: '2024-01-16T15:00:00',
  },
  {
    id: 'DEG003',
    employeeId: 'EMP002',
    employeeName: 'Trần Thị Bình',
    employeeCode: 'NV002',
    department: 'Phòng Nhân sự',
    position: 'Nhân viên HR',
    type: 'EDUCATION',
    name: 'Thạc sĩ Quản trị Nhân lực',
    institution: 'Đại học Kinh tế Quốc dân',
    major: 'Quản trị Nhân lực',
    level: 'Thạc sĩ',
    issueDate: '2023-12-10',
    certificateNumber: 'NEU-2023-54321',
    status: 'PENDING',
    documentUrl: '/documents/degree-002.pdf',
    submittedDate: '2024-12-20T09:15:00',
    notes: 'Vừa hoàn thành khóa học',
  },
  {
    id: 'DEG004',
    employeeId: 'EMP002',
    employeeName: 'Trần Thị Bình',
    employeeCode: 'NV002',
    department: 'Phòng Nhân sự',
    position: 'Nhân viên HR',
    type: 'CERTIFICATION',
    name: 'SHRM-CP (Society for Human Resource Management)',
    institution: 'SHRM',
    issueDate: '2023-05-15',
    expiryDate: '2026-05-15',
    certificateNumber: 'SHRM-2023-11111',
    status: 'APPROVED',
    documentUrl: '/documents/cert-shrm-001.pdf',
    submittedDate: '2024-02-10T10:00:00',
    reviewedBy: 'Trần Thị Hương (HR)',
    reviewedDate: '2024-02-11T16:30:00',
  },
  {
    id: 'DEG005',
    employeeId: 'EMP003',
    employeeName: 'Lê Văn Cường',
    employeeCode: 'NV003',
    department: 'Phòng Kinh doanh',
    position: 'Giám đốc Kinh doanh',
    type: 'EDUCATION',
    name: 'Cử nhân Kinh tế',
    institution: 'Đại học Ngoại thương',
    major: 'Kinh tế Đối ngoại',
    level: 'Cử nhân',
    issueDate: '2015-07-20',
    certificateNumber: 'FTU-2015-98765',
    status: 'APPROVED',
    documentUrl: '/documents/degree-003.pdf',
    submittedDate: '2024-01-20T11:30:00',
    reviewedBy: 'Trần Thị Hương (HR)',
    reviewedDate: '2024-01-21T09:00:00',
  },
  {
    id: 'DEG006',
    employeeId: 'EMP003',
    employeeName: 'Lê Văn Cường',
    employeeCode: 'NV003',
    department: 'Phòng Kinh doanh',
    position: 'Giám đốc Kinh doanh',
    type: 'CERTIFICATION',
    name: 'AWS Solutions Architect - Associate',
    institution: 'Amazon Web Services',
    issueDate: '2023-08-10',
    expiryDate: '2026-08-10',
    certificateNumber: 'AWS-2023-22222',
    status: 'APPROVED',
    documentUrl: '/documents/cert-aws-001.pdf',
    submittedDate: '2024-03-05T14:00:00',
    reviewedBy: 'Trần Thị Hương (HR)',
    reviewedDate: '2024-03-06T10:30:00',
  },
  {
    id: 'DEG007',
    employeeId: 'EMP004',
    employeeName: 'Phạm Thị Dung',
    employeeCode: 'NV004',
    department: 'Phòng Marketing',
    position: 'Trưởng phòng Marketing',
    type: 'EDUCATION',
    name: 'Thạc sĩ Marketing',
    institution: 'Đại học Kinh tế TP.HCM',
    major: 'Marketing',
    level: 'Thạc sĩ',
    issueDate: '2020-09-15',
    certificateNumber: 'UEH-2020-33333',
    status: 'APPROVED',
    documentUrl: '/documents/degree-004.pdf',
    submittedDate: '2024-01-25T13:45:00',
    reviewedBy: 'Trần Thị Hương (HR)',
    reviewedDate: '2024-01-26T11:00:00',
  },
  {
    id: 'DEG008',
    employeeId: 'EMP004',
    employeeName: 'Phạm Thị Dung',
    employeeCode: 'NV004',
    department: 'Phòng Marketing',
    position: 'Trưởng phòng Marketing',
    type: 'CERTIFICATION',
    name: 'Google Ads Certification',
    institution: 'Google',
    issueDate: '2023-11-20',
    expiryDate: '2024-11-20',
    certificateNumber: 'GOOGLE-2023-44444',
    status: 'EXPIRED',
    documentUrl: '/documents/cert-google-001.pdf',
    submittedDate: '2024-04-10T09:00:00',
    reviewedBy: 'Trần Thị Hương (HR)',
    reviewedDate: '2024-04-11T14:00:00',
    notes: 'Chứng chỉ đã hết hạn, cần gia hạn',
  },
  {
    id: 'DEG009',
    employeeId: 'EMP005',
    employeeName: 'Hoàng Văn Em',
    employeeCode: 'NV005',
    department: 'Phòng Kế toán',
    position: 'Kế toán viên',
    type: 'CERTIFICATION',
    name: 'Chứng chỉ Kế toán trưởng',
    institution: 'Bộ Tài chính',
    issueDate: '2022-06-30',
    certificateNumber: 'MOF-2022-55555',
    status: 'APPROVED',
    documentUrl: '/documents/cert-accounting-001.pdf',
    submittedDate: '2024-02-15T10:30:00',
    reviewedBy: 'Trần Thị Hương (HR)',
    reviewedDate: '2024-02-16T15:45:00',
  },
  {
    id: 'DEG010',
    employeeId: 'EMP006',
    employeeName: 'Vũ Thị Giang',
    employeeCode: 'NV006',
    department: 'Phòng IT',
    position: 'Lập trình viên',
    type: 'EDUCATION',
    name: 'Cử nhân Công nghệ Thông tin',
    institution: 'Đại học FPT',
    major: 'Công nghệ Thông tin',
    level: 'Cử nhân',
    issueDate: '2021-08-25',
    certificateNumber: 'FPT-2021-66666',
    status: 'REJECTED',
    documentUrl: '/documents/degree-006.pdf',
    submittedDate: '2024-12-18T14:20:00',
    reviewedBy: 'Trần Thị Hương (HR)',
    reviewedDate: '2024-12-19T10:15:00',
    rejectionReason: 'Tài liệu không rõ ràng, vui lòng upload lại bản scan chất lượng tốt hơn',
  },
  {
    id: 'DEG011',
    employeeId: 'EMP007',
    employeeName: 'Đỗ Văn Hải',
    employeeCode: 'NV007',
    department: 'Phòng IT',
    position: 'DevOps Engineer',
    type: 'CERTIFICATION',
    name: 'Certified Kubernetes Administrator (CKA)',
    institution: 'Cloud Native Computing Foundation',
    issueDate: '2023-09-15',
    expiryDate: '2026-09-15',
    certificateNumber: 'CNCF-2023-77777',
    status: 'APPROVED',
    documentUrl: '/documents/cert-k8s-001.pdf',
    submittedDate: '2024-05-20T11:00:00',
    reviewedBy: 'Trần Thị Hương (HR)',
    reviewedDate: '2024-05-21T09:30:00',
  },
  {
    id: 'DEG012',
    employeeId: 'EMP008',
    employeeName: 'Ngô Thị Hồng',
    employeeCode: 'NV008',
    department: 'Phòng Pháp chế',
    position: 'Chuyên viên Pháp lý',
    type: 'LICENSE',
    name: 'Chứng chỉ hành nghề Luật sư',
    institution: 'Bộ Tư pháp',
    issueDate: '2020-12-10',
    expiryDate: '2025-12-10',
    certificateNumber: 'MOJ-2020-88888',
    status: 'APPROVED',
    documentUrl: '/documents/license-lawyer-001.pdf',
    submittedDate: '2024-03-15T13:00:00',
    reviewedBy: 'Trần Thị Hương (HR)',
    reviewedDate: '2024-03-16T16:00:00',
  },
  {
    id: 'DEG013',
    employeeId: 'EMP009',
    employeeName: 'Bùi Văn Inh',
    employeeCode: 'NV009',
    department: 'Phòng Nhân sự',
    position: 'Trưởng phòng Nhân sự',
    type: 'EDUCATION',
    name: 'Thạc sĩ Quản trị Kinh doanh (MBA)',
    institution: 'Đại học Quốc gia Hà Nội',
    major: 'Quản trị Kinh doanh',
    level: 'Thạc sĩ',
    issueDate: '2021-11-30',
    certificateNumber: 'VNU-2021-99999',
    status: 'APPROVED',
    documentUrl: '/documents/degree-009.pdf',
    submittedDate: '2024-02-20T10:00:00',
    reviewedBy: 'Trần Thị Hương (HR)',
    reviewedDate: '2024-02-21T14:30:00',
  },
  {
    id: 'DEG014',
    employeeId: 'EMP010',
    employeeName: 'Trương Thị Kim',
    employeeCode: 'NV010',
    department: 'Phòng Marketing',
    position: 'Nhân viên Marketing',
    type: 'CERTIFICATION',
    name: 'Facebook Blueprint Certification',
    institution: 'Meta',
    issueDate: '2024-01-10',
    expiryDate: '2025-01-10',
    certificateNumber: 'META-2024-10101',
    status: 'PENDING',
    documentUrl: '/documents/cert-facebook-001.pdf',
    submittedDate: '2024-12-21T15:30:00',
    notes: 'Chứng chỉ mới lấy',
  },
  {
    id: 'DEG015',
    employeeId: 'EMP011',
    employeeName: 'Lý Văn Long',
    employeeCode: 'NV011',
    department: 'Phòng Kinh doanh',
    position: 'Nhân viên Kinh doanh',
    type: 'EDUCATION',
    name: 'Cử nhân Quản trị Kinh doanh',
    institution: 'Đại học Thương mại',
    major: 'Quản trị Kinh doanh',
    level: 'Cử nhân',
    issueDate: '2022-07-15',
    certificateNumber: 'TMU-2022-12121',
    status: 'PENDING',
    documentUrl: '/documents/degree-011.pdf',
    submittedDate: '2024-12-22T08:45:00',
  },
];

// Mock lịch sử thay đổi
export const mockDegreeHistory: DegreeHistory[] = [
  {
    id: 'HIST001',
    degreeId: 'DEG001',
    action: 'CREATED',
    performedBy: 'Nguyễn Văn An',
    performedDate: '2024-01-15T10:30:00',
    notes: 'Nhân viên tạo yêu cầu thêm bằng cấp',
  },
  {
    id: 'HIST002',
    degreeId: 'DEG001',
    action: 'APPROVED',
    performedBy: 'Trần Thị Hương (HR)',
    performedDate: '2024-01-16T14:20:00',
    notes: 'Đã xác minh với trường, phê duyệt',
  },
  {
    id: 'HIST003',
    degreeId: 'DEG010',
    action: 'CREATED',
    performedBy: 'Vũ Thị Giang',
    performedDate: '2024-12-18T14:20:00',
  },
  {
    id: 'HIST004',
    degreeId: 'DEG010',
    action: 'REJECTED',
    performedBy: 'Trần Thị Hương (HR)',
    performedDate: '2024-12-19T10:15:00',
    notes: 'Tài liệu không rõ ràng',
  },
];

// Thống kê
export interface DegreeStatistics {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  expired: number;
  expiringSoon: number; // Hết hạn trong 30 ngày
}

export const calculateStatistics = (degrees: Degree[]): DegreeStatistics => {
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  return {
    total: degrees.length,
    pending: degrees.filter(d => d.status === 'PENDING').length,
    approved: degrees.filter(d => d.status === 'APPROVED').length,
    rejected: degrees.filter(d => d.status === 'REJECTED').length,
    expired: degrees.filter(d => d.status === 'EXPIRED').length,
    expiringSoon: degrees.filter(d => {
      if (!d.expiryDate) return false;
      const expiryDate = new Date(d.expiryDate);
      return expiryDate > now && expiryDate <= thirtyDaysFromNow;
    }).length,
  };
};