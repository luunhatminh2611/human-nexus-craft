// mock/appointment.ts

export interface Appointment {
  id: string;
  employeeId: string;
  employeeName: string;
  position: string; // Chức vụ được bổ nhiệm
  department: string; // Phòng ban
  appointmentType: 'NEW' | 'REAPPOINTMENT' | 'CONCURRENT'; // Bổ nhiệm mới, Bổ nhiệm lại, Kiêm nhiệm
  reason: string; // Lý do bổ nhiệm
  responsibilities: string; // Nhiệm vụ và quyền hạn
  salary?: number; // Mức lương
  allowance?: number; // Phụ cấp
  decisionNumber: string; // Số quyết định
  decisionDate: string; // Ngày quyết định
  effectiveDate: string; // Ngày có hiệu lực
  termMonths?: number; // Thời hạn (tháng) - null nếu vô thời hạn
  expiryDate?: string; // Ngày hết hạn
  attachments?: FileAttachment[]; // File đính kèm
  note?: string; // Ghi chú
  createdBy: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface Termination {
  id: string;
  employeeId: string;
  employeeName: string;
  position: string; // Chức vụ bị miễn nhiệm
  department: string; // Phòng ban
  appointmentId?: string; // ID quyết định bổ nhiệm (nếu có liên quan)
  appointmentDecisionNumber?: string; // Số QĐ bổ nhiệm
  reason: string; // Lý do miễn nhiệm
  decisionNumber: string; // Số quyết định miễn nhiệm
  decisionDate: string; // Ngày quyết định
  effectiveDate: string; // Ngày có hiệu lực miễn nhiệm
  attachments?: FileAttachment[]; // File đính kèm
  note?: string; // Ghi chú
  createdBy: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface FileAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
}

export const appointmentTypeLabels = {
  NEW: 'Bổ nhiệm mới',
  REAPPOINTMENT: 'Bổ nhiệm lại',
  CONCURRENT: 'Kiêm nhiệm',
};

export const mockAppointments: Appointment[] = [
  {
    id: 'APT001',
    employeeId: 'EMP001',
    employeeName: 'Nguyễn Văn An',
    position: 'Trưởng phòng Kỹ thuật',
    department: 'Phòng Kỹ thuật',
    appointmentType: 'NEW',
    reason: 'Anh An có năng lực chuyên môn xuất sắc, đã có 8 năm kinh nghiệm trong lĩnh vực công nghệ. Trong 2 năm qua đã lãnh đạo nhiều dự án thành công, được đánh giá cao về kỹ năng quản lý và kỹ thuật.',
    responsibilities: '1. Quản lý và điều hành toàn bộ hoạt động của Phòng Kỹ thuật\n2. Xây dựng chiến lược công nghệ cho công ty\n3. Quản lý đội ngũ 25 nhân viên kỹ thuật\n4. Chịu trách nhiệm về chất lượng sản phẩm và dịch vụ\n5. Báo cáo trực tiếp với Giám đốc Công nghệ',
    salary: 50000000,
    allowance: 10000000,
    decisionNumber: 'QD-BN/2024/001',
    decisionDate: '2024-12-15',
    effectiveDate: '2025-01-01',
    termMonths: 36,
    expiryDate: '2027-12-31',
    attachments: [
      {
        id: 'FILE001',
        name: 'Quyet_dinh_bo_nhiem_001.pdf',
        url: '#',
        size: 245000,
        type: 'application/pdf',
        uploadedAt: '2024-12-15T08:30:00Z',
      },
    ],
    createdBy: 'Nguyễn Văn Giám đốc',
    createdById: 'ADMIN001',
    createdAt: '2024-12-15T08:00:00Z',
    updatedAt: '2024-12-15T08:00:00Z',
  },
  {
    id: 'APT002',
    employeeId: 'EMP002',
    employeeName: 'Trần Thị Bình',
    position: 'Giám đốc Marketing',
    department: 'Phòng Marketing',
    appointmentType: 'NEW',
    reason: 'Chị Bình đã có thành tích xuất sắc trong việc phát triển thương hiệu và tăng trưởng doanh số. Trong nhiệm kỳ vừa qua đã giúp công ty mở rộng thị trường và tăng trưởng 45% doanh thu.',
    responsibilities: '1. Xây dựng và triển khai chiến lược marketing tổng thể\n2. Quản lý ngân sách marketing của công ty\n3. Phát triển thương hiệu và hình ảnh công ty\n4. Quản lý đội ngũ marketing 15 người\n5. Phối hợp với các phòng ban khác để đạt mục tiêu kinh doanh',
    salary: 60000000,
    allowance: 15000000,
    decisionNumber: 'QD-BN/2024/002',
    decisionDate: '2024-11-20',
    effectiveDate: '2024-12-01',
    termMonths: 60,
    expiryDate: '2029-11-30',
    attachments: [
      {
        id: 'FILE002',
        name: 'Quyet_dinh_bo_nhiem_002.pdf',
        url: '#',
        size: 312000,
        type: 'application/pdf',
        uploadedAt: '2024-11-20T09:15:00Z',
      },
    ],
    createdBy: 'Nguyễn Văn Giám đốc',
    createdById: 'ADMIN001',
    createdAt: '2024-11-20T09:00:00Z',
    updatedAt: '2024-11-20T09:00:00Z',
  },
  {
    id: 'APT003',
    employeeId: 'EMP003',
    employeeName: 'Lê Văn Cường',
    position: 'Trưởng phòng Nhân sự',
    department: 'Phòng Nhân sự',
    appointmentType: 'REAPPOINTMENT',
    reason: 'Trong nhiệm kỳ vừa qua, anh Cường đã hoàn thành xuất sắc nhiệm vụ, xây dựng đội ngũ nhân sự chất lượng cao, cải thiện môi trường làm việc và văn hóa doanh nghiệp. Ban Giám đốc quyết định bổ nhiệm lại với thời hạn 5 năm.',
    responsibilities: '1. Quản lý và phát triển nguồn nhân lực\n2. Xây dựng và triển khai chính sách nhân sự\n3. Quản lý tuyển dụng, đào tạo và phát triển\n4. Chăm sóc phúc lợi nhân viên\n5. Xây dựng văn hóa doanh nghiệp',
    salary: 52000000,
    allowance: 12000000,
    decisionNumber: 'QD-BN/2024/003',
    decisionDate: '2024-10-15',
    effectiveDate: '2024-11-01',
    termMonths: 60,
    expiryDate: '2029-10-31',
    attachments: [
      {
        id: 'FILE003',
        name: 'Quyet_dinh_bo_nhiem_lai_003.pdf',
        url: '#',
        size: 289000,
        type: 'application/pdf',
        uploadedAt: '2024-10-15T10:20:00Z',
      },
    ],
    createdBy: 'Nguyễn Văn Giám đốc',
    createdById: 'ADMIN001',
    createdAt: '2024-10-15T10:00:00Z',
    updatedAt: '2024-10-15T10:00:00Z',
  },
  {
    id: 'APT004',
    employeeId: 'EMP004',
    employeeName: 'Phạm Thị Dung',
    position: 'Phó Giám đốc Tài chính',
    department: 'Ban Giám đốc',
    appointmentType: 'NEW',
    reason: 'Chị Dung có chuyên môn sâu về tài chính, đã điều hành hiệu quả bộ phận kế toán trong 5 năm qua. Với kinh nghiệm và năng lực quản lý tài chính xuất sắc, được bổ nhiệm làm Phó Giám đốc Tài chính.',
    responsibilities: '1. Điều hành toàn bộ hoạt động tài chính của công ty\n2. Lập kế hoạch tài chính chiến lược\n3. Quản lý ngân sách và dòng tiền\n4. Báo cáo tài chính cho Ban Giám đốc và cổ đông\n5. Đảm bảo tuân thủ các quy định về tài chính',
    salary: 70000000,
    allowance: 20000000,
    decisionNumber: 'QD-BN/2024/004',
    decisionDate: '2024-12-01',
    effectiveDate: '2025-01-15',
    termMonths: null,
    expiryDate: null,
    note: 'Bổ nhiệm vô thời hạn',
    attachments: [],
    createdBy: 'Nguyễn Văn Giám đốc',
    createdById: 'ADMIN001',
    createdAt: '2024-12-01T11:00:00Z',
    updatedAt: '2024-12-01T11:00:00Z',
  },
  {
    id: 'APT005',
    employeeId: 'EMP005',
    employeeName: 'Hoàng Văn Em',
    position: 'Giám đốc Chi nhánh phía Nam',
    department: 'Chi nhánh phía Nam',
    appointmentType: 'CONCURRENT',
    reason: 'Anh Em đang giữ vị trí Trưởng phòng Kinh doanh, do nhu cầu mở rộng thị trường khu vực phía Nam, được bổ nhiệm kiêm nhiệm Giám đốc Chi nhánh phía Nam.',
    responsibilities: '1. Quản lý và phát triển thị trường khu vực phía Nam\n2. Xây dựng đội ngũ kinh doanh tại chi nhánh mới\n3. Đạt mục tiêu doanh thu khu vực được giao\n4. Báo cáo cho Ban Giám đốc về tình hình kinh doanh',
    salary: 45000000,
    allowance: 25000000,
    decisionNumber: 'QD-BN/2024/005',
    decisionDate: '2024-11-10',
    effectiveDate: '2024-12-01',
    termMonths: 24,
    expiryDate: '2026-11-30',
    note: 'Kiêm nhiệm, vẫn giữ chức Trưởng phòng Kinh doanh tại trụ sở chính',
    attachments: [
      {
        id: 'FILE005',
        name: 'Quyet_dinh_kiem_nhiem_005.pdf',
        url: '#',
        size: 198000,
        type: 'application/pdf',
        uploadedAt: '2024-11-10T14:30:00Z',
      },
    ],
    createdBy: 'Nguyễn Văn Giám đốc',
    createdById: 'ADMIN001',
    createdAt: '2024-11-10T14:00:00Z',
    updatedAt: '2024-11-10T14:00:00Z',
  },
  {
    id: 'APT006',
    employeeId: 'EMP006',
    employeeName: 'Đỗ Thị Phượng',
    position: 'Trưởng phòng IT',
    department: 'Phòng IT',
    appointmentType: 'NEW',
    reason: 'Chị Phượng có kinh nghiệm 10 năm trong lĩnh vực IT, đã từng quản lý nhiều dự án lớn thành công. Năng lực lãnh đạo và chuyên môn được đánh giá cao.',
    responsibilities: '1. Quản lý hạ tầng công nghệ thông tin\n2. Đảm bảo an ninh mạng và dữ liệu\n3. Quản lý đội ngũ IT 18 người\n4. Lập kế hoạch và ngân sách IT hàng năm\n5. Hỗ trợ các phòng ban về công nghệ',
    salary: 42000000,
    allowance: 8000000,
    decisionNumber: 'QD-BN/2024/006',
    decisionDate: '2024-12-20',
    effectiveDate: '2025-01-05',
    termMonths: 36,
    expiryDate: '2028-01-04',
    attachments: [],
    createdBy: 'Nguyễn Văn Giám đốc',
    createdById: 'ADMIN001',
    createdAt: '2024-12-20T09:00:00Z',
    updatedAt: '2024-12-20T09:00:00Z',
  },
  {
    id: 'APT007',
    employeeId: 'EMP007',
    employeeName: 'Vũ Văn Giang',
    position: 'Trưởng phòng Hành chính',
    department: 'Phòng Hành chính',
    appointmentType: 'REAPPOINTMENT',
    reason: 'Anh Giang đã hoàn thành tốt nhiệm vụ trong nhiệm kỳ vừa qua, duy trì hoạt động hành chính trơn tru, được bổ nhiệm lại để tiếp tục đóng góp cho công ty.',
    responsibilities: '1. Quản lý công tác hành chính tổng hợp\n2. Quản lý cơ sở vật chất và tài sản\n3. Tổ chức sự kiện và hội nghị\n4. Quản lý văn phòng phẩm và dịch vụ\n5. Phối hợp với các phòng ban khác',
    salary: 35000000,
    allowance: 7000000,
    decisionNumber: 'QD-BN/2024/007',
    decisionDate: '2024-09-25',
    effectiveDate: '2024-10-01',
    termMonths: 48,
    expiryDate: '2028-09-30',
    attachments: [
      {
        id: 'FILE007',
        name: 'Quyet_dinh_bo_nhiem_lai_007.pdf',
        url: '#',
        size: 267000,
        type: 'application/pdf',
        uploadedAt: '2024-09-25T10:45:00Z',
      },
    ],
    createdBy: 'Nguyễn Văn Giám đốc',
    createdById: 'ADMIN001',
    createdAt: '2024-09-25T10:00:00Z',
    updatedAt: '2024-09-25T10:00:00Z',
  },
];

export const mockTerminations: Termination[] = [
  {
    id: 'TER001',
    employeeId: 'EMP008',
    employeeName: 'Bùi Thị Hà',
    position: 'Trưởng phòng Pháp chế',
    department: 'Phòng Pháp chế',
    appointmentId: 'APT_OLD_001',
    appointmentDecisionNumber: 'QD-BN/2022/009',
    reason: 'Hết thời hạn bổ nhiệm, không tiếp tục gia hạn do công ty tái cơ cấu bộ phận pháp chế.',
    decisionNumber: 'QD-MN/2024/001',
    decisionDate: '2024-03-15',
    effectiveDate: '2024-04-01',
    note: 'Nhân viên được chuyển về vị trí chuyên viên pháp lý cấp cao',
    attachments: [
      {
        id: 'FILE_TER001',
        name: 'Quyet_dinh_mien_nhiem_001.pdf',
        url: '#',
        size: 234000,
        type: 'application/pdf',
        uploadedAt: '2024-03-15T11:30:00Z',
      },
    ],
    createdBy: 'Nguyễn Văn Giám đốc',
    createdById: 'ADMIN001',
    createdAt: '2024-03-15T11:00:00Z',
    updatedAt: '2024-03-15T11:00:00Z',
  },
  {
    id: 'TER002',
    employeeId: 'EMP009',
    employeeName: 'Ngô Văn Inh',
    position: 'Giám đốc Sản xuất',
    department: 'Phòng Sản xuất',
    appointmentId: 'APT_OLD_002',
    appointmentDecisionNumber: 'QD-BN/2021/006',
    reason: 'Nghỉ hưu theo chế độ. Anh Inh đã đóng góp tích cực cho công ty trong suốt 25 năm làm việc.',
    decisionNumber: 'QD-MN/2024/002',
    decisionDate: '2024-06-20',
    effectiveDate: '2024-07-01',
    note: 'Tổ chức lễ vinh danh và tri ân nhân viên nghỉ hưu',
    attachments: [
      {
        id: 'FILE_TER002',
        name: 'Quyet_dinh_mien_nhiem_002.pdf',
        url: '#',
        size: 278000,
        type: 'application/pdf',
        uploadedAt: '2024-06-20T09:15:00Z',
      },
    ],
    createdBy: 'Nguyễn Văn Giám đốc',
    createdById: 'ADMIN001',
    createdAt: '2024-06-20T09:00:00Z',
    updatedAt: '2024-06-20T09:00:00Z',
  },
  {
    id: 'TER003',
    employeeId: 'EMP010',
    employeeName: 'Lý Thị Kim',
    position: 'Trưởng phòng Đào tạo',
    department: 'Phòng Đào tạo',
    appointmentId: 'APT_OLD_003',
    appointmentDecisionNumber: 'QD-BN/2023/008',
    reason: 'Vi phạm quy định về đạo đức nghề nghiệp và sử dụng kinh phí đào tạo không đúng mục đích. Sau khi xem xét, Ban Giám đốc quyết định miễn nhiệm.',
    decisionNumber: 'QD-MN/2024/003',
    decisionDate: '2024-08-15',
    effectiveDate: '2024-08-20',
    note: 'Nhân viên bị kỷ luật và chuyển sang vị trí nhân viên thường',
    attachments: [
      {
        id: 'FILE_TER003',
        name: 'Quyet_dinh_mien_nhiem_003.pdf',
        url: '#',
        size: 312000,
        type: 'application/pdf',
        uploadedAt: '2024-08-15T14:20:00Z',
      },
      {
        id: 'FILE_TER003_2',
        name: 'Bien_ban_vi_pham.pdf',
        url: '#',
        size: 456000,
        type: 'application/pdf',
        uploadedAt: '2024-08-15T14:25:00Z',
      },
    ],
    createdBy: 'Nguyễn Văn Giám đốc',
    createdById: 'ADMIN001',
    createdAt: '2024-08-15T14:00:00Z',
    updatedAt: '2024-08-15T14:00:00Z',
  },
  {
    id: 'TER004',
    employeeId: 'EMP011',
    employeeName: 'Trương Văn Long',
    position: 'Phó Giám đốc Kinh doanh',
    department: 'Phòng Kinh doanh',
    appointmentId: 'APT_OLD_004',
    appointmentDecisionNumber: 'QD-BN/2022/015',
    reason: 'Chuyển công tác sang chi nhánh nước ngoài, không còn đảm nhận vị trí tại trụ sở chính.',
    decisionNumber: 'QD-MN/2024/004',
    decisionDate: '2024-10-10',
    effectiveDate: '2024-11-01',
    note: 'Nhân viên được bổ nhiệm làm Giám đốc Chi nhánh Singapore',
    attachments: [
      {
        id: 'FILE_TER004',
        name: 'Quyet_dinh_mien_nhiem_004.pdf',
        url: '#',
        size: 289000,
        type: 'application/pdf',
        uploadedAt: '2024-10-10T15:30:00Z',
      },
    ],
    createdBy: 'Nguyễn Văn Giám đốc',
    createdById: 'ADMIN001',
    createdAt: '2024-10-10T15:00:00Z',
    updatedAt: '2024-10-10T15:00:00Z',
  },
];

export const calculateAppointmentStatistics = (appointments: Appointment[]) => {
  const total = appointments.length;
  const byType = {
    NEW: appointments.filter(a => a.appointmentType === 'NEW').length,
    REAPPOINTMENT: appointments.filter(a => a.appointmentType === 'REAPPOINTMENT').length,
    CONCURRENT: appointments.filter(a => a.appointmentType === 'CONCURRENT').length,
  };

  const withTerm = appointments.filter(a => a.termMonths !== null && a.termMonths !== undefined).length;
  const unlimited = appointments.filter(a => a.termMonths === null || a.termMonths === undefined).length;

  // Tính số quyết định sắp hết hạn (trong vòng 3 tháng)
  const today = new Date();
  const threeMonthsLater = new Date(today.getFullYear(), today.getMonth() + 3, today.getDate());
  const expiringSoon = appointments.filter(a => {
    if (!a.expiryDate) return false;
    const expiryDate = new Date(a.expiryDate);
    return expiryDate > today && expiryDate <= threeMonthsLater;
  }).length;

  return {
    total,
    byType,
    withTerm,
    unlimited,
    expiringSoon,
  };
};

export const calculateTerminationStatistics = (terminations: Termination[]) => {
  const total = terminations.length;
  
  // Thống kê theo tháng trong năm hiện tại
  const currentYear = new Date().getFullYear();
  const byMonth = Array(12).fill(0);
  
  terminations.forEach(t => {
    const date = new Date(t.effectiveDate);
    if (date.getFullYear() === currentYear) {
      byMonth[date.getMonth()]++;
    }
  });

  return {
    total,
    byMonth,
    currentYear,
  };
};