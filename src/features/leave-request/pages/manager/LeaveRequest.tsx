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
import { Button } from "@/shared/components/ui/button/Button2";
import { Badge } from "@/shared/components/ui/badge";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { FileText, Check, X, Eye, Send } from "lucide-react";
import { toast } from "sonner";
import {
  MOCK_LEAVE_REQUESTS, MOCK_EMPLOYEES, DEPARTMENTS,
  getEmployeeName, getCategoryName, getOrgManagers,
  type LeaveRequest, type LeaveStatus,
} from "../../data/mockData";

// Giả lập manager hiện tại
const CURRENT_MANAGER_ID = 'mgr1';

const STATUS_CONFIG: Record<LeaveStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  DRAFT: { label: 'Nháp', variant: 'secondary' },
  PENDING_MANAGER: { label: 'Chờ duyệt', variant: 'outline' },
  MANAGER_APPROVED: { label: 'Đã duyệt (chờ TC)', variant: 'default' },
  PENDING_ORG: { label: 'Chờ TC duyệt', variant: 'outline' },
  APPROVED: { label: 'Đã duyệt', variant: 'default' },
  REJECTED_MANAGER: { label: 'Đã từ chối', variant: 'destructive' },
  REJECTED_ORG: { label: 'TC từ chối', variant: 'destructive' },
};

export default function ManagerLeaveRequest() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(
    MOCK_LEAVE_REQUESTS.filter(r => r.managerId === CURRENT_MANAGER_ID)
  );
  const [detailLeave, setDetailLeave] = useState<LeaveRequest | null>(null);
  const [actionLeave, setActionLeave] = useState<LeaveRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [comment, setComment] = useState('');

  const currentMgr = MOCK_EMPLOYEES.find(e => e.id === CURRENT_MANAGER_ID)!;
  const orgManagers = getOrgManagers();
  const pendingCount = leaveRequests.filter(r => r.status === 'PENDING_MANAGER').length;

  const handleAction = () => {
    if (!actionLeave) return;

    if (actionType === 'approve') {
      const orgMgr = orgManagers[0];
      setLeaveRequests(prev => prev.map(r =>
        r.id === actionLeave.id
          ? {
              ...r,
              status: 'MANAGER_APPROVED' as LeaveStatus,
              managerComment: comment || undefined,
              orgManagerId: orgMgr?.id,
            }
          : r
      ));
      toast.success(`Đã duyệt đơn và chuyển sang Phòng Tổ chức (${orgMgr?.name})`);
    } else {
      if (!comment.trim()) {
        toast.error("Vui lòng nhập lý do từ chối"); return;
      }
      setLeaveRequests(prev => prev.map(r =>
        r.id === actionLeave.id
          ? { ...r, status: 'REJECTED_MANAGER' as LeaveStatus, managerComment: comment }
          : r
      ));
      toast.success("Đã từ chối đơn nghỉ phép");
    }

    setActionLeave(null);
    setComment('');
  };

  const openAction = (leave: LeaveRequest, type: 'approve' | 'reject') => {
    setActionLeave(leave);
    setActionType(type);
    setComment('');
  };

  return (
    <div className="mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Duyệt đơn nghỉ phép</h1>
        <p className="text-muted-foreground mt-1">
          {currentMgr.name} — {DEPARTMENTS.find(d => d.id === currentMgr.departmentId)?.name}
          {pendingCount > 0 && <Badge variant="destructive" className="ml-2">{pendingCount} chờ duyệt</Badge>}
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Chờ duyệt', count: leaveRequests.filter(r => r.status === 'PENDING_MANAGER').length, color: 'text-amber-600' },
          { label: 'Đã duyệt', count: leaveRequests.filter(r => ['MANAGER_APPROVED', 'PENDING_ORG', 'APPROVED'].includes(r.status)).length, color: 'text-emerald-600' },
          { label: 'Từ chối', count: leaveRequests.filter(r => r.status === 'REJECTED_MANAGER').length, color: 'text-destructive' },
          { label: 'Tổng', count: leaveRequests.length, color: 'text-primary' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-4 pb-3 text-center">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-amber-600" /> Danh sách đơn nghỉ phép
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nhân viên</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Tiêu đề</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Số ngày</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaveRequests.map(leave => (
                <TableRow key={leave.id}>
                  <TableCell className="font-medium">{getEmployeeName(leave.employeeId)}</TableCell>
                  <TableCell>
                    <Badge variant={leave.leaveType === 'REGULAR' ? 'secondary' : 'outline'}>
                      {leave.leaveType === 'REGULAR' ? 'Thường' : 'Chế độ'}
                    </Badge>
                  </TableCell>
                  <TableCell>{leave.title}</TableCell>
                  <TableCell className="text-sm">
                    {new Date(leave.startDate).toLocaleDateString('vi-VN')} → {new Date(leave.endDate).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell>{leave.totalDays}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_CONFIG[leave.status]?.variant}>{STATUS_CONFIG[leave.status]?.label}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setDetailLeave(leave)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {leave.status === 'PENDING_MANAGER' && (
                        <>
                          <Button size="sm" variant="ghost" className="text-emerald-600" onClick={() => openAction(leave, 'approve')}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => openAction(leave, 'reject')}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Approve/Reject Dialog */}
      <Dialog open={!!actionLeave} onOpenChange={() => { setActionLeave(null); setComment(''); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionType === 'approve' ? 'Duyệt đơn nghỉ phép' : 'Từ chối đơn nghỉ phép'}</DialogTitle>
            <DialogDescription>
              {actionLeave && `${getEmployeeName(actionLeave.employeeId)} — ${actionLeave.title} (${actionLeave.totalDays} ngày)`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>{actionType === 'approve' ? 'Nhận xét (tùy chọn)' : 'Lý do từ chối *'}</Label>
              <Textarea value={comment} onChange={e => setComment(e.target.value)} placeholder={actionType === 'approve' ? 'Nhận xét...' : 'Nhập lý do từ chối...'} rows={3} />
            </div>
            {actionType === 'approve' && orgManagers.length > 0 && (
              <p className="text-sm text-muted-foreground">
                <Send className="h-3 w-3 inline mr-1" />
                Sau khi duyệt, đơn sẽ được chuyển đến <span className="font-medium">{orgManagers[0].name}</span> (Phòng Tổ chức) duyệt lần cuối.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setActionLeave(null); setComment(''); }}>Hủy</Button>
            <Button variant={actionType === 'approve' ? 'default' : 'destructive'} onClick={handleAction}>
              {actionType === 'approve' ? 'Duyệt & Chuyển TC' : 'Từ chối'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!detailLeave} onOpenChange={() => setDetailLeave(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>Chi tiết đơn nghỉ phép</DialogTitle></DialogHeader>
          {detailLeave && (
            <div className="space-y-3 text-sm">
              <div><span className="text-muted-foreground">Nhân viên:</span> <span className="font-medium">{getEmployeeName(detailLeave.employeeId)}</span></div>
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">Loại:</span> <Badge variant={detailLeave.leaveType === 'REGULAR' ? 'secondary' : 'outline'}>{detailLeave.leaveType === 'REGULAR' ? 'Thường' : 'Chế độ'}</Badge></div>
                {detailLeave.categoryId && <div><span className="text-muted-foreground">Danh mục:</span> {getCategoryName(detailLeave.categoryId)}</div>}
              </div>
              <div><span className="text-muted-foreground">Tiêu đề:</span> {detailLeave.title}</div>
              <div><span className="text-muted-foreground">Thời gian:</span> {new Date(detailLeave.startDate).toLocaleDateString('vi-VN')} → {new Date(detailLeave.endDate).toLocaleDateString('vi-VN')} ({detailLeave.totalDays} ngày)</div>
              <div><span className="text-muted-foreground">Lý do:</span> {detailLeave.reason}</div>
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
