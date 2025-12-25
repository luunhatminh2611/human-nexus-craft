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
import { Plus, Pencil, Trash2, FileText } from 'lucide-react';
import { categoriesApi } from '../api/categoriesApi';
import { toast } from 'sonner';

interface LaborContractType {
  id: number;
  name: string;
  code?: string;
  description?: string;
}

export default function LaborContractTypeTab() {
  const [contractTypes, setContractTypes] = useState<LaborContractType[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LaborContractType | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
  });

  useEffect(() => {
    fetchContractTypes();
  }, []);

  const fetchContractTypes = async () => {
    try {
      setLoading(true);
      const data = await categoriesApi.laborContractType.getAll();
      setContractTypes(data || []);
    } catch (error) {
      toast.error('Không thể tải danh sách loại hợp đồng lao động');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (item?: LaborContractType) => {
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
    if (!formData.name) {
      toast.error('Vui lòng nhập tên loại hợp đồng');
      return;
    }

    try {
      setLoading(true);
      if (selectedItem) {
        await categoriesApi.laborContractType.update(selectedItem.id, formData);
        toast.success('Cập nhật loại hợp đồng thành công');
      } else {
        await categoriesApi.laborContractType.create(formData);
        toast.success('Thêm loại hợp đồng thành công');
      }
      handleCloseDialog();
      fetchContractTypes();
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
      await categoriesApi.laborContractType.delete(selectedItem.id);
      toast.success('Xóa loại hợp đồng thành công');
      setIsDeleteDialogOpen(false);
      setSelectedItem(null);
      fetchContractTypes();
    } catch (error) {
      toast.error('Xóa loại hợp đồng thất bại');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold">Quản lý loại hợp đồng lao động</h2>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm loại hợp đồng
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">STT</TableHead>
              <TableHead>Mã loại hợp đồng</TableHead>
              <TableHead>Tên loại hợp đồng</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead className="text-right w-[150px]">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : contractTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Chưa có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              contractTypes.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>
                    {item.code ? (
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                        {item.code}
                      </span>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.description || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(item)}
                        className="hover:bg-blue-50"
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
              {selectedItem ? 'Cập nhật loại hợp đồng lao động' : 'Thêm loại hợp đồng lao động'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="code">Mã loại hợp đồng</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder="Ví dụ: HDLD-01, HĐXĐ-TH..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">
                Tên loại hợp đồng <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ví dụ: Hợp đồng xác định thời hạn, Hợp đồng không xác định thời hạn..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Nhập mô tả chi tiết về loại hợp đồng..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Hủy
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Đang xử lý...' : selectedItem ? 'Cập nhật' : 'Thêm mới'}
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
          <p>
            Bạn có chắc chắn muốn xóa loại hợp đồng <strong>"{selectedItem?.name}"</strong> không?
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedItem(null);
              }}
            >
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}