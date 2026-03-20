import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from './StatusBadge';
import type { PPEItem, IssueRecord, ReplacementRequest, PPEStatus, PPEType, Employee } from '../data/mockData';
import { Plus, Send, FileDown, RefreshCw } from 'lucide-react';

interface ManagerTabProps {
  ppeItems: PPEItem[];
  issueRecords: IssueRecord[];
  replacementRequests: ReplacementRequest[];
  employees: Employee[];
  allRoles: string[];
  onAddPPE: (item: Omit<PPEItem, 'id' | 'status'>, asDraft: boolean) => void;
  onUpdatePPEStatus: (id: number, status: PPEStatus) => void;
  onGenerateMonthly: (month: string) => void;
  onUpdateIssueStatus: (ids: number[], status: PPEStatus) => void;
  onUpdateReplacementStatus: (id: number, status: PPEStatus) => void;
}

export function ManagerTab({
  ppeItems, issueRecords, replacementRequests, employees, allRoles,
  onAddPPE, onUpdatePPEStatus, onGenerateMonthly, onUpdateIssueStatus, onUpdateReplacementStatus,
}: ManagerTabProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<PPEType>('monthly');
  const [formQty, setFormQty] = useState(1);
  const [formRoles, setFormRoles] = useState<string[]>([]);
  const [issueMonth, setIssueMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedIssues, setSelectedIssues] = useState<number[]>([]);
  const [filterMonth, setFilterMonth] = useState(issueMonth);

  const resetForm = () => { setFormName(''); setFormType('monthly'); setFormQty(1); setFormRoles([]); };

  const handleSubmitPPE = (asDraft: boolean) => {
    if (!formName.trim() || formRoles.length === 0) return;
    onAddPPE({ name: formName, type: formType, quantity: formQty, applicableRoles: formRoles }, asDraft);
    resetForm();
    setShowAddForm(false);
  };

  const filteredIssues = issueRecords.filter(r => r.month === filterMonth);
  const pendingReplacements = replacementRequests.filter(r => r.status === 'Pending_Manager');

  const toggleIssue = (id: number) => {
    setSelectedIssues(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  const selectableIssues = filteredIssues.filter(r => r.status === 'Draft');
  const toggleAll = () => {
    if (selectedIssues.length === selectableIssues.length) setSelectedIssues([]);
    else setSelectedIssues(selectableIssues.map(r => r.id));
  };

  // Monthly report
  const reportData = {
    total: filteredIssues.length,
    issued: filteredIssues.filter(r => ['Issued', 'Completed'].includes(r.status)).length,
    pending: filteredIssues.filter(r => !['Issued', 'Completed', 'Rejected'].includes(r.status)).length,
  };

  return (
    <Tabs defaultValue="ppe-list" className="space-y-4">
      <TabsList>
        <TabsTrigger value="ppe-list">Danh mục PPE</TabsTrigger>
        <TabsTrigger value="issue-list">Cấp phát</TabsTrigger>
        <TabsTrigger value="replacement">Cấp đổi ({pendingReplacements.length})</TabsTrigger>
        <TabsTrigger value="report">Báo cáo</TabsTrigger>
      </TabsList>

      {/* PPE MASTER */}
      <TabsContent value="ppe-list" className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-foreground">Danh mục bảo hộ lao động</h2>
          <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="mr-1 h-4 w-4" />Thêm vật tư</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Thêm vật tư bảo hộ</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Tên vật tư <span className="text-destructive">*</span></label>
                  <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="VD: Mũ bảo hộ" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Loại cấp</label>
                  <Select value={formType} onValueChange={v => setFormType(v as PPEType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Hàng tháng</SelectItem>
                      <SelectItem value="yearly">Hàng năm</SelectItem>
                      <SelectItem value="job-based">Theo công việc</SelectItem>
                      <SelectItem value="on-demand">Theo yêu cầu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Số lượng định mức</label>
                  <Input type="number" min={1} value={formQty} onChange={e => setFormQty(Number(e.target.value))} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Áp dụng cho role <span className="text-destructive">*</span></label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {allRoles.map(role => (
                      <label key={role} className="flex items-center gap-1.5 text-sm text-foreground">
                        <Checkbox
                          checked={formRoles.includes(role)}
                          onCheckedChange={checked => {
                            setFormRoles(prev => checked ? [...prev, role] : prev.filter(r => r !== role));
                          }}
                        />
                        {role}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => handleSubmitPPE(true)}>Lưu nháp</Button>
                <Button onClick={() => handleSubmitPPE(false)}><Send className="mr-1 h-4 w-4" />Gửi duyệt</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>SL</TableHead>
              <TableHead>Áp dụng</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ppeItems.map(item => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.type === 'monthly' ? 'Tháng' : item.type === 'yearly' ? 'Năm' : item.type === 'job-based' ? 'Công việc' : 'Yêu cầu'}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {item.applicableRoles.map(r => (
                      <span key={r} className="rounded bg-muted px-1.5 py-0.5 text-xs">{r}</span>
                    ))}
                  </div>
                </TableCell>
                <TableCell><StatusBadge status={item.status} /></TableCell>
                <TableCell>
                  {item.status === 'Draft' && (
                    <Button size="sm" variant="outline" onClick={() => onUpdatePPEStatus(item.id, 'Pending_Admin')}>
                      <Send className="mr-1 h-3 w-3" />Gửi duyệt
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TabsContent>

      {/* ISSUE LIST */}
      <TabsContent value="issue-list" className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-foreground">Tháng:</label>
            <Input type="month" value={issueMonth} onChange={e => setIssueMonth(e.target.value)} className="w-40" />
            <Button size="sm" onClick={() => onGenerateMonthly(issueMonth)}>
              <RefreshCw className="mr-1 h-4 w-4" />Tạo cấp phát
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-foreground">Lọc:</label>
            <Input type="month" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="w-40" />
          </div>
          {selectedIssues.length > 0 && (
            <Button size="sm" onClick={() => { onUpdateIssueStatus(selectedIssues, 'Pending_Admin'); setSelectedIssues([]); }}>
              <Send className="mr-1 h-4 w-4" />Gửi Admin ({selectedIssues.length})
            </Button>
          )}
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox checked={selectableIssues.length > 0 && selectedIssues.length === selectableIssues.length} onCheckedChange={toggleAll} />
              </TableHead>
              <TableHead>Nhân viên</TableHead>
              <TableHead>Vật tư</TableHead>
              <TableHead>SL</TableHead>
              <TableHead>Tháng</TableHead>
              <TableHead>Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredIssues.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Chưa có bản ghi cấp phát</TableCell></TableRow>
            ) : filteredIssues.map(r => (
              <TableRow key={r.id}>
                <TableCell>
                  {r.status === 'Draft' && <Checkbox checked={selectedIssues.includes(r.id)} onCheckedChange={() => toggleIssue(r.id)} />}
                </TableCell>
                <TableCell className="font-medium">{r.employeeName}</TableCell>
                <TableCell>{r.ppeName}</TableCell>
                <TableCell>{r.quantity}</TableCell>
                <TableCell>{r.month}</TableCell>
                <TableCell><StatusBadge status={r.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TabsContent>

      {/* REPLACEMENT REQUESTS */}
      <TabsContent value="replacement" className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Yêu cầu cấp đổi từ nhân viên</h2>
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
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Không có yêu cầu</TableCell></TableRow>
            ) : pendingReplacements.map(r => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.employeeName}</TableCell>
                <TableCell>{r.ppeName}</TableCell>
                <TableCell>{r.reason}{r.reasonDetail ? `: ${r.reasonDetail}` : ''}</TableCell>
                <TableCell><StatusBadge status={r.status} /></TableCell>
                <TableCell className="flex gap-2">
                  <Button size="sm" onClick={() => onUpdateReplacementStatus(r.id, 'Pending_Admin')}>Duyệt</Button>
                  <Button size="sm" variant="destructive" onClick={() => onUpdateReplacementStatus(r.id, 'Rejected')}>Từ chối</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TabsContent>

      {/* REPORT */}
      <TabsContent value="report" className="space-y-4">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-foreground">Tháng:</label>
          <Input type="month" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="w-40" />
          <Button size="sm" variant="outline"><FileDown className="mr-1 h-4 w-4" />Xuất báo cáo</Button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Tổng cấp phát', value: reportData.total, color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' },
            { label: 'Đã nhận', value: reportData.issued, color: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' },
            { label: 'Chưa nhận', value: reportData.pending, color: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' },
          ].map(s => (
            <div key={s.label} className={`rounded-lg p-4 ${s.color}`}>
              <p className="text-sm font-medium">{s.label}</p>
              <p className="text-3xl font-bold mt-1">{s.value}</p>
            </div>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
}
