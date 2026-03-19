import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminEmployees from "./pages/admin/Employees";
import AdminOrgChart from "./pages/admin/OrgChart";
import AdminTraining from "./pages/admin/Training";
import AdminSalary from "./pages/admin/Salary";
import AdminEmployeeSalary from "./pages/admin/EmployeeSalary";
import AdminProfile from "./pages/admin/Profile";
import ManagerDashboard from "./pages/manager/Dashboard";
import ManagerEmployees from "./pages/manager/Employees";
import ManagerOrgChart from "./pages/manager/OrgChart";
import ManagerTraining from "./pages/manager/Training";
import ManagerProfile from "./pages/manager/Profile";
import ManagerSafetyDistribution from "./pages/manager/DistributionItems";
import ManagerSafetyDetail from "./pages/manager/ItemsDetail";
import TrainingDetail from "./pages/TrainingDetail";
import EmployeeProfile from "./pages/employee/Profile";
import EmployeePayroll from "./pages/employee/Payroll";
import EmployeeLearning from "./pages/employee/Learning";
import EmployeePerformance from "./pages/employee/Performance";
import NotFound from "./pages/NotFound";
import { useAuthStore } from "./store/authStore";
import SafetyItems from "./pages/admin/SafetyItem";
import EmployeeSafetyList from "./pages/employee/EmployeeSafetyList";
import AdminSafetyDashboard from "./pages/admin/AdminSafetyDashboard";
import DepartmentList from "./pages/admin/DepartmentList";
import AdminCatalog from "./pages/admin/Catalog";
import EmployeeCareerPath from "./pages/employee/CareerPath";
import AdminMedicalRecords from "./pages/admin/AdminMedicalRecord";
import HealthManagement from "./pages/admin/HealthManagement";
import AdminTransferManagement from "./pages/admin/TransferManagement";
import WorkScheduleManagement from "./pages/admin/WorkSchedule";
import LeaveRequestPage from "./pages/admin/LeaveRequest";
import Reports from "./pages/admin/Reports";
import SafetyEquipmentPlan from "./pages/admin/SafetyEquipmentPlan";
import SafetyEquipmentRegister from "./pages/manager/SafetyEquipmentRegister";
import AdminKPIManagement from "./pages/admin/KPIManagement";
import ManagerKPIManagement from "./pages/manager/KPIManagement";
import ManagerTrainingManagement from "./pages/manager/TrainingManagement";
import ManagerTransferManagement from "./pages/manager/TransferManagement";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { role } = useAuthStore();
  if (!role) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function RoleBasedRedirect() {
  const { role } = useAuthStore();
  
  if (role === 'Employee') {
    return <Navigate to="/employee/profile" replace />;
  } else if (role === 'ViceDirector' || role === 'DepartmentHead' || role === 'DeputyHead') {
    return <Navigate to="/manager/dashboard" replace />;
  }
  
  return <Navigate to="/admin/dashboard" replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <RoleBasedRedirect />
              </ProtectedRoute>
            }
          />
          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/employees"
            element={
              <ProtectedRoute>
                <AdminEmployees />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/org-chart"
            element={
              <ProtectedRoute>
                <AdminOrgChart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/training"
            element={
              <ProtectedRoute>
                <AdminTraining />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/kpi"
            element={
              <ProtectedRoute>
                <AdminKPIManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/transfers"
            element={
              <ProtectedRoute>
                <AdminTransferManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/kpi"
            element={
              <ProtectedRoute>
                <ManagerKPIManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/training-management"
            element={
              <ProtectedRoute>
                <ManagerTrainingManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/transfers"
            element={
              <ProtectedRoute>
                <ManagerTransferManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/salary"
            element={
              <ProtectedRoute>
                <AdminSalary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/employee-salary"
            element={
              <ProtectedRoute>
                <AdminEmployeeSalary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute>
                <AdminProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/profile/:id"
            element={
              <ProtectedRoute>
                <AdminProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/safety-items"
            element={
              <ProtectedRoute>
                <SafetyItems />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/safety-dashboard"
            element={
              <ProtectedRoute>
                <AdminSafetyDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/departments"
            element={
              <ProtectedRoute>
                <DepartmentList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/catalog"
            element={
              <ProtectedRoute>
                <AdminCatalog />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/medical-records"
            element={
              <ProtectedRoute>
                <AdminMedicalRecords />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/work-schedule"
            element={
              <ProtectedRoute>
                <WorkScheduleManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/leave-requests"
            element={
              <ProtectedRoute>
                <LeaveRequestPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/safety-equipment-plan"
            element={
              <ProtectedRoute>
                <SafetyEquipmentPlan />
              </ProtectedRoute>
            }
          />

          {/* Manager Routes */}
          <Route
            path="/manager/dashboard"
            element={
              <ProtectedRoute>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/employees"
            element={
              <ProtectedRoute>
                <ManagerEmployees />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/org-chart"
            element={
              <ProtectedRoute>
                <ManagerOrgChart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/training"
            element={
              <ProtectedRoute>
                <ManagerTraining />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/profile"
            element={
              <ProtectedRoute>
                <ManagerProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/profile/:id"
            element={
              <ProtectedRoute>
                <ManagerProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/safety-items"
            element={
              <ProtectedRoute>
                <ManagerSafetyDistribution />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/safety/:employeeId"
            element={
              <ProtectedRoute>
                <ManagerSafetyDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/safety-equipment-register"
            element={
              <ProtectedRoute>
                <SafetyEquipmentRegister />
              </ProtectedRoute>
            }
          />

          {/* Shared Training Detail */}
          <Route
            path="/training/:id"
            element={
              <ProtectedRoute>
                <TrainingDetail />
              </ProtectedRoute>
            }
          />

          {/* Employee Routes */}
          <Route
            path="/employee/profile"
            element={
              <ProtectedRoute>
                <EmployeeProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/payroll"
            element={
              <ProtectedRoute>
                <EmployeePayroll />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/learning"
            element={
              <ProtectedRoute>
                <EmployeeLearning />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/performance"
            element={
              <ProtectedRoute>
                <EmployeePerformance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/safety"
            element={
              <ProtectedRoute>
                <EmployeeSafetyList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/career-path"
            element={
              <ProtectedRoute>
                <EmployeeCareerPath />
              </ProtectedRoute>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
