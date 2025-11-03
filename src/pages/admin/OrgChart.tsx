import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import mockData from '@/mock/data';
import { Users, User, Building2, Edit, Trash2, Plus, UserCog } from 'lucide-react';

export default function OrgChart() {
  const toast = ({ title, description }) => alert(`${title}\n${description}`);

  const [departments, setDepartments] = useState(
    mockData.departments.map((d) => ({ ...d, id: String(d.id) }))
  );

  const emptyForm = { name: '', parentId: '' };
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [form, setForm] = useState(emptyForm);
  const [editingDept, setEditingDept] = useState(null);

  useEffect(() => {
    setDepartments((prev) =>
      prev.map((d) => ({
        ...d,
        id: String(d.id),
        parentId: d.parentId ? String(d.parentId) : null,
      }))
    );
  }, []);

  const countEmployees = (deptId) =>
    mockData.employees.filter(
      (e) => String(e.departmentId) === String(deptId) && e.status !== 'Resigned'
    ).length;

  const handleAddDepartment = () => {
    const name = (form.name || '').trim();
    const parentId = form.parentId === 'none' || !form.parentId ? null : form.parentId;

    if (!name) return toast({ title: 'Lỗi', description: 'Vui lòng nhập tên phòng ban' });

    const exists = departments.some(
      (d) => d.name.toLowerCase() === name.toLowerCase() && (d.parentId || null) === parentId
    );
    if (exists) return toast({ title: 'Lỗi', description: 'Phòng ban đã tồn tại' });

    const newDept = {
      id: Date.now().toString(),
      name,
      parentId,
      managerId: null,
    };

    setDepartments((prev) => [...prev, newDept]);
    setForm(emptyForm);
    setAddOpen(false);
    toast({ title: 'Thành công', description: `Đã thêm phòng ban "${name}"` });
  };

  const openEditModal = (dept) => {
    setEditingDept(dept);
    setForm({
      name: dept.name,
      parentId: dept.parentId || '',
    });
    setEditOpen(true);
  };

  const handleSaveEdit = () => {
    const name = (form.name || '').trim();
    const parentId = form.parentId === 'none' || !form.parentId ? null : form.parentId;

    if (!name) return toast({ title: 'Lỗi', description: 'Vui lòng nhập tên phòng ban' });
    if (editingDept && editingDept.id === parentId)
      return toast({ title: 'Lỗi', description: 'Không thể chọn chính phòng ban làm phòng ban cha' });

    setDepartments((prev) =>
      prev.map((d) => (d.id === editingDept.id ? { ...d, name, parentId } : d))
    );
    setEditOpen(false);
    setEditingDept(null);
    setForm(emptyForm);
    toast({ title: 'Thành công', description: 'Cập nhật phòng ban thành công' });
  };

  const openDeleteConfirm = (dept) => {
    setEditingDept(dept);
    setDeleteOpen(true);
  };

  const handleDelete = () => {
    if (!editingDept) return;

    setDepartments((prev) =>
      prev
        .filter((d) => d.id !== editingDept.id)
        .map((d) => (d.parentId === editingDept.id ? { ...d, parentId: null } : d))
    );

    setDeleteOpen(false);
    toast({ title: 'Đã xóa', description: `Đã xóa ${editingDept.name}` });
    setEditingDept(null);
  };

  // Build organizational structure
  const rootDept = departments.find((d) => !d.parentId);
  const childDepts = departments.filter((d) => d.parentId === rootDept?.id);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Sơ đồ tổ chức</h1>
          <p className="text-muted-foreground">Cơ cấu phòng ban và nhân sự</p>
        </div>

        {/* Organizational Chart */}
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-8">
              {/* Root Department */}
              {rootDept && (
                <div className="flex flex-col items-center">
                  <div className="bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary rounded-lg p-6 min-w-[280px] shadow-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <Building2 className="h-6 w-6 text-primary" />
                      <h3 className="font-bold text-lg">{rootDept.name}</h3>
                    </div>
                    {mockData.employees.find((e) => e.id === rootDept.managerId) && (
                      <div className="space-y-1 mb-2">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-primary" />
                          <span className="font-medium">
                            Giám đốc: {mockData.employees.find((e) => e.id === rootDept.managerId)?.firstName}{' '}
                            {mockData.employees.find((e) => e.id === rootDept.managerId)?.lastName}
                          </span>
                        </div>
                        {rootDept.deputyDirectorId && mockData.employees.find((e) => e.id === rootDept.deputyDirectorId) && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <UserCog className="h-4 w-4" />
                            <span>
                              Phó giám đốc: {mockData.employees.find((e) => e.id === rootDept.deputyDirectorId)?.firstName}{' '}
                              {mockData.employees.find((e) => e.id === rootDept.deputyDirectorId)?.lastName}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{countEmployees(rootDept.id)} nhân viên</span>
                    </div>
                  </div>

                  {/* Connector Line */}
                  {childDepts.length > 0 && (
                    <div className="w-0.5 h-12 bg-gradient-to-b from-primary to-primary/50"></div>
                  )}
                </div>
              )}

              {/* Child Departments */}
              {childDepts.length > 0 && (
                <div className="relative">
                  {/* Horizontal Line */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary/30" style={{ top: '-24px' }}></div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
                    {childDepts.map((dept) => {
                      const manager = mockData.employees.find((e) => e.id === dept.managerId);
                      const deputyManager = dept.deputyManagerId
                        ? mockData.employees.find((e) => e.id === dept.deputyManagerId)
                        : null;
                      const empCount = countEmployees(dept.id);

                      return (
                        <div key={dept.id} className="flex flex-col items-center">
                          {/* Vertical connector */}
                          <div className="w-0.5 h-6 bg-primary/30 mb-2"></div>

                          <div className="bg-card border-2 border-border hover:border-primary/50 rounded-lg p-5 min-w-[240px] shadow-md transition-all hover:shadow-lg">
                            <div className="flex items-center gap-2 mb-3">
                              <Building2 className="h-5 w-5 text-primary" />
                              <h4 className="font-semibold text-base">{dept.name}</h4>
                            </div>
                            {manager && (
                              <div className="space-y-1 mb-2">
                                <div className="flex items-center gap-2 text-sm">
                                  <User className="h-3.5 w-3.5 text-primary" />
                                  <span className="text-muted-foreground">
                                    TP: {manager.firstName} {manager.lastName}
                                  </span>
                                </div>
                                {deputyManager && (
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <UserCog className="h-3 w-3" />
                                    <span>
                                      Phó: {deputyManager.firstName} {deputyManager.lastName}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Users className="h-3.5 w-3.5" />
                              <span>{empCount} nhân viên</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Department List Table */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Danh sách phòng ban</h2>
          <Button
            onClick={() => {
              setForm(emptyForm);
              setAddOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm phòng ban
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border">
                <thead className="bg-muted text-left">
                  <tr>
                    <th className="p-3 border">Tên phòng ban</th>
                    <th className="p-3 border">Phòng ban cha</th>
                    <th className="p-3 border">Trưởng phòng</th>
                    <th className="p-3 border">Phó phòng</th>
                    <th className="p-3 border text-center">Số nhân viên</th>
                    <th className="p-3 border text-center w-[120px]">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.length > 0 ? (
                    departments.map((dept) => {
                      const manager = mockData.employees.find(
                        (e) => String(e.id) === String(dept.managerId)
                      );
                      const deputyManager = dept.deputyManagerId
                        ? mockData.employees.find((e) => String(e.id) === String(dept.deputyManagerId))
                        : null;
                      const deputy = dept.deputyDirectorId
                        ? mockData.employees.find((e) => String(e.id) === String(dept.deputyDirectorId))
                        : null;
                      const parentDept = departments.find((d) => d.id === dept.parentId);

                      return (
                        <tr key={dept.id} className="hover:bg-muted/40">
                          <td className="p-3 border font-medium">{dept.name}</td>
                          <td className="p-3 border">
                            {parentDept ? (
                              parentDept.name
                            ) : (
                              <span className="text-muted-foreground italic">(Phòng gốc)</span>
                            )}
                          </td>
                          <td className="p-3 border">
                            {manager ? (
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-primary" />
                                  <span>
                                    {manager.firstName} {manager.lastName}
                                  </span>
                                </div>
                                {deputy && (
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <UserCog className="w-3 h-3" />
                                    <span>
                                      Phó GĐ: {deputy.firstName} {deputy.lastName}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground italic">
                                Chưa có trưởng phòng
                              </span>
                            )}
                          </td>
                          <td className="p-3 border">
                            {deputyManager ? (
                              <div className="flex items-center gap-2">
                                <UserCog className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">
                                  {deputyManager.firstName} {deputyManager.lastName}
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground italic text-sm">-</span>
                            )}
                          </td>
                          <td className="p-3 border text-center">
                            <Badge variant="secondary" className="flex items-center gap-1 justify-center w-fit mx-auto">
                              <Users className="h-3 w-3" />
                              {countEmployees(dept.id)}
                            </Badge>
                          </td>
                          <td className="p-3 border text-center">
                            <div className="flex justify-center gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => openEditModal(dept)}
                                className="h-7 w-7"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="destructive"
                                onClick={() => openDeleteConfirm(dept)}
                                className="h-7 w-7"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center p-4 text-muted-foreground">
                        Không có phòng ban nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Dialog Add Department */}
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm phòng ban mới</DialogTitle>
              <DialogDescription>Nhập tên và chọn phòng ban cha (nếu có).</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 mt-2">
              <div>
                <Label>Tên phòng ban</Label>
                <Input
                  placeholder="VD: Kỹ thuật"
                  value={form.name}
                  onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                />
              </div>
              <div>
                <Label>Phòng ban cha (tùy chọn)</Label>
                <Select
                  value={form.parentId || 'none'}
                  onValueChange={(v) =>
                    setForm((s) => ({ ...s, parentId: v === 'none' ? '' : v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Không chọn (là phòng ban cha)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không chọn (phòng ban gốc)</SelectItem>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setAddOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleAddDepartment}>Thêm</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog Edit Department */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Chỉnh sửa phòng ban</DialogTitle>
              <DialogDescription>Chỉnh sửa tên hoặc phòng ban cha.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 mt-2">
              <div>
                <Label>Tên phòng ban</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                />
              </div>
              <div>
                <Label>Phòng ban cha (tùy chọn)</Label>
                <Select
                  value={form.parentId || 'none'}
                  onValueChange={(v) =>
                    setForm((s) => ({ ...s, parentId: v === 'none' ? '' : v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Không chọn (phòng ban gốc)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không chọn (phòng ban gốc)</SelectItem>
                    {departments
                      .filter((d) => d.id !== editingDept?.id)
                      .map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditOpen(false);
                    setEditingDept(null);
                  }}
                >
                  Hủy
                </Button>
                <Button onClick={handleSaveEdit}>Lưu</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog Delete Department */}
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xóa phòng ban</DialogTitle>
              <DialogDescription>
                Bạn có chắc muốn xóa{' '}
                <span className="font-semibold">{editingDept?.name}</span>? Các phòng con sẽ được
                đưa lên cấp gốc.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                Hủy
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Xóa
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
