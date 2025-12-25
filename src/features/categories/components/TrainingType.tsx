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
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react';
import { categoriesApi } from '../api/categoriesApi';
import { toast } from 'sonner';

interface TrainingType {
  id: number;
  name: string;
  description?: string;
}

export default function TrainingTypeTab() {
  const [trainingTypes, setTrainingTypes] = useState<TrainingType[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TrainingType | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    fetchTrainingTypes();
  }, []);

  const fetchTrainingTypes = async () => {
    try {
      setLoading(true);
      const data = await categoriesApi.trainingType.getAll();
      setTrainingTypes(data || []);
    } catch (error) {
      toast.error('Không thể tải danh sách hình thức đào tạo');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (item?: TrainingType) => {
    if (item) {
      setSelectedItem(item);
      setFormData({
        name: item.name,
        description: item.description || '',
      });
    } else {
      setSelectedItem(null);
      setFormData({
        name: '',
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
      description: '',
    });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên hình thức đào tạo');
      return;
    }

    try {
      setLoading(true);
      if (selectedItem) {
        await categoriesApi.trainingType.update(selectedItem.id, formData);
        toast.success('Cập nhật hình thức đào tạo thành công');
      } else {
        await categoriesApi.trainingType.create(formData);
        toast.success('Thêm hình thức đào tạo thành công');
      }
      handleCloseDialog();
      fetchTrainingTypes();
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
      await categoriesApi.trainingType.delete(selectedItem.id);
      toast.success('Xóa hình thức đào tạo thành công');
      setIsDeleteDialogOpen(false);
      setSelectedItem(null);
      fetchTrainingTypes();
    } catch (error) {
      toast.error('Xóa hình thức đào tạo thất bại');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-purple-600" />
          <h2 className="text-xl font-semibold">Quản lý hình thức đào tạo</h2>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm hình thức đào tạo
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">STT</TableHead>
              <TableHead>Tên hình thức đào tạo</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead className="text-right w-[150px]">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>Đang tải...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : trainingTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <BookOpen className="h-8 w-8" />
                    <p>Chưa có dữ liệu hình thức đào tạo</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleOpenDialog()}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm hình thức đầu tiên
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              trainingTypes.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
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
              {selectedItem ? 'Cập nhật hình thức đào tạo' : 'Thêm hình thức đào tạo'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Tên hình thức đào tạo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ví dụ: Chính quy, Tại chức, Từ xa, Liên thông..."
              />
              <p className="text-xs text-muted-foreground">
                Tên hình thức đào tạo của nhân viên
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
                placeholder="Nhập mô tả chi tiết về hình thức đào tạo (ví dụ: học toàn thời gian tại trường, học online, học vừa làm vừa học...)"
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
              Bạn có chắc chắn muốn xóa hình thức đào tạo{' '}
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