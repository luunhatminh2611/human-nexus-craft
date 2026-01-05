import { useState, useEffect, useMemo } from 'react';
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
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, Upload, Download } from 'lucide-react';
import { provinceCityApi } from '@/features/categories/api/categoriesApi';
import { toast } from 'sonner';

interface ProvinceCity {
  id: number;
  name: string;
  code?: string;
}

export default function ProvinceCityTab() {
  const [provinceCities, setProvinceCities] = useState<ProvinceCity[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ProvinceCity | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
  });

  useEffect(() => {
    fetchProvinceCities();
  }, []);

  const fetchProvinceCities = async () => {
    try {
      setLoading(true);
      const data = await provinceCityApi.getAll();
      setProvinceCities(data || []);
    } catch (error) {
      toast.error('Không thể tải danh sách tỉnh/thành phố');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Lọc và phân trang
  const filteredProvinceCities = useMemo(() => {
    return provinceCities.filter(item => {
      const search = searchTerm.toLowerCase();
      return (
        item.name.toLowerCase().includes(search) ||
        (item.code && item.code.toLowerCase().includes(search))
      );
    });
  }, [provinceCities, searchTerm]);

  const totalPages = Math.ceil(filteredProvinceCities.length / itemsPerPage);

  const paginatedProvinceCities = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProvinceCities.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProvinceCities, currentPage, itemsPerPage]);

  // Reset về trang 1 khi search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleOpenDialog = (item?: ProvinceCity) => {
    if (item) {
      setSelectedItem(item);
      setFormData({
        name: item.name,
        code: item.code || '',
      });
    } else {
      setSelectedItem(null);
      setFormData({
        name: '',
        code: '',
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
    });
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error('Vui lòng nhập tên tỉnh/thành phố');
      return;
    }

    try {
      setLoading(true);
      if (selectedItem) {
        await provinceCityApi.update(selectedItem.id, formData);
        toast.success('Cập nhật tỉnh/thành phố thành công');
      } else {
        await provinceCityApi.create(formData);
        toast.success('Thêm tỉnh/thành phố thành công');
      }
      handleCloseDialog();
      fetchProvinceCities();
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
      await provinceCityApi.delete(selectedItem.id);
      toast.success('Xóa tỉnh/thành phố thành công');
      setIsDeleteDialogOpen(false);
      setSelectedItem(null);
      fetchProvinceCities();
    } catch (error) {
      toast.error('Xóa tỉnh/thành phố thất bại');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-4 p-4">
      <div className="grid grid-cols-6 items-center gap-4">
        <div className="flex col-span-6 items-center gap-2">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm theo mã, tên tỉnh/thành phố..."
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
          <Button onClick={() => handleOpenDialog()} className="shrink-0">
            <Plus className="mr-2 h-4 w-4" />
            Thêm tỉnh/thành phố
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className='bg-muted'>
            <TableRow>
              <TableHead className="w-[80px] border">STT</TableHead>
              <TableHead className="border">Mã tỉnh/thành phố</TableHead>
              <TableHead className="border">Tên tỉnh/thành phố</TableHead>
              <TableHead className="text-center w-[150px] border">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : paginatedProvinceCities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  {searchTerm ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có dữ liệu'}
                </TableCell>
              </TableRow>
            ) : (
              paginatedProvinceCities.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium border">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </TableCell>
                  <TableCell className="border">
                    {item.code ? (
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                        {item.code}
                      </span>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell className="font-medium border">{item.name}</TableCell>
                  <TableCell className="text-center border">
                    <div className="flex justify-center gap-2">
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

      {/* Pagination */}
      {filteredProvinceCities.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{' '}
            {Math.min(currentPage * itemsPerPage, filteredProvinceCities.length)} trong tổng số{' '}
            {filteredProvinceCities.length} tỉnh/thành phố
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

      {/* Dialog thêm/sửa */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedItem ? 'Cập nhật tỉnh/thành phố' : 'Thêm tỉnh/thành phố mới'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="code">Mã tỉnh/thành phố</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder="Ví dụ: HN, HCM, DN, HP..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">
                Tên tỉnh/thành phố <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ví dụ: Hà Nội, Hồ Chí Minh, Đà Nẵng..."
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
            Bạn có chắc chắn muốn xóa tỉnh/thành phố <strong>"{selectedItem?.name}"</strong> không?
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