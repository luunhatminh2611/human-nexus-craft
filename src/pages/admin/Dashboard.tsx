import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

export default function AdminDashboard() {
  const employees = mockData.employees;

  // Calculate statistics
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => e.status === 'Active').length;
  const onLeave = employees.filter((e) => e.status === 'On Leave').length;
  const probation = employees.filter((e) => e.status === 'Probation').length;

  // New hires in last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newHires = employees.filter(
    (e) => new Date(e.startDate) > thirtyDaysAgo && e.status !== 'Resigned'
  ).length;

  // Resignations in last 30 days
  const resigned = employees.filter((e) => e.status === 'Resigned').length;

  // Training completion rate
  const totalTrainings = mockData.trainings.length;
  const completedTrainings = mockData.trainings.filter((t) => t.status === 'Completed').length;
  const trainingCompletionRate = Math.round((completedTrainings / totalTrainings) * 100);

  // Department distribution
  const deptData = mockData.departments.map((dept) => ({
    name: dept.name,
    count: employees.filter((e) => e.departmentId === dept.id && e.status !== 'Resigned').length,
  })).filter(d => d.count > 0);

  // Grade distribution
  const gradeData = [
    {
      name: 'G1',
      value: employees.filter((e) => e.grade === 'G1' && e.status !== 'Resigned').length,
    },
    {
      name: 'G2',
      value: employees.filter((e) => e.grade === 'G2' && e.status !== 'Resigned').length,
    },
    {
      name: 'G3',
      value: employees.filter((e) => e.grade === 'G3' && e.status !== 'Resigned').length,
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
          <p className="text-muted-foreground">Tổng quan toàn công ty</p>
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

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
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
      </div>
    </Layout>
  );
}
