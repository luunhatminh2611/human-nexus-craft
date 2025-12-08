import { Layout } from '@/shared/components/layouts/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import mockData from '@/mock/data';
import { useMemo } from 'react';
import {
  Users,
  UserPlus,
  Calendar,
  GraduationCap,
  TrendingUp,
  TrendingDown,
  FileText,
  Clock,
  Briefcase,
  Activity,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Button } from '@/shared/components/ui/button/Button2';

export default function AdminDashboard() {
  const employees = mockData.employees;
  const departments = mockData.departments;

  // ==================== 1. NHÂN SỰ TỔNG QUAN ====================

  // Tính số lượng nhân sự theo phòng ban
  const deptStats = useMemo(() => {
    return departments.map((dept) => {
      const activeCount = employees.filter(
        (e) => e.departmentId === dept.id && e.status !== 'Resigned'
      ).length;

      // Biến động 30 ngày (tuyển mới - nghỉ việc)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const newHires = employees.filter(
        (e) => e.departmentId === dept.id &&
          new Date(e.startDate) > thirtyDaysAgo &&
          e.status !== 'Resigned'
      ).length;

      const resigned = employees.filter(
        (e) => e.departmentId === dept.id &&
          e.status === 'Resigned'
      ).length;

      const change = newHires - resigned;

      return {
        name: dept.name,
        count: activeCount,
        change: change,
      };
    }).filter(d => d.count > 0);
  }, [employees, departments]);

  const totalActive = employees.filter((e) => e.status !== 'Resigned').length;

  // ==================== 2. VẬN HÀNH NHÂN SỰ ====================

  const onLeaveToday = employees.filter((e) => e.status === 'On Leave').length;
  const pendingLeaveRequests = mockData.leaveRequests.filter(
    (req) => req.status === 'Pending'
  ).length;

  // ==================== 3. TUYỂN DỤNG & ĐÀO TẠO ====================

  // Tin tuyển dụng - giả sử = số vị trí còn thiếu người
  const recruitmentPosts = 5; // Mock data

  // Tuyển dụng mới 30 ngày
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newHires30Days = employees.filter(
    (e) => new Date(e.startDate) > thirtyDaysAgo && e.status !== 'Resigned'
  ).length;

  // Khóa đào tạo
  const totalTrainings = mockData.trainings.length;

  // Hoàn thành đào tạo
  const completedTrainings = mockData.trainings.filter(
    (t) => t.status === 'Completed'
  ).length;
  const trainingCompletionRate = Math.round(
    (completedTrainings / totalTrainings) * 100
  );

  // ==================== 4. XU HƯỚNG & PHÂN BỔ ====================

  // Chart 1: Xu hướng nhân sự 12 tháng
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
    { month: 'T11', count: totalActive - 1 },
    { month: 'T12', count: totalActive },
  ];

  // Chart 2: Phân bổ theo phòng ban (%)
  const deptDistribution = deptStats.map((dept) => ({
    name: dept.name,
    value: dept.count,
    percentage: Math.round((dept.count / totalActive) * 100),
  }));

  // Chart 3: Phân bổ theo cấp/bậc
  const gradeDistribution = [
    {
      grade: 'G1 - Nhân viên',
      count: employees.filter((e) => e.grade === 'G1' && e.status !== 'Resigned').length,
    },
    {
      grade: 'G2 - Chuyên viên/Quản lý',
      count: employees.filter((e) => e.grade === 'G2' && e.status !== 'Resigned').length,
    },
    {
      grade: 'G3 - Điều hành',
      count: employees.filter((e) => e.grade === 'G3' && e.status !== 'Resigned').length,
    },
  ];

  // ==================== 5. HOẠT ĐỘNG GÀN ĐÂY ====================

  const recentActivities = [
    {
      id: 1,
      action: 'Phê duyệt đơn nghỉ phép',
      user: 'Nguyễn Văn An',
      target: 'Trần Thị Bình',
      time: '10 phút trước',
      type: 'approval',
    },
    {
      id: 2,
      action: 'Thêm nhân viên mới',
      user: 'Nguyễn Văn An',
      target: 'Hoàng Văn Em',
      time: '2 giờ trước',
      type: 'create',
    },
    {
      id: 3,
      action: 'Cập nhật thông tin lương',
      user: 'Nguyễn Văn An',
      target: 'Phạm Thị Dung',
      time: '5 giờ trước',
      type: 'update',
    },
    {
      id: 4,
      action: 'Gán khóa đào tạo',
      user: 'Trần Thị Bình',
      target: 'Kỹ năng bán hàng chuyên nghiệp',
      time: '1 ngày trước',
      type: 'assign',
    },
    {
      id: 5,
      action: 'Phê duyệt hồ sơ y tế',
      user: 'Nguyễn Văn An',
      target: 'Võ Thị Phương',
      time: '2 ngày trước',
      type: 'approval',
    },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Tổng quan hệ thống quản lý nhân sự</p>
      </div>

      {/* ==================== 1. NHÂN SỰ TỔNG QUAN ==================== */}
      <div>
        <h2 className="text-xl font-semibold mb-4">1. Nhân sự tổng quan</h2>
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Phòng ban & Số lượng nhân sự</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">Tổng nhân sự:</span>
                  <span className="text-2xl font-bold text-[#1a8649]">{totalActive}</span>
                  <Users className="h-5 w-5 text-[#1a8649]" />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {deptStats.map((dept, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{dept.name}</p>
                      <p className="text-2xl font-bold text-[#1a8649]">{dept.count} nhân viên</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground mb-1">Biến động (30 ngày)</p>
                      <div className={`flex items-center gap-1 ${dept.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {dept.change >= 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        <span className="font-semibold">
                          {dept.change >= 0 ? '+' : ''}{dept.change}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">2. Vận hành nhân sự</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Nhân viên đang nghỉ hôm nay */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Nhân viên đang nghỉ hôm nay
              </CardTitle>
              <Calendar className="h-5 w-5 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning mb-4">{onLeaveToday}</div>

              {onLeaveToday > 0 ? (
                <div className="space-y-2">
                  {employees
                    .filter((e) => e.status === 'On Leave')
                    .slice(0, 3)
                    .map((emp) => (
                      <div
                        key={emp.id}
                        className="flex items-center gap-2 p-2 bg-muted/50 rounded text-sm"
                      >
                        <img
                          src={emp.avatar}
                          alt={emp.lastName}
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="flex-1">
                          <p className="font-medium">
                            {emp.firstName} {emp.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">{emp.position}</p>
                        </div>
                      </div>
                    ))}

                  {onLeaveToday > 3 && (
                    <p className="text-xs text-muted-foreground text-center pt-2">
                      Và {onLeaveToday - 3} nhân viên khác...
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Không có nhân viên nghỉ phép</p>
              )}
            </CardContent>
          </Card>

          {/* Đơn nghỉ phép đang chờ duyệt */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Đơn nghỉ phép đang chờ duyệt
              </CardTitle>
              <Clock className="h-5 w-5 text-[#1a8649]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#1a8649] mb-4">{pendingLeaveRequests}</div>
              <div className="space-y-2">
                {mockData.leaveRequests
                  .filter((req) => req.status === 'Pending')
                  .slice(0, 3)
                  .map((req) => {
                    const employee = employees.find((e) => e.id === req.employeeId);
                    return (
                      <div
                        key={req.id}
                        className="flex items-center gap-2 p-2 bg-muted/50 rounded text-sm"
                      >
                        <img
                          src={employee?.avatar}
                          alt={employee?.lastName}
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="flex-1">
                          <p className="font-medium">
                            {employee?.firstName} {employee?.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">{req.reason}</p>
                        </div>
                      </div>
                    );
                  })}

                {pendingLeaveRequests > 3 && (
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    Và {pendingLeaveRequests - 3} đơn khác...
                  </p>
                )}
              </div>


              <Button
                onClick={() => window.location.href = '/admin/leave-requests'}
                className="mt-4 w-full px-4 py-2 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Xem tất cả đơn nghỉ phép
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ==================== 3. TUYỂN DỤNG & ĐÀO TẠO ==================== */}
      <div>
        <h2 className="text-xl font-semibold mb-4">3. Tuyển dụng & Đào tạo</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tin tuyển dụng</CardTitle>
              <Briefcase className="h-4 w-4 text-[#1a8649]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recruitmentPosts}</div>
              <p className="text-xs text-muted-foreground mt-1">vị trí đang tuyển</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Tuyển dụng mới
              </CardTitle>
              <UserPlus className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{newHires30Days}</div>
              <p className="text-xs text-muted-foreground mt-1">
                nhân viên (30 ngày)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Khóa đào tạo</CardTitle>
              <GraduationCap className="h-4 w-4 text-[#1a8649]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTrainings}</div>
              <p className="text-xs text-muted-foreground mt-1">khóa học</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Hoàn thành đào tạo
              </CardTitle>
              <GraduationCap className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{trainingCompletionRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {completedTrainings}/{totalTrainings} khóa
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ==================== 4. XU HƯỚNG & PHÂN BỔ ==================== */}
      <div>
        <h2 className="text-xl font-semibold mb-4">4. Xu hướng & Phân bổ</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Chart 1: Xu hướng nhân sự */}
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
                    stroke="#0088FE"
                    strokeWidth={2}
                    name="Số lượng"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Chart 2: Phân bổ theo phòng ban */}
          <Card>
            <CardHeader>
              <CardTitle>Phân bổ theo phòng ban (%)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={deptDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="percentage" fill="#00C49F" name="Tỷ lệ (%)">
                    {deptDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Chart 3: Phân bổ theo cấp/bậc */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Phân bổ theo cấp/bậc</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8 px-4">
                <div className="relative flex items-center gap-8">
                  {gradeDistribution.map((grade, idx) => (
                    <div key={idx} className="relative flex flex-col items-center">
                      {/* Box chính */}
                      <div className="relative">
                        <div className="w-40 h-32 rounded-lg border-2 border-primary bg-primary/5 flex flex-col items-center justify-center shadow-md">
                          <div className="text-3xl font-bold text-primary mb-1">
                            {grade.count}
                          </div>
                          <div className="text-xs text-muted-foreground mb-2">nhân viên</div>
                          <div className="text-sm font-semibold text-center px-2">
                            {grade.grade}
                          </div>
                        </div>

                        {/* Badge phần trăm */}
                        <div className="absolute -top-3 -right-3 bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center text-sm font-bold shadow-lg">
                          {Math.round((grade.count / totalActive) * 100)}%
                        </div>
                      </div>

                      {/* Arrow connector */}
                      {idx < gradeDistribution.length - 1 && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 flex items-center">
                          <div className="w-8 h-0.5 bg-primary"></div>
                          <div className="w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-8 border-l-primary"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="mt-6 pt-4 border-t">
                <div className="flex items-center justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-primary/20 border-2 border-primary"></div>
                    <span className="text-muted-foreground">Cấp bậc</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-primary"></div>
                    <span className="text-muted-foreground">Tỷ lệ %</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="20" height="8" viewBox="0 0 20 8" fill="none">
                      <path d="M0 4H14M14 4L10 0M14 4L10 8" stroke="currentColor" strokeWidth="1.5" className="text-primary" />
                    </svg>
                    <span className="text-muted-foreground">Luồng thăng tiến</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ==================== 5. HOẠT ĐỘNG GẦN ĐÂY ==================== */}
      <div>
        <h2 className="text-xl font-semibold mb-4">5. Hoạt động gần đây</h2>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Các hành động trong hệ thống
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    {activity.type === 'approval' && <FileText className="h-4 w-4 text-[#1a8649]" />}
                    {activity.type === 'create' && <UserPlus className="h-4 w-4 text-success" />}
                    {activity.type === 'update' && <FileText className="h-4 w-4 text-warning" />}
                    {activity.type === 'assign' && <GraduationCap className="h-4 w-4 text-[#1a8649]" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-semibold">{activity.user}</span>
                      {' '}{activity.action.toLowerCase()}{' '}
                      <span className="font-semibold">{activity.target}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}