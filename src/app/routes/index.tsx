import { lazy } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import type { UserRole } from '@/features/auth';
import { ROUTES } from '@/shared/constants/routes';
import { Layout } from '@/shared/components/layouts';
import { useAuthStore } from '@/features/employees/hooks/useAuth';
import LeaveRequest from '@/features/leave-request/pages/employee/LeaveRequest';
import LeaveRequestManager from '@/features/leave-request/pages/manager/LeaveRequest';
import ManagerWorkSchedule from '@/features/schedule/pages/manager/ManagerWorkSchedule';
import EmployeeWorkSchedule from '@/features/schedule/pages/employee/EmployeeSchedule';
import AdminLeaveRequest from '@/features/leave-request/pages/admin/LeaveRequest';
import TransferManagerPage from '@/features/transfer/pages/manager/ManagerTransfer';
import EmployeeTransferPage from '@/features/transfer/pages/employee/EmployeeTransfer';
import TransferAdminPage from '@/features/transfer/pages/admin/AdminTransfer';
import TrainingManagerPage from '@/features/training/pages/manager/ManagerTraining';
import EmployeeTrainingDetailPage from '@/features/training/pages/EmployeeTrainingDetail';
import PPEPlanDetailPage from '@/features/safety/pages/admin/SafetyDetail';
import ManagerPPEPlanDetailPage from '@/features/safety/pages/manager/ManagerPPEPlanDetailPage';
import AdminLeaveRequestMockPage from '@/features/leave-request/pages/admin/LeaveRequestMock';

// Lazy load pages for better performance
const Login = lazy(() => import('@/features/auth/pages/Login'));

// Admin pages
const AdminDashboard = lazy(() => import('@/features/dashboard/pages/admin/AdminDashboard'));
const AdminEmployees = lazy(() => import('@/features/employees/pages/admin/AdminEmployees'));
const AdminOrgChart = lazy(() => import('@/features/departments/pages/admin/AdminOrgChart'));
const AdminTraining = lazy(() => import('@/features/training/pages/admin/AdminTraining'));
const AdminSalary = lazy(() => import('@/features/salary/pages/admin/AdminSalary'));
const AdminEmployeeSalary = lazy(() => import('@/features/salary/pages/admin/AdminEmployeeSalary'));
const AdminProfile = lazy(() => import('@/features/employees/pages/admin/AdminProfile'));
const SafetyItems = lazy(() => import('@/features/safety/pages/admin/SafetyItems'));
const AdminSafetyDashboard = lazy(() => import('@/features/safety/pages/admin/AdminSafetyDashboard'));
const DepartmentList = lazy(() => import('@/features/departments/pages/admin/DepartmentList'));
const AdminCatalog = lazy(() => import('@/features/categories/pages/admin/Catalog'));
const AdminMedicalRecords = lazy(() => import('@/features/medical/pages/admin/AdminMedicalRecord'));
const WorkScheduleManagement = lazy(() => import('@/features/schedule/pages/admin/WorkSchedule'));
const LeaveRequestPage = lazy(() => import('@/features/leave-request/pages/admin/LeaveRequest'));
const Reports = lazy(() => import('@/features/reports/pages/admin/Reports'));

// Manager pages
const ManagerDashboard = lazy(() => import('@/features/dashboard/pages/manager/ManagerDashboard'));
const ManagerEmployees = lazy(() => import('@/features/employees/pages/manager/ManagerEmployees'));
const ManagerOrgChart = lazy(() => import('@/features/departments/pages/manager/ManagerOrgChart'));
const ManagerTraining = lazy(() => import('@/features/training/pages/manager/ManagerTraining'));
const ManagerProfile = lazy(() => import('@/features/employees/pages/manager/ManagerProfile'));
const ManagerSafetyDistribution = lazy(() => import('@/features/safety/pages/manager/DistributionItems'));
const ManagerSafetyDetail = lazy(() => import('@/features/safety/pages/manager/ItemsDetail'));

// Employee pages
const EmployeeProfile = lazy(() => import('@/features/employees/pages/employee/EmployeeProfile'));
const EmployeePayroll = lazy(() => import('@/features/salary/pages/employee/EmployeePayroll'));
const EmployeeLearning = lazy(() => import('@/features/training/pages/employee/EmployeeLearning'));
const EmployeePerformance = lazy(() => import('@/features/performance/pages/employee/EmployeePerformance'));
const EmployeeSafetyList = lazy(() => import('@/features/safety/pages/employee/EmployeeSafetyList'));
const EmployeeCareerPath = lazy(() => import('@/features/employees/pages/employee/CareerPath'));

// Shared
const TrainingDetail = lazy(() => import('@/features/training/pages/TrainingDetail'));
const NotFound = lazy(() => import('@/features/auth/pages/NotFound'));

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole[];
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user } = useAuthStore();

  if (!user?.roles) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !requiredRole.includes(user?.roles)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const router = createBrowserRouter([
  { path: ROUTES.LOGIN, element: <Login /> },
  {
    path: ROUTES.ROOT,
    element: (
      <Layout />
    ),
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      // Admin Routes
      { path: ROUTES.ADMIN_DASHBOARD.slice(1), element: <AdminDashboard /> },
      { path: ROUTES.ADMIN_EMPLOYEES.slice(1), element: <AdminEmployees /> },
      { path: ROUTES.ADMIN_ORG_CHART.slice(1), element: <AdminOrgChart /> },
      { path: ROUTES.ADMIN_TRAINING.slice(1), element: <AdminTraining /> },
      { path: ROUTES.ADMIN_SALARY.slice(1), element: <AdminSalary /> },
      { path: ROUTES.ADMIN_EMPLOYEE_SALARY.slice(1), element: <AdminEmployeeSalary /> },
      { path: ROUTES.ADMIN_PROFILE.slice(1), element: <AdminProfile /> },
      { path: ROUTES.ADMIN_PROFILE_ID.slice(1), element: <AdminProfile /> },
      { path: ROUTES.ADMIN_SAFETY_ITEMS.slice(1), element: <SafetyItems /> },
      { path: ROUTES.ADMIN_SAFETY_DASHBOARD.slice(1), element: <AdminSafetyDashboard /> },
      { path: ROUTES.ADMIN_DEPARTMENTS.slice(1), element: <DepartmentList /> },
      { path: ROUTES.ADMIN_CATALOG.slice(1), element: <AdminCatalog /> },
      { path: ROUTES.ADMIN_MEDICAL_RECORDS.slice(1), element: <AdminMedicalRecords /> },
      { path: ROUTES.ADMIN_WORK_SCHEDULE.slice(1), element: <WorkScheduleManagement /> },
      { path: ROUTES.ADMIN_LEAVE_REQUESTS.slice(1), element: <AdminLeaveRequestMockPage /> },
      { path: ROUTES.ADMIN_REPORTS.slice(1), element: <Reports /> },
      { path: ROUTES.ADMIN_TRANSFER.slice(1), element: <TransferAdminPage /> },
      { path: ROUTES.ADMIN_SAFETY_DETAIL.slice(1), element: <PPEPlanDetailPage /> },
      // Manager Routes
      { path: ROUTES.MANAGER_DASHBOARD.slice(1), element: <ManagerDashboard /> },
      { path: ROUTES.MANAGER_EMPLOYEES.slice(1), element: <ManagerEmployees /> },
      { path: ROUTES.MANAGER_ORG_CHART.slice(1), element: <ManagerOrgChart /> },
      { path: ROUTES.MANAGER_TRAINING.slice(1), element: <TrainingManagerPage /> },
      { path: ROUTES.MANAGER_PROFILE.slice(1), element: <ManagerProfile /> },
      { path: ROUTES.MANAGER_PROFILE_ID.slice(1), element: <ManagerProfile /> },
      { path: ROUTES.MANAGER_SAFETY_ITEMS.slice(1), element: <ManagerSafetyDistribution /> },
      { path: ROUTES.MANAGER_SAFETY_DETAIL.slice(1), element: <ManagerSafetyDetail /> },
      { path: ROUTES.MANAGER_WORK_SCHEDULE.slice(1), element: <ManagerWorkSchedule /> },
      { path: ROUTES.MANAGER_LEAVE_REQUESTS.slice(1), element: <LeaveRequestManager /> },
      { path: ROUTES.MANAGER_TRANSFER.slice(1), element: <TransferManagerPage /> },
      { path: ROUTES.MANAGER_PPE_DETAILS.slice(1), element: <ManagerPPEPlanDetailPage /> },

      // Employee Routes
      { path: ROUTES.EMPLOYEE_PROFILE.slice(1), element: <EmployeeProfile /> },
      { path: ROUTES.EMPLOYEE_PAYROLL.slice(1), element: <EmployeePayroll /> },
      { path: ROUTES.EMPLOYEE_LEARNING.slice(1), element: <EmployeeLearning /> },
      { path: ROUTES.EMPLOYEE_PERFORMANCE.slice(1), element: <EmployeePerformance /> },
      { path: ROUTES.EMPLOYEE_SAFETY.slice(1), element: <EmployeeSafetyList /> },
      { path: ROUTES.EMPLOYEE_CAREER_PATH.slice(1), element: <EmployeeCareerPath /> },
      { path: ROUTES.EMPLOYEE_WORK_SCHEDULE.slice(1), element: <EmployeeWorkSchedule /> },
      { path: ROUTES.EMPLOYEE_TRANSFER.slice(1), element: <EmployeeTransferPage /> },
      { path: ROUTES.EMPLOYEE_TRAINING.slice(1), element: <EmployeeTrainingDetailPage /> },

      // Shared Training Detail
      { path: ROUTES.TRAINING_DETAIL.slice(1), element: <TrainingDetail /> },
      { path: ROUTES.LEAVE_REQUESTS.slice(1), element: <LeaveRequest /> },
      // Catch-all
      { path: ROUTES.NOT_FOUND, element: <NotFound /> },
    ]
  },
]);

