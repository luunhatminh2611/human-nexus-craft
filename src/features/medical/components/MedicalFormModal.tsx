// components/MedicalFormModal.tsx

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button as Button2 } from '@/shared/components/ui/button/Button2';
import Button from '@/shared/components/ui/button/Button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { toast } from '@/shared/hooks/use-toast';
import {
  Activity, AlertCircle, ChevronRight, ChevronLeft,
  User, Stethoscope, FlaskConical, FileText,
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { routineHealthCheckApi } from '../api/medicalApi';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HealthRecord {
  id?: number;
  employeeId: number;
  isActive?: boolean;

  // Thông tin chung
  donVi?: string;
  ngayKham?: string;
  chieuCao?: number;
  canNang?: number;
  mach?: number;
  huyetAp?: string;
  plTheLuc?: number;
  plSucKhoe?: number;
  benhThongThuong?: string;
  maBenhThongThuong?: string;
  soNgayNghiOm?: number;
  benhManTinh?: string;
  maBenhManTinh?: string;
  phanLoaiNgheNghiep?: number;

  // Lao động / nghề nghiệp
  nldTiepXucYeuToCoHai?: boolean;
  biTaiNanLaoDong?: boolean;
  ngayBiTaiNanLaoDong?: string;
  soNgayDieuTriTnld?: number;
  tyLeGiamDinhTnld?: number;
  namHuongTroCapTnld?: number;

  // Bệnh nghề nghiệp (BNN)
  nldKskPhatHienBnn?: boolean;
  nldChanDoanBnn?: boolean;
  chucDanhNgheKhiMacBnn?: string;
  tenBenhNgheNghiep?: string;
  maBenhNgheNghiep?: string;
  thoiGianHoiChanBnn?: string;
  theBenh?: string;
  namGiamDinhBnn?: number;
  tyLeGiamDinhBnn?: number;
  namHuongTroCapBnn?: number;
  daRuaPhoi?: boolean;
  namRuaPhoi?: number;
  chongChiDinhRuaPhoi?: string;

  // Tiền sử
  tienSuBenhGiaDinh?: string;

  // Khám lâm sàng
  khamTuanHoan?: string; plKhamTuanHoan?: number;
  khamHoHap?: string; plKhamHoHap?: number;
  khamTieuHoa?: string; plKhamTieuHoa?: number;
  khamThanTietNieu?: string; plKhamThanTietNieu?: number;
  khamNoiTiet?: string; plKhamNoiTiet?: number;
  khamCoXuongKhop?: string; plKhamCxk?: number;
  khamThanKinh?: string; plKhamThanKinh?: number;
  khamTamThan?: string; plKhamTamThan?: number;
  khamNgoai?: string; plKhamNgoai?: number;
  khamDaLieu?: string; plKhamDaLieu?: number;

  // Sản phụ khoa
  khamSanPhuKhoa?: string; plKhamSanKhoa?: number;
  tuoiBatDauKinhNguyet?: number;
  tinhChatKinhNguyet?: string;
  chuKyKinh?: number;
  luongKinh?: number;
  dauBungKinh?: boolean;
  daLapGiaDinh?: boolean;
  para?: string;
  soLanMoSanPhuKhoa?: number;
  moTaMoSanPhuKhoa?: string;
  apDungBptt?: boolean;
  moTaBptt?: string;

  // Mắt
  khamMat?: string; plKhamMat?: number;
  kqMatTraiKhongKinh?: string;
  kqMatPhaiKhongKinh?: string;
  kqMatTraiCoKinh?: string;
  kqMatPhaiCoKinh?: string;

  // Tai mũi họng
  khamTaiMuiHong?: string; plKhamTmh?: number;
  noiThuongTaiTrai?: number;
  noiThuongTaiPhai?: number;
  noiThamTaiTrai?: number;
  noiThamTaiPhai?: number;

  // Răng hàm mặt
  khamRangHamMat?: string; plKhamRhm?: number;
  hamTren?: string;
  hamDuoi?: string;

  // Kết luận
  ketQuaCls?: string;
  danhGiaCls?: string;
  moTaKetLuan?: string;
  huongGiaiQuyet?: string;
  nguoiKetLuan?: string;
  xuTriDt?: boolean;
  xuTriTd?: boolean;
  xuTriCk?: boolean;
  luuY?: boolean;

  // Xét nghiệm máu - Công thức máu
  wbc?: number;
  rbc?: number;
  hgb?: number;
  plt?: number;
  vss?: number;

  // Xét nghiệm máu - Sinh hóa
  ure?: number;
  glucoza?: number;
  creatinin?: number;
  auric?: number;         // A.Uric
  cholesterol?: number;
  triglycerid?: number;
  hdl?: number;
  ldl?: number;
  got?: number;
  gpt?: number;
  ggt?: number;
  albumin?: number;
  bilirubinTp?: number;
  bilirubinTt?: number;
  bilirubinGt?: number;
  ckmb?: number;
  canxi?: number;

  // Xét nghiệm nước tiểu
  ntLeu?: string;
  ntNit?: string;
  ntPro?: string;
  ntPh?: number;
  ntEry?: string;
  ntSg?: number;
  ntKet?: string;
  ntBil?: string;
  ntGlu?: string;
  ntUbg?: string;

  // Huyết thanh & đặc biệt
  hba1c?: number;
  hbsag?: boolean;
  hav?: boolean;
  hcv?: boolean;
  hev?: boolean;
  nhomMau?: string;
  hpylori?: boolean;

  // Cận lâm sàng hình ảnh
  sieuAmOBung?: string;
  saTuyenGiap?: string;
  saTim?: string;
  saDopplerMachKhac?: string;   // Siêu âm Doppler mạch / SA khác
  saVu?: string;                 // SÂ vú
  dienTim?: string;
  noiSoiTmh?: string;            // Nội soi TMH
  noiSoiDaDay?: string;          // Dạ dày
  noiSoiDaiTrang?: string;       // Đại tràng
  chucNangHoHap?: string;
  loangXuong?: string;
  xoVuaMach?: string;
  luuHuyetNao?: string;
  xquangTimPhoi?: string;
  xquangKhac?: string;
  ctCanThiep?: string;
  sinhThiet?: string;
  soiCtc?: string;
  papmer?: string;
  viaTest?: string;              // VIA test
  viliTest?: string;             // VILI test
  xnTeBaoCoTuCung?: string;
  xnHpv?: string;

  // Bệnh phát hiện - Nội khoa
  laoPhoi?: boolean;
  ungThuPhoi?: boolean;
  viemXoangCap?: boolean;        // Viêm xoang. mũi họng. thanh quản cấp
  viemXoangMan?: boolean;        // Viêm xoang. mũi họng. thanh quản mãn
  viemPheQuanCap?: boolean;      // Viêm phế quản cấp
  viemPheQuanMan?: boolean;      // Viêm phế quản mãn
  viemPhoi?: boolean;
  henPheQuanDiUng?: boolean;     // Hen phế quản. giãn phế quản. dị ứng
  iaCHayViemDaDayRuot?: boolean; // Ỉa chảy. viêm dạ dày. ruột do NT
  noiTiet?: boolean;             // Nội tiết
  benhTamThan?: boolean;
  benhThanKinhTwNgoaiBien?: boolean;
  haCanTheoDoi?: boolean;        // HA cần theo dõi
  haCanDieuTri?: boolean;        // HA cần điều trị
  benhTimMach?: boolean;
  benhVanTim?: boolean;
  roiLoanNhipTim?: boolean;
  viemDaDay?: boolean;
  viemDaiTrang?: boolean;
  basedow?: boolean;
  tieuDuong?: boolean;
  tangRlDuong?: boolean;         // Tăng. RL đường
  rlMoMau?: boolean;
  tangMenGan?: boolean;
  tangAcidUric?: boolean;        // Tăng Acid Uric
  viemGanXoGan?: boolean;
  benhThanTietNieu?: boolean;
  soiTietNieu?: boolean;
  nangThan?: boolean;
  nangNhanTuyenGiap?: boolean;   // Nang. nhân tuyến giáp
  ganNhiemMo?: boolean;
  soiPolipTuiMat?: boolean;      // Sỏi. polip túi mật
  ungThuNoiKhoa?: boolean;       // Ung thư (nội khoa)
  benhKhacNoiKhoa?: string;
  benhSotRet?: boolean;

  // Bệnh phát hiện - Tai mũi họng
  vmuiHongAmidalXoang?: boolean; // V mũi họng. Amidal. xoang mt
  viemTai?: boolean;
  polipMui?: boolean;
  benhKhacTmh?: string;

  // Bệnh phát hiện - Răng hàm mặt
  sauRang?: boolean;
  rangMocLech?: boolean;
  matRang?: boolean;             // Mất răng
  benhKhacRhm?: string;

  // Bệnh phát hiện - Mắt
  tatKhucXa?: boolean;
  laoThi?: boolean;              // Lão thị
  giamThiLuc?: boolean;
  ducThuyTinhThe?: boolean;
  benhKhacMat?: string;

  // Bệnh phát hiện - Ngoại khoa
  ucacLoai?: boolean;            // U các loại
  nangNhanTuyenVu?: boolean;     // Nang. nhân tuyến vú
  tri?: boolean;                 // Trĩ
  benhXuongKhop?: boolean;
  vetMoOBung?: boolean;
  gayXuongCu?: boolean;
  matDotNgonTayChanCu?: boolean; // Mất đốt ngón tay chân cũ
  taiNanChanThuongCu?: boolean;  // Tai nạn. chấn thương cũ
  benhKhacNgoaiKhoa?: string;

  // Bệnh phát hiện - Phụ khoa
  sayThai?: boolean;
  viemNamAmDao?: boolean;
  viemCtc?: boolean;
  nhanXoTuCung?: boolean;
  uxoTuCung?: boolean;           // U xơ tử cung
  nangBt?: boolean;
  polipCtc?: boolean;
  benhKhacPhuKhoa?: string;

  // Bệnh phát hiện - Da liễu
  viemDa?: boolean;
  vayNen?: boolean;              // Vảy nén
  langBen?: boolean;
  namDa?: boolean;
  sanNgua?: boolean;             // Sẩn ngứa
  benhKhacDaLieu?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  record: HealthRecord | null;
  onSuccess: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Field({
  label, required, error, children, className = '',
}: {
  label: string; required?: boolean; error?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label className="text-xs font-medium text-muted-foreground">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {children}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />{error}
        </p>
      )}
    </div>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 pb-2 border-b mb-4">
      <span className="text-primary">{icon}</span>
      <span className="font-semibold text-sm">{title}</span>
    </div>
  );
}

function SubHeader({ title }: { title: string }) {
  return (
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 mt-1">{title}</p>
  );
}

function ClinicalRow({
  label, valueKey, plKey, form, set,
}: {
  label: string;
  valueKey: keyof HealthRecord;
  plKey: keyof HealthRecord;
  form: Partial<HealthRecord>;
  set: (k: keyof HealthRecord, v: any) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 items-end">
      <div className="col-span-2">
        <Field label={label}>
          <Input
            value={(form[valueKey] as string) ?? ''}
            onChange={e => set(valueKey, e.target.value)}
            placeholder="Mô tả kết quả..."
          />
        </Field>
      </div>
      <Field label="Phân loại">
        <Select
          value={(form[plKey] as number)?.toString() ?? ''}
          onValueChange={v => set(plKey, Number(v))}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Loại" />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5].map(i => (
              <SelectItem key={i} value={String(i)}>Loại {i}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    </div>
  );
}

function CheckGroup({
  items, form, set,
}: {
  items: [keyof HealthRecord, string][];
  form: Partial<HealthRecord>;
  set: (k: keyof HealthRecord, v: any) => void;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      {items.map(([k, l]) => (
        <label key={k} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-muted/50 transition-colors">
          <Checkbox checked={Boolean(form[k])} onCheckedChange={v => set(k, v)} />
          <span className="text-sm">{l}</span>
        </label>
      ))}
    </div>
  );
}

// ─── Section definitions ──────────────────────────────────────────────────────

const SECTIONS = [
  { key: 'general', label: 'Thông tin chung', icon: <User className="h-4 w-4" /> },
  { key: 'clinical', label: 'Khám lâm sàng', icon: <Stethoscope className="h-4 w-4" /> },
  { key: 'lab', label: 'Xét nghiệm', icon: <FlaskConical className="h-4 w-4" /> },
  { key: 'conclusion', label: 'Kết luận', icon: <FileText className="h-4 w-4" /> },
];

const EMPTY: Partial<HealthRecord> = {
  employeeId: undefined,
  donVi: '',
  ngayKham: new Date().toISOString().slice(0, 10),
  mach: undefined, huyetAp: '',
  plTheLuc: undefined, plSucKhoe: undefined,
  benhThongThuong: '', maBenhThongThuong: '',
  soNgayNghiOm: undefined, benhManTinh: '', maBenhManTinh: '',
  nldTiepXucYeuToCoHai: false, biTaiNanLaoDong: false,
  moTaKetLuan: '', huongGiaiQuyet: '', nguoiKetLuan: '',
  xuTriDt: false, xuTriTd: false, xuTriCk: false,
  nhomMau: '',
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MedicalFormModal({ isOpen, onClose, record, onSuccess }: Props) {
  const [form, setForm] = useState<Partial<HealthRecord>>(record ?? EMPTY);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isOpen) {
      setForm(record ?? { ...EMPTY });
      setStep(0);
      setErrors({});
    }
  }, [isOpen, record]);

  const set = (key: keyof HealthRecord, value: any) =>
    setForm(prev => ({ ...prev, [key]: value }));
  const num = (v: string) => {
    if (v === '' || v === null || v === undefined) return undefined;
    const n = Number(v);
    return isNaN(n) ? undefined : n;
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.employeeId) e.employeeId = 'Vui lòng nhập mã nhân viên';
    if (!form.ngayKham) e.ngayKham = 'Vui lòng chọn ngày khám';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const createMutation = useMutation({
    mutationFn: (d: Partial<HealthRecord>) => routineHealthCheckApi.create(d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-records'] });
      toast({ title: 'Tạo hồ sơ thành công' });
      onSuccess();
    },
    onError: () => toast({ title: 'Lỗi khi tạo hồ sơ', variant: 'destructive' }),
  });

  const updateMutation = useMutation({
    mutationFn: (d: Partial<HealthRecord>) => routineHealthCheckApi.update(d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-records'] });
      toast({ title: 'Cập nhật thành công' });
      onSuccess();
    },
    onError: () => toast({ title: 'Lỗi khi cập nhật', variant: 'destructive' }),
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSave = () => {
    if (!validate()) {
      setStep(0);
      toast({ title: 'Vui lòng kiểm tra lại thông tin', variant: 'destructive' });
      return;
    }
    record?.id
      ? updateMutation.mutate({ ...form, id: record.id })
      : createMutation.mutate(form);
  };

  // ─── Section renderers ──────────────────────────────────────────────────────

  const renderGeneral = () => (
    <div className="space-y-5">
      <SectionHeader icon={<User className="h-4 w-4" />} title="Thông tin chung" />

      {/* Thông tin cơ bản */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Field label="Mã nhân viên" required error={errors.employeeId}>
          <Input
            type="number"
            value={form.employeeId ?? ''}
            onChange={e => set('employeeId', Number(e.target.value))}
            placeholder="ID nhân viên"
            className={errors.employeeId ? 'border-red-500' : ''}
          />
        </Field>
        <Field label="Đơn vị / Phòng ban">
          <Input value={form.donVi ?? ''} onChange={e => set('donVi', e.target.value)} />
        </Field>
        <Field label="Ngày khám" required error={errors.ngayKham}>
          <Input
            type="date"
            value={form.ngayKham ?? ''}
            onChange={e => set('ngayKham', e.target.value)}
            className={errors.ngayKham ? 'border-red-500' : ''}
          />
        </Field>
        <Field label="Chiều cao (cm)">
          <Input type="number" value={form.chieuCao ?? ''} onChange={e => set('chieuCao', num(e.target.value))} />
        </Field>
        <Field label="Cân nặng (kg)">
          <Input type="number" value={form.canNang ?? ''} onChange={e => set('canNang', num(e.target.value))} />
        </Field>
        <Field label="Mạch (lần/phút)">
          <Input type="number" value={form.mach ?? ''} onChange={e => set('mach', num(e.target.value))} />
        </Field>
        <Field label="Huyết áp (mmHg)">
          <Input value={form.huyetAp ?? ''} onChange={e => set('huyetAp', e.target.value)} placeholder="120/80" />
        </Field>
        <Field label="Nhóm máu">
          <Select value={form.nhomMau ?? ''} onValueChange={v => set('nhomMau', v)}>
            <SelectTrigger><SelectValue placeholder="Chọn" /></SelectTrigger>
            <SelectContent>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      {/* Phân loại */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Field label="PL Thể lực">
          <Select value={form.plTheLuc?.toString() ?? ''} onValueChange={v => set('plTheLuc', Number(v))}>
            <SelectTrigger><SelectValue placeholder="Chọn loại" /></SelectTrigger>
            <SelectContent>{[1, 2, 3, 4, 5].map(i => <SelectItem key={i} value={String(i)}>Loại {i}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="PL Sức khỏe">
          <Select value={form.plSucKhoe?.toString() ?? ''} onValueChange={v => set('plSucKhoe', Number(v))}>
            <SelectTrigger><SelectValue placeholder="Chọn loại" /></SelectTrigger>
            <SelectContent>{[1, 2, 3, 4, 5].map(i => <SelectItem key={i} value={String(i)}>Loại {i}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="PL Nghề nghiệp">
          <Select value={form.phanLoaiNgheNghiep?.toString() ?? ''} onValueChange={v => set('phanLoaiNgheNghiep', Number(v))}>
            <SelectTrigger><SelectValue placeholder="Chọn loại" /></SelectTrigger>
            <SelectContent>{[1, 2, 3, 4, 5].map(i => <SelectItem key={i} value={String(i)}>Loại {i}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
      </div>

      {/* Bệnh */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Field label="Bệnh thông thường">
          <Input value={form.benhThongThuong ?? ''} onChange={e => set('benhThongThuong', e.target.value)} />
        </Field>
        <Field label="Mã bệnh thông thường">
          <Input value={form.maBenhThongThuong ?? ''} onChange={e => set('maBenhThongThuong', e.target.value)} placeholder="ICD-10" />
        </Field>
        <Field label="Số ngày nghỉ ốm">
          <Input type="number" value={form.soNgayNghiOm ?? ''} onChange={e => set('soNgayNghiOm', num(e.target.value))} />
        </Field>
        <Field label="Bệnh mãn tính">
          <Input value={form.benhManTinh ?? ''} onChange={e => set('benhManTinh', e.target.value)} />
        </Field>
        <Field label="Mã bệnh mãn tính">
          <Input value={form.maBenhManTinh ?? ''} onChange={e => set('maBenhManTinh', e.target.value)} placeholder="ICD-10" />
        </Field>
        <Field label="Tiền sử bệnh của gia đình">
          <Input value={form.tienSuBenhGiaDinh ?? ''} onChange={e => set('tienSuBenhGiaDinh', e.target.value)} />
        </Field>
      </div>

      {/* Lao động */}
      <div>
        <SubHeader title="Tai nạn lao động" />
        <div className="flex flex-wrap gap-6 mb-3">
          {([
            ['nldTiepXucYeuToCoHai', 'NLĐ tiếp xúc trực tiếp với các yếu tố có hại'],
            ['biTaiNanLaoDong', 'Bị tai nạn lao động'],
          ] as [keyof HealthRecord, string][]).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={Boolean(form[key])} onCheckedChange={v => set(key, v)} />
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </div>
        {form.biTaiNanLaoDong && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-muted/40 rounded-lg">
            <Field label="Ngày bị TNLĐ">
              <Input type="date" value={form.ngayBiTaiNanLaoDong ?? ''} onChange={e => set('ngayBiTaiNanLaoDong', e.target.value)} />
            </Field>
            <Field label="Số ngày điều trị TNLĐ">
              <Input type="number" value={form.soNgayDieuTriTnld ?? ''} onChange={e => set('soNgayDieuTriTnld', num(e.target.value))} />
            </Field>
            <Field label="Tỷ lệ giám định TNLĐ (%)">
              <Input type="number" value={form.tyLeGiamDinhTnld ?? ''} onChange={e => set('tyLeGiamDinhTnld', num(e.target.value))} />
            </Field>
            <Field label="Năm hưởng trợ cấp TNLĐ">
              <Input type="number" value={form.namHuongTroCapTnld ?? ''} onChange={e => set('namHuongTroCapTnld', num(e.target.value))} />
            </Field>
          </div>
        )}
      </div>

      {/* BNN */}
      <div>
        <SubHeader title="Bệnh nghề nghiệp (BNN)" />
        <div className="flex flex-wrap gap-6 mb-3">
          {([
            ['nldKskPhatHienBnn', 'NLĐ được KSK phát hiện BNN'],
            ['nldChanDoanBnn', 'NLĐ được chẩn đoán BNN'],
            ['daRuaPhoi', 'Đã rửa phổi'],
          ] as [keyof HealthRecord, string][]).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={Boolean(form[key])} onCheckedChange={v => set(key, v)} />
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-3 bg-muted/40 rounded-lg">
          <Field label="Chức danh nghề khi mắc BNN">
            <Input value={form.chucDanhNgheKhiMacBnn ?? ''} onChange={e => set('chucDanhNgheKhiMacBnn', e.target.value)} />
          </Field>
          <Field label="Tên bệnh nghề nghiệp">
            <Input value={form.tenBenhNgheNghiep ?? ''} onChange={e => set('tenBenhNgheNghiep', e.target.value)} />
          </Field>
          <Field label="Mã bệnh nghề nghiệp">
            <Input value={form.maBenhNgheNghiep ?? ''} onChange={e => set('maBenhNgheNghiep', e.target.value)} />
          </Field>
          <Field label="Thời gian hội chẩn BNN">
            <Input type="date" value={form.thoiGianHoiChanBnn ?? ''} onChange={e => set('thoiGianHoiChanBnn', e.target.value)} />
          </Field>
          <Field label="Thể bệnh">
            <Input value={form.theBenh ?? ''} onChange={e => set('theBenh', e.target.value)} />
          </Field>
          <Field label="Năm giám định BNN">
            <Input type="number" value={form.namGiamDinhBnn ?? ''} onChange={e => set('namGiamDinhBnn', num(e.target.value))} />
          </Field>
          <Field label="Tỷ lệ giám định BNN (%)">
            <Input type="number" value={form.tyLeGiamDinhBnn ?? ''} onChange={e => set('tyLeGiamDinhBnn', num(e.target.value))} />
          </Field>
          <Field label="Năm hưởng trợ cấp BNN">
            <Input type="number" value={form.namHuongTroCapBnn ?? ''} onChange={e => set('namHuongTroCapBnn', num(e.target.value))} />
          </Field>
          <Field label="Năm rửa phổi">
            <Input type="number" value={form.namRuaPhoi ?? ''} onChange={e => set('namRuaPhoi', num(e.target.value))} />
          </Field>
          <Field label="NLĐ chống chỉ định rửa phổi" className="md:col-span-3">
            <Input value={form.chongChiDinhRuaPhoi ?? ''} onChange={e => set('chongChiDinhRuaPhoi', e.target.value)} />
          </Field>
        </div>
      </div>
    </div>
  );

  const renderClinical = () => (
    <div className="space-y-5">
      <SectionHeader icon={<Stethoscope className="h-4 w-4" />} title="Khám lâm sàng theo chuyên khoa" />

      {/* Khám chuyên khoa nội */}
      <SubHeader title="Nội khoa" />
      <div className="space-y-3">
        {([
          ['Tuần hoàn', 'khamTuanHoan', 'plKhamTuanHoan'],
          ['Hô hấp', 'khamHoHap', 'plKhamHoHap'],
          ['Tiêu hóa', 'khamTieuHoa', 'plKhamTieuHoa'],
          ['Thận - Tiết niệu', 'khamThanTietNieu', 'plKhamThanTietNieu'],
          ['Nội tiết', 'khamNoiTiet', 'plKhamNoiTiet'],
          ['Cơ - Xương - Khớp', 'khamCoXuongKhop', 'plKhamCxk'],
          ['Thần kinh', 'khamThanKinh', 'plKhamThanKinh'],
          ['Tâm thần', 'khamTamThan', 'plKhamTamThan'],
          ['Ngoại khoa', 'khamNgoai', 'plKhamNgoai'],
          ['Da liễu', 'khamDaLieu', 'plKhamDaLieu'],
        ] as [string, keyof HealthRecord, keyof HealthRecord][]).map(([label, vk, pk]) => (
          <ClinicalRow key={vk} label={label} valueKey={vk} plKey={pk} form={form} set={set} />
        ))}
      </div>

      {/* Sản phụ khoa */}
      <SubHeader title="Sản phụ khoa" />
      <ClinicalRow label="Sản phụ khoa" valueKey="khamSanPhuKhoa" plKey="plKhamSanKhoa" form={form} set={set} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-muted/40 rounded-lg">
        <Field label="Tuổi bắt đầu kinh nguyệt">
          <Input type="number" value={form.tuoiBatDauKinhNguyet ?? ''} onChange={e => set('tuoiBatDauKinhNguyet', num(e.target.value))} />
        </Field>
        <Field label="Tính chất kinh nguyệt">
          <Input value={form.tinhChatKinhNguyet ?? ''} onChange={e => set('tinhChatKinhNguyet', e.target.value)} />
        </Field>
        <Field label="Chu kỳ kinh (ngày)">
          <Input type="number" value={form.chuKyKinh ?? ''} onChange={e => set('chuKyKinh', num(e.target.value))} />
        </Field>
        <Field label="Lượng kinh (ngày)">
          <Input type="number" value={form.luongKinh ?? ''} onChange={e => set('luongKinh', num(e.target.value))} />
        </Field>
        <Field label="PARA">
          <Input value={form.para ?? ''} onChange={e => set('para', e.target.value)} />
        </Field>
        <Field label="Số lần mổ sản. phụ khoa">
          <Input type="number" value={form.soLanMoSanPhuKhoa ?? ''} onChange={e => set('soLanMoSanPhuKhoa', num(e.target.value))} />
        </Field>
        <Field label="Mô tả mổ sản. phụ khoa">
          <Input value={form.moTaMoSanPhuKhoa ?? ''} onChange={e => set('moTaMoSanPhuKhoa', e.target.value)} />
        </Field>
        <Field label="Mô tả BPTT">
          <Input value={form.moTaBptt ?? ''} onChange={e => set('moTaBptt', e.target.value)} />
        </Field>
        <div className="flex flex-wrap gap-4 col-span-2 md:col-span-4 pt-1">
          {([
            ['dauBungKinh', 'Đau bụng kinh'],
            ['daLapGiaDinh', 'Đã lập gia đình'],
            ['apDungBptt', 'Áp dụng BPTT'],
          ] as [keyof HealthRecord, string][]).map(([k, l]) => (
            <label key={k} className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={Boolean(form[k])} onCheckedChange={v => set(k, v)} />
              <span className="text-sm">{l}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Mắt */}
      <SubHeader title="Mắt" />
      <ClinicalRow label="Khám mắt" valueKey="khamMat" plKey="plKhamMat" form={form} set={set} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Field label="Mắt trái (không kính)">
          <Input value={form.kqMatTraiKhongKinh ?? ''} onChange={e => set('kqMatTraiKhongKinh', e.target.value)} />
        </Field>
        <Field label="Mắt phải (không kính)">
          <Input value={form.kqMatPhaiKhongKinh ?? ''} onChange={e => set('kqMatPhaiKhongKinh', e.target.value)} />
        </Field>
        <Field label="Mắt trái (có kính)">
          <Input value={form.kqMatTraiCoKinh ?? ''} onChange={e => set('kqMatTraiCoKinh', e.target.value)} />
        </Field>
        <Field label="Mắt phải (có kính)">
          <Input value={form.kqMatPhaiCoKinh ?? ''} onChange={e => set('kqMatPhaiCoKinh', e.target.value)} />
        </Field>
      </div>

      {/* Tai mũi họng */}
      <SubHeader title="Tai - Mũi - Họng" />
      <ClinicalRow label="Khám tai mũi họng" valueKey="khamTaiMuiHong" plKey="plKhamTmh" form={form} set={set} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Field label="Nói thường (Tai trái)">
          <Input type="number" value={form.noiThuongTaiTrai ?? ''} onChange={e => set('noiThuongTaiTrai', num(e.target.value))} />
        </Field>
        <Field label="Nói thường (Tai phải)">
          <Input type="number" value={form.noiThuongTaiPhai ?? ''} onChange={e => set('noiThuongTaiPhai', num(e.target.value))} />
        </Field>
        <Field label="Nói thầm (Tai trái)">
          <Input type="number" value={form.noiThamTaiTrai ?? ''} onChange={e => set('noiThamTaiTrai', num(e.target.value))} />
        </Field>
        <Field label="Nói thầm (Tai phải)">
          <Input type="number" value={form.noiThamTaiPhai ?? ''} onChange={e => set('noiThamTaiPhai', num(e.target.value))} />
        </Field>
      </div>

      {/* Răng hàm mặt */}
      <SubHeader title="Răng - Hàm - Mặt" />
      <ClinicalRow label="Khám răng hàm mặt" valueKey="khamRangHamMat" plKey="plKhamRhm" form={form} set={set} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Hàm trên">
          <Input value={form.hamTren ?? ''} onChange={e => set('hamTren', e.target.value)} />
        </Field>
        <Field label="Hàm dưới">
          <Input value={form.hamDuoi ?? ''} onChange={e => set('hamDuoi', e.target.value)} />
        </Field>
      </div>
    </div>
  );

  const renderLab = () => (
    <div className="space-y-5">
      <SectionHeader icon={<FlaskConical className="h-4 w-4" />} title="Xét nghiệm" />

      {/* Công thức máu */}
      <div>
        <SubHeader title="Công thức máu" />
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          {([
            ['wbc', 'WBC (K/μL)'], ['rbc', 'RBC (M/μL)'], ['hgb', 'HGB (g/dL)'],
            ['plt', 'PLT (K/μL)'], ['vss', 'VSS (mm/h)'], ['hba1c', 'HbA1c (%)'],
          ] as [keyof HealthRecord, string][]).map(([k, l]) => (
            <Field key={k} label={l}>
              <Input type="number" step="0.01" value={(form[k] as number) ?? ''} onChange={e => set(k, num(e.target.value))} />
            </Field>
          ))}
        </div>
      </div>

      {/* Sinh hóa máu */}
      <div>
        <SubHeader title="Sinh hóa máu" />
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          {([
            ['glucoza', 'Glucoza (mmol/L)'], ['ure', 'Ure (mmol/L)'],
            ['creatinin', 'Creatinin (μmol/L)'], ['auric', 'A. Uric (μmol/L)'],
            ['cholesterol', 'Cholesterol (mmol/L)'], ['triglycerid', 'Triglycerid (mmol/L)'],
            ['hdl', 'HDL (mmol/L)'], ['ldl', 'LDL (mmol/L)'],
            ['got', 'GOT (U/L)'], ['gpt', 'GPT (U/L)'],
            ['ggt', 'GGT (U/L)'], ['albumin', 'Albumin (g/L)'],
            ['bilirubinTp', 'Bilirubin TP (μmol/L)'], ['bilirubinTt', 'Bilirubin TT (μmol/L)'],
            ['bilirubinGt', 'Bilirubin GT (μmol/L)'], ['ckmb', 'CKMB (U/L)'],
            ['canxi', 'Canxi (mmol/L)'],
          ] as [keyof HealthRecord, string][]).map(([k, l]) => (
            <Field key={k} label={l}>
              <Input type="number" step="0.01" value={(form[k] as number) ?? ''} onChange={e => set(k, num(e.target.value))} />
            </Field>
          ))}
        </div>
      </div>

      {/* Huyết thanh */}
      <div>
        <SubHeader title="Huyết thanh học" />
        <div className="flex flex-wrap gap-6">
          {([
            ['hbsag', 'HBsAg'], ['hav', 'HAV'], ['hcv', 'HCV'],
            ['hev', 'HEV'], ['hpylori', 'H. Pylori'],
          ] as [keyof HealthRecord, string][]).map(([k, l]) => (
            <label key={k} className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={Boolean(form[k])} onCheckedChange={v => set(k, v)} />
              <span className="text-sm font-medium">{l}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded ${form[k] ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                {form[k] ? 'Dương tính' : 'Âm tính'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Nước tiểu */}
      <div>
        <SubHeader title="Nước tiểu" />
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {([
            ['ntLeu', 'Bạch cầu (LEU)'], ['ntNit', 'Nitrite (NIT)'], ['ntPro', 'Protein (PRO)'],
            ['ntEry', 'Hồng cầu (ERY)'], ['ntGlu', 'Glucose (GLU)'],
            ['ntKet', 'Ketone (KET)'], ['ntBil', 'Bilirubin (BIL)'],
            ['ntUbg', 'Urobilinogen (UBG)'],
          ] as [keyof HealthRecord, string][]).map(([k, l]) => (
            <Field key={k} label={l}>
              <Input value={(form[k] as string) ?? ''} onChange={e => set(k, e.target.value)} placeholder="Âm/Dương..." />
            </Field>
          ))}
          <Field label="pH">
            <Input type="number" step="0.1" value={form.ntPh ?? ''} onChange={e => set('ntPh', num(e.target.value))} />
          </Field>
          <Field label="Tỷ trọng (SG)">
            <Input type="number" step="0.001" value={form.ntSg ?? ''} onChange={e => set('ntSg', num(e.target.value))} />
          </Field>
        </div>
      </div>

      {/* Cận lâm sàng hình ảnh */}
      <div>
        <SubHeader title="Chẩn đoán hình ảnh" />
        <div className="grid grid-cols-2 gap-3">
          {([
            ['sieuAmOBung', 'Siêu âm ổ bụng'],
            ['saTuyenGiap', 'Siêu âm tuyến giáp'],
            ['saTim', 'Siêu âm tim'],
            ['saDopplerMachKhac', 'Siêu âm Doppler mạch / SA khác'],
            ['saVu', 'Siêu âm vú'],
            ['dienTim', 'Điện tim'],
            ['noiSoiTmh', 'Nội soi TMH'],
            ['noiSoiDaDay', 'Nội soi dạ dày'],
            ['noiSoiDaiTrang', 'Nội soi đại tràng'],
            ['chucNangHoHap', 'Chức năng hô hấp'],
            ['loangXuong', 'Loãng xương'],
            ['xoVuaMach', 'Xơ vữa mạch'],
            ['luuHuyetNao', 'Lưu huyết não'],
            ['xquangTimPhoi', 'X-quang tim phổi'],
            ['xquangKhac', 'X-quang khác'],
            ['ctCanThiep', 'CT can thiệp'],
            ['sinhThiet', 'Sinh thiết'],
          ] as [keyof HealthRecord, string][]).map(([k, l]) => (
            <Field key={k} label={l}>
              <Input value={(form[k] as string) ?? ''} onChange={e => set(k, e.target.value)} placeholder="Kết quả..." />
            </Field>
          ))}
        </div>
      </div>

      {/* Phụ khoa CLS */}
      <div>
        <SubHeader title="Cận lâm sàng phụ khoa" />
        <div className="grid grid-cols-2 gap-3">
          {([
            ['soiCtc', 'Soi CTC'],
            ['papmer', 'Pap smear'],
            ['viaTest', 'VIA test (CTC + Acid Acetic)'],
            ['viliTest', 'VILI test (CTC + Lugol)'],
            ['xnTeBaoCoTuCung', 'Xét nghiệm tế bào cổ tử cung'],
            ['xnHpv', 'Xét nghiệm HPV'],
          ] as [keyof HealthRecord, string][]).map(([k, l]) => (
            <Field key={k} label={l}>
              <Input value={(form[k] as string) ?? ''} onChange={e => set(k, e.target.value)} placeholder="Kết quả..." />
            </Field>
          ))}
        </div>
      </div>
    </div>
  );

  const renderConclusion = () => (
    <div className="space-y-5">
      <SectionHeader icon={<FileText className="h-4 w-4" />} title="Kết luận & Xử trí" />

      <div className="grid grid-cols-1 gap-4">
        <Field label="Kết quả CLS tổng hợp">
          <Input value={form.ketQuaCls ?? ''} onChange={e => set('ketQuaCls', e.target.value)} />
        </Field>
        <Field label="Đánh giá CLS">
          <Input value={form.danhGiaCls ?? ''} onChange={e => set('danhGiaCls', e.target.value)} />
        </Field>
        <Field label="Mô tả kết luận">
          <Textarea rows={3} value={form.moTaKetLuan ?? ''} onChange={e => set('moTaKetLuan', e.target.value)} placeholder="Tóm tắt kết quả khám sức khỏe..." />
        </Field>
        <Field label="Hướng giải quyết">
          <Textarea rows={2} value={form.huongGiaiQuyet ?? ''} onChange={e => set('huongGiaiQuyet', e.target.value)} placeholder="Điều trị ngoại trú, nhập viện, theo dõi..." />
        </Field>
        <Field label="Người kết luận">
          <Input value={form.nguoiKetLuan ?? ''} onChange={e => set('nguoiKetLuan', e.target.value)} />
        </Field>
      </div>

      {/* Xử trí */}
      <div>
        <SubHeader title="Xử trí" />
        <div className="flex gap-6">
          {([
            ['xuTriDt', 'Điều trị (ĐT)'],
            ['xuTriTd', 'Theo dõi (TD)'],
            ['xuTriCk', 'Chuyển khoa (CK)'],
            ['luuY', 'Lưu ý'],
          ] as [keyof HealthRecord, string][]).map(([k, l]) => (
            <label key={k} className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={Boolean(form[k])} onCheckedChange={v => set(k, v)} />
              <span className="text-sm font-medium">{l}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Bệnh phát hiện */}
      <div>
        <SubHeader title="Nội khoa" />
        <CheckGroup form={form} set={set} items={[
          ['laoPhoi', 'Lao phổi'],
          ['ungThuPhoi', 'Ung thư phổi'],
          ['viemXoangCap', 'Viêm xoang. mũi họng. thanh quản cấp'],
          ['viemXoangMan', 'Viêm xoang. mũi họng. thanh quản mãn'],
          ['viemPheQuanCap', 'Viêm phế quản cấp'],
          ['viemPheQuanMan', 'Viêm phế quản mãn'],
          ['viemPhoi', 'Viêm phổi'],
          ['henPheQuanDiUng', 'Hen phế quản. giãn phế quản. dị ứng'],
          ['iaCHayViemDaDayRuot', 'Ỉa chảy. viêm dạ dày. ruột do NT'],
          ['noiTiet', 'Nội tiết'],
          ['benhTamThan', 'Bệnh tâm thần'],
          ['benhThanKinhTwNgoaiBien', 'Bệnh thần kinh TW và ngoại biên'],
          ['haCanTheoDoi', 'HA cần theo dõi'],
          ['haCanDieuTri', 'HA cần điều trị'],
          ['benhTimMach', 'Bệnh tim mạch'],
          ['benhVanTim', 'Bệnh van tim'],
          ['roiLoanNhipTim', 'Rối loạn nhịp tim'],
          ['viemDaDay', 'Viêm dạ dày'],
          ['viemDaiTrang', 'Viêm đại tràng'],
          ['basedow', 'Basedow'],
          ['tieuDuong', 'Tiểu đường'],
          ['tangRlDuong', 'Tăng. RL đường'],
          ['rlMoMau', 'Rối loạn mỡ máu'],
          ['tangMenGan', 'Tăng men gan'],
          ['tangAcidUric', 'Tăng Acid Uric'],
          ['viemGanXoGan', 'Viêm gan. xơ gan'],
          ['benhThanTietNieu', 'Bệnh thận. tiết niệu'],
          ['soiTietNieu', 'Sỏi tiết niệu'],
          ['nangThan', 'Nang thận'],
          ['nangNhanTuyenGiap', 'Nang. nhân tuyến giáp'],
          ['ganNhiemMo', 'Gan nhiễm mỡ'],
          ['soiPolipTuiMat', 'Sỏi. polip túi mật'],
          ['ungThuNoiKhoa', 'Ung thư (nội khoa)'],
          ['benhSotRet', 'Bệnh sốt rét'],
        ]} />
        <div className="mt-2">
          <Field label="Bệnh khác (nội khoa)">
            <Input value={form.benhKhacNoiKhoa ?? ''} onChange={e => set('benhKhacNoiKhoa', e.target.value)} />
          </Field>
        </div>
      </div>

      <div>
        <SubHeader title="Tai - Mũi - Họng" />
        <CheckGroup form={form} set={set} items={[
          ['vmuiHongAmidalXoang', 'V. mũi họng. Amidal. xoang mạn tính'],
          ['viemTai', 'Viêm tai'],
          ['polipMui', 'Polip mũi'],
        ]} />
        <div className="mt-2">
          <Field label="Bệnh khác (TMH)">
            <Input value={form.benhKhacTmh ?? ''} onChange={e => set('benhKhacTmh', e.target.value)} />
          </Field>
        </div>
      </div>

      <div>
        <SubHeader title="Răng - Hàm - Mặt" />
        <CheckGroup form={form} set={set} items={[
          ['sauRang', 'Sâu răng'],
          ['rangMocLech', 'Răng mọc lệch'],
          ['matRang', 'Mất răng'],
        ]} />
        <div className="mt-2">
          <Field label="Bệnh khác (RHM)">
            <Input value={form.benhKhacRhm ?? ''} onChange={e => set('benhKhacRhm', e.target.value)} />
          </Field>
        </div>
      </div>

      <div>
        <SubHeader title="Mắt" />
        <CheckGroup form={form} set={set} items={[
          ['tatKhucXa', 'Tật khúc xạ'],
          ['laoThi', 'Lão thị'],
          ['giamThiLuc', 'Giảm thị lực'],
          ['ducThuyTinhThe', 'Đục thuỷ tinh thể'],
        ]} />
        <div className="mt-2">
          <Field label="Bệnh khác (Mắt)">
            <Input value={form.benhKhacMat ?? ''} onChange={e => set('benhKhacMat', e.target.value)} />
          </Field>
        </div>
      </div>

      <div>
        <SubHeader title="Ngoại khoa" />
        <CheckGroup form={form} set={set} items={[
          ['ucacLoai', 'U các loại'],
          ['nangNhanTuyenVu', 'Nang. nhân tuyến vú'],
          ['tri', 'Trĩ'],
          ['benhXuongKhop', 'Bệnh xương khớp'],
          ['vetMoOBung', 'Vết mổ ổ bụng'],
          ['gayXuongCu', 'Gãy xương cũ'],
          ['matDotNgonTayChanCu', 'Mất đốt ngón tay chân cũ'],
          ['taiNanChanThuongCu', 'Tai nạn. chấn thương cũ'],
          ['sayThai', 'Sảy thai'],
        ]} />
        <div className="mt-2">
          <Field label="Bệnh khác (ngoại khoa)">
            <Input value={form.benhKhacNgoaiKhoa ?? ''} onChange={e => set('benhKhacNgoaiKhoa', e.target.value)} />
          </Field>
        </div>
      </div>

      <div>
        <SubHeader title="Phụ khoa" />
        <CheckGroup form={form} set={set} items={[
          ['viemNamAmDao', 'Viêm. nấm âm đạo'],
          ['viemCtc', 'Viêm CTC'],
          ['nhanXoTuCung', 'Nhân xơ tử cung'],
          ['uxoTuCung', 'U xơ tử cung'],
          ['nangBt', 'Nang BT'],
          ['polipCtc', 'Polip CTC'],
        ]} />
        <div className="mt-2">
          <Field label="Bệnh khác (phụ khoa)">
            <Input value={form.benhKhacPhuKhoa ?? ''} onChange={e => set('benhKhacPhuKhoa', e.target.value)} />
          </Field>
        </div>
      </div>

      <div>
        <SubHeader title="Da liễu" />
        <CheckGroup form={form} set={set} items={[
          ['viemDa', 'Viêm da'],
          ['vayNen', 'Vảy nến'],
          ['langBen', 'Lang ben'],
          ['namDa', 'Nấm da'],
          ['sanNgua', 'Sẩn ngứa'],
        ]} />
        <div className="mt-2">
          <Field label="Bệnh khác (da liễu)">
            <Input value={form.benhKhacDaLieu ?? ''} onChange={e => set('benhKhacDaLieu', e.target.value)} />
          </Field>
        </div>
      </div>
    </div>
  );

  const sectionContent = [renderGeneral, renderClinical, renderLab, renderConclusion];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            {record ? 'Cập nhật kết quả khám sức khỏe' : 'Thêm mới kết quả khám sức khỏe'}
          </DialogTitle>
        </DialogHeader>

        {/* Step tabs */}
        <div className="flex gap-1 border-b pb-3 flex-wrap">
          {SECTIONS.map((s, i) => (
            <button
              key={s.key}
              onClick={() => setStep(i)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${step === i
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
            >
              {s.icon}{s.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="min-h-[300px] py-2">
          {sectionContent[step]()}
        </div>

        {/* Footer */}
        <DialogFooter className="flex items-center justify-between gap-2 pt-2 border-t">
          <div className="flex gap-1.5">
            {SECTIONS.map((_, i) => (
              <div key={i} className={`h-1.5 w-6 rounded-full transition-colors ${i === step ? 'bg-primary' : 'bg-muted'}`} />
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isPending}>Hủy</Button>
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={isPending}>
                <ChevronLeft className="h-4 w-4 mr-1" />Quay lại
              </Button>
            )}
            {step < SECTIONS.length - 1 ? (
              <Button2 onClick={() => setStep(s => s + 1)}>
                Tiếp theo<ChevronRight className="h-4 w-4 ml-1" />
              </Button2>
            ) : (
              <Button2 onClick={handleSave} disabled={isPending}>
                {isPending
                  ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2 inline-block" />Đang lưu...</>
                  : record ? 'Cập nhật' : 'Lưu hồ sơ'
                }
              </Button2>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}