// components/MedicalDetailModal.tsx

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { Card } from '@/shared/components/ui/card';
import Button from '@/shared/components/ui/button/Button';
import {
  Activity, Heart, AlertCircle, User,
  Building2, CalendarDays, Stethoscope,
  FlaskConical, FileText, CheckCircle2,
} from 'lucide-react';
import type { HealthRecord } from './MedicalFormModal';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  isOpen: boolean;
  onClose: () => void;
  record: HealthRecord | null;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function HealthLevelBadge({ level, label }: { level?: number; label?: string }) {
  if (!level && !label) return <span className="text-muted-foreground text-sm">—</span>;
  const map: Record<number, string> = {
    1: 'bg-emerald-100 text-emerald-700',
    2: 'bg-blue-100 text-blue-700',
    3: 'bg-yellow-100 text-yellow-700',
    4: 'bg-orange-100 text-orange-700',
    5: 'bg-red-100 text-red-700',
  };
  const cls = level ? (map[level] ?? 'bg-gray-100 text-gray-700') : 'bg-gray-100 text-gray-700';
  const text = label ?? (level ? `Loại ${level}` : '—');
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}>
      {text}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value ?? '—'}</span>
    </div>
  );
}

function SectionCard({
  icon, title, children, className = '',
}: {
  icon: React.ReactNode; title: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`rounded-lg border overflow-hidden ${className}`}>
      <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/40 border-b">
        <span className="text-primary">{icon}</span>
        <span className="text-sm font-semibold">{title}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function SubLabel({ title }: { title: string }) {
  return (
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 mt-3 first:mt-0">{title}</p>
  );
}

function ClinicalItem({ label, value, pl }: { label: string; value?: string; pl?: number }) {
  if (!value && !pl) return null;
  return (
    <div className="flex items-center justify-between py-1.5 border-b last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        {value && <span className="text-sm">{value}</span>}
        {pl && <HealthLevelBadge level={pl} />}
      </div>
    </div>
  );
}

function LabValue({ label, value, unit }: { label: string; value?: number | string | null; unit?: string }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-md bg-muted/30 border">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">
        {value}{unit && <span className="text-xs text-muted-foreground ml-1">{unit}</span>}
      </span>
    </div>
  );
}

function SerologyCapsule({ label, positive }: { label: string; positive?: boolean }) {
  if (positive === undefined || positive === null) return null;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
      positive ? 'bg-red-100 text-red-700' : 'bg-emerald-50 text-emerald-600'
    }`}>
      {positive ? '✕' : '✓'} {label}: {positive ? 'Dương tính' : 'Âm tính'}
    </span>
  );
}

function DiagnosisTag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
      <AlertCircle className="h-3 w-3" />{label}
    </span>
  );
}

function DiagnosisGroup({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="text-xs font-semibold text-red-700 mb-1.5">{title}</p>
      <div className="flex flex-wrap gap-2">
        {items.map(l => <DiagnosisTag key={l} label={l} />)}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function MedicalDetailModal({ isOpen, onClose, record }: Props) {
  if (!record) return null;

  // ── Bệnh phát hiện theo nhóm ──────────────────────────────────────────────

  const diagNhomNoiKhoa: [keyof HealthRecord, string][] = [
    ['laoPhoi',                 'Lao phổi'],
    ['ungThuPhoi',              'Ung thư phổi'],
    ['viemXoangCap',            'Viêm xoang. mũi họng. thanh quản cấp'],
    ['viemXoangMan',            'Viêm xoang. mũi họng. thanh quản mãn'],
    ['viemPheQuanCap',          'Viêm phế quản cấp'],
    ['viemPheQuanMan',          'Viêm phế quản mãn'],
    ['viemPhoi',                'Viêm phổi'],
    ['henPheQuanDiUng',         'Hen phế quản. giãn phế quản. dị ứng'],
    ['iaCHayViemDaDayRuot',     'Ỉa chảy. viêm dạ dày. ruột do NT'],
    ['noiTiet',                 'Nội tiết'],
    ['benhTamThan',             'Bệnh tâm thần'],
    ['benhThanKinhTwNgoaiBien', 'Bệnh thần kinh TW và ngoại biên'],
    ['haCanTheoDoi',            'HA cần theo dõi'],
    ['haCanDieuTri',            'HA cần điều trị'],
    ['benhTimMach',             'Bệnh tim mạch'],
    ['benhVanTim',              'Bệnh van tim'],
    ['roiLoanNhipTim',          'Rối loạn nhịp tim'],
    ['viemDaDay',               'Viêm dạ dày'],
    ['viemDaiTrang',            'Viêm đại tràng'],
    ['basedow',                 'Basedow'],
    ['tieuDuong',               'Tiểu đường'],
    ['tangRlDuong',             'Tăng. RL đường'],
    ['rlMoMau',                 'Rối loạn mỡ máu'],
    ['tangMenGan',              'Tăng men gan'],
    ['tangAcidUric',            'Tăng Acid Uric'],
    ['viemGanXoGan',            'Viêm gan. xơ gan'],
    ['benhThanTietNieu',        'Bệnh thận. tiết niệu'],
    ['soiTietNieu',             'Sỏi tiết niệu'],
    ['nangThan',                'Nang thận'],
    ['nangNhanTuyenGiap',       'Nang. nhân tuyến giáp'],
    ['ganNhiemMo',              'Gan nhiễm mỡ'],
    ['soiPolipTuiMat',          'Sỏi. polip túi mật'],
    ['ungThuNoiKhoa',           'Ung thư (nội khoa)'],
    ['benhSotRet',              'Bệnh sốt rét'],
  ];

  const diagNhomTmh: [keyof HealthRecord, string][] = [
    ['vmuiHongAmidalXoang', 'V. mũi họng. Amidal. xoang mạn tính'],
    ['viemTai',             'Viêm tai'],
    ['polipMui',            'Polip mũi'],
  ];

  const diagNhomRhm: [keyof HealthRecord, string][] = [
    ['sauRang',    'Sâu răng'],
    ['rangMocLech','Răng mọc lệch'],
    ['matRang',    'Mất răng'],
  ];

  const diagNhomMat: [keyof HealthRecord, string][] = [
    ['tatKhucXa',    'Tật khúc xạ'],
    ['laoThi',       'Lão thị'],
    ['giamThiLuc',   'Giảm thị lực'],
    ['ducThuyTinhThe','Đục thuỷ tinh thể'],
  ];

  const diagNhomNgoai: [keyof HealthRecord, string][] = [
    ['ucacLoai',            'U các loại'],
    ['nangNhanTuyenVu',     'Nang. nhân tuyến vú'],
    ['tri',                 'Trĩ'],
    ['benhXuongKhop',       'Bệnh xương khớp'],
    ['vetMoOBung',          'Vết mổ ổ bụng'],
    ['gayXuongCu',          'Gãy xương cũ'],
    ['matDotNgonTayChanCu', 'Mất đốt ngón tay chân cũ'],
    ['taiNanChanThuongCu',  'Tai nạn. chấn thương cũ'],
    ['sayThai',             'Sảy thai'],
  ];

  const diagNhomPhuKhoa: [keyof HealthRecord, string][] = [
    ['viemNamAmDao', 'Viêm. nấm âm đạo'],
    ['viemCtc',      'Viêm CTC'],
    ['nhanXoTuCung', 'Nhân xơ tử cung'],
    ['uxoTuCung',    'U xơ tử cung'],
    ['nangBt',       'Nang BT'],
    ['polipCtc',     'Polip CTC'],
  ];

  const diagNhomDaLieu: [keyof HealthRecord, string][] = [
    ['viemDa',  'Viêm da'],
    ['vayNen',  'Vảy nến'],
    ['langBen', 'Lang ben'],
    ['namDa',   'Nấm da'],
    ['sanNgua', 'Sẩn ngứa'],
  ];

  const filterDiag = (arr: [keyof HealthRecord, string][]) =>
    arr.filter(([k]) => Boolean(record[k])).map(([, l]) => l);

  const hasAnyDiag = [
    diagNhomNoiKhoa, diagNhomTmh, diagNhomRhm, diagNhomMat,
    diagNhomNgoai, diagNhomPhuKhoa, diagNhomDaLieu,
  ].some(g => g.some(([k]) => Boolean(record[k])));

  // Clinical filled rows
  const clinicalItems: [string, keyof HealthRecord, keyof HealthRecord][] = [
    ['Tuần hoàn',        'khamTuanHoan',    'plKhamTuanHoan'],
    ['Hô hấp',           'khamHoHap',       'plKhamHoHap'],
    ['Tiêu hóa',         'khamTieuHoa',     'plKhamTieuHoa'],
    ['Thận - Tiết niệu', 'khamThanTietNieu','plKhamThanTietNieu'],
    ['Nội tiết',         'khamNoiTiet',     'plKhamNoiTiet'],
    ['Cơ - Xương - Khớp','khamCoXuongKhop', 'plKhamCxk'],
    ['Thần kinh',        'khamThanKinh',    'plKhamThanKinh'],
    ['Tâm thần',         'khamTamThan',     'plKhamTamThan'],
    ['Ngoại khoa',       'khamNgoai',       'plKhamNgoai'],
    ['Da liễu',          'khamDaLieu',      'plKhamDaLieu'],
    ['Sản phụ khoa',     'khamSanPhuKhoa',  'plKhamSanKhoa'],
    ['Mắt',              'khamMat',         'plKhamMat'],
    ['Tai mũi họng',     'khamTaiMuiHong',  'plKhamTmh'],
    ['Răng hàm mặt',     'khamRangHamMat',  'plKhamRhm'],
  ];
  const filledClinical = clinicalItems.filter(
    ([, vk, pk]) => record[vk] || record[pk],
  );

  // Xử trí
  const xuTri = [
    record.xuTriDt && 'Điều trị (ĐT)',
    record.xuTriTd && 'Theo dõi (TD)',
    record.xuTriCk && 'Chuyển khoa (CK)',
    record.luuY    && 'Lưu ý',
  ].filter(Boolean) as string[];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Chi tiết kết quả khám sức khỏe
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">

          {/* ── Header card ─────────────────────────────────────────────── */}
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <span className="text-xs text-blue-600 font-medium">Nhân viên</span>
                </div>
                <p className="text-lg font-bold">{record.employeeName}</p>
                {record.donVi && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <Building2 className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">{record.donVi}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-end gap-2">
                {record.ngayKham && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    {new Date(record.ngayKham + 'T00:00:00').toLocaleDateString('vi-VN', {
                      day: '2-digit', month: 'long', year: 'numeric',
                    })}
                  </div>
                )}
                {record.plSucKhoe && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">PL Sức khỏe:</span>
                    <HealthLevelBadge level={record.plSucKhoe} />
                  </div>
                )}
                {record.plTheLuc && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">PL Thể lực:</span>
                    <HealthLevelBadge level={record.plTheLuc} />
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* ── Sinh hiệu & Thông số ────────────────────────────────────── */}
          <SectionCard icon={<Heart className="h-4 w-4" />} title="Sinh hiệu & Thông số cơ bản">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <InfoRow label="Chiều cao" value={record.height ? `${record.height} cm` : undefined} />
              <InfoRow label="Cân nặng" value={record.weight ? `${record.weight} kg` : undefined} />
              <InfoRow label="Mạch" value={record.mach ? `${record.mach} lần/phút` : undefined} />
              <InfoRow label="Huyết áp" value={record.huyetAp ? `${record.huyetAp} mmHg` : undefined} />
              <InfoRow label="Nhóm máu" value={record.nhomMau} />
              <InfoRow label="PL Nghề nghiệp" value={record.phanLoaiNgheNghiep ? `Loại ${record.phanLoaiNgheNghiep}` : undefined} />
              {record.benhThongThuong && (
                <div className="col-span-2">
                  <InfoRow
                    label={`Bệnh thông thường${record.maBenhThongThuong ? ` (${record.maBenhThongThuong})` : ''}`}
                    value={record.benhThongThuong}
                  />
                </div>
              )}
              {record.benhManTinh && (
                <div className="col-span-2">
                  <InfoRow
                    label={`Bệnh mãn tính${record.maBenhManTinh ? ` (${record.maBenhManTinh})` : ''}`}
                    value={record.benhManTinh}
                  />
                </div>
              )}
              {record.soNgayNghiOm !== undefined && (
                <InfoRow label="Số ngày nghỉ ốm" value={`${record.soNgayNghiOm} ngày`} />
              )}
              {record.tienSuBenhGiaDinh && (
                <div className="col-span-2 md:col-span-4">
                  <InfoRow label="Tiền sử bệnh của gia đình" value={record.tienSuBenhGiaDinh} />
                </div>
              )}
            </div>

            {/* TNLĐ */}
            {record.biTaiNanLaoDong && (
              <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-xs font-semibold text-orange-700 mb-2">⚠ Tai nạn lao động</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {record.ngayBiTaiNanLaoDong && (
                    <InfoRow label="Ngày bị TNLĐ" value={new Date(record.ngayBiTaiNanLaoDong).toLocaleDateString('vi-VN')} />
                  )}
                  {record.soNgayDieuTriTnld !== undefined && (
                    <InfoRow label="Số ngày điều trị" value={`${record.soNgayDieuTriTnld} ngày`} />
                  )}
                  {record.tyLeGiamDinhTnld !== undefined && (
                    <InfoRow label="Tỷ lệ giám định TNLĐ" value={`${record.tyLeGiamDinhTnld}%`} />
                  )}
                  {record.namHuongTroCapTnld !== undefined && (
                    <InfoRow label="Năm hưởng trợ cấp TNLĐ" value={record.namHuongTroCapTnld} />
                  )}
                </div>
              </div>
            )}

            {/* BNN */}
            {(record.nldKskPhatHienBnn || record.nldChanDoanBnn) && (
              <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-xs font-semibold text-purple-700 mb-2">🔬 Bệnh nghề nghiệp (BNN)</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {record.tenBenhNgheNghiep && <InfoRow label="Tên BNN" value={record.tenBenhNgheNghiep} />}
                  {record.maBenhNgheNghiep && <InfoRow label="Mã BNN" value={record.maBenhNgheNghiep} />}
                  {record.chucDanhNgheKhiMacBnn && <InfoRow label="Chức danh nghề khi mắc" value={record.chucDanhNgheKhiMacBnn} />}
                  {record.theBenh && <InfoRow label="Thể bệnh" value={record.theBenh} />}
                  {record.tyLeGiamDinhBnn !== undefined && <InfoRow label="Tỷ lệ giám định BNN" value={`${record.tyLeGiamDinhBnn}%`} />}
                  {record.namGiamDinhBnn !== undefined && <InfoRow label="Năm giám định BNN" value={record.namGiamDinhBnn} />}
                  {record.namHuongTroCapBnn !== undefined && <InfoRow label="Năm hưởng trợ cấp BNN" value={record.namHuongTroCapBnn} />}
                  {record.daRuaPhoi && record.namRuaPhoi !== undefined && <InfoRow label="Năm rửa phổi" value={record.namRuaPhoi} />}
                  {record.chongChiDinhRuaPhoi && (
                    <div className="col-span-2">
                      <InfoRow label="Chống chỉ định rửa phổi" value={record.chongChiDinhRuaPhoi} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </SectionCard>

          {/* ── Khám lâm sàng ───────────────────────────────────────────── */}
          {filledClinical.length > 0 && (
            <SectionCard icon={<Stethoscope className="h-4 w-4" />} title="Khám lâm sàng">
              <div className="grid md:grid-cols-2 gap-x-8">
                {filledClinical.map(([label, vk, pk]) => (
                  <ClinicalItem
                    key={vk}
                    label={label}
                    value={record[vk] as string}
                    pl={record[pk] as number}
                  />
                ))}
              </div>

              {/* Chi tiết mắt */}
              {(record.kqMatTraiKhongKinh || record.kqMatPhaiKhongKinh || record.kqMatTraiCoKinh || record.kqMatPhaiCoKinh) && (
                <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Kết quả đo mắt</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {record.kqMatTraiKhongKinh && <InfoRow label="Mắt trái (không kính)" value={record.kqMatTraiKhongKinh} />}
                    {record.kqMatPhaiKhongKinh && <InfoRow label="Mắt phải (không kính)" value={record.kqMatPhaiKhongKinh} />}
                    {record.kqMatTraiCoKinh && <InfoRow label="Mắt trái (có kính)" value={record.kqMatTraiCoKinh} />}
                    {record.kqMatPhaiCoKinh && <InfoRow label="Mắt phải (có kính)" value={record.kqMatPhaiCoKinh} />}
                  </div>
                </div>
              )}

              {/* Chi tiết TMH */}
              {(record.noiThuongTaiTrai || record.noiThuongTaiPhai || record.noiThamTaiTrai || record.noiThamTaiPhai) && (
                <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Kết quả đo thính lực</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {record.noiThuongTaiTrai !== undefined && <InfoRow label="Nói thường (Tai trái)" value={`${record.noiThuongTaiTrai} m`} />}
                    {record.noiThuongTaiPhai !== undefined && <InfoRow label="Nói thường (Tai phải)" value={`${record.noiThuongTaiPhai} m`} />}
                    {record.noiThamTaiTrai !== undefined && <InfoRow label="Nói thầm (Tai trái)" value={`${record.noiThamTaiTrai} m`} />}
                    {record.noiThamTaiPhai !== undefined && <InfoRow label="Nói thầm (Tai phải)" value={`${record.noiThamTaiPhai} m`} />}
                  </div>
                </div>
              )}

              {/* Chi tiết RHM */}
              {(record.hamTren || record.hamDuoi) && (
                <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Hàm răng</p>
                  <div className="grid grid-cols-2 gap-2">
                    {record.hamTren && <InfoRow label="Hàm trên" value={record.hamTren} />}
                    {record.hamDuoi && <InfoRow label="Hàm dưới" value={record.hamDuoi} />}
                  </div>
                </div>
              )}
            </SectionCard>
          )}

          {/* ── Xét nghiệm ──────────────────────────────────────────────── */}
          <SectionCard icon={<FlaskConical className="h-4 w-4" />} title="Xét nghiệm">
            <div className="space-y-4">

              {/* Công thức máu */}
              {([record.wbc, record.rbc, record.hgb, record.plt, record.vss, record.hba1c] as (number | undefined)[]).some(v => v !== undefined) && (
                <div>
                  <SubLabel title="Công thức máu" />
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {([
                      [record.wbc,'WBC','K/μL'],[record.rbc,'RBC','M/μL'],
                      [record.hgb,'HGB','g/dL'],[record.plt,'PLT','K/μL'],
                      [record.vss,'VSS','mm/h'],[record.hba1c,'HbA1c','%'],
                    ] as [number|undefined, string, string][]).map(([v, l, u]) => (
                      <LabValue key={l} label={l} value={v} unit={u} />
                    ))}
                  </div>
                </div>
              )}

              {/* Sinh hóa máu */}
              {([
                record.glucoza, record.ure, record.creatinin, record.auric,
                record.cholesterol, record.triglycerid, record.hdl, record.ldl,
                record.got, record.gpt, record.ggt, record.albumin,
                record.bilirubinTp, record.bilirubinTt, record.bilirubinGt,
                record.ckmb, record.canxi,
              ]).some(v => v !== undefined) && (
                <div>
                  <SubLabel title="Sinh hóa máu" />
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                    {([
                      [record.glucoza,'Glucoza','mmol/L'],[record.ure,'Ure','mmol/L'],
                      [record.creatinin,'Creatinin','μmol/L'],[record.auric,'A. Uric','μmol/L'],
                      [record.cholesterol,'Cholesterol','mmol/L'],[record.triglycerid,'Triglycerid','mmol/L'],
                      [record.hdl,'HDL','mmol/L'],[record.ldl,'LDL','mmol/L'],
                      [record.got,'GOT','U/L'],[record.gpt,'GPT','U/L'],
                      [record.ggt,'GGT','U/L'],[record.albumin,'Albumin','g/L'],
                      [record.bilirubinTp,'Bili TP','μmol/L'],[record.bilirubinTt,'Bili TT','μmol/L'],
                      [record.bilirubinGt,'Bili GT','μmol/L'],[record.ckmb,'CKMB','U/L'],
                      [record.canxi,'Canxi','mmol/L'],
                    ] as [number|undefined, string, string][]).map(([v, l, u]) => (
                      <LabValue key={l} label={l} value={v} unit={u} />
                    ))}
                  </div>
                </div>
              )}

              {/* Huyết thanh */}
              {(record.hbsag !== undefined || record.hav !== undefined || record.hcv !== undefined
                || record.hev !== undefined || record.hpylori !== undefined) && (
                <div>
                  <SubLabel title="Huyết thanh học" />
                  <div className="flex flex-wrap gap-2">
                    <SerologyCapsule label="HBsAg"    positive={record.hbsag} />
                    <SerologyCapsule label="HAV"      positive={record.hav} />
                    <SerologyCapsule label="HCV"      positive={record.hcv} />
                    <SerologyCapsule label="HEV"      positive={record.hev} />
                    <SerologyCapsule label="H. Pylori" positive={record.hpylori} />
                  </div>
                </div>
              )}

              {/* Nước tiểu */}
              {(record.ntLeu || record.ntNit || record.ntPro || record.ntEry || record.ntGlu
                || record.ntKet || record.ntBil || record.ntUbg || record.ntPh || record.ntSg) && (
                <div>
                  <SubLabel title="Nước tiểu" />
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                    <LabValue label="Bạch cầu (LEU)"    value={record.ntLeu} />
                    <LabValue label="Nitrite (NIT)"      value={record.ntNit} />
                    <LabValue label="Protein (PRO)"      value={record.ntPro} />
                    <LabValue label="Hồng cầu (ERY)"    value={record.ntEry} />
                    <LabValue label="Glucose (GLU)"      value={record.ntGlu} />
                    <LabValue label="Ketone (KET)"       value={record.ntKet} />
                    <LabValue label="Bilirubin (BIL)"    value={record.ntBil} />
                    <LabValue label="Urobilinogen (UBG)" value={record.ntUbg} />
                    <LabValue label="pH"                 value={record.ntPh} />
                    <LabValue label="Tỷ trọng (SG)"      value={record.ntSg} />
                  </div>
                </div>
              )}

              {/* Chẩn đoán hình ảnh */}
              {([
                record.sieuAmOBung, record.saTuyenGiap, record.saTim, record.saDopplerMachKhac,
                record.saVu, record.dienTim, record.noiSoiTmh, record.noiSoiDaDay,
                record.noiSoiDaiTrang, record.chucNangHoHap, record.loangXuong,
                record.xoVuaMach, record.luuHuyetNao, record.xquangTimPhoi,
                record.xquangKhac, record.ctCanThiep, record.sinhThiet,
              ]).some(v => v) && (
                <div>
                  <SubLabel title="Chẩn đoán hình ảnh" />
                  <div className="grid md:grid-cols-2 gap-2">
                    {([
                      [record.sieuAmOBung,      'Siêu âm ổ bụng'],
                      [record.saTuyenGiap,      'Siêu âm tuyến giáp'],
                      [record.saTim,            'Siêu âm tim'],
                      [record.saDopplerMachKhac,'Siêu âm Doppler mạch / SA khác'],
                      [record.saVu,             'Siêu âm vú'],
                      [record.dienTim,          'Điện tim'],
                      [record.noiSoiTmh,        'Nội soi TMH'],
                      [record.noiSoiDaDay,      'Nội soi dạ dày'],
                      [record.noiSoiDaiTrang,   'Nội soi đại tràng'],
                      [record.chucNangHoHap,    'Chức năng hô hấp'],
                      [record.loangXuong,       'Loãng xương'],
                      [record.xoVuaMach,        'Xơ vữa mạch'],
                      [record.luuHuyetNao,      'Lưu huyết não'],
                      [record.xquangTimPhoi,    'X-quang tim phổi'],
                      [record.xquangKhac,       'X-quang khác'],
                      [record.ctCanThiep,       'CT can thiệp'],
                      [record.sinhThiet,        'Sinh thiết'],
                    ] as [string|undefined, string][]).filter(([v]) => v).map(([v, l]) => (
                      <div key={l} className="flex gap-2 p-2 bg-muted/30 rounded-md border text-sm">
                        <span className="text-muted-foreground shrink-0">{l}:</span>
                        <span className="font-medium">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CLS phụ khoa */}
              {([record.soiCtc, record.papmer, record.viaTest, record.viliTest, record.xnTeBaoCoTuCung, record.xnHpv]).some(v => v) && (
                <div>
                  <SubLabel title="Cận lâm sàng phụ khoa" />
                  <div className="grid md:grid-cols-2 gap-2">
                    {([
                      [record.soiCtc,          'Soi CTC'],
                      [record.papmer,          'Pap smear'],
                      [record.viaTest,         'VIA test'],
                      [record.viliTest,        'VILI test'],
                      [record.xnTeBaoCoTuCung, 'XN tế bào cổ tử cung'],
                      [record.xnHpv,           'XN HPV'],
                    ] as [string|undefined, string][]).filter(([v]) => v).map(([v, l]) => (
                      <div key={l} className="flex gap-2 p-2 bg-muted/30 rounded-md border text-sm">
                        <span className="text-muted-foreground shrink-0">{l}:</span>
                        <span className="font-medium">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </SectionCard>

          {/* ── Kết luận ────────────────────────────────────────────────── */}
          <SectionCard icon={<FileText className="h-4 w-4" />} title="Kết luận & Xử trí">
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {record.ketQuaCls && <InfoRow label="Kết quả CLS" value={record.ketQuaCls} />}
                {record.danhGiaCls && <InfoRow label="Đánh giá CLS" value={record.danhGiaCls} />}
                {record.moTaKetLuan && (
                  <div className="md:col-span-2">
                    <InfoRow label="Mô tả kết luận" value={record.moTaKetLuan} />
                  </div>
                )}
                {record.huongGiaiQuyet && (
                  <div className="md:col-span-2">
                    <InfoRow label="Hướng giải quyết" value={record.huongGiaiQuyet} />
                  </div>
                )}
                {record.nguoiKetLuan && <InfoRow label="Người kết luận" value={record.nguoiKetLuan} />}
              </div>

              {xuTri.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {xuTri.map(x => (
                    <span key={x} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      <CheckCircle2 className="h-3 w-3" />{x}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </SectionCard>

          {/* ── Bệnh phát hiện ──────────────────────────────────────────── */}
          {hasAnyDiag && (
            <Card className="p-4 bg-red-50 border-red-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                <div className="space-y-3 w-full">
                  <p className="text-sm font-semibold text-red-800">Bệnh phát hiện qua khám</p>

                  <DiagnosisGroup title="Nội khoa"           items={filterDiag(diagNhomNoiKhoa)} />
                  <DiagnosisGroup title="Tai - Mũi - Họng"   items={filterDiag(diagNhomTmh)} />
                  <DiagnosisGroup title="Răng - Hàm - Mặt"   items={filterDiag(diagNhomRhm)} />
                  <DiagnosisGroup title="Mắt"                items={filterDiag(diagNhomMat)} />
                  <DiagnosisGroup title="Ngoại khoa"         items={filterDiag(diagNhomNgoai)} />
                  <DiagnosisGroup title="Phụ khoa"           items={filterDiag(diagNhomPhuKhoa)} />
                  <DiagnosisGroup title="Da liễu"            items={filterDiag(diagNhomDaLieu)} />

                  {/* Bệnh khác dạng text */}
                  {([
                    [record.benhKhacNoiKhoa, 'Bệnh khác (nội khoa)'],
                    [record.benhKhacTmh,     'Bệnh khác (TMH)'],
                    [record.benhKhacRhm,     'Bệnh khác (RHM)'],
                    [record.benhKhacMat,     'Bệnh khác (mắt)'],
                    [record.benhKhacNgoaiKhoa,'Bệnh khác (ngoại khoa)'],
                    [record.benhKhacPhuKhoa, 'Bệnh khác (phụ khoa)'],
                    [record.benhKhacDaLieu,  'Bệnh khác (da liễu)'],
                  ] as [string|undefined, string][]).filter(([v]) => v).map(([v, l]) => (
                    <div key={l} className="text-xs text-red-700">
                      <span className="font-medium">{l}:</span> {v}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}