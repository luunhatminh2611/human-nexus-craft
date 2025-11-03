import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/authStore';
import mockData from '@/mock/data';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, Users, User, PlayCircle, CheckCircle } from 'lucide-react';
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
  const [isTestMode, setIsTestMode] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);

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
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/training')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{training.title}</h1>
              {getStatusBadge(training.status)}
            </div>
            <p className="text-muted-foreground mt-1">{training.description}</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
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

          
          {training.description && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <PlayCircle className="h-4 w-4" />
                  Mô tả khóa học
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-line">
                  {training.description}
                </p>
              </CardContent>
            </Card>
          )}
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

        <Card>
          <CardHeader>
            <CardTitle>Danh sách nhân viên đã được giao ({enrolledEmployees.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {enrolledEmployees.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nhân viên</TableHead>
                    <TableHead>Phòng ban</TableHead>
                    <TableHead>Bậc</TableHead>
                    <TableHead>Ngày giao</TableHead>
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
                        <Badge variant="outline">{item.employee?.grade}</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(item.enrolledDate).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell>{getEnrollmentStatusBadge(item.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Chưa có nhân viên nào được giao
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
