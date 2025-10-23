import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Download,
  Upload,
  Plus,
  Save,
  X,
  Calendar,
  MapPin,
  Clock,
  Trash2,
  Edit,
} from "lucide-react";

// ---------------- MOCK DATA ----------------
export const mockDepartments = [
  { id: "dept1", name: "Kế toán" },
  { id: "dept2", name: "Nhân sự" },
  { id: "dept3", name: "Kỹ thuật" },
];

export const mockEmployees = [
  { id: "emp1", name: "Nguyễn Văn A", departmentId: "dept1" },
  { id: "emp2", name: "Trần Thị B", departmentId: "dept2" },
  { id: "emp3", name: "Lê Văn C", departmentId: "dept3" },
  { id: "emp4", name: "Phạm Thị D", departmentId: "dept1" },
];

export const mockWorkSchedules = [
  {
    id: "ws1",
    employeeId: "emp1",
    date: "2025-10-20",
    location: "Hà Nội",
    startTime: "08:30",
  },
  {
    id: "ws2",
    employeeId: "emp3",
    date: "2025-10-21",
    location: "Hải Phòng",
    startTime: "09:00",
  },
];
// ------------------------------------------------------

export default function WorkScheduleManagement() {
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedWeek, setSelectedWeek] = useState("2025-W43");
  const [schedules, setSchedules] = useState(mockWorkSchedules);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const filteredEmployees = mockEmployees.filter((e) =>
    selectedDept ? e.departmentId === selectedDept : true
  );

  // Tạo danh sách ngày trong tuần
  const getWeekDays = () => {
    const [year, week] = selectedWeek.split("-W").map(Number);
    const firstDay = new Date(year, 0, 1 + (week - 1) * 7);
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(firstDay);
      d.setDate(d.getDate() - d.getDay() + 1 + i);
      return {
        id: i,
        name: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"][i],
        date: d.toISOString().split("T")[0],
      };
    });
    return days;
  };

  const weekDays = getWeekDays();

  const getScheduleForDay = (date: string) =>
    schedules.filter((s) => s.date === date);

  const handleAddSchedule = (day: string) => {
    setEditingSchedule(null);
    setSelectedDay(day);
    setShowModal(true);
  };

  const handleSaveSchedule = (
    employeeId: string,
    location: string,
    startTime: string
  ) => {
    if (editingSchedule) {
      setSchedules((prev) =>
        prev.map((s) =>
          s.id === editingSchedule.id
            ? { ...s, employeeId, location, startTime }
            : s
        )
      );
    } else {
      const newSchedule = {
        id: `ws_${Date.now()}`,
        employeeId,
        date: selectedDay!,
        location,
        startTime,
      };
      setSchedules((prev) => [...prev, newSchedule]);
    }
    setShowModal(false);
  };

  const handleEdit = (schedule: any) => {
    setEditingSchedule(schedule);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Lịch công tác
        </h1>

        <div className="flex gap-2 items-center">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="">Tất cả phòng ban</option>
            {mockDepartments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <input
            type="week"
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          />

          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-1" /> Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1" /> Export
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <Table>
          <TableHeader>
            <TableRow>
              {weekDays.map((day) => (
                <TableHead key={day.id} className="text-center">
                  {day.name}
                  <div className="text-xs text-gray-500">{day.date}</div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            <TableRow>
              {weekDays.map((day) => (
                <TableCell key={day.id}>
                  <div className="space-y-2">
                    {getScheduleForDay(day.date).map((s) => {
                      const emp = mockEmployees.find(
                        (e) => e.id === s.employeeId
                      );
                      return (
                        <div
                          key={s.id}
                          className="flex items-center justify-between bg-blue-100 p-2 rounded text-sm cursor-pointer hover:bg-blue-200 transition"
                          onClick={() => handleEdit(s)}
                        >
                          <div>
                            <div className="font-medium">{emp?.name}</div>
                            <div className="text-xs text-gray-600 flex items-center gap-1">
                              <MapPin size={12} /> {s.location}
                            </div>
                            <div className="text-xs text-gray-600 flex items-center gap-1">
                              <Clock size={12} /> {s.startTime}
                            </div>
                          </div>
                          <Trash2
                            size={14}
                            className="text-red-500 hover:text-red-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(s.id);
                            }}
                          />
                        </div>
                      );
                    })}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddSchedule(day.date)}
                      className="w-full border border-dashed border-gray-300 text-gray-500 hover:border-blue-500 hover:text-blue-600"
                    >
                      <Plus size={12} className="mr-1" /> Thêm
                    </Button>
                  </div>
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </Card>

      {/* Modal thêm/sửa */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-80">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              {editingSchedule ? (
                <>
                  <Edit size={16} /> Chỉnh sửa lịch công tác
                </>
              ) : (
                <>
                  <Plus size={16} /> Thêm lịch công tác
                </>
              )}
            </h3>

            <label className="text-sm">Nhân viên</label>
            <select
              id="employee"
              className="w-full border rounded px-2 py-1 mb-2 text-sm"
              defaultValue={editingSchedule?.employeeId || ""}
            >
              {filteredEmployees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>

            <label className="text-sm">Địa điểm</label>
            <input
              id="location"
              type="text"
              className="w-full border rounded px-2 py-1 mb-2 text-sm"
              placeholder="Nhập địa điểm..."
              defaultValue={editingSchedule?.location || ""}
            />

            <label className="text-sm">Giờ bắt đầu</label>
            <input
              id="startTime"
              type="time"
              className="w-full border rounded px-2 py-1 mb-4 text-sm"
              defaultValue={editingSchedule?.startTime || ""}
            />

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowModal(false)}
              >
                <X size={14} className="mr-1" /> Hủy
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  const emp = (
                    document.getElementById("employee") as HTMLSelectElement
                  ).value;
                  const location = (
                    document.getElementById("location") as HTMLInputElement
                  ).value;
                  const startTime = (
                    document.getElementById("startTime") as HTMLInputElement
                  ).value;
                  handleSaveSchedule(emp, location, startTime);
                }}
              >
                <Save size={14} className="mr-1" /> Lưu
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
