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
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { ppeApi } from "../../safety/api/safetyApi";
import { ppeItemApi } from "../../safety/api/ppeItemApi";
import { toast } from "sonner";
import { Badge } from "@/shared/components/ui/badge";

interface PPEPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: any;
}

interface PlanDetail {
  ppeItemId: number | string;
  standardQuantity: number | string;
}

export default function PPEPlanModal({
  isOpen,
  onClose,
  onSuccess,
  editData,
}: PPEPlanModalProps) {
  const [loading, setLoading] = useState(false);
  const [ppeItems, setPpeItems] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    notes: "",
    planDetails: [{ ppeItemId: "", standardQuantity: "" }] as PlanDetail[],
  });

  const isEditMode = !!editData;

  // Load danh sách vật phẩm bảo hộ
  useEffect(() => {
    const fetchPPEItems = async () => {
      try {
        const data = await ppeItemApi.getAll();
        setPpeItems(data || []);
      } catch (error) {
        toast.error("Không thể tải danh sách đồ bảo hộ");
        console.error(error);
      }
    };

    if (isOpen) {
      fetchPPEItems();
    }
  }, [isOpen]);

  // Load dữ liệu khi edit
  useEffect(() => {
    if (editData) {
      setFormData({
        year: editData.year,
        notes: editData.notes || "",
        planDetails: editData.planDetails?.map((detail: any) => ({
          ppeItemId: detail.ppeItemId,
          standardQuantity: detail.standardQuantity,
        })) || [{ ppeItemId: "", standardQuantity: "" }],
      });
    } else {
      setFormData({
        year: new Date().getFullYear(),
        notes: "",
        planDetails: [{ ppeItemId: "", standardQuantity: "" }],
      });
    }
  }, [editData, isOpen]);

  // Thêm vật phẩm mới
  const handleAddItem = () => {
    setFormData({
      ...formData,
      planDetails: [
        ...formData.planDetails,
        { ppeItemId: "", standardQuantity: "" },
      ],
    });
  };

  // Xóa vật phẩm
  const handleRemoveItem = (index: number) => {
    const newDetails = formData.planDetails.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      planDetails: newDetails.length > 0 ? newDetails : [{ ppeItemId: "", standardQuantity: "" }],
    });
  };

  // Cập nhật thông tin vật phẩm
  const handleDetailChange = (
    index: number,
    field: keyof PlanDetail,
    value: string | number
  ) => {
    const newDetails = [...formData.planDetails];
    newDetails[index] = {
      ...newDetails[index],
      [field]: value,
    };
    setFormData({ ...formData, planDetails: newDetails });
  };

  // Validate form
  const validateForm = () => {
    if (!isEditMode) {
      if (!formData.year || formData.year < 2000 || formData.year > 2100) {
        toast.error("Năm không hợp lệ (2000-2100)");
        return false;
      }

      if (formData.planDetails.length === 0) {
        toast.error("Vui lòng thêm ít nhất một vật phẩm");
        return false;
      }

      for (let i = 0; i < formData.planDetails.length; i++) {
        const detail = formData.planDetails[i];
        if (!detail.ppeItemId) {
          toast.error(`Vui lòng chọn vật phẩm cho dòng ${i + 1}`);
          return false;
        }
        if (!detail.standardQuantity || Number(detail.standardQuantity) <= 0) {
          toast.error(`Số lượng phải lớn hơn 0 cho dòng ${i + 1}`);
          return false;
        }
      }

      // Kiểm tra trùng lặp vật phẩm
      const itemIds = formData.planDetails.map((d) => d.ppeItemId);
      const uniqueIds = new Set(itemIds);
      if (itemIds.length !== uniqueIds.size) {
        toast.error("Có vật phẩm bị trùng lặp");
        return false;
      }
    }

    return true;
  };

  // Submit form
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      if (isEditMode) {
        // Chỉ update notes
        await ppeApi.updatePlan({
          id: editData.id,
          notes: formData.notes,
        });
        toast.success("Cập nhật kế hoạch thành công");
      } else {
        // Tạo mới
        await ppeApi.createPlan({
          year: Number(formData.year),
          notes: formData.notes,
          planDetails: formData.planDetails.map((detail) => ({
            ppeItemId: Number(detail.ppeItemId),
            standardQuantity: Number(detail.standardQuantity),
          })),
        });
        toast.success("Tạo kế hoạch thành công");
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message;
      toast.error(errorMsg || (isEditMode ? "Cập nhật thất bại" : "Tạo kế hoạch thất bại"));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {isEditMode ? "Cập nhật kế hoạch bảo hộ" : "Tạo kế hoạch bảo hộ mới"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Năm */}
          <div className="space-y-2">
            <Label htmlFor="year">
              Năm kế hoạch <span className="text-red-500">*</span>
            </Label>
            <Input
              id="year"
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
              placeholder="Ví dụ: 2024"
              min="2000"
              max="2100"
              disabled={isEditMode}
              className={isEditMode ? "bg-gray-100 cursor-not-allowed" : ""}
            />
            {isEditMode && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Không thể thay đổi năm khi cập nhật
              </p>
            )}
          </div>

          {/* Ghi chú */}
          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Nhập ghi chú cho kế hoạch..."
              rows={3}
            />
          </div>

          {/* Danh sách vật phẩm */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>
                Danh sách vật phẩm <span className="text-red-500">*</span>
              </Label>
              {!isEditMode && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddItem}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Thêm vật phẩm
                </Button>
              )}
            </div>

            {isEditMode && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Không thể thêm/xóa/sửa vật phẩm khi cập nhật kế hoạch
                </p>
              </div>
            )}

            <div className="space-y-3 border rounded-lg p-4 bg-gray-50">
              {formData.planDetails.map((detail, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-white rounded-lg border"
                >
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    {/* Chọn vật phẩm */}
                    <div className="space-y-2">
                      <Label className="text-xs">
                        Vật phẩm <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={String(detail.ppeItemId)}
                        onValueChange={(value) =>
                          handleDetailChange(index, "ppeItemId", value)
                        }
                        disabled={isEditMode}
                      >
                        <SelectTrigger className={isEditMode ? "bg-gray-100" : ""}>
                          <SelectValue placeholder="Chọn vật phẩm" />
                        </SelectTrigger>
                        <SelectContent>
                          {ppeItems.map((item) => (
                            <SelectItem key={item.id} value={String(item.id)}>
                              {item.name} {item.size && `(${item.size})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Số lượng */}
                    <div className="space-y-2">
                      <Label className="text-xs">
                        Số lượng <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="number"
                        value={detail.standardQuantity}
                        onChange={(e) =>
                          handleDetailChange(
                            index,
                            "standardQuantity",
                            e.target.value
                          )
                        }
                        placeholder="Nhập số lượng"
                        min="1"
                        disabled={isEditMode}
                        className={isEditMode ? "bg-gray-100" : ""}
                      />
                    </div>
                  </div>

                  {/* Nút xóa */}
                  {!isEditMode && formData.planDetails.length > 1 && (
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

              {formData.planDetails.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  Chưa có vật phẩm nào
                </p>
              )}
            </div>

            {!isEditMode && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">
                  Tổng: {formData.planDetails.length} vật phẩm
                </Badge>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading
              ? "Đang xử lý..."
              : isEditMode
              ? "Cập nhật"
              : "Tạo kế hoạch"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}