import { Layout } from '@/shared/components/layouts/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { useAuthStore } from '@/features/auth';
import mockData from '@/mock/data';
import { useMemo } from 'react';
import {
  Users,
  UserPlus,
  Calendar,
  GraduationCap,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
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

export default function ManagerDashboard() {
  const { employeeId } = useAuthStore();

  // Filter employees in manager's team
  const filteredEmployees = useMemo(() => {
    return mockData.employees.filter(e => e.managerId === employeeId || e.id === employeeId);
  }, [employeeId]);

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

  // Resignations
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

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Tổng quan team của bạn</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng thành viên
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

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
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

        <Card>
          <CardHeader>
            <CardTitle>Thống kê team</CardTitle>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
