import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import mockData from '@/mock/data';
import { useMemo } from 'react';
import {
  Users,
  UserPlus,
  UserMinus,
  GraduationCap,
  TrendingUp,
  TrendingDown,
  Building2,
  Calendar,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function Dashboard() {
  const { role, employeeId } = useAuthStore();

  // Filter employees based on role
  const filteredEmployees = useMemo(() => {
    if (role === 'Admin') {
      return mockData.employees;
    } else if (role === 'Manager') {
      return mockData.employees.filter(e => e.managerId === employeeId || e.id === employeeId);
    } else {
      return mockData.employees.filter(e => e.id === employeeId);
    }
  }, [role, employeeId]);

  // Calculate statistics
  const totalEmployees = filteredEmployees.length;
  const activeEmployees = filteredEmployees.filter((e) => e.status === 'Active').length;
  const onLeave = filteredEmployees.filter((e) => e.status === 'On Leave').length;
  const probation = filteredEmployees.filter((e) => e.status === 'Probation').length;

  // New hires in last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newHires = filteredEmployees.filter(
    (e) => new Date(e.startDate) > thirtyDaysAgo && e.status !== 'Resigned'
  ).length;

  // Resignations in last 30 days (using status)
  const resigned = filteredEmployees.filter((e) => e.status === 'Resigned').length;

  // Training completion rate
  const totalTrainings = mockData.trainings.length;
  const completedTrainings = mockData.trainings.filter((t) => t.status === 'Completed').length;
  const trainingCompletionRate = Math.round((completedTrainings / totalTrainings) * 100);

  // Department distribution
  const deptData = mockData.departments.map((dept) => ({
    name: dept.name,
    count: filteredEmployees.filter((e) => e.departmentId === dept.id && e.status !== 'Resigned')
      .length,
  })).filter(d => d.count > 0);

  // Grade distribution
  const gradeData = [
    {
      name: 'G1',
      value: filteredEmployees.filter((e) => e.grade === 'G1' && e.status !== 'Resigned').length,
    },
    {
      name: 'G2',
      value: filteredEmployees.filter((e) => e.grade === 'G2' && e.status !== 'Resigned').length,
    },
    {
      name: 'G3',
      value: filteredEmployees.filter((e) => e.grade === 'G3' && e.status !== 'Resigned').length,
    },
  ].filter(g => g.value > 0);

  // Headcount trend (mock 12 months)
  const headcountTrend = [
    { month: 'T1', count: 78 },
    { month: 'T2', count: 82 },
    { month: 'T3', count: 85 },
    { month: 'T4', count: 88 },
    { month: 'T5', count: 90 },
    { month: 'T6', count: 92 },
    { month: 'T7', count: 95 },
    { month: 'T8', count: 97 },
    { month: 'T9', count: 98 },
    { month: 'T10', count: 100 },
    { month: 'T11', count: totalEmployees - 1 },
    { month: 'T12', count: totalEmployees },
  ];

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            {role === 'Admin'
              ? 'Tổng quan toàn công ty'
              : role === 'Manager'
              ? 'Tổng quan team của bạn'
              : 'Tổng quan cá nhân'}
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tổng nhân viên
              </CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeEmployees}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-success inline-flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{newHires} trong 30 ngày
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tuyển dụng mới
              </CardTitle>
              <UserPlus className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{newHires}</div>
              <p className="text-xs text-muted-foreground mt-1">30 ngày qua</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Đang nghỉ phép
              </CardTitle>
              <Calendar className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{onLeave}</div>
              <p className="text-xs text-muted-foreground mt-1">Hôm nay</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Hoàn thành đào tạo
              </CardTitle>
              <GraduationCap className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{trainingCompletionRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {completedTrainings}/{totalTrainings} khóa học
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts - Only show for Admin and Manager */}
        {(role === 'Admin' || role === 'Manager') && (
          <div className="grid gap-4 md:grid-cols-2">
            {/* Headcount Trend - Admin only */}
            {role === 'Admin' && (
              <Card>
                <CardHeader>
                  <CardTitle>Xu hướng nhân sự (12 tháng)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={headcountTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="hsl(var(--chart-1))"
                        strokeWidth={2}
                        name="Số lượng"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Department Distribution */}
            {deptData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Phân bổ theo phòng ban</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={deptData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="hsl(var(--chart-2))" name="Nhân viên" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Grade Distribution */}
            {gradeData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Phân bổ theo bậc</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={gradeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {gradeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Thống kê nhanh</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Nhân viên chính thức</span>
                  <span className="font-semibold">{activeEmployees}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Thử việc</span>
                  <span className="font-semibold text-warning">{probation}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Đã nghỉ việc</span>
                  <span className="font-semibold text-destructive">{resigned}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tổng phòng ban</span>
                  <span className="font-semibold">{mockData.departments.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Khóa đào tạo</span>
                  <span className="font-semibold">{mockData.trainings.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Cơ cấu lương</span>
                  <span className="font-semibold">{mockData.salaryStructures.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Employee Personal Info - for Employee role only */}
        {role === 'Employee' && employeeId && (
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(() => {
                  const employee = mockData.employees.find(e => e.id === employeeId);
                  if (!employee) return <p>Không tìm thấy thông tin nhân viên</p>;
                  const dept = mockData.departments.find(d => d.id === employee.departmentId);
                  return (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Họ tên</p>
                        <p className="font-semibold">{employee.firstName} {employee.lastName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-semibold">{employee.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phòng ban</p>
                        <p className="font-semibold">{dept?.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Chức vụ</p>
                        <p className="font-semibold">{employee.position}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Bậc</p>
                        <p className="font-semibold">{employee.grade}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Trạng thái</p>
                        <p className="font-semibold">{employee.status}</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
