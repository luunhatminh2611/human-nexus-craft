import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import mockData from '@/mock/data';
import { BookOpen, Clock, Plus, Edit, Trash2, UserPlus, Eye } from 'lucide-react';
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
import { useState } from 'react';
import { toast } from 'sonner';
import { X } from 'lucide-react';

export default function Training() {
  const navigate = useNavigate();
  const { role } = useAuthStore();

  // Lọc khóa học chờ duyệt cho admin
  const pendingTrainings = mockData.trainings.filter(t => t.approvalStatus === 'Pending');
  const approvedTrainings = mockData.trainings.filter(t => t.approvalStatus === 'Approved');
  
  const handleApprove = (trainingId: string) => {
    const training = mockData.trainings.find(t => t.id === trainingId);
    if (training) {
      training.approvalStatus = 'Approved';
      training.approvedBy = 'emp001'; // Admin ID
      training.approvedDate = new Date().toISOString().split('T')[0];
      toast.success('Đã duyệt khóa học');
    }
  };

  const handleReject = (trainingId: string) => {
    const training = mockData.trainings.find(t => t.id === trainingId);
    if (training) {
      training.approvalStatus = 'Rejected';
      training.approvedBy = 'emp001';
      training.approvedDate = new Date().toISOString().split('T')[0];
      toast.success('Đã từ chối khóa học');
    }
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

  const getCourseTypeName = (type: string) => {
    return type === 'year' ? 'Năm' : type === 'quarter' ? 'Quý' : 'Tháng';
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Duyệt đào tạo</h1>
            <p className="text-muted-foreground">Duyệt khóa học do Trưởng phòng tạo</p>
          </div>
        </div>

        {/* Training Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Chờ duyệt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{pendingTrainings.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Đã duyệt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{approvedTrainings.length}</div>
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
                {mockData.trainings.filter((t) => t.status === 'Ongoing').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Hoàn thành
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockData.trainings.filter((t) => t.status === 'Completed').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Trainings */}
        {pendingTrainings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Khóa học chờ duyệt</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Khóa học</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead>Phòng ban</TableHead>
                    <TableHead>Người tạo</TableHead>
                    <TableHead>Thời lượng</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingTrainings.map((training) => {
                    const creator = mockData.employees.find(e => e.id === training.createdBy);
                    const department = mockData.departments.find(d => d.id === training.departmentId);
                    return (
                      <TableRow key={training.id}>
                        <TableCell>
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-warning/10">
                              <BookOpen className="h-4 w-4 text-warning" />
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
                        <TableCell>{department?.name}</TableCell>
                        <TableCell>{creator?.firstName} {creator?.lastName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{training.durationDays} ngày</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleApprove(training.id)}
                            >
                              Duyệt
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleReject(training.id)}
                            >
                              Từ chối
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Approved Trainings */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách khóa học đã duyệt</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Khóa học</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Phòng ban</TableHead>
                  <TableHead>Thời lượng</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvedTrainings.map((training) => {
                  const department = mockData.departments.find(d => d.id === training.departmentId);
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
                      <TableCell>{department?.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{training.durationDays} ngày</span>
                        </div>
                      </TableCell>
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
    </Layout>
  );
}
