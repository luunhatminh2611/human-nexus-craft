import {
  LayoutDashboard,
  Users,
  BookOpen,
  DollarSign,
  User,
  Network,
  BoxIcon,
  Briefcase,
  TrendingUp,
  HeartPulse,
  BriefcaseBusiness,
  Mailbox,
  FileBarChart,
  Box,
  Rotate3d,
  History,
  FileText,
  BookOpenCheck,
  Sparkle,
  CircleDollarSign,
  School,
  NotebookTabs,
  Signature,
  Compass,
  HandHeart,
  FolderClosed,
  PartyPopper,
  ShieldAlert,
  RailSymbol,
  Split,
  ClockArrowUp,
  Send,
  FlagTriangleLeft,
  Bolt
} from 'lucide-react';
import type { NavigationItem } from './types';

export const getNavigationItems = (role: string): NavigationItem[] => {
  if (role === 'EMPLOYEE') {
    return [
      { label: 'Hồ sơ', path: '/employee/profile' },
      { label: 'Đào tạo', path: '/employee/learning' },
      { label: 'BHLĐ được cấp', path: '/employee/safety' },
      { label: 'Lịch điều động', path: '/employee/transfer' },
      { label: 'Lịch công tác', path: '/employee/work-schedule' },
      { label: 'Đơn xin nghỉ phép', path: '/user/leave-requests' },
    ];
  } else if (role === 'MANAGER') {
    return [
      { label: 'Hồ sơ', path: '/employee/profile' },
      { label: 'Đào tạo', path: '/manager/learning' },
      { label: 'Quản lý điều động', path: '/manager/transfer' },
      { label: 'Phân phát BHLĐ', path: '/admin/safety-dashboard' },
      { label: 'Lịch công tác', path: '/manager/work-schedule' },
      { label: 'Đơn xin nghỉ phép', path: '/manager/leave-requests' },
    ];
  }

  // ADMIN role với submenu cho Nhân viên
  return [
    { label: 'Dashboard', path: '/admin/dashboard' },
    {
      label: 'Nhân sự',
      path: '/admin/employees',
      submenu: [
        { label: 'Sơ đồ tổ chức', icon: Network, path: '/admin/org-chart' },
        { label: 'Nhân viên', icon: Users, path: '/admin/employees' },
        { label: 'Bằng cấp', icon: School, path: '/admin/degree' },
        { label: 'Quan hệ gia đình', icon: NotebookTabs, path: '/admin/family' },
        // { label: 'Hợp đồng', icon: Signature, path: '/admin/contract' },
        { label: 'Xuất cảnh nước ngoài', icon: Compass, path: '/admin/exit' },
        { label: 'Bảo hiểm xã hội', icon: HandHeart, path: '/admin/social-insurance' },
        { label: 'Hồ sơ', icon: FolderClosed, path: '/admin/file' },
        { label: 'Y tế', icon: HeartPulse, path: '/admin/employees/health' },
        // { label: 'KPI', icon: Sparkle, path: '/admin/employees/kpi' },
        // { label: 'Lương', icon: CircleDollarSign, path: '/admin/employees/salary' },
        // { label: 'Lịch sử công tác', icon: History, path: '/admin/employees/work-history' },
        // { label: 'Hợp đồng', icon: FileText, path: '/admin/employees/contract' },
        // { label: 'Nghỉ phép', icon: FileText, path: '/admin/employees/leave-requests' }
      ]
    },
    { 
      label: 'Quyết định', 
      path: '/admin/transfer' ,
      submenu: [
        { label: 'Khen thưởng', icon: PartyPopper, path: '/admin/reward' },
        { label: 'Kỷ luật', icon: ShieldAlert, path: '/admin/discipline' },
        { label: 'Bổ nhiệm', icon: RailSymbol, path: '/admin/appoint' },
        { label: 'Miễn nhiệm', icon: Split, path: '/admin/dismissed' },
        { label: 'Điều chỉnh lương', icon: CircleDollarSign, path: '/admin/manage-salary' },
        { label: 'Điều chuyển công tác', icon: Rotate3d, path: '/admin/transfer' },
        { label: 'Tạm hoãn/Chấm dứt hợp đồng', icon: Signature, path: '/admin/contract-dismiss' },
        { label: 'Tái ký/gia hạn hợp đồng', icon: Signature, path: '/admin/contract-resign' },
      ]
    },
    {
      label: 'Chấm công & Nghỉ phép',
      path: '/admin/work-schedule',
      submenu: [
        { label: 'Chấm công', icon: ClockArrowUp, path: '/admin/time-keeping' },
        { label: 'Nghỉ phép', icon: Mailbox, path: '/admin/leave-requests' },
        { label: 'Lịch công tác', icon: History, path: '/admin/work-schedule' },
      ]
    },
    { 
      label: 'Tuyển dụng & Đào tạo', 
      path: '/admin/training',
      submenu: [
        { label: 'Tuyển dụng', icon: Send, path: '/admin/recruitment' },
        { label: 'Đào tạo', icon: Mailbox, path: '/admin/training' },
      ]
    },

    { label: 'KPI', path: '/admin/kpi' },
    { label: 'Lương & Phúc lợi', path: '/admin/salary' },
    { label: 'Bảo hộ lao động', path: '/admin/safety-dashboard' },
    { label: 'Báo cáo', path: '/admin/reports' },
    { 
      label: 'Hệ thống', 
      path: '/admin/catalog',
      submenu: [
        { label: 'Danh mục', icon: Briefcase, path: '/admin/catalog' },
        { label: 'Phân quyền', icon: FlagTriangleLeft, path: '/admin/permission' },
        { label: 'Cấu hình', icon: Bolt, path: '/admin/config' },
      ]
    },
  ];
};