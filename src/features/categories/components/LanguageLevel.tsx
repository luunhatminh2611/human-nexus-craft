// components/catalog/LanguageLevelTab.tsx
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
import { languageLevelApi } from '@/features/categories/api/categoriesApi';

export default function LanguageLevelTab() {
  const { toast } = useToast();

  const [languageLevels, setLanguageLevels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });

  // Tải danh sách trình độ ngoại ngữ
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await languageLevelApi.getAll();
      setLanguageLevels(data);
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách trình độ ngoại ngữ',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', description: '' });
    setDialogOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.name,
      description: item.description || '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập tên trình độ ngoại ngữ',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      if (editing) {
        await languageLevelApi.update(editing.id, form);
        toast({
          title: 'Thành công',
          description: 'Cập nhật trình độ ngoại ngữ thành công',
        });
      } else {
        await languageLevelApi.create(form);
        toast({
          title: 'Thành công',
          description: 'Thêm mới trình độ ngoại ngữ thành công',
        });
      }

      setDialogOpen(false);
      loadData();
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: `Không thể ${editing ? 'cập nhật' : 'thêm mới'} trình độ ngoại ngữ`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa trình độ ngoại ngữ này?')) return;

    try {
      setLoading(true);
      await languageLevelApi.delete(id);
      toast({ title: 'Thành công', description: 'Xóa trình độ ngoại ngữ thành công' });
      loadData();
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa trình độ ngoại ngữ',
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
            Thêm trình độ ngoại ngữ
          </Button>
        </div>

        {loading && languageLevels.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên trình độ</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead className="w-[120px] text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {languageLevels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    Chưa có dữ liệu
                  </TableCell>
                </TableRow>
              ) : (
                languageLevels.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.description || '-'}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(item)}
                        disabled={loading}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id)}
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
            <DialogTitle>{editing ? 'Chỉnh sửa' : 'Thêm mới'} trình độ ngoại ngữ</DialogTitle>
            <DialogDescription>Điền thông tin chi tiết bên dưới</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Tên trình độ *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Ví dụ: A1, A2, B1, IELTS 6.0..."
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
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={loading}>
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
