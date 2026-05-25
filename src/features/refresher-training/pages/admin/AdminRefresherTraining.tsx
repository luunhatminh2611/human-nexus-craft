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
  BookOpen,
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
import { useAuthStore } from "@/features/employees/hooks/useAuth";
import RefresherTrainingModal from "../../components/RefresherTrainingModal";
import BulkAddRefresherModal from "../../components/BulkAddRefresherTrainingModal";
import { TrainingEmployeeType } from "../../types/refresherTrainingType";

const fakeData: TrainingEmployeeType[] = [
  {
    employeeId: 1,
    employeeName: "Nguyễn Văn An",
    employeeCode: "CB001",
    educationSystem: { code: "HDT001", name: "Đại học chính quy" },
    trainingMethod: { code: "HT001", name: "Tập trung" },
    trainingSchool: { code: "TR001", name: "Đại học Bách Khoa Hà Nội" },
    educationLevel: { code: "TD001", name: "Kỹ sư" },
    trainingMajor: { code: "NDT001", name: "Công nghệ thông tin" },
    className: "Lớp Kỹ sư CNTT K65",
    startDate: "2019-09-01",
    endDate: "2024-06-30",
    note: "Đã tốt nghiệp loại Khá",
  },
  {
    employeeId: 2,
    employeeName: "Trần Thị Mai",
    employeeCode: "CB002",
    educationSystem: { code: "HDT002", name: "Sau đại học" },
    trainingMethod: { code: "HT002", name: "Vừa học vừa làm" },
    trainingSchool: { code: "TR002", name: "Đại học Kinh tế Quốc dân" },
    educationLevel: { code: "TD002", name: "Thạc sĩ" },
    trainingMajor: { code: "NDT002", name: "Quản trị kinh doanh" },
    className: "MBA Executive 2024",
    startDate: "2019-09-01",
    endDate: "2024-06-30",
    note: "Đang theo học",
  },
  {
    employeeId: 3,
    employeeName: "Lê Quốc Huy",
    employeeCode: "CB003",
    educationSystem: { code: "HDT003", name: "Liên thông" },
    trainingMethod: { code: "HT003", name: "Online" },
    trainingSchool: {
      code: "TR003",
      name: "Học viện Công nghệ Bưu chính Viễn thông",
    },
    educationLevel: { code: "TD003", name: "Cử nhân" },
    trainingMajor: { code: "NDT003", name: "An toàn thông tin" },
    className: "ATTT Chất lượng cao",
    startDate: "2019-09-01",
    endDate: "2024-06-30",
    note: "Có chứng chỉ quốc tế",
  },
  {
    employeeId: 4,
    employeeName: "Phạm Thu Hà",
    employeeCode: "CB004",
    educationSystem: { code: "HDT004", name: "Cao đẳng" },
    trainingMethod: { code: "HT001", name: "Tập trung" },
    trainingSchool: { code: "TR004", name: "Cao đẳng FPT Polytechnic" },
    educationLevel: { code: "TD004", name: "Cao đẳng" },
    trainingMajor: { code: "NDT004", name: "Thiết kế đồ họa" },
    className: "Thiết kế đồ họa K18",
    startDate: "2019-09-01",
    endDate: "2024-06-30",
    note: "Đã hoàn thành chương trình",
  },
];
export default function AdminRefresherTraining() {
  const { user } = useAuthStore();

  const isAdmin = user?.roles === "ADMIN";

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [defaultEditing, setDefaultEditing] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedRows, setSelectedRows] = useState<TrainingEmployeeType[]>([]);
  const [selectedEmployee, setSelectedEmployee] =
    useState<TrainingEmployeeType | null>(null);

  // client-side pagination state (fake data)
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const totalItems = fakeData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = totalItems === 0 ? 0 : page * pageSize + 1;
  const end = Math.min(totalItems, (page + 1) * pageSize);
  const pageData = fakeData.slice(page * pageSize, (page + 1) * pageSize);

  const toggleOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === fakeData.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(fakeData.map((x) => x.employeeId));
    }
  };

  const handleOpenCreate = () => {
    setModalMode("create");

    setSelectedRows([]);

    setIsBulkModalOpen(true);
  };
  const handleOpenEdit = () => {
    setModalMode("edit");
    const rows = fakeData.filter((item) =>
      selectedIds.includes(item.employeeId),
    );

    setSelectedRows(rows);

    setIsBulkModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-3xl font-bold">Đào tạo bồi dưỡng</h1>
              <p className="text-muted-foreground">
                {isAdmin
                  ? "Quản lý thông tin đào tạo bồi dưỡng của nhân viên"
                  : "Xem lịch sử đào tạo bồi dưỡng của bạn"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      {!isAdmin && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Thông tin đào tạo bồi dưỡng</p>

              <p>
                Thông tin được quản lý bởi phòng Nhân sự. Nếu cần cập nhật, vui
                lòng liên hệ phòng Nhân sự.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-4">
          {/* Search + actions */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

              <Input
                placeholder="Tìm theo tên nhân viên, mã nhân viên, tên lớp..."
                className="pl-10"
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
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center whitespace-nowrap">
                  <Checkbox
                    checked={selectedIds.length === fakeData.length}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>

                <TableHead className="text-center w-16 whitespace-nowrap">
                  STT
                </TableHead>

                <TableHead className="whitespace-nowrap">Họ và tên</TableHead>

                <TableHead className="whitespace-nowrap">
                  Số hiệu cán bộ
                </TableHead>

                <TableHead className="whitespace-nowrap">Hệ đào tạo</TableHead>

                <TableHead className="whitespace-nowrap">
                  Hình thức đào tạo
                </TableHead>

                <TableHead className="whitespace-nowrap">
                  Trường đào tạo
                </TableHead>

                <TableHead className="whitespace-nowrap">
                  Trình độ văn bằng chứng chỉ
                </TableHead>
                <TableHead className="whitespace-nowrap">
                  Ngành đào tạo
                </TableHead>
                <TableHead className="whitespace-nowrap">Tên lớp</TableHead>
                <TableHead className="whitespace-nowrap">
                  Thời gian học
                </TableHead>
                <TableHead className="whitespace-nowrap">Ghi chú</TableHead>

                <TableHead className="text-center whitespace-nowrap sticky right-0 bg-white z-20">
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {pageData.map((item, index) => (
                <TableRow
                  key={item.employeeId}
                  className={
                    selectedIds.includes(item.employeeId) ? "bg-primary/5" : ""
                  }
                >
                  <TableCell className="text-center">
                    <Checkbox
                      checked={selectedIds.includes(item.employeeId)}
                      onCheckedChange={() => toggleOne(item.employeeId)}
                    />
                  </TableCell>
                  <TableCell className="text-center">{index + 1}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.employeeName}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-muted-foreground">
                      {item.employeeCode}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.educationSystem.name}</p>

                      <p className="text-xs text-muted-foreground">
                        {item.educationSystem.code}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p>{item.trainingMethod.name}</p>

                      <p className="text-xs text-muted-foreground">
                        {item.trainingMethod.code}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[180px]">
                      <p className="truncate font-medium">
                        {item.trainingSchool.name}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {item.trainingSchool.code}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p>{item.educationLevel.name}</p>

                      <p className="text-xs text-muted-foreground">
                        {item.educationLevel.code}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[160px]">
                      <p className="truncate">{item.trainingMajor.name}</p>

                      <p className="text-xs text-muted-foreground">
                        {item.trainingMajor.code}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[140px]">
                      <p className="truncate">{item.className}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm whitespace-nowrap">
                      {item.startDate} - {item.endDate}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="max-w-[220px] truncate text-sm text-muted-foreground">
                      {item.note}
                    </p>
                  </TableCell>
                  <TableCell className="sticky right-0 bg-white z-10 w-36">
                    <div className="flex gap-1 justify-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Xem chi tiết"
                        onClick={() => {
                          setSelectedEmployee(item);
                          setDefaultEditing(false);
                          setIsDetailModalOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {isAdmin && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Chỉnh sửa"
                            onClick={() => {
                              setSelectedEmployee(item);
                              setDefaultEditing(true);
                              setIsDetailModalOpen(true);
                            }}
                          >
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
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <p className="text-sm text-muted-foreground">
            Hiển thị {start} – {end} trong {totalItems}
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

      <RefresherTrainingModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedEmployee(null);
        }}
        employee={selectedEmployee || null}
        isAdmin={isAdmin}
        defaultEditing={defaultEditing}
      />

      <BulkAddRefresherModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        mode={modalMode}
        initialRows={selectedRows}
      />
    </div>
  );
}
