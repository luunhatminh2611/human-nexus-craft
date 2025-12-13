// components/catalog/SpecialtyTab.tsx
import { useState, useEffect } from 'react';
import { CardContent } from '@/shared/components/ui/card';
import Button from '@/shared/components/ui/button/Button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/tables/table';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';
import { specialtyApi } from '@/features/categories/api/categoriesApi';

export default function SpecialtyTab() {
  const { toast } = useToast();
  
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', description: '' });

  // Load danh sách chuyên môn khi component mount
  useEffect(() => {
    loadSpecialties();
  }, []);

  const loadSpecialties = async () => {
    try {
      setLoading(true);
      const data = await specialtyApi.getAll();
      setSpecialties(data);
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách chuyên ngành',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', code: '', description: '' });
    setDialogOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.name,
      code: item.code || '',
      description: item.description || '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: 'Lỗi', description: 'Vui lòng nhập tên chuyên ngành', variant: 'destructive' });
      return;
    }

    try {
      setLoading(true);
      
      if (editing) {
        // Cập nhật
        await specialtyApi.update(editing.id, form);
        toast({
          title: 'Thành công',
          description: 'Cập nhật chuyên ngành thành công',
        });
      } else {
        // Thêm mới
        await specialtyApi.create(form);
        toast({
          title: 'Thành công',
          description: 'Thêm mới chuyên ngành thành công',
        });
      }
      
      setDialogOpen(false);
      loadSpecialties(); // Reload lại danh sách
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: `Không thể ${editing ? 'cập nhật' : 'thêm mới'} chuyên ngành`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa chuyên ngành này?')) {
      return;
    }

    try {
      setLoading(true);
      await specialtyApi.delete(id);
      toast({ title: 'Thành công', description: 'Xóa chuyên ngành thành công' });
      loadSpecialties(); // Reload lại danh sách
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa chuyên ngành',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CardContent className="pt-6 space-y-4">
        <div className="flex justify-end">
          <Button onClick={openAdd} disabled={loading}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm chuyên ngành
          </Button>
        </div>
        
        {loading && specialties.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã</TableHead>
                <TableHead>Tên chuyên ngành</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead className="w-[120px] text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {specialties.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Chưa có dữ liệu
                  </TableCell>
                </TableRow>
              ) : (
                specialties.map((specialty) => (
                  <TableRow key={specialty.id}>
                    <TableCell className="font-mono text-sm">{specialty.code || '-'}</TableCell>
                    <TableCell className="font-medium">{specialty.name}</TableCell>
                    <TableCell>{specialty.description || '-'}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => openEdit(specialty)}
                        disabled={loading}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(specialty.id)}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Chỉnh sửa' : 'Thêm mới'} chuyên ngành</DialogTitle>
            <DialogDescription>Điền thông tin chi tiết bên dưới</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Mã chuyên ngành</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                placeholder="Nhập mã (tùy chọn)"
              />
            </div>
            <div>
              <Label>Tên chuyên ngành *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Nhập tên chuyên ngành"
              />
            </div>
            <div>
              <Label>Mô tả</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Nhập mô tả"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setDialogOpen(false)}
                disabled={loading}
              >
                Hủy
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Lưu
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}