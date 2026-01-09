// Mock data cho quản lý bằng cấp (Lưu trữ)

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
  documentUrl?: string;
  createdDate: string;
  createdBy: string;
  updatedDate?: string;
  updatedBy?: string;
  notes?: string;
}

export interface DegreeHistory {
  id: string;
  degreeId: string;
  action: 'CREATED' | 'UPDATED' | 'DELETED';
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
    documentUrl: '/documents/degree-001.pdf',
    createdDate: '2024-01-15T10:30:00',
    createdBy: 'Admin (HR)',
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
    documentUrl: '/documents/cert-pmp-001.pdf',
    createdDate: '2024-01-15T11:00:00',
    createdBy: 'Admin (HR)',
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
    documentUrl: '/documents/degree-002.pdf',
    createdDate: '2024-12-20T09:15:00',
    createdBy: 'Admin (HR)',
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
    documentUrl: '/documents/cert-shrm-001.pdf',
    createdDate: '2024-02-10T10:00:00',
    createdBy: 'Admin (HR)',
  },
  {
    id: 'DEG005',
    employeeId: 'EMP003',
    employeeName: 'Lê Văn Cường',
    employeeCode: 'NV003',
    department: 'Phòng Kinh doanh',
    position: 'Giám đốc Kinh doanh',
    type: 'EDUCATION',
    name: 'Thạc sĩ Quản trị Kinh doanh (MBA)',
    institution: 'Đại học Ngoại thương',
    major: 'Quản trị Kinh doanh',
    level: 'Thạc sĩ',
    issueDate: '2021-07-20',
    certificateNumber: 'FTU-2021-33333',
    documentUrl: '/documents/degree-003.pdf',
    createdDate: '2024-01-20T14:00:00',
    createdBy: 'Admin (HR)',
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
    documentUrl: '/documents/cert-aws-001.pdf',
    createdDate: '2024-03-05T14:00:00',
    createdBy: 'Admin (HR)',
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
    documentUrl: '/documents/degree-004.pdf',
    createdDate: '2024-01-25T13:45:00',
    createdBy: 'Admin (HR)',
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
    expiryDate: '2025-11-20',
    certificateNumber: 'GOOGLE-2023-44444',
    documentUrl: '/documents/cert-google-001.pdf',
    createdDate: '2024-04-10T09:00:00',
    createdBy: 'Admin (HR)',
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
    documentUrl: '/documents/cert-accounting-001.pdf',
    createdDate: '2024-02-15T10:30:00',
    createdBy: 'Admin (HR)',
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
    documentUrl: '/documents/degree-006.pdf',
    createdDate: '2024-12-18T14:20:00',
    createdBy: 'Admin (HR)',
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
    documentUrl: '/documents/cert-k8s-001.pdf',
    createdDate: '2024-05-20T11:00:00',
    createdBy: 'Admin (HR)',
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
    documentUrl: '/documents/license-lawyer-001.pdf',
    createdDate: '2024-03-15T13:00:00',
    createdBy: 'Admin (HR)',
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
    documentUrl: '/documents/degree-009.pdf',
    createdDate: '2024-02-20T10:00:00',
    createdBy: 'Admin (HR)',
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
    documentUrl: '/documents/cert-facebook-001.pdf',
    createdDate: '2024-12-21T15:30:00',
    createdBy: 'Admin (HR)',
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
    documentUrl: '/documents/degree-011.pdf',
    createdDate: '2024-12-22T08:45:00',
    createdBy: 'Admin (HR)',
  },
];

// Mock lịch sử thay đổi
export const mockDegreeHistory: DegreeHistory[] = [
  {
    id: 'HIST001',
    degreeId: 'DEG001',
    action: 'CREATED',
    performedBy: 'Admin (HR)',
    performedDate: '2024-01-15T10:30:00',
    notes: 'Tạo hồ sơ bằng cấp cho nhân viên',
  },
  {
    id: 'HIST002',
    degreeId: 'DEG001',
    action: 'UPDATED',
    performedBy: 'Admin (HR)',
    performedDate: '2024-01-16T14:20:00',
    notes: 'Cập nhật ghi chú xác minh',
  },
  {
    id: 'HIST003',
    degreeId: 'DEG003',
    action: 'CREATED',
    performedBy: 'Admin (HR)',
    performedDate: '2024-12-20T09:15:00',
    notes: 'Tạo hồ sơ bằng cấp mới',
  },
];

// Thống kê
export interface DegreeStatistics {
  total: number;
  education: number;
  certification: number;
  license: number;
  expiringSoon: number; // Hết hạn trong 30 ngày
  expired: number; // Đã hết hạn
}

export const calculateStatistics = (degrees: Degree[]): DegreeStatistics => {
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  return {
    total: degrees.length,
    education: degrees.filter(d => d.type === 'EDUCATION').length,
    certification: degrees.filter(d => d.type === 'CERTIFICATION').length,
    license: degrees.filter(d => d.type === 'LICENSE').length,
    expiringSoon: degrees.filter(d => {
      if (!d.expiryDate) return false;
      const expiryDate = new Date(d.expiryDate);
      return expiryDate > now && expiryDate <= thirtyDaysFromNow;
    }).length,
    expired: degrees.filter(d => {
      if (!d.expiryDate) return false;
      const expiryDate = new Date(d.expiryDate);
      return expiryDate <= now;
    }).length,
  };
};