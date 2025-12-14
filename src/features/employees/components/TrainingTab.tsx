// src/features/employees/components/TrainingTab.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import Button from '@/shared/components/ui/button/Button';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { Award, GraduationCap, BookOpen, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { trainingApi } from '../../training/api/trainingApi';
import { Skeleton } from '@/shared/components/ui/skeleton';

interface TrainingTabProps {
  userData: {
    id: number;
    [key: string]: any;
  };
}

export default function TrainingTab({ userData }: TrainingTabProps) {
  const [trainingData, setTrainingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrainingData = async () => {
      if (!userData?.id) return;

      try {
        setLoading(true);
        setError(null);
        const data = await trainingApi.getEmployeeCoursesAdmin(userData.id);
        setTrainingData(data);
      } catch (err: any) {
        console.error('Lỗi khi tải dữ liệu đào tạo:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainingData();
  }, [userData?.id]);

  // Tính toán tiến độ đào tạo
  const courses = trainingData || [];
  const totalCourses = courses.length;
  const completedCourses = courses.filter(
    (course: any) => course.status === 'COMPLETED' || course.assignmentStatus === 'COMPLETED'
  ).length;
  const inProgressCourses = courses.filter(
    (course: any) => course.status === 'IN_PROGRESS' || course.assignmentStatus === 'IN_PROGRESS'
  ).length;
  const progressPercentage = totalCourses > 0 ? (completedCourses / totalCourses) * 100 : 0;

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-24 mb-4" />
              <Skeleton className="h-2 w-full" />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex flex-col items-center justify-center text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <p className="text-destructive font-semibold mb-2">Lỗi tải dữ liệu</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: any }> = {
      'COMPLETED': { label: 'Hoàn thành', variant: 'success' },
      'IN_PROGRESS': { label: 'Đang học', variant: 'warning' },
      'NOT_STARTED': { label: 'Chưa bắt đầu', variant: 'secondary' },
      'ASSIGNED': { label: 'Đã giao', variant: 'default' },
    };

    const statusInfo = statusMap[status] || { label: status, variant: 'default' };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="space-y-4">
      {/* Tổng quan đào tạo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Lộ trình đào tạo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Tiến độ đào tạo</h3>
              <span className="text-sm font-semibold">
                {completedCourses}/{totalCourses} khóa học
              </span>
            </div>
            <Progress value={progressPercentage} className="mb-4" />

            {totalCourses === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Chưa có khóa đào tạo nào được giao
              </p>
            )}
          </div>

          {/* Thống kê nhanh */}
          {totalCourses > 0 && (
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg text-center">
                <BookOpen className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="text-2xl font-bold">{totalCourses}</p>
                <p className="text-sm text-muted-foreground">Tổng khóa học</p>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p className="text-2xl font-bold">{completedCourses}</p>
                <p className="text-sm text-muted-foreground">Đã hoàn thành</p>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-amber-600" />
                <p className="text-2xl font-bold">{inProgressCourses}</p>
                <p className="text-sm text-muted-foreground">Đang học</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danh sách khóa học */}
      {totalCourses > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Danh sách khóa học
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-1">
                        {course.courseTitle}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Phòng ban: {course.departmentName}
                      </p>
                    </div>

                    {getStatusBadge(course.status)}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground text-xs">Ngày bắt đầu</p>
                        <p className="font-medium">
                          {formatDate(course.startDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground text-xs">Hạn hoàn thành</p>
                        <p className="font-medium">
                          {formatDate(course.deadline)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground text-xs">Giao bởi</p>
                        <p className="font-medium">
                          {course.assignedByName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground text-xs">Trạng thái</p>
                        <p className="font-medium">
                          {course.isOverdue ? 'Quá hạn' : 'Đúng hạn'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {course.status === 'IN_PROGRESS' && (
                    <div className="mt-3">
                      <Progress value={0} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}