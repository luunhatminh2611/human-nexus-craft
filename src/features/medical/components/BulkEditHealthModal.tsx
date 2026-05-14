// components/BulkEditHealthModal.tsx
import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem,
} from '@/shared/components/ui/command';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/shared/components/ui/popover';
import { Textarea } from '@/shared/components/ui/textarea';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/shared/components/tables/table';
import { Button } from '@/shared/components/ui/button/Button2';
import { toast } from '@/shared/hooks/use-toast';
import {
  Loader2, X, Download, Upload, ChevronDown, ChevronUp,
  Maximize2, Minimize2, Activity, Search, Check, ChevronsUpDown,
} from 'lucide-react';
import { routineHealthCheckApi } from '../api/medicalApi';
import type { HealthRecord } from './MedicalFormModal';
import { ALL_COLUMNS, OPTIONAL_COLS, REQUIRED_COLS, UNIQUE_OPTIONAL_COLS } from './BulkAddHealthModal';

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preSelectedIds?: number[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const num = (v: string) => {
  if (v === '' || v === null || v === undefined) return undefined;
  const n = Number(v);
  return isNaN(n) ? undefined : n;
};

const DEFAULT_VISIBLE = new Set([
  'donVi', 'mach', 'huyetAp', 'plSucKhoe', 'moTaKetLuan',
]);

// ─── Map API record → editable row ────────────────────────────────────────────

const mapRecord = (r: HealthRecord): HealthRecord & { _loaded: true } => ({
  ...r,
  _loaded: true,
} as any);

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function BulkEditHealthModal({
  isOpen, onClose, onSuccess, preSelectedIds = [],
}: Props) {
  const queryClient = useQueryClient();

  const [rows, setRows]               = useState<HealthRecord[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode]       = useState<'table' | 'expanded'>('table');
  const [visibleCols, setVisibleCols] = useState<Set<string>>(DEFAULT_VISIBLE);
  const [searchOpen, setSearchOpen]   = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const fileInputRef                  = useRef<HTMLInputElement>(null);

  // ── Fetch all records for search ───────────────────────────────────────────
  const { data: allRecords = [] } = useQuery<HealthRecord[]>({
    queryKey: ['health-records'],
    queryFn: routineHealthCheckApi.getAll,
    enabled: isOpen,
  });

  // ── Load pre-selected IDs ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || preSelectedIds.length === 0) return;
    const selected = allRecords.filter(r => r.id != null && preSelectedIds.includes(r.id));
    if (selected.length > 0) setRows(selected.map(mapRecord));
  }, [isOpen, preSelectedIds, allRecords]);

  // ── Mutations ──────────────────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: (payload: HealthRecord[]) => routineHealthCheckApi.updateBulk(payload as any),
    onSuccess: () => {
      toast({ title: `Đã cập nhật ${rows.length} lượt khám` });
      queryClient.invalidateQueries({ queryKey: ['health-records'] });
      onSuccess();
    },
    onError: () => toast({ title: 'Lỗi khi cập nhật', variant: 'destructive' }),
  });

  // ── Row helpers ────────────────────────────────────────────────────────────
  const addFromSearch = (record: HealthRecord) => {
    if (rows.find(r => r.id === record.id)) {
      toast({ title: 'Lượt khám này đã được thêm', variant: 'destructive' });
      return;
    }
    setRows(p => [...p, mapRecord(record)]);
    setSearchOpen(false);
    setSearchValue('');
  };

  const removeRow = (id: number) =>
    setRows(p => p.filter(r => r.id !== id));

  const setField = (id: number, key: string, value: any) =>
    setRows(p => p.map(r => r.id === id ? { ...r, [key]: value } : r));

  const toggleExpand = (id: number) =>
    setExpandedRows(p => {
      const s = new Set(p);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });

  const toggleCol = (columnKey: string) => {
    const newVisible = new Set(visibleCols);

    if (newVisible.has(columnKey)) {
      newVisible.delete(columnKey);
    } else {
      newVisible.add(columnKey);
    }

    setVisibleCols(newVisible);
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (rows.length === 0) {
      toast({ title: 'Vui lòng chọn ít nhất một lượt khám', variant: 'destructive' });
      return;
    }
    updateMutation.mutate(rows);
  };

  const handleClose = () => {
    setRows([]);
    setExpandedRows(new Set());
    setSearchValue('');
    onClose();
  };

  // ── Search filter ──────────────────────────────────────────────────────────
  const filteredRecords = allRecords.filter(r => {
    const term = searchValue.toLowerCase();
    return (
      String(r.employeeId).includes(term) ||
      (r.donVi ?? '').toLowerCase().includes(term) ||
      (r.ngayKham ?? '').includes(term)
    );
  });

  // ── Export Excel ───────────────────────────────────────────────────────────
  const handleExport = async () => {
    try {
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Khám sức khỏe');
      const headers = [
        'ID', 'Mã NV *', 'Ngày khám *', 'Đơn vị', 'Chiều cao', 'Cân nặng',
        'Mạch', 'Huyết áp', 'Nhóm máu', 'PL Thể lực', 'PL Sức khỏe', 'PL Nghề nghiệp',
        'WBC','RBC','HGB','PLT','VSS','HbA1c',
        'Glucoza','Ure','Creatinin','A.Uric','Cholesterol','Triglycerid',
        'HDL','LDL','GOT','GPT','GGT',
        'Mô tả kết luận','Hướng giải quyết','Người kết luận',
      ];
      ws.addRow(headers);
      ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };

      rows.forEach(r => {
        ws.addRow([
          r.id, r.employeeId, r.ngayKham, r.donVi, r.chieuCao, r.canNang,
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
        `Chinh_sua_luot_kham_${new Date().toISOString().slice(0,10)}.xlsx`);
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

      const existingById = new Map(rows.map(r => [r.id, r]));
      const updated: HealthRecord[] = [];

      ws.eachRow((row, rowNum) => {
        if (rowNum === 1) return;
        const g = (n: number) => {
          const v = row.getCell(n).value;
          return v != null ? String(v).trim() : '';
        };
        const id = num(g(1));
        if (!id) return;

        const base: HealthRecord = existingById.has(id)
          ? { ...existingById.get(id)! }
          : { id, employeeId: num(g(2)) ?? 0 };

        updated.push({
          ...base,
          id,
          employeeId: num(g(2)) ?? base.employeeId,
          ngayKham: g(3) || base.ngayKham,
          donVi: g(4) || base.donVi,
          chieuCao: num(g(5)) ?? base.chieuCao,
          canNang: num(g(6)) ?? base.canNang,
          mach: num(g(7)) ?? base.mach,
          huyetAp: g(8) || base.huyetAp,
          nhomMau: g(9) || base.nhomMau,
          plTheLuc: num(g(10)) ?? base.plTheLuc,
          plSucKhoe: num(g(11)) ?? base.plSucKhoe,
          phanLoaiNgheNghiep: num(g(12)) ?? base.phanLoaiNgheNghiep,
          wbc: num(g(13)) ?? base.wbc, rbc: num(g(14)) ?? base.rbc,
          hgb: num(g(15)) ?? base.hgb, plt: num(g(16)) ?? base.plt,
          vss: num(g(17)) ?? base.vss, hba1c: num(g(18)) ?? base.hba1c,
          glucoza: num(g(19)) ?? base.glucoza, ure: num(g(20)) ?? base.ure,
          creatinin: num(g(21)) ?? base.creatinin, auric: num(g(22)) ?? base.auric,
          cholesterol: num(g(23)) ?? base.cholesterol, triglycerid: num(g(24)) ?? base.triglycerid,
          hdl: num(g(25)) ?? base.hdl, ldl: num(g(26)) ?? base.ldl,
          got: num(g(27)) ?? base.got, gpt: num(g(28)) ?? base.gpt, ggt: num(g(29)) ?? base.ggt,
          moTaKetLuan: g(30) || base.moTaKetLuan,
          huongGiaiQuyet: g(31) || base.huongGiaiQuyet,
          nguoiKetLuan: g(32) || base.nguoiKetLuan,
        });
      });

      // Merge: update existing, append new
      const ids = new Set(updated.map(r => r.id));
      const kept = rows.filter(r => !ids.has(r.id));
      setRows([...kept, ...updated]);
      toast({ title: `Đã nhập ${updated.length} dòng từ file` });
    } catch (err: any) {
      toast({ title: err.message || 'Lỗi khi đọc file', variant: 'destructive' });
    } finally {
      e.target.value = '';
    }
  };

  // ── Cell renderer ──────────────────────────────────────────────────────────
  const renderCell = (row: Row, key: string) => {
      const cls = "h-8 text-sm w-full min-w-[120px]";
      const booleanFields = [
        "nldTiepXucYeuToCoHai",
        "biTaiNanLaoDong",
        "nldKskPhatHienBnn",
        "nldChanDoanBnn",
        "daRuaPhoi",
  
        "dauBungKinh",
        "daLapGiaDinh",
        "apDungBptt",
  
        "xuTriDt",
        "xuTriTd",
        "xuTriCk",
        "luuY",
  
        "hbsag",
        "hav",
        "hcv",
        "hev",
        "hpylori",
  
        "laoPhoi",
        "ungThuPhoi",
        "viemXoangCap",
        "viemXoangMan",
        "viemPheQuanCap",
        "viemPheQuanMan",
        "viemPhoi",
        "henPheQuanDiUng",
        "iaCHayViemDaDayRuot",
        "noiTiet",
        "benhTamThan",
        "benhThanKinhTwNgoaiBien",
        "haCanTheoDoi",
        "haCanDieuTri",
        "benhTimMach",
        "benhVanTim",
        "roiLoanNhipTim",
        "viemDaDay",
        "viemDaiTrang",
        "basedow",
        "tieuDuong",
        "tangRlDuong",
        "rlMoMau",
        "tangMenGan",
        "tangAcidUric",
        "viemGanXoGan",
        "benhThanTietNieu",
        "soiTietNieu",
        "nangThan",
        "nangNhanTuyenGiap",
        "ganNhiemMo",
        "soiPolipTuiMat",
        "ungThuNoiKhoa",
        "benhSotRet",
  
        "vmuiHongAmidalXoang",
        "viemTai",
        "polipMui",
  
        "sauRang",
        "rangMocLech",
        "matRang",
  
        "tatKhucXa",
        "laoThi",
        "giamThiLuc",
        "ducThuyTinhThe",
  
        "ucacLoai",
        "nangNhanTuyenVu",
        "tri",
        "benhXuongKhop",
        "vetMoOBung",
        "gayXuongCu",
        "matDotNgonTayChanCu",
        "taiNanChanThuongCu",
        "sayThai",
  
        "viemNamAmDao",
        "viemCtc",
        "nhanXoTuCung",
        "uxoTuCung",
        "nangBt",
        "polipCtc",
  
        "viemDa",
        "vayNen",
        "langBen",
        "namDa",
        "sanNgua",
      ];
      const numberFields = [
        "employeeId",
  
        "namSinh",
  
        "chieuCao",
        "canNang",
        "mach",
  
        "plTheLuc",
        "plSucKhoe",
        "phanLoaiNgheNghiep",
  
        "soNgayNghiOm",
        "soNgayDieuTriTnld",
        "tyLeGiamDinhTnld",
        "namHuongTroCapTnld",
  
        "namGiamDinhBnn",
        "tyLeGiamDinhBnn",
        "namHuongTroCapBnn",
        "namRuaPhoi",
  
        "plKhamTuanHoan",
        "plKhamHoHap",
        "plKhamTieuHoa",
        "plKhamThanTietNieu",
        "plKhamNoiTiet",
        "plKhamCxk",
        "plKhamThanKinh",
        "plKhamTamThan",
        "plKhamNgoai",
        "plKhamDaLieu",
        "plKhamSanKhoa",
        "plKhamMat",
        "plKhamTmh",
        "plKhamRhm",
  
        "tuoiBatDauKinhNguyet",
        "chuKyKinh",
        "luongKinh",
        "soLanMoSanPhuKhoa",
  
        "noiThuongTaiTrai",
        "noiThuongTaiPhai",
        "noiThamTaiTrai",
        "noiThamTaiPhai",
  
        "wbc",
        "rbc",
        "hgb",
        "plt",
        "vss",
        "ure",
        "glucoza",
        "creatinin",
        "auric",
        "cholesterol",
        "triglycerid",
        "hdl",
        "ldl",
        "got",
        "gpt",
        "ggt",
        "albumin",
        "bilirubinTp",
        "bilirubinTt",
        "bilirubinGt",
        "ckmb",
        "canxi",
  
        "ntPh",
        "ntSg",
  
        "hba1c",
      ];
      const dateFields = [
        "ngayKham",
        "ngayBiTaiNanLaoDong",
        "thoiGianHoiChanBnn",
      ];
      if (booleanFields.includes(key)) {
        return (
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={Boolean((row as any)[key])}
              onChange={(e) => setField(row.id, key, e.target.checked)}
            />
          </div>
        );
      }
      if (numberFields.includes(key)) {
        return (
          <Input
            type="number"
            step="0.01"
            className={cls}
            value={(row as any)[key] ? (row as any)[key] : ""}
            onChange={(e) => setField(row.id, key, num(e.target.value))}
          />
        );
      }
      if (dateFields.includes(key)) {
        return (
          <Input
            type="date"
            className={cls}
            value={(row as any)[key] ? (row as any)[key] : ""}
            onChange={(e) => setField(row.id, key, e.target.value)}
          />
        );
      }
      if (key === "nhomMau") {
        return (
          <Select
            value={(row as any)[key] ? (row as any)[key] : ""}
            onValueChange={(v) => setField(row.id, key, v)}
          >
            <SelectTrigger className={cls}>
              <SelectValue placeholder="Chọn" />
            </SelectTrigger>
  
            <SelectContent>
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }
      return (
        <Input
          className={cls}
          value={(row as any)[key] ? (row as any)[key] : ""}
          onChange={(e) => setField(row.id, key, e.target.value)}
          placeholder="..."
        />
      );
    };
  

  // ── Expanded card ──────────────────────────────────────────────────────────
  const renderExpanded = (row: Row, index: number) => {
      const groupedColumns = [...ALL_COLUMNS.required, ...ALL_COLUMNS.optional].reduce(
        (acc, col) => {
          if (!acc[col.group]) acc[col.group] = [];
          acc[col.group].push(col);
          return acc;
        },
        {} as Record<string, typeof ALL_COLUMNS.optional>,
      );
  
      const numberFields = [
        "employeeId",
  
        // Kết quả
        "chieuCao",
        "canNang",
        "mach",
        "plTheLuc",
        "plSucKhoe",
        "phanLoaiNgheNghiep",
        "soNgayNghiOm",
        "soNgayDieuTriTnld",
        "tyLeGiamDinhTnld",
        "namHuongTroCapTnld",
        "namGiamDinhBnn",
        "tyLeGiamDinhBnn",
        "namHuongTroCapBnn",
        "namRuaPhoi",
  
        // Sản phụ khoa
        "tuoiBatDauKinhNguyet",
        "chuKyKinh",
        "luongKinh",
        "soLanMoSanPhuKhoa",
  
        // Xét nghiệm
        "wbc",
        "rbc",
        "hgb",
        "plt",
        "vss",
        "ure",
        "glucoza",
        "creatinin",
        "auric",
        "cholesterol",
        "triglycerid",
        "hdl",
        "ldl",
        "got",
        "gpt",
        "ggt",
        "albumin",
        "bilirubinTp",
        "bilirubinTt",
        "bilirubinGt",
        "ckmb",
        "canxi",
        "ntPh",
        "ntSg",
        "hba1c",
  
        // Tai mũi họng
        "noiThuongTaiTrai",
        "noiThuongTaiPhai",
        "noiThamTaiTrai",
        "noiThamTaiPhai",
  
        // Phân loại khám
        "plKhamTuanHoan",
        "plKhamHoHap",
        "plKhamTieuHoa",
        "plKhamThanTietNieu",
        "plKhamNoiTiet",
        "plKhamCxk",
        "plKhamThanKinh",
        "plKhamTamThan",
        "plKhamNgoai",
        "plKhamDaLieu",
        "plKhamSanKhoa",
        "plKhamMat",
        "plKhamTmh",
        "plKhamRhm",
  
        // Xét nghiệm nước tiểu
        "ntLeu",
        "ntNit",
        "ntPro",
        "ntEry",
        "ntKet",
        "ntBil",
        "ntGlu",
        "ntUbg",
  
        // Mắt
        "kqMatTraiKhongKinh",
        "kqMatPhaiKhongKinh",
        "kqMatTraiCoKinh",
        "kqMatPhaiCoKinh",
      ];
  
      const booleanFields = [
        // Xử trí
        "xuTriDt",
        "xuTriTd",
        "xuTriCk",
        "luuY",
  
        // Virus / test
        "hbsag",
        "hav",
        "hcv",
        "hev",
        "hpylori",
  
        // Nghề nghiệp
        "nldTiepXucYeuToCoHai",
        "biTaiNanLaoDong",
        "nldKskPhatHienBnn",
        "nldChanDoanBnn",
        "daRuaPhoi",
  
        // Phụ khoa
        "dauBungKinh",
        "daLapGiaDinh",
        "apDungBptt",
  
        // Nội khoa
        "laoPhoi",
        "ungThuPhoi",
        "viemXoangCap",
        "viemXoangMan",
        "viemPheQuanCap",
        "viemPheQuanMan",
        "viemPhoi",
        "henPheQuanDiUng",
        "iaCHayViemDaDayRuot",
        "noiTiet",
        "benhTamThan",
        "benhThanKinhTwNgoaiBien",
        "haCanTheoDoi",
        "haCanDieuTri",
        "benhTimMach",
        "benhVanTim",
        "roiLoanNhipTim",
        "viemDaDay",
        "viemDaiTrang",
        "basedow",
        "tieuDuong",
        "tangRlDuong",
        "rlMoMau",
        "tangMenGan",
        "tangAcidUric",
        "viemGanXoGan",
        "benhThanTietNieu",
        "soiTietNieu",
        "nangThan",
        "nangNhanTuyenGiap",
        "ganNhiemMo",
        "soiPolipTuiMat",
        "ungThuNoiKhoa",
        "benhSotRet",
  
        // Tai mũi họng
        "vmuiHongAmidalXoang",
        "viemTai",
        "polipMui",
  
        // Răng hàm mặt
        "sauRang",
        "rangMocLech",
        "matRang",
  
        // Mắt
        "tatKhucXa",
        "laoThi",
        "giamThiLuc",
        "ducThuyTinhThe",
  
        // Ngoại khoa
        "ucacLoai",
        "nangNhanTuyenVu",
        "tri",
        "benhXuongKhop",
        "vetMoOBung",
        "gayXuongCu",
        "matDotNgonTayChanCu",
        "taiNanChanThuongCu",
        "sayThai",
  
        // Phụ khoa
        "viemNamAmDao",
        "viemCtc",
        "nhanXoTuCung",
        "uxoTuCung",
        "nangBt",
        "polipCtc",
  
        // Da liễu
        "viemDa",
        "vayNen",
        "langBen",
        "namDa",
        "sanNgua",
      ];
  
      const dateFields = [
        "ngayKham",
        "ngayBiTaiNanLaoDong",
        "thoiGianHoiChanBnn",
      ];
  
      const textareaFields = [
        // Kết luận
        "moTaKetLuan",
        "huongGiaiQuyet",
  
        // Mô tả
        "tinhChatKinhNguyet",
        "moTaMoSanPhuKhoa",
        "moTaBptt",
  
        // Khám
        "khamTuanHoan",
        "khamHoHap",
        "khamTieuHoa",
        "khamThanTietNieu",
        "khamNoiTiet",
        "khamCoXuongKhop",
        "khamThanKinh",
        "khamTamThan",
        "khamNgoai",
        "khamDaLieu",
        "khamSanPhuKhoa",
        "khamMat",
        "khamTaiMuiHong",
        "khamRangHamMat",
  
        // CLS
        "ketQuaCls",
        "danhGiaCls",
  
        // Nội khoa
        "benhKhacNoiKhoa",
  
        // TMH
        "benhKhacTmh",
  
        // RHM
        "benhKhacRhm",
  
        // Mắt
        "benhKhacMat",
  
        // Ngoại khoa
        "benhKhacNgoaiKhoa",
  
        // Phụ khoa
        "benhKhacPhuKhoa",
  
        // Da liễu
        "benhKhacDaLieu",
  
        // Khác
        "benhThongThuong",
        "maBenhThongThuong",
        "benhManTinh",
        "maBenhManTinh",
        "chucDanhNgheKhiMacBnn",
        "tenBenhNgheNghiep",
        "maBenhNgheNghiep",
        "theBenh",
        "chongChiDinhRuaPhoi",
        "tienSuBenhGiaDinh",
        "para",
        "hamTren",
        "hamDuoi",
        "nguoiKetLuan",
  
        // CLS
        "sieuAmOBung",
        "saTuyenGiap",
        "saTim",
        "saDopplerMachKhac",
        "saVu",
        "dienTim",
        "noiSoiTmh",
        "noiSoiDaDay",
        "noiSoiDaiTrang",
        "chucNangHoHap",
        "loangXuong",
        "xoVuaMach",
        "luuHuyetNao",
        "xquangTimPhoi",
        "xquangKhac",
        "ctCanThiep",
        "sinhThiet",
        "soiCtc",
        "papmer",
        "viaTest",
        "viliTest",
        "xnTeBaoCoTuCung",
        "xnHpv",
      ];
  
      const bloodFields = ["nhomMau"];
  
      const selectFields = [
        "plTheLuc",
        "plSucKhoe",
        "phanLoaiNgheNghiep",
  
        "plKhamTuanHoan",
        "plKhamHoHap",
        "plKhamTieuHoa",
        "plKhamThanTietNieu",
        "plKhamNoiTiet",
        "plKhamCxk",
        "plKhamThanKinh",
        "plKhamTamThan",
        "plKhamNgoai",
        "plKhamDaLieu",
        "plKhamSanKhoa",
        "plKhamMat",
        "plKhamTmh",
        "plKhamRhm",
      ];

      const readOnlyFields = [
        "socialInsuranceNumber",
        "employeeId",
        "employeeName", 
        "donVi",
        "birthday",
        "jobTitleName",
        "departmentName",
      ];
  
      const renderField = (key: string, label: string) => {
        if (readOnlyFields.includes(key)) {
          return (
            <div key={key} className="space-y-1">
              <Label className="text-xs">{label}</Label>
              <Input
                className="h-8 text-sm cursor-not-allowed bg-muted"
                value={row[key as keyof Row] ? String(row[key as keyof Row]) : ""}
                readOnly
              />
            </div>
          );
        }
        if (booleanFields.includes(key)) {
          return (
            <div key={key} className="space-y-1">
            <Label className="text-xs">{label}</Label>
            <label className="flex items-center gap-1.5 h-8 border rounded-md px-2 bg-background cursor-pointer hover:bg-muted/50 w-full">
              <Checkbox
                checked={Boolean(row[key as keyof Row])}
                onCheckedChange={(v) => setField(row.id, key, v)}
              />
              <span className="text-xs">
                {Boolean(row[key as keyof Row]) ? "Có" : "Không"}
              </span>
            </label>
          </div>
          );
        }
        if (textareaFields.includes(key)) {
          return (
            <div key={key} className="space-y-1">
              <Label className="text-xs">{label}</Label>
              <Input
                className="h-8 text-sm"
                type="text"
                value={row[key as keyof Row] ? String(row[key as keyof Row]) : ""}
                onChange={(e) => setField(row.id, key, e.target.value)}
              />
            </div>
          );
        }
  
        if (dateFields.includes(key)) {
          return (
            <div key={key} className="space-y-1">
              <Label className="text-xs">{label}</Label>
              <Input
                type="date"
                className="h-8 text-sm"
                value={row[key as keyof Row] ? String(row[key as keyof Row]) : ""}
                onChange={(e) => setField(row.id, key, e.target.value)}
              />
            </div>
          );
        }
  
        if (bloodFields.includes(key)) {
          return (
            <div key={key} className="space-y-1">
              <Label className="text-xs">{label}</Label>
              <Select
                value={row[key as keyof Row] ? String(row[key as keyof Row]) : ""}
                onValueChange={(v) => setField(row.id, key, v)}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Chọn" />
                </SelectTrigger>
  
                <SelectContent>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }
  
        if (selectFields.includes(key)) {
          return (
            <div key={key} className="space-y-1">
              <Label className="text-xs">{label}</Label>
  
              <Select
                value={row[key as keyof Row] ? String(row[key as keyof Row]) : ""}
                onValueChange={(v) => setField(row.id, key, num(v))}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Chọn" />
                </SelectTrigger>
  
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <SelectItem key={i} value={String(i)}>
                      Loại {i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }
  
        return (
          <div key={key} className="space-y-1">
            <Label className="text-xs">{label}</Label>
  
            <Input
              type={numberFields.includes(key) ? "number" : "text"}
              step={numberFields.includes(key) ? "0.01" : undefined}
              className="h-8 text-sm"
              value={row[key as keyof Row] ? String(row[key as keyof Row]) : ""}
              onChange={(e) =>
                setField(
                  row.id,
                  key,
                  numberFields.includes(key)
                    ? num(e.target.value)
                    : e.target.value,
                )
              }
            />
          </div>
        );
      };
  
      return (
        <div
          key={row._tid}
          className="border rounded-lg p-4 space-y-6 bg-muted/30"
        >
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                {index + 1}
              </span>
  
              {row.employeeId ? `NV #${row.employeeId}` : "Lượt khám mới"}
            </h4>
  
            <Button variant="ghost" size="sm" onClick={() => removeRow(row.id)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
  
          {Object.entries(groupedColumns).map(([group, cols]) => (
            <div key={group}>
              <h3 className="text-sm font-semibold mb-3 text-blue-600 border-b pb-1 uppercase tracking-wide">
                {group}
              </h3>
  
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {cols.map((col) => renderField(col.key, col.label))}
              </div>
            </div>
          ))}
        </div>
      );
    };

  // ── Column selector ────────────────────────────────────────────────────────
  const ColumnSelector = () => {
    const groups = ALL_COLUMNS.optional.reduce(
      (acc, col) => {
        if (!acc[col.group]) acc[col.group] = [];
        acc[col.group].push(col);
        return acc;
      },
      {} as Record<string, typeof ALL_COLUMNS.optional>,
    );
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <ChevronDown className="h-4 w-4" />
            Tùy chỉnh cột ({visibleCols.size}/{ALL_COLUMNS.required.length + UNIQUE_OPTIONAL_COLS.length})
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 max-h-80 overflow-y-auto" onWheel={(e) => e.stopPropagation()}>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold mb-1">Cột bắt buộc</p>
              {ALL_COLUMNS.required.map(c => (
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
            Chỉnh sửa lượt khám hàng loạt
          </DialogTitle>
          <DialogDescription>
            Tìm kiếm lượt khám để thêm vào danh sách chỉnh sửa, hoặc tải file Excel lên.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Search bar — chỉ hiện khi không có preSelectedIds */}
          {preSelectedIds.length === 0 && (
            <div className="px-6 py-3 border-b bg-muted/30">
              <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full md:w-96 justify-between">
                    <Search className="mr-2 h-4 w-4 opacity-50" />
                    {searchValue || 'Tìm lượt khám (Mã NV, đơn vị, ngày)...'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[420px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Nhập mã NV, đơn vị, ngày khám..."
                      value={searchValue} onValueChange={setSearchValue} />
                    <CommandEmpty>Không tìm thấy lượt khám.</CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-auto">
                      {filteredRecords.slice(0, 50).map(r => (
                        <CommandItem key={r.id} value={String(r.id)} onSelect={() => addFromSearch(r)}>
                          <Check className={`mr-2 h-4 w-4 ${rows.find(x => x.id === r.id) ? 'opacity-100' : 'opacity-0'}`} />
                          <div className="flex flex-col">
                            <span className="font-medium">NV #{r.employeeId}</span>
                            <span className="text-xs text-muted-foreground">
                              {r.ngayKham ? new Date(r.ngayKham + 'T00:00:00').toLocaleDateString('vi-VN') : ''}
                              {r.donVi ? ` • ${r.donVi}` : ''}
                              {r.plSucKhoe ? ` • PL ${r.plSucKhoe}` : ''}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Toolbar */}
          {rows.length > 0 && (
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
              </div>
              <span className="text-sm text-muted-foreground">
                Đã chọn: <b>{rows.length}</b> lượt khám
              </span>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-auto px-6 py-4">
            {rows.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>Chưa có lượt khám nào. Tìm kiếm hoặc tải file Excel lên.</p>
                <div className="mt-4 flex justify-center gap-2">
                  <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImport} />
                  <Button size="sm" className="gap-2" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4" /> Tải lên Excel
                  </Button>
                </div>
              </div>
            ) : viewMode === 'table' ? (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10 sticky left-0 bg-background z-10">#</TableHead>
                      <TableHead className="w-20 sticky left-10 bg-background z-10 text-center">Thao tác</TableHead>
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
                        <TableRow key={row.id}>
                          <TableCell className="sticky left-0 bg-background z-10 border-r font-medium">{idx + 1}</TableCell>
                          <TableCell className="sticky left-10 bg-background z-10 border-r">
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" onClick={() => toggleExpand(row.id!)}
                                title={expandedRows.has(row.id!) ? 'Thu gọn' : 'Mở rộng'}>
                                {expandedRows.has(row.id!) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => removeRow(row.id!)} title="Bỏ khỏi danh sách">
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
                        {expandedRows.has(row.id!) && (
                          <TableRow key={`${row.id}-exp`}>
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
              <Button variant="outline" onClick={handleClose} disabled={updateMutation.isPending}>Hủy</Button>
              <Button onClick={handleSubmit} disabled={updateMutation.isPending || rows.length === 0}
                className="bg-green-500 hover:bg-green-600 text-white">
                {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {updateMutation.isPending ? 'Đang lưu...' : `Xác nhận (${rows.length})`}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}