import React, { useState } from "react";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/shared/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/shared/components/tables/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button/Button2";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { FileText, Plus, Trash2, Edit, Calendar, TrendingDown, TrendingUp, Info } from "lucide-react";
import { toast } from "sonner";
import {
  MOCK_EMPLOYEES, MOCK_LEAVE_REQUESTS, LEAVE_CATEGORIES, POSITIONS, DEPARTMENTS,
  calculateLeaveBalance, getDepartmentManagers, getEmployeeName, getCategoryName,
  type LeaveRequest, type LeaveStatus,
} from "../../data/mockData";

// Giả lập nhân viên hiện tại
const CURRENT_EMPLOYEE_ID = 'emp1';

const STATUS_CONFIG: Record<LeaveStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  DRAFT: { label: 'Nháp', variant: 'secondary' },
  PENDING_MANAGER: { label: 'Chờ TP duyệt', variant: 'outline' },
  MANAGER_APPROVED: { label: 'TP đã duyệt', variant: 'outline' },
  PENDING_ORG: { label: 'Chờ TC duyệt', variant: 'outline' },
  APPROVED: { label: 'Đã duyệt', variant: 'default' },
  REJECTED_MANAGER: { label: 'TP từ chối', variant: 'destructive' },
  REJECTED_ORG: { label: 'TC từ chối', variant: 'destructive' },
};

export default function EmployeeLeaveRequest() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(
    MOCK_LEAVE_REQUESTS.filter(r => r.employeeId === CURRENT_EMPLOYEE_ID)
  );
  const [allRequests, setAllRequests] = useState<LeaveRequest[]>(MOCK_LEAVE_REQUESTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLeave, setEditingLeave] = useState<LeaveRequest | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [leaveToDelete, setLeaveToDelete] = useState<LeaveRequest | null>(null);
  const [detailLeave, setDetailLeave] = useState<LeaveRequest | null>(null);

  const currentEmp = MOCK_EMPLOYEES.find(e => e.id === CURRENT_EMPLOYEE_ID)!;
  const balance = calculateLeaveBalance(CURRENT_EMPLOYEE_ID, allRequests);
  const deptManagers = getDepartmentManagers(currentEmp.departmentId);

  // Form state
  const [formData, setFormData] = useState({
    leaveType: 'REGULAR' as 'REGULAR' | 'POLICY',
    categoryId: '',
    title: '',
    startDate: '',
    endDate: '',
    reason: '',
    managerId: deptManagers[0]?.id || '',
  });

  const resetForm = () => {
    setFormData({
      leaveType: 'REGULAR', categoryId: '', title: '', startDate: '', endDate: '', reason: '',
      managerId: deptManagers[0]?.id || '',
    });
    setEditingLeave(null);
  };

  const calcDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const d1 = new Date(start), d2 = new Date(end);
    return Math.max(1, Math.ceil((d2.getTime() - d1.getTime()) / (86400000)) + 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.startDate || !formData.endDate || !formData.reason || !formData.managerId) {
      toast.error("Vui lòng điền đầy đủ thông tin"); return;
    }
    if (formData.leaveType === 'POLICY' && !formData.categoryId) {
      toast.error("Vui lòng chọn loại nghỉ chế độ"); return;
    }
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      toast.error("Ngày bắt đầu phải trước ngày kết thúc"); return;
    }

    const totalDays = calcDays(formData.startDate, formData.endDate);
    const newReq: LeaveRequest = {
      id: editingLeave?.id || `lr_${Date.now()}`,
      employeeId: CURRENT_EMPLOYEE_ID,
      leaveType: formData.leaveType,
      categoryId: formData.leaveType === 'POLICY' ? formData.categoryId : undefined,
      title: formData.title,
      startDate: formData.startDate,
      endDate: formData.endDate,
      totalDays,
      reason: formData.reason,
      status: 'PENDING_MANAGER',
      managerId: formData.managerId,
      createdAt: new Date().toISOString().split('T')[0],
    };

    if (editingLeave) {
      setAllRequests(prev => prev.map(r => r.id === editingLeave.id ? newReq : r));
      setLeaveRequests(prev => prev.map(r => r.id === editingLeave.id ? newReq : r));
      toast.success("Cập nhật đơn thành công");
    } else {
      setAllRequests(prev => [newReq, ...prev]);
      setLeaveRequests(prev => [newReq, ...prev]);
      toast.success("Tạo đơn nghỉ phép thành công");
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleEdit = (leave: LeaveRequest) => {
    setEditingLeave(leave);
    setFormData({
      leaveType: leave.leaveType,
      categoryId: leave.categoryId || '',
      title: leave.title,
      startDate: leave.startDate,
      endDate: leave.endDate,
      reason: leave.reason,
      managerId: leave.managerId,
    });
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    if (!leaveToDelete) return;
    setAllRequests(prev => prev.filter(r => r.id !== leaveToDelete.id));
    setLeaveRequests(prev => prev.filter(r => r.id !== leaveToDelete.id));
    setDeleteConfirmOpen(false);
    setLeaveToDelete(null);
    toast.success("Đã xóa đơn nghỉ phép");
  };

  return (
    <div className="mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Đơn xin nghỉ phép</h1>
          <p className="text-muted-foreground mt-1">
            {currentEmp.name} — {POSITIONS.find(p => p.id === currentEmp.positionId)?.name} — {DEPARTMENTS.find(d => d.id === currentEmp.departmentId)?.name}
          </p>
        </div>
        <Button onClick={() => { resetForm(); setIsModalOpen(true); }} className="bg-primary text-primary-foreground">
          <Plus className="mr-2 h-4 w-4" /> Tạo đơn mới
        </Button>
      </div>

      {/* ===== BALANCE CARDS ===== */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-xs text-muted-foreground">Phép cơ bản</p>
            <p className="text-2xl font-bold text-primary">{balance.baseDays}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-xs text-muted-foreground">Thâm niên (+)</p>
            <p className="text-2xl font-bold text-emerald-600">{balance.seniorityBonus}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-xs text-muted-foreground">Tổng được hưởng</p>
            <p className="text-2xl font-bold">{balance.totalEntitled}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-xs text-muted-foreground">Đã nghỉ (thường + vượt CĐ)</p>
            <p className="text-2xl font-bold text-orange-600">{balance.regularUsed + balance.policyExcess}</p>
          </CardContent>
        </Card>
        <Card className={balance.remaining < 0 ? 'border-destructive' : 'border-emerald-500'}>
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-xs text-muted-foreground">Phép tồn</p>
            <p className={`text-2xl font-bold ${balance.remaining < 0 ? 'text-destructive' : 'text-emerald-600'}`}>
              {balance.remaining}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Policy usage */}
      {balance.policyUsage.length > 0 && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Info className="h-4 w-4" /> Chi tiết nghỉ chế độ đã dùng
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {balance.policyUsage.map(pu => (
                <div key={pu.categoryId} className="text-sm border rounded p-2">
                  <p className="font-medium truncate">{pu.categoryName}</p>
                  <p className="text-muted-foreground">
                    Đã dùng: {pu.used}/{pu.max} ngày
                    {pu.excess > 0 && <span className="text-destructive ml-1">(vượt {pu.excess})</span>}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ===== TABLE ===== */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-amber-600" /> Danh sách đơn nghỉ phép
          </CardTitle>
        </CardHeader>
        <CardContent>
          {leaveRequests.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loại</TableHead>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Số ngày</TableHead>
                  <TableHead>Người duyệt</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-center">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaveRequests.map(leave => (
                  <TableRow key={leave.id} className="cursor-pointer" onClick={() => setDetailLeave(leave)}>
                    <TableCell>
                      <Badge variant={leave.leaveType === 'REGULAR' ? 'secondary' : 'outline'}>
                        {leave.leaveType === 'REGULAR' ? 'Thường' : 'Chế độ'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{leave.title}</TableCell>
                    <TableCell className="text-sm">
                      {new Date(leave.startDate).toLocaleDateString('vi-VN')} → {new Date(leave.endDate).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell>{leave.totalDays} ngày</TableCell>
                    <TableCell>{getEmployeeName(leave.managerId)}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_CONFIG[leave.status]?.variant || 'secondary'}>
                        {STATUS_CONFIG[leave.status]?.label || leave.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center" onClick={e => e.stopPropagation()}>
                      {['PENDING_MANAGER', 'REJECTED_MANAGER', 'REJECTED_ORG', 'DRAFT'].includes(leave.status) && (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(leave)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => { setLeaveToDelete(leave); setDeleteConfirmOpen(true); }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">Chưa có đơn nghỉ phép nào.</p>
          )}
        </CardContent>
      </Card>

      {/* ===== CREATE/EDIT MODAL ===== */}
      <Dialog open={isModalOpen} onOpenChange={(open) => { if (!open) { resetForm(); } setIsModalOpen(open); }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingLeave ? 'Chỉnh sửa đơn nghỉ phép' : 'Tạo đơn nghỉ phép mới'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Loại nghỉ *</Label>
                <Select value={formData.leaveType} onValueChange={(v: 'REGULAR' | 'POLICY') => setFormData(prev => ({ ...prev, leaveType: v, categoryId: '' }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REGULAR">Nghỉ phép thường</SelectItem>
                    <SelectItem value="POLICY">Nghỉ chế độ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.leaveType === 'POLICY' && (
                <div className="grid gap-2">
                  <Label>Loại nghỉ chế độ *</Label>
                  <Select value={formData.categoryId} onValueChange={(v) => setFormData(prev => ({ ...prev, categoryId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Chọn loại nghỉ chế độ" /></SelectTrigger>
                    <SelectContent>
                      {LEAVE_CATEGORIES.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name} (tối đa {cat.maxDays} ngày)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid gap-2">
                <Label>Tiêu đề *</Label>
                <Input value={formData.title} onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))} placeholder="Ví dụ: Xin nghỉ phép việc riêng" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Ngày bắt đầu *</Label>
                  <Input type="date" value={formData.startDate} onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label>Ngày kết thúc *</Label>
                  <Input type="date" value={formData.endDate} onChange={e => setFormData(prev => ({ ...prev, endDate: e.target.value }))} />
                </div>
              </div>

              {formData.startDate && formData.endDate && (
                <p className="text-sm text-muted-foreground">
                  Tổng: <span className="font-semibold text-foreground">{calcDays(formData.startDate, formData.endDate)} ngày</span>
                </p>
              )}

              <div className="grid gap-2">
                <Label>Lý do *</Label>
                <Textarea value={formData.reason} onChange={e => setFormData(prev => ({ ...prev, reason: e.target.value }))} placeholder="Nhập lý do..." rows={3} />
              </div>

              <div className="grid gap-2">
                <Label>Người duyệt (Trưởng phòng) *</Label>
                <Select value={formData.managerId} onValueChange={v => setFormData(prev => ({ ...prev, managerId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Chọn người duyệt" /></SelectTrigger>
                  <SelectContent>
                    {deptManagers.map(m => (
                      <SelectItem key={m.id} value={m.id}>{m.name} — {DEPARTMENTS.find(d => d.id === m.departmentId)?.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setIsModalOpen(false); resetForm(); }}>Hủy</Button>
              <Button type="submit">{editingLeave ? 'Cập nhật' : 'Gửi đơn'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ===== DELETE CONFIRM ===== */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>Bạn có chắc muốn xóa đơn "{leaveToDelete?.title}"?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>Hủy</Button>
            <Button variant="destructive" onClick={handleDelete}>Xóa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== DETAIL MODAL ===== */}
      <Dialog open={!!detailLeave} onOpenChange={() => setDetailLeave(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn nghỉ phép</DialogTitle>
          </DialogHeader>
          {detailLeave && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">Loại:</span> <Badge variant={detailLeave.leaveType === 'REGULAR' ? 'secondary' : 'outline'}>{detailLeave.leaveType === 'REGULAR' ? 'Thường' : 'Chế độ'}</Badge></div>
                {detailLeave.categoryId && <div><span className="text-muted-foreground">Danh mục:</span> {getCategoryName(detailLeave.categoryId)}</div>}
              </div>
              <div><span className="text-muted-foreground">Tiêu đề:</span> <span className="font-medium">{detailLeave.title}</span></div>
              <div><span className="text-muted-foreground">Thời gian:</span> {new Date(detailLeave.startDate).toLocaleDateString('vi-VN')} → {new Date(detailLeave.endDate).toLocaleDateString('vi-VN')} ({detailLeave.totalDays} ngày)</div>
              <div><span className="text-muted-foreground">Lý do:</span> {detailLeave.reason}</div>
              <div><span className="text-muted-foreground">Trưởng phòng duyệt:</span> {getEmployeeName(detailLeave.managerId)}</div>
              {detailLeave.orgManagerId && <div><span className="text-muted-foreground">Phòng TC duyệt:</span> {getEmployeeName(detailLeave.orgManagerId)}</div>}
              <div><span className="text-muted-foreground">Trạng thái:</span> <Badge variant={STATUS_CONFIG[detailLeave.status]?.variant}>{STATUS_CONFIG[detailLeave.status]?.label}</Badge></div>
              {detailLeave.managerComment && <div className="p-2 bg-muted rounded"><span className="text-muted-foreground">Nhận xét TP:</span> {detailLeave.managerComment}</div>}
              {detailLeave.orgComment && <div className="p-2 bg-muted rounded"><span className="text-muted-foreground">Nhận xét TC:</span> {detailLeave.orgComment}</div>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
