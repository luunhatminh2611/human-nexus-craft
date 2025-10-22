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
    BarChart,
    Bar,
    XAxis,
    YAxis,
} from "recharts";
import type { Employee, IssuedSafetyItem } from "@/mock/data";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ManagerGroupStats {
    manager: Employee;
    total: number;
    inUse: number;
    expired: number;
    replaced: number;
    damaged: number;
}

export default function AdminSafetyDashboard() {
    const [filterManager, setFilterManager] = useState("all");
    const COLORS = ["#10b981", "#3b82f6", "#f97316", "#ef4444"];
    const navigate = useNavigate();

    // --- Chuẩn hóa dữ liệu ---
    const issuedItems = mockData.issuedSafetyItems;
    const employees = mockData.employees;
    const managers = mockData.employees.filter((e) =>
        employees.some((emp) => emp.managerId === e.id)
    );

    // --- Lọc theo người quản lý ---
    const filtered = useMemo(() => {
        if (filterManager === "all") return issuedItems;
        return issuedItems.filter((i) => i.issuedBy === filterManager);
    }, [filterManager]);

    // --- Gom nhóm theo người phát ---
    const groupedByManager = useMemo<ManagerGroupStats[]>(() => {
        const groups: Record<string, ManagerGroupStats> = {};

        filtered.forEach((i: IssuedSafetyItem) => {
            const manager = employees.find((e) => e.id === i.issuedBy);
            if (!manager) return;

            if (!groups[manager.id]) {
                groups[manager.id] = {
                    manager,
                    total: 0,
                    inUse: 0,
                    expired: 0,
                    replaced: 0,
                    damaged: 0,
                };
            }

            groups[manager.id].total++;

            switch (i.status) {
                case "In Use":
                    groups[manager.id].inUse++;
                    break;
                case "Expired":
                    groups[manager.id].expired++;
                    break;
                case "Replaced":
                    groups[manager.id].replaced++;
                    break;
                case "DamagedEarly":
                    groups[manager.id].damaged++;
                    break;
            }
        });

        // Bổ sung số liệu thu về = Replaced + DamagedEarly (nếu có replacedFromId trỏ tới)
        Object.values(groups).forEach((g) => {
            g.replaced += filtered.filter(
                (x) => x.replacedFromId && x.issuedBy === g.manager.id
            ).length;
        });

        return Object.values(groups);
    }, [filtered, employees]);

    // --- Biểu đồ tổng hợp ---
    const totalStats = useMemo(() => {
        let inUse = 0, expired = 0, damaged = 0, collected = 0;

        filtered.forEach((i) => {
            if (i.status === "In Use") inUse++;
            else if (i.status === "Expired") expired++;
            else if (i.status === "DamagedEarly") damaged++;

            // Nếu vật tư này là vật tư mới có replacedFromId => nghĩa là đã thu về 1 cái cũ
            if (i.replacedFromId) collected++;
        });

        return { inUse, expired, damaged, collected };
    }, [filtered]);

    const pieData = [
        { name: "Đang sử dụng", value: totalStats.inUse },
        { name: "Hết hạn", value: totalStats.expired },
        { name: "Thu về (bao gồm hỏng sớm)", value: totalStats.collected },
        { name: "Hỏng sớm", value: totalStats.damaged },
    ];

    // --- Bảng đổi mới ---
    const replacedList = issuedItems.filter((i) => {
        if (!i.replacedFromId) return false;
        const oldItem = issuedItems.find((x) => x.id === i.replacedFromId);
        return oldItem && oldItem.safetyItemId === i.safetyItemId;
    })
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
                            Danh mục BHLĐ
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
                <h1 className="text-3xl font-bold">Thống kê cấp phát đồ bảo hộ</h1>

                {/* Bộ lọc */}
                <div className="flex gap-4 items-center">
                    <label className="text-sm text-muted-foreground">Lọc theo quản lý:</label>
                    <Select value={filterManager} onValueChange={setFilterManager}>
                        <SelectTrigger className="w-[250px]">
                            <SelectValue placeholder="Chọn người quản lý" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả</SelectItem>
                            {managers.map((m) => (
                                <SelectItem key={m.id} value={m.id}>
                                    {m.firstName} {m.lastName}
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

                {/* Bảng tổng hợp theo quản lý */}
                <Card>
                    <h2 className="text-lg font-semibold p-4">Người được phát</h2>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nhân viên</TableHead>
                                <TableHead>Tổng phát</TableHead>
                                <TableHead>Hết hạn</TableHead>
                                <TableHead>Đã thu về</TableHead>
                                <TableHead>Hỏng sớm</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {groupedByManager.map((g) => (
                                <TableRow key={g.manager.id}>
                                    <TableCell>{g.manager.firstName} {g.manager.lastName}</TableCell>
                                    <TableCell>{g.total}</TableCell>
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
                                const oldItem = mockData.issuedSafetyItems.find((i) => i.id === r.replacedFromId);
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
