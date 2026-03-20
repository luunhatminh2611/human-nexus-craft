import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from './StatusBadge';
import type { IssueRecord, ReplacementRequest, PPEItem, Employee } from '../data/mockData';
import { Eye, RefreshCw, Check, AlertTriangle } from 'lucide-react';

interface EmployeeTabProps {
  issueRecords: IssueRecord[];
  replacementRequests: ReplacementRequest[];
  ppeItems: PPEItem[];
  employees: Employee[];
  onConfirmReceive: (id: number, hasIssue: boolean) => void;
  onAddReplacement: (req: Omit<ReplacementRequest, 'id' | 'status' | 'createdAt'>) => void;
}

export function EmployeeTab({
  issueRecords, replacementRequests, ppeItems, employees,
  onConfirmReceive, onAddReplacement,
}: EmployeeTabProps) {
  const [selectedEmp, setSelectedEmp] = useState(1);
  const [filterMonth, setFilterMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [detail, setDetail] = useState<IssueRecord | null>(null);
  const [showReplace, setShowReplace] = useState(false);
  const [replPpeId, setReplPpeId] = useState<number | null>(null);
  const [replReason, setReplReason] = useState<'Hỏng' | 'Mất' | 'Khác'>('Hỏng');
  const [replDetail, setReplDetail] = useState('');

  const emp = employees.find(e => e.id === selectedEmp)!;
  const myRecords = issueRecords.filter(r => r.employeeId === selectedEmp && r.month === filterMonth);
  const myReplacements = replacementRequests.filter(r => r.employeeId === selectedEmp);
  const approvedPPE = ppeItems.filter(p => p.status === 'Approved' && p.applicableRoles.includes(emp.role));

  const handleReplace = () => {
    if (!replPpeId) return;
    const ppe = ppeItems.find(p => p.id === replPpeId);
    if (!ppe) return;
    onAddReplacement({
      employeeId: selectedEmp,
      employeeName: emp.name,
      ppeItemId: replPpeId,
      ppeName: ppe.name,
      reason: replReason,
      reasonDetail: replReason === 'Khác' ? replDetail : undefined,
    });
    setShowReplace(false);
    setReplPpeId(null);
    setReplDetail('');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-foreground">Nhân viên:</label>
          <Select value={String(selectedEmp)} onValueChange={v => setSelectedEmp(Number(v))}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              {employees.map(e => <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-foreground">Tháng:</label>
          <Input type="month" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="w-40" />
        </div>
        <Dialog open={showReplace} onOpenChange={setShowReplace}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline"><RefreshCw className="mr-1 h-4 w-4" />Yêu cầu cấp đổi</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Yêu cầu cấp đổi bảo hộ</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Chọn vật tư <span className="text-destructive">*</span></label>
                <Select value={replPpeId ? String(replPpeId) : ''} onValueChange={v => setReplPpeId(Number(v))}>
                  <SelectTrigger><SelectValue placeholder="Chọn..." /></SelectTrigger>
                  <SelectContent>
                    {approvedPPE.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Lý do</label>
                <Select value={replReason} onValueChange={v => setReplReason(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hỏng">Hỏng</SelectItem>
                    <SelectItem value="Mất">Mất</SelectItem>
                    <SelectItem value="Khác">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {replReason === 'Khác' && (
                <div>
                  <label className="text-sm font-medium text-foreground">Chi tiết</label>
                  <Input value={replDetail} onChange={e => setReplDetail(e.target.value)} placeholder="Mô tả lý do..." />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowReplace(false)}>Hủy</Button>
              <Button onClick={handleReplace} disabled={!replPpeId}>Gửi yêu cầu</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* My PPE Records */}
      <h2 className="text-lg font-semibold text-foreground">Bảo hộ được cấp - {emp.name}</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vật tư</TableHead>
            <TableHead>SL định mức</TableHead>
            <TableHead>SL thực nhận</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {myRecords.length === 0 ? (
            <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Chưa có bảo hộ cho tháng này</TableCell></TableRow>
          ) : myRecords.map(r => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{r.ppeName}</TableCell>
              <TableCell>{r.quantity}</TableCell>
              <TableCell>
                {r.actualQuantity > 0 ? r.actualQuantity : '-'}
                {r.actualQuantity > 0 && r.actualQuantity < r.quantity && (
                  <AlertTriangle className="inline h-3 w-3 ml-1 text-orange-500" />
                )}
              </TableCell>
              <TableCell><StatusBadge status={r.status} /></TableCell>
              <TableCell className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => setDetail(r)}><Eye className="h-4 w-4" /></Button>
                {r.status === 'Issued' && (
                  <>
                    <Button size="sm" onClick={() => onConfirmReceive(r.id, false)}>
                      <Check className="mr-1 h-3 w-3" />Đã nhận đủ
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onConfirmReceive(r.id, true)}>
                      <AlertTriangle className="mr-1 h-3 w-3" />Thiếu
                    </Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* My Replacement Requests */}
      {myReplacements.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-foreground mt-6">Yêu cầu cấp đổi</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vật tư</TableHead>
                <TableHead>Lý do</TableHead>
                <TableHead>Ngày gửi</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myReplacements.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.ppeName}</TableCell>
                  <TableCell>{r.reason}{r.reasonDetail ? `: ${r.reasonDetail}` : ''}</TableCell>
                  <TableCell>{new Date(r.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell><StatusBadge status={r.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}

      {/* Detail Modal */}
      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Chi tiết cấp phát</DialogTitle></DialogHeader>
          {detail && (
            <div className="space-y-2 text-sm">
              {[
                ['Vật tư', detail.ppeName],
                ['SL định mức', detail.quantity],
                ['SL thực nhận', detail.actualQuantity || '-'],
                ['Tháng', detail.month],
                ['Trạng thái', null],
                ['Ngày tạo', new Date(detail.createdAt).toLocaleDateString('vi-VN')],
                ['Ngày cấp', detail.issuedAt ? new Date(detail.issuedAt).toLocaleDateString('vi-VN') : '-'],
                ['Ngày xác nhận', detail.confirmedAt ? new Date(detail.confirmedAt).toLocaleDateString('vi-VN') : '-'],
              ].map(([label, value]) => (
                <div key={String(label)} className="flex justify-between">
                  <span className="text-muted-foreground">{label}:</span>
                  {label === 'Trạng thái' ? <StatusBadge status={detail.status} /> : <span className="font-medium">{value}</span>}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
