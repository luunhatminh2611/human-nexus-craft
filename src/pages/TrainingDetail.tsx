import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuthStore } from '@/store/authStore';
import mockData from '@/mock/data';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, Users, User } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useState } from 'react';
import { toast } from 'sonner';

export default function TrainingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role, employeeId } = useAuthStore();
  const [enrolling, setEnrolling] = useState(false);

  const training = mockData.trainings.find((t) => t.id === id);
  if (!training) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Không tìm thấy khóa đào tạo</p>
          <Button onClick={() => navigate('/training')} className="mt-4">
            Quay lại
          </Button>
        </div>
      </Layout>
    );
  }

  const enrollments = mockData.trainingEnrollments.filter((e) => e.trainingId === id);
  const enrolledEmployees = enrollments.map((enrollment) => {
    const emp = mockData.employees.find((e) => e.id === enrollment.employeeId);
    const dept = mockData.departments.find((d) => d.id === emp?.departmentId);
    return { ...enrollment, employee: emp, department: dept };
  });

  const isEnrolled = enrollments.some((e) => e.employeeId === employeeId);
  const canEnroll = role === 'Employee' && !isEnrolled && training.status !== 'Completed';
  const currentEnrollment = enrollments.find((e) => e.employeeId === employeeId);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      Completed: 'default',
      Ongoing: 'secondary',
      Upcoming: 'outline',
    };
    return (
      <Badge variant={variants[status] || 'outline'}>
        {status === 'Completed'
          ? 'Hoàn thành'
          : status === 'Ongoing'
          ? 'Đang diễn ra'
          : 'Sắp tới'}
      </Badge>
    );
  };

  const getEnrollmentStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
      Completed: 'default',
      'In Progress': 'secondary',
      Enrolled: 'outline',
      Cancelled: 'destructive',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const handleEnroll = () => {
    setEnrolling(true);
    // Simulate enrollment
    setTimeout(() => {
      setEnrolling(false);
      toast.success('Ghi danh thành công!');
      navigate('/training');
    }, 1000);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/training')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{training.title}</h1>
              {getStatusBadge(training.status)}
            </div>
            <p className="text-muted-foreground mt-1">{training.description}</p>
          </div>
          {canEnroll && (
            <Button onClick={handleEnroll} disabled={enrolling}>
              {enrolling ? 'Đang ghi danh...' : 'Ghi danh ngay'}
            </Button>
          )}
          {isEnrolled && (
            <Badge variant="default" className="text-base px-4 py-2">
              Đã ghi danh
            </Badge>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Thời lượng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{training.durationDays} ngày</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Học viên
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {enrollments.length}
                {training.maxParticipants && (
                  <span className="text-sm text-muted-foreground font-normal">
                    {' '}
                    / {training.maxParticipants}
                  </span>
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                Giảng viên
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">{training.instructor || 'Chưa có'}</p>
            </CardContent>
          </Card>
        </div>

        {training.location && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Địa điểm
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base">{training.location}</p>
            </CardContent>
          </Card>
        )}

        {training.deadline && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Hạn chót
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base">
                {new Date(training.deadline).toLocaleDateString('vi-VN')}
              </p>
            </CardContent>
          </Card>
        )}

        {currentEnrollment && (
          <Card>
            <CardHeader>
              <CardTitle>Tiến độ học tập của bạn</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Trạng thái</span>
                {getEnrollmentStatusBadge(currentEnrollment.status)}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tiến độ</span>
                  <span className="font-semibold">{currentEnrollment.progress}%</span>
                </div>
                <Progress value={currentEnrollment.progress} />
              </div>
              {currentEnrollment.completionDate && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Ngày hoàn thành</span>
                  <span className="text-sm font-medium">
                    {new Date(currentEnrollment.completionDate).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {(role === 'Admin' || role === 'Manager') && (
          <Card>
            <CardHeader>
              <CardTitle>Danh sách học viên ({enrolledEmployees.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {enrolledEmployees.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nhân viên</TableHead>
                      <TableHead>Phòng ban</TableHead>
                      <TableHead>Ngày ghi danh</TableHead>
                      <TableHead>Tiến độ</TableHead>
                      <TableHead>Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrolledEmployees.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {item.employee?.firstName} {item.employee?.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {item.employee?.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{item.department?.name}</TableCell>
                        <TableCell>
                          {new Date(item.enrolledDate).toLocaleDateString('vi-VN')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={item.progress} className="w-20" />
                            <span className="text-sm">{item.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{getEnrollmentStatusBadge(item.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Chưa có học viên nào ghi danh
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
