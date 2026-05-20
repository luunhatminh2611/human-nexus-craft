import { useState, useEffect, useMemo } from "react";
import { Button } from "@/shared/components/ui/button/Button2";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/tables/table";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Upload,
  Download,
  Edit,
} from "lucide-react";
import { categoriesApi } from "../api/categoriesApi";
import { toast } from "sonner";
import { TrainingSystem, trainingSystemApi } from "../api/trainingSystem";
import BulkAddTrainingSystemModal from "./modal/BulkAddTrainingSystemModal";
import BulkEditTrainingSystemModal from "./modal/BulkEditTrainingSystemModal";

export default function TrainingSystem() {
  const [trainingSystems, setTrainingSystems] = useState<TrainingSystem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TrainingSystem | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    id: 0,
    code: "",
    name: "",
    description: "",
  });

  // Bulk operations
  const [isBulkAddOpen, setIsBulkAddOpen] = useState(false);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    fetchTrainingSystems();
  }, []);

  const fetchTrainingSystems = async () => {
    try {
      setLoading(true);
      const data = await trainingSystemApi.getAll();
      setTrainingSystems(data || []);
    } catch (error) {
      toast.error("Không thể tải danh sách hệ đào tạo");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Lọc và phân trang
  const filteredTrainingSystems = useMemo(() => {
    return trainingSystems.filter((item) => {
      const search = searchTerm.toLowerCase();

      return trainingSystems.filter(
        (item) =>
          (item.code || "").toLowerCase().includes(search) ||
          (item.name || "").toLowerCase().includes(search) ||
          (item.description || "").toLowerCase().includes(search),
      );
    });
  }, [trainingSystems, searchTerm]);

  const totalPages = Math.ceil(filteredTrainingSystems.length / itemsPerPage);

  const paginatedTrainingSystems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTrainingSystems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTrainingSystems, currentPage, itemsPerPage]);

  // Reset về trang 1 khi search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedIds(paginatedTrainingSystems.map((item) => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((itemId) => itemId !== id));
      setSelectAll(false);
    }
  };

  useEffect(() => {
    if (
      selectedIds.length === paginatedTrainingSystems.length &&
      paginatedTrainingSystems.length > 0
    ) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedIds, paginatedTrainingSystems]);

  useEffect(() => {
    setSelectedIds([]);
    setSelectAll(false);
  }, [currentPage, searchTerm]);

  const handleOpenDialog = (item?: TrainingSystem) => {
    if (item) {
      setSelectedItem(item);
      setFormData({
        id: item.id,
        code: item.code,
        name: item.name,
        description: item.description || "",
      });
    } else {
      setSelectedItem(null);
      setFormData({
        id: 0,
        code: "",
        name: "",
        description: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedItem(null);
    setFormData({
      id: 0,
      code: "",
      name: "",
      description: "",
    });
  };

  const handleSubmit = async () => {
    if (!formData.code?.trim()) {
      toast.error("Vui lòng nhập mã hệ đào tạo");
      return;
    }
    if (!formData.name?.trim()) {
      toast.error("Vui lòng nhập tên hệ đào tạo");
      return;
    }

    try {
      setLoading(true);
      if (selectedItem) {
        await trainingSystemApi.update(formData);
        toast.success("Cập nhật hệ đào tạo thành công");
      } else {
        // await trainingSystemApi.create(formData);
        // toast.success('Thêm hệ đào tạo thành công');
      }
      handleCloseDialog();
      fetchTrainingSystems();
    } catch (error) {
      toast.error(selectedItem ? "Cập nhật thất bại" : "Thêm mới thất bại");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;

    try {
        setLoading(true);
        await trainingSystemApi.delete(selectedItem.id!);
        toast.success('Xóa hệ đào tạo thành công');
        setIsDeleteDialogOpen(false);
        setSelectedItem(null);
        fetchTrainingSystems();
    } catch (error) {
      toast.error("Xóa hệ đào tạo thất bại");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleBulkEdit = () => {
    if (selectedIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một hệ đào tạo");
      return;
    }
    setIsBulkEditOpen(true);
  };

  const handleCloseBulkEdit = () => {
    setIsBulkEditOpen(false);
    setSelectedIds([]);
    setSelectAll(false);
    fetchTrainingSystems();
  };

  return (
    <div className="space-y-4 p-4">
      <div className="grid grid-cols-6 items-center gap-4">
        <div className="flex col-span-6 items-center gap-2">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm theo mã, tên, mô tả hệ đào tạo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>

          <Button className="shrink-0" variant="outline">
            <Upload className="mr-1 h-2 w-2" />
            Tải lên
          </Button>
          <Button className="shrink-0" variant="outline">
            <Download className="mr-1 h-2 w-2" />
            Tải xuống
          </Button>

          <Button
            className="shrink-0"
            variant="default"
            onClick={handleBulkEdit}
            disabled={selectedIds.length === 0}
          >
            <Edit className="mr-2 h-4 w-4" />
            Sửa ({selectedIds.length})
          </Button>

          <Button onClick={() => setIsBulkAddOpen(true)} className="shrink-0">
            <Plus className="mr-2 h-4 w-4" />
            Thêm mới
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead className="w-[50px] border">
                <Checkbox
                  checked={selectAll}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="w-[80px] border">STT</TableHead>
              <TableHead className="w-[150px] border">Mã hệ đào tạo</TableHead>
              <TableHead className="border">Tên hệ đào tạo</TableHead>
              <TableHead className="border">Mô tả</TableHead>
              <TableHead className="text-center w-[150px] border">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : paginatedTrainingSystems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  {searchTerm
                    ? "Không tìm thấy kết quả phù hợp"
                    : "Chưa có dữ liệu"}
                </TableCell>
              </TableRow>
            ) : (
              paginatedTrainingSystems.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="border">
                    <Checkbox
                      checked={selectedIds.includes(item.id)}
                      onCheckedChange={(checked) =>
                        handleSelectOne(item.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell className="font-medium border">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </TableCell>
                  <TableCell className="font-medium border">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                      {item.code}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium border">
                    {item.name}
                  </TableCell>
                  <TableCell className="border">
                    {item.description || "-"}
                  </TableCell>
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
      {filteredTrainingSystems.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{" "}
            {Math.min(
              currentPage * itemsPerPage,
              filteredTrainingSystems.length,
            )}{" "}
            trong tổng số {filteredTrainingSystems.length} hệ đào tạo
            {selectedIds.length > 0 && (
              <span className="ml-2 font-semibold text-blue-600">
                ({selectedIds.length} được chọn)
              </span>
            )}
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
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => {
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className="w-10"
                      >
                        {page}
                      </Button>
                    );
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return (
                      <span key={page} className="px-2">
                        ...
                      </span>
                    );
                  }
                  return null;
                },
              )}
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
              {selectedItem ? "Cập nhật hệ đào tạo" : "Thêm hệ đào tạo mới"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="code">
                Mã hệ đào tạo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder="Ví dụ: CQ, TC, LT, VB2..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">
                Tên hệ đào tạo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ví dụ: Chính quy, Tại chức, Liên thông, Văn bằng 2..."
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
                placeholder="Nhập mô tả chi tiết về hệ đào tạo..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Hủy
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading
                ? "Đang xử lý..."
                : selectedItem
                  ? "Cập nhật"
                  : "Thêm mới"}
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
            Bạn có chắc chắn muốn xóa hệ đào tạo{" "}
            <strong>"{selectedItem?.name}"</strong> (mã:{" "}
            <strong>{selectedItem?.code}</strong>) không?
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
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? "Đang xóa..." : "Xóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BulkAddTrainingSystemModal
        isOpen={isBulkAddOpen}
        onClose={() => {
          setIsBulkAddOpen(false);
          fetchTrainingSystems();
        }}
      />
      <BulkEditTrainingSystemModal
        isOpen={isBulkEditOpen}
        onClose={handleCloseBulkEdit}
        preSelectedIds={selectedIds}
      />
    </div>
  );
}
