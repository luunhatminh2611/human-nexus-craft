// Mock data for HR Management System

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
  medicalRecordId?: string;
  documents?: { id: string; name: string; url?: string }[];
  address?: string;
  dateOfBirth?: string;
}

export interface Department {
  id: string;
  name: string;
  parentId?: string;
  managerId?: string;
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
  allergies: string[];
  conditions: { code: string; display: string; note?: string }[];
  immunizations: Array<{
    vaccine: string;
    date: string;
    provider: string;
  }>;
  observations: Array<{
    type: string;
    value: string;
    date: string;
    unit?: string;
  }>;
  visits: Array<{
    date: string;
    reason: string;
    diagnosis?: string;
    notes?: string;
  }>;
}

export interface Grade {
  id: string;
  name: string;
  minSalary: number;
  maxSalary: number;
  requiredSkills: string[];
  requiredTrainings: string[];
}

export interface Position {
  id: string;
  title: string;
  departmentId: string;
  gradeId: string;
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
      position: 'Kỹ sư phần mềm Senior',
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
      position: 'Kỹ sư phần mềm',
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
    { id: 'dept001', name: 'Nhân sự', managerId: 'emp001' },
    { id: 'dept002', name: 'Kỹ thuật', parentId: 'dept001', managerId: 'emp002' },
    { id: 'dept003', name: 'Kinh doanh', parentId: 'dept001', managerId: 'emp003' },
    { id: 'dept004', name: 'Vận hành', parentId: 'dept001', managerId: 'emp001' },
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
    },
    {
      id: 'tr005',
      title: 'Chăm sóc khách hàng xuất sắc',
      description: 'Nâng cao trải nghiệm khách hàng',
      requiredForGrades: ['G1'],
      durationDays: 3,
      status: 'Completed' as const,
      completionRate: 88,
    },
  ] as Training[],

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
      allergies: ['Penicillin'],
      conditions: [
        { code: 'E11', display: 'Tiểu đường type 2', note: 'Kiểm soát tốt bằng thuốc' },
      ],
      immunizations: [
        { vaccine: 'COVID-19', date: '2023-01-15', provider: 'Bệnh viện ABC' },
        { vaccine: 'Cúm mùa', date: '2024-09-01', provider: 'Phòng khám XYZ' },
      ],
      observations: [
        { type: 'Huyết áp', value: '120/80', date: '2024-10-15', unit: 'mmHg' },
        { type: 'Đường huyết', value: '95', date: '2024-10-15', unit: 'mg/dL' },
      ],
      visits: [
        {
          date: '2024-10-15',
          reason: 'Khám định kỳ',
          diagnosis: 'Sức khỏe tốt',
          notes: 'Tiếp tục duy trì chế độ ăn uống và tập luyện',
        },
      ],
    },
    {
      id: 'med002',
      patientId: 'emp002',
      allergies: [],
      conditions: [],
      immunizations: [
        { vaccine: 'COVID-19', date: '2023-02-10', provider: 'Bệnh viện DEF' },
      ],
      observations: [
        { type: 'Huyết áp', value: '118/75', date: '2024-09-20', unit: 'mmHg' },
      ],
      visits: [
        {
          date: '2024-09-20',
          reason: 'Khám sức khỏe',
          diagnosis: 'Khỏe mạnh',
          notes: 'Không có vấn đề gì',
        },
      ],
    },
    {
      id: 'med003',
      patientId: 'emp003',
      allergies: ['Phấn hoa'],
      conditions: [
        { code: 'J30.1', display: 'Viêm mũi dị ứng', note: 'Theo mùa' },
      ],
      immunizations: [
        { vaccine: 'COVID-19', date: '2023-03-05', provider: 'Phòng khám GHI' },
      ],
      observations: [
        { type: 'Huyết áp', value: '125/82', date: '2024-08-10', unit: 'mmHg' },
      ],
      visits: [
        {
          date: '2024-08-10',
          reason: 'Khám viêm mũi',
          diagnosis: 'Viêm mũi dị ứng theo mùa',
          notes: 'Kê đơn thuốc kháng histamine',
        },
      ],
    },
    {
      id: 'med004',
      patientId: 'emp004',
      allergies: [],
      conditions: [],
      immunizations: [
        { vaccine: 'COVID-19', date: '2023-01-20', provider: 'Bệnh viện JKL' },
      ],
      observations: [
        { type: 'Huyết áp', value: '115/70', date: '2024-07-15', unit: 'mmHg' },
      ],
      visits: [],
    },
    {
      id: 'med005',
      patientId: 'emp005',
      allergies: [],
      conditions: [],
      immunizations: [
        { vaccine: 'COVID-19', date: '2023-04-01', provider: 'Phòng khám MNO' },
      ],
      observations: [
        { type: 'Huyết áp', value: '122/78', date: '2024-06-20', unit: 'mmHg' },
      ],
      visits: [
        {
          date: '2024-06-20',
          reason: 'Khám tuyển dụng',
          diagnosis: 'Đủ sức khỏe để làm việc',
          notes: 'Đạt yêu cầu',
        },
      ],
    },
    {
      id: 'med006',
      patientId: 'emp006',
      allergies: [],
      conditions: [],
      immunizations: [
        { vaccine: 'COVID-19', date: '2023-05-10', provider: 'Bệnh viện PQR' },
      ],
      observations: [
        { type: 'Huyết áp', value: '110/68', date: '2024-05-12', unit: 'mmHg' },
      ],
      visits: [],
    },
    {
      id: 'med007',
      patientId: 'emp007',
      allergies: [],
      conditions: [
        { code: 'M54.5', display: 'Đau lưng dưới', note: 'Do làm việc nặng' },
      ],
      immunizations: [
        { vaccine: 'COVID-19', date: '2023-02-28', provider: 'Phòng khám STU' },
      ],
      observations: [
        { type: 'Huyết áp', value: '128/85', date: '2024-04-18', unit: 'mmHg' },
      ],
      visits: [
        {
          date: '2024-04-18',
          reason: 'Đau lưng',
          diagnosis: 'Đau lưng nghề nghiệp',
          notes: 'Khuyên nghỉ ngơi 1 tuần, vật lý trị liệu',
        },
      ],
    },
    {
      id: 'med008',
      patientId: 'emp008',
      allergies: [],
      conditions: [],
      immunizations: [
        { vaccine: 'COVID-19', date: '2023-06-15', provider: 'Bệnh viện VWX' },
      ],
      observations: [
        { type: 'Huyết áp', value: '112/72', date: '2024-03-25', unit: 'mmHg' },
      ],
      visits: [],
    },
    {
      id: 'med009',
      patientId: 'emp009',
      allergies: ['Hải sản'],
      conditions: [],
      immunizations: [
        { vaccine: 'COVID-19', date: '2023-01-10', provider: 'Phòng khám YZ' },
      ],
      observations: [
        { type: 'Huyết áp', value: '120/76', date: '2024-02-14', unit: 'mmHg' },
      ],
      visits: [
        {
          date: '2024-02-14',
          reason: 'Khám định kỳ',
          diagnosis: 'Khỏe mạnh',
          notes: 'Tránh hải sản',
        },
      ],
    },
    {
      id: 'med010',
      patientId: 'emp010',
      allergies: [],
      conditions: [],
      immunizations: [
        { vaccine: 'COVID-19', date: '2023-07-20', provider: 'Bệnh viện ABC' },
      ],
      observations: [
        { type: 'Huyết áp', value: '118/74', date: '2024-01-10', unit: 'mmHg' },
      ],
      visits: [],
    },
  ] as MedicalRecord[],

  grades: [
    {
      id: 'G1',
      name: 'Cấp 1 - Nhân viên',
      minSalary: 12000000,
      maxSalary: 20000000,
      requiredSkills: ['Kỹ năng cơ bản', 'Làm việc nhóm'],
      requiredTrainings: ['tr001'],
    },
    {
      id: 'G2',
      name: 'Cấp 2 - Chuyên viên/Quản lý',
      minSalary: 25000000,
      maxSalary: 40000000,
      requiredSkills: ['Chuyên môn cao', 'Quản lý dự án', 'Lãnh đạo'],
      requiredTrainings: ['tr001', 'tr003'],
    },
    {
      id: 'G3',
      name: 'Cấp 3 - Điều hành',
      minSalary: 45000000,
      maxSalary: 80000000,
      requiredSkills: ['Tư duy chiến lược', 'Quản lý cấp cao', 'Ra quyết định'],
      requiredTrainings: ['tr001', 'tr003'],
    },
  ] as Grade[],

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
};

export default mockData;
