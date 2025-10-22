import { useState, useMemo } from "react";
import { Layout } from "@/components/Layout";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/store/authStore";
import mockData, { IssuedSafetyItem } from "@/mock/data";

export default function EmployeeSafetyList() {
  const { employeeId } = useAuthStore();
  const employee = mockData.employees.find((e) => e.id === employeeId);

  const [issuedItems, setIssuedItems] = useState<IssuedSafetyItem[]>(
    mockData.issuedSafetyItems.filter((i) => i.employeeId === employeeId)
  );

  const [openModal, setOpenModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<IssuedSafetyItem | null>(null);
  const [reason, setReason] = useState("");

  const getItemName = (id: string) =>
    mockData.safetyItems.find((i) => i.id === id)?.name || id;

  const getStatusBadge = (status: IssuedSafetyItem["status"]) => {
    const colorMap: Record<IssuedSafetyItem["status"], string> = {
      "In Use": "bg-green-500 text-white",
      "Expiring Soon": "bg-yellow-400 text-black",
      "Expired": "bg-red-500 text-white",
      "Replaced": "bg-gray-300 text-black",
      "DamagedEarly": "bg-orange-500 text-white",
    };

    const label = {
      "In Use": "Đang sử dụng",
      "Expiring Soon": "Sắp hết hạn",
      "Expired": "Đã hết hạn",
      "Replaced": "Đã thay thế",
      "DamagedEarly": "Yêu cầu đổi (đang chờ duyệt)",
    }[status];

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colorMap[status]}`}>
        {label}
      </span>
    );
  };

  const handleRequestChange = (item: IssuedSafetyItem) => {
    setSelectedItem(item);
    setReason("");
    setOpenModal(true);
  };

  const confirmRequestChange = () => {
    if (!reason.trim()) {
      alert("Vui lòng nhập lý do yêu cầu đổi.");
      return;
    }

    if (selectedItem) {
      setIssuedItems((prev) =>
        prev.map((i) =>
          i.id === selectedItem.id
            ? {
                ...i,
                status: "DamagedEarly",
                note: `Yêu cầu đổi: ${reason}`,
                requestDate: new Date().toISOString().split("T")[0],
              }
            : i
        )
      );
    }

    setOpenModal(false);
    setSelectedItem(null);
    alert("Yêu cầu đổi vật tư đã được gửi đến quản lý.");
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Đồ bảo hộ cá nhân</h1>
          <p className="text-muted-foreground">
            Danh sách vật tư bảo hộ mà bạn đã được cấp.
          </p>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên vật tư</TableHead>
                <TableHead>Ngày cấp</TableHead>
                <TableHead>Hạn sử dụng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {issuedItems.length > 0 ? (
                issuedItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{getItemName(item.safetyItemId)}</TableCell>
                    <TableCell>{item.issueDate}</TableCell>
                    <TableCell>{item.expireDate}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-right">
                      {["In Use", "Expiring Soon"].includes(item.status) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRequestChange(item)}
                        >
                          Yêu cầu đổi
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground py-6"
                  >
                    Bạn chưa được cấp vật tư nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>

        {employee && (
          <div className="text-sm text-muted-foreground">
            Hiển thị {issuedItems.length} vật tư của {employee.firstName}{" "}
            {employee.lastName}
          </div>
        )}
      </div>

      {/* Modal nhập lý do yêu cầu đổi */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yêu cầu đổi vật tư</DialogTitle>
          </DialogHeader>
          <p>
            Bạn đang yêu cầu đổi vật tư:{" "}
            <strong>
              {selectedItem ? getItemName(selectedItem.safetyItemId) : ""}
            </strong>
          </p>
          <div className="mt-3">
            <label className="block text-sm font-medium mb-1">
              Lý do yêu cầu đổi
            </label>
            <Textarea
              placeholder="Ví dụ: Làm rách trong quá trình làm việc, bị mất, hoặc không sử dụng được..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenModal(false)}>
              Hủy
            </Button>
            <Button onClick={confirmRequestChange}>Gửi yêu cầu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
