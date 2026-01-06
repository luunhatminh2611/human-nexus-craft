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
import { DepartmentFormModal } from '../../components/DepartmentModal';

export default function OrgChart() {
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

  // Build organizational structure
  const rootDepartments = departments.filter((d) => !d.parentId);
  const getChildren = (parentId) =>
    departments.filter((d) => d.parentId === parentId);

  // Component đệ quy để render phòng ban và các phòng con
  const DepartmentNode = ({ dept, level = 0, onEdit, onDelete }) => {
    const children = getChildren(dept.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedDepts.has(dept.id);
    const employeeCount = countEmployees(dept.id);

    return (
      <div className="flex flex-col items-center">
        {/* Department Card */}
        <div className={`relative ${level === 0 ? 'bg-primary/10 border-primary' : 'bg-white'} border rounded-xl px-6 py-4 shadow-md text-center min-w-[220px] max-w-[280px]`}>
          <h3 className={`${level === 0 ? 'text-lg' : 'text-base'} font-semibold truncate`}>
            {dept.name}
          </h3>
          <p className="text-xs text-muted-foreground">{dept.code || "—"}</p>

          {/* Loại phòng ban */}
          {dept.departmentType && (
            <div className="mt-1">
              <Badge variant="outline" className="text-xs">
                {dept.departmentType.name}
              </Badge>
            </div>
          )}

          {/* Số nhân viên */}
          <div className="mt-2 flex items-center justify-center gap-1 text-sm text-primary font-medium">
            <Users className="h-4 w-4" />
            {employeeCount}
          </div>

          {/* Expand/Collapse button */}
          {hasChildren && (
            <button
              onClick={() => toggleExpand(dept.id)}
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 p-1 bg-white rounded-full shadow-md hover:bg-muted border z-10"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          )}

          {/* Action buttons */}
          <div className="absolute right-2 top-2 flex gap-1">
            <button
              className="p-1 bg-white rounded-md shadow hover:bg-muted"
              onClick={() => onEdit(dept)}
            >
              <Edit className="h-3 w-3" />
            </button>
            {dept.parentId && (
              <button
                className="p-1 bg-white rounded-md shadow hover:bg-red-100"
                onClick={() => onDelete(dept)}
              >
                <Trash2 className="h-3 w-3 text-red-500" />
              </button>
            )}
          </div>
        </div>

        {/* Children - hiển thị đệ quy */}
        {hasChildren && isExpanded && (
          <div className="relative flex flex-col items-center">

            <div className="w-0.5 h-8 bg-primary/30"></div>

            {children.length > 1 && (
              <div className="relative w-full flex justify-center">
                <div className="absolute top-0 h-0.5 bg-primary/30 
          left-[10%] right-[10%]"></div>
              </div>
            )}

            {/* Children grid */}
            <div
              className={`grid mt-2 gap-12`}
              style={{
                gridTemplateColumns: `repeat(${children.length}, minmax(220px, 1fr))`,
              }}
            >
              {children.map((child) => (
                <div key={child.id} className="relative flex flex-col items-center">

                  {/* Line từ thanh ngang → xuống child */}
                  {children.length > 1 && (
                    <div className="w-0.5 h-6 bg-primary/30 z-10"></div>
                  )}

                  <DepartmentNode
                    dept={child}
                    level={level + 1}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
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
      <div className="space-y-1 pb-4 border-b">
        <h1 className="text-2xl font-semibold text-center">
          Sơ đồ tổ chức
        </h1>
        <p className="text-sm text-muted-foreground text-center max-w-xl mx-auto">
          Cơ cấu phòng ban và mối quan hệ quản lý trong đơn vị
        </p>
      </div>

      {/* Organizational Chart với scroll horizontal */}
      <Card>
        <CardContent className="p-8">
          <div className="overflow-x-auto pb-4 flex items-center justify-center">
            <div className="inline-flex gap-12">
              {/* Root Departments */}
              {rootDepartments.map((root) => (
                <div key={root.id} className="flex-shrink-0 j">
                  <DepartmentNode
                    dept={root}
                    level={0}
                    onEdit={openEditModal}
                    onDelete={openDeleteConfirm}
                  />
                </div>
              ))}

              {rootDepartments.length === 0 && (
                <div className="w-full text-center text-muted-foreground py-12">
                  Chưa có phòng ban nào. Nhấn "Thêm phòng ban" để bắt đầu.
                </div>
              )}
            </div>
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