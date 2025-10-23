import { useParams } from "react-router-dom";
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import mockData, { IssuedSafetyItem } from "@/mock/data";

export default function ManagerSafetyDetail() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const employee = mockData.employees.find((e) => e.id === employeeId);

  // Giả lập số lượng vật tư còn lại trong phòng ban (tách ra từ mockData)
  const initialDepartmentStock = mockData.safetyItems.map((item) => ({
    id: item.id,
    name: item.name,
    quantity: Math.floor(Math.random() * 10) + 5, // ví dụ 5–15 vật tư còn lại
  }));

  const [departmentStock, setDepartmentStock] = useState(initialDepartmentStock);
  const [issuedItems, setIssuedItems] = useState<IssuedSafetyItem[]>(
    mockData.issuedSafetyItems.filter((i) => i.employeeId === employeeId)
  );

  const [openAdd, setOpenAdd] = useState(false);
  const [selectedItem, setSelectedItem] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [confirmEarlyModal, setConfirmEarlyModal] = useState(false);
  const [pendingReplaceId, setPendingReplaceId] = useState<string | null>(null);

  const getItemName = (id: string) =>
    mockData.safetyItems.find((i) => i.id === id)?.name || id;

  // Badge hiển thị trạng thái
  const getStatusBadge = (status: IssuedSafetyItem["status"]) => {
    const label = {
      "In Use": "Đang sử dụng",
      "Expiring Soon": "Sắp hết hạn",
      "Expired": "Đã hết hạn",
      "Replaced": "Đã thay thế",
      "DamagedEarly": "Yêu cầu đổi",
    }[status];

    const colorMap: Record<IssuedSafetyItem["status"], string> = {
      "In Use": "bg-green-500 text-white",
      "Expiring Soon": "bg-yellow-400 text-black",
      "Expired": "bg-red-500 text-white",
      "Replaced": "bg-gray-300 text-black",
      "DamagedEarly": "bg-orange-400 text-white",
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colorMap[status]}`}>
        {label}
      </span>
    );
  };

  // Phát vật tư mới
  const handleAddNew = () => {
    if (!selectedItem || !issueDate) {
      alert("Vui lòng chọn vật tư và ngày cấp.");
      return;
    }

    const safetyItem = mockData.safetyItems.find((i) => i.id === selectedItem);
    if (!safetyItem) {
      alert("Không tìm thấy vật tư này trong danh sách.");
      return;
    }

    // Trừ số lượng trong kho phòng
    setDepartmentStock((prev) =>
      prev.map((s) =>
        s.id === selectedItem ? { ...s, quantity: Math.max(s.quantity - 1, 0) } : s
      )
    );

    const expireDate = new Date(
      new Date(issueDate).getTime() +
        safetyItem.defaultExpireDays * 24 * 60 * 60 * 1000
    )
      .toISOString()
      .split("T")[0];

    const newItem: IssuedSafetyItem = {
      id: `issue_${Date.now()}`,
      safetyItemId: selectedItem,
      employeeId: employeeId!,
      issuedBy: "emp002",
      issueDate,
      expireDate,
      status: "In Use",
      note: "Phát mới từ giao diện quản lý",
    };

    setIssuedItems((prev) => [...prev, newItem]);
    setOpenAdd(false);
    setSelectedItem("");
    setIssueDate("");
  };

  // Bấm nút "Đổi vật tư"
  const handleReplace = (itemId: string) => {
    const item = issuedItems.find((i) => i.id === itemId);
    if (!item) return;

    if (["In Use", "DamagedEarly"].includes(item.status)) {
      setPendingReplaceId(itemId);
      setConfirmEarlyModal(true);
    } else {
      processReplace(itemId, false);
    }
  };

  // Xử lý đổi vật tư
  const processReplace = (itemId: string, early: boolean) => {
    const oldItem = issuedItems.find((i) => i.id === itemId);
    if (oldItem) {
      // Khi đổi → trừ 1 vật tư cùng loại trong kho phòng
      setDepartmentStock((prev) =>
        prev.map((s) =>
          s.id === oldItem.safetyItemId
            ? { ...s, quantity: Math.max(s.quantity - 1, 0) }
            : s
        )
      );
    }

    setIssuedItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? {
              ...i,
              status: early ? "DamagedEarly" : "Replaced",
              note: early ? "Đổi sớm (hỏng hoặc yêu cầu trước hạn)" : "Đổi đúng hạn",
              replacedDate: new Date().toISOString().split("T")[0],
            }
          : i
      )
    );

    alert(
      early
        ? "Vật tư được đánh dấu là đổi sớm. Giờ bạn có thể cấp vật tư mới."
        : "Đã đánh dấu vật tư cũ, giờ bạn có thể cấp vật tư mới."
    );

    setConfirmEarlyModal(false);
    setPendingReplaceId(null);
  };

  if (!employee) {
    return (
      <Layout>
        <div className="p-6 text-center text-muted-foreground">
          Không tìm thấy nhân viên này.
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">
              Vật tư bảo hộ của {employee.firstName} {employee.lastName}
            </h1>
            <p className="text-muted-foreground">{employee.email}</p>
          </div>

          {/* Modal phát mới */}
          <Dialog open={openAdd} onOpenChange={setOpenAdd}>
            <DialogTrigger asChild>
              <Button>Phát vật tư mới</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Phát vật tư mới</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Chọn vật tư</label>
                  <Select value={selectedItem} onValueChange={setSelectedItem}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn vật tư..." />
                    </SelectTrigger>
                    <SelectContent>
                      {departmentStock.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} (Còn lại: {item.quantity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ngày cấp</label>
                  <Input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddNew}>Xác nhận</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Bảng vật tư */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên vật tư</TableHead>
                <TableHead>Số lượng còn trong phòng</TableHead>
                <TableHead>Ngày cấp</TableHead>
                <TableHead>Hạn sử dụng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {issuedItems.map((item) => {
                const stock = departmentStock.find(
                  (s) => s.id === item.safetyItemId
                )?.quantity;
                return (
                  <TableRow key={item.id}>
                    <TableCell>{getItemName(item.safetyItemId)}</TableCell>
                    <TableCell>{stock ?? 0}</TableCell>
                    <TableCell>{item.issueDate}</TableCell>
                    <TableCell>{item.expireDate}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-right">
                      {["In Use", "Expiring Soon", "Expired", "DamagedEarly"].includes(item.status) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReplace(item.id)}
                        >
                          Đổi vật tư
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}

              {issuedItems.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground py-6"
                  >
                    Nhân viên này chưa được cấp vật tư nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Modal xác nhận đổi sớm */}
      <Dialog open={confirmEarlyModal} onOpenChange={setConfirmEarlyModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận đổi vật tư sớm</DialogTitle>
          </DialogHeader>
          <p>
            Vật tư này <strong>chưa đến hạn đổi</strong>. Bạn có chắc muốn đánh dấu là
            <strong> đổi sớm</strong> và cấp vật tư mới cho nhân viên không?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmEarlyModal(false)}>
              Hủy
            </Button>
            <Button
              onClick={() =>
                pendingReplaceId && processReplace(pendingReplaceId, true)
              }
            >
              Đồng ý đổi sớm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
