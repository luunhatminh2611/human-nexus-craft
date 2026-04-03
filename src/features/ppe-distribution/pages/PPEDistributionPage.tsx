import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { HardHat, BookOpen, Plus, Check, X, AlertTriangle, Package, User, ShieldCheck, Clock, History } from 'lucide-react';
import {
  type PPERole, type PPEBatch, type PPEBatchItem, type PPEHistory, type PPERequest,
  type PPEReceiveLog, type ReplacementReason,
  ppeEmployees, ppeItemDefs, ppeNorms, departments,
  initialHistories, initialBatches, initialBatchItems, initialRequests, initialReceiveLogs,
  canIssue, canRequestReplacement, getBatchItemStatus, addMonths, getEmployeeNorms,
  isAlreadyInBatch, isBatchComplete, ISSUE_THRESHOLD_DAYS,
  jobTypeLabels, batchStatusLabels, batchItemStatusColors, batchItemStatusLabels,
  replacementStatusColors, replacementStatusLabels,
} from '../data/ppeData';

const ROLE_LABELS: Record<PPERole, string> = { EMPLOYEE: 'Nhân viên', MANAGER: 'Quản lý', HR: 'Phòng Tổ chức (HR)' };

export default function PPEDistributionPage() {
  const [role, setRole] = useState<PPERole>('HR');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(1);
  const [histories, setHistories] = useState<PPEHistory[]>(initialHistories);
  const [batches, setBatches] = useState<PPEBatch[]>(initialBatches);
  const [batchItems, setBatchItems] = useState<PPEBatchItem[]>(initialBatchItems);
  const [requests, setRequests] = useState<PPERequest[]>(initialRequests);
  const [receiveLogs, setReceiveLogs] = useState<PPEReceiveLog[]>(initialReceiveLogs);
  const [nextHistoryId, setNextHistoryId] = useState(4);
  const [nextBatchId, setNextBatchId] = useState(2);
  const [nextBatchItemId, setNextBatchItemId] = useState(4);
  const [nextRequestId, setNextRequestId] = useState(2);
  const [nextReceiveLogId, setNextReceiveLogId] = useState(3);

  // Modals
  const [showFlowGuide, setShowFlowGuide] = useState(false);
  const [showCreateBatch, setShowCreateBatch] = useState(false);
  const [showBatchDetail, setShowBatchDetail] = useState<number | null>(null);
  const [showCreateRequest, setShowCreateRequest] = useState(false);
  const [showReceiveLog, setShowReceiveLog] = useState<number | null>(null);
  const [requestItemId, setRequestItemId] = useState<number | null>(null);
  const [requestReason, setRequestReason] = useState<ReplacementReason>('BROKEN');

  const selectedEmployee = ppeEmployees.find(e => e.id === selectedEmployeeId)!;
  const [batchDept, setBatchDept] = useState(departments[0]);

  // ===== HR: Generate Batch (FIX #1 norm-based, FIX #2 duplicate check) =====
  const generateBatch = useCallback(() => {
    const deptEmployees = ppeEmployees.filter(e => e.department === batchDept);
    if (deptEmployees.length === 0) {
      toast({ title: 'Không có nhân viên', variant: 'destructive' });
      return;
    }

    const batchId = nextBatchId;
    const newBatch: PPEBatch = { id: batchId, department: batchDept, createdDate: new Date().toISOString().split('T')[0], status: 'DRAFT' };
    const newItems: PPEBatchItem[] = [];
    let itemId = nextBatchItemId;

    deptEmployees.forEach(emp => {
      const norms = getEmployeeNorms(emp, ppeNorms);
      norms.forEach(norm => {
        // FIX #2: check duplicate
        if (isAlreadyInBatch(batchItems, batches, emp.id, norm.itemId)) return;
        if (canIssue(histories, emp.id, norm.itemId)) {
          newItems.push({
            id: itemId++,
            batchId,
            employeeId: emp.id,
            itemId: norm.itemId,
            requiredQuantity: norm.quantity,
            receivedQuantity: 0,
            status: 'NOT_RECEIVED',
            isRecorded: false,
            source: 'BATCH',
          });
        }
      });
    });

    if (newItems.length === 0) {
      toast({ title: 'Không có vật tư cần cấp', description: 'Tất cả đều chưa đến hạn hoặc đã có trong đợt khác', variant: 'destructive' });
      return;
    }

    setBatches(prev => [...prev, newBatch]);
    setBatchItems(prev => [...prev, ...newItems]);
    setNextBatchId(prev => prev + 1);
    setNextBatchItemId(itemId);
    setShowCreateBatch(false);
    toast({ title: 'Tạo đợt cấp phát thành công', description: `${newItems.length} mục cho ${batchDept}` });
  }, [batchDept, histories, nextBatchId, nextBatchItemId, batchItems, batches]);

  // ===== HR: Start issuing a batch =====
  const startBatch = useCallback((batchId: number) => {
    setBatches(prev => prev.map(b => b.id === batchId ? { ...b, status: 'ISSUING' } : b));
    toast({ title: 'Bắt đầu cấp phát' });
  }, []);

  // ===== HR: Receive (FIX #7: log each receive) =====
  const receiveItem = useCallback((batchItemId: number, qty: number) => {
    const today = new Date().toISOString().split('T')[0];

    // Add receive log
    setReceiveLogs(prev => [...prev, { id: nextReceiveLogId, batchItemId, quantity: qty, date: today }]);
    setNextReceiveLogId(prev => prev + 1);

    setBatchItems(prev => {
      const updated = prev.map(bi => {
        if (bi.id !== batchItemId) return bi;
        const newReceived = Math.min(bi.receivedQuantity + qty, bi.requiredQuantity);
        const newStatus = getBatchItemStatus(newReceived, bi.requiredQuantity);
        return { ...bi, receivedQuantity: newReceived, status: newStatus };
      });

      // FIX #3: auto-complete batch if all FULL
      const changedItem = updated.find(bi => bi.id === batchItemId);
      if (changedItem) {
        const batchId = changedItem.batchId;
        if (isBatchComplete(updated, batchId)) {
          setBatches(prev2 => prev2.map(b => b.id === batchId ? { ...b, status: 'COMPLETED' } : b));
          toast({ title: 'Đợt cấp phát hoàn thành', description: 'Tất cả vật tư đã được nhận đủ' });
        }
      }

      return updated;
    });

    toast({ title: 'Cập nhật nhận hàng' });
  }, [nextReceiveLogId]);

  // FIX #4: Finalize only for specific batch, using isRecorded flag
  const finalizeFullItems = useCallback((batchId: number) => {
    const fullItems = batchItems.filter(bi => bi.batchId === batchId && bi.status === 'FULL' && !bi.isRecorded);
    const newHistories: PPEHistory[] = [];
    let hId = nextHistoryId;

    fullItems.forEach(bi => {
      const norm = ppeNorms.find(n => n.itemId === bi.itemId);
      const cycleMonths = norm?.cycleMonths ?? 12;
      const today = new Date().toISOString().split('T')[0];
      newHistories.push({
        id: hId++,
        employeeId: bi.employeeId,
        itemId: bi.itemId,
        issueDate: today,
        expireDate: addMonths(today, cycleMonths),
        type: bi.source === 'REPLACEMENT' ? 'REPLACEMENT' : 'ISSUE',
      });
    });

    if (newHistories.length > 0) {
      setHistories(prev => [...prev, ...newHistories]);
      setNextHistoryId(hId);
      // Mark as recorded
      setBatchItems(prev => prev.map(bi =>
        bi.batchId === batchId && bi.status === 'FULL' && !bi.isRecorded
          ? { ...bi, isRecorded: true }
          : bi
      ));
      toast({ title: 'Ghi nhận lịch sử', description: `${newHistories.length} mục đã nhận đủ` });
    } else {
      toast({ title: 'Không có mục mới cần ghi nhận', variant: 'destructive' });
    }
  }, [batchItems, nextHistoryId]);

  // ===== Employee: Create Replacement Request =====
  const createRequest = useCallback(() => {
    if (!requestItemId) return;
    const check = canRequestReplacement(histories, selectedEmployeeId, requestItemId);
    if (!check.allowed) {
      toast({ title: 'Không thể yêu cầu cấp đổi', description: check.reason, variant: 'destructive' });
      return;
    }
    const newReq: PPERequest = {
      id: nextRequestId,
      employeeId: selectedEmployeeId,
      itemId: requestItemId,
      reason: requestReason,
      status: 'PENDING',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setRequests(prev => [...prev, newReq]);
    setNextRequestId(prev => prev + 1);
    setShowCreateRequest(false);
    setRequestItemId(null);
    toast({ title: 'Đã gửi yêu cầu cấp đổi' });
  }, [requestItemId, requestReason, selectedEmployeeId, histories, nextRequestId]);

  // FIX #5: Manager approve → create mini batch item instead of direct history
  const handleRequestAction = useCallback((id: number, action: 'APPROVED' | 'REJECTED') => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: action } : r));

    if (action === 'APPROVED') {
      const req = requests.find(r => r.id === id);
      if (req) {
        const norm = ppeNorms.find(n => n.itemId === req.itemId);
        const quantity = norm?.quantity ?? 1;

        // Find or create a DRAFT/ISSUING batch for the employee's department
        const emp = ppeEmployees.find(e => e.id === req.employeeId);
        if (!emp) return;

        let targetBatch = batches.find(b => b.department === emp.department && b.status !== 'COMPLETED');
        let targetBatchId: number;

        if (!targetBatch) {
          targetBatchId = nextBatchId;
          const newBatch: PPEBatch = {
            id: targetBatchId,
            department: emp.department,
            createdDate: new Date().toISOString().split('T')[0],
            status: 'ISSUING',
          };
          setBatches(prev => [...prev, newBatch]);
          setNextBatchId(prev => prev + 1);
        } else {
          targetBatchId = targetBatch.id;
        }

        const newBatchItemId = nextBatchItemId;
        const newBatchItem: PPEBatchItem = {
          id: newBatchItemId,
          batchId: targetBatchId,
          employeeId: req.employeeId,
          itemId: req.itemId,
          requiredQuantity: quantity,
          receivedQuantity: 0,
          status: 'NOT_RECEIVED',
          isRecorded: false,
          source: 'REPLACEMENT',
        };
        setBatchItems(prev => [...prev, newBatchItem]);
        setNextBatchItemId(prev => prev + 1);

        // Link request to batch item
        setRequests(prev => prev.map(r => r.id === id ? { ...r, linkedBatchItemId: newBatchItemId } : r));

        toast({ title: 'Đã duyệt và tạo phiếu cấp đổi trong kho' });
        return;
      }
    }
    toast({ title: action === 'APPROVED' ? 'Đã duyệt' : 'Đã từ chối' });
  }, [requests, nextHistoryId, nextBatchId, nextBatchItemId, batches]);

  // ===== Derived data =====
  const myHistories = useMemo(() =>
    histories.filter(h => h.employeeId === selectedEmployeeId)
      .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()),
    [histories, selectedEmployeeId]
  );

  const myNorms = useMemo(() =>
    getEmployeeNorms(selectedEmployee, ppeNorms),
    [selectedEmployee]
  );

  const pendingRequests = useMemo(() =>
    requests.filter(r => r.status === 'PENDING'),
    [requests]
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <HardHat className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">PPE Management (Bảo hộ lao động)</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Vai trò:</span>
            <Select value={role} onValueChange={v => setRole(v as PPERole)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(ROLE_LABELS) as PPERole[]).map(r => (
                  <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {role === 'EMPLOYEE' && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Nhân viên:</span>
              <Select value={String(selectedEmployeeId)} onValueChange={v => setSelectedEmployeeId(Number(v))}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ppeEmployees.map(e => (
                    <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button variant="outline" onClick={() => setShowFlowGuide(true)}>
            <BookOpen className="h-4 w-4 mr-2" />
            Xem hướng dẫn
          </Button>
        </div>
      </div>

      {/* ===== EMPLOYEE VIEW ===== */}
      {role === 'EMPLOYEE' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldCheck className="h-5 w-5" />
                Bảo hộ của tôi
              </CardTitle>
              <CardDescription>
                {selectedEmployee.name} — {jobTypeLabels[selectedEmployee.jobType]} — {selectedEmployee.department}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Show norms for this employee */}
              <div className="mb-4 p-3 rounded-lg bg-muted/50">
                <p className="text-xs font-medium text-muted-foreground mb-2">Định mức theo nghề ({jobTypeLabels[selectedEmployee.jobType]}):</p>
                {myNorms.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Không có định mức bảo hộ cho loại công việc này.</p>
                ) : (
                  <div className="space-y-1">
                    {myNorms.map(n => {
                      const item = ppeItemDefs.find(i => i.id === n.itemId);
                      return (
                        <p key={n.id} className="text-xs">
                          {item?.name}: <strong>{n.quantity}</strong> / {n.cycleMonths} tháng
                        </p>
                      );
                    })}
                  </div>
                )}
              </div>

              {myHistories.length === 0 ? (
                <p className="text-sm text-muted-foreground">Chưa có vật tư nào được cấp.</p>
              ) : (
                myHistories.map(h => {
                  const item = ppeItemDefs.find(i => i.id === h.itemId);
                  const isExpired = new Date() >= new Date(h.expireDate);
                  return (
                    <div key={h.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <div>
                        <p className="font-medium text-sm">{item?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Cấp: {h.issueDate} → Hết hạn: {h.expireDate}
                        </p>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {h.type === 'ISSUE' ? 'Cấp phát' : 'Cấp đổi'}
                        </Badge>
                      </div>
                      <Badge className={isExpired
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      }>
                        {isExpired ? 'Hết hạn' : 'Còn hạn'}
                      </Badge>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Replacement Requests */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Yêu cầu cấp đổi</CardTitle>
                <Button size="sm" onClick={() => setShowCreateRequest(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Tạo yêu cầu
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {requests.filter(r => r.employeeId === selectedEmployeeId).length === 0 ? (
                <p className="text-sm text-muted-foreground">Chưa có yêu cầu nào.</p>
              ) : (
                requests.filter(r => r.employeeId === selectedEmployeeId).map(r => {
                  const item = ppeItemDefs.find(i => i.id === r.itemId);
                  return (
                    <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <div>
                        <p className="font-medium text-sm">{item?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Lý do: {r.reason === 'BROKEN' ? 'Hỏng' : 'Mất'} — {r.createdAt}
                        </p>
                        {r.linkedBatchItemId && (
                          <p className="text-xs text-primary mt-1">→ Đã tạo phiếu cấp kho #{r.linkedBatchItemId}</p>
                        )}
                      </div>
                      <Badge className={replacementStatusColors[r.status]}>
                        {replacementStatusLabels[r.status]}
                      </Badge>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ===== MANAGER VIEW ===== */}
      {role === 'MANAGER' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5" />
              Duyệt yêu cầu cấp đổi
            </CardTitle>
            <CardDescription>Duyệt hoặc từ chối yêu cầu cấp đổi bảo hộ từ nhân viên</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground">Không có yêu cầu chờ duyệt.</p>
            ) : (
              pendingRequests.map(r => {
                const emp = ppeEmployees.find(e => e.id === r.employeeId);
                const item = ppeItemDefs.find(i => i.id === r.itemId);
                return (
                  <div key={r.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                    <div>
                      <p className="font-medium">{emp?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item?.name} — Lý do: {r.reason === 'BROKEN' ? 'Hỏng' : 'Mất'}
                      </p>
                      <p className="text-xs text-muted-foreground">{r.createdAt}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleRequestAction(r.id, 'APPROVED')}>
                        <Check className="h-4 w-4 mr-1" />
                        Duyệt
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleRequestAction(r.id, 'REJECTED')}>
                        <X className="h-4 w-4 mr-1" />
                        Từ chối
                      </Button>
                    </div>
                  </div>
                );
              })
            )}

            {requests.filter(r => r.status !== 'PENDING').length > 0 && (
              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Đã xử lý</h3>
                {requests.filter(r => r.status !== 'PENDING').map(r => {
                  const emp = ppeEmployees.find(e => e.id === r.employeeId);
                  const item = ppeItemDefs.find(i => i.id === r.itemId);
                  return (
                    <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 mb-2">
                      <div>
                        <p className="font-medium text-sm">{emp?.name} — {item?.name}</p>
                        <p className="text-xs text-muted-foreground">{r.reason === 'BROKEN' ? 'Hỏng' : 'Mất'}</p>
                        {r.linkedBatchItemId && (
                          <p className="text-xs text-primary">→ Phiếu kho #{r.linkedBatchItemId}</p>
                        )}
                      </div>
                      <Badge className={replacementStatusColors[r.status]}>
                        {replacementStatusLabels[r.status]}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ===== HR VIEW ===== */}
      {role === 'HR' && (
        <div className="space-y-6">
          {/* Norm Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                Bảng định mức PPE theo nghề
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Nghề</th>
                      <th className="text-left p-2">Vật tư</th>
                      <th className="text-left p-2">Số lượng</th>
                      <th className="text-left p-2">Chu kỳ (tháng)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ppeNorms.map(n => {
                      const item = ppeItemDefs.find(i => i.id === n.itemId);
                      return (
                        <tr key={n.id} className="border-b hover:bg-muted/30">
                          <td className="p-2">{jobTypeLabels[n.jobType]}</td>
                          <td className="p-2">{item?.name}</td>
                          <td className="p-2 font-medium">{n.quantity}</td>
                          <td className="p-2">{n.cycleMonths}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Create Batch */}
          <div className="flex gap-3">
            <Button onClick={() => setShowCreateBatch(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Tạo đợt cấp phát
            </Button>
          </div>

          {/* Batches */}
          <div className="grid gap-4">
            {batches.map(batch => {
              const items = batchItems.filter(bi => bi.batchId === batch.id);
              const employeeIds = [...new Set(items.map(bi => bi.employeeId))];
              const unrecoredFull = items.filter(bi => bi.status === 'FULL' && !bi.isRecorded).length;

              return (
                <Card key={batch.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Đợt #{batch.id} — {batch.department}</CardTitle>
                        <CardDescription>
                          Ngày tạo: {batch.createdDate} —{' '}
                          <Badge variant="outline">{batchStatusLabels[batch.status]}</Badge>
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        {batch.status === 'DRAFT' && (
                          <Button size="sm" onClick={() => startBatch(batch.id)}>
                            <Clock className="h-4 w-4 mr-1" />
                            Bắt đầu cấp
                          </Button>
                        )}
                        {unrecoredFull > 0 && (
                          <Button size="sm" variant="outline" onClick={() => finalizeFullItems(batch.id)}>
                            <History className="h-4 w-4 mr-1" />
                            Ghi lịch sử ({unrecoredFull})
                          </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => setShowBatchDetail(batch.id)}>
                          Chi tiết
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4 text-sm flex-wrap">
                      <span>{employeeIds.length} nhân viên</span>
                      <span>{items.length} mục</span>
                      <span className="text-green-600">{items.filter(i => i.status === 'FULL').length} đã nhận đủ</span>
                      <span className="text-yellow-600">{items.filter(i => i.status === 'PARTIAL').length} nhận một phần</span>
                      <span className="text-red-600">{items.filter(i => i.status === 'NOT_RECEIVED').length} chưa nhận</span>
                      {items.some(i => i.source === 'REPLACEMENT') && (
                        <span className="text-primary">📋 Có phiếu cấp đổi</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* All History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lịch sử cấp phát</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Nhân viên</th>
                      <th className="text-left p-2">Vật tư</th>
                      <th className="text-left p-2">Ngày cấp</th>
                      <th className="text-left p-2">Hết hạn</th>
                      <th className="text-left p-2">Loại</th>
                      <th className="text-left p-2">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {histories.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()).map(h => {
                      const emp = ppeEmployees.find(e => e.id === h.employeeId);
                      const item = ppeItemDefs.find(i => i.id === h.itemId);
                      const isExpired = new Date() >= new Date(h.expireDate);
                      return (
                        <tr key={h.id} className="border-b hover:bg-muted/30">
                          <td className="p-2">{emp?.name}</td>
                          <td className="p-2">{item?.name}</td>
                          <td className="p-2">{h.issueDate}</td>
                          <td className="p-2">{h.expireDate}</td>
                          <td className="p-2">
                            <Badge variant="outline">{h.type === 'ISSUE' ? 'Cấp phát' : 'Cấp đổi'}</Badge>
                          </td>
                          <td className="p-2">
                            <Badge className={isExpired
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            }>
                              {isExpired ? 'Hết hạn' : 'Còn hạn'}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ===== MODALS ===== */}

      {/* Flow Guide Modal */}
      <Dialog open={showFlowGuide} onOpenChange={setShowFlowGuide}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Hướng dẫn quy trình PPE
            </DialogTitle>
            <DialogDescription>Quy trình cấp phát và cấp đổi bảo hộ lao động</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 text-sm">
            <div className="bg-primary/5 p-4 rounded-lg">
              <h3 className="font-semibold text-base mb-2">📋 Định mức theo nghề (PPENorm)</h3>
              <p className="text-muted-foreground">
                Mỗi loại công việc (Hầm lò, Nặng nhọc, Văn phòng) có bảng định mức riêng.
                Hệ thống tự động xác định vật tư cần cấp dựa trên nghề của nhân viên.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                1. Cấp phát theo đợt (Batch)
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>HR tạo đợt cấp phát theo phòng ban → trạng thái <strong>DRAFT</strong></li>
                <li>Hệ thống <strong>tự động</strong> tạo danh sách dựa trên định mức nghề và chu kỳ cấp</li>
                <li><strong>Chống trùng</strong>: Không tạo mục nếu đã có trong đợt đang xử lý</li>
                <li>Chuyển sang <strong>ISSUING</strong> khi bắt đầu cấp phát</li>
                <li>Tất cả nhận đủ → tự động <strong>COMPLETED</strong></li>
                <li>Cho phép cấp trước <strong>{ISSUE_THRESHOLD_DAYS} ngày</strong> trước hạn</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                2. Nhận nhiều lần (Partial Receiving)
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Có thể nhận thiếu → quay lại nhận tiếp</li>
                <li>Mỗi lần nhận được <strong>ghi log</strong> (ngày, số lượng)</li>
                <li>Trạng thái: {' '}
                  <Badge className={batchItemStatusColors.NOT_RECEIVED}>{batchItemStatusLabels.NOT_RECEIVED}</Badge>{' '}
                  <Badge className={batchItemStatusColors.PARTIAL}>{batchItemStatusLabels.PARTIAL}</Badge>{' '}
                  <Badge className={batchItemStatusColors.FULL}>{batchItemStatusLabels.FULL}</Badge>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-green-600" />
                3. Cấp đổi (Replacement)
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Chỉ khi vật tư <strong>còn hạn</strong></li>
                <li>Cần quản lý duyệt</li>
                <li>Sau khi duyệt → tạo <strong>phiếu cấp trong kho</strong> (mini batch)</li>
                <li>Kho cấp phát → ghi nhận lịch sử</li>
              </ul>
            </div>
            <div className="bg-destructive/10 p-4 rounded-lg">
              <h3 className="font-semibold text-base mb-2 text-destructive">⚠️ Quy tắc quan trọng</h3>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li><strong>Không cấp</strong> nếu chưa đến hạn (trừ {ISSUE_THRESHOLD_DAYS} ngày trước)</li>
                <li><strong>Không xin cấp đổi</strong> nếu đã hết hạn → chờ đợt cấp phát</li>
                <li><strong>Số lượng</strong> do hệ thống quyết định theo định mức</li>
                <li><strong>Không duplicate</strong>: Không tạo mục trùng trong đợt đang xử lý</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Batch Modal */}
      <Dialog open={showCreateBatch} onOpenChange={setShowCreateBatch}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo đợt cấp phát mới</DialogTitle>
            <DialogDescription>Chọn phòng ban để tạo đợt cấp phát bảo hộ lao động</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Phòng ban</label>
              <Select value={batchDept} onValueChange={setBatchDept}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground">
              Hệ thống tự động tạo danh sách dựa trên <strong>định mức nghề</strong> và chu kỳ cấp.
              Batch tạo ở trạng thái <strong>Nháp</strong>, cần bấm "Bắt đầu cấp" để chuyển sang cấp phát.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateBatch(false)}>Hủy</Button>
            <Button onClick={generateBatch}>Tạo đợt</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Detail Modal */}
      <BatchDetailModal
        batchId={showBatchDetail}
        batches={batches}
        batchItems={batchItems}
        receiveLogs={receiveLogs}
        onClose={() => setShowBatchDetail(null)}
        onReceive={receiveItem}
        onShowReceiveLog={setShowReceiveLog}
      />

      {/* Receive Log Modal (FIX #7) */}
      <Dialog open={showReceiveLog !== null} onOpenChange={() => setShowReceiveLog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lịch sử nhận hàng</DialogTitle>
            <DialogDescription>Chi tiết từng lần nhận</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {showReceiveLog !== null && receiveLogs.filter(l => l.batchItemId === showReceiveLog).length === 0 ? (
              <p className="text-sm text-muted-foreground">Chưa có lần nhận nào.</p>
            ) : (
              receiveLogs.filter(l => l.batchItemId === showReceiveLog).map(log => (
                <div key={log.id} className="flex justify-between p-3 rounded-lg border">
                  <span className="text-sm">{log.date}</span>
                  <span className="text-sm font-medium">+{log.quantity}</span>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Replacement Request Modal */}
      <Dialog open={showCreateRequest} onOpenChange={setShowCreateRequest}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yêu cầu cấp đổi</DialogTitle>
            <DialogDescription>Chọn vật tư cần cấp đổi và lý do</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Vật tư (theo định mức nghề)</label>
              <Select value={requestItemId ? String(requestItemId) : ''} onValueChange={v => setRequestItemId(Number(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn vật tư" />
                </SelectTrigger>
                <SelectContent>
                  {myNorms.map(norm => {
                    const item = ppeItemDefs.find(i => i.id === norm.itemId);
                    const check = canRequestReplacement(histories, selectedEmployeeId, norm.itemId);
                    return (
                      <SelectItem key={norm.id} value={String(norm.itemId)} disabled={!check.allowed}>
                        {item?.name} {!check.allowed ? `(${check.reason})` : ''}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Lý do</label>
              <Select value={requestReason} onValueChange={v => setRequestReason(v as ReplacementReason)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BROKEN">Hỏng</SelectItem>
                  <SelectItem value="LOST">Mất</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateRequest(false)}>Hủy</Button>
            <Button onClick={createRequest} disabled={!requestItemId}>Gửi yêu cầu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ===== Batch Detail Sub-component =====
function BatchDetailModal({
  batchId,
  batches,
  batchItems,
  receiveLogs,
  onClose,
  onReceive,
  onShowReceiveLog,
}: {
  batchId: number | null;
  batches: PPEBatch[];
  batchItems: PPEBatchItem[];
  receiveLogs: PPEReceiveLog[];
  onClose: () => void;
  onReceive: (id: number, qty: number) => void;
  onShowReceiveLog: (batchItemId: number) => void;
}) {
  const [receiveQty, setReceiveQty] = useState<Record<number, number>>({});

  if (!batchId) return null;
  const batch = batches.find(b => b.id === batchId);
  if (!batch) return null;

  const items = batchItems.filter(bi => bi.batchId === batchId);
  const employeeIds = [...new Set(items.map(bi => bi.employeeId))];

  return (
    <Dialog open={!!batchId} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết đợt #{batch.id} — {batch.department}</DialogTitle>
          <DialogDescription>
            Trạng thái: <Badge variant="outline">{batchStatusLabels[batch.status]}</Badge>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {employeeIds.map(empId => {
            const emp = ppeEmployees.find(e => e.id === empId);
            const empItems = items.filter(i => i.employeeId === empId);
            return (
              <div key={empId} className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">{emp?.name}</h3>
                <div className="space-y-2">
                  {empItems.map(bi => {
                    const item = ppeItemDefs.find(i => i.id === bi.itemId);
                    const statusIcon = bi.status === 'FULL' ? '✔' : bi.status === 'PARTIAL' ? '⚠️' : '❌';
                    const logCount = receiveLogs.filter(l => l.batchItemId === bi.id).length;
                    return (
                      <div key={bi.id} className="flex items-center justify-between gap-4 p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span>{statusIcon}</span>
                          <div>
                            <p className="font-medium text-sm">
                              {item?.name}
                              {bi.source === 'REPLACEMENT' && (
                                <Badge variant="outline" className="ml-2 text-xs">Cấp đổi</Badge>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              [{bi.receivedQuantity} / {bi.requiredQuantity}]
                              {bi.isRecorded && <span className="ml-2 text-green-600">✓ Đã ghi lịch sử</span>}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={batchItemStatusColors[bi.status]}>
                            {batchItemStatusLabels[bi.status]}
                          </Badge>
                          {logCount > 0 && (
                            <Button size="sm" variant="ghost" onClick={() => onShowReceiveLog(bi.id)} title="Xem lịch sử nhận">
                              <History className="h-3 w-3" />
                              <span className="text-xs ml-1">{logCount}</span>
                            </Button>
                          )}
                          {bi.status !== 'FULL' && batch.status === 'ISSUING' && (
                            <>
                              <Input
                                type="number"
                                min={1}
                                max={bi.requiredQuantity - bi.receivedQuantity}
                                value={receiveQty[bi.id] || ''}
                                onChange={e => setReceiveQty(prev => ({ ...prev, [bi.id]: Number(e.target.value) }))}
                                className="w-16 h-8"
                                placeholder="SL"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const qty = receiveQty[bi.id] || 1;
                                  onReceive(bi.id, qty);
                                  setReceiveQty(prev => ({ ...prev, [bi.id]: 0 }));
                                }}
                              >
                                Nhận
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
