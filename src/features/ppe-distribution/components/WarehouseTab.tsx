import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { StatusBadge } from './StatusBadge';
import type { IssueRecord } from '../data/mockData';
import { Package, AlertTriangle } from 'lucide-react';

interface WarehouseTabProps {
  issueRecords: IssueRecord[];
  onIssueItem: (id: number, actualQty: number) => void;
}

export function WarehouseTab({ issueRecords, onIssueItem }: WarehouseTabProps) {
  const readyItems = issueRecords.filter(r => r.status === 'Ready_To_Issue');
  const issuedItems = issueRecords.filter(r => ['Issued', 'Completed', 'Issue_Reported'].includes(r.status));
  const [issueDialog, setIssueDialog] = useState<IssueRecord | null>(null);
  const [actualQty, setActualQty] = useState(0);

  const openIssue = (record: IssueRecord) => {
    setIssueDialog(record);
    setActualQty(record.quantity);
  };

  const handleIssue = () => {
    if (issueDialog) {
      onIssueItem(issueDialog.id, actualQty);
      setIssueDialog(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <Package className="h-5 w-5" />Cần cấp phát ({readyItems.length})
        </h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nhân viên</TableHead>
              <TableHead>Vật tư</TableHead>
              <TableHead>SL định mức</TableHead>
              <TableHead>Tháng</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {readyItems.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Không có đồ cần phát</TableCell></TableRow>
            ) : readyItems.map(r => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.employeeName}</TableCell>
                <TableCell>{r.ppeName}</TableCell>
                <TableCell>{r.quantity}</TableCell>
                <TableCell>{r.month}</TableCell>
                <TableCell>
                  <Button size="sm" onClick={() => openIssue(r)}>
                    <Package className="mr-1 h-3 w-3" />Cấp phát
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Đã cấp phát</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nhân viên</TableHead>
              <TableHead>Vật tư</TableHead>
              <TableHead>SL thực nhận</TableHead>
              <TableHead>Ngày cấp</TableHead>
              <TableHead>Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {issuedItems.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Chưa có</TableCell></TableRow>
            ) : issuedItems.map(r => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.employeeName}</TableCell>
                <TableCell>{r.ppeName}</TableCell>
                <TableCell>
                  {r.actualQuantity}
                  {r.actualQuantity < r.quantity && (
                    <span className="ml-1 text-xs text-orange-500 inline-flex items-center"><AlertTriangle className="h-3 w-3 mr-0.5" />Thiếu</span>
                  )}
                </TableCell>
                <TableCell>{r.issuedAt ? new Date(r.issuedAt).toLocaleDateString('vi-VN') : '-'}</TableCell>
                <TableCell><StatusBadge status={r.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Issue dialog */}
      <Dialog open={!!issueDialog} onOpenChange={() => setIssueDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Cấp phát bảo hộ</DialogTitle></DialogHeader>
          {issueDialog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Nhân viên:</span><span className="font-medium">{issueDialog.employeeName}</span>
                <span className="text-muted-foreground">Vật tư:</span><span className="font-medium">{issueDialog.ppeName}</span>
                <span className="text-muted-foreground">SL định mức:</span><span className="font-medium">{issueDialog.quantity}</span>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Số lượng thực cấp</label>
                <Input type="number" min={0} max={issueDialog.quantity} value={actualQty} onChange={e => setActualQty(Number(e.target.value))} />
                {actualQty < issueDialog.quantity && actualQty > 0 && (
                  <p className="text-xs text-orange-500 mt-1 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />Cấp thiếu — phần còn lại sẽ ghi backlog
                  </p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIssueDialog(null)}>Hủy</Button>
            <Button onClick={handleIssue} disabled={actualQty <= 0}>Xác nhận cấp</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
