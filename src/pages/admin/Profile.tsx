import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import mockData from '@/mock/data';
import { useAuthStore } from '@/store/authStore';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { SalaryTabWithDragDrop } from '@/components/SalaryTabWithDragDrop';
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  DollarSign,
  FileText,
  Heart,
  Download,
  Award,
  Clock,
  Map,
  User,
} from 'lucide-react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { AddFamilyForm } from './component/FamilyAddForm';
import { FamilyList } from './component/FamilyList';
import MedicalRecordForm from './component/MedicalRecordForm';
import { CVTab } from './component/CVTab';
import { KPITab } from './component/KPITab';
import TransferTab from './component/TransferTab';

function ProfileContent() {
  const { id } = useParams();
  const { employeeId, role } = useAuthStore();

  // Use URL param or current user's ID
  const currentEmpId = id || employeeId;
  const employee = mockData.employees.find((e) => e.id === currentEmpId);
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const week = Math.ceil(
      ((now.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + new Date(year, 0, 1).getDay() + 1) / 7
    );
    return `${year}-W${week.toString().padStart(2, "0")}`;
  });

  const getWeekDays = () => {
    const [year, week] = selectedWeek.split("-W").map(Number);
    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dow = simple.getDay();
    const ISOweekStart = new Date(simple);
    if (dow <= 4)
      ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else
      ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(ISOweekStart);
      d.setDate(d.getDate() + i);
      return {
        id: i,
        name: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"][i],     // label VN
        nameEnglish: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][i], // key for data
        date: d.toISOString().split("T")[0],
      };
    });
  };
  if (!employee) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Không tìm thấy nhân viên</h2>
        </div>
      </Layout>
    );
  }

  const department = mockData.departments.find((d) => d.id === employee.departmentId);
  const manager = employee.managerId
    ? mockData.employees.find((e) => e.id === employee.managerId)
    : null;
  const medicalRecord = mockData.medicalRecords.find((m) => m.id === employee.medicalRecordId);
  const grade = mockData.grades.find((g) => g.id === employee.grade);

  const completedTrainings = mockData.trainings.filter((t) =>
    employee.trainingsCompleted.includes(t.id)
  );
  const requiredTrainings = grade?.requiredTrainings || [];
  const trainingProgress = (employee.trainingsCompleted.length / requiredTrainings.length) * 100;

  const workSchedules = mockData.workSchedules.filter(
    (s) => s.employeeId === employee.id
  );

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('vi-VN', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              <img
                src={employee.avatar}
                alt={`${employee.firstName} ${employee.lastName}`}
                className="w-24 h-24 rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold">
                      {employee.firstName} {employee.lastName}
                    </h1>
                    <p className="text-lg text-muted-foreground">{employee.position}</p>
                  </div>
                  <Badge
                    variant={
                      employee.status === 'Active'
                        ? 'default'
                        : employee.status === 'On Leave'
                          ? 'secondary'
                          : 'destructive'
                    }
                  >
                    {employee.status === 'Active'
                      ? 'Đang làm việc'
                      : employee.status === 'On Leave'
                        ? 'Nghỉ phép'
                        : employee.status === 'Probation'
                          ? 'Thử việc'
                          : 'Đã nghỉ'}
                  </Badge>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{employee.email}</span>
                  </div>
                  {employee.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{employee.phone}</span>
                    </div>
                  )}
                  {employee.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{employee.address}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Ngày vào: {new Date(employee.startDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="info" className="space-y-4">
          <TabsList className="grid w-full grid-cols-9">
            <TabsTrigger value="info">Thông tin</TabsTrigger>
            <TabsTrigger value="cv">Sơ yếu lý lịch</TabsTrigger>
            <TabsTrigger value="medical">Y tế</TabsTrigger>
            <TabsTrigger value="training">Đào tạo</TabsTrigger>
            <TabsTrigger value="kpi">KPI</TabsTrigger>
            <TabsTrigger value="transfer">Điều động</TabsTrigger>
            <TabsTrigger value="salary">Lương</TabsTrigger>
            <TabsTrigger value="contracts">Hợp đồng</TabsTrigger>
            <TabsTrigger value="leaves">Đơn nghỉ phép</TabsTrigger>
          </TabsList>

          {/* Combined Info + Work */}
          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cơ bản & Công việc</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Họ và tên</p>
                    <p className="font-medium">
                      {employee.firstName} {employee.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{employee.email}</p>
                  </div>
                  {employee.phone && (
                    <div>
                      <p className="text-sm text-muted-foreground">Số điện thoại</p>
                      <p className="font-medium">{employee.phone}</p>
                    </div>
                  )}
                  {employee.dateOfBirth && (
                    <div>
                      <p className="text-sm text-muted-foreground">Ngày sinh</p>
                      <p className="font-medium">
                        {new Date(employee.dateOfBirth).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  )}
                  {employee.address && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-muted-foreground">Địa chỉ</p>
                      <p className="font-medium">{employee.address}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Loại hợp đồng</p>
                    <p className="font-medium">{employee.contractType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ngày bắt đầu</p>
                    <p className="font-medium">
                      {new Date(employee.startDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Chức danh</p>
                    <p className="font-medium">{employee.position}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phòng ban</p>
                    <p className="font-medium">{department?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bậc lương</p>
                    <Badge variant="outline">{employee.grade}</Badge>
                  </div>
                  {manager && (
                    <div>
                      <p className="text-sm text-muted-foreground">Quản lý trực tiếp</p>
                      <p className="font-medium">
                        {manager.firstName} {manager.lastName}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CV Tab */}
          <TabsContent value="cv">
            <CVTab employeeId={employee.id} />
          </TabsContent>

          {/* Medical Tab */}
          <TabsContent value="medical">
            <MedicalRecordForm employee={employee} medicalRecord={medicalRecord} />
          </TabsContent>

          {/* Training Tab with Year/Quarter/Month filters */}
          <TabsContent value="training" className="space-y-4">
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Tiến độ đào tạo tổng thể</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Đã hoàn thành: {mockData.trainingEnrollments.filter(e => e.employeeId === employee.id && e.status === 'Completed').length} / {mockData.trainingEnrollments.filter(e => e.employeeId === employee.id).length} khóa học
                    </span>
                    <span className="text-sm font-bold">
                      {Math.round((mockData.trainingEnrollments.filter(e => e.employeeId === employee.id && e.status === 'Completed').length / Math.max(1, mockData.trainingEnrollments.filter(e => e.employeeId === employee.id).length)) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={(mockData.trainingEnrollments.filter(e => e.employeeId === employee.id && e.status === 'Completed').length / Math.max(1, mockData.trainingEnrollments.filter(e => e.employeeId === employee.id).length)) * 100}
                    className="h-3"
                  />
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">Tất cả</TabsTrigger>
                <TabsTrigger value="year">Khóa năm</TabsTrigger>
                <TabsTrigger value="quarter">Khóa quý</TabsTrigger>
                <TabsTrigger value="month">Khóa tháng</TabsTrigger>
              </TabsList>
              {['all', 'year', 'quarter', 'month'].map((type) => (
                <TabsContent key={type} value={type}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary" />
                        Khóa học {type === 'year' ? 'năm' : type === 'quarter' ? 'quý' : type === 'month' ? 'tháng' : ''}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Khóa học</TableHead>
                            <TableHead>Thời lượng</TableHead>
                            <TableHead>Tiến độ</TableHead>
                            <TableHead>Trạng thái</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {mockData.trainingEnrollments
                            .filter(e => {
                              const training = mockData.trainings.find(t => t.id === e.trainingId);
                              return e.employeeId === employee.id && (type === 'all' || training?.courseType === type);
                            })
                            .map((enrollment) => {
                              const training = mockData.trainings.find(t => t.id === enrollment.trainingId);
                              return (
                                <TableRow key={enrollment.id}>
                                  <TableCell className="font-medium">{training?.title}</TableCell>
                                  <TableCell>{training?.durationDays} ngày</TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <Progress value={enrollment.progress} className="h-2 w-20" />
                                      <span className="text-xs text-muted-foreground">{enrollment.progress}%</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={enrollment.status === 'Completed' ? 'default' : 'secondary'}>
                                      {enrollment.status === 'Completed' ? 'Hoàn thành' : 'Đang học'}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </TabsContent>

          {/* KPI Tab */}
          <TabsContent value="kpi">
            <KPITab employeeId={employee.id} />
          </TabsContent>

          {/* Transfer Tab */}
          <TabsContent value="transfer">
            <TransferTab employeeId={employee.id} />
          </TabsContent>

          {/* Salary */}
          <TabsContent value="salary" className="space-y-4">
            <SalaryTabWithDragDrop employee={employee} />
          </TabsContent>

          
          <TabsContent value="leaves" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-amber-600" />
                  Đơn xin nghỉ phép
                </CardTitle>
              </CardHeader>

              <CardContent>
                {mockData.leaveRequests.filter((l) => l.employeeId === employee.id).length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tên đơn</TableHead>
                        <TableHead>Lý do</TableHead>
                        <TableHead>Ngày nộp</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Tải xuống</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {mockData.leaveRequests
                        .filter((l) => l.employeeId === employee.id)
                        .map((leave) => (
                          <TableRow key={leave.id}>
                            <TableCell>{leave.fileName || "Đơn nghỉ phép.pdf"}</TableCell>
                            <TableCell className="max-w-[250px] truncate">
                              {leave.reason || "Không ghi rõ"}
                            </TableCell>
                            <TableCell>
                              {new Date(leave.uploadDate).toLocaleDateString("vi-VN")}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  leave.status === "Approved"
                                    ? "default"
                                    : leave.status === "Pending"
                                      ? "secondary"
                                      : "destructive"
                                }
                              >
                                {leave.status === "Approved"
                                  ? "Đã duyệt"
                                  : leave.status === "Pending"
                                    ? "Chờ duyệt"
                                    : "Từ chối"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {leave.fileName ? (
                                <a href={leave.fileName} download>
                                  <Button variant="ghost" size="sm">
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </a>
                              ) : (
                                <span className="text-muted-foreground text-sm">Không có file</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nhân viên này chưa có đơn nghỉ phép nào.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="family" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Thông tin thân nhân
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Form thêm thân nhân */}
                <AddFamilyForm employeeId={employee.id} />

                {/* Danh sách thân nhân */}
                <FamilyList employeeId={employee.id} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contracts" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Hợp đồng lao động
                </CardTitle>

                <div>
                  <input
                    type="file"
                    id="contractUpload"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      console.log("Uploading contract:", file);
                    }}
                  />
                  <Button
                    onClick={() =>
                      document.getElementById("contractUpload")?.click()
                    }
                  >
                    + Upload hợp đồng
                  </Button>
                </div>
              </CardHeader>


              <CardContent>
                {employee.contracts && employee.contracts.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mã HĐ</TableHead>
                        <TableHead>Loại hợp đồng</TableHead>
                        <TableHead>Ngày hiệu lực</TableHead>
                        <TableHead>Ngày hết hạn</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Xem</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employee.contracts.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell>{c.code}</TableCell>
                          <TableCell>{c.type}</TableCell>
                          <TableCell>{formatDate(c.startDate)}</TableCell>
                          <TableCell>{formatDate(c.endDate)}</TableCell>
                          <TableCell>
                            <Badge variant={c.status === "Active" ? "default" : "secondary"}>
                              {c.status === "Active" ? "Hiệu lực" : "Hết hạn"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    Chưa có hợp đồng nào
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Modal xem hoặc tạo hợp đồng sẽ đặt ở đây */}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

export default function Profile() {
  return (
    <DndProvider backend={HTML5Backend}>
      <ProfileContent />
    </DndProvider>
  );
}

