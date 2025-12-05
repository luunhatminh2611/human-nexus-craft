// src/features/employees/components/TrainingTab.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import Button from '@/shared/components/ui/button/Button';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { Award, GraduationCap, BookOpen, Calendar, CheckCircle, Clock } from 'lucide-react';

export default function TrainingTab({ userData }) {
  // Tính toán tiến độ đào tạo
  const totalCourses = userData.trainingCourses?.length || 0;
  const completedCourses = userData.trainingCourses?.filter(
    (course: any) => course.status === 'Completed'
  ).length || 0;
  const progressPercentage = totalCourses > 0 ? (completedCourses / totalCourses) * 100 : 0;

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
                Chưa có thông tin đào tạo
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
                <p className="text-2xl font-bold">{totalCourses - completedCourses}</p>
                <p className="text-sm text-muted-foreground">Đang học</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danh sách khóa học */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Khóa học đã tham gia
          </CardTitle>
          <Button variant="outline" size="sm">
            Thêm khóa học
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {userData.trainingCourses && userData.trainingCourses.length > 0 ? (
              userData.trainingCourses.map((course: any, index: number) => (
                <div key={index} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{course.name || 'Tên khóa học'}</h3>
                        <Badge
                          variant={
                            course.status === 'Completed'
                              ? 'default'
                              : course.status === 'InProgress'
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {course.status === 'Completed'
                            ? 'Đã hoàn thành'
                            : course.status === 'InProgress'
                            ? 'Đang học'
                            : 'Chưa bắt đầu'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {course.provider || 'Đơn vị cung cấp'}
                      </p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div className="flex items-center gap-1 justify-end">
                        <Calendar className="h-4 w-4" />
                        {course.startDate && course.endDate ? (
                          <span>
                            {new Date(course.startDate).toLocaleDateString('vi-VN')} -{' '}
                            {new Date(course.endDate).toLocaleDateString('vi-VN')}
                          </span>
                        ) : (
                          <span>Chưa xác định</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {course.description && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {course.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <div className="flex items-center gap-4 text-sm">
                      {course.duration && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{course.duration} giờ</span>
                        </div>
                      )}
                      {course.certificate && (
                        <div className="flex items-center gap-1 text-green-600">
                          <Award className="h-4 w-4" />
                          <span>Có chứng chỉ</span>
                        </div>
                      )}
                    </div>
                    {course.score && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Điểm: </span>
                        <span className="font-semibold">{course.score}/100</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Chưa tham gia khóa học nào
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chứng chỉ */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-600" />
            Chứng chỉ & Giấy chứng nhận
          </CardTitle>
          <Button variant="outline" size="sm">
            Thêm chứng chỉ
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {userData.certificates && userData.certificates.length > 0 ? (
              userData.certificates.map((cert: any, index: number) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{cert.name || 'Tên chứng chỉ'}</h3>
                      <p className="text-sm text-muted-foreground">
                        {cert.organization || 'Tổ chức cấp'}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {cert.issueDate
                        ? new Date(cert.issueDate).toLocaleDateString('vi-VN')
                        : 'Chưa rõ ngày'}
                    </Badge>
                  </div>

                  {cert.certificateNumber && (
                    <p className="text-sm text-muted-foreground">
                      Số chứng chỉ: {cert.certificateNumber}
                    </p>
                  )}

                  {cert.expiryDate && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Hết hạn:</span>
                      <Badge
                        variant={
                          new Date(cert.expiryDate) < new Date()
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {new Date(cert.expiryDate).toLocaleDateString('vi-VN')}
                      </Badge>
                    </div>
                  )}

                  {cert.fileUrl && (
                    <Button variant="ghost" size="sm" className="mt-2">
                      Xem chứng chỉ
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Chưa có chứng chỉ nào
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Kỹ năng */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Kỹ năng
          </CardTitle>
          <Button variant="outline" size="sm">
            Thêm kỹ năng
          </Button>
        </CardHeader>
        <CardContent>
          {userData.skills && userData.skills.length > 0 ? (
            <div className="space-y-4">
              {userData.skills.map((skill: any, index: number) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{skill.name || 'Kỹ năng'}</span>
                    <span className="text-sm text-muted-foreground">
                      {skill.level || 'Chưa đánh giá'}
                    </span>
                  </div>
                  <Progress
                    value={
                      skill.proficiency ||
                      (skill.level === 'Expert'
                        ? 100
                        : skill.level === 'Advanced'
                        ? 75
                        : skill.level === 'Intermediate'
                        ? 50
                        : 25)
                    }
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Chưa có thông tin kỹ năng
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}