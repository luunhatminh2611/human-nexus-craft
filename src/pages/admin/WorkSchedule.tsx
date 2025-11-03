import { useState } from "react";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Layer } from "recharts";
import { Layout } from "@/components/Layout";

// ---------------- MOCK DATA ----------------
const mockDepartments = [
  { id: "dept1", name: "Kế toán" },
  { id: "dept2", name: "Nhân sự" },
  { id: "dept3", name: "Kỹ thuật" },
];

const mockEmployees = [
  { id: "emp1", name: "Nguyễn Văn A", departmentId: "dept1" },
  { id: "emp2", name: "Trần Thị B", departmentId: "dept2" },
  { id: "emp3", name: "Lê Văn C", departmentId: "dept3" },
  { id: "emp4", name: "Phạm Thị D", departmentId: "dept1" },
];

const mockWorkSchedules = [
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
  {
    id: "ws3",
    employeeId: "emp2",
    date: "2025-10-24",
    location: "Đà Nẵng",
    startTime: "10:00",
  },
];

export default function WorkScheduleManagement() {
  const [selectedDept, setSelectedDept] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 9, 1));
  const [schedules, setSchedules] = useState(mockWorkSchedules);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const filteredEmployees = mockEmployees.filter((e) =>
    selectedDept ? e.departmentId === selectedDept : true
  );

  const getMonthCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const calendar = [];
    let week = [];

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      week.push({
        date: date.toISOString().split("T")[0],
        day: date.getDate(),
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === new Date().toDateString(),
      });

      if (week.length === 7) {
        calendar.push(week);
        week = [];
      }
    }

    return calendar;
  };

  const calendar = getMonthCalendar();

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
    setSelectedDay(schedule.date);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const monthNames = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
  ];

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="w-7 h-7 text-blue-600" />
            Lịch công tác
          </h1>

          <div className="flex gap-2 items-center">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="">Tất cả phòng ban</option>
              {mockDepartments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-1" /> Import
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" /> Export
            </Button>
          </div>
        </div>

        <Card className="p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" onClick={goToPreviousMonth}>
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <div className="flex flex-col items-center gap-2">
              <h2 className="text-2xl font-bold text-gray-800">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h2>
              {/* Ô chọn ngày */}
              <input
                type="date"
                className="border rounded-lg px-2 py-1 text-sm bg-white cursor-pointer"
                value={(() => {
                  const year = currentMonth.getFullYear();
                  const month = currentMonth.getMonth();
                  // Hiển thị ngày đầu tháng hiện tại
                  return `${year}-${String(month + 1).padStart(2, "0")}-01`;
                })()}
                onChange={(e) => {
                  const selectedDate = new Date(e.target.value);
                  setCurrentMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
                }}
              />
            </div>

            <Button variant="outline" onClick={goToNextMonth}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
                  <TableHead key={day} className="text-center font-bold text-base">
                    {day}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {calendar.map((week, weekIndex) => (
                <TableRow key={weekIndex}>
                  {week.map((day, dayIndex) => {
                    const daySchedules = getScheduleForDay(day.date);
                    return (
                      <TableCell
                        key={dayIndex}
                        className={`align-top h-32 p-2 border ${!day.isCurrentMonth ? "bg-gray-100" : "bg-white"
                          } ${day.isToday ? "bg-blue-50 border-2 border-blue-400" : ""}`}
                      >
                        <div className="h-full flex flex-col">
                          <div
                            className={`text-sm font-semibold mb-1 ${!day.isCurrentMonth ? "text-gray-400" : "text-gray-800"
                              } ${day.isToday ? "text-blue-600 font-bold" : ""}`}
                          >
                            {day.day}
                          </div>

                          <div className="flex-1 overflow-y-auto space-y-1">
                            {daySchedules.map((s) => {
                              const emp = mockEmployees.find(
                                (e) => e.id === s.employeeId
                              );
                              return (
                                <div
                                  key={s.id}
                                  className="bg-blue-100 p-1.5 rounded-md text-xs cursor-pointer hover:bg-blue-200 transition-all group relative"
                                  onClick={() => handleEdit(s)}
                                >
                                  <div className="font-semibold truncate text-gray-800">{emp?.name}</div>
                                  <div className="text-gray-600 flex items-center gap-1 mt-0.5">
                                    <MapPin size={10} /> <span className="truncate">{s.location}</span>
                                  </div>
                                  <div className="text-gray-600 flex items-center gap-1">
                                    <Clock size={10} /> {s.startTime}
                                  </div>
                                  <Trash2
                                    size={12}
                                    className="absolute top-1 right-1 text-red-500 opacity-0 group-hover:opacity-100 hover:text-red-700 transition-opacity"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(s.id);
                                    }}
                                  />
                                </div>
                              );
                            })}
                          </div>

                          {day.isCurrentMonth && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAddSchedule(day.date)}
                              className="mt-1 w-full border border-dashed border-gray-300 text-gray-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 text-xs py-1 h-auto"
                            >
                              <Plus size={12} className="mr-1" /> Thêm
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-96 shadow-2xl">
              <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                {editingSchedule ? (
                  <>
                    <Edit size={20} className="text-blue-600" /> Chỉnh sửa lịch công tác
                  </>
                ) : (
                  <>
                    <Plus size={20} className="text-green-600" /> Thêm lịch công tác
                  </>
                )}
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Ngày</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 mt-1"
                    value={selectedDay || ""}
                    disabled
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700">Nhân viên</label>
                  <select
                    id="employee"
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                    defaultValue={editingSchedule?.employeeId || ""}
                  >
                    {filteredEmployees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700">Địa điểm</label>
                  <input
                    id="location"
                    type="text"
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                    placeholder="Nhập địa điểm..."
                    defaultValue={editingSchedule?.location || ""}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700">Giờ bắt đầu</label>
                  <input
                    id="startTime"
                    type="time"
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                    defaultValue={editingSchedule?.startTime || ""}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowModal(false)}
                >
                  <X size={16} className="mr-1" /> Hủy
                </Button>
                <Button
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
                  <Save size={16} className="mr-1" /> Lưu
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}