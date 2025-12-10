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
  Rotate3d
} from 'lucide-react';
import type { NavigationItem } from './types';

export const getNavigationItems = (role: string): NavigationItem[] => {
  if (role === 'EMPLOYEE') {
    return [
      { label: 'Hồ sơ', icon: User, path: '/employee/profile' },
      // { label: 'Lương & Phúc lợi', icon: DollarSign, path: '/employee/payroll' },
      { label: 'Đào tạo', icon: BookOpen, path: '/employee/learning' },
      // { label: 'Đánh giá', icon: FileText, path: '/employee/performance' },
      { label: 'BHLĐ được cấp', icon: BoxIcon, path: '/employee/safety' },
      // { label: 'Lộ trình thăng tiến', icon: TrendingUp, path: '/employee/career-path' },
      { label: 'Lịch điều động', icon: Rotate3d, path: '/employee/transfer' },
      { label: 'Lịch công tác', icon: BriefcaseBusiness, path: '/employee/work-schedule' },
      { label: 'Đơn xin nghỉ phép', icon: Mailbox, path: '/user/leave-requests' },
    ];
  } else if (role === 'MANAGER') {
    return [
      { label: 'Hồ sơ', icon: Users, path: '/employee/profile' },
      { label: 'Đào tạo', icon: BookOpen, path: '/manager/learning' },
      { label: 'Quản lý điều động', icon: Rotate3d, path: '/manager/transfer' },
      { label: 'Phân phát BHLĐ', icon: BoxIcon, path: '/manager/safety-items' },
      // { label: 'Lộ trình thăng tiến', icon: TrendingUp, path: '/employee/career-path' },
      { label: 'Lịch công tác', icon: BriefcaseBusiness, path: '/manager/work-schedule' },
      { label: 'Đơn xin nghỉ phép', icon: Mailbox, path: '/manager/leave-requests' },
    ];
  }
  return [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { label: 'Nhân viên', icon: Users, path: '/admin/employees' },
    { label: 'Sơ đồ tổ chức', icon: Network, path: '/admin/org-chart' },
    { label: 'Duyệt Đào tạo', icon: BookOpen, path: '/admin/training' },
    { label: 'Quản lý KPI', icon: FileBarChart, path: '/admin/kpi' },
    { label: 'Quản lý điều động', icon: Rotate3d, path: '/admin/transfer' },
    { label: 'Lương', icon: DollarSign, path: '/admin/salary' },
    { label: 'Quản lý BHLĐ', icon: BoxIcon, path: '/admin/safety-dashboard' },
    { label: 'Danh mục hệ thống', icon: Briefcase, path: '/admin/catalog' },
    { label: 'HSYT cần duyệt', icon: HeartPulse, path: '/admin/medical-records' },
    { label: 'Lịch công tác', icon: BriefcaseBusiness, path: '/admin/work-schedule' },
    { label: 'Đơn xin nghỉ phép', icon: Mailbox, path: '/admin/leave-requests' },
    { label: 'Báo cáo', icon: FileBarChart, path: '/admin/reports' },
  ];
};
