import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Search, BookOpen, Filter } from 'lucide-react';
import { toast } from 'sonner';

import {
  Role,
  LeaveRequest,
  LeaveStatus,
  employees,
  initialLeaveRequests,
  LEAVE_TYPE_LABELS,
  LeaveType,
  STATUS_LABELS,
  APPROVAL_FLOW_MAP,
} from '../../data/leaveData';

import RoleSwitcher from '../../components/RoleSwitcher';
import LeaveBalanceCard from '../../components/LeaveBalanceCard';
import LeaveRequestCard from '../../components/LeaveRequestCard';
import CreateLeaveModal from '../../components/CreateLeaveModal';
import FlowGuideModal from '../../components/FlowGuideModal';
import LeaveDetailModal from '../../components/LeaveDetailModal';

export default function LeaveRequestMockPage() {
  const [role, setRole] = useState<Role>('EMPLOYEE');
  const [currentEmployee, setCurrentEmployee] = useState(employees[0]);
  const [requests, setRequests] = useState<LeaveRequest[]>(initialLeaveRequests);

  const [showCreate, setShowCreate] = useState(false);
  const [showFlowGuide, setShowFlowGuide] = useState(false);
  const [detailRequest, setDetailRequest] = useState<LeaveRequest | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Filter requests based on role
  const getVisibleRequests = () => {
    let filtered = [...requests];

    if (role === 'EMPLOYEE') {
      filtered = filtered.filter((r) => r.employeeId === currentEmployee.id);
    } else if (role === 'MANAGER') {
      filtered = filtered.filter((r) =>
        r.status === 'PENDING_MANAGER' ||
        r.approvalFlow === 'MANAGER_ONLY' ||
        r.approvalFlow === 'MANAGER_HR'
      );
    }
    // HR sees all

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((r) => {
        const empName = employees.find((e) => e.id === r.employeeId)?.name ?? '';
        return empName.toLowerCase().includes(term) || r.flowNote?.toLowerCase().includes(term);
      });
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }
    if (typeFilter !== 'ALL') {
      filtered = filtered.filter((r) => r.type === typeFilter);
    }

    return filtered;
  };

  const visibleRequests = getVisibleRequests();

  // Stats
  const stats = {
    total: visibleRequests.length,
    pendingManager: visibleRequests.filter((r) => r.status === 'PENDING_MANAGER').length,
    pendingHR: visibleRequests.filter((r) => r.status === 'PENDING_HR').length,
    approved: visibleRequests.filter((r) => r.status === 'APPROVED').length,
    rejected: visibleRequests.filter((r) => r.status === 'REJECTED_MANAGER' || r.status === 'REJECTED_HR').length,
  };

  const handleCreateRequest = (req: Omit<LeaveRequest, 'id'>) => {
    const newReq: LeaveRequest = { ...req, id: Date.now() };
    setRequests((prev) => [newReq, ...prev]);
    toast.success('Đã tạo đơn nghỉ phép');
  };

  const handleApprove = (id: number) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;

        const now = new Date().toLocaleString('vi-VN');
        const newTimeline = [...(r.timeline || [])];

        if (role === 'MANAGER' && r.status === 'PENDING_MANAGER') {
          newTimeline.push({ action: 'Quản lý duyệt', by: 'Quản lý', at: now });

          if (r.approvalFlow === 'MANAGER_HR') {
            newTimeline.push({ action: 'Chuyển HR', by: 'Hệ thống', at: now });
            toast.success('Đã duyệt → Chuyển HR');
            return { ...r, status: 'PENDING_HR' as LeaveStatus, managerApprovedAt: now, timeline: newTimeline };
          } else {
            toast.success('Đã duyệt đơn');
            return { ...r, status: 'APPROVED' as LeaveStatus, managerApprovedAt: now, timeline: newTimeline };
          }
        }

        if (role === 'HR' && r.status === 'PENDING_HR') {
          newTimeline.push({ action: 'HR duyệt', by: 'HR', at: now });
          toast.success('Đã duyệt đơn (HR)');
          return { ...r, status: 'APPROVED' as LeaveStatus, hrApprovedAt: now, timeline: newTimeline };
        }

        return r;
      })
    );
  };

  const handleReject = (id: number) => {
    const reason = prompt('Nhập lý do từ chối:');
    if (!reason) return;

    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;

        const now = new Date().toLocaleString('vi-VN');
        const newTimeline = [...(r.timeline || [])];

        if (role === 'MANAGER' && r.status === 'PENDING_MANAGER') {
          newTimeline.push({ action: 'Quản lý từ chối', by: 'Quản lý', at: now, note: reason });
          toast.info('Đã từ chối đơn');
          return { ...r, status: 'REJECTED_MANAGER' as LeaveStatus, rejectionReason: reason, timeline: newTimeline };
        }

        if (role === 'HR' && r.status === 'PENDING_HR') {
          newTimeline.push({ action: 'HR từ chối', by: 'HR', at: now, note: reason });
          toast.info('Đã từ chối đơn (HR)');
          return { ...r, status: 'REJECTED_HR' as LeaveStatus, rejectionReason: reason, timeline: newTimeline };
        }

        return r;
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Quản lý nghỉ phép — TKV</h1>
          <p className="text-sm text-muted-foreground">Prototype mô phỏng quy trình nghỉ phép ngành than</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowFlowGuide(true)}>
            <BookOpen className="h-4 w-4 mr-2" />
            Hướng dẫn quy trình
          </Button>
          {role === 'EMPLOYEE' && (
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Tạo đơn
            </Button>
          )}
        </div>
      </div>

      {/* Role Switcher */}
      <RoleSwitcher
        role={role}
        onRoleChange={setRole}
        currentEmployee={currentEmployee}
        onEmployeeChange={setCurrentEmployee}
      />

      {/* Employee Balance Card */}
      {role === 'EMPLOYEE' && (
        <LeaveBalanceCard employee={currentEmployee} requests={requests} />
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Tổng đơn</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-xl font-bold text-orange-600">{stats.pendingManager}</div>
            <div className="text-xs text-muted-foreground">Chờ Quản lý</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-xl font-bold text-blue-600">{stats.pendingHR}</div>
            <div className="text-xs text-muted-foreground">Chờ HR</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-xl font-bold text-emerald-600">{stats.approved}</div>
            <div className="text-xs text-muted-foreground">Đã duyệt</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-xs text-muted-foreground">Từ chối</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên, ghi chú..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                {(Object.keys(STATUS_LABELS) as LeaveStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Loại phép" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả loại</SelectItem>
                {(Object.keys(LEAVE_TYPE_LABELS) as LeaveType[]).map((t) => (
                  <SelectItem key={t} value={t}>{LEAVE_TYPE_LABELS[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Request List */}
      <div className="space-y-3">
        {visibleRequests.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Không tìm thấy đơn nghỉ phép nào
            </CardContent>
          </Card>
        ) : (
          visibleRequests.map((req) => (
            <LeaveRequestCard
              key={req.id}
              request={req}
              role={role}
              onApprove={handleApprove}
              onReject={handleReject}
              onViewDetail={setDetailRequest}
            />
          ))
        )}
      </div>

      {/* Modals */}
      <CreateLeaveModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        employee={currentEmployee}
        allRequests={requests}
        onSubmit={handleCreateRequest}
      />
      <FlowGuideModal open={showFlowGuide} onClose={() => setShowFlowGuide(false)} />
      <LeaveDetailModal
        request={detailRequest}
        allRequests={requests}
        open={!!detailRequest}
        onClose={() => setDetailRequest(null)}
      />
    </div>
  );
}
