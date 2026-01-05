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
import { Textarea } from '@/shared/components/ui/textarea';
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, Upload, Download } from 'lucide-react';
import { languageLevelApi } from '@/features/categories/api/categoriesApi';
import { toast } from 'sonner';

interface LanguageLevel {
  id: number;
  name: string;
  description?: string;
}

export default function LanguageLevelTab() {
  const [languageLevels, setLanguageLevels] = useState<LanguageLevel[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LanguageLevel | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    fetchLanguageLevels();
  }, []);

  const fetchLanguageLevels = async () => {
    try {
      setLoading(true);
      const data = await languageLevelApi.getAll();
      setLanguageLevels(data || []);
    } catch (error) {
      toast.error('Không thể tải danh sách trình độ ngoại ngữ');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Lọc và phân trang
  const filteredLanguageLevels = useMemo(() => {
    return languageLevels.filter(item => {
      const search = searchTerm.toLowerCase();
      return (
        item.name.toLowerCase().includes(search) ||
        (item.description && item.description.toLowerCase().includes(search))
      );
    });
  }, [languageLevels, searchTerm]);

  const totalPages = Math.ceil(filteredLanguageLevels.length / itemsPerPage);

  const paginatedLanguageLevels = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLanguageLevels.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLanguageLevels, currentPage, itemsPerPage]);

  // Reset về trang 1 khi search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleOpenDialog = (item?: LanguageLevel) => {
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
      toast.error('Vui lòng nhập tên trình độ ngoại ngữ');
      return;
    }

    try {
      setLoading(true);
      if (selectedItem) {
        await languageLevelApi.update(selectedItem.id, formData);
        toast.success('Cập nhật trình độ ngoại ngữ thành công');
      } else {
        await languageLevelApi.create(formData);
        toast.success('Thêm trình độ ngoại ngữ thành công');
      }
      handleCloseDialog();
      fetchLanguageLevels();
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
      await languageLevelApi.delete(selectedItem.id);
      toast.success('Xóa trình độ ngoại ngữ thành công');
      setIsDeleteDialogOpen(false);
      setSelectedItem(null);
      fetchLanguageLevels();
    } catch (error) {
      toast.error('Xóa trình độ ngoại ngữ thất bại');
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
              placeholder="Tìm kiếm theo tên, mô tả trình độ ngoại ngữ..."
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
            Thêm trình độ ngoại ngữ
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className='bg-muted'>
            <TableRow>
              <TableHead className="w-[80px] border">STT</TableHead>
              <TableHead className="border">Tên trình độ ngoại ngữ</TableHead>
              <TableHead className="border">Mô tả</TableHead>
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
            ) : paginatedLanguageLevels.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  {searchTerm ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có dữ liệu'}
                </TableCell>
              </TableRow>
            ) : (
              paginatedLanguageLevels.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium border">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </TableCell>
                  <TableCell className="font-medium border">{item.name}</TableCell>
                  <TableCell className='border'>{item.description || '-'}</TableCell>
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
      {filteredLanguageLevels.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{' '}
            {Math.min(currentPage * itemsPerPage, filteredLanguageLevels.length)} trong tổng số{' '}
            {filteredLanguageLevels.length} trình độ ngoại ngữ
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
              {selectedItem ? 'Cập nhật trình độ ngoại ngữ' : 'Thêm trình độ ngoại ngữ mới'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Tên trình độ ngoại ngữ <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ví dụ: A1, A2, B1, B2, C1, IELTS 6.0, TOEIC 700..."
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
                placeholder="Nhập mô tả chi tiết về trình độ ngoại ngữ..."
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
            Bạn có chắc chắn muốn xóa trình độ ngoại ngữ <strong>"{selectedItem?.name}"</strong> không?
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