/* =======================
 * ENUM / TYPES
 * ======================= */

export type ExtensionDecisionType = 'EXTEND' | 'RENEW';
export type TerminateDecisionType = 'STOP' | 'HOLD';


export interface FileAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
}

/* =======================
 * EXTENSION / RENEW DECISION
 * ======================= */

export interface ExtensionDecision {
  id: string;

  employeeId: string;
  employeeName: string;
  department: string;
  position: string;

  decisionType: ExtensionDecisionType; // Gia hạn | Tái ký

  decisionNumber: string;
  decisionDate: string;
  effectiveDate: string;

  previousExpiryDate: string; // Ngày hết hạn cũ
  termMonths: number;
  newExpiryDate: string;

  salary: number; // Mức lương

  reason: string;
  note?: string;

  attachments?: FileAttachment[];

  createdBy: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export const extensionDecisionTypeLabels: Record<ExtensionDecisionType, string> =
{
  EXTEND: 'Gia hạn',
  RENEW: 'Tái ký',
};
export const terminationReasonLabels: Record<TerminateDecisionType, string> =
{
  STOP: 'Chấm dứt',
  HOLD: 'Tạm hoãn',
};
/* =======================
 * TERMINATION DECISION
 * ======================= */

export interface TerminationDecision {
  id: string;

  employeeId: string;
  employeeName: string;
  department: string;
  position: string;

  reason: string;

  decisionNumber: string;
  decisionDate: string;
  effectiveDate: string;

  note?: string;
  attachments?: FileAttachment[];

  createdBy: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

/* =======================
 * MOCK DATA – EXTENSION / RENEW
 * ======================= */

export const mockExtensionDecisions: ExtensionDecision[] = [
  {
    id: 'EXT-001',
    employeeId: 'EMP001',
    employeeName: 'Nguyễn Văn An',
    department: 'Phòng Kỹ thuật',
    position: 'Trưởng phòng Kỹ thuật',
    decisionType: 'EXTEND',
    decisionNumber: 'QD-GH/2025/001',
    decisionDate: '2025-01-05',
    effectiveDate: '2025-02-01',
    previousExpiryDate: '2025-01-31',
    termMonths: 12,
    newExpiryDate: '2026-01-31',
    salary: 25000000,
    reason:
      'Hoàn thành tốt nhiệm vụ được giao, tiếp tục giữ vai trò quản lý phòng kỹ thuật.',
    attachments: [
      {
        id: 'FILE-EXT-001',
        name: 'Quyet_dinh_gia_han_001.pdf',
        url: '#',
        size: 214000,
        type: 'application/pdf',
        uploadedAt: '2025-01-05T09:30:00Z',
      },
      {
        id: 'FILE-EXT-001-B',
        name: 'Hop_dong_cu_001.pdf',
        url: '#',
        size: 189000,
        type: 'application/pdf',
        uploadedAt: '2025-01-05T09:31:00Z',
      },
    ],
    createdBy: 'Nguyễn Văn Giám đốc',
    createdById: 'ADMIN001',
    createdAt: '2025-01-05T09:00:00Z',
    updatedAt: '2025-01-05T09:00:00Z',
  },
  {
    id: 'EXT-002',
    employeeId: 'EMP003',
    employeeName: 'Lê Văn Cường',
    department: 'Phòng Nhân sự',
    position: 'Trưởng phòng Nhân sự',
    decisionType: 'RENEW',
    decisionNumber: 'QD-TK/2025/002',
    decisionDate: '2025-02-15',
    effectiveDate: '2025-03-01',
    previousExpiryDate: '2025-02-28',
    termMonths: 36,
    newExpiryDate: '2028-02-28',
    salary: 28000000,
    reason:
      'Kết thúc nhiệm kỳ cũ, tái ký quyết định để tiếp tục đảm nhiệm công tác quản lý nhân sự.',
    note: 'Nhiệm kỳ mới theo quy định hiện hành',
    attachments: [
      {
        id: 'FILE-EXT-002',
        name: 'Quyet_dinh_tai_ky_002.pdf',
        url: '#',
        size: 298000,
        type: 'application/pdf',
        uploadedAt: '2025-02-15T10:15:00Z',
      },
      {
        id: 'FILE-EXT-002-B',
        name: 'Bien_ban_danh_gia_002.pdf',
        url: '#',
        size: 156000,
        type: 'application/pdf',
        uploadedAt: '2025-02-15T10:16:00Z',
      },
      {
        id: 'FILE-EXT-002-C',
        name: 'Hop_dong_moi_002.pdf',
        url: '#',
        size: 245000,
        type: 'application/pdf',
        uploadedAt: '2025-02-15T10:17:00Z',
      },
    ],
    createdBy: 'Nguyễn Văn Giám đốc',
    createdById: 'ADMIN001',
    createdAt: '2025-02-15T10:00:00Z',
    updatedAt: '2025-02-15T10:00:00Z',
  },
  {
    id: 'EXT-003',
    employeeId: 'EMP005',
    employeeName: 'Trần Thị Mai',
    department: 'Phòng Tài chính',
    position: 'Kế toán trưởng',
    decisionType: 'EXTEND',
    decisionNumber: 'QD-GH/2025/003',
    decisionDate: '2025-03-10',
    effectiveDate: '2025-04-01',
    previousExpiryDate: '2025-03-31',
    termMonths: 24,
    newExpiryDate: '2027-03-31',
    salary: 22000000,
    reason:
      'Đã có nhiều đóng góp tích cực cho bộ phận tài chính, tiếp tục gia hạn để duy trì hoạt động.',
    note: 'Xem xét tăng lương sau 12 tháng',
    attachments: [
      {
        id: 'FILE-EXT-003',
        name: 'Quyet_dinh_gia_han_003.pdf',
        url: '#',
        size: 203000,
        type: 'application/pdf',
        uploadedAt: '2025-03-10T08:20:00Z',
      },
    ],
    createdBy: 'Nguyễn Văn Giám đốc',
    createdById: 'ADMIN001',
    createdAt: '2025-03-10T08:00:00Z',
    updatedAt: '2025-03-10T08:00:00Z',
  },
];

/* =======================
 * MOCK DATA – TERMINATION
 * ======================= */

export const mockTerminationDecisions: TerminationDecision[] = [
  {
    id: 'TER-001',
    employeeId: 'EMP008',
    employeeName: 'Bùi Thị Hà',
    department: 'Phòng Pháp chế',
    position: 'Trưởng phòng Pháp chế',
    reason:
      'Hết thời hạn đảm nhiệm chức vụ, không tiếp tục bố trí vị trí quản lý.',
    decisionNumber: 'QD-CD/2024/001',
    decisionDate: '2024-03-15',
    effectiveDate: '2024-04-01',
    note: 'Bố trí công tác khác theo năng lực chuyên môn',
    attachments: [
      {
        id: 'FILE-TER-001',
        name: 'Quyet_dinh_cham_dut_001.pdf',
        url: '#',
        size: 234000,
        type: 'application/pdf',
        uploadedAt: '2024-03-15T11:20:00Z',
      },
      {
        id: 'FILE-TER-001-B',
        name: 'Bien_ban_ban_giao_001.pdf',
        url: '#',
        size: 178000,
        type: 'application/pdf',
        uploadedAt: '2024-03-15T11:21:00Z',
      },
    ],
    createdBy: 'Nguyễn Văn Giám đốc',
    createdById: 'ADMIN001',
    createdAt: '2024-03-15T11:00:00Z',
    updatedAt: '2024-03-15T11:00:00Z',
  },
  {
    id: 'TER-002',
    employeeId: 'EMP010',
    employeeName: 'Lý Thị Kim',
    department: 'Phòng Đào tạo',
    position: 'Trưởng phòng Đào tạo',
    reason:
      'Vi phạm quy định nội bộ và không hoàn thành trách nhiệm quản lý được giao.',
    decisionNumber: 'QD-CD/2024/002',
    decisionDate: '2024-08-10',
    effectiveDate: '2024-08-20',
    note: 'Áp dụng hình thức xử lý theo quy định công ty',
    attachments: [
      {
        id: 'FILE-TER-002',
        name: 'Quyet_dinh_cham_dut_002.pdf',
        url: '#',
        size: 312000,
        type: 'application/pdf',
        uploadedAt: '2024-08-10T14:30:00Z',
      },
      {
        id: 'FILE-TER-002-B',
        name: 'Bien_ban_vi_pham_002.pdf',
        url: '#',
        size: 198000,
        type: 'application/pdf',
        uploadedAt: '2024-08-10T14:31:00Z',
      },
      {
        id: 'FILE-TER-002-C',
        name: 'Quyet_dinh_ky_luat_002.pdf',
        url: '#',
        size: 167000,
        type: 'application/pdf',
        uploadedAt: '2024-08-10T14:32:00Z',
      },
    ],
    createdBy: 'Nguyễn Văn Giám đốc',
    createdById: 'ADMIN001',
    createdAt: '2024-08-10T14:00:00Z',
    updatedAt: '2024-08-10T14:00:00Z',
  },
  {
    id: 'TER-003',
    employeeId: 'EMP012',
    employeeName: 'Phạm Văn Đức',
    department: 'Phòng Marketing',
    position: 'Trưởng phòng Marketing',
    reason:
      'Nghỉ hưu theo quy định pháp luật, đã đủ tuổi nghỉ hưu.',
    decisionNumber: 'QD-CD/2024/003',
    decisionDate: '2024-11-20',
    effectiveDate: '2024-12-01',
    note: 'Tổ chức lễ tiễn đưa vào ngày 30/11/2024',
    attachments: [
      {
        id: 'FILE-TER-003',
        name: 'Quyet_dinh_nghi_huu_003.pdf',
        url: '#',
        size: 267000,
        type: 'application/pdf',
        uploadedAt: '2024-11-20T09:15:00Z',
      },
      {
        id: 'FILE-TER-003-B',
        name: 'So_BHXH_003.pdf',
        url: '#',
        size: 145000,
        type: 'application/pdf',
        uploadedAt: '2024-11-20T09:16:00Z',
      },
    ],
    createdBy: 'Nguyễn Văn Giám đốc',
    createdById: 'ADMIN001',
    createdAt: '2024-11-20T09:00:00Z',
    updatedAt: '2024-11-20T09:00:00Z',
  },
];

/* =======================
 * OPTIONAL – STATISTICS HELPERS
 * ======================= */

export const countExtensionByType = (
  data: ExtensionDecision[],
): Record<ExtensionDecisionType, number> => ({
  EXTEND: data.filter(d => d.decisionType === 'EXTEND').length,
  RENEW: data.filter(d => d.decisionType === 'RENEW').length,
});

export const countTerminationByYear = (
  data: TerminationDecision[],
  year: number,
) =>
  data.filter(
    d => new Date(d.effectiveDate).getFullYear() === year,
  ).length;