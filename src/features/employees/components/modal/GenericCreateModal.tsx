import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Button } from "@/shared/components/ui/button/Button2";
import { Loader2 } from "lucide-react";
import { departmentTypeApi } from "@/features/departments/api/departmentTypeApi";

const GenericCreateModal = ({ open, onOpenChange, api, config, afterCreate }) => {
  const [form, setForm] = useState(config.defaultForm || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [departments, setDepartments] = useState([]);
  const [departmentTypes, setDepartmentTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(false);

  const isDepartmentForm = config.modalTitle === "Tạo phòng ban";

  // Fetch departments và department types nếu là department form
  useEffect(() => {
    if (open && isDepartmentForm) {
      fetchDepartments();
      fetchDepartmentTypes();
    }
  }, [open, isDepartmentForm]);

  const fetchDepartments = async () => {
    try {
      const data = await api.getAll();
      setDepartments(data || []);
    } catch (err) {
      console.error("Lỗi khi tải danh sách phòng ban:", err);
    }
  };

  const fetchDepartmentTypes = async () => {
    try {
      setLoadingTypes(true);
      const data = await departmentTypeApi.getAll();
      // Chỉ lấy các loại phòng ban đang active
      const activeTypes = (data || []).filter(type => type.isActive);
      setDepartmentTypes(activeTypes);
    } catch (err) {
      console.error("Lỗi khi tải loại phòng ban:", err);
      setError("Không thể tải danh sách loại phòng ban");
    } finally {
      setLoadingTypes(false);
    }
  };

  // Reset form khi đóng/mở modal
  useEffect(() => {
    if (open) {
      setForm(config.defaultForm || {});
      setError("");
    }
  }, [open, config.defaultForm]);

  const handleChange = (field, val) => {
    setForm(prev => ({ ...prev, [field]: val }));
    setError(""); // Clear error khi user nhập liệu
  };

  const handleSubmit = async () => {
    try {
      // Custom validation nếu có
      if (config.validate) {
        const validationError = config.validate(form);
        if (validationError) {
          setError(validationError);
          return;
        }
      }

      // Validation mặc định
      if (!form.name?.trim()) {
        setError("Vui lòng nhập tên");
        return;
      }

      setLoading(true);

      // Transform payload nếu có custom transform
      const payload = config.transformPayload 
        ? config.transformPayload(form) 
        : form;

      console.log("Payload gửi lên:", JSON.stringify(payload, null, 2));

      await api.create(payload);
      
      afterCreate && afterCreate();
      onOpenChange(false);
      setForm(config.defaultForm || {});
    } catch (err) {
      console.error("Lỗi khi tạo:", err);
      const errorMsg = err?.response?.data?.message || "Có lỗi xảy ra khi tạo dữ liệu";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const FormComponent = config.FormComponent;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{config.modalTitle}</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
            {error}
          </div>
        )}

        {FormComponent ? (
          <FormComponent 
            form={form} 
            onChange={handleChange}
            departments={departments}
            departmentTypes={departmentTypes}
            loadingTypes={loadingTypes}
          />
        ) : (
          <>
            <Input
              placeholder="Tên"
              value={form.name || ""}
              onChange={e => handleChange("name", e.target.value)}
            />
            <Textarea
              placeholder="Mô tả"
              value={form.description || ""}
              onChange={e => handleChange("description", e.target.value)}
              className="mt-2"
            />
          </>
        )}

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline" disabled={loading}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={loading || loadingTypes}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {loading ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GenericCreateModal;