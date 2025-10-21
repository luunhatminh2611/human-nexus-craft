import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import mockData from '@/mock/data';
import { useAuthStore } from '@/store/authStore';
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Award,
  FileText,
  Download,
  Edit,
  Save,
  X,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function EmployeeProfile() {
  const { employeeId } = useAuthStore();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<any>({});
  
  const employee = mockData.employees.find((e) => e.id === employeeId);
  
  if (!employee) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Không tìm thấy thông tin</h2>
        </div>
      </Layout>
    );
  }

  const department = mockData.departments.find((d) => d.id === employee.departmentId);
  const manager = employee.managerId
    ? mockData.employees.find((e) => e.id === employee.managerId)
    : null;
  const grade = mockData.grades.find((g) => g.id === employee.grade);

  const completedTrainings = mockData.trainings.filter((t) =>
    employee.trainingsCompleted.includes(t.id)
  );
  const requiredTrainings = grade?.requiredTrainings || [];
  const trainingProgress = requiredTrainings.length > 0 
    ? (employee.trainingsCompleted.length / requiredTrainings.length) * 100 
    : 0;

  const handleEdit = () => {
    setEditedData({
      phone: employee.phone,
      address: employee.address,
      dateOfBirth: employee.dateOfBirth,
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    toast({
      title: "Cập nhật thành công",
      description: "Thông tin cá nhân đã được cập nhật",
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData({});
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Thông tin cá nhân</TabsTrigger>
            <TabsTrigger value="work">Công việc & Lộ trình</TabsTrigger>
            <TabsTrigger value="documents">Tài liệu</TabsTrigger>
          </TabsList>

          {/* Personal Info */}
          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Thông tin cơ bản</CardTitle>
                {!isEditing ? (
                  <Button variant="outline" size="sm" onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Chỉnh sửa
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCancel}>
                      <X className="h-4 w-4 mr-2" />
                      Hủy
                    </Button>
                    <Button size="sm" onClick={handleSave}>
                      <Save className="h-4 w-4 mr-2" />
                      Lưu
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Họ và tên</Label>
                    <Input value={`${employee.firstName} ${employee.lastName}`} disabled />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input value={employee.email} disabled />
                  </div>
                  <div>
                    <Label>Số điện thoại</Label>
                    <Input
                      value={isEditing ? editedData.phone : employee.phone}
                      disabled={!isEditing}
                      onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Ngày sinh</Label>
                    <Input
                      type="date"
                      value={isEditing ? editedData.dateOfBirth : employee.dateOfBirth}
                      disabled={!isEditing}
                      onChange={(e) => setEditedData({ ...editedData, dateOfBirth: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Địa chỉ</Label>
                    <Input
                      value={isEditing ? editedData.address : employee.address}
                      disabled={!isEditing}
                      onChange={(e) => setEditedData({ ...editedData, address: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Loại hợp đồng</Label>
                    <Input value={employee.contractType} disabled />
                  </div>
                  <div>
                    <Label>Ngày bắt đầu</Label>
                    <Input
                      value={new Date(employee.startDate).toLocaleDateString('vi-VN')}
                      disabled
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Work & Career Path */}
          <TabsContent value="work" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Thông tin công việc
                </CardTitle>
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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Lộ trình thăng tiến
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
                    <span className="text-sm font-semibold">{Math.round(trainingProgress)}%</span>
                  </div>
                  <Progress value={trainingProgress} className="mb-4" />

                  <div className="space-y-2">
                    <p className="text-sm font-semibold">
                      Đào tạo đã hoàn thành ({completedTrainings.length})
                    </p>
                    {completedTrainings.slice(0, 3).map((training) => (
                      <div key={training.id} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{training.title}</span>
                        <Badge variant="default" className="bg-success">Hoàn thành</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next Grade */}
                {employee.grade !== 'G3' && (
                  <div className="pt-4 border-t">
                    <h3 className="font-semibold mb-3">Yêu cầu thăng bậc</h3>
                    <div className="p-4 bg-accent rounded-lg space-y-2">
                      <p className="text-sm">Để thăng lên bậc tiếp theo, bạn cần:</p>
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

          {/* Documents */}
          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Tài liệu cá nhân
                </CardTitle>
              </CardHeader>
              <CardContent>
                {employee.documents && employee.documents.length > 0 ? (
                  <div className="space-y-2">
                    {employee.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">{doc.name}</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Chưa có tài liệu nào
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
