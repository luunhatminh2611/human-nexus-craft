// WorkSchedule.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Card } from "@/shared/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/shared/components/tables/table";
import { Download, Upload, Plus, MapPin, Clock, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { unitApi } from "@/features/departments/api/departmentApi";
import { employeeApi } from "@/features/employees";
import { workScheduleApi } from "../../api/scheduleApi";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/shared/components/ui/calendar";
import WorkScheduleModal from "../../components/ScheduleModal";
import { Button } from "@/shared/components/ui/button/Button2";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

type ApiWorkSchedule = {
  id: number | string;
  title?: string;
  employeeId: number | string;
  employeeName?: string;
  location?: string;
  startDateTime: string;
  endDateTime?: string;
  startTime?: string;
  description?: string;
  status?: string;
  [k: string]: any;
};

type DaySchedule = {
  id: number | string;
  instanceId: string;
  employeeId: number | string;
  date: string;
  location?: string;
  status?: string;
  employeeName?: string;
  raw?: ApiWorkSchedule;
};

export default function WorkSchedule() {
  const [selectedDept, setSelectedDept] = useState<string | number>("");
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), 1)
  });
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<DaySchedule | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [isFromDayCell, setIsFromDayCell] = useState(false);

  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [rawWorkSchedules, setRawWorkSchedules] = useState<ApiWorkSchedule[]>([]);
  const [expandedSchedules, setExpandedSchedules] = useState<DaySchedule[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ISODate = (d: Date) => d.toISOString().split("T")[0];

  useEffect(() => {
    setSelectedDept(""); // Reset về tất cả
  }, []);

  const getDatesBetween = (startStr: string, endStr?: string) => {
    const dates: string[] = [];
    const start = new Date(startStr);
    const end = endStr ? new Date(endStr) : new Date(startStr);

    const curr = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());

    while (curr <= last) {
      dates.push(ISODate(curr));
      curr.setDate(curr.getDate() + 1);
    }
    return dates;
  };

  const expandAllSchedules = (items: ApiWorkSchedule[]) => {
    const result: DaySchedule[] = [];

    items.forEach((item) => {
      const start = item.startDateTime;
      const end = item.endDateTime ?? item.startDateTime;
      const days = getDatesBetween(start, end);

      days.forEach((d) => {
        result.push({
          id: item.id,
          instanceId: `${item.id}_${d}`,
          employeeId: item.employeeId,
          date: d,
          location: item.location,
          status: item.status ?? "",
          employeeName: item.employeeName,
          raw: item,
        });
      });
    });

    result.sort((a, b) => {
      if (a.date < b.date) return -1;
      if (a.date > b.date) return 1;
      const na = String(a.employeeName || a.employeeId);
      const nb = String(b.employeeName || b.employeeId);
      return na.localeCompare(nb);
    });

    setExpandedSchedules(result);
  };

  const fetchDepartments = async () => {
    try {
      const res = await unitApi.getAll();
      const data = res;
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Lỗi khi lấy departments", err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await employeeApi.getAll();
      const data = res;
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Lỗi khi lấy employees", err);
    }
  };

  // ✅ Updated: Fetch dựa vào selectedDept
  const fetchWorkSchedules = async () => {
    try {
      setLoading(true);
      setError(null);

      let res;
      // Kiểm tra selectedDept phải có giá trị thực sự (không phải "", null, undefined)
      if (selectedDept && selectedDept !== "all") {
        // Kiểm tra department có tồn tại không
        const deptExists = departments.find(d => String(d.id) === String(selectedDept));
        if (!deptExists) {
          setError(`Phòng ban ID ${selectedDept} không tồn tại`);
          setRawWorkSchedules([]);
          setExpandedSchedules([]);
          return;
        }
        // Gọi API filter theo phòng ban
        res = await workScheduleApi.getByDepartment(selectedDept);
      } else {
        // Gọi API lấy tất cả
        res = await workScheduleApi.getAll();
      }

      const raw =
        (res.data && res.data.data) ||
        res.data ||
        res;

      const schedules = Array.isArray(raw) ? raw : [];
      setRawWorkSchedules(schedules);
      expandAllSchedules(schedules);
    } catch (err: any) {
      console.error("Lỗi khi lấy work schedule:", err);
      const errorMsg = err?.response?.data?.message || err?.message || "Không tải được lịch công tác từ server";
      setError(errorMsg);
      setRawWorkSchedules([]);
      setExpandedSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
  }, []);

  // ✅ Re-fetch khi selectedDept thay đổi
  useEffect(() => {
    fetchWorkSchedules();
  }, [selectedDept]);

  useEffect(() => {
    expandAllSchedules(rawWorkSchedules);
  }, [rawWorkSchedules]);

  const getMonthCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const calendar: any[] = [];
    let week: any[] = [];

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      week.push({
        date: ISODate(date),
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

  const STATUS_CONFIG = {
    SCHEDULED: {
      label: "Đã lên lịch",
      color: "bg-blue-100 text-blue-700 border-blue-300",
    },
    CONFIRMED: {
      label: "Đã xác nhận",
      color: "bg-green-100 text-green-700 border-green-300",
    },
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;

    const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || {
      label: status,
      color: "bg-gray-100 text-gray-600 border-gray-300",
    };

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // ✅ Đơn giản hóa: Backend đã filter rồi, không cần filter client-side nữa
  const getScheduleForDay = (date: string) =>
    expandedSchedules.filter((s) => s.date === date);

  const handleAddSchedule = (day: string) => {
    setEditingSchedule(null);
    setSelectedDay(day);
    setIsFromDayCell(true);
    setShowModal(true);
  };

  const handleEdit = (sched: DaySchedule) => {
    setEditingSchedule(sched);
    setSelectedDay(sched.date);
    setShowModal(true);
  };

  const handleDelete = async (sched: DaySchedule) => {
    if (!confirm("Bạn có chắc muốn xóa lịch công tác này? (sẽ xóa toàn bộ bản ghi gốc)")) return;
    try {
      setLoading(true);
      await workScheduleApi.delete(sched.id);
      await fetchWorkSchedules();
    } catch (err) {
      console.error("Lỗi khi xóa:", err);
      alert("Xóa thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSchedule = async (
    title: string,
    employeeId: string | number,
    location: string,
    description: string,
    startDate: string,
    endDate: string
  ) => {
    try {
      setLoading(true);
      if (editingSchedule) {
        const raw = editingSchedule.raw as ApiWorkSchedule;
        const payload = {
          title,
          employeeId,
          location,
          startDateTime: startDate,
          endDateTime: endDate,
          description,
        };
        await workScheduleApi.update(raw.id as number, payload);
      } else {
        const payload = {
          title,
          employeeId,
          location,
          startDateTime: startDate,
          endDateTime: endDate,
          description,
        };
        await workScheduleApi.create(payload);
      }

      await fetchWorkSchedules();
      setShowModal(false);
    } catch (err) {
      console.error("Lỗi khi lưu lịch công tác:", err);
      alert(err?.message)
    } finally {
      setLoading(false);
    }
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

  // ✅ Filter employees theo phòng ban đã chọn (cho modal)
  const filteredEmployees = useMemo(
    () =>
      employees.filter((e) =>
        selectedDept ? String(e.departmentId) === String(selectedDept) : true
      ),
    [employees, selectedDept]
  );

  return (
    <div className="max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CalendarIcon className="w-7 h-7 text-blue-600" />
          Lịch công tác
        </h1>

        <div className="flex gap-2 items-center">
          <Select
            value={selectedDept ? String(selectedDept) : "all"}
            onValueChange={(value) => setSelectedDept(value === "all" ? "" : value)}
          >
            <SelectTrigger className="w-[200px] bg-white">
              <SelectValue placeholder="Tất cả phòng ban" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả phòng ban</SelectItem>
              {departments.map((d) => (
                <SelectItem key={String(d.id)} value={String(d.id)}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="default"
            size="sm"
            onClick={() => {
              setEditingSchedule(null);
              setSelectedDay(null);
              setIsFromDayCell(false);
              setShowModal(true);
            }}
            className="bg-green-500 text-white hover:bg-green-300"
          >
            <Plus className="w-4 h-4 mr-1" /> Thêm lịch công tác
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
            <div className="relative">
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="border rounded-lg px-3 py-1.5 text-sm bg-white flex items-center gap-2 hover:bg-gray-50"
                  >
                    <CalendarIcon className="w-4 h-4 text-gray-600" />
                    {currentMonth.toISOString().split("T")[0]}
                  </button>
                </PopoverTrigger>

                <PopoverContent className="p-0">
                  <Calendar
                    mode="single"
                    selected={currentMonth}
                    onSelect={(date) => {
                      if (date) {
                        setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Button variant="outline" onClick={goToNextMonth}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {loading && <div className="mb-3 text-sm text-gray-600">Đang tải dữ liệu...</div>}
        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}

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
                            const emp = employees.find((e) => String(e.id) === String(s.employeeId));
                            return (
                              <div
                                key={s.instanceId}
                                className="bg-blue-100 p-1.5 rounded-md text-xs cursor-pointer hover:bg-blue-200 transition-all group relative"
                                onClick={() => handleEdit(s)}
                              >
                                <div className="font-semibold truncate text-gray-800">{s.employeeName ?? emp?.name}</div>
                                <div className="text-gray-600 flex items-center gap-1 mt-0.5">
                                  <MapPin size={10} /> <span className="truncate">{s.location}</span>
                                </div>
                                <div className="flex items-center gap-1 mt-0.5">
                                  {getStatusBadge(s.status)}
                                </div>
                                <Trash2
                                  size={12}
                                  className="absolute top-1 right-1 text-red-500 opacity-0 group-hover:opacity-100 hover:text-red-700 transition-opacity"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(s);
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
      <WorkScheduleModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveSchedule}
        editingSchedule={editingSchedule}
        selectedDay={selectedDay}
        isFromDayCell={isFromDayCell}
        filteredEmployees={employees}
      />
    </div>
  );
}