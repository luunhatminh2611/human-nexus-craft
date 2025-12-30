// mock/appointment.ts

export interface Appointment {
  id: string;
  employeeId: string;
  employeeName: string;
  currentPosition: string;
  currentDepartment: string;
  newPosition: string;
  newDepartment: string;
  appointmentType: 'NEW' | 'REAPPOINTMENT' | 'CONCURRENT'; // Bổ nhiệm mới, Bổ nhiệm lại, Kiêm nhiệm
  reason: string; // Lý do bổ nhiệm
  responsibilities: string; // Nhiệm vụ và quyền hạn
  currentSalary?: number;
  newSalary?: number;
  allowance?: number; // Phụ cấp
  decisionNumber: string; // Số quyết định
  decisionDate: string; // Ngày ban hành
  effectiveDate: string; // Ngày có hiệu lực
  termMonths?: number; // Thời hạn (tháng) - null nếu vô thời hạn
  expiryDate?: string; // Ngày hết hạn - null nếu vô thời hạn
  status: 'DRAFT' | 'PUBLISHED' | 'PENDING_EFFECTIVE' | 'IN_EFFECT' | 'EXPIRING_SOON' | 'EXPIRED' | 'REVOKED' | 'TERMINATED';
  revokedReason?: string; // Lý do hủy bỏ
  revokedDate?: string;
  // Thông tin miễn nhiệm
  terminationDate?: string; // Ngày miễn nhiệm
  terminationReason?: string; // Lý do miễn nhiệm
  terminationDecisionNumber?: string; // Số QĐ miễn nhiệm
  terminationDecisionDate?: string; // Ngày QĐ miễn nhiệm
  terminationBy?: string; // Người quyết định miễn nhiệm
  terminationNote?: string; // Ghi chú thêm
  createdBy: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  previousAppointments?: PreviousAppointment[]; // Lịch sử bổ nhiệm
}

export interface PreviousAppointment {
  position: string;
  department: string;
  decisionNumber: string;
  effectiveDate: string;
  expiryDate?: string;
  termMonths?: number;
}

export const appointmentTypeLabels = {
  NEW: 'Bổ nhiệm mới',
  REAPPOINTMENT: 'Bổ nhiệm lại',
  CONCURRENT: 'Kiêm nhiệm',
};

export const statusLabels = {
  DRAFT: 'Bản nháp',
  PUBLISHED: 'Đã ban hành',
  PENDING_EFFECTIVE: 'Chờ có hiệu lực',
  IN_EFFECT: 'Đang có hiệu lực',
  EXPIRING_SOON: 'Sắp hết hạn',
  EXPIRED: 'Đã hết hạn',
  REVOKED: 'Đã hủy bỏ',
  TERMINATED: 'Đã miễn nhiệm',
};

export const mockAppointments: Appointment[] = [
  {
    id: 'APT001',
    employeeId: 'EMP001',
    employeeName: 'Nguyễn Văn An',
    currentPosition: 'Senior Developer',
    currentDepartment: 'Phòng Kỹ thuật',
    newPosition: 'Trưởng phòng Kỹ thuật',
    newDepartment: 'Phòng Kỹ thuật',
    appointmentType: 'NEW',
    reason: 'Anh An có năng lực chuyên môn xuất sắc, đã có 8 năm kinh nghiệm trong lĩnh vực công nghệ. Trong 2 năm qua đã lãnh đạo nhiều dự án thành công, được đánh giá cao về kỹ năng quản lý và kỹ thuật.',
    responsibilities: '1. Quản lý và điều hành toàn bộ hoạt động của Phòng Kỹ thuật\n2. Xây dựng chiến lược công nghệ cho công ty\n3. Quản lý đội ngũ 25 nhân viên kỹ thuật\n4. Chịu trách nhiệm về chất lượng sản phẩm và dịch vụ\n5. Báo cáo trực tiếp với Giám đốc Công nghệ',
    currentSalary: 30000000,
    newSalary: 50000000,
    allowance: 10000000,
    decisionNumber: 'QD-BN/2024/001',
    decisionDate: '2024-12-15',
    effectiveDate: '2025-01-01',
    termMonths: 36,
    expiryDate: '2027-12-31',
    status: 'PENDING_EFFECTIVE',
    createdBy: 'Nguyễn Văn Giám đốc',
    createdById: 'ADMIN001',
    createdAt: '2024-12-15T08:00:00Z',
    updatedAt: '2024-12-15T08:00:00Z',
    previousAppointments: [],
  },
  {
    id: 'APT002',
    employeeId: 'EMP002',
    employeeName: 'Trần Thị Bình',
    currentPosition: 'Marketing Manager',
    currentDepartment: 'Phòng Marketing',
    newPosition: 'Giám đốc Marketing',
    newDepartment: 'Phòng Marketing',
    appointmentType: 'NEW',
    reason: 'Chị Bình đã có thành tích xuất sắc trong việc phát triển thương hiệu và tăng trưởng doanh số. Trong nhiệm kỳ vừa qua đã giúp công ty mở rộng thị trường và tăng trưởng 45% doanh thu.',
    responsibilities: '1. Xây dựng và triển khai chiến lược marketing tổng thể\n2. Quản lý ngân sách marketing của công ty\n3. Phát triển thương hiệu và hình ảnh công ty\n4. Quản lý đội ngũ marketing 15 người\n5. Phối hợp với các phòng ban khác để đạt mục tiêu kinh doanh',
    currentSalary: 35000000,
    newSalary: 60000000,
    allowance: 15000000,
    decisionNumber: 'QD-BN/2024/002',
    decisionDate: '2024-11-20',
    effectiveDate: '2024-12-01',
    termMonths: 60,
    expiryDate: '2029-11-30',
    status: 'IN_EFFECT',
    createdBy: 'Nguyễn Văn Giám đốc',
    createdById: 'ADMIN001',
    createdAt: '2024-11-20T09:00:00Z',
    updatedAt: '2024-11-20T09:00:00Z',
    previousAppointments: [],
  },
  {
    id: 'APT003',
    employeeId: 'EMP003',
    employeeName: 'Lê Văn Cường',
    currentPosition: 'Trưởng phòng Nhân sự',
    currentDepartment: 'Phòng Nhân sự',
    newPosition: 'Trưởng phòng Nhân sự',
    newDepartment: 'Phòng Nhân sự',
    appointmentType: 'REAPPOINTMENT',
    reason: 'Trong nhiệm kỳ vừa qua, anh Cường đã hoàn thành xuất sắc nhiệm vụ, xây dựng đội ngũ nhân sự chất lượng cao, cải thiện môi trường làm việc và văn hóa doanh nghiệp. Ban Giám đốc quyết định bổ nhiệm lại với thời hạn 5 năm.',
    responsibilities: '1. Quản lý và phát triển nguồn nhân lực\n2. Xây dựng và triển khai chính sách nhân sự\n3. Quản lý tuyển dụng, đào tạo và phát triển\n4. Chăm sóc phúc lợi nhân viên\n5. Xây dựng văn hóa doanh nghiệp',
    currentSalary: 45000000,
    newSalary: 52000000,
    allowance: 12000000,
    decisionNumber: 'QD-BN/2024/003',
    decisionDate: '2024-10-15',
    effectiveDate: '2024-11-01',
    termMonths: 60,
    expiryDate: '2029-10-31',
    status: 'IN_EFFECT',
    createdBy: 'Nguyễn Văn Giám đốc',
    createdById: 'ADMIN001',
    createdAt: '2024-10-15T10:00:00Z',
    updatedAt: '2024-10-15T10:00:00Z',
    previousAppointments: [
      {
        position: 'Trưởng phòng Nhân sự',
        department: 'Phòng Nhân sự',
        decisionNumber: 'QD-BN/2021/015',
        effectiveDate: '2021-11-01',
        expiryDate: '2024-10-31',
        termMonths: 36,
      },
      {
        position: 'Phó phòng Nhân sự',
        department: 'Phòng Nhân sự',
        decisionNumber: 'QD-BN/2019/008',
        effectiveDate: '2019-06-01',
        expiryDate: '2021-10-31',
        termMonths: 29,
      },
    ],
  },
  {
    id: 'APT004',
    employeeId: 'EMP004',
    employeeName: 'Phạm Thị Dung',
    currentPosition: 'Kế toán trưởng',
    currentDepartment: 'Phòng Kế toán',
    newPosition: 'Phó Giám đốc Tài chính',
    newDepartment: 'Ban Giám đốc',
    appointmentType: 'NEW',
    reason: 'Chị Dung có chuyên môn sâu về tài chính, đã điều hành hiệu quả bộ phận kế toán trong 5 năm qua. Với kinh nghiệm và năng lực quản lý tài chính xuất sắc, được bổ nhiệm làm Phó Giám đốc Tài chính.',
    responsibilities: '1. Điều hành toàn bộ hoạt động tài chính của công ty\n2. Lập kế hoạch tài chính chiến lược\n3. Quản lý ngân sách và dòng tiền\n4. Báo cáo tài chính cho Ban Giám đốc và cổ đông\n5. Đảm bảo tuân thủ các quy định về tài chính',
    currentSalary: 40000000,
    newSalary: 70000000,
    allowance: 20000000,
    decisionNumber: 'QD-BN/2024/004',
    decisionDate: '2024-12-01',
    effectiveDate: '2025-01-15',
    termMonths: null,
    expiryDate: null,
    status: 'PENDING_EFFECTIVE',
    createdBy: 'Nguyễn Văn Giám đốc',
    createdById: 'ADMIN001',
    createdAt: '2024-12-01T11:00:00Z',
    updatedAt: '2024-12-01T11:00:00Z',
    previousAppointments: [
      {
        position: 'Kế toán trưởng',
        department: 'Phòng Kế toán',
        decisionNumber: 'QD-BN/2019/012',
        effectiveDate: '2019-08-01',
        expiryDate: null,
        termMonths: null,
      },
    ],
  },
  {
    id: 'APT005',
    employeeId: 'EMP005',
    employeeName: 'Hoàng Văn Em',
    currentPosition: 'Trưởng phòng Kinh doanh',
    currentDepartment: 'Phòng Kinh doanh',
    newPosition: 'Giám đốc Kinh doanh',
    newDepartment: 'Phòng Kinh doanh',
    appointmentType: 'CONCURRENT',
    reason: 'Anh Em đang giữ vị trí Trưởng phòng Kinh doanh, do nhu cầu mở rộng thị trường khu vực phía Nam, được bổ nhiệm kiêm nhiệm Giám đốc Chi nhánh phía Nam.',
    responsibilities: '1. Tiếp tục điều hành Phòng Kinh doanh tại trụ sở chính\n2. Quản lý và phát triển thị trường khu vực phía Nam\n3. Xây dựng đội ngũ kinh doanh tại chi nhánh mới\n4. Đạt mục tiêu doanh thu khu vực được giao\n5. Báo cáo cho Ban Giám đốc về tình hình kinh doanh',
    currentSalary: 45000000,
    newSalary: 45000000,
    allowance: 25000000,
    decisionNumber: 'QD-BN/2024/005',
    decisionDate: '2024-11-10',
    effectiveDate: '2024-12-01',
    termMonths: 24,
    expiryDate: '2026-11-30',
    status: 'IN_EFFECT',
    createdBy: 'Nguyễn Văn Giám đốc',
    createdById: 'ADMIN001',
    createdAt: '2024-11-10T14:00:00Z',
    updatedAt: '2024-11-10T14:00:00Z',
    previousAppointments: [
      {
        position: 'Trưởng phòng Kinh doanh',
        department: 'Phòng Kinh doanh',
        decisionNumber: 'QD-BN/2022/007',
        effectiveDate: '2022-03-01',
        expiryDate: null,
        termMonths: null,
      },
    ],
  },
  {
    id: 'APT006',
    employeeId: 'EMP006',
    employeeName: 'Đỗ Thị Phượng',
    currentPosition: 'Phó phòng IT',
    currentDepartment: 'Phòng IT',
    newPosition: 'Trưởng phòng IT',
    newDepartment: 'Phòng IT',
    appointmentType: 'NEW',
    reason: 'Chị Phượng có kinh nghiệm 10 năm trong lĩnh vực IT, đã từng quản lý nhiều dự án lớn thành công. Năng lực lãnh đạo và chuyên môn được đánh giá cao.',
    responsibilities: '1. Quản lý hạ tầng công nghệ thông tin\n2. Đảm bảo an ninh mạng và dữ liệu\n3. Quản lý đội ngũ IT 18 người\n4. Lập kế hoạch và ngân sách IT hàng năm\n5. Hỗ trợ các phòng ban về công nghệ',
    currentSalary: 28000000,
    newSalary: 42000000,
    allowance: 8000000,
    decisionNumber: 'QD-BN/2024/006',
    decisionDate: '2024-12-20',
    effectiveDate: '2024-12-20',
    termMonths: 36,
    expiryDate: '2027-12-19',
    status: 'DRAFT',
    createdBy: 'Nguyễn Văn Giám đốc',
    createdById: 'ADMIN001',
    createdAt: '2024-12-20T09:00:00Z',
    updatedAt: '2024-12-20T09:00:00Z',
    previousAppointments: [],
  },
  {
    id: 'APT007',
    employeeId: 'EMP007',
    employeeName: 'Vũ Văn Giang',
    currentPosition: 'Trưởng phòng Hành chính',
    currentDepartment: 'Phòng Hành chính',
    newPosition: 'Trưởng phòng Hành chính',
    newDepartment: 'Phòng Hành chính',
    appointmentType: 'REAPPOINTMENT',
    reason: 'Anh Giang đã hoàn thành tốt nhiệm vụ trong nhiệm kỳ vừa qua, duy trì hoạt động hành chính trơn tru, được bổ nhiệm lại để tiếp tục đóng góp cho công ty.',
    responsibilities: '1. Quản lý công tác hành chính tổng hợp\n2. Quản lý cơ sở vật chất và tài sản\n3. Tổ chức sự kiện và hội nghị\n4. Quản lý văn phòng phẩm và dịch vụ\n5. Phối hợp với các phòng ban khác',
    currentSalary: 32000000,
    newSalary: 35000000,
    allowance: 7000000,
    decisionNumber: 'QD-BN/2024/007',
    decisionDate: '2024-09-25',
    effectiveDate: '2024-10-01',
    termMonths: 48,
    expiryDate: '2028-09-30',
    status: 'IN_EFFECT',
    createdBy: 'Nguyễn Văn Giám đốc',
    createdById: 'ADMIN001',
    createdAt: '2024-09-25T10:00:00Z',
    updatedAt: '2024-09-25T10:00:00Z',
    previousAppointments: [
      {
        position: 'Trưởng phòng Hành chính',
        department: 'Phòng Hành chính',
        decisionNumber: 'QD-BN/2020/011',
        effectiveDate: '2020-10-01',
        expiryDate: '2024-09-30',
        termMonths: 48,
      },
    ],
  },
  {
    id: 'APT008',
    employeeId: 'EMP008',
    employeeName: 'Bùi Thị Hà',
    currentPosition: 'Trưởng phòng Pháp chế',
    currentDepartment: 'Phòng Pháp chế',
    newPosition: 'Trưởng phòng Pháp chế',
    newDepartment: 'Phòng Pháp chế',
    appointmentType: 'REAPPOINTMENT',
    reason: 'Chị Hà đã đảm bảo các hoạt động của công ty tuân thủ pháp luật, xử lý tốt các vấn đề pháp lý. Quyết định bổ nhiệm lại hết hạn vào 2025-03-31.',
    responsibilities: '1. Tư vấn pháp lý cho Ban Giám đốc\n2. Soạn thảo và thẩm định hợp đồng\n3. Xử lý tranh chấp và khiếu nại\n4. Đảm bảo tuân thủ pháp luật\n5. Quản lý văn bản pháp lý',
    currentSalary: 38000000,
    newSalary: 38000000,
    allowance: 9000000,
    decisionNumber: 'QD-BN/2022/009',
    decisionDate: '2022-03-15',
    effectiveDate: '2022-04-01',
    termMonths: 36,
    expiryDate: '2025-03-31',
    status: 'EXPIRING_SOON',
    createdBy: 'Nguyễn Văn Giám đốc',
    createdById: 'ADMIN001',
    createdAt: '2022-03-15T11:00:00Z',
    updatedAt: '2022-03-15T11:00:00Z',
    previousAppointments: [
      {
        position: 'Phó phòng Pháp chế',
        department: 'Phòng Pháp chế',
        decisionNumber: 'QD-BN/2019/014',
        effectiveDate: '2019-09-01',
        expiryDate: '2022-03-31',
        termMonths: 31,
      },
    ],
  },
  {
    id: 'APT009',
    employeeId: 'EMP009',
    employeeName: 'Ngô Văn Inh',
    currentPosition: 'Giám đốc Sản xuất',
    currentDepartment: 'Phòng Sản xuất',
    newPosition: 'Giám đốc Sản xuất',
    newDepartment: 'Phòng Sản xuất',
    appointmentType: 'REAPPOINTMENT',
    reason: 'Anh Inh đã quản lý hiệu quả bộ phận sản xuất, nâng cao năng suất và chất lượng sản phẩm. Quyết định bổ nhiệm lại đã hết hạn vào 2024-06-30.',
    responsibilities: '1. Điều hành hoạt động sản xuất\n2. Tối ưu hóa quy trình sản xuất\n3. Quản lý chất lượng sản phẩm\n4. Quản lý đội ngũ công nhân 150 người\n5. Đảm bảo an toàn lao động',
    currentSalary: 55000000,
    newSalary: 55000000,
    allowance: 15000000,
    decisionNumber: 'QD-BN/2021/006',
    decisionDate: '2021-06-15',
    effectiveDate: '2021-07-01',
    termMonths: 36,
    expiryDate: '2024-06-30',
    status: 'EXPIRED',
    createdBy: 'Nguyễn Văn Giám đốc',
    createdById: 'ADMIN001',
    createdAt: '2021-06-15T09:00:00Z',
    updatedAt: '2021-06-15T09:00:00Z',
    previousAppointments: [
      {
        position: 'Trưởng phòng Sản xuất',
        department: 'Phòng Sản xuất',
        decisionNumber: 'QD-BN/2018/004',
        effectiveDate: '2018-01-01',
        expiryDate: '2021-06-30',
        termMonths: 42,
      },
    ],
  },
  {
    id: 'APT010',
    employeeId: 'EMP010',
    employeeName: 'Lý Thị Kim',
    currentPosition: 'Trưởng phòng Đào tạo',
    currentDepartment: 'Phòng Đào tạo',
    newPosition: 'Trưởng phòng Đào tạo',
    newDepartment: 'Phòng Đào tạo',
    appointmentType: 'NEW',
    reason: 'Chị Kim có vi phạm kỷ luật nghiêm trọng, quyết định bổ nhiệm đã bị hủy bỏ vào ngày 2024-08-15.',
    responsibilities: '1. Xây dựng chương trình đào tạo\n2. Tổ chức các khóa đào tạo nội bộ\n3. Phát triển năng lực nhân viên\n4. Quản lý ngân sách đào tạo\n5. Đánh giá hiệu quả đào tạo',
    currentSalary: 30000000,
    newSalary: 40000000,
    allowance: 8000000,
    decisionNumber: 'QD-BN/2024/008',
    decisionDate: '2024-06-01',
    effectiveDate: '2024-06-15',
    termMonths: 36,
    expiryDate: '2027-06-14',
    status: 'REVOKED',
    revokedReason: 'Vi phạm quy định về đạo đức nghề nghiệp và sử dụng kinh phí đào tạo không đúng mục đích. Sau khi xem xét, Ban Giám đốc quyết định hủy bỏ quyết định bổ nhiệm.',
    revokedDate: '2024-08-15',
    createdBy: 'Nguyễn Văn Giám đốc',
    createdById: 'ADMIN001',
    createdAt: '2024-06-01T08:00:00Z',
    updatedAt: '2024-08-15T10:00:00Z',
    previousAppointments: [],
  },
];

export const calculateAppointmentStatistics = (appointments: Appointment[]) => {
  const total = appointments.length;
  const draft = appointments.filter(a => a.status === 'DRAFT').length;
  const published = appointments.filter(a => a.status === 'PUBLISHED').length;
  const pendingEffective = appointments.filter(a => a.status === 'PENDING_EFFECTIVE').length;
  const inEffect = appointments.filter(a => a.status === 'IN_EFFECT').length;
  const expiringSoon = appointments.filter(a => a.status === 'EXPIRING_SOON').length;
  const expired = appointments.filter(a => a.status === 'EXPIRED').length;
  const revoked = appointments.filter(a => a.status === 'REVOKED').length;
  const terminated = appointments.filter(a => a.status === 'TERMINATED').length;

  const byType = {
    NEW: appointments.filter(a => a.appointmentType === 'NEW').length,
    REAPPOINTMENT: appointments.filter(a => a.appointmentType === 'REAPPOINTMENT').length,
    CONCURRENT: appointments.filter(a => a.appointmentType === 'CONCURRENT').length,
  };

  return {
    total,
    draft,
    published,
    pendingEffective,
    inEffect,
    expiringSoon,
    expired,
    revoked,
    terminated,
    byType,
  };
};