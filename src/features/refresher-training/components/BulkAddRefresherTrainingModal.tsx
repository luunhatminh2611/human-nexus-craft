import { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/tables/table';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Button } from '@/shared/components/ui/button/Button2';
import {
  Loader2,
  Plus,
  X,
  Copy,
  User,
  ChevronDown,
  Search,
  GraduationCap,
} from 'lucide-react';
import { toast } from 'sonner';
import { employeeApi } from '@/features/employees/api/employeeApi';
import { Textarea } from '@/components/ui/textarea';

interface LookupOption {
  code: string;
  name: string;
}

export interface TrainingEmployee {
  id?: number;

  employeeId: number;
  employeeName: string;
  employeeCode: string;

  educationSystem: {
    code: string;
    name: string;
  };

  trainingMethod: {
    code: string;
    name: string;
  };

  trainingSchool: {
    code: string;
    name: string;
  };

  educationLevel: {
    code: string;
    name: string;
  };

  trainingMajor: {
    code: string;
    name: string;
  };

  className: string;
  studyDuration: string;
  note: string;
}

interface TrainingEmployeeRow extends TrainingEmployee {
  tempId: number;

  rowStatus: 'pending' | 'success' | 'error';
  errorMessage?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;

  // phase 1
  mode?: 'create' | 'edit';

  // phase 1
  initialRows?: TrainingEmployee[];
}

const educationSystems: LookupOption[] = [
  {
    code: 'HDT001',
    name: 'Đại học chính quy',
  },
  {
    code: 'HDT002',
    name: 'Liên thông',
  },
  {
    code: 'HDT003',
    name: 'Tại chức',
  },
];

const trainingMethods: LookupOption[] = [
  {
    code: 'HT001',
    name: 'Tập trung',
  },
  {
    code: 'HT002',
    name: 'Online',
  },
  {
    code: 'HT003',
    name: 'Vừa học vừa làm',
  },
];

const trainingSchools: LookupOption[] = [
  {
    code: 'TR001',
    name: 'Đại học Bách Khoa Hà Nội',
  },
  {
    code: 'TR002',
    name: 'Đại học Quốc Gia Hà Nội',
  },
  {
    code: 'TR003',
    name: 'Học viện Công nghệ Bưu chính Viễn thông',
  },
];

const educationLevels: LookupOption[] = [
  {
    code: 'TD001',
    name: 'Kỹ sư',
  },
  {
    code: 'TD002',
    name: 'Cử nhân',
  },
  {
    code: 'TD003',
    name: 'Thạc sĩ',
  },
];

const trainingMajors: LookupOption[] = [
  {
    code: 'NDT001',
    name: 'Công nghệ thông tin',
  },
  {
    code: 'NDT002',
    name: 'An toàn thông tin',
  },
  {
    code: 'NDT003',
    name: 'Khoa học máy tính',
  },
];

function EmployeePopover({
  row,
  allEmployees,
  onSelect,
}: {
  row: TrainingEmployeeRow;
  allEmployees: any[];
  onSelect: (emp: any) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? allEmployees.filter(
        (e) =>
          e.fullName?.toLowerCase().includes(search.toLowerCase()) ||
          e.employeeCode?.toLowerCase().includes(search.toLowerCase())
      )
    : allEmployees.slice(0, 20);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`flex items-center gap-1.5 h-8 px-2 text-sm border rounded w-full min-w-[180px] hover:bg-gray-50 transition-colors text-left
         `}
        >
          <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />

          <span className="truncate flex-1">
            {row.employeeName || 'Chọn nhân viên'}
          </span>

          <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-72 p-0" align="start">
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />

            <Input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tên hoặc mã nhân viên..."
              className="pl-7 h-8 text-sm"
            />
          </div>
        </div>

        <div className="max-h-56 overflow-y-auto " onWheel={(e) => e.stopPropagation()}>
          {filtered.length > 0 ? (
            filtered.map((emp) => (
              <button
                key={emp.id}
                type="button"
                onClick={() => {
                  onSelect(emp);

                  setOpen(false);
                  setSearch('');
                }}
                className={`w-full px-3 py-2 text-left hover:bg-gray-100 transition-colors
                ${
                  row.employeeId === emp.id
                    ? 'bg-green-50'
                    : ''
                }`}
              >
                <div className="text-sm font-medium">
                  {emp.fullName}
                </div>

                <div className="text-xs text-muted-foreground">
                  {emp.employeeCode}
                </div>
              </button>
            ))
          ) : (
            <div className="text-sm text-muted-foreground text-center py-4">
              Không tìm thấy
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────

export default function BulkAddRefresherModal({
  isOpen,
  onClose,
  onSuccess,

  // phase 1
  mode = 'create',
  initialRows = [],
}: Props) {
  const [rows, setRows] = useState<TrainingEmployeeRow[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [allEmployees, setAllEmployees] = useState<any[]>([]);

  const idCounter = useRef(1);

  // ───────────────────────────────────────────────────────────
  // Effects
  // ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen) return;

    employeeApi
      .getAll()
      .then((d) => setAllEmployees(d || []))
      .catch(console.error);

    // EDIT MODE
    if (mode === 'edit' && initialRows.length > 0) {
      setRows(
        initialRows.map((item) => ({
          ...item,

          tempId: idCounter.current++,

          rowStatus: 'pending',
          errorMessage: undefined,
        }))
      );

      return;
    }

    // CREATE MODE
    setRows([makeRow()]);
  }, [isOpen, mode, initialRows]);

  // ───────────────────────────────────────────────────────────
  // Factory
  // ───────────────────────────────────────────────────────────

  const makeRow = (): TrainingEmployeeRow => ({
    tempId: idCounter.current++,

    employeeId: 0,
    employeeName: '',
    employeeCode: '',

    educationSystem: {
      code: '',
      name: '',
    },

    trainingMethod: {
      code: '',
      name: '',
    },

    trainingSchool: {
      code: '',
      name: '',
    },

    educationLevel: {
      code: '',
      name: '',
    },

    trainingMajor: {
      code: '',
      name: '',
    },

    className: '',
    studyDuration: '',
    note: '',

    rowStatus: 'pending',
  });

  // ───────────────────────────────────────────────────────────
  // Actions
  // ───────────────────────────────────────────────────────────

  const addRow = () => {
    setRows((prev) => [...prev, makeRow()]);
  };

  const removeRow = (id: number) => {
    setRows((prev) => prev.filter((r) => r.tempId !== id));
  };

  const copyRow = (id: number) => {
    const row = rows.find((r) => r.tempId === id);

    if (!row) return;

    setRows((prev) => [
      ...prev,
      {
        ...row,

        id: undefined,

        tempId: idCounter.current++,

        rowStatus: 'pending',
        errorMessage: undefined,
      },
    ]);

    toast.info('Đã sao chép dòng');
  };

  const update = (
    id: number,
    field: keyof TrainingEmployeeRow,
    value: any
  ) => {
    setRows((prev) =>
      prev.map((r) =>
        r.tempId === id
          ? {
              ...r,
              [field]: value,
            }
          : r
      )
    );
  };

  // ───────────────────────────────────────────────────────────
  // Validation
  // ───────────────────────────────────────────────────────────

  const validate = () => {
    let ok = true;

    setRows((prev) =>
      prev.map((r) => {
        const errors: string[] = [];

        if (!r.employeeId) {
          errors.push('Chưa chọn nhân viên');
        }

        if (!r.educationSystem.code) {
          errors.push('Thiếu hệ đào tạo');
        }

        if (!r.trainingMethod.code) {
          errors.push('Thiếu hình thức');
        }

        if (!r.trainingSchool.code) {
          errors.push('Thiếu trường đào tạo');
        }

        if (!r.educationLevel.code) {
          errors.push('Thiếu trình độ');
        }

        if (!r.trainingMajor.code) {
          errors.push('Thiếu ngành đào tạo');
        }

        if (!r.className.trim()) {
          errors.push('Thiếu tên lớp');
        }

        if (!r.studyDuration.trim()) {
          errors.push('Thiếu thời gian học');
        }

        if (errors.length > 0) {
          ok = false;

          return {
            ...r,

            rowStatus: 'error',
            errorMessage: errors.join(' · '),
          };
        }

        return {
          ...r,

          rowStatus: 'pending',
          errorMessage: undefined,
        };
      })
    );

    return ok;
  };

  // ───────────────────────────────────────────────────────────
  // Submit
  // ───────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!rows.length) {
      toast.error('Vui lòng thêm ít nhất một dòng');
      return;
    }

    if (!validate()) {
      toast.error('Vui lòng kiểm tra các dòng bị lỗi');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('MODE:', mode);

      console.log('Payload gửi đi:', rows);

      // phase 2
      // if (mode === 'edit') {
      //   await refresherApi.updateBulk(rows);
      // } else {
      //   await refresherApi.createBulk(rows);
      // }

      setRows((prev) =>
        prev.map((r) => ({
          ...r,

          rowStatus: 'success',
        }))
      );

      toast.success(
        mode === 'edit'
          ? `Đã cập nhật ${rows.length} dòng thành công`
          : `Đã thêm ${rows.length} dòng thành công`
      );

      onSuccess?.();

      handleClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra');

      setRows((prev) =>
        prev.map((r) => ({
          ...r,

          rowStatus: 'error',

          errorMessage:
            err?.response?.data?.message || 'Lỗi khi lưu',
        }))
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ───────────────────────────────────────────────────────────
  // Close
  // ───────────────────────────────────────────────────────────

  const handleClose = () => {
    setRows([]);
    onClose();
  };

  // ───────────────────────────────────────────────────────────
  // Stats
  // ───────────────────────────────────────────────────────────

  const successCount = rows.filter(
    (r) => r.rowStatus === 'success'
  ).length;

  const errorCount = rows.filter(
    (r) => r.rowStatus === 'error'
  ).length;

  // ───────────────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────────────

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[98vw] w-full h-[92vh] flex flex-col p-0">
        {/* Header */}

        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />

            {mode === 'edit'
              ? 'Chỉnh sửa đào tạo bồi dưỡng hàng loạt'
              : 'Thêm đào tạo bồi dưỡng hàng loạt'}
          </DialogTitle>

          <DialogDescription>
            {mode === 'edit'
              ? 'Cập nhật nhiều thông tin đào tạo bồi dưỡng cùng lúc'
              : 'Thêm nhiều thông tin đào tạo bồi dưỡng cùng lúc'}
          </DialogDescription>
        </DialogHeader>

        {/* Toolbar */}

        <div className="px-6 py-3 border-b flex items-center justify-between bg-muted/30 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={addRow}
          >
            <Plus className="h-3.5 w-3.5" />

            Thêm dòng
          </Button>

          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {successCount > 0 && (
              <span className="text-green-600 font-medium">
                ✓ {successCount}
              </span>
            )}

            {errorCount > 0 && (
              <span className="text-red-500 font-medium">
                ✗ {errorCount}
              </span>
            )}

            <span>
              Tổng: <b>{rows.length}</b>
            </span>
          </div>
        </div>

        {/* Table */}

        <div className="flex-1 overflow-auto px-6 py-4">
          {rows.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-16">
              Chưa có dữ liệu
            </div>
          ) : (
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-background z-20 w-10 border-r">
                      #
                    </TableHead>

                    <TableHead className="sticky left-10 bg-background z-20 w-24 border-r text-center">
                      Thao tác
                    </TableHead>

                    <TableHead className="min-w-[220px]">
                      Nhân viên *
                    </TableHead>

                    <TableHead className="min-w-[220px]">
                      Hệ đào tạo *
                    </TableHead>

                    <TableHead className="min-w-[220px]">
                      Hình thức *
                    </TableHead>

                    <TableHead className="min-w-[240px]">
                      Trường đào tạo *
                    </TableHead>

                    <TableHead className="min-w-[180px]">
                      Trình độ *
                    </TableHead>

                    <TableHead className="min-w-[220px]">
                      Ngành đào tạo *
                    </TableHead>

                    <TableHead className="min-w-[220px]">
                      Tên lớp *
                    </TableHead>

                    <TableHead className="min-w-[240px]">
                      Thời gian học *
                    </TableHead>

                    <TableHead className="min-w-[260px]">
                      Ghi chú
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {rows.map((row, index) => (
                    <TableRow
                      key={row.tempId}
                      className={
                        row.rowStatus === 'error'
                          ? 'bg-red-50 border-l-2 border-l-red-400'
                          : row.rowStatus === 'success'
                          ? 'bg-green-50 border-l-2 border-l-green-400'
                          : ''
                      }
                    >
                      {/* STT */}

                      <TableCell className="sticky left-0 bg-background z-10 border-r">
                        {index + 1}
                      </TableCell>

                      {/* Actions */}

                      <TableCell className="sticky left-10 bg-background z-10 border-r">
                        <div className="flex gap-0.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyRow(row.tempId)}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRow(row.tempId)}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>

                        {row.errorMessage && (
                          <p className="text-xs text-red-500 mt-1 leading-tight">
                            {row.errorMessage}
                          </p>
                        )}
                      </TableCell>

                      {/* Employee */}

                      <TableCell>
                        <EmployeePopover
                          row={row}
                          allEmployees={allEmployees}
                          onSelect={(emp) => {
                            update(row.tempId, 'employeeId', emp.id);

                            update(
                              row.tempId,
                              'employeeName',
                              emp.fullName
                            );

                            update(
                              row.tempId,
                              'employeeCode',
                              emp.employeeCode
                            );
                          }}
                        />
                      </TableCell>

                      {/* Education System */}

                      <TableCell>
                        <Select
                          value={row.educationSystem.code}
                          onValueChange={(value) => {
                            const found = educationSystems.find(
                              (x) => x.code === value
                            );

                            update(row.tempId, 'educationSystem', {
                              code: found?.code || '',
                              name: found?.name || '',
                            });
                          }}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Chọn hệ đào tạo" />
                          </SelectTrigger>

                          <SelectContent>
                            {educationSystems.map((item) => (
                              <SelectItem
                                key={item.code}
                                value={item.code}
                              >
                                {item.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>

                      {/* Training Method */}

                      <TableCell>
                        <Select
                          value={row.trainingMethod.code}
                          onValueChange={(value) => {
                            const found = trainingMethods.find(
                              (x) => x.code === value
                            );

                            update(row.tempId, 'trainingMethod', {
                              code: found?.code || '',
                              name: found?.name || '',
                            });
                          }}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Chọn hình thức" />
                          </SelectTrigger>

                          <SelectContent>
                            {trainingMethods.map((item) => (
                              <SelectItem
                                key={item.code}
                                value={item.code}
                              >
                                {item.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>

                      {/* Training School */}

                      <TableCell>
                        <Select
                          value={row.trainingSchool.code}
                          onValueChange={(value) => {
                            const found = trainingSchools.find(
                              (x) => x.code === value
                            );

                            update(row.tempId, 'trainingSchool', {
                              code: found?.code || '',
                              name: found?.name || '',
                            });
                          }}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Chọn trường" />
                          </SelectTrigger>

                          <SelectContent>
                            {trainingSchools.map((item) => (
                              <SelectItem
                                key={item.code}
                                value={item.code}
                              >
                                {item.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>

                      {/* Education Level */}

                      <TableCell>
                        <Select
                          value={row.educationLevel.code}
                          onValueChange={(value) => {
                            const found = educationLevels.find(
                              (x) => x.code === value
                            );

                            update(row.tempId, 'educationLevel', {
                              code: found?.code || '',
                              name: found?.name || '',
                            });
                          }}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Chọn trình độ" />
                          </SelectTrigger>

                          <SelectContent>
                            {educationLevels.map((item) => (
                              <SelectItem
                                key={item.code}
                                value={item.code}
                              >
                                {item.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>

                      {/* Training Major */}

                      <TableCell>
                        <Select
                          value={row.trainingMajor.code}
                          onValueChange={(value) => {
                            const found = trainingMajors.find(
                              (x) => x.code === value
                            );

                            update(row.tempId, 'trainingMajor', {
                              code: found?.code || '',
                              name: found?.name || '',
                            });
                          }}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Chọn ngành đào tạo" />
                          </SelectTrigger>

                          <SelectContent>
                            {trainingMajors.map((item) => (
                              <SelectItem
                                key={item.code}
                                value={item.code}
                              >
                                {item.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>

                      {/* Class Name */}

                      <TableCell>
                        <Input
                          value={row.className}
                          onChange={(e) =>
                            update(
                              row.tempId,
                              'className',
                              e.target.value
                            )
                          }
                          className="h-8 text-sm"
                          placeholder="Tên lớp"
                        />
                      </TableCell>

                      {/* Study Duration */}

                      <TableCell>
                        <Input
                          value={row.studyDuration}
                          onChange={(e) =>
                            update(
                              row.tempId,
                              'studyDuration',
                              e.target.value
                            )
                          }
                          className="h-8 text-sm"
                          placeholder="01/09/2020 - 30/06/2024"
                        />
                      </TableCell>

                      {/* Note */}

                      <TableCell>
                        <Textarea
                          value={row.note}
                          onChange={(e) =>
                            update(
                              row.tempId,
                              'note',
                              e.target.value
                            )
                          }
                          className="h-8 text-sm"
                          placeholder="Ghi chú"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Footer */}

        <DialogFooter className="px-6 py-4 border-t shrink-0">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Hủy
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !rows.length}
            >
              {isSubmitting && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}

              {isSubmitting
                ? mode === 'edit'
                  ? 'Đang cập nhật...'
                  : 'Đang lưu...'
                : mode === 'edit'
                ? `Cập nhật (${rows.length} dòng)`
                : `Xác nhận (${rows.length} dòng)`}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}