export interface Employee {
  id: number;
  name: string;
  role: string;
  department: string;
}

export type PPEType = 'monthly' | 'yearly' | 'job-based' | 'on-demand';

export type PPEStatus =
  | 'Draft'
  | 'Pending_Manager'
  | 'Pending_Admin'
  | 'Approved'
  | 'Rejected'
  | 'Ready_To_Issue'
  | 'Issued'
  | 'Completed'
  | 'Issue_Reported';

export interface PPEItem {
  id: number;
  name: string;
  type: PPEType;
  quantity: number;
  applicableRoles: string[];
  status: PPEStatus;
}

export interface IssueRecord {
  id: number;
  ppeItemId: number;
  ppeName: string;
  employeeId: number;
  employeeName: string;
  quantity: number;
  actualQuantity: number;
  month: string; // YYYY-MM
  status: PPEStatus;
  createdAt: string;
  issuedAt?: string;
  confirmedAt?: string;
  note?: string;
}

export interface ReplacementRequest {
  id: number;
  employeeId: number;
  employeeName: string;
  ppeItemId: number;
  ppeName: string;
  reason: 'Hỏng' | 'Mất' | 'Khác';
  reasonDetail?: string;
  status: PPEStatus;
  createdAt: string;
}

export const employees: Employee[] = [
  { id: 1, name: 'Nguyễn Văn A', role: 'Công nhân hàn', department: 'Xưởng 1' },
  { id: 2, name: 'Trần Thị B', role: 'Kỹ sư', department: 'Phòng kỹ thuật' },
  { id: 3, name: 'Lê Văn C', role: 'Công nhân hàn', department: 'Xưởng 2' },
  { id: 4, name: 'Phạm Thị D', role: 'Kỹ sư', department: 'Phòng kỹ thuật' },
  { id: 5, name: 'Hoàng Văn E', role: 'Công nhân cơ khí', department: 'Xưởng 1' },
  { id: 6, name: 'Ngô Thị F', role: 'Công nhân hàn', department: 'Xưởng 3' },
];

export const initialPPEItems: PPEItem[] = [
  { id: 1, name: 'Mũ bảo hộ', type: 'yearly', quantity: 2, applicableRoles: ['Công nhân hàn', 'Công nhân cơ khí'], status: 'Approved' },
  { id: 2, name: 'Găng tay chịu nhiệt', type: 'monthly', quantity: 4, applicableRoles: ['Công nhân hàn'], status: 'Approved' },
  { id: 3, name: 'Kính bảo hộ', type: 'yearly', quantity: 1, applicableRoles: ['Công nhân hàn', 'Kỹ sư', 'Công nhân cơ khí'], status: 'Draft' },
  { id: 4, name: 'Giày bảo hộ', type: 'yearly', quantity: 1, applicableRoles: ['Công nhân hàn', 'Công nhân cơ khí'], status: 'Approved' },
  { id: 5, name: 'Áo phản quang', type: 'yearly', quantity: 2, applicableRoles: ['Công nhân hàn', 'Công nhân cơ khí', 'Kỹ sư'], status: 'Pending_Admin' },
  { id: 6, name: 'Khẩu trang công nghiệp', type: 'monthly', quantity: 10, applicableRoles: ['Công nhân hàn', 'Công nhân cơ khí'], status: 'Approved' },
];

export const allRoles = ['Công nhân hàn', 'Kỹ sư', 'Công nhân cơ khí'];

export const statusColors: Record<PPEStatus, string> = {
  Draft: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  Pending_Manager: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  Pending_Admin: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  Approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  Rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  Ready_To_Issue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  Issued: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  Completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  Issue_Reported: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
};

export const statusLabels: Record<PPEStatus, string> = {
  Draft: 'Nháp',
  Pending_Manager: 'Chờ Manager duyệt',
  Pending_Admin: 'Chờ Admin duyệt',
  Approved: 'Đã duyệt',
  Rejected: 'Từ chối',
  Ready_To_Issue: 'Sẵn sàng cấp phát',
  Issued: 'Đã cấp',
  Completed: 'Hoàn thành',
  Issue_Reported: 'Báo sự cố',
};
