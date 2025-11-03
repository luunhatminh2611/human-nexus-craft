import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import mockData from '@/mock/data';
import { BookOpen, Clock, Plus, Edit, Trash2, UserPlus, Eye, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { toast } from 'sonner';

export default function TrainingManagement() {
  const navigate = useNavigate();
  const { role, employeeId } = useAuthStore();
  const currentUser = mockData.employees.find(e => e.id === employeeId);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    durationDays: 1,
    instructor: '',
    courseType: 'month' as 'year' | 'quarter' | 'month',
  });

  // Lọc khóa học theo phòng ban của Trưởng phòng
  const myDepartmentTrainings = mockData.trainings.filter(
    t => t.departmentId === currentUser?.departmentId
  );

  const handleCreateTraining = () => {
    if (!formData.title || !formData.description) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const newTraining = {
      id: `tr${Date.now()}`,
      title: formData.title,
      description: formData.description,
      requiredForGrades: [],
      durationDays: formData.durationDays,
      status: 'Upcoming' as const,
      instructor: formData.instructor,
      courseType: formData.courseType,
      departmentId: currentUser?.departmentId,
      createdBy: employeeId,
      approvalStatus: 'Pending' as const,
    };

    mockData.trainings.push(newTraining);
    toast.success('Đã tạo khóa học. Đang chờ Giám đốc duyệt.');
    setCreateDialogOpen(false);
    setFormData({
      title: '',
      description: '',
      durationDays: 1,
      instructor: '',
      courseType: 'month',
    });
  };

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

  const getApprovalBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      Approved: 'default',
      Pending: 'secondary',
      Rejected: 'destructive',
    };
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status === 'Approved'
          ? 'Đã duyệt'
          : status === 'Pending'
            ? 'Chờ duyệt'
            : 'Từ chối'}
      </Badge>
    );
  };

  const getCourseTypeName = (type: string) => {
    return type === 'year' ? 'Năm' : type === 'quarter' ? 'Quý' : 'Tháng';
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Quản lý đào tạo</h1>
            <p className="text-muted-foreground">Tạo và quản lý khóa học đào tạo cho phòng ban</p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tạo khóa học mới
          </Button>
        </div>

        {/* Training Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tổng khóa học
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myDepartmentTrainings.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Chờ duyệt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {myDepartmentTrainings.filter((t) => t.approvalStatus === 'Pending').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Đã duyệt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {myDepartmentTrainings.filter((t) => t.approvalStatus === 'Approved').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Đang diễn ra
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {myDepartmentTrainings.filter((t) => t.status === 'Ongoing').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Training Table */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách khóa học</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Khóa học</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Thời lượng</TableHead>
                  <TableHead>Trạng thái duyệt</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myDepartmentTrainings.map((training) => {
                  return (
                    <TableRow key={training.id}>
                      <TableCell>
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <BookOpen className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{training.title}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {training.description}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getCourseTypeName(training.courseType)}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{training.durationDays} ngày</span>
                        </div>
                      </TableCell>
                      <TableCell>{getApprovalBadge(training.approvalStatus)}</TableCell>
                      <TableCell>{getStatusBadge(training.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/training/${training.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {training.approvalStatus === 'Pending' && (
                            <>
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Create Training Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tạo khóa học mới</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Tên khóa học <span className="text-red-500">*</span></Label>
              <Input
                id="title"
                placeholder="Nhập tên khóa học"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="courseType">Loại khóa học <span className="text-red-500">*</span></Label>
              <Select
                value={formData.courseType}
                onValueChange={(v: 'year' | 'quarter' | 'month') => setFormData({ ...formData, courseType: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="year">Khóa học năm</SelectItem>
                  <SelectItem value="quarter">Khóa học quý</SelectItem>
                  <SelectItem value="month">Khóa học tháng</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Mô tả <span className="text-red-500">*</span></Label>
              <Textarea
                id="description"
                placeholder="Nhập mô tả khóa học"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="duration">Thời lượng (ngày)</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="5"
                  value={formData.durationDays}
                  onChange={(e) => setFormData({ ...formData, durationDays: Number(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="instructor">Giảng viên</Label>
                <Input
                  id="instructor"
                  placeholder="Tên giảng viên"
                  value={formData.instructor}
                  onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreateTraining}>
              Tạo khóa học
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
