// EmployeeScheduleModal.tsx
import React, { useEffect, useState } from "react";
import Button from "@/shared/components/ui/button/Button";
import { Save, X, Edit, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { employeeApi } from "@/features/employees";

type DaySchedule = {
  id: number | string;
  instanceId: string;
  employeeId: number | string;
  date: string;
  location?: string;
  status?: string;
  employeeName?: string;
  createdById?: number | string;
  raw?: any;
};

type Employee = {
  id: number;
  name: string;
  position?: string;
};

type EmployeeScheduleModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    title: string,
    location: string,
    description: string,
    startDate: string,
    endDate: string,
    managerId: number
  ) => Promise<void>;
  editingSchedule: DaySchedule | null;
  selectedDay: string | null;
  isFromDayCell: boolean;
  currentDepartmentId?: number; // ID phòng ban hiện tại
  apiEndpoint?: string; // Endpoint API để lấy danh sách nhân viên
};

export default function EmployeeScheduleModal({
  isOpen,
  onClose,
  onSave,
  editingSchedule,
  selectedDay,
  isFromDayCell,
  currentDepartmentId,
}: EmployeeScheduleModalProps) {
  const [employees, setEmployees] = useState([]);
  const [selectedManagerId, setSelectedManagerId] = useState<number | null>(null);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);

  // Fetch danh sách nhân viên theo phòng ban
  useEffect(() => {
    if (isOpen && currentDepartmentId) {
      fetchEmployees();
    }
  }, [isOpen, currentDepartmentId]);

  // Set manager mặc định khi edit
  useEffect(() => {
    if (editingSchedule?.raw?.managerId) {
      setSelectedManagerId(editingSchedule.raw.managerId);
    } else {
      setSelectedManagerId(null);
    }
  }, [editingSchedule]);

  const fetchEmployees = async () => {
    setIsLoadingEmployees(true);
    try {
      const response = await employeeApi.getByDepartmentId(currentDepartmentId);

      setEmployees(response.data || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
      alert("Không thể tải danh sách nhân viên. Vui lòng thử lại.");
      setEmployees([]);
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  const handleSubmit = async () => {
    const title = (document.getElementById("modal-title") as HTMLInputElement)?.value;
    const location = (document.getElementById("modal-location") as HTMLInputElement)?.value;
    const description = (document.getElementById("modal-description") as HTMLTextAreaElement)?.value;
    const startDate = (document.getElementById("modal-start-date") as HTMLInputElement)?.value;
    const endDate = (document.getElementById("modal-end-date") as HTMLInputElement)?.value;

    if (!title?.trim()) {
      alert("Vui lòng nhập tiêu đề");
      return;
    }

    if (!location?.trim()) {
      alert("Vui lòng nhập địa điểm");
      return;
    }

    if (!startDate) {
      alert("Vui lòng chọn ngày bắt đầu");
      return;
    }

    if (!selectedManagerId) {
      alert("Vui lòng chọn người duyệt");
      return;
    }

    const finalEndDate = isFromDayCell ? startDate : (endDate || startDate);

    await onSave(title, location, description, startDate, finalEndDate, selectedManagerId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {editingSchedule ? (
              <>
                <Edit size={20} className="text-blue-600" /> Chỉnh sửa lịch công tác
              </>
            ) : (
              <>
                <Plus size={20} className="text-green-600" />
                {isFromDayCell ? "Thêm lịch công tác" : "Tạo lịch công tác"}
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Tiêu đề và Địa điểm - CÙNG HÀNG */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <Input
                id="modal-title"
                type="text"
                className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                placeholder="Nhập tiêu đề lịch công tác..."
                defaultValue={editingSchedule?.raw?.title ?? ""}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">
                Địa điểm <span className="text-red-500">*</span>
              </label>
              <Input
                id="modal-location"
                type="text"
                className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                placeholder="Nhập địa điểm..."
                defaultValue={editingSchedule?.location ?? ""}
              />
            </div>
          </div>

          {/* Ngày bắt đầu và Ngày kết thúc - CÙNG HÀNG */}
          {isFromDayCell && !editingSchedule ? (
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Ngày làm việc
              </label>
              <Input
                id="modal-start-date"
                type="date"
                className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 mt-1"
                defaultValue={selectedDay || ""}
                readOnly
              />
              <Input
                id="modal-end-date"
                type="hidden"
                value={selectedDay || ""}
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Ngày bắt đầu <span className="text-red-500">*</span>
                </label>
                <Input
                  id="modal-start-date"
                  type="date"
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 mt-1"
                  defaultValue={
                    editingSchedule?.raw?.startDateTime?.split("T")[0] || selectedDay || ""
                  }
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Ngày kết thúc
                </label>
                <Input
                  id="modal-end-date"
                  type="date"
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-white mt-1"
                  defaultValue={
                    editingSchedule?.raw?.endDateTime?.split("T")[0] || selectedDay || ""
                  }
                />
              </div>
            </div>
          )}

          {/* Hint text - Hiển thị dưới grid ngày tháng */}
          {!isFromDayCell && (
            <div className="text-xs text-gray-500 -mt-2">
              Để trống hoặc giống ngày bắt đầu → 1 ngày. Chọn khác → khoảng thời gian.
            </div>
          )}

          {/* Người duyệt - FULL WIDTH */}
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Người duyệt <span className="text-red-500">*</span>
            </label>
            <Select
              value={selectedManagerId?.toString() || ""}
              onValueChange={(value) => setSelectedManagerId(Number(value))}
              disabled={isLoadingEmployees}
            >
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder={isLoadingEmployees ? "Đang tải..." : "Chọn người duyệt"} />
              </SelectTrigger>
              <SelectContent>
                {employees.length > 0 ? (
                  employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id.toString()}>
                      {employee.fullName} {employee.position ? `(${employee.position})` : ""}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-employees" disabled>
                    Không có nhân viên
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Mô tả - FULL WIDTH */}
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Mô tả
            </label>
            <textarea
              id="modal-description"
              className="w-full border rounded-lg px-3 py-2 text-sm mt-1 resize-none"
              placeholder="Nhập mô tả công việc..."
              rows={3}
              defaultValue={editingSchedule?.raw?.description ?? ""}
            />
          </div>

          {/* Thông báo trạng thái */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800">
            <p className="font-medium">📋 Lưu ý:</p>
            <p>Lịch công tác sẽ ở trạng thái <strong>"Chờ xác nhận"</strong> cho đến khi người duyệt xác nhận.</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            <X size={16} className="mr-1" /> Hủy
          </Button>
          <Button onClick={handleSubmit}>
            <Save size={16} className="mr-1" /> {editingSchedule ? "Cập nhật" : "Tạo lịch"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}