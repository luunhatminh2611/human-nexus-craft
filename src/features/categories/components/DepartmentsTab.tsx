import { useEffect, useState, useMemo } from 'react';
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
import { Users, Edit, Trash2, Plus, Loader2, Search, ChevronLeft, ChevronRight, Upload, Download } from 'lucide-react';
import { Button } from '@/shared/components/ui/button/Button2';
import { Input } from '@/shared/components/ui/input';
import { DepartmentFormModal } from '../../departments/components/DepartmentModal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/tables/table';

export default function DepartmentTabs() {
  const toast = ({ title, description }) => alert(`${title}\n${description}`);

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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

  // Lọc và phân trang
  const filteredDepartments = useMemo(() => {
    return departments.filter(dept => {
      const search = searchTerm.toLowerCase();
      const parentDept = departments.find((d) => d.id === dept.parentId);
      return (
        dept.name.toLowerCase().includes(search) ||
        (dept.code && dept.code.toLowerCase().includes(search)) ||
        (dept.departmentType?.name && dept.departmentType.name.toLowerCase().includes(search)) ||
        (parentDept?.name && parentDept.name.toLowerCase().includes(search))
      );
    });
  }, [departments, searchTerm]);

  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);

  const paginatedDepartments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredDepartments.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredDepartments, currentPage, itemsPerPage]);

  // Reset về trang 1 khi search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="grid grid-cols-6 items-center gap-4">
        <div className="flex col-span-6 items-center gap-2">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm theo mã, tên phòng ban, loại phòng ban..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>

          <Button className="shrink-0" variant='outline'>
            <Upload className="mr-1 h-2 w-2" />
            Tải lên
          </Button>
          <Button className="shrink-0" variant='outline'>
            <Download className="mr-1 h-2 w-2" />
            Tải xuống
          </Button>

          {/* Button */}
          <Button onClick={openAddModal} className="shrink-0">
            <Plus className="mr-2 h-4 w-4" />
            Thêm phòng ban
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="w-full text-sm">
            <TableHeader className='bg-muted'>
              <TableRow>
                <TableHead className="p-3 border w-[80px]">STT</TableHead>
                <TableHead className="p-3 border">Mã phòng ban</TableHead>
                <TableHead className="p-3 border">Tên phòng ban</TableHead>
                <TableHead className="p-3 border">Loại phòng ban</TableHead>
                <TableHead className="p-3 border">Phòng ban gốc</TableHead>
                <TableHead className="p-3 border text-center">Số nhân viên</TableHead>
                <TableHead className="p-3 border text-center w-[150px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <tbody>
              {paginatedDepartments.length > 0 ? (
                paginatedDepartments.map((dept, index) => {
                  const parentDept = departments.find((d) => d.id === dept.parentId);
                  
                  return (
                    <tr key={dept.id} className="hover:bg-muted/40">
                      <td className="p-3 border font-medium">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="p-3 border">
                        {dept.code ? (
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                            {dept.code}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="p-3 border font-medium">{dept.name}</td>
                      <td className="p-3 border">
                        {dept.departmentType ? (
                          <Badge variant="outline" className="w-fit">
                            {dept.departmentType.name}
                          </Badge>
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
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(dept)}
                            className="hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteConfirm(dept)}
                            className="hover:bg-red-50 hover:text-red-600"
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
                  <td colSpan={7} className="text-center p-4 text-muted-foreground">
                    {searchTerm ? 'Không tìm thấy kết quả phù hợp' : 'Không có phòng ban nào'}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {filteredDepartments.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{' '}
            {Math.min(currentPage * itemsPerPage, filteredDepartments.length)} trong tổng số{' '}
            {filteredDepartments.length} phòng ban
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Trước
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Hiển thị trang đầu, cuối và các trang gần trang hiện tại
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className="w-10"
                    >
                      {page}
                    </Button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return (
                    <span key={page} className="px-2">
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Sau
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

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
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa phòng ban <strong>{editingDept?.name}</strong> không? Hành động này không thể hoàn tác.
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