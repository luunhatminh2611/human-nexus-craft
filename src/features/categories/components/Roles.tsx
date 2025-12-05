// components/catalog/RolesTab.tsx
import { useState, useEffect } from 'react';
import { CardContent } from '@/shared/components/ui/card';
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
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';
import { Switch } from '@/shared/components/ui/switch';
import { roleApi } from '../api/categoriesApi';
import { Button } from '@/shared/components/ui/button/button2';

export default function RolesTab() {
  const { toast } = useToast();
  
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ 
    name: '', 
    code: '', 
    description: '', 
    isActive: true 
  });

  // Fetch roles từ API
  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const data = await roleApi.getAll();
      setRoles(data.filter((role) => !role.deleted));
    } catch (error) {
      toast({ 
        title: 'Lỗi', 
        description: error?.response?.data?.message || 'Không thể tải danh sách vai trò', 
        variant: 'destructive' 
      });
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', code: '', description: '', isActive: true });
    setDialogOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.name,
      code: item.code,
      description: item.description || '',
      isActive: item.isActive,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: 'Lỗi', description: 'Vui lòng nhập tên vai trò', variant: 'destructive' });
      return;
    }
    if (!form.code.trim()) {
      toast({ title: 'Lỗi', description: 'Vui lòng nhập mã vai trò', variant: 'destructive' });
      return;
    }

    try {
      setLoading(true);
      
      if (editing) {
        // Update existing role
        await roleApi.update(editing.id, {
          ...editing,
          ...form,
        });
        
        toast({ 
          title: 'Thành công', 
          description: 'Cập nhật vai trò thành công' 
        });
      } else {
        // Create new role
        await roleApi.create({
          name: form.name,
          code: form.code,
          description: form.description,
          isActive: form.isActive,
        });
        
        toast({ 
          title: 'Thành công', 
          description: 'Thêm mới vai trò thành công' 
        });
      }
      
      setDialogOpen(false);
      fetchRoles(); // Refresh list
    } catch (error) {
      toast({ 
        title: 'Lỗi', 
        description: error?.response?.data?.message || `Không thể ${editing ? 'cập nhật' : 'tạo'} vai trò`, 
        variant: 'destructive' 
      });
      console.error('Error saving role:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa vai trò này?')) return;

    try {
      setLoading(true);
      await roleApi.delete(id);
      
      toast({ title: 'Đã xóa', description: 'Xóa vai trò thành công' });
      fetchRoles(); // Refresh list
    } catch (error) {
      toast({ 
        title: 'Lỗi', 
        description: error?.response?.data?.message || 'Không thể xóa vai trò', 
        variant: 'destructive' 
      });
      console.error('Error deleting role:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (role) => {
    try {
      await roleApi.update(role.id, {
        isActive: !role.isActive,
      });
      
      fetchRoles(); // Refresh list
      toast({ 
        title: 'Thành công', 
        description: `Đã ${!role.isActive ? 'kích hoạt' : 'vô hiệu hóa'} vai trò` 
      });
    } catch (error) {
      toast({ 
        title: 'Lỗi', 
        description: error?.response?.data?.message || 'Không thể cập nhật trạng thái', 
        variant: 'destructive' 
      });
      console.error('Error toggling role status:', error);
    }
  };

  return (
    <>
      <CardContent className="pt-6 space-y-4">
        <div className="flex justify-end">
          <Button onClick={openAdd} disabled={loading}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm vai trò
          </Button>
        </div>
        
        {loading && roles.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Đang tải...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên vai trò</TableHead>
                <TableHead>Mã vai trò</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Chưa có vai trò nào
                  </TableCell>
                </TableRow>
              ) : (
                roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell>
                      <code className="bg-muted px-2 py-1 rounded text-sm">{role.code || "—"}</code>
                    </TableCell>
                    <TableCell>{role.description}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={role.isActive}
                          onCheckedChange={() => handleToggleActive(role)}
                          disabled={loading}
                        />
                        <span className="text-sm">
                          {role.isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => openEdit(role)}
                        disabled={loading}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(role.id)}
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
            <DialogTitle>{editing ? 'Chỉnh sửa' : 'Thêm mới'} vai trò</DialogTitle>
            <DialogDescription>Điền thông tin chi tiết bên dưới</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Tên vai trò *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Nhập tên vai trò"
              />
            </div>
            <div>
              <Label>Mã vai trò *</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                placeholder="Nhập mã vai trò (VD: ADMIN, USER)"
              />
            </div>
            <div>
              <Label>Mô tả</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Nhập mô tả"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.isActive}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, isActive: checked }))}
              />
              <Label>Kích hoạt vai trò</Label>
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
                {loading ? 'Đang lưu...' : 'Lưu'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}