// components/catalog/WardTab.tsx
import { useState, useEffect } from 'react';
import { CardContent } from '@/shared/components/ui/card';
import Button from '@/shared/components/ui/button/Button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
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
import { wardApi } from '@/features/categories/api/categoriesApi';

export default function WardTab() {
  const { toast } = useToast();
  
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', code: '' });

  // Load danh sách phường/xã khi component mount
  useEffect(() => {
    loadWards();
  }, []);

  const loadWards = async () => {
    try {
      setLoading(true);
      const data = await wardApi.getAll();
      setWards(data);
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách phường/xã',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', code: '' });
    setDialogOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.name,
      code: item.code || '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: 'Lỗi', description: 'Vui lòng nhập tên phường/xã', variant: 'destructive' });
      return;
    }

    try {
      setLoading(true);
      
      if (editing) {
        // Cập nhật
        await wardApi.update(editing.id, form);
        toast({
          title: 'Thành công',
          description: 'Cập nhật phường/xã thành công',
        });
      } else {
        // Thêm mới
        await wardApi.create(form);
        toast({
          title: 'Thành công',
          description: 'Thêm mới phường/xã thành công',
        });
      }
      
      setDialogOpen(false);
      loadWards(); // Reload lại danh sách
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: `Không thể ${editing ? 'cập nhật' : 'thêm mới'} phường/xã`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa phường/xã này?')) {
      return;
    }

    try {
      setLoading(true);
      await wardApi.delete(id);
      toast({ title: 'Thành công', description: 'Xóa phường/xã thành công' });
      loadWards(); // Reload lại danh sách
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa phường/xã',
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
            Thêm phường/xã
          </Button>
        </div>
        
        {loading && wards.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã</TableHead>
                <TableHead>Tên phường/xã</TableHead>
                <TableHead className="w-[120px] text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wards.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    Chưa có dữ liệu
                  </TableCell>
                </TableRow>
              ) : (
                wards.map((ward) => (
                  <TableRow key={ward.id}>
                    <TableCell className="font-mono text-sm">{ward.code || '-'}</TableCell>
                    <TableCell className="font-medium">{ward.name}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => openEdit(ward)}
                        disabled={loading}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(ward.id)}
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
            <DialogTitle>{editing ? 'Chỉnh sửa' : 'Thêm mới'} phường/xã</DialogTitle>
            <DialogDescription>Điền thông tin chi tiết bên dưới</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Mã phường/xã</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                placeholder="Nhập mã (tùy chọn)"
              />
            </div>
            <div>
              <Label>Tên phường/xã *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Nhập tên phường/xã"
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