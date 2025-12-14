import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button/Button2";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Plus, Trash2, AlertCircle, User, Search } from "lucide-react";
import { ppeApi } from "../../safety/api/safetyApi";
import { employeeApi } from "@/features/employees/api/employeeApi";
import { toast } from "sonner";
import { Badge } from "@/shared/components/ui/badge";

interface CreateDistributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  registration: any; // Đơn đăng ký đã được duyệt
}

interface DistributionItem {
  ppeItemId: number | string;
  quantity: number | string;
}

export default function CreateDistributionModal({
  isOpen,
  onClose,
  onSuccess,
  registration,
}: CreateDistributionModalProps) {
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [searchEmployee, setSearchEmployee] = useState("");
  const [formData, setFormData] = useState({
    employeeId: "",
    items: [] as DistributionItem[],
  });

  // Load danh sách nhân viên theo phòng ban khi mở modal
  useEffect(() => {
    console.log("isOpen, registration, departmentId", isOpen, registration);
    if (isOpen && registration) {
      fetchEmployees();
      initializeItems();
    }
  }, [isOpen, registration]);

  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const data = await employeeApi.getByDepartmentId(registration?.departmentId);
      console.log("Fetched employees:", data);
      setEmployees(data?.data || data || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách nhân viên:", error);
      toast.error("Không thể tải danh sách nhân viên");
    } finally {
      setLoadingEmployees(false);
    }
  };

  // Khởi tạo items từ registration details
  const initializeItems = () => {
    if (registration?.registrationDetails) {
      const items = registration.registrationDetails.map((detail: any) => ({
        ppeItemId: detail.ppeItemId,
        quantity: detail.requestedQuantity,
      }));
      setFormData({
        employeeId: "",
        items: items,
      });
    }
  };

  // Reset form khi đóng
  const handleClose = () => {
    setFormData({
      employeeId: "",
      items: [],
    });
    setSearchEmployee("");
    onClose();
  };

  // Thêm vật phẩm mới
  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { ppeItemId: "", quantity: "" }],
    });
  };

  // Xóa vật phẩm
  const handleRemoveItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      items: newItems.length > 0 ? newItems : [{ ppeItemId: "", quantity: "" }],
    });
  };

  // Cập nhật thông tin vật phẩm
  const handleItemChange = (
    index: number,
    field: keyof DistributionItem,
    value: string | number
  ) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    setFormData({ ...formData, items: newItems });
  };

  // Lấy tên vật phẩm từ registration
  const getItemName = (ppeItemId: number | string) => {
    const detail = registration?.registrationDetails?.find(
      (d: any) => d.ppeItemId === Number(ppeItemId)
    );
    return detail?.ppeItemName || "";
  };

  // Lấy số lượng đã yêu cầu
  const getRequestedQuantity = (ppeItemId: number | string) => {
    const detail = registration?.registrationDetails?.find(
      (d: any) => d.ppeItemId === Number(ppeItemId)
    );
    return detail?.requestedQuantity || 0;
  };

  // Filter nhân viên theo search
  const filteredEmployees = employees.filter((emp) => {
    const searchLower = searchEmployee.toLowerCase();
    return (
      emp.fullName?.toLowerCase().includes(searchLower) ||
      emp.employeeCode?.toLowerCase().includes(searchLower) ||
      emp.id?.toString().includes(searchLower)
    );
  });

  // Validate form
  const validateForm = () => {
    if (!formData.employeeId) {
      toast.error("Vui lòng chọn nhân viên");
      return false;
    }

    if (formData.items.length === 0) {
      toast.error("Vui lòng thêm ít nhất một vật phẩm");
      return false;
    }

    for (let i = 0; i < formData.items.length; i++) {
      const item = formData.items[i];

      if (!item.ppeItemId) {
        toast.error(`Vui lòng chọn vật phẩm cho dòng ${i + 1}`);
        return false;
      }

      if (!item.quantity || Number(item.quantity) <= 0) {
        toast.error(`Số lượng phải lớn hơn 0 cho dòng ${i + 1}`);
        return false;
      }

      // Cảnh báo nếu vượt số lượng yêu cầu
      const requestedQty = getRequestedQuantity(item.ppeItemId);
      if (Number(item.quantity) > requestedQty) {
        toast.warning(
          `Số lượng phát cho "${getItemName(item.ppeItemId)}" vượt quá số lượng yêu cầu (${requestedQty})`
        );
      }
    }

    // Kiểm tra trùng lặp vật phẩm
    const itemIds = formData.items.map((item) => item.ppeItemId);
    const uniqueIds = new Set(itemIds);
    if (itemIds.length !== uniqueIds.size) {
      toast.error("Có vật phẩm bị trùng lặp");
      return false;
    }

    return true;
  };

  // Submit form
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      await ppeApi.createDistribution({
        employeeId: Number(formData.employeeId),
        registrationId: registration.id,
        items: formData.items.map((item) => ({
          ppeItemId: Number(item.ppeItemId),
          quantity: Number(item.quantity),
        })),
      });

      toast.success("Tạo phân phát thành công");
      onSuccess();
      handleClose();
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message;
      toast.error(errorMsg || "Tạo phân phát thất bại");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Tạo phân phát bảo hộ lao động
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Đơn đăng ký #{registration?.id}
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Chọn nhân viên */}
          <div className="space-y-3">
            <Label htmlFor="employee">
              Chọn nhân viên <span className="text-red-500">*</span>
            </Label>

            {/* Search box */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm nhân viên (tên, mã)..."
                value={searchEmployee}
                onChange={(e) => setSearchEmployee(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={formData.employeeId}
              onValueChange={(value) =>
                setFormData({ ...formData, employeeId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn nhân viên nhận bảo hộ" />
              </SelectTrigger>
              <SelectContent>
                {loadingEmployees ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Đang tải...
                  </div>
                ) : filteredEmployees.length > 0 ? (
                  filteredEmployees.map((emp) => (
                    <SelectItem key={emp.id} value={String(emp.id)}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium">{emp.fullName}</span>
                        <Badge variant="outline" className="text-xs">
                          {emp.employeeCode}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    {searchEmployee
                      ? "Không tìm thấy nhân viên"
                      : "Không có nhân viên"}
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Danh sách vật phẩm */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>
                Danh sách vật phẩm phát <span className="text-red-500">*</span>
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
              >
                <Plus className="h-4 w-4 mr-1" />
                Thêm vật phẩm
              </Button>
            </div>

            <div className="space-y-3 border rounded-lg p-4 bg-gray-50">
              {formData.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-white rounded-lg border"
                >
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    {/* Chọn vật phẩm */}
                    <div className="space-y-2">
                      <Label className="text-xs">
                        Vật phẩm <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={String(item.ppeItemId)}
                        onValueChange={(value) =>
                          handleItemChange(index, "ppeItemId", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn vật phẩm" />
                        </SelectTrigger>
                        <SelectContent>
                          {registration?.registrationDetails?.map((detail: any) => (
                            <SelectItem
                              key={detail.ppeItemId}
                              value={String(detail.ppeItemId)}
                            >
                              <div className="flex items-center justify-between w-full gap-4">
                                <span>{detail.ppeItemName}</span>
                                <span className="text-xs text-muted-foreground">
                                  Yêu cầu: {detail.requestedQuantity}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Hiển thị số lượng yêu cầu */}
                      {item.ppeItemId && (
                        <p className="text-xs text-muted-foreground">
                          Số lượng yêu cầu:{" "}
                          <strong>{getRequestedQuantity(item.ppeItemId)}</strong>
                        </p>
                      )}
                    </div>

                    {/* Số lượng phát */}
                    <div className="space-y-2">
                      <Label className="text-xs">
                        Số lượng phát <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(index, "quantity", e.target.value)
                        }
                        placeholder="Nhập số lượng"
                        min="1"
                      />
                    </div>
                  </div>

                  {/* Nút xóa */}
                  {formData.items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(index)}
                      className="mt-7 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

              {formData.items.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  Chưa có vật phẩm nào
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline">Tổng: {formData.items.length} vật phẩm</Badge>
            </div>
          </div>

          {/* Lưu ý */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <strong>Lưu ý:</strong> Sau khi tạo phân phát, nhân viên sẽ nhận
              được thông báo và cần xác nhận đã nhận đủ bảo hộ lao động.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Đang xử lý..." : "Tạo phân phát"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}