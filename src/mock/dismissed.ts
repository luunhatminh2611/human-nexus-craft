// mock/discipline.ts

export type DisciplineStatus = 
  | 'DRAFT'                    // Bản nháp (Manager tạo)
  | 'PENDING_EXPLANATION'      // Chờ giải trình (đã gửi cho NV)
  | 'PENDING_REVIEW'           // Chờ xem xét (NV đã nộp giải trình)
  | 'OVERDUE'                  // Quá hạn giải trình
  | 'COMPLETED'                // Đã hoàn thành (Admin đã quyết định)
  | 'DISMISSED';               // Bác bỏ (không vi phạm)

export type ViolationSeverity = 'LIGHT' | 'MEDIUM' | 'SERIOUS';

export type DisciplineAction = 
  | 'WARNING'          // Khiển trách
  | 'REPRIMAND'        // Cảnh cáo
  | 'SALARY_CUT'       // Cắt giảm lương
  | 'DEMOTION'         // Giáng chức
  | 'TERMINATION'      // Sa thải
  | 'DISMISSED';       // Không xử lý

export interface Discipline {
  id: string;
  employeeId: string;
  employeeName: string;
  departmentName: string;
  position: string;
  
  // Thông tin vi phạm
  violationType: string;           // Loại vi phạm
  violationDescription: string;    // Mô tả chi tiết
  violationDate: string;           // Ngày vi phạm
  violationLocation: string;       // Địa điểm
  severity: ViolationSeverity;     // Mức độ
  
  // Người tạo (Manager)
  createdBy: string;
  createdByName: string;
  createdDate: string;
  
  // Thông báo gửi nhân viên
  sentDate?: string;               // Ngày gửi thông báo
  explanationDeadline?: string;    // Hạn giải trình
  
  // Giải trình của nhân viên
  explanationText?: string;
  explanationFiles?: string[];     // Danh sách file đính kèm
  explanationDate?: string;        // Ngày nộp giải trình
  
  // Quyết định của Admin
  decisionNumber?: string;
  decisionDate?: string;
  disciplineAction?: DisciplineAction;
  decisionReason?: string;
  decisionBy?: string;
  decisionByName?: string;
  
  status: DisciplineStatus;
  notes?: string;
}

export const violationTypes = [
  'Vi phạm giờ giấc',
  'Vi phạm quy định an toàn',
  'Vi phạm quy định bảo mật',
  'Thái độ làm việc không đúng',
  'Vi phạm quy trình nghiệp vụ',
  'Gây mất đoàn kết',
  'Sử dụng tài sản công ty sai mục đích',
  'Vi phạm khác',
];

export const statusLabels: Record<DisciplineStatus, string> = {
  DRAFT: 'Bản nháp',
  PENDING_EXPLANATION: 'Chờ giải trình',
  PENDING_REVIEW: 'Chờ xem xét',
  OVERDUE: 'Quá hạn',
  COMPLETED: 'Đã hoàn thành',
  DISMISSED: 'Đã bác bỏ',
};

export const actionLabels: Record<DisciplineAction, string> = {
  WARNING: 'Khiển trách',
  REPRIMAND: 'Cảnh cáo',
  SALARY_CUT: 'Cắt giảm lương',
  DEMOTION: 'Giáng chức',
  TERMINATION: 'Sa thải',
  DISMISSED: 'Không xử lý',
};

export const severityLabels: Record<ViolationSeverity, string> = {
  LIGHT: 'Nhẹ',
  MEDIUM: 'Trung bình',
  SERIOUS: 'Nghiêm trọng',
};

// Mock data
export const mockDisciplines: Discipline[] = [
  {
    id: 'DIS-001',
    employeeId: 'EMP-001',
    employeeName: 'Nguyễn Văn An',
    departmentName: 'Phòng IT',
    position: 'Developer',
    violationType: 'Vi phạm giờ giấc',
    violationDescription: 'Đi muộn 5 lần trong tháng 11/2024 mà không có lý do chính đáng',
    violationDate: '2024-11-30',
    violationLocation: 'Văn phòng chính',
    severity: 'LIGHT',
    createdBy: 'MGR-001',
    createdByName: 'Trần Thị B',
    createdDate: '2024-12-01',
    sentDate: '2024-12-02',
    explanationDeadline: '2024-12-12',
    explanationText: 'Em xin giải trình: Do gặp sự cố gia đình nên em đã đi muộn. Em có giấy xác nhận từ bệnh viện về việc mẹ em bị ốm đột ngột.',
    explanationFiles: ['giay-xac-nhan-benh-vien.pdf'],
    explanationDate: '2024-12-05',
    status: 'PENDING_REVIEW',
  },
  {
    id: 'DIS-002',
    employeeId: 'EMP-002',
    employeeName: 'Lê Thị Cẩm',
    departmentName: 'Phòng Kinh doanh',
    position: 'Sales Executive',
    violationType: 'Vi phạm quy trình nghiệp vụ',
    violationDescription: 'Không tuân thủ quy trình báo giá, tự ý giảm giá vượt thẩm quyền dẫn đến công ty bị thiệt hại khoảng 50 triệu đồng',
    violationDate: '2024-11-25',
    violationLocation: 'Chi nhánh Hà Nội',
    severity: 'SERIOUS',
    createdBy: 'MGR-002',
    createdByName: 'Phạm Văn D',
    createdDate: '2024-11-28',
    sentDate: '2024-11-28',
    explanationDeadline: '2024-12-08',
    decisionNumber: 'QĐ-KL-2024-001',
    decisionDate: '2024-12-15',
    disciplineAction: 'SALARY_CUT',
    decisionReason: 'Vi phạm nghiêm trọng quy trình nghiệp vụ gây thiệt hại cho công ty. Quyết định cắt giảm 30% lương tháng 12/2024.',
    decisionBy: 'ADMIN-001',
    decisionByName: 'Nguyễn Văn E',
    status: 'COMPLETED',
  },
  {
    id: 'DIS-003',
    employeeId: 'EMP-003',
    employeeName: 'Hoàng Minh F',
    departmentName: 'Phòng Kế toán',
    position: 'Accountant',
    violationType: 'Vi phạm quy định bảo mật',
    violationDescription: 'Để lộ thông tin tài chính của công ty cho bên ngoài',
    violationDate: '2024-12-10',
    violationLocation: 'Văn phòng chính',
    severity: 'SERIOUS',
    createdBy: 'MGR-003',
    createdByName: 'Vũ Thị G',
    createdDate: '2024-12-11',
    sentDate: '2024-12-11',
    explanationDeadline: '2024-12-21',
    status: 'PENDING_EXPLANATION',
  },
  {
    id: 'DIS-004',
    employeeId: 'EMP-004',
    employeeName: 'Đỗ Văn H',
    departmentName: 'Phòng Hành chính',
    position: 'Admin Staff',
    violationType: 'Thái độ làm việc không đúng',
    violationDescription: 'Có thái độ cãi lại cấp trên, gây mất đoàn kết trong phòng ban',
    violationDate: '2024-11-20',
    violationLocation: 'Phòng họp A',
    severity: 'MEDIUM',
    createdBy: 'MGR-001',
    createdByName: 'Trần Thị B',
    createdDate: '2024-11-21',
    sentDate: '2024-11-22',
    explanationDeadline: '2024-12-02',
    explanationText: 'Em xin giải trình về sự việc: Em không có ý cãi lại cấp trên, chỉ là em muốn trình bày quan điểm của mình. Em sẽ cẩn thận hơn trong cách giao tiếp.',
    explanationFiles: [],
    explanationDate: '2024-11-25',
    decisionNumber: 'QĐ-KL-2024-002',
    decisionDate: '2024-12-10',
    disciplineAction: 'WARNING',
    decisionReason: 'Sau khi xem xét giải trình, quyết định khiển trách và nhắc nhở về thái độ làm việc.',
    decisionBy: 'ADMIN-001',
    decisionByName: 'Nguyễn Văn E',
    status: 'COMPLETED',
  },
  {
    id: 'DIS-005',
    employeeId: 'EMP-005',
    employeeName: 'Bùi Thị K',
    departmentName: 'Phòng Marketing',
    position: 'Marketing Specialist',
    violationType: 'Vi phạm giờ giấc',
    violationDescription: 'Nghỉ làm 3 ngày không phép',
    violationDate: '2024-11-18',
    violationLocation: 'Văn phòng chính',
    severity: 'MEDIUM',
    createdBy: 'MGR-004',
    createdByName: 'Lý Văn L',
    createdDate: '2024-11-21',
    sentDate: '2024-11-22',
    explanationDeadline: '2024-12-02',
    status: 'OVERDUE',
  },
  {
    id: 'DIS-006',
    employeeId: 'EMP-006',
    employeeName: 'Trịnh Văn M',
    departmentName: 'Phòng IT',
    position: 'Senior Developer',
    violationType: 'Sử dụng tài sản công ty sai mục đích',
    violationDescription: 'Sử dụng máy tính công ty để làm việc riêng, cài đặt phần mềm không được phép',
    violationDate: '2024-12-15',
    violationLocation: 'Văn phòng chính',
    severity: 'LIGHT',
    createdBy: 'MGR-001',
    createdByName: 'Trần Thị B',
    createdDate: '2024-12-16',
    status: 'DRAFT',
  },
  {
    id: 'DIS-007',
    employeeId: 'EMP-007',
    employeeName: 'Phan Thị N',
    departmentName: 'Phòng Nhân sự',
    position: 'HR Specialist',
    violationType: 'Vi phạm quy định bảo mật',
    violationDescription: 'Tiết lộ thông tin lương của đồng nghiệp',
    violationDate: '2024-11-10',
    violationLocation: 'Văn phòng chính',
    severity: 'MEDIUM',
    createdBy: 'MGR-005',
    createdByName: 'Đặng Văn O',
    createdDate: '2024-11-12',
    sentDate: '2024-11-13',
    explanationDeadline: '2024-11-23',
    explanationText: 'Em xin giải trình: Em không cố ý tiết lộ thông tin. Đó là do nhầm lẫn khi trao đổi về chính sách lương với đồng nghiệp khác phòng ban. Em xin lỗi vì sơ suất này.',
    explanationFiles: ['don-xin-loi.pdf'],
    explanationDate: '2024-11-16',
    decisionNumber: 'QĐ-KL-2024-003',
    decisionDate: '2024-12-05',
    disciplineAction: 'DISMISSED',
    decisionReason: 'Sau khi xem xét, Ban giám đốc nhận thấy đây là sơ suất không cố ý. Quyết định không xử lý kỷ luật nhưng yêu cầu nhân viên cam kết không tái phạm.',
    decisionBy: 'ADMIN-001',
    decisionByName: 'Nguyễn Văn E',
    status: 'DISMISSED',
  },
];

export function calculateDisciplineStatistics(disciplines: Discipline[]) {
  return {
    total: disciplines.length,
    draft: disciplines.filter(d => d.status === 'DRAFT').length,
    pendingExplanation: disciplines.filter(d => d.status === 'PENDING_EXPLANATION').length,
    pendingReview: disciplines.filter(d => d.status === 'PENDING_REVIEW').length,
    overdue: disciplines.filter(d => d.status === 'OVERDUE').length,
    completed: disciplines.filter(d => d.status === 'COMPLETED').length,
    dismissed: disciplines.filter(d => d.status === 'DISMISSED').length,
  };
}