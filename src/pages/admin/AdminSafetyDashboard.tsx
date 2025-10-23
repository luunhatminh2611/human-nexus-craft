import { useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import mockData from "@/mock/data";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import type { Employee, IssuedSafetyItem } from "@/mock/data";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DepartmentStats {
    departmentName: string;
    total: number;
    inUse: number;
    expired: number;
    replaced: number;
    damaged: number;
}

export default function AdminSafetyDashboard() {
    const [filterDept, setFilterDept] = useState("all");
    const COLORS = ["#10b981", "#3b82f6", "#f97316", "#ef4444"];
    const navigate = useNavigate();

    const issuedItems = mockData.issuedSafetyItems;
    const employees = mockData.employees;
    const departments = mockData.departments;

    // --- Lọc theo phòng ban ---
    const filteredEmployees = useMemo(() => {
        if (filterDept === "all") return employees;
        return employees.filter((e) => e.departmentId === filterDept);
    }, [filterDept, employees]);

    const filteredIssuedItems = useMemo(() => {
        const allowedIds = filteredEmployees.map((e) => e.id);
        return issuedItems.filter((i) => allowedIds.includes(i.employeeId));
    }, [filteredEmployees, issuedItems]);

    // --- Gom nhóm theo phòng ban ---
    const groupedByDept = useMemo<DepartmentStats[]>(() => {
        const groups: Record<string, DepartmentStats> = {};

        filteredIssuedItems.forEach((i: IssuedSafetyItem) => {
            const emp = employees.find((e) => e.id === i.employeeId);
            const dept = departments.find((d) => d.id === emp?.departmentId);
            if (!dept) return;

            if (!groups[dept.id]) {
                groups[dept.id] = {
                    departmentName: dept.name,
                    total: 0,
                    inUse: 0,
                    expired: 0,
                    replaced: 0,
                    damaged: 0,
                };
            }

            groups[dept.id].total++;

            switch (i.status) {
                case "In Use":
                    groups[dept.id].inUse++;
                    break;
                case "Expired":
                    groups[dept.id].expired++;
                    break;
                case "Replaced":
                    groups[dept.id].replaced++;
                    break;
                case "DamagedEarly":
                    groups[dept.id].damaged++;
                    break;
            }
        });

        return Object.values(groups);
    }, [filteredIssuedItems, employees, departments]);

    // --- Biểu đồ tổng hợp ---
    const totalStats = useMemo(() => {
        let inUse = 0, expired = 0, damaged = 0, collected = 0;

        filteredIssuedItems.forEach((i) => {
            if (i.status === "In Use") inUse++;
            else if (i.status === "Expired") expired++;
            else if (i.status === "DamagedEarly") damaged++;

            if (i.replacedFromId) collected++;
        });

        return { inUse, expired, damaged, collected };
    }, [filteredIssuedItems]);

    const pieData = [
        { name: "Đang sử dụng", value: totalStats.inUse },
        { name: "Hết hạn", value: totalStats.expired },
        { name: "Thu về (bao gồm hỏng sớm)", value: totalStats.collected },
        { name: "Hỏng sớm", value: totalStats.damaged },
    ];

    // --- Bảng chi tiết đổi mới ---
    const replacedList = issuedItems.filter((i) => {
        if (!i.replacedFromId) return false;
        const oldItem = issuedItems.find((x) => x.id === i.replacedFromId);
        return oldItem && oldItem.safetyItemId === i.safetyItemId;
    });

    return (
        <Layout>
            <div className="space-y-6">
                <Tabs defaultValue="dashboard" className="w-full">
                    <TabsList className="flex gap-2 bg-muted p-2 rounded-lg">
                        <TabsTrigger value="dashboard" className="flex-1">
                            Thống kê cấp phát
                        </TabsTrigger>
                        <TabsTrigger
                            value="items"
                            className="flex-1"
                            onClick={() => navigate("/admin/safety-items")}
                        >
                            Kho BHLĐ
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                <h1 className="text-3xl font-bold">Thống kê cấp phát đồ bảo hộ</h1>

                {/* Bộ lọc phòng ban */}
                <div className="flex gap-4 items-center">
                    <label className="text-sm text-muted-foreground">Lọc theo phòng ban:</label>
                    <Select value={filterDept} onValueChange={setFilterDept}>
                        <SelectTrigger className="w-[250px]">
                            <SelectValue placeholder="Chọn phòng ban" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả</SelectItem>
                            {departments.map((d) => (
                                <SelectItem key={d.id} value={d.id}>
                                    {d.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Biểu đồ tổng quan */}
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Tổng quan tình trạng vật tư</h2>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                    {pieData.map((_, idx) => (
                                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Bảng tổng hợp theo phòng ban */}
                <Card>
                    <h2 className="text-lg font-semibold p-4">Tổng hợp theo phòng ban</h2>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Phòng ban</TableHead>
                                <TableHead>Tổng phát</TableHead>
                                <TableHead>Đang sử dụng</TableHead>
                                <TableHead>Hết hạn</TableHead>
                                <TableHead>Thu về</TableHead>
                                <TableHead>Hỏng sớm</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {groupedByDept.map((g) => (
                                <TableRow key={g.departmentName}>
                                    <TableCell>{g.departmentName}</TableCell>
                                    <TableCell>{g.total}</TableCell>
                                    <TableCell>{g.inUse}</TableCell>
                                    <TableCell>{g.expired}</TableCell>
                                    <TableCell>{g.replaced}</TableCell>
                                    <TableCell>{g.damaged}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>

                {/* Bảng chi tiết đổi mới */}
                <Card>
                    <h2 className="text-lg font-semibold p-4">Chi tiết đổi mới vật tư</h2>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Người phát</TableHead>
                                <TableHead>Nhân viên</TableHead>
                                <TableHead>Vật tư cũ</TableHead>
                                <TableHead>Vật tư mới</TableHead>
                                <TableHead>Ngày đổi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {replacedList.map((r) => {
                                const manager = employees.find((e) => e.id === r.issuedBy);
                                const emp = employees.find((e) => e.id === r.employeeId);
                                const oldItem = issuedItems.find((i) => i.id === r.replacedFromId);
                                const itemOld = mockData.safetyItems.find((s) => s.id === oldItem?.safetyItemId);
                                const itemNew = mockData.safetyItems.find((s) => s.id === r.safetyItemId);
                                return (
                                    <TableRow key={r.id}>
                                        <TableCell>{manager?.firstName} {manager?.lastName}</TableCell>
                                        <TableCell>{emp?.firstName} {emp?.lastName}</TableCell>
                                        <TableCell>{itemOld?.name || "—"}</TableCell>
                                        <TableCell>{itemNew?.name || "—"}</TableCell>
                                        <TableCell>{r.replacedDate || "21/11/2025"}</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </Layout>
    );
}
