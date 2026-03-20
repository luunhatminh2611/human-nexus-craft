import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from './StatusBadge';
import type { PPEItem, IssueRecord, ReplacementRequest, PPEStatus } from '../data/mockData';
import { Check, X } from 'lucide-react';

interface AdminTabProps {
  ppeItems: PPEItem[];
  issueRecords: IssueRecord[];
  replacementRequests: ReplacementRequest[];
  onUpdatePPEStatus: (id: number, status: PPEStatus) => void;
  onUpdateIssueStatus: (ids: number[], status: PPEStatus) => void;
  onUpdateReplacementStatus: (id: number, status: PPEStatus) => void;
}

export function AdminTab({
  ppeItems, issueRecords, replacementRequests,
  onUpdatePPEStatus, onUpdateIssueStatus, onUpdateReplacementStatus,
}: AdminTabProps) {
  const pendingPPE = ppeItems.filter(i => i.status === 'Pending_Admin');
  const pendingIssues = issueRecords.filter(r => r.status === 'Pending_Admin');
  const pendingReplacements = replacementRequests.filter(r => r.status === 'Pending_Admin');

  return (
    <Tabs defaultValue="ppe" className="space-y-4">
      <TabsList>
        <TabsTrigger value="ppe">Duyệt PPE ({pendingPPE.length})</TabsTrigger>
        <TabsTrigger value="issues">Duyệt cấp phát ({pendingIssues.length})</TabsTrigger>
        <TabsTrigger value="replacements">Duyệt cấp đổi ({pendingReplacements.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="ppe" className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>SL</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingPPE.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Không có PPE chờ duyệt</TableCell></TableRow>
            ) : pendingPPE.map(item => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.type}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell><div className="flex flex-wrap gap-1">{item.applicableRoles.map(r => <span key={r} className="rounded bg-muted px-1.5 py-0.5 text-xs">{r}</span>)}</div></TableCell>
                <TableCell><StatusBadge status={item.status} /></TableCell>
                <TableCell className="flex gap-2">
                  <Button size="sm" onClick={() => onUpdatePPEStatus(item.id, 'Approved')}><Check className="mr-1 h-3 w-3" />Duyệt</Button>
                  <Button size="sm" variant="destructive" onClick={() => onUpdatePPEStatus(item.id, 'Rejected')}><X className="mr-1 h-3 w-3" />Từ chối</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TabsContent>

      <TabsContent value="issues" className="space-y-4">
        <div className="flex justify-end">
          {pendingIssues.length > 0 && (
            <Button size="sm" onClick={() => onUpdateIssueStatus(pendingIssues.map(r => r.id), 'Ready_To_Issue')}>
              <Check className="mr-1 h-4 w-4" />Duyệt tất cả ({pendingIssues.length})
            </Button>
          )}
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nhân viên</TableHead>
              <TableHead>Vật tư</TableHead>
              <TableHead>SL</TableHead>
              <TableHead>Tháng</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingIssues.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Không có bản ghi chờ duyệt</TableCell></TableRow>
            ) : pendingIssues.map(r => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.employeeName}</TableCell>
                <TableCell>{r.ppeName}</TableCell>
                <TableCell>{r.quantity}</TableCell>
                <TableCell>{r.month}</TableCell>
                <TableCell><StatusBadge status={r.status} /></TableCell>
                <TableCell className="flex gap-2">
                  <Button size="sm" onClick={() => onUpdateIssueStatus([r.id], 'Ready_To_Issue')}><Check className="h-3 w-3" /></Button>
                  <Button size="sm" variant="destructive" onClick={() => onUpdateIssueStatus([r.id], 'Rejected')}><X className="h-3 w-3" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TabsContent>

      <TabsContent value="replacements" className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nhân viên</TableHead>
              <TableHead>Vật tư</TableHead>
              <TableHead>Lý do</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingReplacements.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Không có yêu cầu chờ duyệt</TableCell></TableRow>
            ) : pendingReplacements.map(r => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.employeeName}</TableCell>
                <TableCell>{r.ppeName}</TableCell>
                <TableCell>{r.reason}{r.reasonDetail ? `: ${r.reasonDetail}` : ''}</TableCell>
                <TableCell><StatusBadge status={r.status} /></TableCell>
                <TableCell className="flex gap-2">
                  <Button size="sm" onClick={() => onUpdateReplacementStatus(r.id, 'Ready_To_Issue')}><Check className="mr-1 h-3 w-3" />Duyệt</Button>
                  <Button size="sm" variant="destructive" onClick={() => onUpdateReplacementStatus(r.id, 'Rejected')}><X className="mr-1 h-3 w-3" />Từ chối</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TabsContent>
    </Tabs>
  );
}
