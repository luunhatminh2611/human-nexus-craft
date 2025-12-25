import { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button/Button2';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/tables/table';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import { categoriesApi } from '../api/categoriesApi';
import { toast } from 'sonner';

interface PolicyFamily {
  id: number;
  name: string;
  code?: string;
  description?: string;
}

export default function PolicyFamilyTab() {
  const [policyFamilies, setPolicyFamilies] = useState<PolicyFamily[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PolicyFamily | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
  });

  useEffect(() => {
    fetchPolicyFamilies();
  }, []);

  const fetchPolicyFamilies = async () => {
    try {
      setLoading(true);
      const data = await categoriesApi.policyFamily.getAll();
      setPolicyFamilies(data || []);
    } catch (error) {
      toast.error('Không thể tải danh sách gia đình chính sách');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (item?: PolicyFamily) => {
    if (item) {
      setSelectedItem(item);
      setFormData({
        name: item.name,
        code: item.code || '',
        description: item.description || '',
      });
    } else {
      setSelectedItem(null);
      setFormData({
        name: '',
        code: '',
        description: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedItem(null);
    setFormData({
      name: '',
      code: '',
      description: '',
    });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên gia đình chính sách');
      return;
    }

    try {
      setLoading(true);
      if (selectedItem) {
        await categoriesApi.policyFamily.update(selectedItem.id, formData);
        toast.success('Cập nhật gia đình chính sách thành công');
      } else {
        await categoriesApi.policyFamily.create(formData);
        toast.success('Thêm gia đình chính sách thành công');
      }
      handleCloseDialog();
      fetchPolicyFamilies();
    } catch (error) {
      toast.error(selectedItem ? 'Cập nhật thất bại' : 'Thêm mới thất bại');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;

    try {
      setLoading(true);
      await categoriesApi.policyFamily.delete(selectedItem.id);
      toast.success('Xóa gia đình chính sách thành công');
      setIsDeleteDialogOpen(false);
      setSelectedItem(null);
      fetchPolicyFamilies();
    } catch (error) {
      toast.error('Xóa gia đình chính sách thất bại');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-green-600" />
          <h2 className="text-xl font-semibold">Quản lý gia đình chính sách</h2>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm gia đình chính sách
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">STT</TableHead>
              <TableHead>Mã chính sách</TableHead>
              <TableHead>Tên gia đình chính sách</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead className="text-right w-[150px]">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>Đang tải...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : policyFamilies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Users className="h-8 w-8" />
                    <p>Chưa có dữ liệu gia đình chính sách</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleOpenDialog()}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm gia đình chính sách đầu tiên
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              policyFamilies.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>
                    {item.code ? (
                      <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium">
                        {item.code}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    {item.description || <span className="text-muted-foreground">-</span>}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(item)}
                        className="hover:bg-blue-50"
                        title="Chỉnh sửa"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedItem(item);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="hover:bg-red-50 hover:text-red-600"
                        title="Xóa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog thêm/sửa */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedItem ? 'Cập nhật gia đình chính sách' : 'Thêm gia đình chính sách'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="code">Mã chính sách</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder="Ví dụ: GDCS-01, TNLĐ, TNTN, BBTS..."
              />
              <p className="text-xs text-muted-foreground">
                Mã định danh cho gia đình chính sách (tùy chọn)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">
                Tên gia đình chính sách <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ví dụ: Gia đình liệt sĩ, Thương binh, Bệnh binh, Con thương binh..."
              />
              <p className="text-xs text-muted-foreground">
                Tên đầy đủ của đối tượng gia đình chính sách
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Nhập mô tả chi tiết về gia đình chính sách (ví dụ: quyền lợi, chế độ ưu đãi, điều kiện hưởng...)"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} disabled={loading}>
              Hủy
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                  Đang xử lý...
                </>
              ) : (
                selectedItem ? 'Cập nhật' : 'Thêm mới'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog xác nhận xóa */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Bạn có chắc chắn muốn xóa gia đình chính sách{' '}
              <strong className="text-red-600">"{selectedItem?.name}"</strong> không?
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Hành động này không thể hoàn tác.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedItem(null);
              }}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete} 
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                  Đang xóa...
                </>
              ) : (
                'Xóa'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}