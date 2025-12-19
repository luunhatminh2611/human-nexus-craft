import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button/Button2';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Input } from '@/shared/components/ui/input';
import { Search, Users, UserCheck } from 'lucide-react';
import { employeeApi } from '@/features/employees/api/employeeApi';
import { trainingApi } from '../api/trainingApi';
import { useAuthStore } from '@/features/employees/hooks/useAuth';

/* ================= TYPES ================= */

interface Employee {
  employeeId: number;
  fullName: string;
  email?: string;
  position?: string;
  status: 'ASSIGNED' | 'UNASSIGNED';
}

interface AssignEmployeesModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string | number;
  onSuccess: () => void;
}

/* ================= COMPONENT ================= */

export default function AssignEmployeesModal({
  isOpen,
  onClose,
  courseId,
  onSuccess,
}: AssignEmployeesModalProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  const { user } = useAuthStore();

  /* ================= FETCH ================= */

  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
    }
  }, [isOpen]);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);

      if (!user?.employeeId) return;

      // 1. Lấy departmentId của user
      const profileRes = await employeeApi.getById(user.employeeId);
      const departmentId = profileRes.data?.departmentId;
      if (!departmentId) return;

      // 2. Lấy danh sách nhân viên + trạng thái training
      const res = await trainingApi.getEmployeesWithTrainingStatus(
        courseId,
        departmentId
      );

      const list: Employee[] = Array.isArray(res.data)
        ? res.data
        : [];

      setEmployees(list);
    } catch (error) {
      console.error('Lỗi khi tải danh sách nhân viên:', error);
      alert('Không thể tải danh sách nhân viên');
    } finally {
      setIsLoading(false);
    }
  };

  /* ================= HANDLERS ================= */

  const handleToggleEmployee = (employeeId: number) => {
    setSelectedEmployees((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedEmployees([]);
    } else {
      const selectableIds = employees
        .filter((e) => e.status === 'UNASSIGNED')
        .map((e) => e.employeeId);

      setSelectedEmployees(selectableIds);
    }
    setSelectAll(!selectAll);
  };

  const handleSubmit = async () => {
    if (selectedEmployees.length === 0) {
      alert('Vui lòng chọn ít nhất một nhân viên');
      return;
    }

    if (
      !confirm(
        `Bạn có chắc chắn muốn giao khóa học cho ${selectedEmployees.length} nhân viên?`
      )
    ) {
      return;
    }

    try {
      setIsSubmitting(true);
      await trainingApi.assignEmployees({
        courseId: Number(courseId),
        employeeIds: selectedEmployees,
      });

      alert('Giao khóa học thành công');
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Lỗi khi giao khóa học:', error);
      alert('Lỗi khi giao khóa học cho nhân viên');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedEmployees([]);
    setSearchKeyword('');
    setSelectAll(false);
    onClose();
  };

  /* ================= SELECT ALL STATE ================= */

  useEffect(() => {
    const selectable = employees.filter((e) => e.status === 'UNASSIGNED');
    const allSelected =
      selectable.length > 0 &&
      selectable.every((e) => selectedEmployees.includes(e.employeeId));

    setSelectAll(allSelected);
  }, [employees, selectedEmployees]);

  /* ================= UI ================= */

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Giao khóa học cho nhân viên
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Select all */}
          <div className="flex items-center justify-between mb-3 pb-3 border-b">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectAll}
                onCheckedChange={handleSelectAll}
                disabled={isLoading || employees.length === 0}
              />
              <span className="text-sm font-medium">
                Chọn tất cả
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              Đã chọn: {selectedEmployees.length}
            </span>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto border rounded-lg">
            {isLoading ? (
              <p className="p-4 text-center text-muted-foreground">Đang tải...</p>
            ) : employees.length === 0 ? (
              <p className="p-4 text-center text-muted-foreground">
                Không có nhân viên
              </p>
            ) : (
              <div className="divide-y">
                {employees.map((employee) => {
                  const disabled = employee.status === 'ASSIGNED';

                  return (
                    <div
                      key={employee.employeeId}
                      className={`p-3 flex gap-3 ${
                        disabled
                          ? 'opacity-50 cursor-not-allowed'
                          : 'cursor-pointer hover:bg-muted/50'
                      }`}
                      onClick={() => {
                        if (!disabled) {
                          handleToggleEmployee(employee.employeeId);
                        }
                      }}
                    >
                      <Checkbox
                        checked={selectedEmployees.includes(employee.employeeId)}
                        disabled={disabled}
                        onClick={(e) => e.stopPropagation()}
                        onCheckedChange={() =>
                          handleToggleEmployee(employee.employeeId)
                        }
                      />

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{employee.fullName}</p>
                          {disabled && (
                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                              Đã giao
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {employee.email || '—'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {employee.position}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || selectedEmployees.length === 0}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <UserCheck className="h-4 w-4 mr-2" />
            Giao khóa học
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
