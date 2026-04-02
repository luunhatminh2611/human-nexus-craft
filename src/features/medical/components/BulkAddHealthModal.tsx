// components/BulkAddHealthModal.tsx
import { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/shared/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/shared/components/ui/dialog';
import { Textarea } from '@/shared/components/ui/textarea';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/shared/components/tables/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { Button } from '@/shared/components/ui/button/Button2';
import { toast } from '@/shared/hooks/use-toast';
import {
  Loader2, X, Plus, Download, Upload, Copy,
  ChevronDown, ChevronUp, Maximize2, Minimize2, Activity,
} from 'lucide-react';
import { routineHealthCheckApi } from '../api/medicalApi';
import type { HealthRecord } from './MedicalFormModal';

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const num = (v: string) => {
  if (v === '' || v === null || v === undefined) return undefined;
  const n = Number(v);
  return isNaN(n) ? undefined : n;
};

// ─── Column definitions ───────────────────────────────────────────────────────

const REQUIRED_COLS = [
  { key: 'employeeId', label: 'Mã NV *' },
  { key: 'ngayKham',   label: 'Ngày khám *' },
];

const OPTIONAL_COLS = [
  // Thông tin chung
  { key: 'donVi',              label: 'Đơn vị',            group: 'Thông tin chung' },
  { key: 'chieuCao',           label: 'Chiều cao (cm)',     group: 'Thông tin chung' },
  { key: 'canNang',            label: 'Cân nặng (kg)',      group: 'Thông tin chung' },
  { key: 'mach',               label: 'Mạch',               group: 'Thông tin chung' },
  { key: 'huyetAp',            label: 'Huyết áp',           group: 'Thông tin chung' },
  { key: 'nhomMau',            label: 'Nhóm máu',           group: 'Thông tin chung' },
  { key: 'plTheLuc',           label: 'PL Thể lực',         group: 'Thông tin chung' },
  { key: 'plSucKhoe',          label: 'PL Sức khỏe',        group: 'Thông tin chung' },
  { key: 'phanLoaiNgheNghiep', label: 'PL Nghề nghiệp',     group: 'Thông tin chung' },
  // Sinh hóa máu
  { key: 'wbc',         label: 'WBC',         group: 'Xét nghiệm máu' },
  { key: 'rbc',         label: 'RBC',         group: 'Xét nghiệm máu' },
  { key: 'hgb',         label: 'HGB',         group: 'Xét nghiệm máu' },
  { key: 'plt',         label: 'PLT',         group: 'Xét nghiệm máu' },
  { key: 'vss',         label: 'VSS',         group: 'Xét nghiệm máu' },
  { key: 'hba1c',       label: 'HbA1c',       group: 'Xét nghiệm máu' },
  { key: 'glucoza',     label: 'Glucoza',      group: 'Xét nghiệm máu' },
  { key: 'ure',         label: 'Ure',          group: 'Xét nghiệm máu' },
  { key: 'creatinin',   label: 'Creatinin',    group: 'Xét nghiệm máu' },
  { key: 'auric',       label: 'A. Uric',      group: 'Xét nghiệm máu' },
  { key: 'cholesterol', label: 'Cholesterol',  group: 'Xét nghiệm máu' },
  { key: 'triglycerid', label: 'Triglycerid',  group: 'Xét nghiệm máu' },
  { key: 'hdl',         label: 'HDL',          group: 'Xét nghiệm máu' },
  { key: 'ldl',         label: 'LDL',          group: 'Xét nghiệm máu' },
  { key: 'got',         label: 'GOT',          group: 'Xét nghiệm máu' },
  { key: 'gpt',         label: 'GPT',          group: 'Xét nghiệm máu' },
  { key: 'ggt',         label: 'GGT',          group: 'Xét nghiệm máu' },
  // Kết luận
  { key: 'plSucKhoe',       label: 'PL Sức khỏe',      group: 'Kết luận' },
  { key: 'moTaKetLuan',     label: 'Mô tả kết luận',   group: 'Kết luận' },
  { key: 'huongGiaiQuyet',  label: 'Hướng giải quyết', group: 'Kết luận' },
  { key: 'nguoiKetLuan',    label: 'Người kết luận',   group: 'Kết luận' },
];

// deduplicate by key
const UNIQUE_OPTIONAL_COLS = OPTIONAL_COLS.filter(
  (col, idx, self) => self.findIndex(c => c.key === col.key) === idx,
);

const DEFAULT_VISIBLE = new Set([
  'donVi', 'mach', 'huyetAp', 'plSucKhoe', 'moTaKetLuan',
]);

// ─── Empty record factory ──────────────────────────────────────────────────────

const createEmpty = (id: number): Partial<HealthRecord> & { _tid: number } => ({
  _tid: id,
  employeeId: undefined,
  ngayKham: new Date().toISOString().slice(0, 10),
  donVi: '',
  chieuCao: undefined, canNang: undefined,
  mach: undefined, huyetAp: '', nhomMau: '',
  plTheLuc: undefined, plSucKhoe: undefined, phanLoaiNgheNghiep: undefined,
  wbc: undefined, rbc: undefined, hgb: undefined, plt: undefined,
  vss: undefined, hba1c: undefined, glucoza: undefined, ure: undefined,
  creatinin: undefined, auric: undefined, cholesterol: undefined,
  triglycerid: undefined, hdl: undefined, ldl: undefined,
  got: undefined, gpt: undefined, ggt: undefined,
  moTaKetLuan: '', huongGiaiQuyet: '', nguoiKetLuan: '',
  xuTriDt: false, xuTriTd: false, xuTriCk: false,
  hbsag: false, hav: false, hcv: false, hev: false, hpylori: false,
  nldTiepXucYeuToCoHai: false, biTaiNanLaoDong: false,
});

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function BulkAddHealthModal({ isOpen, onClose, onSuccess }: Props) {
  const queryClient = useQueryClient();
  type Row = ReturnType<typeof createEmpty>;

  const [rows, setRows]               = useState<Row[]>([]);
  const [nextId, setNextId]           = useState(1);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode]       = useState<'table' | 'expanded'>('table');
  const [visibleCols, setVisibleCols] = useState<Set<string>>(DEFAULT_VISIBLE);
  const fileInputRef                  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && rows.length === 0) addRow();
  }, [isOpen]);

  // ── Mutations ──────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (payload: Partial<HealthRecord>[]) => routineHealthCheckApi.create(payload as any),
    onSuccess: () => {
      toast({ title: `Đã thêm ${rows.length} lượt khám` });
      queryClient.invalidateQueries({ queryKey: ['health-records'] });
      onSuccess();
    },
    onError: () => toast({ title: 'Lỗi khi lưu', variant: 'destructive' }),
  });

  // ── Row helpers ────────────────────────────────────────────────────────────
  const addRow = () => {
    setRows(p => [...p, createEmpty(nextId)]);
    setNextId(p => p + 1);
  };

  const removeRow = (tid: number) =>
    setRows(p => p.filter(r => r._tid !== tid));

  const copyRow = (tid: number) => {
    const src = rows.find(r => r._tid === tid);
    if (!src) return;
    const newRow: Row = { ...src, _tid: nextId, employeeId: undefined };
    setRows(p => [...p, newRow]);
    setNextId(p => p + 1);
    toast({ title: 'Đã sao chép dòng' });
  };

  const setField = (tid: number, key: string, value: any) =>
    setRows(p => p.map(r => r._tid === tid ? { ...r, [key]: value } : r));

  const toggleExpand = (tid: number) =>
    setExpandedRows(p => {
      const s = new Set(p);
      s.has(tid) ? s.delete(tid) : s.add(tid);
      return s;
    });

  const toggleCol = (key: string) =>
    setVisibleCols(p => {
      const s = new Set(p);
      s.has(key) ? s.delete(key) : s.add(key);
      return s;
    });

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (rows.length === 0) {
      toast({ title: 'Vui lòng thêm ít nhất một lượt khám', variant: 'destructive' });
      return;
    }
    const invalid = rows.filter(r => !r.employeeId || !r.ngayKham);
    if (invalid.length > 0) {
      toast({ title: `${invalid.length} dòng thiếu Mã NV hoặc Ngày khám`, variant: 'destructive' });
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const payload = rows.map(({ _tid, ...rest }) => rest);
    createMutation.mutate(payload);
  };

  const handleClose = () => {
    setRows([]);
    setNextId(1);
    setExpandedRows(new Set());
    onClose();
  };

  // ── Export Excel ───────────────────────────────────────────────────────────
  const handleExport = async () => {
    try {
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Khám sức khỏe');
      const headers = [
        'Mã NV *', 'Ngày khám *', 'Đơn vị', 'Chiều cao', 'Cân nặng',
        'Mạch', 'Huyết áp', 'Nhóm máu', 'PL Thể lực', 'PL Sức khỏe', 'PL Nghề nghiệp',
        'WBC', 'RBC', 'HGB', 'PLT', 'VSS', 'HbA1c',
        'Glucoza', 'Ure', 'Creatinin', 'A.Uric', 'Cholesterol', 'Triglycerid',
        'HDL', 'LDL', 'GOT', 'GPT', 'GGT',
        'Mô tả kết luận', 'Hướng giải quyết', 'Người kết luận',
      ];
      ws.addRow(headers);
      ws.getRow(1).font = { bold: true };
      ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
      ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

      rows.forEach(r => {
        ws.addRow([
          r.employeeId, r.ngayKham, r.donVi, r.chieuCao, r.canNang,
          r.mach, r.huyetAp, r.nhomMau, r.plTheLuc, r.plSucKhoe, r.phanLoaiNgheNghiep,
          r.wbc, r.rbc, r.hgb, r.plt, r.vss, r.hba1c,
          r.glucoza, r.ure, r.creatinin, r.auric, r.cholesterol, r.triglycerid,
          r.hdl, r.ldl, r.got, r.gpt, r.ggt,
          r.moTaKetLuan, r.huongGiaiQuyet, r.nguoiKetLuan,
        ]);
      });

      headers.forEach((_, i) => { ws.getColumn(i + 1).width = 16; });

      const buf = await wb.xlsx.writeBuffer();
      saveAs(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
        rows.length > 0 ? `Them_luot_kham_${new Date().toISOString().slice(0,10)}.xlsx` : 'Mau_luot_kham.xlsx');
      toast({ title: 'Đã tải xuống file' });
    } catch {
      toast({ title: 'Lỗi khi xuất file', variant: 'destructive' });
    }
  };

  // ── Import Excel ───────────────────────────────────────────────────────────
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(await file.arrayBuffer());
      const ws = wb.getWorksheet('Khám sức khỏe');
      if (!ws) throw new Error('Không tìm thấy sheet "Khám sức khỏe"');

      const imported: Row[] = [];
      let idCounter = nextId;

      ws.eachRow((row, rowNum) => {
        if (rowNum === 1) return;
        const g = (n: number) => {
          const v = row.getCell(n).value;
          return v != null ? String(v).trim() : '';
        };
        if (!g(1)) return;
        imported.push({
          _tid: idCounter++,
          employeeId: num(g(1)),
          ngayKham: g(2) || new Date().toISOString().slice(0,10),
          donVi: g(3),
          chieuCao: num(g(4)), canNang: num(g(5)),
          mach: num(g(6)), huyetAp: g(7), nhomMau: g(8),
          plTheLuc: num(g(9)), plSucKhoe: num(g(10)), phanLoaiNgheNghiep: num(g(11)),
          wbc: num(g(12)), rbc: num(g(13)), hgb: num(g(14)), plt: num(g(15)),
          vss: num(g(16)), hba1c: num(g(17)),
          glucoza: num(g(18)), ure: num(g(19)), creatinin: num(g(20)),
          auric: num(g(21)), cholesterol: num(g(22)), triglycerid: num(g(23)),
          hdl: num(g(24)), ldl: num(g(25)), got: num(g(26)), gpt: num(g(27)), ggt: num(g(28)),
          moTaKetLuan: g(29), huongGiaiQuyet: g(30), nguoiKetLuan: g(31),
          xuTriDt: false, xuTriTd: false, xuTriCk: false,
          hbsag: false, hav: false, hcv: false, hev: false, hpylori: false,
          nldTiepXucYeuToCoHai: false, biTaiNanLaoDong: false,
        });
      });

      setRows(p => [...p, ...imported]);
      setNextId(idCounter);
      toast({ title: `Đã nhập ${imported.length} dòng từ file` });
    } catch (err: any) {
      toast({ title: err.message || 'Lỗi khi đọc file', variant: 'destructive' });
    } finally {
      e.target.value = '';
    }
  };

  // ── Cell renderer ──────────────────────────────────────────────────────────
  const renderCell = (row: Row, key: string) => {
    const cls = 'h-8 text-sm w-full min-w-[120px]';

    // Number inputs
    if (['employeeId','chieuCao','canNang','mach','plTheLuc','plSucKhoe','phanLoaiNgheNghiep',
      'wbc','rbc','hgb','plt','vss','hba1c','glucoza','ure','creatinin','auric',
      'cholesterol','triglycerid','hdl','ldl','got','gpt','ggt'].includes(key)) {
      return (
        <Input type="number" step="0.01" className={cls}
          value={(row as any)[key] ?? ''}
          onChange={e => setField(row._tid, key, num(e.target.value))}
        />
      );
    }
    if (key === 'ngayKham') {
      return (
        <Input type="date" className={cls}
          value={(row as any)[key] ?? ''}
          onChange={e => setField(row._tid, key, e.target.value)}
        />
      );
    }
    if (key === 'nhomMau') {
      return (
        <Select value={(row as any)[key] ?? ''} onValueChange={v => setField(row._tid, key, v)}>
          <SelectTrigger className={cls}><SelectValue placeholder="Chọn" /></SelectTrigger>
          <SelectContent>
            {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => (
              <SelectItem key={b} value={b}>{b}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    // text fallback
    return (
      <Input className={cls}
        value={(row as any)[key] ?? ''}
        onChange={e => setField(row._tid, key, e.target.value)}
        placeholder="..."
      />
    );
  };

  // ── Expanded card ──────────────────────────────────────────────────────────
  const renderExpanded = (row: Row, index: number) => (
    <div key={row._tid} className="border rounded-lg p-4 space-y-4 bg-muted/30">
      <div className="flex items-center justify-between border-b pb-2">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
            {index + 1}
          </span>
          {row.employeeId ? `NV #${row.employeeId}` : 'Lượt khám mới'}
        </h4>
        <Button variant="ghost" size="sm" onClick={() => removeRow(row._tid)}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">Thông tin chung</TabsTrigger>
          <TabsTrigger value="clinical">Lâm sàng</TabsTrigger>
          <TabsTrigger value="lab">Xét nghiệm</TabsTrigger>
          <TabsTrigger value="conclusion">Kết luận</TabsTrigger>
        </TabsList>

        {/* Tab 1 — Thông tin chung */}
        <TabsContent value="general">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
            {([
              ['employeeId','Mã NV *','number'],['ngayKham','Ngày khám *','date'],
              ['donVi','Đơn vị','text'],['nhomMau','Nhóm máu','blood'],
              ['chieuCao','Chiều cao (cm)','number'],['canNang','Cân nặng (kg)','number'],
              ['mach','Mạch (lần/phút)','number'],['huyetAp','Huyết áp','text'],
            ] as [keyof HealthRecord, string, string][]).map(([k, l, t]) => (
              <div key={k} className="space-y-1">
                <Label className="text-xs">{l}</Label>
                {t === 'blood' ? (
                  <Select value={(row as any)[k] ?? ''} onValueChange={v => setField(row._tid, k, v)}>
                    <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Chọn" /></SelectTrigger>
                    <SelectContent>
                      {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input type={t} value={(row as any)[k] ?? ''} className="h-8 text-sm"
                    onChange={e => setField(row._tid, k, t === 'number' ? num(e.target.value) : e.target.value)} />
                )}
              </div>
            ))}
            {([
              ['plTheLuc','PL Thể lực'],['plSucKhoe','PL Sức khỏe'],['phanLoaiNgheNghiep','PL Nghề nghiệp'],
            ] as [keyof HealthRecord, string][]).map(([k, l]) => (
              <div key={k} className="space-y-1">
                <Label className="text-xs">{l}</Label>
                <Select value={(row as any)[k]?.toString() ?? ''}
                  onValueChange={v => setField(row._tid, k, num(v))}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Loại" /></SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5].map(i => <SelectItem key={i} value={String(i)}>Loại {i}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          {/* Checkboxes TNLĐ */}
          <div className="flex flex-wrap gap-4 mt-3">
            {([
              ['nldTiepXucYeuToCoHai','Tiếp xúc yếu tố có hại'],
              ['biTaiNanLaoDong','Bị tai nạn lao động'],
            ] as [keyof HealthRecord, string][]).map(([k, l]) => (
              <label key={k} className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={Boolean((row as any)[k])}
                  onCheckedChange={v => setField(row._tid, k, v)} />
                <span className="text-sm">{l}</span>
              </label>
            ))}
          </div>
        </TabsContent>

        {/* Tab 2 — Lâm sàng */}
        <TabsContent value="clinical">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
            {([
              ['khamTuanHoan','Tuần hoàn','plKhamTuanHoan'],
              ['khamHoHap','Hô hấp','plKhamHoHap'],
              ['khamTieuHoa','Tiêu hóa','plKhamTieuHoa'],
              ['khamThanTietNieu','Thận - Tiết niệu','plKhamThanTietNieu'],
              ['khamNoiTiet','Nội tiết','plKhamNoiTiet'],
              ['khamCoXuongKhop','Cơ - Xương - Khớp','plKhamCxk'],
              ['khamThanKinh','Thần kinh','plKhamThanKinh'],
              ['khamTamThan','Tâm thần','plKhamTamThan'],
              ['khamNgoai','Ngoại khoa','plKhamNgoai'],
              ['khamDaLieu','Da liễu','plKhamDaLieu'],
              ['khamMat','Mắt','plKhamMat'],
              ['khamTaiMuiHong','Tai Mũi Họng','plKhamTmh'],
              ['khamRangHamMat','Răng Hàm Mặt','plKhamRhm'],
            ] as [keyof HealthRecord, string, keyof HealthRecord][]).map(([vk, label, pk]) => (
              <div key={vk} className="grid grid-cols-3 gap-1 col-span-1">
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">{label}</Label>
                  <Input value={(row as any)[vk] ?? ''} className="h-8 text-sm"
                    onChange={e => setField(row._tid, vk, e.target.value)} placeholder="Mô tả..." />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">PL</Label>
                  <Select value={(row as any)[pk]?.toString() ?? ''}
                    onValueChange={v => setField(row._tid, pk, num(v))}>
                    <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="-" /></SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5].map(i => <SelectItem key={i} value={String(i)}>{i}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Tab 3 — Xét nghiệm */}
        <TabsContent value="lab">
          <div className="space-y-4 mt-3">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Công thức máu</p>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {([['wbc','WBC'],['rbc','RBC'],['hgb','HGB'],['plt','PLT'],['vss','VSS'],['hba1c','HbA1c']] as [keyof HealthRecord,string][]).map(([k,l]) => (
                  <div key={k} className="space-y-1">
                    <Label className="text-xs">{l}</Label>
                    <Input type="number" step="0.01" value={(row as any)[k] ?? ''} className="h-8 text-sm"
                      onChange={e => setField(row._tid, k, num(e.target.value))} />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Sinh hóa máu</p>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                {([
                  ['glucoza','Glucoza'],['ure','Ure'],['creatinin','Creatinin'],['auric','A.Uric'],
                  ['cholesterol','Cholesterol'],['triglycerid','Triglycerid'],['hdl','HDL'],
                  ['ldl','LDL'],['got','GOT'],['gpt','GPT'],['ggt','GGT'],
                  ['albumin','Albumin'],['bilirubinTp','Bili TP'],['bilirubinTt','Bili TT'],
                  ['ckmb','CKMB'],['canxi','Canxi'],
                ] as [keyof HealthRecord,string][]).map(([k,l]) => (
                  <div key={k} className="space-y-1">
                    <Label className="text-xs">{l}</Label>
                    <Input type="number" step="0.01" value={(row as any)[k] ?? ''} className="h-8 text-sm"
                      onChange={e => setField(row._tid, k, num(e.target.value))} />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Huyết thanh học</p>
              <div className="flex flex-wrap gap-4">
                {[['hbsag','HBsAg'],['hav','HAV'],['hcv','HCV'],['hev','HEV'],['hpylori','H.Pylori']].map(([k,l]: any) => (
                  <label key={k} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox checked={Boolean((row as any)[k])}
                      onCheckedChange={v => setField(row._tid, k, v)} />
                    <span className="text-sm">{l}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${(row as any)[k] ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                      {(row as any)[k] ? 'Dương tính' : 'Âm tính'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Nước tiểu</p>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                {([['ntLeu','Bạch cầu'],['ntNit','Nitrite'],['ntPro','Protein'],['ntEry','Hồng cầu'],['ntGlu','Glucose'],['ntKet','Ketone'],['ntBil','Bilirubin'],['ntUbg','UBG']] as [keyof HealthRecord,string][]).map(([k,l]) => (
                  <div key={k} className="space-y-1">
                    <Label className="text-xs">{l}</Label>
                    <Input value={(row as any)[k] ?? ''} className="h-8 text-sm"
                      onChange={e => setField(row._tid, k, e.target.value)} placeholder="Âm/Dương" />
                  </div>
                ))}
                <div className="space-y-1">
                  <Label className="text-xs">pH</Label>
                  <Input type="number" step="0.1" value={(row as any).ntPh ?? ''} className="h-8 text-sm"
                    onChange={e => setField(row._tid, 'ntPh', num(e.target.value))} />
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Chẩn đoán hình ảnh</p>
              <div className="grid grid-cols-2 gap-2">
                {([
                  ['sieuAmOBung','Siêu âm ổ bụng'],['saTuyenGiap','SA tuyến giáp'],
                  ['saTim','SA tim'],['xquangTimPhoi','X-quang tim phổi'],
                  ['dienTim','Điện tim'],['chucNangHoHap','Chức năng hô hấp'],
                ] as [keyof HealthRecord,string][]).map(([k,l]) => (
                  <div key={k} className="space-y-1">
                    <Label className="text-xs">{l}</Label>
                    <Input value={(row as any)[k] ?? ''} className="h-8 text-sm"
                      onChange={e => setField(row._tid, k, e.target.value)} placeholder="Kết quả..." />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab 4 — Kết luận */}
        <TabsContent value="conclusion">
          <div className="space-y-3 mt-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Kết quả CLS</Label>
                <Input value={(row as any).ketQuaCls ?? ''} className="h-8 text-sm"
                  onChange={e => setField(row._tid, 'ketQuaCls', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Người kết luận</Label>
                <Input value={(row as any).nguoiKetLuan ?? ''} className="h-8 text-sm"
                  onChange={e => setField(row._tid, 'nguoiKetLuan', e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Mô tả kết luận</Label>
              <Textarea rows={2} value={(row as any).moTaKetLuan ?? ''}
                onChange={e => setField(row._tid, 'moTaKetLuan', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Hướng giải quyết</Label>
              <Textarea rows={2} value={(row as any).huongGiaiQuyet ?? ''}
                onChange={e => setField(row._tid, 'huongGiaiQuyet', e.target.value)} />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Xử trí</p>
              <div className="flex gap-6">
                {([['xuTriDt','Điều trị (ĐT)'],['xuTriTd','Theo dõi (TD)'],['xuTriCk','Chuyển khoa (CK)'],['luuY','Lưu ý']] as [keyof HealthRecord,string][]).map(([k,l]) => (
                  <label key={k} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox checked={Boolean((row as any)[k])}
                      onCheckedChange={v => setField(row._tid, k, v)} />
                    <span className="text-sm">{l}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  // ── Column selector popover ────────────────────────────────────────────────
  const ColumnSelector = () => {
    const groups = UNIQUE_OPTIONAL_COLS.reduce((acc, col) => {
      if (!acc[col.group]) acc[col.group] = [];
      acc[col.group].push(col);
      return acc;
    }, {} as Record<string, typeof UNIQUE_OPTIONAL_COLS>);

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <ChevronDown className="h-4 w-4" />
            Tùy chỉnh cột ({visibleCols.size + REQUIRED_COLS.length}/{REQUIRED_COLS.length + UNIQUE_OPTIONAL_COLS.length})
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 max-h-80 overflow-y-auto">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold mb-1">Cột bắt buộc</p>
              {REQUIRED_COLS.map(c => (
                <div key={c.key} className="flex items-center gap-2 opacity-50 py-0.5">
                  <Checkbox checked disabled />
                  <span className="text-sm">{c.label}</span>
                </div>
              ))}
            </div>
            {Object.entries(groups).map(([g, cols]) => (
              <div key={g}>
                <p className="text-xs font-semibold mb-1">{g}</p>
                {cols.map(c => (
                  <div key={c.key} className="flex items-center gap-2 py-0.5 cursor-pointer"
                    onClick={() => toggleCol(c.key)}>
                    <Checkbox checked={visibleCols.has(c.key)} onCheckedChange={() => toggleCol(c.key)} />
                    <span className="text-sm">{c.label}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] w-full h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Thêm lượt khám hàng loạt
          </DialogTitle>
          <DialogDescription>
            Thêm nhiều lượt khám sức khỏe và lưu một lần. Có thể tải mẫu Excel để nhập liệu nhanh.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Toolbar */}
          <div className="px-6 py-3 border-b flex items-center justify-between bg-muted/30">
            <div className="flex items-center gap-2 flex-wrap">
              <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImport} />
              <Button size="sm" className="gap-2" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4" /> Tải lên
              </Button>
              <Button size="sm" className="gap-2" onClick={handleExport}>
                <Download className="h-4 w-4" /> Tải xuống
              </Button>
              <Button variant="outline" size="sm" className="gap-2"
                onClick={() => setViewMode(m => m === 'table' ? 'expanded' : 'table')}>
                {viewMode === 'table' ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                {viewMode === 'table' ? 'Mở rộng' : 'Thu gọn'}
              </Button>
              {viewMode === 'table' && <ColumnSelector />}
              <Button variant="outline" size="sm" className="gap-2" onClick={addRow}>
                <Plus className="h-4 w-4" /> Thêm dòng
              </Button>
            </div>
            <span className="text-sm text-muted-foreground">
              Tổng: <b>{rows.length}</b> lượt khám
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto px-6 py-4">
            {rows.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>Chưa có lượt khám nào. Nhấn <b>Thêm dòng</b> để bắt đầu.</p>
              </div>
            ) : viewMode === 'table' ? (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10 sticky left-0 bg-background z-10">#</TableHead>
                      <TableHead className="w-28 sticky left-10 bg-background z-10 text-center">Thao tác</TableHead>
                      {REQUIRED_COLS.map(c => (
                        <TableHead key={c.key} className="whitespace-nowrap">{c.label}</TableHead>
                      ))}
                      {UNIQUE_OPTIONAL_COLS.filter(c => visibleCols.has(c.key)).map(c => (
                        <TableHead key={c.key} className="whitespace-nowrap">{c.label}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row, idx) => (
                      <>
                        <TableRow key={row._tid}>
                          <TableCell className="sticky left-0 bg-background z-10 border-r font-medium">{idx + 1}</TableCell>
                          <TableCell className="sticky left-10 bg-background z-10 border-r">
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" onClick={() => toggleExpand(row._tid)}
                                title={expandedRows.has(row._tid) ? 'Thu gọn' : 'Mở rộng'}>
                                {expandedRows.has(row._tid) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => copyRow(row._tid)} title="Sao chép">
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => removeRow(row._tid)} title="Xóa">
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                          {REQUIRED_COLS.map(c => (
                            <TableCell key={c.key}>{renderCell(row, c.key)}</TableCell>
                          ))}
                          {UNIQUE_OPTIONAL_COLS.filter(c => visibleCols.has(c.key)).map(c => (
                            <TableCell key={c.key}>{renderCell(row, c.key)}</TableCell>
                          ))}
                        </TableRow>
                        {expandedRows.has(row._tid) && (
                          <TableRow key={`${row._tid}-exp`}>
                            <TableCell colSpan={2 + REQUIRED_COLS.length + UNIQUE_OPTIONAL_COLS.filter(c => visibleCols.has(c.key)).length}>
                              {renderExpanded(row, idx)}
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="space-y-4">
                {rows.map((row, idx) => renderExpanded(row, idx))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t">
          <div className="w-full flex justify-between items-center">
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} disabled={createMutation.isPending}>Hủy</Button>
              <Button onClick={handleSubmit} disabled={createMutation.isPending || rows.length === 0}
                className="bg-green-500 hover:bg-green-600 text-white">
                {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {createMutation.isPending ? 'Đang lưu...' : `Xác nhận (${rows.length})`}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}