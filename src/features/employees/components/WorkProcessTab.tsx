import { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button/Button2";
import { Badge } from "@/shared/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Briefcase, Plus, Edit, Trash2 } from "lucide-react";
import { useAuthStore } from "../hooks/useAuth";
import { workProcessApi } from "@/features/workProcess/api/workProcess";
import WorkProcessModal from "@/features/workProcess/components/WorkProcessModal";
import WorkProcessFormModal from "@/features/workProcess/components/WorkProcessFormModal";
import { toast } from "sonner";

export default function WorkProcessTab({ employeeId }) {
  const [workHistories, setWorkHistories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [mode, setMode] = useState<"create" | "edit">("create");

  const { user } = useAuthStore();
  const isManager = user?.roles === "MANAGER";
  const isEmployee = user?.roles === "EMPLOYEE";
  const canManage = isManager || isEmployee;

  console.log("Work Histories:", workHistories);

  const fetchWorkHistories = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await workProcessApi.getById(employeeId);
      setWorkHistories(res.workProcessDTOList || []);
    } catch (e) {
      console.error("Lỗi lấy quá trình công tác", e);
      setWorkHistories([]);
    } finally {
      setIsLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    if (employeeId) {
      fetchWorkHistories();
    }
  }, [employeeId, fetchWorkHistories]);

  const handleAdd = () => {
    setMode("create");
    setSelectedHistory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setMode("edit");
    setSelectedHistory(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Xóa quá trình công tác này?")) return;
    await workProcessApi.deleteById(id);
    toast.success("Xóa quá trình công tác thành công");
    fetchWorkHistories();
  };

  const formatDate = (date) => {
    if (!date) return "---";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>Quá trình công tác</CardTitle>
        <Button size="sm" onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm mới
        </Button>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="text-center py-6 text-muted-foreground">
            Đang tải...
          </div>
        ) : workHistories.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Briefcase className="h-10 w-10 mx-auto mb-2 opacity-50" />
            Chưa có thông tin quá trình công tác
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-medium text-gray-600 whitespace-nowrap">
                    STT
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 whitespace-nowrap">
                    Ngày bắt đầu
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 whitespace-nowrap">
                    Ngày kết thúc
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 whitespace-nowrap">
                    Chức vụ
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 whitespace-nowrap">
                    Phòng ban quản lý
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 whitespace-nowrap">
                    Tập đoàn/Công ty
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Tóm tắt quá trình công tác
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600 whitespace-nowrap">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {workHistories.map((item) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="px-4 py-3 whitespace-nowrap text-gray-700">
                      {workHistories.indexOf(item) + 1}
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap text-gray-700">
                      {formatDate(item.startDate)}
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap text-gray-700">
                      {formatDate(item.endDate)}
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap text-gray-700">
                      {item.position?.name || (
                        <span className="text-gray-400">---</span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap text-gray-700">
                      {item.department?.name || (
                        <span className="text-gray-400">---</span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap text-gray-700">
                      {item.company?.name || (
                        <span className="text-gray-400">---</span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3 max-w-[220px]">
                      <p className="break-words line-clamp-2 text-gray-700">
                        {item.detail || (
                          <span className="text-gray-400">---</span>
                        )}
                      </p>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-gray-100 rounded-md"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="h-4 w-4 text-gray-500" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-red-50 rounded-md"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      <WorkProcessFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        employeeId={employeeId}
        historyData={selectedHistory}
        mode={mode}
        onSuccess={fetchWorkHistories}
      />
    </Card>
  );
}
