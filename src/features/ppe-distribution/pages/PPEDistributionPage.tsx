import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { HardHat, BookOpen, Plus, Check, X, AlertTriangle, Package, User, ShieldCheck } from 'lucide-react';
import {
  type PPERole, type PPEBatch, type PPEBatchItem, type PPEHistory, type PPERequest,
  type ReplacementReason, type BatchItemStatus,
  ppeEmployees, ppeItemDefs, departments,
  initialHistories, initialBatches, initialBatchItems, initialRequests,
  canIssue, canRequestReplacement, getBatchItemStatus, addMonths, getEligibleItems,
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
  const [nextHistoryId, setNextHistoryId] = useState(4);
  const [nextBatchId, setNextBatchId] = useState(2);
  const [nextBatchItemId, setNextBatchItemId] = useState(4);
  const [nextRequestId, setNextRequestId] = useState(2);

  // Modals
  const [showFlowGuide, setShowFlowGuide] = useState(false);
  const [showCreateBatch, setShowCreateBatch] = useState(false);
  const [showBatchDetail, setShowBatchDetail] = useState<number | null>(null);
  const [showCreateRequest, setShowCreateRequest] = useState(false);
  const [requestItemId, setRequestItemId] = useState<number | null>(null);
  const [requestReason, setRequestReason] = useState<ReplacementReason>('BROKEN');

  const selectedEmployee = ppeEmployees.find(e => e.id === selectedEmployeeId)!;
  const [batchDept, setBatchDept] = useState(departments[0]);

  // ===== HR: Generate Batch =====
  const generateBatch = useCallback(() => {
    const deptEmployees = ppeEmployees.filter(e => e.department === batchDept);
    if (deptEmployees.length === 0) {
      toast({ title: 'Không có nhân viên', variant: 'destructive' });
      return;
    }

    const batchId = nextBatchId;
    const newBatch: PPEBatch = { id: batchId, department: batchDept, createdDate: new Date().toISOString().split('T')[0], status: 'ISSUING' };
    const newItems: PPEBatchItem[] = [];
    let itemId = nextBatchItemId;

    deptEmployees.forEach(emp => {
      const eligible = getEligibleItems(emp, ppeItemDefs);
      eligible.forEach(item => {
        if (canIssue(histories, emp.id, item.id)) {
          newItems.push({
            id: itemId++,
            batchId,
            employeeId: emp.id,
            itemId: item.id,
            requiredQuantity: item.quantityPerCycle,
            receivedQuantity: 0,
            status: 'NOT_RECEIVED',
          });
        }
      });
    });

    if (newItems.length === 0) {
      toast({ title: 'Không có vật tư cần cấp', description: 'Tất cả đều chưa đến hạn', variant: 'destructive' });
      return;
    }

    setBatches(prev => [...prev, newBatch]);
    setBatchItems(prev => [...prev, ...newItems]);
    setNextBatchId(prev => prev + 1);
    setNextBatchItemId(itemId);
    setShowCreateBatch(false);
    toast({ title: 'Tạo đợt cấp phát thành công', description: `${newItems.length} mục cho ${batchDept}` });
  }, [batchDept, histories, nextBatchId, nextBatchItemId]);

  // ===== HR: Receive =====
  const receiveItem = useCallback((batchItemId: number, qty: number) => {
    setBatchItems(prev => prev.map(bi => {
      if (bi.id !== batchItemId) return bi;
      const newReceived = Math.min(bi.receivedQuantity + qty, bi.requiredQuantity);
      const newStatus = getBatchItemStatus(newReceived, bi.requiredQuantity);
      return { ...bi, receivedQuantity: newReceived, status: newStatus };
    }));
    toast({ title: 'Cập nhật nhận hàng' });
  }, []);

  // Auto-create history when FULL
  const finalizeFullItems = useCallback(() => {
    const fullItems = batchItems.filter(bi => bi.status === 'FULL');
    const newHistories: PPEHistory[] = [];
    let hId = nextHistoryId;

    fullItems.forEach(bi => {
      const alreadyRecorded = histories.some(h =>
        h.employeeId === bi.employeeId && h.itemId === bi.itemId &&
        h.issueDate === new Date().toISOString().split('T')[0]
      );
      if (!alreadyRecorded) {
        const itemDef = ppeItemDefs.find(i => i.id === bi.itemId);
        if (itemDef) {
          newHistories.push({
            id: hId++,
            employeeId: bi.employeeId,
            itemId: bi.itemId,
            issueDate: new Date().toISOString().split('T')[0],
            expireDate: addMonths(new Date().toISOString().split('T')[0], itemDef.issueCycleMonths),
            type: 'ISSUE',
          });
        }
      }
    });

    if (newHistories.length > 0) {
      setHistories(prev => [...prev, ...newHistories]);
      setNextHistoryId(hId);
      toast({ title: 'Ghi nhận lịch sử', description: `${newHistories.length} mục đã nhận đủ` });
    }
  }, [batchItems, histories, nextHistoryId]);

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

  // ===== Manager: Approve/Reject =====
  const handleRequestAction = useCallback((id: number, action: 'APPROVED' | 'REJECTED') => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: action } : r));

    if (action === 'APPROVED') {
      const req = requests.find(r => r.id === id);
      if (req) {
        const itemDef = ppeItemDefs.find(i => i.id === req.itemId);
        if (itemDef) {
          const hId = nextHistoryId;
          setHistories(prev => [...prev, {
            id: hId,
            employeeId: req.employeeId,
            itemId: req.itemId,
            issueDate: new Date().toISOString().split('T')[0],
            expireDate: addMonths(new Date().toISOString().split('T')[0], itemDef.issueCycleMonths),
            type: 'REPLACEMENT',
          }]);
          setNextHistoryId(prev => prev + 1);
        }
      }
    }
    toast({ title: action === 'APPROVED' ? 'Đã duyệt' : 'Đã từ chối' });
  }, [requests, nextHistoryId]);

  // ===== Derived data =====
  const myHistories = useMemo(() =>
    histories.filter(h => h.employeeId === selectedEmployeeId)
      .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()),
    [histories, selectedEmployeeId]
  );

  const myEligibleItems = useMemo(() =>
    getEligibleItems(selectedEmployee, ppeItemDefs),
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
          {/* Role Switcher */}
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
          {/* My PPE */}
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

            {/* All requests */}
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
          {/* Create Batch */}
          <div className="flex gap-3">
            <Button onClick={() => setShowCreateBatch(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Tạo đợt cấp phát
            </Button>
            <Button variant="outline" onClick={finalizeFullItems}>
              <Package className="h-4 w-4 mr-2" />
              Ghi nhận lịch sử (items đã nhận đủ)
            </Button>
          </div>

          {/* Batches */}
          <div className="grid gap-4">
            {batches.map(batch => {
              const items = batchItems.filter(bi => bi.batchId === batch.id);
              const employeeIds = [...new Set(items.map(bi => bi.employeeId))];

              return (
                <Card key={batch.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Đợt #{batch.id} — {batch.department}</CardTitle>
                        <CardDescription>
                          Ngày tạo: {batch.createdDate} — {batchStatusLabels[batch.status]}
                        </CardDescription>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setShowBatchDetail(batch.id)}>
                        Chi tiết
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4 text-sm">
                      <span>{employeeIds.length} nhân viên</span>
                      <span>{items.length} mục</span>
                      <span className="text-green-600">{items.filter(i => i.status === 'FULL').length} đã nhận đủ</span>
                      <span className="text-yellow-600">{items.filter(i => i.status === 'PARTIAL').length} nhận một phần</span>
                      <span className="text-red-600">{items.filter(i => i.status === 'NOT_RECEIVED').length} chưa nhận</span>
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
            <div>
              <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                1. Cấp phát theo đợt (Batch)
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>HR tạo đợt cấp phát theo phòng ban</li>
                <li>Hệ thống <strong>tự động</strong> tạo danh sách dựa trên loại công việc và chu kỳ cấp</li>
                <li>Kho cấp phát nhiều lần nếu thiếu hàng</li>
                <li>Nhận đủ → tự động ghi nhận lịch sử + tính hạn mới</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                2. Nhận nhiều lần (Partial Receiving)
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Có thể nhận thiếu (ví dụ: cần 2, nhận 1 trước)</li>
                <li>Quay lại nhận tiếp khi kho có hàng</li>
                <li>Trạng thái: <Badge className={batchItemStatusColors.NOT_RECEIVED}>{batchItemStatusLabels.NOT_RECEIVED}</Badge>{' '}
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
                <li>Sau khi duyệt → cập nhật lịch sử mới</li>
              </ul>
            </div>
            <div className="bg-destructive/10 p-4 rounded-lg">
              <h3 className="font-semibold text-base mb-2 text-destructive">⚠️ Quy tắc quan trọng</h3>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li><strong>Không cấp</strong> nếu chưa đến hạn (hệ thống tự kiểm tra)</li>
                <li><strong>Không xin cấp đổi</strong> nếu đã hết hạn → chờ đợt cấp phát</li>
                <li><strong>Số lượng</strong> do hệ thống quyết định theo định mức</li>
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
              Hệ thống sẽ tự động tạo danh sách vật tư cần cấp dựa trên loại công việc và chu kỳ cấp.
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
        onClose={() => setShowBatchDetail(null)}
        onReceive={receiveItem}
      />

      {/* Create Replacement Request Modal */}
      <Dialog open={showCreateRequest} onOpenChange={setShowCreateRequest}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yêu cầu cấp đổi</DialogTitle>
            <DialogDescription>Chọn vật tư cần cấp đổi và lý do</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Vật tư</label>
              <Select value={requestItemId ? String(requestItemId) : ''} onValueChange={v => setRequestItemId(Number(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn vật tư" />
                </SelectTrigger>
                <SelectContent>
                  {myEligibleItems.map(item => {
                    const check = canRequestReplacement(histories, selectedEmployeeId, item.id);
                    return (
                      <SelectItem key={item.id} value={String(item.id)} disabled={!check.allowed}>
                        {item.name} {!check.allowed ? `(${check.reason})` : ''}
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
  onClose,
  onReceive,
}: {
  batchId: number | null;
  batches: PPEBatch[];
  batchItems: PPEBatchItem[];
  onClose: () => void;
  onReceive: (id: number, qty: number) => void;
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
          <DialogDescription>Quản lý nhận hàng cho từng nhân viên</DialogDescription>
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
                    return (
                      <div key={bi.id} className="flex items-center justify-between gap-4 p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span>{statusIcon}</span>
                          <div>
                            <p className="font-medium text-sm">{item?.name}</p>
                            <p className="text-xs text-muted-foreground">
                              [{bi.receivedQuantity} / {bi.requiredQuantity}]
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={batchItemStatusColors[bi.status]}>
                            {batchItemStatusLabels[bi.status]}
                          </Badge>
                          {bi.status !== 'FULL' && (
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
