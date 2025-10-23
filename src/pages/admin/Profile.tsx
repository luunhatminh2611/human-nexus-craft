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

function ProfileContent() {
  const { id } = useParams();
  const { employeeId, role } = useAuthStore();

  // Use URL param or current user's ID
  const currentEmpId = id || employeeId;
  const employee = mockData.employees.find((e) => e.id === currentEmpId);

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
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="info">Thông tin</TabsTrigger>
            <TabsTrigger value="work">Công việc</TabsTrigger>
            <TabsTrigger value="training">Đào tạo & Bậc</TabsTrigger>
            <TabsTrigger value="salary">Lương</TabsTrigger>
            <TabsTrigger value="medical">Y tế</TabsTrigger>
            <TabsTrigger value="schedule">Lịch công tác</TabsTrigger>
            <TabsTrigger value="leaves">Đơn nghỉ phép</TabsTrigger>
            <TabsTrigger value="family">Thân nhân</TabsTrigger>
          </TabsList>

          {/* Basic Info */}
          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cơ bản</CardTitle>
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
                </div>

                {employee.documents && employee.documents.length > 0 && (
                  <div className="pt-4 border-t">
                    <p className="text-sm font-semibold mb-3">Tài liệu</p>
                    <div className="space-y-2">
                      {employee.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            <span className="text-sm">{doc.name}</span>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Work Info */}
          <TabsContent value="work" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin công việc</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
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

          {/* Training & Grade */}
          <TabsContent value="training" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Lộ trình đào tạo & Bậc làm việc
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Grade */}
                <div>
                  <h3 className="font-semibold mb-2">Bậc hiện tại</h3>
                  <div className="p-4 bg-primary/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-bold">{grade?.name}</span>
                      <Badge variant="default">{employee.grade}</Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold">Kỹ năng yêu cầu:</p>
                      <div className="flex flex-wrap gap-1">
                        {grade?.requiredSkills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Training Progress */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Tiến độ đào tạo</h3>
                    <span className="text-sm font-semibold">
                      {mockData.trainingEnrollments.filter(e => e.employeeId === employee.id && e.status === 'Completed').length}/{mockData.trainingEnrollments.filter(e => e.employeeId === employee.id).length} khóa học
                    </span>
                  </div>
                  <Progress 
                    value={(mockData.trainingEnrollments.filter(e => e.employeeId === employee.id && e.status === 'Completed').length / Math.max(mockData.trainingEnrollments.filter(e => e.employeeId === employee.id).length, 1)) * 100} 
                    className="mb-4" 
                  />

                  <div className="space-y-3">
                    <p className="text-sm font-semibold">
                      Danh sách khóa học
                    </p>
                    {mockData.trainingEnrollments
                      .filter(e => e.employeeId === employee.id)
                      .map((enrollment) => {
                        const training = mockData.trainings.find(t => t.id === enrollment.trainingId);
                        const getEnrollmentStatusBadge = (status: string) => {
                          const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'outline' | 'destructive', label: string }> = {
                            Assigned: { variant: 'outline', label: 'Đã giao' },
                            'In Progress': { variant: 'secondary', label: 'Đang học' },
                            Completed: { variant: 'default', label: 'Hoàn thành' },
                            Failed: { variant: 'destructive', label: 'Trượt' },
                          };
                          const config = statusConfig[status] || { variant: 'outline', label: status };
                          return <Badge variant={config.variant}>{config.label}</Badge>;
                        };
                        
                        return (
                          <div key={enrollment.id} className="flex items-center gap-3 p-3 border rounded-lg">
                            <div className={`p-2 rounded-full ${
                              enrollment.status === 'Completed' ? 'bg-success/10' : 
                              enrollment.status === 'In Progress' ? 'bg-warning/10' :
                              enrollment.status === 'Failed' ? 'bg-destructive/10' :
                              'bg-muted'
                            }`}>
                              <GraduationCap className={`h-4 w-4 ${
                                enrollment.status === 'Completed' ? 'text-success' :
                                enrollment.status === 'In Progress' ? 'text-warning' :
                                enrollment.status === 'Failed' ? 'text-destructive' :
                                'text-muted-foreground'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{training?.title}</p>
                              <p className="text-xs text-muted-foreground">{training?.durationDays} ngày</p>
                            </div>
                            {getEnrollmentStatusBadge(enrollment.status)}
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Next Grade Requirements */}
                {employee.grade !== 'G3' && (
                  <div className="pt-4 border-t">
                    <h3 className="font-semibold mb-3">Yêu cầu thăng bậc</h3>
                    <div className="p-4 bg-accent rounded-lg space-y-2">
                      <p className="text-sm">
                        Để thăng lên bậc tiếp theo, bạn cần:
                      </p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        <li>Hoàn thành tất cả khóa đào tạo bắt buộc</li>
                        <li>Đạt hiệu suất công việc tốt trong 6 tháng</li>
                        <li>Phát triển đủ kỹ năng chuyên môn</li>
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Salary */}
          <TabsContent value="salary" className="space-y-4">
            <SalaryTabWithDragDrop employee={employee} />
          </TabsContent>

          {/* Medical */}
          <TabsContent value="medical" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-destructive" />
                  Hồ sơ y tế
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {medicalRecord && medicalRecord.status === 'Approved' ? (
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <span className="font-medium text-sm">{medicalRecord.fileUrl}</span>
                      <Badge variant="outline">Đã duyệt</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(medicalRecord.fileUrl, '_blank')}
                      >
                        Xem
                      </Button>
                      <a href={medicalRecord.fileUrl} download>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Chưa có hồ sơ y tế được chấp thuận
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Lịch công tác của nhân viên
                </CardTitle>
              </CardHeader>
              <CardContent>
                {workSchedules.length > 0 ? (
                  <div className="space-y-2">
                    {workSchedules.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-blue-50 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <Clock className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {(s.dayOfWeek)} — {s.startTime}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Map className="h-3 w-3" />
                              {s.shift || 'Không rõ địa điểm'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-6">
                    Nhân viên này chưa có lịch công tác nào.
                  </p>
                )}
              </CardContent>
            </Card>
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

