import { useState, useMemo, useEffect } from 'react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button/Button2';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown/dropdown-menu';
import { Eye, Settings, Save, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { employeeApi } from '../../api/employeeApi';
import { toast } from '@/shared/components/ui/use-toast';
import GenericSearchSelect from "@/features/employees/components/GenericSearchSelect";
import { categoryConfigs } from "@/features/employees/components/CategoriesConfig";

type UpdateEmployeeListRequest = {
  payload: any[];
};
// Mapping giữa getAll fields và getById fields
const FIELD_MAPPING = {
  'employeeCode': 'code',
  'fullName': 'name',
  'dateOfBirth': 'birthday',
  'cccdPlace': 'cccdPlace', // Lưu ý: API có typo 'Palce'
};

// Định nghĩa tất cả các cột có thể hiển thị
const ALL_COLUMNS = [
  { key: 'employeeCode', label: 'Mã nhân viên', defaultVisible: true, editable: true, type: 'text' },
  { key: 'fullName', label: 'Họ và tên', defaultVisible: true, editable: true, type: 'text' },
  { key: 'dateOfBirth', label: 'Ngày sinh', defaultVisible: true, editable: true, type: 'date' },
  { key: 'gender', label: 'Giới tính', defaultVisible: true, editable: true, type: 'select', options: ['NAM', 'NỮ', 'KHÁC'] },
  { key: 'cccdNumber', label: 'CCCD/CMND', defaultVisible: false, editable: true, type: 'text' },
  { key: 'cccdDate', label: 'Ngày cấp CCCD', defaultVisible: false, editable: true, type: 'date' },
  { key: 'cccdPlace', label: 'Nơi cấp CCCD', defaultVisible: false, editable: true, type: 'text' },
  { key: 'ethnicity', label: 'Dân tộc', defaultVisible: false, editable: true, type: 'searchSelect', config: 'ethnicity' },
  { key: 'religion', label: 'Tôn giáo', defaultVisible: false, editable: true, type: 'text' },
  { key: 'nationalityId', label: 'Quốc tịch', defaultVisible: false, editable: true, type: 'searchSelect', config: 'nationality' },
  { key: 'provinceCityId', label: 'Tỉnh/Thành phố', defaultVisible: false, editable: true, type: 'searchSelect', config: 'provinceCity' },
  { key: 'wardId', label: 'Phường/Xã', defaultVisible: false, editable: true, type: 'searchSelect', config: 'ward' },
  { key: 'contactAddress', label: 'Địa chỉ cụ thể', defaultVisible: false, editable: true, type: 'text' },
  { key: 'departmentId', label: 'Phòng ban', defaultVisible: true, editable: true, type: 'searchSelect', config: 'department' },
  { key: 'positionId', label: 'Chức vụ', defaultVisible: true, editable: true, type: 'searchSelect', config: 'jobTitle' },
  { key: 'startDate', label: 'Ngày vào làm', defaultVisible: true, editable: true, type: 'date' },
  { key: 'educationLevelId', label: 'Trình độ học vấn', defaultVisible: false, editable: true, type: 'searchSelect', config: 'degree' },
  { key: 'specialtyId', label: '', defaultVisible: false, editable: true, type: 'searchSelect', config: 'specialty' },
  { key: 'languageLevelId', label: 'Trình độ ngoại ngữ', defaultVisible: false, editable: true, type: 'searchSelect', config: 'languageLevel' },
  { key: 'politicalTheoryId', label: 'Lý luận chính trị', defaultVisible: false, editable: true, type: 'searchSelect', config: 'politicalTheory' },
  { key: 'accountStatus', label: 'Trạng thái tài khoản', defaultVisible: true, editable: false, type: 'badge' },
  { key: 'actions', label: 'Thao tác', defaultVisible: true, editable: false, type: 'actions' },
];

export default function EmployeeInlineEditTable({
  employees,
  onView,
  refetchEmployees
}) {
  const queryClient = useQueryClient();

  // State quản lý cột hiển thị
  const [visibleColumns, setVisibleColumns] = useState(
    ALL_COLUMNS.filter(col => col.defaultVisible).map(col => col.key)
  );

  // State lưu trữ thông tin chi tiết của nhân viên (từ getById)
  const [employeeDetails, setEmployeeDetails] = useState<Record<number, any>>({});

  // State quản lý dữ liệu đã chỉnh sửa
  const [editedRows, setEditedRows] = useState<Record<number, any>>({});

  // State quản lý ô đang được chỉnh sửa
  const [editingCell, setEditingCell] = useState<{ rowId: number; columnKey: string } | null>(null);

  // State loading detail
  const [loadingDetails, setLoadingDetails] = useState<Set<number>>(new Set());

  // Mutation để cập nhật list
  const updateListMutation = useMutation({
    mutationFn: (data: UpdateEmployeeListRequest) =>
      employeeApi.updateList(data),
    onSuccess: () => {
      toast({
        title: 'Thành công',
        description: 'Cập nhật danh sách nhân viên thành công',
      });
      setEditedRows({});
      setEmployeeDetails({});
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      if (refetchEmployees) refetchEmployees();
    },
  });

  // Load chi tiết nhân viên khi cần
  const loadEmployeeDetail = async (employeeId: number) => {
    if (employeeDetails[employeeId] || loadingDetails.has(employeeId)) {
      return; // Đã load hoặc đang load
    }

    setLoadingDetails(prev => new Set(prev).add(employeeId));

    try {
      const detail = await employeeApi.getById(employeeId);
      setEmployeeDetails(prev => ({
        ...prev,
        [employeeId]: detail
      }));
    } catch (error) {
      console.error('Failed to load employee detail:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải thông tin chi tiết nhân viên',
        variant: 'destructive',
      });
    } finally {
      setLoadingDetails(prev => {
        const newSet = new Set(prev);
        newSet.delete(employeeId);
        return newSet;
      });
    }
  };

  // Toggle hiển thị cột
  const toggleColumn = (columnKey: string) => {
    setVisibleColumns(prev =>
      prev.includes(columnKey)
        ? prev.filter(k => k !== columnKey)
        : [...prev, columnKey]
    );
  };

  // Merge dữ liệu từ getAll và getById
  const getMergedEmployee = (employee: any) => {
    const detail = employeeDetails[employee.id];
    if (!detail) return employee;

    // Merge và map field names
    const merged = { ...employee };

    Object.entries(FIELD_MAPPING).forEach(([getAllField, getByIdField]) => {
      if (detail[getByIdField] !== undefined) {
        merged[getAllField] = detail[getByIdField];
      }
    });

    // Copy các fields khác từ detail
    Object.keys(detail).forEach(key => {
      if (key.endsWith('Id') || key.endsWith('Name')) {
        merged[key] = detail[key];
      }
    });

    return merged;
  };

  // Lấy giá trị hiện tại của một ô (đã chỉnh sửa hoặc gốc)
  const getCellValue = (employee: any, columnKey: string) => {
    if (editedRows[employee.id]?.[columnKey] !== undefined) {
      return editedRows[employee.id][columnKey];
    }

    const mergedEmployee = getMergedEmployee(employee);
    return mergedEmployee[columnKey];
  };

  // Cập nhật giá trị của một ô
  const updateCellValue = (employeeId: number, columnKey: string, value: any) => {
    setEditedRows(prev => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        [columnKey]: value
      }
    }));
  };

  // Map employee thành payload để gửi API
  const mapEmployeeToPayload = (employee, detail, edits = {}) => {
    const merged = { ...employee, ...detail, ...edits };

    const genderMap = {
      NAM: 'Nam',
      NỮ: 'Nữ',
      KHÁC: 'Khác',
    };

    return {
      id: Number(merged.id),
      code: merged.code || merged.employeeCode,
      fullName: merged.name || merged.fullName,
      birthDate: merged.birthday || merged.dateOfBirth,
      gender: genderMap[merged.gender] || 'Nam',
      status: 'Đang làm việc',
      startDate: merged.startDate,
      endDate: merged.endDate || null,

      cccdNumber: merged.cccdNumber || null,
      cccdDate: merged.cccdDate || null,
      cccdPlace: merged.cccdPlace || merged.cccdPlace || null,
      contactAddress: merged.contactAddress || null,
      ethnicity: merged.ethnicity || null,
      religion: merged.religion || null,
      familyBackground: merged.familyBackground || null,

      department: merged.departmentId ? { id: +merged.departmentId } : null,
      position: merged.positionId ? { id: +merged.positionId } : null,
      ward: merged.wardId ? { id: +merged.wardId } : null,
      provinceCity: merged.provinceCityId ? { id: +merged.provinceCityId } : null,
      specialty: merged.specialtyId ? { id: +merged.specialtyId } : null,
      educationLevel: merged.educationLevelId ? { id: +merged.educationLevelId } : null,
      politicalTheory: merged.politicalTheoryId ? { id: +merged.politicalTheoryId } : null,
      languageLevel: merged.languageLevelId ? { id: +merged.languageLevelId } : null,
      nationality: merged.nationalityId ? { id: +merged.nationalityId } : null,
      user: merged.userId ? { id: merged.userId } : null,

      trainingInstitution: merged.trainingInstitutionId
        ? { id: +merged.trainingInstitutionId }
        : null,

      trainingType: merged.trainingTypeId
        ? { id: +merged.trainingTypeId }
        : null,

      trainingSystem: merged.trainingSystemId
        ? { id: +merged.trainingSystemId }
        : null,

      unit: null,
      partyPosition: null,
      academicTitle: null,
      politicalSocialOrg: null,
      assetType: null,
    };
  };

  // Lưu tất cả thay đổi
  const handleSaveAll = async () => {
    const editedEmployeeIds = Object.keys(editedRows).map(Number);

    if (editedEmployeeIds.length === 0) {
      toast({
        title: 'Thông báo',
        description: 'Không có thay đổi nào để lưu',
      });
      return;
    }

    // Load tất cả detail cần thiết trước khi save
    const detailPromises = editedEmployeeIds.map(async (empId) => {
      if (!employeeDetails[empId]) {
        await loadEmployeeDetail(empId);
      }
    });

    try {
      await Promise.all(detailPromises);

      // Tạo payload với tất cả nhân viên đã chỉnh sửa
      const payload = editedEmployeeIds.map(empId => {
        const originalEmployee = employees.find(e => e.id === empId);
        const detail = employeeDetails[empId];
        const edits = editedRows[empId];
        return mapEmployeeToPayload(originalEmployee, detail, edits);
      });

      updateListMutation.mutate({
        payload
      });

    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải đủ thông tin để cập nhật',
        variant: 'destructive',
      });
    }
  };

  // Render cell dựa trên loại
  const renderEditableCell = (employee: any, column: any) => {
    const value = getCellValue(employee, column.key);
    const isEditing = editingCell?.rowId === employee.id && editingCell?.columnKey === column.key;
    const isLoadingDetail = loadingDetails.has(employee.id);

    if (!column.editable) {
      return renderReadOnlyCell(employee, column);
    }

    const handleStartEdit = async () => {
      // Load detail nếu chưa có
      if (!employeeDetails[employee.id]) {
        await loadEmployeeDetail(employee.id);
      }
      setEditingCell({ rowId: employee.id, columnKey: column.key });
    };

    const handleFinishEdit = () => {
      setEditingCell(null);
    };

    // Hiển thị loading khi đang tải detail
    if (isLoadingDetail && !employeeDetails[employee.id]) {
      return (
        <div className="flex items-center gap-2 p-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-muted-foreground">Đang tải...</span>
        </div>
      );
    }

    switch (column.type) {
      case 'text':
        return isEditing ? (
          <Input
            value={value || ''}
            onChange={(e) => updateCellValue(employee.id, column.key, e.target.value)}
            onBlur={handleFinishEdit}
            autoFocus
            className="h-8 text-sm"
          />
        ) : (
          <div
            onClick={handleStartEdit}
            className="cursor-pointer hover:bg-muted/50 p-2 rounded min-h-[32px]"
          >
            {value || '-'}
          </div>
        );

      case 'date':
        return isEditing ? (
          <Input
            type="date"
            value={value || ''}
            onChange={(e) => updateCellValue(employee.id, column.key, e.target.value)}
            onBlur={handleFinishEdit}
            autoFocus
            className="h-8 text-sm"
          />
        ) : (
          <div
            onClick={handleStartEdit}
            className="cursor-pointer hover:bg-muted/50 p-2 rounded min-h-[32px]"
          >
            {value ? new Date(value).toLocaleDateString('vi-VN') : '-'}
          </div>
        );

      case 'select':
        return (
          <Select
            value={value || ''}
            onValueChange={(newValue) => updateCellValue(employee.id, column.key, newValue)}
            onOpenChange={(open) => {
              if (open) handleStartEdit();
            }}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Chọn..." />
            </SelectTrigger>
            <SelectContent>
              {column.options?.map((opt: string) => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'searchSelect':
        return (
          <div
            className="min-w-[200px]"
            onClick={() => !employeeDetails[employee.id] && handleStartEdit()}
          >
            <GenericSearchSelect
              api={categoryConfigs[column.config].api}
              config={categoryConfigs[column.config]}
              value={value?.toString() || ''}
              onChange={(newValue) => updateCellValue(employee.id, column.key, String(newValue))}
            />
          </div>
        );

      default:
        return <span>{value || '-'}</span>;
    }
  };

  // Render cell chỉ đọc
  const renderReadOnlyCell = (employee: any, column: any) => {
    switch (column.key) {
      case 'accountStatus':
        const hasAccount = employee.email != null && employee.email !== '';
        return hasAccount ? (
          <Badge className="flex items-center gap-1 w-fit">
            <CheckCircle className="h-3 w-3" />
            Đã tạo
          </Badge>
        ) : (
          <Badge variant="secondary" className="flex items-center gap-1 w-fit">
            <XCircle className="h-3 w-3" />
            Chưa tạo
          </Badge>
        );

      case 'actions':
        return (
          <div className="flex gap-1">
            {onView && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onView(employee.id!)}
                title="Xem chi tiết"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
          </div>
        );

      default:
        return <span>-</span>;
    }
  };

  // Các cột được hiển thị
  const displayedColumns = useMemo(() =>
    ALL_COLUMNS.filter(col => visibleColumns.includes(col.key)),
    [visibleColumns]
  );

  const hasChanges = Object.keys(editedRows).length > 0;

  return (
    <div className="space-y-4">
      {/* Header controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Tùy chỉnh cột ({visibleColumns.length}/{ALL_COLUMNS.length})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[250px] max-h-[400px] overflow-y-auto">
              {ALL_COLUMNS.map(column => (
                <DropdownMenuCheckboxItem
                  key={column.key}
                  checked={visibleColumns.includes(column.key)}
                  onCheckedChange={() => toggleColumn(column.key)}
                >
                  {column.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {hasChanges && (
            <Badge variant="secondary">
              {Object.keys(editedRows).length} dòng đã chỉnh sửa
            </Badge>
          )}
        </div>

        <Button
          onClick={handleSaveAll}
          disabled={!hasChanges || updateListMutation.isPending}
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          {updateListMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Lưu tất cả
            </>
          )}
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              {displayedColumns.map(column => (
                <th key={column.key} className="px-4 py-3 text-left text-sm font-medium whitespace-nowrap">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.map((employee, idx) => (
              <tr
                key={employee.id}
                className={`border-t hover:bg-muted/30 ${editedRows[employee.id] ? 'bg-yellow-50' : ''}`}
              >
                {displayedColumns.map(column => (
                  <td key={column.key} className="px-4 py-2 text-sm">
                    {renderEditableCell(employee, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {employees.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Không có dữ liệu
        </div>
      )}
    </div>
  );
}