// Mock data for HR Management System

import { emit } from "process";

export interface Employee {
  id: string;
  avatar?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  departmentId: string;
  position: string;
  grade: string; // G1, G2, G3
  startDate: string; // ISO
  contractType: 'Full-time' | 'Part-time' | 'Contract';
  managerId?: string;
  status: 'Active' | 'On Leave' | 'Resigned' | 'Probation';
  trainingsCompleted: string[];
  salary: {
    base: number;
    allowances?: { [key: string]: number };
    currency: string;
  };
  customSalaryItems?: Array<{
    id: string;
    name: string;
    type: 'EARNING' | 'DEDUCTION';
    method: 'FIXED' | 'PERCENT_BASE';
    value: number;
  }>;
  medicalRecordId?: string;
  documents?: { id: string; name: string; url?: string }[];
  address?: string;
  dateOfBirth?: string;
  familyMembers?: FamilyMember[];
  contracts?: EmployeeContract[];
}

export interface EmployeeContract {
  id: string;
  code: string;
  type: string; // Ví dụ: "Thử việc", "XĐTH 1 năm", "Không thời hạn"
  startDate: string; // ISO date
  endDate?: string;  // optional nếu HĐ không thời hạn
  status: 'Active' | 'Expired' | 'Terminated' | 'Pending';
  fileUrl?: string; // link đến file scan hợp đồng (nếu có)
}

export interface FamilyMember {
  id: string;
  fullName: string;
  employeeId: string;
  relation:
  | 'Father'
  | 'Mother'
  | 'Spouse'
  | 'Son'
  | 'Daughter'
  | 'Brother'
  | 'Sister'
  | 'Other';
  dateOfBirth?: string;
  phone?: string;
  email?: string;
  address?: string;
  occupation?: string;
  isEmergencyContact?: boolean;
}

export interface Department {
  id: string;
  name: string;
  parentId?: string;
  managerId?: string;
  deputyDirectorId?: string; // Phó giám đốc
  deputyManagerId?: string; // Phó phòng
}

export interface TrainingQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Training {
  id: string;
  title: string;
  description: string;
  requiredForGrades: string[];
  durationDays: number;
  status: 'Upcoming' | 'Ongoing' | 'Completed';
  completionRate?: number;
  deadline?: string;
  instructor?: string;
  location?: string;
  maxParticipants?: number;
  questions?: TrainingQuestion[];
  courseType: 'year' | 'quarter' | 'month'; // Loại khóa học
  departmentId?: string; // Phòng ban
  createdBy?: string; // ID người tạo (Trưởng phòng)
  approvalStatus: 'Pending' | 'Approved' | 'Rejected'; // Trạng thái duyệt
  approvedBy?: string; // ID người duyệt
  approvedDate?: string;
}

export interface TrainingEnrollment {
  id: string;
  trainingId: string;
  employeeId: string;
  enrolledDate: string;
  completionDate?: string;
  status: 'Assigned' | 'In Progress' | 'Completed' | 'Failed';
  progress: number;
  testScore?: number;
  testAttempts?: number;
}

export interface SalaryStructure {
  id: string;
  name: string;
  items: Array<{
    id: string;
    name: string;
    type: 'EARNING' | 'DEDUCTION';
    method: 'FIXED' | 'PERCENT_BASE' | 'FORMULA';
    value: number;
    applicableGrades: string[];
  }>;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  fileUrl: string;
  // EHR fields (entered by admin)
  bloodType?: string;
  height?: number;
  weight?: number;
  allergies?: string;
  chronicDiseases?: string;
  medications?: string;
  emergencyContact?: string;
  emergencyContactPhone?: string;
  lastCheckupDate?: string;
  occupationalDisease?: string; // Bệnh nghề nghiệp
  healthClassification?: string; // Phân loại sức khỏe
  notes?: string;
}

export interface CVData {
  employeeId: string;
  placeOfBirth?: string;
  hometown?: string;
  ethnicity?: string;
  religion?: string;
  idNumber?: string;
  idIssueDate?: string;
  idIssuePlace?: string;
  permanentAddress?: string;
  currentAddress?: string;
  education?: string;
  degree?: string;
  specialization?: string;
  politicalTheory?: string;
  foreignLanguage?: string;
  computerSkills?: string;
  workExperience?: string;
  militaryService?: string;
  professionalQualifications?: string;
}

export interface KPI {
  id: string;
  employeeId: string;
  assignedBy: string; // ID of person who assigned
  assignedByName: string;
  kpiName: string;
  description: string;
  target: number;
  actual?: number;
  unit: string;
  startDate: string;
  endDate: string;
  status: 'Đã giao' | 'Đang thực hiện' | 'Hoàn thành' | 'Chưa đạt';
  note?: string;
}

export interface Transfer {
  id: string;
  employeeId: string;
  employeeName: string;
  fromDepartmentId: string;
  fromDepartmentName: string;
  toDepartmentId: string;
  toDepartmentName: string;
  reason: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  status: 'pending_director_approval' | 'pending_final_approval' | 'approved' | 'rejected';
  directorApprovedBy?: string;
  directorApprovedByName?: string;
  directorApprovedAt?: string;
  directorComment?: string;
  finalApprovedBy?: string;
  finalApprovedByName?: string;
  finalApprovedAt?: string;
  finalComment?: string;
  effectiveDate?: string;
}

export interface SafetyEquipmentPlan {
  id: string;
  year: number;
  departmentId: string;
  departmentName: string;
  createdBy: string;
  createdByName: string;
  items: Array<{
    safetyItemId: string;
    itemName: string;
    quantity: number;
    status: 'Pending' | 'Approved' | 'Rejected';
    approvedBy?: string;
    approvedDate?: string;
    rejectedReason?: string;
  }>;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectedReason?: string;
}

export interface SafetyDistribution {
  id: string;
  planId: string;
  departmentId: string;
  safetyItemId: string;
  itemName: string;
  quantityDistributed: number;
  distributedBy: string;
  distributedDate: string;
  receivedBy?: string;
  receivedDate?: string;
  status: 'Distributed' | 'Received';
  note?: string;
}

export const healthClassifications = [
  'Loại I - Khỏe mạnh',
  'Loại II - Khỏe mạnh có bệnh đã được điều trị ổn định',
  'Loại III - Giảm sức khỏe tạm thời',
  'Loại IV - Giảm sức khỏe lâu dài',
  'Loại V - Yếu'
];

export interface PayrollHistory {
  id: string;
  employeeId: string;
  month: string;
  year: number;
  grossSalary: number;
  netSalary: number;
  basicSalary: number;
  allowances: { [key: string]: number };
  bonuses: { [key: string]: number };
  deductions: { [key: string]: number };
  tax: number;
  insurance: number;
  paymentDate: string;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  reviewerId: string;
  period: string;
  year: number;
  selfAssessment?: {
    goals: { goal: string; achievement: string; score: number }[];
    strengths: string;
    improvements: string;
    comments: string;
  };
  managerAssessment?: {
    goals: { goal: string; feedback: string; score: number }[];
    overallRating: number;
    strengths: string;
    improvements: string;
    comments: string;
  };
  status: 'Draft' | 'Submitted' | 'Reviewed' | 'Completed';
  submittedDate?: string;
  reviewedDate?: string;
}

export interface Goal {
  id: string;
  employeeId: string;
  title: string;
  description: string;
  targetDate: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Delayed';
  progress: number;
  assignedBy: string;
  createdDate: string;
}

export interface TrainingFeedback {
  id: string;
  trainingId: string;
  employeeId: string;
  rating: number;
  contentRating: number;
  instructorRating: number;
  comments: string;
  date: string;
}

export interface JobTitle {
  id: string;
  name: string;
  description: string;
  departmentId?: string;
}

export interface Grade {
  id: string;
  jobTitleId?: string;
  name: string;
  description: string;
  competencies: string[];
  requiredSkills: string[];
  requiredTrainings: string[];
  order: number;
}

export interface Position {
  id: string;
  title: string;
  departmentId: string;
  gradeId: string;
}

export interface SafetyItem {
  id: string;
  name: string;
  category: string;
  description?: string;
  replacementCycleDays: number;
  defaultExpireDays: number;
  quantityInStock: number;
    distributedDepartments: {
    department: string;
    quantity: number;
  }[];
}
export interface IssuedSafetyItem {
  id: string;
  safetyItemId: string;
  employeeId: string;
  issuedBy: string;
  issueDate: string;
  expireDate: string;
  status: 'In Use' | 'Expiring Soon' | 'Expired' | 'Replaced' | 'DamagedEarly';
  replacedById?: string;
  replacedFromId?: string;
  note?: string;
  replacedDate?: string;
}

export interface SafetyReplacementRequest {
  id: string;
  employeeId: string;
  safetyItemId: string;
  requestDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  processedBy?: string;
  processedDate?: string;
  note?: string;
}

export interface WorkSchedule {
  id: string;
  employeeId: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  shift: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}
export interface LeaveRequest {
  id: string,
  employeeId: string,
  fileName: string,
  uploadDate: string,
  reason: string,
  status: 'Pending' | 'Approved' | 'Rejected';
}

const mockData = {
  employees: [
    {
      id: 'emp001',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      firstName: 'Nguyễn',
      lastName: 'Văn An',
      email: 'nguyen.van.an@company.com',
      phone: '0901234567',
      departmentId: 'dept001',
      position: 'Giám đốc điều hành',
      grade: 'G3',
      startDate: '2020-01-15',
      contractType: 'Full-time' as const,
      status: 'Active' as const,
      trainingsCompleted: ['tr001', 'tr002', 'tr003'],
      salary: {
        base: 50000000,
        allowances: { housing: 10000000, transport: 5000000 },
        currency: 'VND',
      },
      medicalRecordId: 'med001',
      documents: [
        { id: 'doc001', name: 'CV_NguyenVanAn.pdf' },
        { id: 'doc002', name: 'BangCap_DaiHoc.pdf' },
      ],
      address: '123 Đường ABC, Quận 1, TP.HCM',
      dateOfBirth: '1985-05-20',
      contracts: [
      {
        id: "C001",
        code: "HD-2024-03",
        type: "Thử việc",
        startDate: "2024-03-01",
        endDate: "2024-05-31",
        status: "Expired",
      },
      {
        id: "C002",
        code: "HD-2024-06",
        type: "XĐTH 1 năm",
        startDate: "2024-06-01",
        endDate: "2025-05-31",
        status: "Active",
      },
    ],
    },
    {
      id: 'emp002',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
      firstName: 'Trần',
      lastName: 'Thị Bình',
      email: 'tran.thi.binh@company.com',
      phone: '0902345678',
      departmentId: 'dept002',
      position: 'Trưởng phòng Kỹ thuật',
      grade: 'G2',
      startDate: '2021-03-10',
      contractType: 'Full-time' as const,
      managerId: 'emp001',
      status: 'Active' as const,
      trainingsCompleted: ['tr001', 'tr004'],
      salary: {
        base: 35000000,
        allowances: { housing: 7000000, transport: 3000000 },
        currency: 'VND',
      },
      medicalRecordId: 'med002',
      documents: [{ id: 'doc003', name: 'CV_TranThiBinh.pdf' }],
      address: '456 Đường XYZ, Quận 2, TP.HCM',
      dateOfBirth: '1988-08-15',
      contracts: [
      {
        id: "C001",
        code: "HD-2024-03",
        type: "Thử việc",
        startDate: "2024-03-01",
        endDate: "2024-05-31",
        status: "Expired",
      },
      {
        id: "C002",
        code: "HD-2024-06",
        type: "XĐTH 1 năm",
        startDate: "2024-06-01",
        endDate: "2025-05-31",
        status: "Active",
      },
    ],
    },
    {
      id: 'emp003',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
      firstName: 'Lê',
      lastName: 'Văn Cường',
      email: 'le.van.cuong@company.com',
      phone: '0903456789',
      departmentId: 'dept003',
      position: 'Trưởng phòng Kinh doanh',
      grade: 'G2',
      startDate: '2021-06-01',
      contractType: 'Full-time' as const,
      managerId: 'emp001',
      status: 'Active' as const,
      trainingsCompleted: ['tr002', 'tr005'],
      salary: {
        base: 32000000,
        allowances: { housing: 6000000, transport: 3000000 },
        currency: 'VND',
      },
      medicalRecordId: 'med003',
      documents: [{ id: 'doc004', name: 'CV_LeVanCuong.pdf' }],
      address: '789 Đường DEF, Quận 3, TP.HCM',
      dateOfBirth: '1990-03-25',
    },
    {
      id: 'emp004',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      firstName: 'Phạm',
      lastName: 'Thị Dung',
      email: 'pham.thi.dung@company.com',
      phone: '0904567890',
      departmentId: 'dept002',
      position: 'Phó giám đốc kỹ thuật',
      grade: 'G2',
      startDate: '2022-01-15',
      contractType: 'Full-time' as const,
      managerId: 'emp002',
      status: 'Active' as const,
      trainingsCompleted: ['tr001', 'tr004'],
      salary: {
        base: 28000000,
        allowances: { housing: 5000000, transport: 2000000 },
        currency: 'VND',
      },
      medicalRecordId: 'med004',
      documents: [{ id: 'doc005', name: 'CV_PhamThiDung.pdf' }],
      address: '321 Đường GHI, Quận 4, TP.HCM',
      dateOfBirth: '1992-11-10',
    },
    {
      id: 'emp005',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tom',
      firstName: 'Hoàng',
      lastName: 'Văn Em',
      email: 'hoang.van.em@company.com',
      phone: '0905678901',
      departmentId: 'dept002',
      position: 'Phó phòng kỹ thuật',
      grade: 'G1',
      startDate: '2023-03-01',
      contractType: 'Full-time' as const,
      managerId: 'emp002',
      status: 'Probation' as const,
      trainingsCompleted: ['tr001'],
      salary: {
        base: 18000000,
        allowances: { transport: 1500000 },
        currency: 'VND',
      },
      medicalRecordId: 'med005',
      documents: [{ id: 'doc006', name: 'CV_HoangVanEm.pdf' }],
      address: '654 Đường JKL, Quận 5, TP.HCM',
      dateOfBirth: '1995-07-08',
    },
    {
      id: 'emp006',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
      firstName: 'Võ',
      lastName: 'Thị Phương',
      email: 'vo.thi.phuong@company.com',
      phone: '0906789012',
      departmentId: 'dept003',
      position: 'Nhân viên kinh doanh',
      grade: 'G1',
      startDate: '2022-09-01',
      contractType: 'Full-time' as const,
      managerId: 'emp003',
      status: 'Active' as const,
      trainingsCompleted: ['tr002', 'tr005'],
      salary: {
        base: 15000000,
        allowances: { transport: 2000000 },
        currency: 'VND',
      },
      medicalRecordId: 'med006',
      documents: [{ id: 'doc007', name: 'CV_VoThiPhuong.pdf' }],
      address: '987 Đường MNO, Quận 6, TP.HCM',
      dateOfBirth: '1994-02-14',
    },
    {
      id: 'emp007',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
      firstName: 'Đặng',
      lastName: 'Văn Giang',
      email: 'dang.van.giang@company.com',
      phone: '0907890123',
      departmentId: 'dept004',
      position: 'Nhân viên vận hành',
      grade: 'G1',
      startDate: '2021-11-15',
      contractType: 'Full-time' as const,
      managerId: 'emp001',
      status: 'On Leave' as const,
      trainingsCompleted: ['tr003'],
      salary: {
        base: 12000000,
        allowances: { transport: 1000000 },
        currency: 'VND',
      },
      medicalRecordId: 'med007',
      documents: [{ id: 'doc008', name: 'CV_DangVanGiang.pdf' }],
      address: '147 Đường PQR, Quận 7, TP.HCM',
      dateOfBirth: '1993-09-22',
    },
    {
      id: 'emp008',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
      firstName: 'Bùi',
      lastName: 'Thị Hà',
      email: 'bui.thi.ha@company.com',
      phone: '0908901234',
      departmentId: 'dept001',
      position: 'Nhân viên nhân sự',
      grade: 'G1',
      startDate: '2022-05-01',
      contractType: 'Full-time' as const,
      managerId: 'emp001',
      status: 'Active' as const,
      trainingsCompleted: ['tr001', 'tr003'],
      salary: {
        base: 14000000,
        allowances: { transport: 1500000 },
        currency: 'VND',
      },
      medicalRecordId: 'med008',
      documents: [{ id: 'doc009', name: 'CV_BuiThiHa.pdf' }],
      address: '258 Đường STU, Quận 8, TP.HCM',
      dateOfBirth: '1996-12-05',
    },
    {
      id: 'emp009',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
      firstName: 'Ngô',
      lastName: 'Văn Inh',
      email: 'ngo.van.inh@company.com',
      phone: '0909012345',
      departmentId: 'dept003',
      position: 'Nhân viên kinh doanh Senior',
      grade: 'G2',
      startDate: '2020-08-01',
      contractType: 'Full-time' as const,
      managerId: 'emp003',
      status: 'Active' as const,
      trainingsCompleted: ['tr002', 'tr005'],
      salary: {
        base: 25000000,
        allowances: { housing: 4000000, transport: 2500000 },
        currency: 'VND',
      },
      medicalRecordId: 'med009',
      documents: [{ id: 'doc010', name: 'CV_NgoVanInh.pdf' }],
      address: '369 Đường VWX, Quận 9, TP.HCM',
      dateOfBirth: '1989-06-18',
    },
    {
      id: 'emp010',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia',
      firstName: 'Phan',
      lastName: 'Thị Kim',
      email: 'phan.thi.kim@company.com',
      phone: '0900123456',
      departmentId: 'dept002',
      position: 'Kỹ sư phần mềm',
      grade: 'G1',
      startDate: '2023-01-10',
      contractType: 'Contract' as const,
      managerId: 'emp002',
      status: 'Active' as const,
      trainingsCompleted: ['tr001'],
      salary: {
        base: 20000000,
        currency: 'VND',
      },
      medicalRecordId: 'med010',
      documents: [{ id: 'doc011', name: 'CV_PhanThiKim.pdf' }],
      address: '741 Đường YZ, Quận 10, TP.HCM',
      dateOfBirth: '1997-04-30',
    },
  ] as Employee[],

  departments: [
    { id: 'dept001', name: 'Phòng Nhân sự', managerId: 'emp001', deputyDirectorId: 'emp004' },
    { id: 'dept002', name: 'Phòng Kỹ thuật', parentId: 'dept001', managerId: 'emp002', deputyManagerId: 'emp005' },
    { id: 'dept003', name: 'Phòng Kinh doanh', parentId: 'dept001', managerId: 'emp003', deputyManagerId: 'emp006' },
    { id: 'dept004', name: 'Phòng Vận hành', parentId: 'dept001', managerId: 'emp001' },
    {
      id: "5",
      name: "Phòng Phát triển Sản phẩm",
      parentId: "dept002",
      managerId: null
    },
    {
      id: "6",
      name: "Phòng DevOps",
      parentId: "dept002",
      managerId: null
    }
  ] as Department[],

  trainings: [
    {
      id: 'tr001',
      title: 'Đào tạo An toàn lao động',
      description: 'Khóa đào tạo bắt buộc về an toàn và sức khỏe nghề nghiệp',
      requiredForGrades: ['G1', 'G2', 'G3'],
      durationDays: 2,
      status: 'Completed' as const,
      completionRate: 95,
      instructor: 'TS. Nguyễn Văn A',
      location: 'Phòng hội nghị A',
      maxParticipants: 30,
      courseType: 'month' as const,
      departmentId: 'dept001',
      createdBy: 'emp001',
      approvalStatus: 'Approved' as const,
      approvedBy: 'emp001',
      approvedDate: '2024-12-01',
      questions: [
        {
          id: 'q1',
          question: 'Khi xảy ra hỏa hoạn, bạn nên làm gì đầu tiên?',
          options: ['Gọi cứu hỏa', 'Tìm đường thoát hiểm', 'Cố gắng dập lửa', 'Báo cho quản lý'],
          correctAnswer: 0
        },
        {
          id: 'q2',
          question: 'Thiết bị bảo hộ cá nhân nào là bắt buộc tại công trường?',
          options: ['Mũ bảo hiểm', 'Giày bảo hộ', 'Găng tay', 'Tất cả đáp án trên'],
          correctAnswer: 3
        }
      ]
    },
    {
      id: 'tr002',
      title: 'Kỹ năng bán hàng chuyên nghiệp',
      description: 'Nâng cao kỹ năng bán hàng và chăm sóc khách hàng',
      requiredForGrades: ['G1', 'G2'],
      durationDays: 5,
      status: 'Ongoing' as const,
      completionRate: 60,
      deadline: '2025-12-31',
      instructor: 'ThS. Trần Thị B',
      location: 'Phòng đào tạo B',
      maxParticipants: 25,
      courseType: 'quarter' as const,
      departmentId: 'dept003',
      createdBy: 'emp003',
      approvalStatus: 'Approved' as const,
      approvedBy: 'emp001',
      approvedDate: '2024-12-15',
      questions: [
        {
          id: 'q1',
          question: 'Giai đoạn nào quan trọng nhất trong quy trình bán hàng?',
          options: ['Tiếp cận khách hàng', 'Tìm hiểu nhu cầu', 'Thuyết trình sản phẩm', 'Chốt đơn'],
          correctAnswer: 1
        },
        {
          id: 'q2',
          question: 'Khi khách hàng phản đối, bạn nên?',
          options: ['Tranh cãi', 'Lắng nghe và thấu hiểu', 'Bỏ qua', 'Giảm giá ngay'],
          correctAnswer: 1
        }
      ]
    },
    {
      id: 'tr003',
      title: 'Quản lý và Lãnh đạo',
      description: 'Khóa đào tạo dành cho quản lý cấp trung và cao cấp',
      requiredForGrades: ['G2', 'G3'],
      durationDays: 10,
      status: 'Upcoming' as const,
      completionRate: 0,
      deadline: '2026-03-31',
      instructor: 'GS. Lê Văn C',
      location: 'Trung tâm đào tạo',
      maxParticipants: 20,
      courseType: 'year' as const,
      departmentId: 'dept001',
      createdBy: 'emp002',
      approvalStatus: 'Approved' as const,
      approvedBy: 'emp001',
      approvedDate: '2024-11-20',
    },
    {
      id: 'tr004',
      title: 'Lập trình nâng cao',
      description: 'Khóa học về công nghệ mới và best practices',
      requiredForGrades: ['G1', 'G2'],
      durationDays: 7,
      status: 'Ongoing' as const,
      completionRate: 45,
      deadline: '2025-11-30',
      instructor: 'Kỹ sư Phạm Văn D',
      location: 'Phòng lab máy tính',
      maxParticipants: 15,
      courseType: 'quarter' as const,
      departmentId: 'dept002',
      createdBy: 'emp002',
      approvalStatus: 'Approved' as const,
      approvedBy: 'emp001',
      approvedDate: '2024-10-05',
    },
    {
      id: 'tr005',
      title: 'Chăm sóc khách hàng xuất sắc',
      description: 'Nâng cao trải nghiệm khách hàng',
      requiredForGrades: ['G1'],
      durationDays: 3,
      status: 'Completed' as const,
      completionRate: 88,
      instructor: 'Chuyên gia Hoàng Thị E',
      location: 'Phòng hội nghị C',
      maxParticipants: 40,
      courseType: 'month' as const,
      departmentId: 'dept003',
      createdBy: 'emp003',
      approvalStatus: 'Approved' as const,
      approvedBy: 'emp001',
      approvedDate: '2024-09-10',
    },
  ] as Training[],

  trainingEnrollments: [
    { id: 'enr001', trainingId: 'tr001', employeeId: 'emp001', enrolledDate: '2024-01-15', completionDate: '2024-01-17', status: 'Completed' as const, progress: 100, testScore: 10, testAttempts: 1 },
    { id: 'enr002', trainingId: 'tr001', employeeId: 'emp002', enrolledDate: '2024-01-15', completionDate: '2024-01-17', status: 'Completed' as const, progress: 100, testScore: 9, testAttempts: 1 },
    { id: 'enr003', trainingId: 'tr001', employeeId: 'emp004', enrolledDate: '2024-01-15', completionDate: '2024-01-17', status: 'Completed' as const, progress: 100, testScore: 8, testAttempts: 1 },
    { id: 'enr004', trainingId: 'tr001', employeeId: 'emp005', enrolledDate: '2024-03-01', completionDate: '2024-03-03', status: 'Completed' as const, progress: 100, testScore: 10, testAttempts: 1 },
    { id: 'enr005', trainingId: 'tr001', employeeId: 'emp008', enrolledDate: '2024-05-01', completionDate: '2024-05-03', status: 'Completed' as const, progress: 100, testScore: 9, testAttempts: 1 },
    { id: 'enr006', trainingId: 'tr001', employeeId: 'emp010', enrolledDate: '2024-01-10', completionDate: '2024-01-12', status: 'Completed' as const, progress: 100, testScore: 8, testAttempts: 1 },
    { id: 'enr007', trainingId: 'tr002', employeeId: 'emp003', enrolledDate: '2024-09-01', status: 'In Progress' as const, progress: 60, testAttempts: 0 },
    { id: 'enr008', trainingId: 'tr002', employeeId: 'emp006', enrolledDate: '2024-09-01', status: 'In Progress' as const, progress: 55, testAttempts: 0 },
    { id: 'enr009', trainingId: 'tr002', employeeId: 'emp009', enrolledDate: '2024-09-01', status: 'In Progress' as const, progress: 65, testAttempts: 0 },
    { id: 'enr010', trainingId: 'tr004', employeeId: 'emp002', enrolledDate: '2024-10-01', status: 'In Progress' as const, progress: 45, testAttempts: 0 },
    { id: 'enr011', trainingId: 'tr004', employeeId: 'emp004', enrolledDate: '2024-10-01', status: 'In Progress' as const, progress: 50, testAttempts: 0 },
    { id: 'enr012', trainingId: 'tr004', employeeId: 'emp010', enrolledDate: '2024-10-01', status: 'In Progress' as const, progress: 40, testAttempts: 0 },
    { id: 'enr013', trainingId: 'tr005', employeeId: 'emp006', enrolledDate: '2024-06-01', completionDate: '2024-06-04', status: 'Completed' as const, progress: 100, testScore: 10, testAttempts: 1 },
    { id: 'enr014', trainingId: 'tr005', employeeId: 'emp009', enrolledDate: '2024-06-01', completionDate: '2024-06-04', status: 'Completed' as const, progress: 100, testScore: 9, testAttempts: 1 },
    { id: 'enr015', trainingId: 'tr003', employeeId: 'emp002', enrolledDate: '2024-11-01', status: 'Assigned' as const, progress: 0, testAttempts: 0 },
    { id: 'enr016', trainingId: 'tr004', employeeId: 'emp005', enrolledDate: '2024-10-15', status: 'Assigned' as const, progress: 0, testAttempts: 0 },
  ] as TrainingEnrollment[],

  salaryStructures: [
    {
      id: 'ss001',
      name: 'Cơ cấu lương G1 - Nhân viên',
      items: [
        {
          id: 'item001',
          name: 'Lương cơ bản',
          type: 'EARNING' as const,
          method: 'FIXED' as const,
          value: 15000000,
          applicableGrades: ['G1'],
        },
        {
          id: 'item002',
          name: 'Phụ cấp đi lại',
          type: 'EARNING' as const,
          method: 'FIXED' as const,
          value: 1500000,
          applicableGrades: ['G1'],
        },
        {
          id: 'item003',
          name: 'Bảo hiểm xã hội',
          type: 'DEDUCTION' as const,
          method: 'PERCENT_BASE' as const,
          value: 8,
          applicableGrades: ['G1'],
        },
        {
          id: 'item004',
          name: 'Thuế TNCN',
          type: 'DEDUCTION' as const,
          method: 'PERCENT_BASE' as const,
          value: 5,
          applicableGrades: ['G1'],
        },
      ],
    },
    {
      id: 'ss002',
      name: 'Cơ cấu lương G2 - Chuyên viên/Quản lý',
      items: [
        {
          id: 'item005',
          name: 'Lương cơ bản',
          type: 'EARNING' as const,
          method: 'FIXED' as const,
          value: 30000000,
          applicableGrades: ['G2'],
        },
        {
          id: 'item006',
          name: 'Phụ cấp nhà ở',
          type: 'EARNING' as const,
          method: 'FIXED' as const,
          value: 6000000,
          applicableGrades: ['G2'],
        },
        {
          id: 'item007',
          name: 'Phụ cấp đi lại',
          type: 'EARNING' as const,
          method: 'FIXED' as const,
          value: 3000000,
          applicableGrades: ['G2'],
        },
        {
          id: 'item008',
          name: 'Bảo hiểm xã hội',
          type: 'DEDUCTION' as const,
          method: 'PERCENT_BASE' as const,
          value: 8,
          applicableGrades: ['G2'],
        },
        {
          id: 'item009',
          name: 'Thuế TNCN',
          type: 'DEDUCTION' as const,
          method: 'PERCENT_BASE' as const,
          value: 10,
          applicableGrades: ['G2'],
        },
      ],
    },
    {
      id: 'ss003',
      name: 'Cơ cấu lương G3 - Điều hành',
      items: [
        {
          id: 'item010',
          name: 'Lương cơ bản',
          type: 'EARNING' as const,
          method: 'FIXED' as const,
          value: 50000000,
          applicableGrades: ['G3'],
        },
        {
          id: 'item011',
          name: 'Phụ cấp nhà ở',
          type: 'EARNING' as const,
          method: 'FIXED' as const,
          value: 10000000,
          applicableGrades: ['G3'],
        },
        {
          id: 'item012',
          name: 'Phụ cấp đi lại',
          type: 'EARNING' as const,
          method: 'FIXED' as const,
          value: 5000000,
          applicableGrades: ['G3'],
        },
        {
          id: 'item013',
          name: 'Thưởng hiệu suất',
          type: 'EARNING' as const,
          method: 'PERCENT_BASE' as const,
          value: 20,
          applicableGrades: ['G3'],
        },
        {
          id: 'item014',
          name: 'Bảo hiểm xã hội',
          type: 'DEDUCTION' as const,
          method: 'PERCENT_BASE' as const,
          value: 8,
          applicableGrades: ['G3'],
        },
        {
          id: 'item015',
          name: 'Thuế TNCN',
          type: 'DEDUCTION' as const,
          method: 'PERCENT_BASE' as const,
          value: 15,
          applicableGrades: ['G3'],
        },
      ],
    },
  ] as SalaryStructure[],

  medicalRecords: [
    {
      id: 'med001',
      patientId: 'emp001',
      status: 'Approved',
      fileUrl: '/files/med001.pdf',
    },
    {
      id: 'med002',
      patientId: 'emp002',
      status: 'Approved',
      fileUrl: '/files/med002.pdf',
    },
    {
      id: 'med003',
      patientId: 'emp003',
      status: 'Approved',
      fileUrl: '/files/med003.pdf',
    },
    {
      id: 'med004',
      patientId: 'emp004',
      status: 'Approved',
      fileUrl: '/files/med004.pdf',
    },
    {
      id: 'med005',
      patientId: 'emp005',
      status: 'Approved',
      fileUrl: '/files/med005.pdf',
    },
    {
      id: 'med006',
      patientId: 'emp006',
      status: 'Approved',
      fileUrl: '/files/med006.pdf',
    },
    {
      id: 'med007',
      patientId: 'emp007',
      status: 'Approved',
      fileUrl: '/files/med007.pdf',
    },
    {
      id: 'med008',
      patientId: 'emp008',
      status: 'Approved',
      fileUrl: '/files/med008.pdf',
    },
    {
      id: 'med009',
      patientId: 'emp009',
      status: 'Approved',
      fileUrl: '/files/med009.pdf',
    },
    {
      id: 'med010',
      patientId: 'emp010',
      status: 'Approved',
      fileUrl: '/files/med010.pdf',
    },
  ] as MedicalRecord[],

  positions: [
    { id: 'pos001', title: 'Giám đốc điều hành', departmentId: 'dept001', gradeId: 'G3' },
    { id: 'pos002', title: 'Trưởng phòng Kỹ thuật', departmentId: 'dept002', gradeId: 'G2' },
    { id: 'pos003', title: 'Trưởng phòng Kinh doanh', departmentId: 'dept003', gradeId: 'G2' },
    { id: 'pos004', title: 'Kỹ sư phần mềm Senior', departmentId: 'dept002', gradeId: 'G2' },
    { id: 'pos005', title: 'Kỹ sư phần mềm', departmentId: 'dept002', gradeId: 'G1' },
    { id: 'pos006', title: 'Nhân viên kinh doanh', departmentId: 'dept003', gradeId: 'G1' },
    { id: 'pos007', title: 'Nhân viên vận hành', departmentId: 'dept004', gradeId: 'G1' },
    { id: 'pos008', title: 'Nhân viên nhân sự', departmentId: 'dept001', gradeId: 'G1' },
  ] as Position[],

  payrollHistory: [
    {
      id: 'pay-001',
      employeeId: 'emp001',
      month: '12',
      year: 2024,
      grossSalary: 65000000,
      netSalary: 52000000,
      basicSalary: 50000000,
      allowances: { housing: 10000000, transport: 5000000 },
      bonuses: {},
      deductions: {},
      tax: 10000000,
      insurance: 3000000,
      paymentDate: '2024-12-25',
    },
    {
      id: 'pay-002',
      employeeId: 'emp007',
      month: '12',
      year: 2024,
      grossSalary: 18000000,
      netSalary: 15500000,
      basicSalary: 15000000,
      allowances: { transport: 1500000, housing: 1500000 },
      bonuses: {},
      deductions: {},
      tax: 1500000,
      insurance: 1000000,
      paymentDate: '2024-12-25',
    },
    {
      id: 'pay-003',
      employeeId: 'emp007',
      month: '11',
      year: 2024,
      grossSalary: 18000000,
      netSalary: 15500000,
      basicSalary: 15000000,
      allowances: { transport: 1500000, housing: 1500000 },
      bonuses: {},
      deductions: {},
      tax: 1500000,
      insurance: 1000000,
      paymentDate: '2024-11-25',
    },
  ] as PayrollHistory[],

  performanceReviews: [
    {
      id: 'perf-001',
      employeeId: 'emp007',
      reviewerId: 'emp002',
      period: 'Q4',
      year: 2024,
      selfAssessment: {
        goals: [
          { goal: 'Hoàn thành 5 dự án web', achievement: 'Đã hoàn thành 6 dự án', score: 5 },
          { goal: 'Học React Native', achievement: 'Đã hoàn thành khóa học cơ bản', score: 4 },
        ],
        strengths: 'Làm việc chủ động, sáng tạo',
        improvements: 'Cần cải thiện kỹ năng làm việc nhóm',
        comments: 'Tôi đã cố gắng hết sức trong quý này',
      },
      managerAssessment: {
        goals: [
          { goal: 'Hoàn thành 5 dự án web', feedback: 'Xuất sắc, vượt mục tiêu', score: 5 },
          { goal: 'Học React Native', feedback: 'Tốt, có thể áp dụng vào dự án', score: 4 },
        ],
        overallRating: 4.5,
        strengths: 'Kỹ thuật tốt, tự học nhanh',
        improvements: 'Nên tham gia nhiều hơn vào các cuộc họp team',
        comments: 'Nhân viên xuất sắc, đáng để đầu tư phát triển',
      },
      status: 'Completed',
      submittedDate: '2024-12-20',
      reviewedDate: '2024-12-28',
    },
    {
      id: 'perf-002',
      employeeId: 'emp007',
      reviewerId: 'emp002',
      period: 'Q1',
      year: 2025,
      status: 'Draft',
    },
  ] as PerformanceReview[],

  goals: [
    {
      id: 'goal-001',
      employeeId: 'emp007',
      title: 'Hoàn thành module thanh toán',
      description: 'Phát triển và test module thanh toán tích hợp Stripe',
      targetDate: '2025-02-28',
      status: 'In Progress',
      progress: 60,
      assignedBy: 'emp002',
      createdDate: '2025-01-01',
    },
    {
      id: 'goal-002',
      employeeId: 'emp007',
      title: 'Học TypeScript nâng cao',
      description: 'Hoàn thành khóa học TypeScript Advanced Patterns',
      targetDate: '2025-03-31',
      status: 'In Progress',
      progress: 30,
      assignedBy: 'emp007',
      createdDate: '2025-01-05',
    },
  ] as Goal[],

  trainingFeedbacks: [
    {
      id: 'feedback-001',
      trainingId: 'tr001',
      employeeId: 'emp007',
      rating: 5,
      contentRating: 5,
      instructorRating: 5,
      comments: 'Khóa học rất bổ ích, giảng viên nhiệt tình',
      date: '2024-05-15',
    },
  ] as TrainingFeedback[],

  safetyItems: [
    {
      id: 's001',
      name: 'Mũ bảo hộ',
      category: 'Đầu',
      description: 'Mũ bảo hộ lao động tiêu chuẩn Việt Nam',
      replacementCycleDays: 365,
      defaultExpireDays: 365,
      quantityInStock: 50,
      distributedDepartments: [
        { department: 'Phòng Nhân sự', quantity: 10 },
        { department: 'Phòng Chính sách An toàn Lao động', quantity: 15 },
      ],
    },
    {
      id: 's002',
      name: 'Găng tay chống cắt',
      category: 'Tay',
      description: 'Găng tay sợi chống cắt cấp độ 3',
      replacementCycleDays: 180,
      defaultExpireDays: 180,
      quantityInStock: 100,
      distributedDepartments: [
        { department: 'Phòng Sản xuất', quantity: 30 },
        { department: 'Phòng Kiểm định Chất lượng', quantity: 20 },
      ],
    },
    {
      id: 's003',
      name: 'Kính bảo hộ',
      category: 'Mắt',
      description: 'Kính bảo hộ chống tia UV',
      replacementCycleDays: 365,
      defaultExpireDays: 365,
      quantityInStock: 75,
      distributedDepartments: [
        { department: 'Phòng Thí nghiệm', quantity: 25 },
        { department: 'Phòng Bảo trì', quantity: 10 },
      ],
    },
  ] as SafetyItem[],

  issuedSafetyItems: [
    {
      id: 'issue001',
      safetyItemId: 's001', // Mũ bảo hộ
      employeeId: 'emp005',
      issuedBy: 'emp002', // Quản lý Kỹ thuật
      issueDate: '2024-03-01',
      expireDate: '2025-03-01',
      status: 'In Use',
      note: 'Phát lần đầu khi vào làm',
    },
    {
      id: 'issue002',
      safetyItemId: 's002', // Găng tay chống cắt
      employeeId: 'emp005',
      issuedBy: 'emp002',
      issueDate: '2024-08-01',
      expireDate: '2024-11-01',
      status: 'Expiring Soon',
      note: 'Còn 10 ngày sẽ hết hạn',
    },
    {
      id: 'issue003',
      safetyItemId: 's003', // Kính bảo hộ
      employeeId: 'emp006',
      issuedBy: 'emp003',
      issueDate: '2023-10-01',
      expireDate: '2024-10-01',
      status: 'Expired',
      note: 'Đã hết hạn, chờ đổi mới',
    },
    {
      id: 'issue004',
      safetyItemId: 's002', // Găng tay chống cắt (đổi mới)
      employeeId: 'emp006',
      issuedBy: 'emp003',
      issueDate: '2024-10-15',
      expireDate: '2025-04-15',
      status: 'Replaced',
      replacedFromId: 'issue003',
      note: 'Đổi mới sau khi vật tư cũ hết hạn',
      replacedDate: '2024-10-15',
    },
    {
      id: 'issue005',
      safetyItemId: 's001',
      employeeId: 'emp004',
      issuedBy: 'emp002',
      issueDate: '2024-04-01',
      expireDate: '2025-04-01',
      status: 'DamagedEarly',
      note: 'Nhân viên báo mũ nứt, đổi mới sớm ngày 2024-09-20',
      replacedDate: '2024-09-20',
    },
    {
      id: 'issue006',
      safetyItemId: 's001',
      employeeId: 'emp004',
      issuedBy: 'emp002',
      issueDate: '2024-09-20',
      expireDate: '2025-09-20',
      status: 'In Use',
      replacedFromId: 'issue005',
      note: 'Đổi mới do hỏng sớm',
    },
  ] as IssuedSafetyItem[],

  safetyReplacementRequests: [
    {
      id: 'req001',
      employeeId: 'emp004',
      safetyItemId: 's001',
      requestDate: '2024-09-18',
      reason: 'Mũ bị nứt, không an toàn',
      status: 'Approved',
      processedBy: 'emp002',
      processedDate: '2024-09-20',
      note: 'Đã cấp mũ mới, đổi sớm 6 tháng',
    },
    {
      id: 'req002',
      employeeId: 'emp006',
      safetyItemId: 's003',
      requestDate: '2024-09-25',
      reason: 'Trầy xước nặng, nhìn mờ',
      status: 'Pending',
    },
  ] as SafetyReplacementRequest[],

  safetyStatistics: {
    totalIssued: 6,
    totalActive: 3,
    totalExpired: 1,
    totalReplaced: 1,
    totalDamagedEarly: 1,
    replacementsBeforeExpire: 1,
    replacementsOnTime: 1,
    pendingRequests: 1,
  },

  jobTitles: [
    {
      id: 'jt001',
      name: 'Kỹ sư phần mềm',
      description: 'Phát triển và bảo trì các ứng dụng phần mềm',
      departmentId: 'dept002',
    },
    {
      id: 'jt002',
      name: 'Nhân viên kinh doanh',
      description: 'Phát triển khách hàng và tư vấn sản phẩm',
      departmentId: 'dept003',
    },
    {
      id: 'jt003',
      name: 'Giám đốc',
      description: 'Điều hành và quản lý toàn bộ công ty',
      departmentId: 'dept001',
    },
    {
      id: 'jt004',
      name: 'Trưởng phòng',
      description: 'Quản lý và điều hành bộ phận',
      departmentId: 'dept001',
    },
    {
      id: 'jt005',
      name: 'Nhân viên nhân sự',
      description: 'Quản lý hồ sơ nhân viên và tuyển dụng',
      departmentId: 'dept001',
    },
    {
      id: 'jt006',
      name: 'Nhân viên vận hành',
      description: 'Thực hiện các công việc vận hành hàng ngày',
      departmentId: 'dept004',
    },
  ] as JobTitle[],

  grades: [
    // Kỹ sư phần mềm
    {
      id: 'g_jt001_1',
      jobTitleId: 'jt001',
      name: 'G1 - Junior',
      description: 'Kỹ sư mới vào nghề, làm việc dưới sự hướng dẫn',
      competencies: [
        'Hiểu biết cơ bản về ngôn ngữ lập trình',
        'Làm việc nhóm tốt',
        'Ham học hỏi'
      ],
      requiredSkills: ['JavaScript/TypeScript cơ bản', 'Git', 'HTML/CSS'],
      requiredTrainings: ['tr001', 'tr004'],
      order: 1,
    },
    {
      id: 'g_jt001_2',
      jobTitleId: 'jt001',
      name: 'G2 - Senior',
      description: 'Kỹ sư có kinh nghiệm, làm việc độc lập',
      competencies: [
        'Thiết kế hệ thống',
        'Code review',
        'Mentor junior',
        'Giải quyết vấn đề phức tạp'
      ],
      requiredSkills: ['React/Vue nâng cao', 'API Design', 'Database', 'Testing'],
      requiredTrainings: ['tr001', 'tr004'],
      order: 2,
    },
    {
      id: 'g_jt001_3',
      jobTitleId: 'jt001',
      name: 'G3 - Lead/Principal',
      description: 'Kỹ sư dẫn dắt kỹ thuật, định hướng kiến trúc',
      competencies: [
        'Kiến trúc hệ thống lớn',
        'Quản lý kỹ thuật',
        'Đào tạo team',
        'Technical decision making'
      ],
      requiredSkills: ['System Design', 'Cloud Architecture', 'Team Leadership', 'DevOps'],
      requiredTrainings: ['tr001', 'tr003', 'tr004'],
      order: 3,
    },
    // Nhân viên kinh doanh
    {
      id: 'g_jt002_1',
      jobTitleId: 'jt002',
      name: 'G1 - Junior Sales',
      description: 'Nhân viên kinh doanh mới, học hỏi kỹ năng bán hàng',
      competencies: [
        'Giao tiếp tốt',
        'Chăm chỉ',
        'Tinh thần học hỏi'
      ],
      requiredSkills: ['Kỹ năng giao tiếp', 'Hiểu biết sản phẩm'],
      requiredTrainings: ['tr002', 'tr005'],
      order: 1,
    },
    {
      id: 'g_jt002_2',
      jobTitleId: 'jt002',
      name: 'G2 - Senior Sales',
      description: 'Nhân viên kinh doanh có kinh nghiệm, đạt chỉ tiêu tốt',
      competencies: [
        'Đàm phán thành thạo',
        'Quản lý khách hàng',
        'Phát triển thị trường mới'
      ],
      requiredSkills: ['Negotiation', 'Customer Management', 'Market Analysis'],
      requiredTrainings: ['tr002', 'tr005'],
      order: 2,
    },
    {
      id: 'g_jt002_3',
      jobTitleId: 'jt002',
      name: 'G3 - Sales Manager',
      description: 'Quản lý nhóm kinh doanh, đạt doanh số cao',
      competencies: [
        'Quản lý team',
        'Chiến lược kinh doanh',
        'Phát triển khách hàng lớn'
      ],
      requiredSkills: ['Team Management', 'Strategic Planning', 'KPI Management'],
      requiredTrainings: ['tr002', 'tr003', 'tr005'],
      order: 3,
    },
    // Trưởng phòng
    {
      id: 'g_jt004_1',
      jobTitleId: 'jt004',
      name: 'G2 - Trưởng phòng',
      description: 'Quản lý một bộ phận',
      competencies: [
        'Lãnh đạo nhóm',
        'Quản lý dự án',
        'Ra quyết định'
      ],
      requiredSkills: ['Leadership', 'Project Management', 'Communication'],
      requiredTrainings: ['tr003'],
      order: 2,
    },
    {
      id: 'g_jt004_2',
      jobTitleId: 'jt004',
      name: 'G3 - Giám đốc bộ phận',
      description: 'Quản lý nhiều phòng ban, định hướng chiến lược',
      competencies: [
        'Lãnh đạo cấp cao',
        'Chiến lược tổ chức',
        'Quản trị toàn diện'
      ],
      requiredSkills: ['Strategic Leadership', 'Business Planning', 'Change Management'],
      requiredTrainings: ['tr003'],
      order: 3,
    },
    // Giám đốc
    {
      id: 'g_jt003_1',
      jobTitleId: 'jt003',
      name: 'G3 - Giám đốc điều hành',
      description: 'Điều hành toàn bộ công ty',
      competencies: [
        'Tầm nhìn chiến lược',
        'Quản trị doanh nghiệp',
        'Lãnh đạo cấp cao'
      ],
      requiredSkills: ['Executive Leadership', 'Corporate Strategy', 'Stakeholder Management'],
      requiredTrainings: ['tr003'],
      order: 3,
    },
    // Nhân viên nhân sự
    {
      id: 'g_jt005_1',
      jobTitleId: 'jt005',
      name: 'G1 - Nhân viên nhân sự',
      description: 'Xử lý công việc hành chính nhân sự',
      competencies: [
        'Quản lý hồ sơ',
        'Giao tiếp nội bộ',
        'Tổ chức sự kiện'
      ],
      requiredSkills: ['Office Skills', 'Communication', 'Data Entry'],
      requiredTrainings: ['tr001'],
      order: 1,
    },
    {
      id: 'g_jt005_2',
      jobTitleId: 'jt005',
      name: 'G2 - Chuyên viên nhân sự',
      description: 'Tuyển dụng và phát triển nhân sự',
      competencies: [
        'Tuyển dụng',
        'Đào tạo',
        'Đánh giá nhân viên'
      ],
      requiredSkills: ['Recruitment', 'Training', 'Performance Management'],
      requiredTrainings: ['tr001', 'tr003'],
      order: 2,
    },
    // Nhân viên vận hành
    {
      id: 'g_jt006_1',
      jobTitleId: 'jt006',
      name: 'G1 - Nhân viên vận hành',
      description: 'Thực hiện công việc vận hành cơ bản',
      competencies: [
        'Thực hiện quy trình',
        'An toàn lao động',
        'Làm việc nhóm'
      ],
      requiredSkills: ['Basic Operations', 'Safety Compliance'],
      requiredTrainings: ['tr001'],
      order: 1,
    },
  ] as Grade[],

  workSchedules: [
    { id: 'ws001', employeeId: 'emp001', dayOfWeek: 'Monday', shift: 'Hà Nội', startTime: '08:00', endTime: '12:00' },
    { id: 'ws002', employeeId: 'emp002', dayOfWeek: 'Monday', shift: 'Hải Phòng', startTime: '13:00', endTime: '17:00' },
    { id: 'ws003', employeeId: 'emp003', dayOfWeek: 'Tuesday', shift: 'Tp.HCM', startTime: '08:30', endTime: '12:00' },
    { id: 'ws004', employeeId: 'emp004', dayOfWeek: 'Wednesday', shift: 'Cảng bến phà', startTime: '13:00', endTime: '17:30' },
    { id: 'ws005', employeeId: 'emp005', dayOfWeek: 'Friday', shift: 'Nhà thờ', startTime: '09:00', endTime: '12:00' },
  ] as WorkSchedule[],

  leaveRequests: [
    {
      id: "l001",
      employeeId: "emp001",
      fileName: "DonXinNghiPhep_Tet.pdf",
      uploadDate: "2025-01-20",
      reason: "Nghỉ Tết Nguyên Đán",
      status: "Approved"
    },
    {
      id: "l001",
      employeeId: "emp002",
      fileName: "DonXinNghiPhep_CuoiTuan.pdf",
      uploadDate: "2025-04-10",
      reason: "Việc cá nhân",
      status: "Rejected"
    },
  ] as LeaveRequest[],

  kpis: [
    {
      id: 'kpi001',
      employeeId: 'emp002',
      assignedBy: 'emp001',
      assignedByName: 'Nguyễn Văn An',
      kpiName: 'Doanh số bán hàng Q1',
      description: 'Đạt doanh số bán hàng tối thiểu 500 triệu trong quý 1',
      target: 500,
      actual: 450,
      unit: 'triệu đồng',
      startDate: '2025-01-01',
      endDate: '2025-03-31',
      status: 'Đang thực hiện',
    },
    {
      id: 'kpi002',
      employeeId: 'emp003',
      assignedBy: 'emp001',
      assignedByName: 'Nguyễn Văn An',
      kpiName: 'Hoàn thành dự án',
      description: 'Hoàn thành 3 dự án lớn trong quý',
      target: 3,
      actual: 3,
      unit: 'dự án',
      startDate: '2025-01-01',
      endDate: '2025-03-31',
      status: 'Hoàn thành',
    },
  ] as KPI[],

  familyMembers: [
    {
      id: 'fam1',
      employeeId: 'emp001',
      fullName: 'Nguyễn Văn A',
      relation: 'Father',
      phone: '0912345678',
      dateOfBirth: '1960-04-12',
      address: 'Hà Nội',
      occupation: 'Giáo viên nghỉ hưu',
    },
    {
      id: 'fam2',
      employeeId: 'emp001',
      fullName: 'Trần Thị B',
      relation: 'Mother',
      phone: '0987654321',
      dateOfBirth: '1965-09-30',
      address: 'Hà Nội',
      occupation: 'Nội trợ',
    },
  ] as FamilyMember[],

  transfers: [
    {
      id: "TF001",
      employeeId: "emp005",
      employeeName: "Hoàng Văn Em",
      fromDepartmentId: "dept004",
      fromDepartmentName: "Phòng Vận hành",
      toDepartmentId: "dept002",
      toDepartmentName: "Phòng Kỹ thuật",
      reason: "Chuyển sang phòng Kỹ thuật để phát triển kỹ năng chuyên môn",
      createdBy: "emp001",
      createdByName: "Nguyễn Văn An",
      createdAt: "2023-01-15",
      status: "approved",
      directorApprovedBy: "emp001",
      directorApprovedByName: "Nguyễn Văn An",
      directorApprovedAt: "2023-01-16",
      directorComment: "Đồng ý điều động",
      finalApprovedBy: "emp001",
      finalApprovedByName: "Nguyễn Văn An",
      finalApprovedAt: "2023-01-17",
      finalComment: "Phê duyệt",
      effectiveDate: "2023-02-01"
    },
    {
      id: "TF002",
      employeeId: "emp006",
      employeeName: "Võ Thị Phương",
      fromDepartmentId: "dept002",
      fromDepartmentName: "Phòng Kỹ thuật",
      toDepartmentId: "dept003",
      toDepartmentName: "Phòng Kinh doanh",
      reason: "Bổ sung nhân sự kinh doanh",
      createdBy: "emp001",
      createdByName: "Nguyễn Văn An",
      createdAt: "2022-08-20",
      status: "approved",
      directorApprovedBy: "emp001",
      directorApprovedByName: "Nguyễn Văn An",
      directorApprovedAt: "2022-08-21",
      directorComment: "Đồng ý",
      finalApprovedBy: "emp001",
      finalApprovedByName: "Nguyễn Văn An",
      finalApprovedAt: "2022-08-22",
      finalComment: "Phê duyệt",
      effectiveDate: "2022-09-01"
    },
    {
      id: "TF003",
      employeeId: "emp010",
      employeeName: "Phan Thị Kim",
      fromDepartmentId: "dept003",
      fromDepartmentName: "Phòng Kinh doanh",
      toDepartmentId: "dept002",
      toDepartmentName: "Phòng Kỹ thuật",
      reason: "Tăng cường đội ngũ kỹ thuật",
      createdBy: "emp001",
      createdByName: "Nguyễn Văn An",
      createdAt: "2023-01-01",
      status: "approved",
      directorApprovedBy: "emp001",
      directorApprovedByName: "Nguyễn Văn An",
      directorApprovedAt: "2023-01-02",
      directorComment: "Chấp thuận",
      finalApprovedBy: "emp001",
      finalApprovedByName: "Nguyễn Văn An",
      finalApprovedAt: "2023-01-03",
      finalComment: "Đồng ý",
      effectiveDate: "2023-01-10"
    }
  ] as Transfer[],

  safetyEquipmentPlans: [
    {
      id: 'plan001',
      year: 2025,
      departmentId: 'dept002',
      departmentName: 'Phòng Kỹ thuật',
      createdBy: 'emp002',
      createdByName: 'Trần Thị Bình',
      items: [
        { safetyItemId: 's001', itemName: 'Mũ bảo hiểm', quantity: 10, status: 'Approved' as const, approvedBy: 'emp001', approvedDate: '2024-12-01' },
        { safetyItemId: 's002', itemName: 'Giày bảo hộ', quantity: 10, status: 'Approved' as const, approvedBy: 'emp001', approvedDate: '2024-12-01' },
      ],
      status: 'Approved' as const,
      createdAt: '2024-11-15',
      approvedBy: 'emp001',
      approvedDate: '2024-12-01',
    },
    {
      id: 'plan002',
      year: 2025,
      departmentId: 'dept003',
      departmentName: 'Phòng Kinh doanh',
      createdBy: 'emp003',
      createdByName: 'Lê Văn Cường',
      items: [
        { safetyItemId: 's001', itemName: 'Mũ bảo hiểm', quantity: 5, status: 'Pending' as const },
      ],
      status: 'Pending' as const,
      createdAt: '2024-12-20',
    },
  ] as SafetyEquipmentPlan[],

  safetyDistributions: [
    {
      id: 'dist001',
      planId: 'plan001',
      departmentId: 'dept002',
      safetyItemId: 's001',
      itemName: 'Mũ bảo hiểm',
      quantityDistributed: 10,
      distributedBy: 'emp001',
      distributedDate: '2024-12-15',
      receivedBy: 'emp002',
      receivedDate: '2024-12-16',
      status: 'Received' as const,
    },
    {
      id: 'dist002',
      planId: 'plan001',
      departmentId: 'dept002',
      safetyItemId: 's002',
      itemName: 'Giày bảo hộ',
      quantityDistributed: 10,
      distributedBy: 'emp001',
      distributedDate: '2024-12-15',
      status: 'Distributed' as const,
    },
  ] as SafetyDistribution[],
};

export default mockData;
