import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Target } from 'lucide-react';
import mockData, { KPI } from '@/mock/data';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

export default function ManagerKPIManagement() {
  const { role, employeeId } = useAuthStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingKPI, setEditingKPI] = useState<KPI | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');

  const currentUser = mockData.employees.find(e => e.id === employeeId);

  // Manager chỉ giao KPI cho nhân viên trong phòng của mình
  const assignableEmployees = mockData.employees.filter(e => 
    e.departmentId === currentUser?.departmentId && 
    e.id !== employeeId &&
    !e.position.includes('Trưởng phòng')
  );

  // Lấy KPI đã giao
  const assignedKPIs = mockData.kpis?.filter(k => k.assignedBy === employeeId) || [];

  const [formData, setFormData] = useState({
    kpiName: '',
    description: '',
    target: 0,
    unit: '',
    startDate: '',
    endDate: '',
  });

  const handleOpenDialog = (kpi?: KPI) => {
    if (kpi) {
      setEditingKPI(kpi);
      setSelectedEmployee(kpi.employeeId);
      setFormData({
        kpiName: kpi.kpiName,
        description: kpi.description,
        target: kpi.target,
        unit: kpi.unit,
        startDate: kpi.startDate,
        endDate: kpi.endDate,
      });
    } else {
      setEditingKPI(null);
      setSelectedEmployee('');
      setFormData({
        kpiName: '',
        description: '',
        target: 0,
        unit: '',
        startDate: '',
        endDate: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSaveKPI = () => {
    if (!selectedEmployee || !formData.kpiName || !formData.target) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const employee = mockData.employees.find(e => e.id === selectedEmployee);

    if (editingKPI) {
      const index = mockData.kpis?.findIndex(k => k.id === editingKPI.id);
      if (index !== undefined && index !== -1 && mockData.kpis) {
        mockData.kpis[index] = {
          ...editingKPI,
          ...formData,
          employeeId: selectedEmployee,
        };
      }
      toast.success('Đã cập nhật KPI');
    } else {
      const newKPI: KPI = {
        id: `kpi${Date.now()}`,
        employeeId: selectedEmployee,
        assignedBy: employeeId || '',
        assignedByName: `${currentUser?.firstName} ${currentUser?.lastName}`,
        ...formData,
        status: 'Đã giao',
      };
      
      if (!mockData.kpis) mockData.kpis = [];
      mockData.kpis.push(newKPI);
      toast.success(`Đã giao KPI cho ${employee?.firstName} ${employee?.lastName}`);
    }

    setIsDialogOpen(false);
  };

  const handleDeleteKPI = (kpiId: string) => {
    if (confirm('Bạn có chắc muốn xóa KPI này?')) {
      const index = mockData.kpis?.findIndex(k => k.id === kpiId);
      if (index !== undefined && index !== -1 && mockData.kpis) {
        mockData.kpis.splice(index, 1);
        toast.success('Đã xóa KPI');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'Đã giao': 'outline',
      'Đang thực hiện': 'secondary',
      'Hoàn thành': 'default',
      'Chưa đạt': 'destructive',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Quản lý KPI</h1>
            <p className="text-muted-foreground">Giao và theo dõi KPI cho nhân viên</p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Giao KPI mới
          </Button>
        </div>

        {/* KPI Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tổng KPI đã giao
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assignedKPIs.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Đang thực hiện
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">
                {assignedKPIs.filter(k => k.status === 'Đang thực hiện').length}
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
                {assignedKPIs.filter(k => k.status === 'Hoàn thành').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Chưa đạt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {assignedKPIs.filter(k => k.status === 'Chưa đạt').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* KPI Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Danh sách KPI đã giao
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assignedKPIs.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nhân viên</TableHead>
                    <TableHead>KPI</TableHead>
                    <TableHead>Mục tiêu</TableHead>
                    <TableHead>Thực tế</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignedKPIs.map((kpi) => {
                    const employee = mockData.employees.find(e => e.id === kpi.employeeId);
                    return (
                      <TableRow key={kpi.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{employee?.firstName} {employee?.lastName}</p>
                            <p className="text-sm text-muted-foreground">{employee?.position}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{kpi.kpiName}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">{kpi.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>{kpi.target} {kpi.unit}</TableCell>
                        <TableCell>{kpi.actual || 0} {kpi.unit}</TableCell>
                        <TableCell className="text-sm">
                          {new Date(kpi.startDate).toLocaleDateString('vi-VN')} - {new Date(kpi.endDate).toLocaleDateString('vi-VN')}
                        </TableCell>
                        <TableCell>{getStatusBadge(kpi.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDialog(kpi)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteKPI(kpi.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Chưa có KPI nào được giao</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingKPI ? 'Chỉnh sửa KPI' : 'Giao KPI mới'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label>Nhân viên <span className="text-red-500">*</span></Label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn nhân viên" />
                  </SelectTrigger>
                  <SelectContent>
                    {assignableEmployees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} - {emp.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Tên KPI <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="Ví dụ: Doanh số bán hàng"
                  value={formData.kpiName}
                  onChange={(e) => setFormData({ ...formData, kpiName: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label>Mô tả</Label>
                <Textarea
                  placeholder="Mô tả chi tiết về KPI"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Mục tiêu <span className="text-red-500">*</span></Label>
                  <Input
                    type="number"
                    placeholder="100"
                    value={formData.target}
                    onChange={(e) => setFormData({ ...formData, target: Number(e.target.value) })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Đơn vị</Label>
                  <Input
                    placeholder="triệu đồng, đơn hàng, ..."
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Ngày bắt đầu</Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Ngày kết thúc</Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleSaveKPI}>
                {editingKPI ? 'Cập nhật' : 'Giao KPI'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
