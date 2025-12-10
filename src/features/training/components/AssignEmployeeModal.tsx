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
import { employeeApi } from '@/features/employees/api/employeeApi'; // Adjust path as needed
import { trainingApi } from '../api/trainingApi';

interface Employee {
  id: number;
  code: string;
  name: string;
  email: string;
  departmentName?: string;
  positionName?: string;
}

interface AssignEmployeesModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string | number;
  onSuccess: () => void;
}

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

  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
    }
  }, [isOpen]);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      // Assuming employeeApi has a getAll method
      const response = await employeeApi.getAll();
      
      // Adjust based on your API response structure
      const employeeList = response.items || response.data || response;
      setEmployees(employeeList);
    } catch (error) {
      console.error('Lỗi khi tải danh sách nhân viên:', error);
      alert('Không thể tải danh sách nhân viên');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const keyword = searchKeyword.toLowerCase();
    return (
      emp.name?.toLowerCase().includes(keyword) ||
      emp.code?.toLowerCase().includes(keyword) ||
      emp.email?.toLowerCase().includes(keyword) ||
      emp.departmentName?.toLowerCase().includes(keyword)
    );
  });

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredEmployees.map((emp) => emp.id));
    }
    setSelectAll(!selectAll);
  };

  const handleToggleEmployee = (employeeId: number) => {
    setSelectedEmployees((prev) => {
      if (prev.includes(employeeId)) {
        return prev.filter((id) => id !== employeeId);
      } else {
        return [...prev, employeeId];
      }
    });
  };

  const handleSubmit = async () => {
    if (selectedEmployees.length === 0) {
      alert('Vui lòng chọn ít nhất một nhân viên');
      return;
    }

    if (
      !confirm(
        `Bạn có chắc chắn muốn giao khóa học này cho ${selectedEmployees.length} nhân viên?`
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

  useEffect(() => {
    if (filteredEmployees.length > 0) {
      const allSelected = filteredEmployees.every((emp) =>
        selectedEmployees.includes(emp.id)
      );
      setSelectAll(allSelected);
    }
  }, [selectedEmployees, filteredEmployees]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Giao khóa học cho nhân viên
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm nhân viên theo tên, mã, email, phòng ban..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Select All */}
          <div className="flex items-center justify-between mb-3 pb-3 border-b">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectAll}
                onCheckedChange={handleSelectAll}
                disabled={isLoading || filteredEmployees.length === 0}
              />
              <label className="text-sm font-medium cursor-pointer">
                Chọn tất cả ({filteredEmployees.length} nhân viên)
              </label>
            </div>
            <div className="text-sm text-muted-foreground">
              Đã chọn: <span className="font-semibold">{selectedEmployees.length}</span>
            </div>
          </div>

          {/* Employee List */}
          <div className="flex-1 overflow-y-auto border rounded-lg">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  <p className="text-sm text-muted-foreground">Đang tải...</p>
                </div>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="flex items-center justify-center h-40">
                <p className="text-muted-foreground">Không tìm thấy nhân viên</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    className="p-3 hover:bg-muted/50 cursor-pointer flex items-start gap-3"
                    onClick={() => handleToggleEmployee(employee.id)}
                  >
                    <Checkbox
                      checked={selectedEmployees.includes(employee.id)}
                      onCheckedChange={() => handleToggleEmployee(employee.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{employee.name}</p>
                        <span className="text-xs text-muted-foreground">
                          ({employee.code})
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{employee.email}</p>
                      <div className="flex gap-2 mt-1">
                        {employee.departmentName && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                            {employee.departmentName}
                          </span>
                        )}
                        {employee.positionName && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                            {employee.positionName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
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
            {isSubmitting
              ? 'Đang giao...'
              : `Giao cho ${selectedEmployees.length} nhân viên`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}