import { useState, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Plus, Upload, Send, Check, X, Eye, Download, FileText, Search, Filter,
  ClipboardList, ShieldCheck, User, Trash2, Edit,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  medicalFieldGroups, type MedicalFieldDef,
} from "@/features/medical/data/medicalFields";
import {
  mockHealthRecords, type HealthCheckupRecord, type HealthCheckupStatus,
} from "@/features/medical/data/mockHealthRecords";

// ---- Helpers ----
const statusConfig: Record<HealthCheckupStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  Draft: { label: "Bản nháp", variant: "secondary" },
  Submitted: { label: "Chờ duyệt", variant: "default" },
  Approved: { label: "Đã duyệt", variant: "outline" },
  Rejected: { label: "Từ chối", variant: "destructive" },
};

function isExamined(value: any): boolean {
  return value !== null && value !== undefined && value !== "";
}

function StatusBadge({ status }: { status: HealthCheckupStatus }) {
  const cfg = statusConfig[status];
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

// ---- Field Renderer ----
function FieldInput({ field, value, onChange, readOnly }: {
  field: MedicalFieldDef; value: any; onChange: (v: any) => void; readOnly?: boolean;
}) {
  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={isExamined(value)}
          onChange={(e) => onChange(e.target.checked ? "x" : null)}
          disabled={readOnly}
          className="h-4 w-4 rounded border-input"
        />
        <span className="text-sm">{field.key}</span>
      </label>
    );
  }

  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">{field.key}</label>
      <Input
        type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
        value={value ?? ""}
        onChange={(e) => onChange(field.type === "number" ? (e.target.value ? Number(e.target.value) : null) : (e.target.value || null))}
        readOnly={readOnly}
        className="h-8 text-sm"
      />
    </div>
  );
}

// ---- Group Renderer ----
function FieldGroupSection({ group, data, onChange, readOnly }: {
  group: typeof medicalFieldGroups[0]; data: Record<string, any>; onChange?: (key: string, val: any) => void; readOnly?: boolean;
}) {
  const checkboxFields = group.fields.filter(f => f.type === "checkbox");
  const otherFields = group.fields.filter(f => f.type !== "checkbox");

  return (
    <div className={`rounded-lg border p-4 ${group.color}`}>
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <span>{group.icon}</span> {group.name}
        <Badge variant="outline" className="ml-auto text-xs">
          {group.fields.filter(f => isExamined(data[f.key])).length}/{group.fields.length} đã nhập
        </Badge>
      </h3>

      {otherFields.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-3">
          {otherFields.map((f) => (
            <FieldInput key={f.key} field={f} value={data[f.key]} onChange={(v) => onChange?.(f.key, v)} readOnly={readOnly} />
          ))}
        </div>
      )}

      {checkboxFields.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 pt-2 border-t border-dashed">
          {checkboxFields.map((f) => (
            <FieldInput key={f.key} field={f} value={data[f.key]} onChange={(v) => onChange?.(f.key, v)} readOnly={readOnly} />
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Detail Modal ----
function RecordDetailModal({ record, open, onClose }: {
  record: HealthCheckupRecord | null; open: boolean; onClose: () => void;
}) {
  if (!record) return null;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" /> Chi tiết khám sức khỏe - {record["Họ và tên"]}
          </DialogTitle>
          <DialogDescription>
            Ngày khám: {record["Ngày khám"]} | Trạng thái: {statusConfig[record.status].label}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {medicalFieldGroups.map((group) => (
            <FieldGroupSection key={group.name} group={group} data={record} readOnly />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---- Create/Edit Modal ----
function RecordFormModal({ record, open, onClose, onSave }: {
  record: HealthCheckupRecord | null; open: boolean; onClose: () => void;
  onSave: (data: HealthCheckupRecord) => void;
}) {
  const [formData, setFormData] = useState<Record<string, any>>(record ? { ...record } : { id: Date.now(), status: "Draft", createdBy: "Phạm Văn D (Trưởng phòng SX)", createdAt: new Date().toISOString().slice(0, 10) });
  const [activeGroup, setActiveGroup] = useState(0);

  const handleChange = (key: string, val: any) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{record ? "Chỉnh sửa" : "Tạo mới"} hồ sơ khám sức khỏe</DialogTitle>
          <DialogDescription>Điền thông tin khám sức khỏe định kỳ cho nhân viên</DialogDescription>
        </DialogHeader>

        {/* Group tabs */}
        <div className="flex flex-wrap gap-1 mb-4">
          {medicalFieldGroups.map((g, i) => (
            <Button
              key={g.name}
              variant={activeGroup === i ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveGroup(i)}
              className="text-xs"
            >
              {g.icon} {g.name}
            </Button>
          ))}
        </div>

        <FieldGroupSection
          group={medicalFieldGroups[activeGroup]}
          data={formData}
          onChange={handleChange}
        />

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={() => onSave(formData as HealthCheckupRecord)}>
            {record ? "Cập nhật" : "Lưu bản nháp"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---- Export Word Mock ----
function handleExportWord(record: HealthCheckupRecord) {
  const lines = [
    "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM",
    "Độc lập - Tự do - Hạnh phúc",
    "---",
    "",
    "PHIẾU KẾT QUẢ KHÁM SỨC KHỎE ĐỊNH KỲ",
    "",
    `Họ và tên: ${record["Họ và tên"] || ""}`,
    `Năm sinh: ${record["Năm sinh"] || ""}`,
    `Chức danh: ${record["Chức danh"] || ""}`,
    `Đơn vị: ${record["Đơn vị"] || ""}`,
    `Ngày khám: ${record["Ngày khám"] || ""}`,
    "",
    "--- THÔNG TIN SỨC KHỎE ---",
    `Chiều cao: ${record["Chiều cao"] || ""} cm`,
    `Cân nặng: ${record["Cân nặng"] || ""} kg`,
    `Huyết áp: ${record["Huyết áp"] || ""}`,
    `Nhóm máu: ${record["Nhóm máu"] || ""}`,
    "",
    "--- KẾT LUẬN ---",
    `Kết quả: ${record["Kết quả CLS"] || ""}`,
    `Kết luận: ${record["Mô tả Kết luận"] || ""}`,
    `Hướng giải quyết: ${record["Hướng giải quyết"] || ""}`,
    `Người kết luận: ${record["Người kết luận"] || ""}`,
  ];

  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `KhamSucKhoe_${record["Họ và tên"]?.replace(/\s/g, "_")}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

// ======================== MAIN PAGE ========================
export default function HealthManagement() {
  const { toast } = useToast();
  const [records, setRecords] = useState<HealthCheckupRecord[]>(mockHealthRecords);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Modals
  const [detailRecord, setDetailRecord] = useState<HealthCheckupRecord | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [editRecord, setEditRecord] = useState<HealthCheckupRecord | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Filtered records
  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchSearch = !searchTerm || r["Họ và tên"]?.toLowerCase().includes(searchTerm.toLowerCase()) || r["Mã BHXH"]?.includes(searchTerm);
      const matchMonth = filterMonth === "all" || r["Ngày khám"]?.startsWith(filterMonth);
      const matchStatus = filterStatus === "all" || r.status === filterStatus;
      return matchSearch && matchMonth && matchStatus;
    });
  }, [records, searchTerm, filterMonth, filterStatus]);

  // Stats
  const stats = useMemo(() => ({
    total: records.length,
    draft: records.filter(r => r.status === "Draft").length,
    submitted: records.filter(r => r.status === "Submitted").length,
    approved: records.filter(r => r.status === "Approved").length,
    rejected: records.filter(r => r.status === "Rejected").length,
  }), [records]);

  const handleSave = (data: HealthCheckupRecord) => {
    setRecords((prev) => {
      const idx = prev.findIndex(r => r.id === data.id);
      if (idx >= 0) return prev.map((r, i) => i === idx ? data : r);
      return [...prev, data];
    });
    setShowForm(false);
    setEditRecord(null);
    toast({ title: "Đã lưu hồ sơ khám sức khỏe" });
  };

  const handleSubmit = (id: number) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: "Submitted" as HealthCheckupStatus } : r));
    toast({ title: "Đã gửi hồ sơ cho Admin duyệt" });
  };

  const handleApprove = (id: number) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: "Approved" as HealthCheckupStatus } : r));
    toast({ title: "Đã duyệt hồ sơ" });
  };

  const handleReject = (id: number) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: "Rejected" as HealthCheckupStatus } : r));
    toast({ title: "Đã từ chối hồ sơ" });
  };

  const handleDelete = (id: number) => {
    setRecords(prev => prev.filter(r => r.id !== id));
    toast({ title: "Đã xóa hồ sơ" });
  };

  const handleImportExcel = () => {
    toast({ title: "Import Excel", description: "Chức năng import sẽ đọc file Excel 230 cột và tạo record tương ứng (mock)" });
    // Mock: add a new record
    const newRec: HealthCheckupRecord = {
      id: Date.now(),
      status: "Draft",
      createdBy: "Import Excel",
      createdAt: new Date().toISOString().slice(0, 10),
      "Mã BHXH": "9999999999",
      "Họ và tên": "Nguyễn Import",
      "Năm sinh": 1993,
      "Chức danh": "Công nhân",
      "Đơn vị": "Công ty CP ABC",
      "Ngày khám": "2026-03-15",
      "Chiều cao": 165,
      "Cân nặng": 60,
    };
    setRecords(prev => [...prev, newRec]);
  };

  // ---- Render records table ----
  const renderTable = (items: HealthCheckupRecord[], showActions: 'manager' | 'admin' | 'employee') => (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">#</TableHead>
            <TableHead>Họ và tên</TableHead>
            <TableHead>Mã BHXH</TableHead>
            <TableHead>Ngày khám</TableHead>
            <TableHead>Đơn vị</TableHead>
            <TableHead>PL Sức khỏe</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                Không có hồ sơ nào
              </TableCell>
            </TableRow>
          )}
          {items.map((r, i) => (
            <TableRow key={r.id}>
              <TableCell className="text-muted-foreground">{i + 1}</TableCell>
              <TableCell className="font-medium">{r["Họ và tên"]}</TableCell>
              <TableCell>{r["Mã BHXH"]}</TableCell>
              <TableCell>{r["Ngày khám"]}</TableCell>
              <TableCell className="text-sm">{r["Công trường/ Phân xưởng/ Phòng ban"]}</TableCell>
              <TableCell>
                {r["PL Sức khỏe"] && <Badge variant="outline">{r["PL Sức khỏe"]}</Badge>}
              </TableCell>
              <TableCell><StatusBadge status={r.status} /></TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="sm" onClick={() => { setDetailRecord(r); setShowDetail(true); }}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleExportWord(r)}>
                    <Download className="h-4 w-4" />
                  </Button>

                  {showActions === 'manager' && (
                    <>
                      {r.status === "Draft" && (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => { setEditRecord(r); setShowForm(true); }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleSubmit(r.id)}>
                            <Send className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                    </>
                  )}

                  {showActions === 'admin' && r.status === "Submitted" && (
                    <>
                      <Button variant="outline" size="sm" onClick={() => handleApprove(r.id)}>
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleReject(r.id)}>
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Quản lý khám sức khỏe định kỳ</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý quy trình khám sức khỏe định kỳ nhân viên với {medicalFieldGroups.reduce((s, g) => s + g.fields.length, 0)} trường dữ liệu
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Tổng hồ sơ", value: stats.total, color: "text-foreground" },
            { label: "Bản nháp", value: stats.draft, color: "text-muted-foreground" },
            { label: "Chờ duyệt", value: stats.submitted, color: "text-blue-600" },
            { label: "Đã duyệt", value: stats.approved, color: "text-green-600" },
            { label: "Từ chối", value: stats.rejected, color: "text-destructive" },
          ].map((s) => (
            <Card key={s.label} className="p-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên, mã BHXH..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterMonth} onValueChange={setFilterMonth}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Tháng khám" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả tháng</SelectItem>
              <SelectItem value="2026-01">01/2026</SelectItem>
              <SelectItem value="2026-02">02/2026</SelectItem>
              <SelectItem value="2026-03">03/2026</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="Draft">Bản nháp</SelectItem>
              <SelectItem value="Submitted">Chờ duyệt</SelectItem>
              <SelectItem value="Approved">Đã duyệt</SelectItem>
              <SelectItem value="Rejected">Từ chối</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="manager">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="manager" className="gap-1">
              <ClipboardList className="h-4 w-4" /> Trưởng phòng
            </TabsTrigger>
            <TabsTrigger value="admin" className="gap-1">
              <ShieldCheck className="h-4 w-4" /> Admin duyệt
            </TabsTrigger>
            <TabsTrigger value="employee" className="gap-1">
              <User className="h-4 w-4" /> Nhân viên xem
            </TabsTrigger>
          </TabsList>

          {/* Manager Tab */}
          <TabsContent value="manager" className="space-y-4">
            <div className="flex items-center gap-2">
              <Button onClick={() => { setEditRecord(null); setShowForm(true); }}>
                <Plus className="h-4 w-4 mr-1" /> Tạo hồ sơ mới
              </Button>
              <Button variant="outline" onClick={handleImportExcel}>
                <Upload className="h-4 w-4 mr-1" /> Import Excel
              </Button>
            </div>
            {renderTable(filtered, 'manager')}
          </TabsContent>

          {/* Admin Tab */}
          <TabsContent value="admin" className="space-y-4">
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">
                Có <span className="font-semibold text-blue-600">{stats.submitted}</span> hồ sơ đang chờ duyệt
              </p>
            </Card>
            {renderTable(filtered, 'admin')}
          </TabsContent>

          {/* Employee Tab */}
          <TabsContent value="employee" className="space-y-4">
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">
                Nhân viên chỉ xem được hồ sơ đã duyệt của mình
              </p>
            </Card>
            {renderTable(filtered.filter(r => r.status === "Approved"), 'employee')}
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <RecordDetailModal record={detailRecord} open={showDetail} onClose={() => setShowDetail(false)} />
      <RecordFormModal record={editRecord} open={showForm} onClose={() => { setShowForm(false); setEditRecord(null); }} onSave={handleSave} />
    </Layout>
  );
}
