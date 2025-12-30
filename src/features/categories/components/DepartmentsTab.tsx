import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/dialog';
import { unitApi } from '@/features/departments/api/departmentApi';
import mockData from '@/mock/data';
import { Users, User, Building2, Edit, Trash2, Plus, UserCog, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/shared/components/ui/button/Button2';
import { DepartmentFormModal } from '../../departments/components/DepartmentModal';

export default function DepartmentTabs() {
  const toast = ({ title, description }) => alert(`${title}\n${description}`);

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [expandedDepts, setExpandedDepts] = useState(new Set());

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);

  // Fetch departments từ API
  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const data = await unitApi.getAll();
      console.log('Raw data from API:', data);
      const formattedData = data.map((d) => ({
        id: String(d.id),
        name: d.name,
        code: d.code,
        departmentType: d.departmentType ? {
          id: d.departmentType.id,
          code: d.departmentType.code,
          name: d.departmentType.name,
          description: d.departmentType.description,
          isActive: d.departmentType.isActive
        } : null,
        parent: d.parent?.id ? String(d.parent.id) : null,
        parentId: d.parent?.id ? String(d.parent.id) : null,
      }));
      console.log('Formatted data:', formattedData);
      setDepartments(formattedData);

      // Tự động expand tất cả departments ban đầu
      setExpandedDepts(new Set(formattedData.map(d => d.id)));
    } catch (error) {
      toast({ title: 'Lỗi', description: 'Không thể tải danh sách phòng ban' });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const countEmployees = (deptId) =>
    mockData.employees.filter(
      (e) => String(e.departmentId) === String(deptId) && e.status !== 'Resigned'
    ).length;

  const openAddModal = () => {
    setEditingDept(null);
    setFormModalOpen(true);
  };

  const openEditModal = (dept) => {
    console.log('Opening edit modal with dept:', dept);
    setEditingDept(dept);
    setFormModalOpen(true);
  };

  const openDeleteConfirm = (dept) => {
    setEditingDept(dept);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!editingDept) return;

    try {
      setSubmitting(true);
      await unitApi.delete(Number(editingDept.id));
      await fetchDepartments();
      setDeleteOpen(false);
      toast({ title: 'Đã xóa', description: `Đã xóa ${editingDept.name}` });
      setEditingDept(null);
    } catch (error) {
      toast({ title: 'Lỗi', description: 'Không thể xóa phòng ban' });
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleExpand = (deptId) => {
    setExpandedDepts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(deptId)) {
        newSet.delete(deptId);
      } else {
        newSet.add(deptId);
      }
      return newSet;
    });
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Department List Table */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Danh sách phòng ban</h2>
        <Button onClick={openAddModal}>
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
                  <th className="p-3 border">Mã phòng ban</th>
                  <th className="p-3 border">Tên phòng ban</th>
                  <th className="p-3 border">Loại phòng ban</th>
                  <th className="p-3 border">Phòng ban gốc</th>
                  <th className="p-3 border text-center">Số nhân viên</th>
                  <th className="p-3 border text-center w-[120px]">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {departments.length > 0 ? (
                  departments.map((dept) => {
                    const parentDept = departments.find((d) => d.id === dept.parentId);
                    
                    return (
                      <tr key={dept.id} className="hover:bg-muted/40">
                        <td className="p-3 border text-sm text-muted-foreground">{dept.code || '-'}</td>
                        <td className="p-3 border font-medium">{dept.name}</td>
                        <td className="p-3 border">
                          {dept.departmentType ? (
                            <div className="flex flex-col gap-1">
                              <Badge variant="outline" className="w-fit">
                                {dept.departmentType.name}
                              </Badge>
                            </div>
                          ) : (
                            <span className="text-muted-foreground italic">-</span>
                          )}
                        </td>
                        <td className="p-3 border">
                          {parentDept ? (
                            parentDept.name
                          ) : (
                            <span className="text-muted-foreground italic">(Phòng ban gốc)</span>
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

      {/* Modal Add/Edit Department */}
      <DepartmentFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        editingDept={editingDept}
        departments={departments}
        onSuccess={fetchDepartments}
        onError={toast}
      />

      {/* Dialog Delete Department */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa phòng ban</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn xóa <span className="font-semibold">{editingDept?.name}</span>? Hành động này không thể
              hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={submitting}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Xóa
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}