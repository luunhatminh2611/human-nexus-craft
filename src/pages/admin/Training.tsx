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
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedTrainingId, setSelectedTrainingId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

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

  const handleAssignTraining = (trainingId: string) => {
    setSelectedTrainingId(trainingId);
    setSelectedEmployees([]);
    setSearchQuery('');
    setAssignDialogOpen(true);
  };

  const handleSelectEmployee = (employeeId: string) => {
    if (!selectedEmployees.includes(employeeId)) {
      setSelectedEmployees([...selectedEmployees, employeeId]);
      setSearchQuery('');
    }
  };

  const handleRemoveEmployee = (employeeId: string) => {
    setSelectedEmployees(selectedEmployees.filter(id => id !== employeeId));
  };

  const handleConfirmAssign = () => {
    if (selectedEmployees.length === 0) {
      toast.error('Vui lòng chọn ít nhất một nhân viên');
      return;
    }
    toast.success(`Đã giao khóa học cho ${selectedEmployees.length} nhân viên`);
    setAssignDialogOpen(false);
    setSelectedEmployees([]);
  };

  const filteredEmployees = mockData.employees.filter(emp => {
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase()) || emp.email.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Quản lý đào tạo</h1>
            <p className="text-muted-foreground">Chương trình đào tạo và phát triển</p>
          </div>
          {role === 'Admin' && (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Tạo khóa học mới
            </Button>
          )}
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
              <div className="text-2xl font-bold">{mockData.trainings.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Đang diễn ra
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
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
              <div className="text-2xl font-bold text-success">
                {mockData.trainings.filter((t) => t.status === 'Completed').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Sắp tới
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {mockData.trainings.filter((t) => t.status === 'Upcoming').length}
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
                  <TableHead>Thời lượng</TableHead>
                  <TableHead>Học viên</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockData.trainings.map((training) => {
                  const enrollments = mockData.trainingEnrollments.filter(
                    (e) => e.trainingId === training.id
                  );
                  
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
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{training.durationDays} ngày</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{enrollments.length}</span> học viên
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
                          {role === 'Admin' && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleAssignTraining(training.id)}
                              >
                                <UserPlus className="h-4 w-4" />
                              </Button>
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
              <Label htmlFor="title">Tên khóa học</Label>
              <Input id="title" placeholder="Nhập tên khóa học" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea id="description" placeholder="Nhập mô tả khóa học" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="duration">Thời lượng (ngày)</Label>
                <Input id="duration" type="number" placeholder="5" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="instructor">Giảng viên</Label>
                <Input id="instructor" placeholder="Tên giảng viên" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={() => {
              toast.success('Đã tạo khóa học mới');
              setCreateDialogOpen(false);
            }}>
              Tạo khóa học
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Training Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Giao khóa học cho nhân viên</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Selected Employees Tags */}
            {selectedEmployees.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
                {selectedEmployees.map(empId => {
                  const emp = mockData.employees.find(e => e.id === empId);
                  return (
                    <Badge key={empId} variant="secondary" className="pl-3 pr-1 py-1">
                      {emp?.firstName} {emp?.lastName}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1 hover:bg-transparent"
                        onClick={() => handleRemoveEmployee(empId)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  );
                })}
              </div>
            )}

            {/* Search Input */}
            <div className="grid gap-2">
              <Label htmlFor="search">Tìm kiếm nhân viên</Label>
              <Input
                id="search"
                placeholder="Nhập tên hoặc email nhân viên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Search Results */}
            {searchQuery && (
              <div className="border rounded-lg max-h-60 overflow-y-auto">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map(emp => (
                    <div
                      key={emp.id}
                      className={`p-3 hover:bg-muted cursor-pointer border-b last:border-b-0 ${
                        selectedEmployees.includes(emp.id) ? 'bg-muted' : ''
                      }`}
                      onClick={() => handleSelectEmployee(emp.id)}
                    >
                      <p className="font-medium">{emp.firstName} {emp.lastName}</p>
                      <p className="text-sm text-muted-foreground">{emp.email}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    Không tìm thấy nhân viên
                  </p>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleConfirmAssign}>
              Giao cho {selectedEmployees.length} nhân viên
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
