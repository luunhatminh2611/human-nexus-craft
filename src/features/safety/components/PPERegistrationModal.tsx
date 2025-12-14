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
import { toast } from "sonner";
import { Badge } from "@/shared/components/ui/badge";

interface PPERegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  planId: number;
  planDetails?: any[]; // Danh sách vật phẩm từ kế hoạch
  editData?: any; // Dữ liệu khi edit
}

interface RegistrationDetail {
  ppeItemId: number | string;
  requestedQuantity: number | string;
}

export default function PPERegistrationModal({
  isOpen,
  onClose,
  onSuccess,
  planId,
  planDetails = [],
  editData,
}: PPERegistrationModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    notes: "",
    registrationDetails: [{ ppeItemId: "", requestedQuantity: "" }] as RegistrationDetail[],
  });

  const isEditMode = !!editData;

  // Load dữ liệu khi edit
  useEffect(() => {
    if (editData && isOpen) {
      setFormData({
        notes: editData.notes || "",
        registrationDetails: editData.registrationDetails?.map((detail: any) => ({
          ppeItemId: detail.ppeItemId,
          requestedQuantity: detail.requestedQuantity,
        })) || [{ ppeItemId: "", requestedQuantity: "" }],
      });
    } else if (isOpen) {
      // Reset form khi tạo mới
      setFormData({
        notes: "",
        registrationDetails: [{ ppeItemId: "", requestedQuantity: "" }],
      });
    }
  }, [editData, isOpen]);

  // Thêm vật phẩm mới
  const handleAddItem = () => {
    setFormData({
      ...formData,
      registrationDetails: [
        ...formData.registrationDetails,
        { ppeItemId: "", requestedQuantity: "" },
      ],
    });
  };

  // Xóa vật phẩm
  const handleRemoveItem = (index: number) => {
    const newDetails = formData.registrationDetails.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      registrationDetails: newDetails.length > 0 ? newDetails : [{ ppeItemId: "", requestedQuantity: "" }],
    });
  };

  // Cập nhật thông tin vật phẩm
  const handleDetailChange = (
    index: number,
    field: keyof RegistrationDetail,
    value: string | number
  ) => {
    const newDetails = [...formData.registrationDetails];
    newDetails[index] = {
      ...newDetails[index],
      [field]: value,
    };
    setFormData({ ...formData, registrationDetails: newDetails });
  };

  // Lấy số lượng chuẩn từ plan
  const getStandardQuantity = (ppeItemId: number | string) => {
    const planDetail = planDetails.find(
      (detail) => detail.ppeItemId === Number(ppeItemId)
    );
    return planDetail?.standardQuantity || 0;
  };

  // Lấy tên vật phẩm
  const getItemName = (ppeItemId: number | string) => {
    const planDetail = planDetails.find(
      (detail) => detail.ppeItemId === Number(ppeItemId)
    );
    return planDetail?.ppeItemName || '';
  };

  // Validate form
  const validateForm = () => {
    if (formData.registrationDetails.length === 0) {
      toast.error("Vui lòng thêm ít nhất một vật phẩm");
      return false;
    }

    for (let i = 0; i < formData.registrationDetails.length; i++) {
      const detail = formData.registrationDetails[i];
      
      if (!detail.ppeItemId) {
        toast.error(`Vui lòng chọn vật phẩm cho dòng ${i + 1}`);
        return false;
      }
      
      if (!detail.requestedQuantity || Number(detail.requestedQuantity) <= 0) {
        toast.error(`Số lượng phải lớn hơn 0 cho dòng ${i + 1}`);
        return false;
      }

      // Kiểm tra số lượng yêu cầu không vượt quá số lượng chuẩn
      const standardQty = getStandardQuantity(detail.ppeItemId);
      if (Number(detail.requestedQuantity) > standardQty) {
        toast.warning(
          `Số lượng yêu cầu cho "${getItemName(detail.ppeItemId)}" vượt quá số lượng chuẩn (${standardQty})`
        );
        // Không return false, chỉ cảnh báo
      }
    }

    // Kiểm tra trùng lặp vật phẩm
    const itemIds = formData.registrationDetails.map((d) => d.ppeItemId);
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

      if (isEditMode) {
        // Cập nhật (chỉ notes theo API)
        await ppeApi.updateRegistration({
          id: editData.id,
          notes: formData.notes,
        });
        toast.success("Cập nhật đơn đăng ký thành công");
      } else {
        // Tạo mới
        await ppeApi.createRegistration({
          planId: planId,
          notes: formData.notes,
          registrationDetails: formData.registrationDetails.map((detail) => ({
            ppeItemId: Number(detail.ppeItemId),
            requestedQuantity: Number(detail.requestedQuantity),
          })),
        });
        toast.success("Tạo đơn đăng ký thành công");
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message;
      toast.error(errorMsg || (isEditMode ? "Cập nhật thất bại" : "Tạo đơn đăng ký thất bại"));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {isEditMode ? "Cập nhật đơn đăng ký" : "Tạo đơn đăng ký bảo hộ"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Ghi chú */}
          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Nhập ghi chú cho đơn đăng ký..."
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
                  Chỉ có thể cập nhật ghi chú. Không thể thêm/xóa/sửa vật phẩm khi cập nhật.
                </p>
              </div>
            )}

            <div className="space-y-3 border rounded-lg p-4 bg-gray-50">
              {formData.registrationDetails.map((detail, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-white rounded-lg border"
                >
                  <div className="flex-1 grid grid-cols-3 gap-3">
                    {/* Chọn vật phẩm */}
                    <div className="space-y-2 col-span-2">
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
                          {planDetails.map((item) => (
                            <SelectItem key={item.ppeItemId} value={String(item.ppeItemId)}>
                              <div className="flex items-center justify-between w-full gap-4">
                                <span>{item.ppeItemName}</span>
                                {item.ppeItemSize && (
                                  <Badge variant="outline" className="text-xs">
                                    {item.ppeItemSize}
                                  </Badge>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  Chuẩn: {item.standardQuantity}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {/* Hiển thị số lượng chuẩn */}
                      {detail.ppeItemId && (
                        <p className="text-xs text-muted-foreground">
                          Số lượng chuẩn: <strong>{getStandardQuantity(detail.ppeItemId)}</strong>
                        </p>
                      )}
                    </div>

                    {/* Số lượng yêu cầu */}
                    <div className="space-y-2">
                      <Label className="text-xs">
                        Số lượng yêu cầu <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="number"
                        value={detail.requestedQuantity}
                        onChange={(e) =>
                          handleDetailChange(
                            index,
                            "requestedQuantity",
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
                  {!isEditMode && formData.registrationDetails.length > 1 && (
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

              {formData.registrationDetails.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  Chưa có vật phẩm nào
                </p>
              )}
            </div>

            {!isEditMode && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">
                  Tổng: {formData.registrationDetails.length} vật phẩm
                </Badge>
              </div>
            )}
          </div>

          {/* Lưu ý */}
          {!isEditMode && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                <strong>Lưu ý:</strong> Sau khi tạo đơn, bạn cần gửi đơn để admin phê duyệt. 
                Đơn ở trạng thái "Nháp" có thể chỉnh sửa ghi chú trước khi gửi.
              </p>
            </div>
          )}
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
              : "Tạo đơn đăng ký"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}