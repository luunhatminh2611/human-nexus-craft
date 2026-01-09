// mock/discipline.ts

export type DisciplineStatus = 
  | 'DRAFT'                    // Bản nháp
  | 'ACTIVE'                   // Đang hiệu lực
  | 'EXPIRED';                 // Đã hết hiệu lực

export type ViolationSeverity = 'LIGHT' | 'MEDIUM' | 'SERIOUS';

export type DisciplineAction = 
  | 'WARNING'          // Khiển trách
  | 'REPRIMAND'        // Cảnh cáo
  | 'SALARY_CUT'       // Cắt giảm lương
  | 'DEMOTION'         // Giáng chức
  | 'TERMINATION';     // Sa thải

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
  
  // Quyết định kỷ luật
  decisionNumber?: string;
  decisionDate?: string;
  disciplineAction?: DisciplineAction;
  decisionReason?: string;
  effectiveDate?: string;          // Ngày có hiệu lực
  expiryDate?: string;             // Ngày hết hiệu lực (nếu có)
  
  // File đính kèm
  attachmentFiles?: string[];      // Danh sách file đính kèm
  
  // Người tạo (Admin)
  createdBy: string;
  createdByName: string;
  createdDate: string;
  
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
  ACTIVE: 'Đang hiệu lực',
  EXPIRED: 'Đã hết hạn',
};

export const actionLabels: Record<DisciplineAction, string> = {
  WARNING: 'Khiển trách',
  REPRIMAND: 'Cảnh cáo',
  SALARY_CUT: 'Cắt giảm lương',
  DEMOTION: 'Giáng chức',
  TERMINATION: 'Sa thải',
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
    decisionNumber: 'QĐ-KL-2024-001',
    decisionDate: '2024-12-05',
    disciplineAction: 'WARNING',
    decisionReason: 'Vi phạm quy định về giờ giấc làm việc. Nhắc nhở và yêu cầu chấp hành nghiêm túc quy định công ty.',
    effectiveDate: '2024-12-05',
    attachmentFiles: ['bien-ban-vi-pham.pdf', 'bang-cham-cong.xlsx'],
    createdBy: 'ADMIN-001',
    createdByName: 'Nguyễn Văn E',
    createdDate: '2024-12-05',
    status: 'ACTIVE',
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
    decisionNumber: 'QĐ-KL-2024-002',
    decisionDate: '2024-12-01',
    disciplineAction: 'SALARY_CUT',
    decisionReason: 'Vi phạm nghiêm trọng quy trình nghiệp vụ gây thiệt hại cho công ty. Quyết định cắt giảm 30% lương tháng 12/2024 và tháng 01/2025.',
    effectiveDate: '2024-12-01',
    expiryDate: '2025-01-31',
    attachmentFiles: ['bien-ban-vi-pham.pdf', 'bao-cao-thiet-hai.pdf', 'hop-dong-khach-hang.pdf'],
    createdBy: 'ADMIN-001',
    createdByName: 'Nguyễn Văn E',
    createdDate: '2024-12-01',
    status: 'ACTIVE',
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
    decisionNumber: 'QĐ-KL-2024-003',
    decisionDate: '2024-12-15',
    disciplineAction: 'REPRIMAND',
    decisionReason: 'Vi phạm nghiêm trọng quy định bảo mật thông tin công ty. Cảnh cáo và ghi nhận vào hồ sơ cá nhân. Nếu tái phạm sẽ xem xét sa thải.',
    effectiveDate: '2024-12-15',
    attachmentFiles: ['bien-ban-vi-pham.pdf', 'email-chung-cu.pdf'],
    createdBy: 'ADMIN-001',
    createdByName: 'Nguyễn Văn E',
    createdDate: '2024-12-15',
    status: 'ACTIVE',
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
    decisionNumber: 'QĐ-KL-2024-004',
    decisionDate: '2024-11-25',
    disciplineAction: 'WARNING',
    decisionReason: 'Thái độ làm việc chưa phù hợp, cần điều chỉnh cách giao tiếp với cấp trên và đồng nghiệp.',
    effectiveDate: '2024-11-25',
    attachmentFiles: ['bien-ban-vi-pham.pdf'],
    createdBy: 'ADMIN-001',
    createdByName: 'Nguyễn Văn E',
    createdDate: '2024-11-25',
    status: 'EXPIRED',
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
    decisionNumber: 'QĐ-KL-2024-005',
    decisionDate: '2024-11-22',
    disciplineAction: 'REPRIMAND',
    decisionReason: 'Nghỉ làm không phép ảnh hưởng đến công việc chung. Cảnh cáo và trừ 3 ngày phép năm.',
    effectiveDate: '2024-11-22',
    attachmentFiles: ['bien-ban-vi-pham.pdf', 'bang-cham-cong.xlsx'],
    createdBy: 'ADMIN-001',
    createdByName: 'Nguyễn Văn E',
    createdDate: '2024-11-22',
    status: 'ACTIVE',
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
    createdBy: 'ADMIN-001',
    createdByName: 'Nguyễn Văn E',
    createdDate: '2024-12-16',
    status: 'EXPIRED',
    notes: 'Đang soạn thảo quyết định',
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
    createdBy: 'ADMIN-001',
    createdByName: 'Nguyễn Văn E',
    createdDate: '2024-12-18',
    status: 'EXPIRED',
  },
];

export function calculateDisciplineStatistics(disciplines: Discipline[]) {
  return {
    total: disciplines.length,
    draft: disciplines.filter(d => d.status === 'DRAFT').length,
    active: disciplines.filter(d => d.status === 'ACTIVE').length,
    expired: disciplines.filter(d => d.status === 'EXPIRED').length,
  };
}