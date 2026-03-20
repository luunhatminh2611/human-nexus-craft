import { useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import {
  employees, initialPPEItems, allRoles, statusColors, statusLabels,
  type PPEItem, type IssueRecord, type ReplacementRequest, type PPEStatus, type PPEType,
} from '../data/mockData';
import { ManagerTab } from '../components/ManagerTab';
import { AdminTab } from '../components/AdminTab';
import { WarehouseTab } from '../components/WarehouseTab';
import { EmployeeTab } from '../components/EmployeeTab';

export default function PPEDistributionPage() {
  const [ppeItems, setPpeItems] = useState<PPEItem[]>(initialPPEItems);
  const [issueRecords, setIssueRecords] = useState<IssueRecord[]>([]);
  const [replacementRequests, setReplacementRequests] = useState<ReplacementRequest[]>([]);
  const [nextPpeId, setNextPpeId] = useState(7);
  const [nextIssueId, setNextIssueId] = useState(1);
  const [nextReplacementId, setNextReplacementId] = useState(1);

  // ===== PPE MASTER ACTIONS =====
  const addPPEItem = useCallback((item: Omit<PPEItem, 'id' | 'status'>, asDraft: boolean) => {
    const newItem: PPEItem = { ...item, id: nextPpeId, status: asDraft ? 'Draft' : 'Pending_Admin' };
    setPpeItems(prev => [...prev, newItem]);
    setNextPpeId(prev => prev + 1);
    toast({ title: asDraft ? 'Đã lưu nháp' : 'Đã gửi duyệt', description: `Vật tư: ${item.name}` });
  }, [nextPpeId]);

  const updatePPEStatus = useCallback((id: number, status: PPEStatus) => {
    setPpeItems(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    toast({ title: 'Cập nhật trạng thái', description: `${statusLabels[status]}` });
  }, []);

  // ===== ISSUE RECORD ACTIONS =====
  const generateMonthlyIssue = useCallback((month: string) => {
    const approvedPPE = ppeItems.filter(p => p.status === 'Approved');
    const newRecords: IssueRecord[] = [];
    let id = nextIssueId;

    employees.forEach(emp => {
      approvedPPE.forEach(ppe => {
        if (ppe.applicableRoles.includes(emp.role)) {
          const exists = issueRecords.some(r => r.employeeId === emp.id && r.ppeItemId === ppe.id && r.month === month);
          if (!exists) {
            newRecords.push({
              id: id++,
              ppeItemId: ppe.id,
              ppeName: ppe.name,
              employeeId: emp.id,
              employeeName: emp.name,
              quantity: ppe.quantity,
              actualQuantity: 0,
              month,
              status: 'Draft',
              createdAt: new Date().toISOString(),
            });
          }
        }
      });
    });

    if (newRecords.length === 0) {
      toast({ title: 'Không có bản ghi mới', description: 'Tất cả đã được tạo cho tháng này', variant: 'destructive' });
      return;
    }

    setIssueRecords(prev => [...prev, ...newRecords]);
    setNextIssueId(id);
    toast({ title: 'Tạo cấp phát thành công', description: `${newRecords.length} bản ghi mới` });
  }, [ppeItems, issueRecords, nextIssueId]);

  const updateIssueStatus = useCallback((ids: number[], status: PPEStatus) => {
    setIssueRecords(prev => prev.map(r => ids.includes(r.id) ? { ...r, status } : r));
    toast({ title: 'Cập nhật', description: `${ids.length} bản ghi → ${statusLabels[status]}` });
  }, []);

  const issueItem = useCallback((id: number, actualQty: number) => {
    setIssueRecords(prev => prev.map(r =>
      r.id === id ? { ...r, actualQuantity: actualQty, status: 'Issued', issuedAt: new Date().toISOString() } : r
    ));
    toast({ title: 'Đã cấp phát' });
  }, []);

  const confirmReceive = useCallback((id: number, hasIssue: boolean) => {
    setIssueRecords(prev => prev.map(r =>
      r.id === id ? { ...r, status: hasIssue ? 'Issue_Reported' : 'Completed', confirmedAt: new Date().toISOString() } : r
    ));
    toast({ title: hasIssue ? 'Đã báo sự cố' : 'Xác nhận nhận đủ' });
  }, []);

  // ===== REPLACEMENT REQUEST ACTIONS =====
  const addReplacementRequest = useCallback((req: Omit<ReplacementRequest, 'id' | 'status' | 'createdAt'>) => {
    const newReq: ReplacementRequest = { ...req, id: nextReplacementId, status: 'Pending_Manager', createdAt: new Date().toISOString() };
    setReplacementRequests(prev => [...prev, newReq]);
    setNextReplacementId(prev => prev + 1);
    toast({ title: 'Yêu cầu cấp đổi đã gửi' });
  }, [nextReplacementId]);

  const updateReplacementStatus = useCallback((id: number, status: PPEStatus) => {
    setReplacementRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    toast({ title: 'Cập nhật yêu cầu cấp đổi', description: statusLabels[status] });
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-2xl font-bold text-foreground">Quản lý cấp phát bảo hộ lao động</h1>

      <Tabs defaultValue="manager" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="manager">Manager</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
          <TabsTrigger value="warehouse">Kho (Đời sống)</TabsTrigger>
          <TabsTrigger value="employee">Nhân viên</TabsTrigger>
        </TabsList>

        <TabsContent value="manager">
          <ManagerTab
            ppeItems={ppeItems}
            issueRecords={issueRecords}
            replacementRequests={replacementRequests}
            employees={employees}
            allRoles={allRoles}
            onAddPPE={addPPEItem}
            onUpdatePPEStatus={updatePPEStatus}
            onGenerateMonthly={generateMonthlyIssue}
            onUpdateIssueStatus={updateIssueStatus}
            onUpdateReplacementStatus={updateReplacementStatus}
          />
        </TabsContent>

        <TabsContent value="admin">
          <AdminTab
            ppeItems={ppeItems}
            issueRecords={issueRecords}
            replacementRequests={replacementRequests}
            onUpdatePPEStatus={updatePPEStatus}
            onUpdateIssueStatus={updateIssueStatus}
            onUpdateReplacementStatus={updateReplacementStatus}
          />
        </TabsContent>

        <TabsContent value="warehouse">
          <WarehouseTab
            issueRecords={issueRecords}
            onIssueItem={issueItem}
          />
        </TabsContent>

        <TabsContent value="employee">
          <EmployeeTab
            issueRecords={issueRecords}
            replacementRequests={replacementRequests}
            ppeItems={ppeItems}
            employees={employees}
            onConfirmReceive={confirmReceive}
            onAddReplacement={addReplacementRequest}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
