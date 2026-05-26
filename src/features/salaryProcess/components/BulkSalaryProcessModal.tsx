import { useEffect, useRef, useState } from "react";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Loader2,
  X,
  Plus,
  Download,
  Upload,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  DollarSign,
  Copy,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/tables/table";
import { Button } from "@/shared/components/ui/button/Button2";
import GenericSearchSelect from "@/features/employees/components/GenericSearchSelect";
import { categoryConfigs } from "@/features/employees/components/CategoriesConfig";
import { toast } from "@/shared/components/ui/use-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SalaryRecordType = {
  tempId: number;
  // Nhân viên
  employeeId: number | null;
  employeeName: string;
  employeeCode: string;

  // Lương tại đơn vị
  salaryTableId: string;
  salaryLevelId: string;
  salaryScaleId: string;
  salaryCoefficient: string;
  salaryAmount: string;
  effectiveDate: string;

  // Lương BHXH
  insuranceSalaryTableId: string;
  insuranceSalaryLevelId: string;
  insuranceSalaryScaleId: string;
  insuranceCoefficient: string;
  insuranceSalaryAmount: string;
  insurancePlaceId: string;
  insuranceCode: string;

  // Công đoàn
  unionFinanceSalary: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  // Khi edit: truyền vào các row đã chọn từ bảng chính
  initialRows?: SalaryRecordType[];
};

// ─── Columns config ────────────────────────────────────────────────────────────

const UNIT_SALARY_COLUMNS = [
  { key: "salaryTableId", label: "Bảng lương" },
  { key: "salaryLevelId", label: "Bậc lương" },
  { key: "salaryScaleId", label: "Thang bảng lương" },
  { key: "salaryCoefficient", label: "Hệ số" },
  { key: "salaryAmount", label: "Mức lương" },
  { key: "effectiveDate", label: "Ngày áp dụng" },
];

const INSURANCE_COLUMNS = [
  { key: "insuranceSalaryTableId", label: "Bảng lương BHXH" },
  { key: "insuranceSalaryLevelId", label: "Bậc BHXH" },
  { key: "insuranceSalaryScaleId", label: "Thang BHXH" },
  { key: "insuranceCoefficient", label: "Hệ số BH" },
  { key: "insuranceSalaryAmount", label: "Mức đóng BHXH" },
  { key: "insurancePlaceId", label: "Nơi đóng BHXH" },
  { key: "insuranceCode", label: "Mã số BHXH" },
];

const UNION_COLUMNS = [
  { key: "unionFinanceSalary", label: "Lương NS Công đoàn" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const createNewSalaryRecord = (nextId: number): SalaryRecordType => ({
  tempId: nextId,
  employeeId: null,
  employeeName: "",
  employeeCode: "",
  salaryTableId: "",
  salaryLevelId: "",
  salaryScaleId: "",
  salaryCoefficient: "",
  salaryAmount: "",
  effectiveDate: "",
  insuranceSalaryTableId: "",
  insuranceSalaryLevelId: "",
  insuranceSalaryScaleId: "",
  insuranceCoefficient: "",
  insuranceSalaryAmount: "",
  insurancePlaceId: "",
  insuranceCode: "",
  unionFinanceSalary: "",
});

const formatCurrency = (val: string) => {
  const num = Number(val);
  if (!val || isNaN(num)) return "";
  return new Intl.NumberFormat("vi-VN").format(num);
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function BulkSalaryProcessModal({
  isOpen,
  onClose,
  mode,
  initialRows = [],
}: Props) {
  const [records, setRecords] = useState<SalaryRecordType[]>([]);
  const [nextId, setNextId] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<"table" | "expanded">("table");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Khởi tạo data
  // Khi modal mở lần đầu / mở lại
  useEffect(() => {
    if (!isOpen) {
      // Reset khi đóng, không cần handleClose gánh
      setRecords([]);
      setNextId(1);
      setExpandedRows(new Set());
      return;
    }

    if (mode === "edit" && initialRows.length > 0) {
      setRecords(initialRows.map((r, i) => ({ ...r, tempId: i + 1 })));
      setNextId(initialRows.length + 1);
    } else if (mode === "create") {
      setRecords([createNewSalaryRecord(1)]);
      setNextId(2);
    }
  }, [isOpen, initialRows, mode]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleAddRecord = () => {
    setRecords((prev) => [...prev, createNewSalaryRecord(nextId)]);
    setNextId((prev) => prev + 1);
  };

  const handleFieldChange = (tempId: number, field: string, value: any) => {
    setRecords((prev) =>
      prev.map((r) => (r.tempId === tempId ? { ...r, [field]: value } : r)),
    );
  };

  const handleCopyRecord = (tempId: number) => {
    const record = records.find((r) => r.tempId === tempId);
    if (record) {
      setRecords((prev) => [...prev, { ...record, tempId: nextId }]);
      setNextId((prev) => prev + 1);
    }
  };

  const handleClose = () => {
    setRecords([]);
    setNextId(1);
    setExpandedRows(new Set());
    onClose();
  };

  const handleSubmit = async () => {
    // Validate: nhân viên phải được chọn
    const invalid = records.filter((r) => !r.employeeCode && !r.employeeId);
    if (invalid.length > 0) {
      toast({
        title: "Thiếu thông tin",
        description: `${invalid.length} bản ghi chưa chọn nhân viên`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: gọi API khi có BE
      const payload = records.map((r) => ({
        employeeId: r.employeeId,
        salaryTableId: r.salaryTableId || null,
        salaryLevelId: r.salaryLevelId || null,
        salaryScaleId: r.salaryScaleId || null,
        salaryCoefficient: r.salaryCoefficient
          ? Number(r.salaryCoefficient)
          : null,
        salaryAmount: r.salaryAmount ? Number(r.salaryAmount) : null,
        effectiveDate: r.effectiveDate || null,
        insuranceSalaryTableId: r.insuranceSalaryTableId || null,
        insuranceSalaryLevelId: r.insuranceSalaryLevelId || null,
        insuranceSalaryScaleId: r.insuranceSalaryScaleId || null,
        insuranceCoefficient: r.insuranceCoefficient
          ? Number(r.insuranceCoefficient)
          : null,
        insuranceSalaryAmount: r.insuranceSalaryAmount
          ? Number(r.insuranceSalaryAmount)
          : null,
        insurancePlaceId: r.insurancePlaceId || null,
        insuranceCode: r.insuranceCode || null,
        unionFinanceSalary: r.unionFinanceSalary
          ? Number(r.unionFinanceSalary)
          : null,
      }));
      console.log("[BulkSalary] payload:", payload);

      toast({
        title: "Thành công",
        description:
          mode === "create"
            ? `Đã thêm ${records.length} bản ghi lương`
            : `Đã cập nhật ${records.length} bản ghi lương`,
      });
      handleClose();
    } catch (err: any) {
      toast({
        title: "Lỗi",
        description: err?.message || "Không thể lưu dữ liệu",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Cell renderer ────────────────────────────────────────────────────────────

  const renderCell = (record: SalaryRecordType, field: string) => {
    const inputCls = "h-8 text-sm w-full min-w-[140px]";

    switch (field) {
      // ── Nhân viên ──
      case "employeeCode":
        return (
          <Input
            value={record.employeeCode}
            onChange={(e) =>
              handleFieldChange(record.tempId, "employeeCode", e.target.value)
            }
            className={inputCls}
            placeholder="Mã cán bộ..."
          />
          // TODO: thay bằng component search nhân viên
        );

      // ── GenericSearchSelect fields ──
      case "salaryTableId":
      case "insuranceSalaryTableId":
        return (
          <div className="min-w-[180px]">
            <GenericSearchSelect
              api={categoryConfigs.payroll.api}
              config={categoryConfigs.payroll}
              value={record[field as keyof SalaryRecordType] as string}
              onChange={(v) =>
                handleFieldChange(record.tempId, field, String(v))
              }
            />
          </div>
        );

      case "salaryLevelId":
      case "insuranceSalaryLevelId":
        return (
          <div className="min-w-[160px]">
            {/* <GenericSearchSelect
              api={categoryConfigs.salaryLevel?.api}
              config={categoryConfigs.salaryLevel}
              value={record[field as keyof SalaryRecordType] as string}
              onChange={(v) =>
                handleFieldChange(record.tempId, field, String(v))
              }
            /> */}
            <Input
              value={record[field as keyof SalaryRecordType] as string}
              onChange={(e) =>
                handleFieldChange(record.tempId, field, e.target.value)
              }
              className="h-8 text-sm min-w-[160px]"
              placeholder="Bậc lương..."
            />
          </div>
        );

      case "salaryScaleId":
      case "insuranceSalaryScaleId":
        return (
          <div className="min-w-[180px]">
            <GenericSearchSelect
              api={categoryConfigs.salaryScale.api}
              config={categoryConfigs.salaryScale}
              value={record[field as keyof SalaryRecordType] as string}
              onChange={(v) =>
                handleFieldChange(record.tempId, field, String(v))
              }
            />
          </div>
        );

      case "insurancePlaceId":
        return (
          <div className="min-w-[180px]">
            <Input
              value={record.insurancePlaceId}
              onChange={(e) =>
                handleFieldChange(
                  record.tempId,
                  "insurancePlaceId",
                  e.target.value,
                )
              }
              className="h-8 text-sm min-w-[180px]"
              placeholder="Nơi đóng BHXH..."
            />
          </div>
        );

      // ── Số / hệ số ──
      case "salaryCoefficient":
      case "insuranceCoefficient":
        return (
          <Input
            type="number"
            step="0.01"
            value={record[field as keyof SalaryRecordType] as string}
            onChange={(e) =>
              handleFieldChange(record.tempId, field, e.target.value)
            }
            className={`${inputCls} min-w-[90px]`}
            placeholder="0.00"
          />
        );

      case "salaryAmount":
      case "insuranceSalaryAmount":
      case "unionFinanceSalary":
        return (
          <Input
            type="number"
            value={record[field as keyof SalaryRecordType] as string}
            onChange={(e) =>
              handleFieldChange(record.tempId, field, e.target.value)
            }
            className={`${inputCls} min-w-[130px]`}
            placeholder="VNĐ"
          />
        );

      // ── Ngày ──
      case "effectiveDate":
        return (
          <Input
            type="date"
            value={record.effectiveDate}
            onChange={(e) =>
              handleFieldChange(record.tempId, "effectiveDate", e.target.value)
            }
            className={`${inputCls} min-w-[140px]`}
          />
        );

      // ── Text ──
      case "insuranceCode":
        return (
          <Input
            value={record.insuranceCode}
            onChange={(e) =>
              handleFieldChange(record.tempId, "insuranceCode", e.target.value)
            }
            className={`${inputCls} min-w-[140px]`}
            placeholder="VN..."
          />
        );

      default:
        return <span className="text-xs text-muted-foreground">-</span>;
    }
  };

  // ── Expanded card renderer ───────────────────────────────────────────────────

  const renderExpandedCard = (record: SalaryRecordType, index: number) => (
    <div
      key={record.tempId}
      className="border rounded-lg p-5 space-y-5 bg-muted/20"
    >
      {/* Card header */}
      <div className="flex items-center justify-between pb-2 border-b">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
            {index + 1}
          </span>
          <span>
            {record.employeeName || record.employeeCode || "Bản ghi mới"}
          </span>
        </h4>
        {/* Edit mode: không cho xóa */}
        {mode === "create" && (
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-600"
            onClick={() =>
              setRecords((prev) =>
                prev.filter((r) => r.tempId !== record.tempId),
              )
            }
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Nhân viên */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
          Nhân viên
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Mã cán bộ</Label>
            <Input
              value={record.employeeCode}
              onChange={(e) =>
                handleFieldChange(record.tempId, "employeeCode", e.target.value)
              }
              className="h-8 text-sm"
              placeholder="Nhập mã cán bộ..."
              disabled={mode === "edit"}
            />
            {/* TODO: thay bằng component search nhân viên */}
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Họ và tên</Label>
            <Input
              value={record.employeeName}
              onChange={(e) =>
                handleFieldChange(record.tempId, "employeeName", e.target.value)
              }
              className="h-8 text-sm"
              placeholder="Nhập họ và tên..."
              disabled={mode === "edit"}
            />
          </div>
        </div>
      </div>

      {/* Lương tại đơn vị */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 border-b border-blue-100 pb-1 mb-3">
          Lương tại đơn vị
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Bảng lương</Label>
            <GenericSearchSelect
              api={categoryConfigs.payroll.api}
              config={categoryConfigs.payroll}
              value={record.salaryTableId}
              onChange={(v) =>
                handleFieldChange(record.tempId, "salaryTableId", String(v))
              }
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Bậc lương</Label>
            {/* <GenericSearchSelect
              api={categoryConfigs.salaryLevel?.api}
              config={categoryConfigs.salaryLevel}
              value={record.salaryLevelId}
              onChange={(v) =>
                handleFieldChange(record.tempId, "salaryLevelId", String(v))
              }
            /> */}
            <Input
              value={record.salaryLevelId}
              onChange={(e) => console.log("hehe")}
              className="h-8 text-sm w-full"
              placeholder="Bậc lương..."
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Thang bảng lương</Label>
            {/* <GenericSearchSelect
              api={categoryConfigs.salaryScale.api}
              config={categoryConfigs.salaryScale}
              value={record.salaryScaleId}
              onChange={(v) =>
                handleFieldChange(record.tempId, "salaryScaleId", String(v))
              }
            /> */}
            <Input
              value={record.salaryScaleId}
              onChange={(e) => console.log("hehe")}
              className="h-8 text-sm w-full"
              placeholder="Thang bảng lương..."
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Hệ số lương</Label>
            <Input
              type="number"
              step="0.01"
              value={record.salaryCoefficient}
              onChange={(e) =>
                handleFieldChange(
                  record.tempId,
                  "salaryCoefficient",
                  e.target.value,
                )
              }
              className="h-8 text-sm"
              placeholder="0.00"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Mức lương (VNĐ)</Label>
            <Input
              type="number"
              value={record.salaryAmount}
              onChange={(e) =>
                handleFieldChange(record.tempId, "salaryAmount", e.target.value)
              }
              className="h-8 text-sm"
              placeholder="Nhập mức lương"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Ngày áp dụng</Label>
            <Input
              type="date"
              value={record.effectiveDate}
              onChange={(e) =>
                handleFieldChange(
                  record.tempId,
                  "effectiveDate",
                  e.target.value,
                )
              }
              className="h-8 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Lương BHXH */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-green-600 border-b border-green-100 pb-1 mb-3">
          Lương đóng BHXH
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Bảng lương BHXH</Label>
            <GenericSearchSelect
              api={categoryConfigs.payroll.api}
              config={categoryConfigs.payroll}
              value={record.insuranceSalaryTableId}
              onChange={(v) =>
                handleFieldChange(
                  record.tempId,
                  "insuranceSalaryTableId",
                  String(v),
                )
              }
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Bậc BHXH</Label>
            {/* <GenericSearchSelect
              api={categoryConfigs.salaryLevel?.api}
              config={categoryConfigs.salaryLevel}
              value={record.insuranceSalaryLevelId}
              onChange={(v) =>
                handleFieldChange(
                  record.tempId,
                  "insuranceSalaryLevelId",
                  String(v),
                )
              }
            /> */}
            <Input
              value={record.insuranceSalaryLevelId}
              onChange={(e) => console.log("hehe")}
              className="h-8 text-sm w-full"
              placeholder="Thang bảng lương..."
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Thang BHXH</Label>
            <GenericSearchSelect
              api={categoryConfigs.salaryScale.api}
              config={categoryConfigs.salaryScale}
              value={record.insuranceSalaryScaleId}
              onChange={(v) =>
                handleFieldChange(
                  record.tempId,
                  "insuranceSalaryScaleId",
                  String(v),
                )
              }
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Hệ số BHXH</Label>
            <Input
              type="number"
              step="0.01"
              value={record.insuranceCoefficient}
              onChange={(e) =>
                handleFieldChange(
                  record.tempId,
                  "insuranceCoefficient",
                  e.target.value,
                )
              }
              className="h-8 text-sm"
              placeholder="0.00"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Mức đóng BHXH (VNĐ)</Label>
            <Input
              type="number"
              value={record.insuranceSalaryAmount}
              onChange={(e) =>
                handleFieldChange(
                  record.tempId,
                  "insuranceSalaryAmount",
                  e.target.value,
                )
              }
              className="h-8 text-sm"
              placeholder="Nhập mức đóng"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Nơi đóng BHXH</Label>
            {/* <GenericSearchSelect
              api={categoryConfigs.insurancePlace?.api}
              config={categoryConfigs.insurancePlace}
              value={record.insurancePlaceId}
              onChange={(v) =>
                handleFieldChange(record.tempId, "insurancePlaceId", String(v))
              }
            /> */}
            <Input
              value={record.insurancePlaceId}
              onChange={(e) => console.log("hehe")}
              className="h-8 text-sm w-full"
              placeholder="Thang bảng lương..."
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Mã số BHXH</Label>
            <Input
              value={record.insuranceCode}
              onChange={(e) =>
                handleFieldChange(
                  record.tempId,
                  "insuranceCode",
                  e.target.value,
                )
              }
              className="h-8 text-sm"
              placeholder="VN..."
            />
          </div>
        </div>
      </div>

      {/* Công đoàn */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-yellow-600 border-b border-yellow-100 pb-1 mb-3">
          Công đoàn
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">
              Lương NS tài chính công đoàn (VNĐ)
            </Label>
            <Input
              type="number"
              value={record.unionFinanceSalary}
              onChange={(e) =>
                handleFieldChange(
                  record.tempId,
                  "unionFinanceSalary",
                  e.target.value,
                )
              }
              className="h-8 text-sm"
              placeholder="Nhập số tiền"
            />
          </div>
        </div>
      </div>
    </div>
  );

  // ── Render ───────────────────────────────────────────────────────────────────

  const allDataColumns = [
    ...UNIT_SALARY_COLUMNS,
    ...INSURANCE_COLUMNS,
    ...UNION_COLUMNS,
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] w-full h-[90vh] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {mode === "create"
              ? "Thêm quá trình lương"
              : "Chỉnh sửa quá trình lương"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Có thể thêm nhiều bản ghi và lưu một lần"
              : `Đang chỉnh sửa ${records.length} bản ghi đã chọn`}
          </DialogDescription>
        </DialogHeader>

        {/* Body */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {/* Toolbar */}
          <div className="px-6 py-3 border-b flex items-center justify-between bg-muted/30 shrink-0">
            <div className="flex items-center gap-2">
              {/* Excel buttons (placeholder) */}
              <Button size="sm" variant="outline" className="gap-2">
                <Upload className="h-4 w-4" />
                Tải lên
              </Button>
              <Button size="sm" variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Tải xuống
              </Button>

              {/* View mode toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setViewMode(viewMode === "table" ? "expanded" : "table")
                }
                className="gap-2"
              >
                {viewMode === "table" ? (
                  <Maximize2 className="h-4 w-4" />
                ) : (
                  <Minimize2 className="h-4 w-4" />
                )}
                {viewMode === "table" ? "Mở rộng" : "Thu gọn"}
              </Button>

              {/* Thêm mới — chỉ create mode */}
              {mode === "create" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={handleAddRecord}
                >
                  <Plus className="h-4 w-4" />
                  Thêm bản ghi
                </Button>
              )}
            </div>

            <span className="text-sm text-muted-foreground">
              Tổng số: <b>{records.length}</b> bản ghi
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4">
            {records.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-16">
                Chưa có bản ghi nào.{" "}
                {mode === "create" && (
                  <>
                    Nhấn <b>Thêm bản ghi</b> để bắt đầu.
                  </>
                )}
              </div>
            ) : viewMode === "table" ? (
              /* ── TABLE VIEW ── */
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {/* STT */}
                      <TableHead className="w-10 text-center sticky left-0 bg-background z-20">
                        STT
                      </TableHead>

                      {/* Thao tác */}
                      <TableHead className="text-center sticky left-10 bg-background z-20 w-20">
                        Thao tác
                      </TableHead>

                      {/* Nhân viên */}
                      <TableHead className="whitespace-nowrap min-w-[160px]">
                        Mã cán bộ
                      </TableHead>

                      {/* Lương tại đơn vị */}
                      {UNIT_SALARY_COLUMNS.map((col, i) => (
                        <TableHead
                          key={col.key}
                          className={`whitespace-nowrap ${i === 0 ? "border-l-2 border-l" : ""}`}
                        >
                          {col.label}
                        </TableHead>
                      ))}

                      {/* Lương BHXH */}
                      {INSURANCE_COLUMNS.map((col, i) => (
                        <TableHead
                          key={col.key}
                          className={`whitespace-nowrap  ${i === 0 ? "border-l-2 border-l" : ""}`}
                        >
                          {col.label}
                        </TableHead>
                      ))}

                      {/* Công đoàn */}
                      {UNION_COLUMNS.map((col, i) => (
                        <TableHead
                          key={col.key}
                          className={`whitespace-nowrap  ${i === 0 ? "border-l-2 border-l" : ""}`}
                        >
                          {col.label}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {records.map((record, index) => (
                      <>
                        <TableRow
                          key={record.tempId}
                          className={
                            expandedRows.has(record.tempId)
                              ? "bg-primary/5"
                              : ""
                          }
                        >
                          {/* STT */}
                          <TableCell className="text-center text-muted-foreground text-xs sticky left-0 bg-background z-10 border-r">
                            {index + 1}
                          </TableCell>

                          {/* Thao tác */}
                          <TableCell className="sticky left-10 bg-background z-10 border-r">
                            <div className="flex gap-1 justify-center">
                              {/* <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  toggleRowExpansion(record.tempId)
                                }
                                title={
                                  expandedRows.has(record.tempId)
                                    ? "Thu gọn"
                                    : "Mở rộng"
                                }
                              >
                                {expandedRows.has(record.tempId) ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button> */}
                              {mode === "create" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleCopyRecord(record.tempId)
                                  }
                                  title="Sao chép"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              )}

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setRecords((prev) =>
                                    prev.filter(
                                      (r) => r.tempId !== record.tempId,
                                    ),
                                  )
                                }
                                title="Xóa"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>

                          {/* Mã cán bộ */}
                          <TableCell>
                            <Input
                              value={record.employeeCode}
                              onChange={(e) =>
                                handleFieldChange(
                                  record.tempId,
                                  "employeeCode",
                                  e.target.value,
                                )
                              }
                              className="h-8 text-sm min-w-[140px]"
                              placeholder="Mã cán bộ..."
                              disabled={mode === "edit"}
                            />
                          </TableCell>

                          {/* Lương tại đơn vị cells */}
                          {UNIT_SALARY_COLUMNS.map((col, i) => (
                            <TableCell
                              key={col.key}
                              className={i === 0 ? "border-l-2 border-l" : ""}
                            >
                              {renderCell(record, col.key)}
                            </TableCell>
                          ))}

                          {/* Lương BHXH cells */}
                          {INSURANCE_COLUMNS.map((col, i) => (
                            <TableCell
                              key={col.key}
                              className={i === 0 ? "border-l-2 border-l" : ""}
                            >
                              {renderCell(record, col.key)}
                            </TableCell>
                          ))}

                          {/* Công đoàn cells */}
                          {UNION_COLUMNS.map((col, i) => (
                            <TableCell
                              key={col.key}
                              className={i === 0 ? "border-l-2 border-l" : ""}
                            >
                              {renderCell(record, col.key)}
                            </TableCell>
                          ))}
                        </TableRow>

                        {/* Expanded inline row */}
                        {expandedRows.has(record.tempId) && (
                          <TableRow key={`${record.tempId}-expanded`}>
                            <TableCell
                              colSpan={
                                2 +
                                1 +
                                UNIT_SALARY_COLUMNS.length +
                                INSURANCE_COLUMNS.length +
                                UNION_COLUMNS.length
                              }
                              className="p-0"
                            >
                              <div className="px-4 py-3 bg-muted/10 border-t border-dashed">
                                {renderExpandedCard(record, index)}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              /* ── EXPANDED VIEW ── */
              <div className="w-full space-y-4">
                {records.map((record, index) =>
                  renderExpandedCard(record, index),
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t shrink-0">
          <div className="w-full flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {mode === "edit"
                ? "Chỉ các bản ghi đã chọn mới được cập nhật"
                : "Tất cả bản ghi sẽ được lưu cùng lúc"}
            </p>
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
                disabled={isSubmitting || records.length === 0}
              >
                {isSubmitting && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {isSubmitting
                  ? "Đang lưu..."
                  : mode === "create"
                    ? `Lưu ${records.length} bản ghi`
                    : `Cập nhật ${records.length} bản ghi`}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
