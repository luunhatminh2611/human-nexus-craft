import { useState } from "react";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button/Button2";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/tables/table";
import { Checkbox } from "@/components/ui/checkbox";
import BulkSalaryProcessModal, {
  SalaryRecordType,
} from "../../components/BulkSalaryProcessModal";
import SalaryProcessModal from "../../components/SalaryProcessModal";

const fakeData = [
  {
    employeeId: 1,
    employeeName: "Nguyễn Văn An",
    employeeCode: "CB001",
    salaryTable: { code: "BL001", name: "Bảng lương chuyên môn nghiệp vụ" },
    salaryLevel: { code: "BAC001", name: "Bậc 1" },
    salaryScale: {
      code: "TBL001",
      name: "Thang lương A1",
      salaryTableName: "Bảng lương chuyên môn nghiệp vụ",
      salaryLevelName: "Bậc 1",
      coefficient: 2.34,
      baseSalary: 1800000,
    },
    salaryCoefficient: 2.34,
    salaryAmount: 4212000,
    effectiveDate: "2023-01-01",
    insuranceSalaryTable: {
      code: "BL001",
      name: "Bảng lương chuyên môn nghiệp vụ",
    },
    insuranceSalaryLevel: { code: "BAC001", name: "Bậc 1" },
    insuranceSalaryScale: {
      code: "TBL001",
      name: "Thang lương A1",
      salaryTableName: "Bảng lương chuyên môn nghiệp vụ",
      salaryLevelName: "Bậc 1",
      coefficient: 2.34,
      baseSalary: 1800000,
    },
    insuranceCoefficient: 2.34,
    insuranceSalaryAmount: 4212000,
    insurancePlace: { code: "BHXH001", name: "BHXH Quận Cầu Giấy" },
    insuranceCode: "VN0123456789",
    unionFinanceSalary: 3500000,
  },
  {
    employeeId: 2,
    employeeName: "Trần Thị Mai",
    employeeCode: "CB002",
    salaryTable: { code: "BL002", name: "Bảng lương lãnh đạo" },
    salaryLevel: { code: "BAC003", name: "Bậc 3" },
    salaryScale: {
      code: "TBL002",
      name: "Thang lương B2",
      salaryTableName: "Bảng lương lãnh đạo",
      salaryLevelName: "Bậc 3",
      coefficient: 4.0,
      baseSalary: 1800000,
    },
    salaryCoefficient: 4.0,
    salaryAmount: 7200000,
    effectiveDate: "2022-07-01",
    insuranceSalaryTable: { code: "BL002", name: "Bảng lương lãnh đạo" },
    insuranceSalaryLevel: { code: "BAC003", name: "Bậc 3" },
    insuranceSalaryScale: {
      code: "TBL002",
      name: "Thang lương B2",
      salaryTableName: "Bảng lương lãnh đạo",
      salaryLevelName: "Bậc 3",
      coefficient: 4.0,
      baseSalary: 1800000,
    },
    insuranceCoefficient: 4.0,
    insuranceSalaryAmount: 7200000,
    insurancePlace: { code: "BHXH002", name: "BHXH Quận Đống Đa" },
    insuranceCode: "VN9876543210",
    unionFinanceSalary: 5000000,
  },
  {
    employeeId: 3,
    employeeName: "Lê Quốc Huy",
    employeeCode: "CB003",
    salaryTable: { code: "BL001", name: "Bảng lương chuyên môn nghiệp vụ" },
    salaryLevel: { code: "BAC002", name: "Bậc 2" },
    salaryScale: {
      code: "TBL003",
      name: "Thang lương A2",
      salaryTableName: "Bảng lương chuyên môn nghiệp vụ",
      salaryLevelName: "Bậc 2",
      coefficient: 2.67,
      baseSalary: 1800000,
    },
    salaryCoefficient: 2.67,
    salaryAmount: 4806000,
    effectiveDate: "2023-04-01",
    insuranceSalaryTable: {
      code: "BL001",
      name: "Bảng lương chuyên môn nghiệp vụ",
    },
    insuranceSalaryLevel: { code: "BAC002", name: "Bậc 2" },
    insuranceSalaryScale: {
      code: "TBL003",
      name: "Thang lương A2",
      salaryTableName: "Bảng lương chuyên môn nghiệp vụ",
      salaryLevelName: "Bậc 2",
      coefficient: 2.67,
      baseSalary: 1800000,
    },
    insuranceCoefficient: 2.67,
    insuranceSalaryAmount: 4806000,
    insurancePlace: { code: "BHXH003", name: "BHXH Quận Hoàn Kiếm" },
    insuranceCode: "VN1122334455",
    unionFinanceSalary: 4000000,
  },
  {
    employeeId: 4,
    employeeName: "Phạm Thu Hà",
    employeeCode: "CB004",
    salaryTable: { code: "BL003", name: "Bảng lương nhân viên" },
    salaryLevel: { code: "BAC001", name: "Bậc 1" },
    salaryScale: {
      code: "TBL004",
      name: "Thang lương C1",
      salaryTableName: "Bảng lương nhân viên",
      salaryLevelName: "Bậc 1",
      coefficient: 1.86,
      baseSalary: 1800000,
    },
    salaryCoefficient: 1.86,
    salaryAmount: 3348000,
    effectiveDate: "2024-01-01",
    insuranceSalaryTable: { code: "BL003", name: "Bảng lương nhân viên" },
    insuranceSalaryLevel: { code: "BAC001", name: "Bậc 1" },
    insuranceSalaryScale: {
      code: "TBL004",
      name: "Thang lương C1",
      salaryTableName: "Bảng lương nhân viên",
      salaryLevelName: "Bậc 1",
      coefficient: 1.86,
      baseSalary: 1800000,
    },
    insuranceCoefficient: 1.86,
    insuranceSalaryAmount: 3348000,
    insurancePlace: { code: "BHXH001", name: "BHXH Quận Cầu Giấy" },
    insuranceCode: "VN5566778899",
    unionFinanceSalary: 2800000,
  },
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    amount,
  );

const formatDate = (dateStr: string) => {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
};

export default function SalaryProcessAdmin() {
  const isAdmin = true; // toggle to test non-admin view

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedRows, setSelectedRows] = useState<SalaryRecordType[]>([]);
  const [detailMode, setDetailMode] = useState<"view" | "edit">("view");

  const [viewRecord, setViewRecord] = useState<(typeof fakeData)[0] | null>(
    null,
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filtered = fakeData.filter(
    (item) =>
      item.employeeName.toLowerCase().includes(searchText.toLowerCase()) ||
      item.employeeCode.toLowerCase().includes(searchText.toLowerCase()),
  );

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = totalItems === 0 ? 0 : page * pageSize + 1;
  const end = Math.min(totalItems, (page + 1) * pageSize);
  const pageData = filtered.slice(page * pageSize, (page + 1) * pageSize);

  const toggleOne = (id: number) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  const toggleAll = () =>
    setSelectedIds(
      selectedIds.length === filtered.length
        ? []
        : filtered.map((x) => x.employeeId),
    );

  const handleOpenCreate = () => {
    setModalMode("create");
    setSelectedRows([]);
    setIsBulkModalOpen(true);
  };

  const handleOpenDetail = (item: (typeof fakeData)[0]) => {
    setViewRecord(item);
    setDetailMode("view");
    setIsDetailOpen(true);
  };
  const handleOpenEditSingle = (item: (typeof fakeData)[0]) => {
    setViewRecord(item);
    setDetailMode("edit");
    setIsDetailOpen(true);
  };

  const handleOpenEdit = () => {
    setModalMode("edit");
    const rows = fakeData
      .filter((item) => selectedIds.includes(item.employeeId))
      .map((item) => ({
        tempId: item.employeeId,
        employeeId: item.employeeId,
        employeeName: item.employeeName,
        employeeCode: item.employeeCode,
        salaryTableId: item.salaryTable.code,
        salaryLevelId: item.salaryLevel.code,
        salaryScaleId: item.salaryScale.code,
        salaryCoefficient: String(item.salaryCoefficient),
        salaryAmount: String(item.salaryAmount),
        effectiveDate: item.effectiveDate,
        insuranceSalaryTableId: item.insuranceSalaryTable.code,
        insuranceSalaryLevelId: item.insuranceSalaryLevel.code,
        insuranceSalaryScaleId: item.insuranceSalaryScale.code,
        insuranceCoefficient: String(item.insuranceCoefficient),
        insuranceSalaryAmount: String(item.insuranceSalaryAmount),
        insurancePlaceId: item.insurancePlace.code,
        insuranceCode: item.insuranceCode,
        unionFinanceSalary: String(item.unionFinanceSalary),
      }));
    setSelectedRows(rows);
    setIsBulkModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold">Quá trình lương</h1>
            <p className="text-muted-foreground">
              {isAdmin
                ? "Quản lý quá trình lương cán bộ, công chức"
                : "Xem thông tin lương của bạn"}
            </p>
          </div>
        </div>
      </div>

      {/* Non-admin banner */}
      {!isAdmin && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Thông tin quá trình lương</p>
              <p>
                Thông tin lương được quản lý bởi phòng Nhân sự. Nếu cần cập
                nhật, vui lòng liên hệ phòng Nhân sự.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên nhân viên, số hiệu cán bộ..."
              className="pl-10"
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setPage(0);
              }}
            />
          </div>

          {isAdmin && (
            <div className="flex gap-2">
              <Button onClick={handleOpenCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm mới
              </Button>

              <Button
                variant="outline"
                disabled={selectedIds.length === 0}
                onClick={handleOpenEdit}
              >
                <Edit className="h-4 w-4 mr-2" />
                Chỉnh sửa ({selectedIds.length})
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                {/* Base columns */}
                <TableHead className="w-12 text-center whitespace-nowrap">
                  <Checkbox
                    checked={
                      selectedIds.length === filtered.length &&
                      filtered.length > 0
                    }
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead className="text-center w-16 whitespace-nowrap">
                  STT
                </TableHead>
                <TableHead className="whitespace-nowrap">Họ và tên</TableHead>
                <TableHead className="whitespace-nowrap">Số hiệu CB</TableHead>

                {/* Lương tại đơn vị */}
                <TableHead className="whitespace-nowrap border-l-2 border-l ">
                  Bảng lương
                </TableHead>
                <TableHead className="whitespace-nowrap ">Bậc lương</TableHead>
                <TableHead className="whitespace-nowrap ">
                  Thang bảng lương
                </TableHead>
                <TableHead className="whitespace-nowrap ">Hệ số</TableHead>
                <TableHead className="whitespace-nowrap ">Mức lương</TableHead>
                <TableHead className="whitespace-nowrap ">
                  Ngày áp dụng
                </TableHead>

                {/* Lương BHXH */}
                <TableHead className="whitespace-nowrap border-l-2 border-l">
                  BL BHXH
                </TableHead>
                <TableHead className="whitespace-nowrap">Bậc BHXH</TableHead>
                <TableHead className="whitespace-nowrap">Thang BHXH</TableHead>
                <TableHead className="whitespace-nowrap">Hệ số BH</TableHead>
                <TableHead className="whitespace-nowrap">
                  Mức đóng BHXH
                </TableHead>
                <TableHead className="whitespace-nowrap">
                  Nơi đóng BHXH
                </TableHead>
                <TableHead className="whitespace-nowrap">Mã số BHXH</TableHead>

                {/* Công đoàn */}
                <TableHead className="whitespace-nowrap border-l-2 border-l">
                  Lương NS CĐ
                </TableHead>

                <TableHead className="text-center whitespace-nowrap sticky right-0 bg-white z-20">
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {pageData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={19}
                    className="text-center py-10 text-muted-foreground"
                  >
                    Không có dữ liệu phù hợp
                  </TableCell>
                </TableRow>
              ) : (
                pageData.map((item, idx) => (
                  <TableRow
                    key={item.employeeId}
                    className={
                      selectedIds.includes(item.employeeId)
                        ? "bg-primary/5"
                        : ""
                    }
                  >
                    <TableCell className="text-center">
                      <Checkbox
                        checked={selectedIds.includes(item.employeeId)}
                        onCheckedChange={() => toggleOne(item.employeeId)}
                      />
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground text-xs">
                      {page * pageSize + idx + 1}
                    </TableCell>

                    {/* Tên */}
                    <TableCell>
                      <p className="font-medium">{item.employeeName}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground ">
                        {item.employeeCode}
                      </p>
                    </TableCell>

                    {/* Lương tại đơn vị */}
                    <TableCell className="border-l-2 border-l">
                      <div className="max-w-[140px]">
                        <p className="font-medium text-xs truncate">
                          {item.salaryTable.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.salaryTable.code}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600">
                        {item.salaryLevel.name}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[130px]">
                        <p className="text-xs truncate">
                          {item.salaryScale.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.salaryScale.code}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-semibold">
                        {item.salaryCoefficient.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-semibold">
                        {formatCurrency(item.salaryAmount)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(item.effectiveDate)}
                      </span>
                    </TableCell>

                    {/* Lương BHXH */}
                    <TableCell className="border-l-2 border-l">
                      <div className="max-w-[140px]">
                        <p className="text-xs truncate">
                          {item.insuranceSalaryTable.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.insuranceSalaryTable.code}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700">
                        {item.insuranceSalaryLevel.name}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[130px]">
                        <p className="text-xs truncate">
                          {item.insuranceSalaryScale.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.insuranceSalaryScale.code}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-semibold">
                        {item.insuranceCoefficient.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-semibold">
                        {formatCurrency(item.insuranceSalaryAmount)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[150px]">
                        <p className="text-xs truncate">
                          {item.insurancePlace.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.insurancePlace.code}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className=" text-xs text-muted-foreground">
                        {item.insuranceCode}
                      </span>
                    </TableCell>

                    {/* Công đoàn */}
                    <TableCell className="border-l-2 border-l">
                      <span className=" text-sm font-semibold">
                        {formatCurrency(item.unionFinanceSalary)}
                      </span>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="sticky right-0 bg-white z-10 w-36">
                      <div className="flex gap-1 justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Xem chi tiết"
                          onClick={() => handleOpenDetail(item)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {isAdmin && (
                          <>
                            <Button variant="ghost" size="sm" title="Chỉnh sửa"  onClick={() => handleOpenEditSingle(item)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              title="Xóa"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <p className="text-sm text-muted-foreground">
            Hiển thị {start} – {end} trong {totalItems} cán bộ
          </p>

          <div className="flex items-center gap-2">
            <Select
              value={pageSize.toString()}
              onValueChange={(v) => {
                const n = Number(v);
                setPageSize(n);
                setPage(0);
              }}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50, 100].map((n) => (
                  <SelectItem key={n} value={n.toString()}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(0)}
                disabled={page === 0}
              >
                Đầu
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-3 text-sm">
                Trang {page + 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(totalPages - 1)}
                disabled={page >= totalPages - 1}
              >
                Cuối
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Modal */}
      <BulkSalaryProcessModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        mode={modalMode}
        initialRows={selectedRows}
      />

      <SalaryProcessModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        record={viewRecord}
        mode={detailMode}
      />
    </div>
  );
}
