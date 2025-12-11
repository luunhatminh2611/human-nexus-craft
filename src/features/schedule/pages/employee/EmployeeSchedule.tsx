// EmployeeWorkSchedule.tsx
import React, { useEffect, useState } from "react";
import { Card } from "@/shared/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/shared/components/tables/table";
import { MapPin, ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react";
import { workScheduleApi } from "../../api/scheduleApi";
import { employeeApi } from "@/features/employees";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Calendar } from "@/shared/components/ui/calendar";
import { Button } from "@/shared/components/ui/button/Button2";
import { useAuthStore } from "@/features/employees/hooks/useAuth";

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

export default function EmployeeWorkSchedule() {
  const { user } = useAuthStore();
  
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [rawWorkSchedules, setRawWorkSchedules] = useState<ApiWorkSchedule[]>([]);
  const [expandedSchedules, setExpandedSchedules] = useState<DaySchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ISODate = (d: Date) => d.toISOString().split("T")[0];

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
      return 0;
    });

    setExpandedSchedules(result);
  };

  // ✅ Bước 1: Lấy employeeId từ userId
  const fetchEmployeeId = async () => {
    try {
      if (!user?.userId) {
        console.warn("Không có userId");
        return;
      }

      const employeeData = await employeeApi.getProfile(user?.userId);
      
      if (employeeData?.id) {
        setEmployeeId(employeeData.id);
        console.log("Employee ID:", user);
      } else {
        console.warn("Không tìm thấy employeeId");
      }
    } catch (err) {
      console.error("Lỗi khi lấy employeeId:", err);
      setError("Không thể lấy thông tin nhân viên");
    }
  };

  // ✅ Bước 2: Lấy work schedules bằng employeeId
  const fetchWorkSchedules = async () => {
    try {
      if (!employeeId) {
        console.warn("Không có employeeId");
        return;
      }

      setLoading(true);
      setError(null);
      
      const schedules = await workScheduleApi.getByUser(employeeId);
      const scheduleArray = Array.isArray(schedules) ? schedules : [];
      
      setRawWorkSchedules(scheduleArray);
      expandAllSchedules(scheduleArray);
      
      console.log(`Fetched ${scheduleArray.length} schedules for employee ${employeeId}`);
    } catch (err: any) {
      console.error("Lỗi khi lấy work schedule:", err);
      setError("Không tải được lịch công tác từ server");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Effect 1: Fetch employeeId khi có userId
  useEffect(() => {
    if (user?.userId) {
      fetchEmployeeId();
    }
  }, [user?.userId]);

  useEffect(() => {
    if (employeeId) {
      fetchWorkSchedules();
    }
  }, [employeeId]);

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

  const getScheduleForDay = (date: string) =>
    expandedSchedules.filter((s) => s.date === date);

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
    <div className="max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CalendarIcon className="w-7 h-7 text-blue-600" />
          Lịch công tác của tôi
        </h1>
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
                          {daySchedules.map((s) => (
                            <div
                              key={s.instanceId}
                              className="bg-blue-100 p-1.5 rounded-md text-xs"
                            >
                              <div className="font-semibold truncate text-gray-800">
                                {s.raw?.title || "Công tác"}
                              </div>
                              <div className="text-gray-600 flex items-center gap-1 mt-0.5">
                                <MapPin size={10} /> <span className="truncate">{s.location}</span>
                              </div>
                              <div className="flex items-center gap-1 mt-0.5">
                                {getStatusBadge(s.status)}
                              </div>
                              {s.raw?.description && (
                                <div className="text-gray-500 text-xs mt-1 truncate">
                                  {s.raw.description}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}