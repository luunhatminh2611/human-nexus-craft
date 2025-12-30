// mock/employeeHistory.ts

export interface EmployeeHistoryRecord {
  id: string;
  type: 'APPOINTMENT' | 'TERMINATION'; // Bổ nhiệm hoặc Miễn nhiệm
  employeeId: string;
  employeeName: string;
  position: string;
  department: string;
  decisionNumber: string;
  decisionDate: string;
  effectiveDate: string;
  endDate?: string; // Ngày kết thúc (cho bổ nhiệm), null nếu vẫn đang giữ
  reason: string;
  note?: string;
  relatedAppointmentId?: string; // ID của quyết định bổ nhiệm (dùng cho miễn nhiệm)
  salary?: number;
  allowance?: number;
  createdBy: string;
  createdAt: string;
}

export interface EmployeeCareerTimeline {
  employeeId: string;
  employeeName: string;
  currentPosition?: string;
  currentDepartment?: string;
  history: EmployeeHistoryRecord[];
}

// Mock data - Lịch sử của nhân viên Nguyễn Văn An
export const mockEmployeeHistory: EmployeeCareerTimeline[] = [
  {
    employeeId: 'EMP001',
    employeeName: 'Nguyễn Văn An',
    currentPosition: 'Trưởng phòng Kỹ thuật',
    currentDepartment: 'Phòng Kỹ thuật',
    history: [
      {
        id: 'HIST001',
        type: 'APPOINTMENT',
        employeeId: 'EMP001',
        employeeName: 'Nguyễn Văn An',
        position: 'Developer',
        department: 'Phòng Kỹ thuật',
        decisionNumber: 'QD-BN/2016/045',
        decisionDate: '2016-06-15',
        effectiveDate: '2016-07-01',
        endDate: '2018-12-31',
        reason: 'Tuyển dụng mới vào vị trí Developer',
        salary: 12000000,
        createdBy: 'Nguyễn Văn Giám đốc',
        createdAt: '2016-06-15T08:00:00Z',
      },
      {
        id: 'HIST002',
        type: 'APPOINTMENT',
        employeeId: 'EMP001',
        employeeName: 'Nguyễn Văn An',
        position: 'Senior Developer',
        department: 'Phòng Kỹ thuật',
        decisionNumber: 'QD-BN/2019/012',
        decisionDate: '2018-12-10',
        effectiveDate: '2019-01-01',
        endDate: '2024-12-31',
        reason: 'Thăng tiến do có năng lực và kinh nghiệm tốt',
        salary: 20000000,
        allowance: 3000000,
        createdBy: 'Nguyễn Văn Giám đốc',
        createdAt: '2018-12-10T09:00:00Z',
      },
      {
        id: 'HIST003',
        type: 'APPOINTMENT',
        employeeId: 'EMP001',
        employeeName: 'Nguyễn Văn An',
        position: 'Trưởng phòng Kỹ thuật',
        department: 'Phòng Kỹ thuật',
        decisionNumber: 'QD-BN/2024/001',
        decisionDate: '2024-12-15',
        effectiveDate: '2025-01-01',
        endDate: null, // Đang giữ chức
        reason: 'Bổ nhiệm làm Trưởng phòng Kỹ thuật do có năng lực quản lý xuất sắc',
        salary: 50000000,
        allowance: 10000000,
        createdBy: 'Nguyễn Văn Giám đốc',
        createdAt: '2024-12-15T08:00:00Z',
      },
    ],
  },
  {
    employeeId: 'EMP003',
    employeeName: 'Lê Văn Cường',
    currentPosition: 'Trưởng phòng Nhân sự',
    currentDepartment: 'Phòng Nhân sự',
    history: [
      {
        id: 'HIST004',
        type: 'APPOINTMENT',
        employeeId: 'EMP003',
        employeeName: 'Lê Văn Cường',
        position: 'Chuyên viên Nhân sự',
        department: 'Phòng Nhân sự',
        decisionNumber: 'QD-BN/2015/023',
        decisionDate: '2015-03-10',
        effectiveDate: '2015-04-01',
        endDate: '2019-05-31',
        reason: 'Tuyển dụng mới',
        salary: 10000000,
        createdBy: 'Nguyễn Văn Giám đốc',
        createdAt: '2015-03-10T08:00:00Z',
      },
      {
        id: 'HIST005',
        type: 'APPOINTMENT',
        employeeId: 'EMP003',
        employeeName: 'Lê Văn Cường',
        position: 'Phó phòng Nhân sự',
        department: 'Phòng Nhân sự',
        decisionNumber: 'QD-BN/2019/008',
        decisionDate: '2019-05-15',
        effectiveDate: '2019-06-01',
        endDate: '2021-10-31',
        reason: 'Bổ nhiệm Phó phòng do có năng lực tốt',
        salary: 25000000,
        allowance: 5000000,
        createdBy: 'Nguyễn Văn Giám đốc',
        createdAt: '2019-05-15T09:00:00Z',
      },
      {
        id: 'HIST006',
        type: 'APPOINTMENT',
        employeeId: 'EMP003',
        employeeName: 'Lê Văn Cường',
        position: 'Trưởng phòng Nhân sự',
        department: 'Phòng Nhân sự',
        decisionNumber: 'QD-BN/2021/015',
        decisionDate: '2021-10-10',
        effectiveDate: '2021-11-01',
        endDate: '2024-10-31',
        reason: 'Bổ nhiệm Trưởng phòng (lần 1)',
        salary: 40000000,
        allowance: 10000000,
        createdBy: 'Nguyễn Văn Giám đốc',
        createdAt: '2021-10-10T10:00:00Z',
      },
      {
        id: 'HIST007',
        type: 'APPOINTMENT',
        employeeId: 'EMP003',
        employeeName: 'Lê Văn Cường',
        position: 'Trưởng phòng Nhân sự',
        department: 'Phòng Nhân sự',
        decisionNumber: 'QD-BN/2024/003',
        decisionDate: '2024-10-15',
        effectiveDate: '2024-11-01',
        endDate: null,
        reason: 'Bổ nhiệm lại (lần 2) do hoàn thành xuất sắc nhiệm vụ',
        salary: 52000000,
        allowance: 12000000,
        createdBy: 'Nguyễn Văn Giám đốc',
        createdAt: '2024-10-15T10:00:00Z',
      },
    ],
  },
  {
    employeeId: 'EMP009',
    employeeName: 'Ngô Văn Inh',
    currentPosition: null, // Đã bị miễn nhiệm
    currentDepartment: null,
    history: [
      {
        id: 'HIST008',
        type: 'APPOINTMENT',
        employeeId: 'EMP009',
        employeeName: 'Ngô Văn Inh',
        position: 'Trưởng phòng Sản xuất',
        department: 'Phòng Sản xuất',
        decisionNumber: 'QD-BN/2018/004',
        decisionDate: '2017-12-15',
        effectiveDate: '2018-01-01',
        endDate: '2021-06-30',
        reason: 'Bổ nhiệm Trưởng phòng Sản xuất (lần 1)',
        salary: 35000000,
        allowance: 8000000,
        createdBy: 'Nguyễn Văn Giám đốc',
        createdAt: '2017-12-15T09:00:00Z',
      },
      {
        id: 'HIST009',
        type: 'APPOINTMENT',
        employeeId: 'EMP009',
        employeeName: 'Ngô Văn Inh',
        position: 'Giám đốc Sản xuất',
        department: 'Phòng Sản xuất',
        decisionNumber: 'QD-BN/2021/006',
        decisionDate: '2021-06-15',
        effectiveDate: '2021-07-01',
        endDate: '2024-06-30',
        reason: 'Thăng chức lên Giám đốc Sản xuất',
        salary: 55000000,
        allowance: 15000000,
        createdBy: 'Nguyễn Văn Giám đốc',
        createdAt: '2021-06-15T09:00:00Z',
      },
      {
        id: 'HIST010',
        type: 'TERMINATION',
        employeeId: 'EMP009',
        employeeName: 'Ngô Văn Inh',
        position: 'Giám đốc Sản xuất',
        department: 'Phòng Sản xuất',
        decisionNumber: 'QD-MN/2024/002',
        decisionDate: '2024-07-10',
        effectiveDate: '2024-07-15',
        reason: 'Miễn nhiệm do hết nhiệm kỳ và không gia hạn',
        note: 'Đã hoàn thành nhiệm kỳ 3 năm. Anh Inh chuyển sang vị trí cố vấn.',
        relatedAppointmentId: 'APT009',
        createdBy: 'Nguyễn Văn Giám đốc',
        createdAt: '2024-07-10T10:00:00Z',
      },
    ],
  },
  {
    employeeId: 'EMP010',
    employeeName: 'Lý Thị Kim',
    currentPosition: null, // Đã bị miễn nhiệm
    currentDepartment: null,
    history: [
      {
        id: 'HIST011',
        type: 'APPOINTMENT',
        employeeId: 'EMP010',
        employeeName: 'Lý Thị Kim',
        position: 'Chuyên viên Đào tạo',
        department: 'Phòng Đào tạo',
        decisionNumber: 'QD-BN/2020/018',
        decisionDate: '2020-03-10',
        effectiveDate: '2020-04-01',
        endDate: '2024-05-31',
        reason: 'Tuyển dụng vào vị trí Chuyên viên Đào tạo',
        salary: 15000000,
        createdBy: 'Nguyễn Văn Giám đốc',
        createdAt: '2020-03-10T08:00:00Z',
      },
      {
        id: 'HIST012',
        type: 'APPOINTMENT',
        employeeId: 'EMP010',
        employeeName: 'Lý Thị Kim',
        position: 'Trưởng phòng Đào tạo',
        department: 'Phòng Đào tạo',
        decisionNumber: 'QD-BN/2024/008',
        decisionDate: '2024-06-01',
        effectiveDate: '2024-06-15',
        endDate: '2024-08-15',
        reason: 'Bổ nhiệm Trưởng phòng Đào tạo',
        salary: 40000000,
        allowance: 8000000,
        createdBy: 'Nguyễn Văn Giám đốc',
        createdAt: '2024-06-01T08:00:00Z',
      },
      {
        id: 'HIST013',
        type: 'TERMINATION',
        employeeId: 'EMP010',
        employeeName: 'Lý Thị Kim',
        position: 'Trưởng phòng Đào tạo',
        department: 'Phòng Đào tạo',
        decisionNumber: 'QD-MN/2024/003',
        decisionDate: '2024-08-15',
        effectiveDate: '2024-08-15',
        reason: 'Miễn nhiệm do vi phạm kỷ luật',
        note: 'Vi phạm quy định về đạo đức nghề nghiệp và sử dụng kinh phí đào tạo không đúng mục đích.',
        relatedAppointmentId: 'APT010',
        createdBy: 'Nguyễn Văn Giám đốc',
        createdAt: '2024-08-15T10:00:00Z',
      },
    ],
  },
];