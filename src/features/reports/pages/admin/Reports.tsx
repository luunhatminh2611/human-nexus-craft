import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import Button from "@/shared/components/ui/button/Button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/shared/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/tables/table";
import { Download, Settings2, GripVertical } from "lucide-react";
import mockData from "@/mock/data";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, horizontalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Layout } from "@/shared/components/layouts/Layout";

interface Column {
  id: string;
  label: string;
  visible: boolean;
}

const initialColumns: Column[] = [
  { id: "name", label: "Họ và tên", visible: true },
  { id: "email", label: "Email", visible: true },
  { id: "phone", label: "Số điện thoại", visible: true },
  { id: "dateOfBirth", label: "Ngày sinh", visible: true },
  { id: "address", label: "Địa chỉ", visible: true },
  { id: "joinDate", label: "Ngày bắt đầu", visible: true },
  { id: "position", label: "Chức danh", visible: true },
  { id: "department", label: "Phòng ban", visible: true },
  { id: "grade", label: "Bậc lương", visible: true },
  { id: "netSalary", label: "Lương thực lĩnh", visible: true },
  { id: "trainingProgress", label: "Tiến độ đào tạo", visible: true },
  { id: "medicalFile", label: "File hồ sơ y tế", visible: false },
  { id: "businessTripDates", label: "Ngày công tác", visible: false },
  { id: "businessTripLocations", label: "Địa điểm công tác", visible: false },
  { id: "familyName", label: "Họ tên thân nhân", visible: false },
  { id: "familyRelation", label: "Mối quan hệ", visible: false },
  { id: "familyPhone", label: "SĐT thân nhân", visible: false },
  { id: "familyAddress", label: "Địa chỉ thân nhân", visible: false },
  { id: "leaveRequestName", label: "Tên đơn nghỉ", visible: false },
  { id: "leaveReason", label: "Lý do nghỉ", visible: false },
  { id: "leaveSubmitDate", label: "Ngày nộp đơn", visible: false },
];

function SortableHeader({ column }: { column: Column }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableHead ref={setNodeRef} style={style} className="relative">
      <div className="flex items-center gap-2">
        <div {...attributes} {...listeners} className="cursor-move">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <span>{column.label}</span>
      </div>
    </TableHead>
  );
}

export default function Reports() {
  const [columns, setColumns] = useState<Column[]>(initialColumns);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const visibleColumns = useMemo(() => columns.filter((col) => col.visible), [columns]);

  const reportData = useMemo(() => {
    return mockData.employees.map((emp) => {
      const enrollments = mockData.trainingEnrollments.filter((e) => e.employeeId === emp.id);
      const completedCount = enrollments.filter((e) => e.status === "Completed").length;
      const trainingProgress = enrollments.length > 0 ? `${completedCount}/${enrollments.length}` : "0/0";

      const medicalRecords = mockData.medicalRecords.filter((m) => m.patientId === emp.id);
      const medicalFile = medicalRecords.length > 0 ? medicalRecords[0].fileUrl : "-";

      const schedules = mockData.workSchedules.filter((s) => s.employeeId === emp.id);
      const businessTripDates = schedules.map((s) => `${s.dayOfWeek} ${s.startTime}-${s.endTime}`).join(", ") || "-";
      const businessTripLocations = schedules.map((s) => s.shift).join(", ") || "-";

      const family = mockData.familyMembers.filter((f) => f.employeeId === emp.id);
      const familyName = family.length > 0 ? family.map((f) => f.fullName).join(", ") : "-";
      const familyRelation = family.length > 0 ? family.map((f) => f.relation).join(", ") : "-";
      const familyPhone = family.length > 0 ? family.map((f) => f.phone || "-").join(", ") : "-";
      const familyAddress = family.length > 0 ? family.map((f) => f.address || "-").join(", ") : "-";

      const leaves = mockData.leaveRequests.filter((l) => l.employeeId === emp.id);
      const leaveRequestName = leaves.length > 0 ? leaves.map((l) => l.fileName).join(", ") : "-";
      const leaveReason = leaves.length > 0 ? leaves.map((l) => l.reason).join(", ") : "-";
      const leaveSubmitDate = leaves.length > 0 ? leaves.map((l) => new Date(l.uploadDate).toLocaleDateString("vi-VN")).join(", ") : "-";

      // Calculate net salary
      const baseSalary = emp.salary?.base || 0;
      const allowances = emp.salary?.allowances || {};
      const allowanceTotal = Object.values(allowances).reduce((sum, val) => sum + val, 0);
      const customItems = emp.customSalaryItems || [];
      const customTotal = customItems.reduce((sum, item) => {
        if (item.type === "EARNING") {
          if (item.method === "FIXED") return sum + item.value;
          return sum + (baseSalary * item.value / 100);
        } else {
          if (item.method === "FIXED") return sum - item.value;
          return sum - (baseSalary * item.value / 100);
        }
      }, 0);
      const netSalary = baseSalary + allowanceTotal + customTotal;

      const dept = mockData.departments.find(d => d.id === emp.departmentId);

      return {
        id: emp.id,
        name: `${emp.firstName} ${emp.lastName}`,
        email: emp.email,
        phone: emp.phone || "-",
        dateOfBirth: emp.dateOfBirth ? new Date(emp.dateOfBirth).toLocaleDateString("vi-VN") : "-",
        address: emp.address || "-",
        joinDate: new Date(emp.startDate).toLocaleDateString("vi-VN"),
        position: emp.position,
        department: dept?.name || "-",
        grade: emp.grade,
        netSalary: netSalary.toLocaleString("vi-VN") + " VNĐ",
        trainingProgress,
        medicalFile,
        businessTripDates,
        businessTripLocations,
        familyName,
        familyRelation,
        familyPhone,
        familyAddress,
        leaveRequestName,
        leaveReason,
        leaveSubmitDate,
      };
    });
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setColumns((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const toggleColumn = (columnId: string) => {
    setColumns((cols) =>
      cols.map((col) => (col.id === columnId ? { ...col, visible: !col.visible } : col))
    );
  };

  const exportToCSV = () => {
    const headers = visibleColumns.map((col) => col.label).join(",");
    const rows = reportData.map((row) =>
      visibleColumns.map((col) => `"${row[col.id as keyof typeof row]}"`).join(",")
    );
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `bao-cao-nhan-vien-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Báo cáo tổng hợp</h1>
          <p className="text-muted-foreground mt-1">Quản lý và xuất báo cáo thông tin nhân viên</p>
        </div>
        <div className="flex gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">
                <Settings2 className="h-4 w-4 mr-2" />
                Tùy chỉnh cột
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Tùy chỉnh hiển thị cột</SheetTitle>
                <SheetDescription>Chọn các cột muốn hiển thị trong báo cáo</SheetDescription>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-200px)] mt-4">
                <div className="space-y-4">
                  {columns.map((col) => (
                    <div key={col.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={col.id}
                        checked={col.visible}
                        onCheckedChange={() => toggleColumn(col.id)}
                      />
                      <Label htmlFor={col.id} className="cursor-pointer">
                        {col.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
          <Button onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách nhân viên chi tiết</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-auto">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableContext items={visibleColumns.map((c) => c.id)} strategy={horizontalListSortingStrategy}>
                      {visibleColumns.map((col) => (
                        <SortableHeader key={col.id} column={col} />
                      ))}
                    </SortableContext>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.map((row) => (
                    <TableRow key={row.id}>
                      {visibleColumns.map((col) => (
                        <TableCell key={col.id}>{row[col.id as keyof typeof row]}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </DndContext>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
