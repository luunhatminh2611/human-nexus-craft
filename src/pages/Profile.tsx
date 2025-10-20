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
} from 'lucide-react';

export default function Profile() {
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="info">Thông tin</TabsTrigger>
            <TabsTrigger value="work">Công việc</TabsTrigger>
            <TabsTrigger value="training">Đào tạo & Bậc</TabsTrigger>
            <TabsTrigger value="salary">Lương</TabsTrigger>
            <TabsTrigger value="medical">Y tế</TabsTrigger>
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
                    <p className="text-sm text-muted-foreground mb-3">
                      Mức lương: {formatCurrency(grade?.minSalary || 0)} -{' '}
                      {formatCurrency(grade?.maxSalary || 0)}
                    </p>
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
                    <span className="text-sm font-semibold">{Math.round(trainingProgress)}%</span>
                  </div>
                  <Progress value={trainingProgress} className="mb-4" />

                  <div className="space-y-3">
                    <p className="text-sm font-semibold">
                      Đào tạo đã hoàn thành ({completedTrainings.length})
                    </p>
                    {completedTrainings.map((training) => (
                      <div key={training.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="p-2 rounded-full bg-success/10">
                          <GraduationCap className="h-4 w-4 text-success" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{training.title}</p>
                          <p className="text-xs text-muted-foreground">{training.durationDays} ngày</p>
                        </div>
                        <Badge variant="default" className="bg-success">
                          Hoàn thành
                        </Badge>
                      </div>
                    ))}
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
            <Card>
              <CardHeader>
                <CardTitle>Thông tin lương</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Lương cơ bản</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(employee.salary.base)}
                  </p>
                </div>

                {employee.salary.allowances && (
                  <div className="pt-4 border-t">
                    <p className="text-sm font-semibold mb-3">Phụ cấp</p>
                    <div className="space-y-2">
                      {Object.entries(employee.salary.allowances).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-sm capitalize">{key}</span>
                          <span className="font-medium">{formatCurrency(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Tổng thu nhập</span>
                    <span className="text-xl font-bold text-success">
                      {formatCurrency(
                        employee.salary.base +
                          Object.values(employee.salary.allowances || {}).reduce(
                            (a, b) => a + b,
                            0
                          )
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Medical */}
          <TabsContent value="medical" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-destructive" />
                  Hồ sơ y tế (EHR)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {medicalRecord ? (
                  <>
                    {/* Allergies */}
                    <div>
                      <h3 className="font-semibold mb-2">Dị ứng</h3>
                      {medicalRecord.allergies.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {medicalRecord.allergies.map((allergy, idx) => (
                            <Badge key={idx} variant="destructive">
                              {allergy}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Không có</p>
                      )}
                    </div>

                    {/* Conditions */}
                    <div className="border-t pt-4">
                      <h3 className="font-semibold mb-2">Tình trạng sức khỏe</h3>
                      {medicalRecord.conditions.length > 0 ? (
                        <div className="space-y-2">
                          {medicalRecord.conditions.map((condition, idx) => (
                            <div key={idx} className="p-3 border rounded-lg">
                              <p className="font-medium">{condition.display}</p>
                              {condition.note && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {condition.note}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Không có</p>
                      )}
                    </div>

                    {/* Immunizations */}
                    <div className="border-t pt-4">
                      <h3 className="font-semibold mb-2">Tiêm chủng</h3>
                      {medicalRecord.immunizations.length > 0 ? (
                        <div className="space-y-2">
                          {medicalRecord.immunizations.map((imm, idx) => (
                            <div key={idx} className="flex justify-between p-3 border rounded-lg">
                              <div>
                                <p className="font-medium">{imm.vaccine}</p>
                                <p className="text-sm text-muted-foreground">{imm.provider}</p>
                              </div>
                              <p className="text-sm">
                                {new Date(imm.date).toLocaleDateString('vi-VN')}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Không có dữ liệu</p>
                      )}
                    </div>

                    {/* Observations */}
                    {medicalRecord.observations.length > 0 && (
                      <div className="border-t pt-4">
                        <h3 className="font-semibold mb-2">Chỉ số sức khỏe</h3>
                        <div className="grid md:grid-cols-2 gap-3">
                          {medicalRecord.observations.map((obs, idx) => (
                            <div key={idx} className="p-3 border rounded-lg">
                              <p className="text-sm text-muted-foreground">{obs.type}</p>
                              <p className="text-lg font-bold">
                                {obs.value} {obs.unit}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(obs.date).toLocaleDateString('vi-VN')}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Visits */}
                    {medicalRecord.visits.length > 0 && (
                      <div className="border-t pt-4">
                        <h3 className="font-semibold mb-2">Lịch sử khám</h3>
                        <div className="space-y-2">
                          {medicalRecord.visits.map((visit, idx) => (
                            <div key={idx} className="p-4 border rounded-lg">
                              <div className="flex justify-between mb-2">
                                <span className="font-medium">{visit.reason}</span>
                                <span className="text-sm text-muted-foreground">
                                  {new Date(visit.date).toLocaleDateString('vi-VN')}
                                </span>
                              </div>
                              {visit.diagnosis && (
                                <p className="text-sm">
                                  <span className="font-medium">Chẩn đoán:</span> {visit.diagnosis}
                                </p>
                              )}
                              {visit.notes && (
                                <p className="text-sm text-muted-foreground mt-1">{visit.notes}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Chưa có hồ sơ y tế
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
