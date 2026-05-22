import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button as Button2 } from "@/shared/components/ui/button/Button2";
import Button from "@/shared/components/ui/button/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  Activity,
  Heart,
  User,
  CalendarDays,
  ClipboardList,
  X,
  Building2,
  Stethoscope,
  FlaskConical,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { toast } from "@/shared/hooks/use-toast";
import { routineHealthCheckApi } from "../../api/medicalApi";
import type { HealthRecord } from "../../components/MedicalFormModal";
import MedicalDetailModal from "../../components/MedicalDetailModal";
import MedicalFormModal from "../../components/MedicalFormModal";
import BulkAddHealthModal from "../../components/BulkAddHealthModal";
import BulkEditHealthModal from "../../components/BulkEditHealthModal";
import { Checkbox } from "@/components/ui/checkbox";
import { FileDown } from "lucide-react";

// ─── Health Level Badge ──────────────────────────────────────────────────────

function HealthLevelBadge({
  level,
  label,
}: {
  level?: number;
  label?: string;
}) {
  if (!level && !label)
    return <span className="text-muted-foreground text-xs">—</span>;
  const map: Record<number, { label: string; cls: string }> = {
    1: { label: "Loại I", cls: "bg-emerald-100 text-emerald-700" },
    2: { label: "Loại II", cls: "bg-blue-100   text-blue-700" },
    3: { label: "Loại III", cls: "bg-yellow-100 text-yellow-700" },
    4: { label: "Loại IV", cls: "bg-orange-100 text-orange-700" },
    5: { label: "Loại V", cls: "bg-red-100    text-red-700" },
  };
  const cfg = map[level!] ?? {
    label: label ?? `Loại ${level}`,
    cls: "bg-gray-100 text-gray-700",
  };
  const text = label ?? cfg.label;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${cfg.cls}`}
    >
      {text}
    </span>
  );
}

// ─── Detail Panel sub-components (từ MedicalDetailModal) ─────────────────────

function InfoRow({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value ?? "—"}</span>
    </div>
  );
}

function SectionCard({
  icon,
  title,
  children,
  className = "",
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  className?: string;
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
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 mt-3 first:mt-0">
      {title}
    </p>
  );
}

function ClinicalItem({
  label,
  value,
  pl,
}: {
  label: string;
  value?: string;
  pl?: number;
}) {
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

function LabValue({
  label,
  value,
  unit,
}: {
  label: string;
  value?: number | string | null;
  unit?: string;
}) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-md bg-muted/30 border">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">
        {value}
        {unit && (
          <span className="text-xs text-muted-foreground ml-1">{unit}</span>
        )}
      </span>
    </div>
  );
}

function SerologyCapsule({
  label,
  positive,
}: {
  label: string;
  positive?: boolean;
}) {
  if (positive === undefined || positive === null) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
        positive ? "border text-red-700" : "border text-emerald-600"
      }`}
    >
      {positive ? "✕" : "✓"} {label}: {positive ? "Dương tính" : "Âm tính"}
    </span>
  );
}

function DiagnosisTag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium  border ">
      <AlertCircle className="h-3 w-3" />
      {label}
    </span>
  );
}

function DiagnosisGroup({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="text-xs font-semibold mb-1.5">{title}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((l) => (
          <DiagnosisTag key={l} label={l} />
        ))}
      </div>
    </div>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function MedicalDetailPanel({
  record,
  onClose,
  onEdit,
  onDownload,
}: {
  record: HealthRecord;
  onClose: () => void;
  onEdit: (r: HealthRecord) => void;
  onDownload: (employeeId: number) => void;
}) {
  // ── Bệnh phát hiện theo nhóm ──────────────────────────────────────────────
  const diagNhomNoiKhoa: [keyof HealthRecord, string][] = [
    ["laoPhoi", "Lao phổi"],
    ["ungThuPhoi", "Ung thư phổi"],
    ["viemXoangCap", "Viêm xoang. mũi họng. thanh quản cấp"],
    ["viemXoangMan", "Viêm xoang. mũi họng. thanh quản mãn"],
    ["viemPheQuanCap", "Viêm phế quản cấp"],
    ["viemPheQuanMan", "Viêm phế quản mãn"],
    ["viemPhoi", "Viêm phổi"],
    ["henPheQuanDiUng", "Hen phế quản. giãn phế quản. dị ứng"],
    ["iaCHayViemDaDayRuot", "Ỉa chảy. viêm dạ dày. ruột do NT"],
    ["noiTiet", "Nội tiết"],
    ["benhTamThan", "Bệnh tâm thần"],
    ["benhThanKinhTwNgoaiBien", "Bệnh thần kinh TW và ngoại biên"],
    ["haCanTheoDoi", "HA cần theo dõi"],
    ["haCanDieuTri", "HA cần điều trị"],
    ["benhTimMach", "Bệnh tim mạch"],
    ["benhVanTim", "Bệnh van tim"],
    ["roiLoanNhipTim", "Rối loạn nhịp tim"],
    ["viemDaDay", "Viêm dạ dày"],
    ["viemDaiTrang", "Viêm đại tràng"],
    ["basedow", "Basedow"],
    ["tieuDuong", "Tiểu đường"],
    ["tangRlDuong", "Tăng. RL đường"],
    ["rlMoMau", "Rối loạn mỡ máu"],
    ["tangMenGan", "Tăng men gan"],
    ["tangAcidUric", "Tăng Acid Uric"],
    ["viemGanXoGan", "Viêm gan. xơ gan"],
    ["benhThanTietNieu", "Bệnh thận. tiết niệu"],
    ["soiTietNieu", "Sỏi tiết niệu"],
    ["nangThan", "Nang thận"],
    ["nangNhanTuyenGiap", "Nang. nhân tuyến giáp"],
    ["ganNhiemMo", "Gan nhiễm mỡ"],
    ["soiPolipTuiMat", "Sỏi. polip túi mật"],
    ["ungThuNoiKhoa", "Ung thư (nội khoa)"],
    ["benhSotRet", "Bệnh sốt rét"],
  ];

  const diagNhomTmh: [keyof HealthRecord, string][] = [
    ["vmuiHongAmidalXoang", "V. mũi họng. Amidal. xoang mạn tính"],
    ["viemTai", "Viêm tai"],
    ["polipMui", "Polip mũi"],
  ];

  const diagNhomRhm: [keyof HealthRecord, string][] = [
    ["sauRang", "Sâu răng"],
    ["rangMocLech", "Răng mọc lệch"],
    ["matRang", "Mất răng"],
  ];

  const diagNhomMat: [keyof HealthRecord, string][] = [
    ["tatKhucXa", "Tật khúc xạ"],
    ["laoThi", "Lão thị"],
    ["giamThiLuc", "Giảm thị lực"],
    ["ducThuyTinhThe", "Đục thuỷ tinh thể"],
  ];

  const diagNhomNgoai: [keyof HealthRecord, string][] = [
    ["ucacLoai", "U các loại"],
    ["nangNhanTuyenVu", "Nang. nhân tuyến vú"],
    ["tri", "Trĩ"],
    ["benhXuongKhop", "Bệnh xương khớp"],
    ["vetMoOBung", "Vết mổ ổ bụng"],
    ["gayXuongCu", "Gãy xương cũ"],
    ["matDotNgonTayChanCu", "Mất đốt ngón tay chân cũ"],
    ["taiNanChanThuongCu", "Tai nạn. chấn thương cũ"],
    ["sayThai", "Sảy thai"],
  ];

  const diagNhomPhuKhoa: [keyof HealthRecord, string][] = [
    ["viemNamAmDao", "Viêm. nấm âm đạo"],
    ["viemCtc", "Viêm CTC"],
    ["nhanXoTuCung", "Nhân xơ tử cung"],
    ["uxoTuCung", "U xơ tử cung"],
    ["nangBt", "Nang BT"],
    ["polipCtc", "Polip CTC"],
  ];

  const diagNhomDaLieu: [keyof HealthRecord, string][] = [
    ["viemDa", "Viêm da"],
    ["vayNen", "Vảy nến"],
    ["langBen", "Lang ben"],
    ["namDa", "Nấm da"],
    ["sanNgua", "Sẩn ngứa"],
  ];

  const filterDiag = (arr: [keyof HealthRecord, string][]) =>
    arr.filter(([k]) => Boolean(record[k])).map(([, l]) => l);

  const hasAnyDiag = [
    diagNhomNoiKhoa,
    diagNhomTmh,
    diagNhomRhm,
    diagNhomMat,
    diagNhomNgoai,
    diagNhomPhuKhoa,
    diagNhomDaLieu,
  ].some((g) => g.some(([k]) => Boolean(record[k])));

  const clinicalItems: [string, keyof HealthRecord, keyof HealthRecord][] = [
    ["Tuần hoàn", "khamTuanHoan", "plKhamTuanHoan"],
    ["Hô hấp", "khamHoHap", "plKhamHoHap"],
    ["Tiêu hóa", "khamTieuHoa", "plKhamTieuHoa"],
    ["Thận - Tiết niệu", "khamThanTietNieu", "plKhamThanTietNieu"],
    ["Nội tiết", "khamNoiTiet", "plKhamNoiTiet"],
    ["Cơ - Xương - Khớp", "khamCoXuongKhop", "plKhamCxk"],
    ["Thần kinh", "khamThanKinh", "plKhamThanKinh"],
    ["Tâm thần", "khamTamThan", "plKhamTamThan"],
    ["Ngoại khoa", "khamNgoai", "plKhamNgoai"],
    ["Da liễu", "khamDaLieu", "plKhamDaLieu"],
    ["Sản phụ khoa", "khamSanPhuKhoa", "plKhamSanKhoa"],
    ["Mắt", "khamMat", "plKhamMat"],
    ["Tai mũi họng", "khamTaiMuiHong", "plKhamTmh"],
    ["Răng hàm mặt", "khamRangHamMat", "plKhamRhm"],
  ];
  const filledClinical = clinicalItems.filter(
    ([, vk, pk]) => record[vk] || record[pk],
  );

  const xuTri = [
    record.xuTriDt && "Điều trị (ĐT)",
    record.xuTriTd && "Theo dõi (TD)",
    record.xuTriCk && "Chuyển khoa (CK)",
    record.luuY && "Lưu ý",
  ].filter(Boolean) as string[];

  return (
    <Card className="h-full overflow-hidden flex flex-col">
      {/* ── Panel Header ───────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between p-4 border-b from-blue-50 to-indigo-50">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-blue-600" />
            <span className="text-xs text-blue-600 font-medium">Nhân viên</span>
          </div>
          <p className="text-lg font-bold">{record.employeeName}</p>
          {record.donVi && (
            <div className="flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">{record.donVi}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-1">
            <Button2
              variant="outline"
              size="sm"
              onClick={() => onEdit(record)}
              title="Chỉnh sửa"
            >
              <Edit className="h-4 w-4 mr-1" />
              Sửa
            </Button2>
            <Button2
              variant="outline"
              size="sm"
              onClick={() => onDownload(record.employeeId)}
              title="Tải về Word"
              className="text-blue-600 hover:text-blue-700"
            >
              <FileDown className="h-4 w-4 mr-1" />
              Word
            </Button2>
            <Button2 variant="ghost" size="sm" onClick={onClose} title="Đóng">
              <X className="h-4 w-4" />
            </Button2>
          </div>

          {record.ngayKham && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              {new Date(record.ngayKham + "T00:00:00").toLocaleDateString(
                "vi-VN",
                {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                },
              )}
            </div>
          )}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {record.plSucKhoe && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">PL SK:</span>
                <HealthLevelBadge level={record.plSucKhoe} />
              </div>
            )}
            {record.plTheLuc && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">PL TL:</span>
                <HealthLevelBadge level={record.plTheLuc} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Panel Body (scrollable) ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Sinh hiệu & Thông số */}
        <SectionCard
          icon={<Heart className="h-4 w-4" />}
          title="Sinh hiệu & Thông số cơ bản"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InfoRow
              label="Chiều cao"
              value={record.height ? `${record.height} cm` : undefined}
            />
            <InfoRow
              label="Cân nặng"
              value={record.weight ? `${record.weight} kg` : undefined}
            />
            <InfoRow
              label="Mạch"
              value={record.mach ? `${record.mach} lần/phút` : undefined}
            />
            <InfoRow
              label="Huyết áp"
              value={record.huyetAp ? `${record.huyetAp} mmHg` : undefined}
            />
            <InfoRow label="Nhóm máu" value={record.nhomMau} />
            <InfoRow
              label="PL Nghề nghiệp"
              value={
                record.phanLoaiNgheNghiep
                  ? `Loại ${record.phanLoaiNgheNghiep}`
                  : undefined
              }
            />
            {record.benhThongThuong && (
              <div className="col-span-2">
                <InfoRow
                  label={`Bệnh thông thường${record.maBenhThongThuong ? ` (${record.maBenhThongThuong})` : ""}`}
                  value={record.benhThongThuong}
                />
              </div>
            )}
            {record.benhManTinh && (
              <div className="col-span-2">
                <InfoRow
                  label={`Bệnh mãn tính${record.maBenhManTinh ? ` (${record.maBenhManTinh})` : ""}`}
                  value={record.benhManTinh}
                />
              </div>
            )}
            {record.soNgayNghiOm !== undefined && (
              <InfoRow
                label="Số ngày nghỉ ốm"
                value={`${record.soNgayNghiOm} ngày`}
              />
            )}
            {record.tienSuBenhGiaDinh && (
              <div className="col-span-2 md:col-span-4">
                <InfoRow
                  label="Tiền sử bệnh của gia đình"
                  value={record.tienSuBenhGiaDinh}
                />
              </div>
            )}
          </div>

          {/* TNLĐ */}
          {record.biTaiNanLaoDong && (
            <div className="mt-4 p-3 rounded-lg border">
              <p className="font-semibold mb-2">Tai nạn lao động</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {record.ngayBiTaiNanLaoDong && (
                  <InfoRow
                    label="Ngày bị TNLĐ"
                    value={new Date(
                      record.ngayBiTaiNanLaoDong,
                    ).toLocaleDateString("vi-VN")}
                  />
                )}
                {record.soNgayDieuTriTnld !== undefined && (
                  <InfoRow
                    label="Số ngày điều trị"
                    value={`${record.soNgayDieuTriTnld} ngày`}
                  />
                )}
                {record.tyLeGiamDinhTnld !== undefined && (
                  <InfoRow
                    label="Tỷ lệ giám định TNLĐ"
                    value={`${record.tyLeGiamDinhTnld}%`}
                  />
                )}
                {record.namHuongTroCapTnld !== undefined && (
                  <InfoRow
                    label="Năm hưởng trợ cấp TNLĐ"
                    value={record.namHuongTroCapTnld}
                  />
                )}
              </div>
            </div>
          )}

          {/* BNN */}
          {(record.nldKskPhatHienBnn || record.nldChanDoanBnn) && (
            <div className="mt-4 p-3 rounded-lg border">
              <p className="font-semibold mb-2">Bệnh nghề nghiệp (BNN)</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {record.tenBenhNgheNghiep && (
                  <InfoRow label="Tên BNN" value={record.tenBenhNgheNghiep} />
                )}
                {record.maBenhNgheNghiep && (
                  <InfoRow label="Mã BNN" value={record.maBenhNgheNghiep} />
                )}
                {record.chucDanhNgheKhiMacBnn && (
                  <InfoRow
                    label="Chức danh nghề khi mắc"
                    value={record.chucDanhNgheKhiMacBnn}
                  />
                )}
                {record.theBenh && (
                  <InfoRow label="Thể bệnh" value={record.theBenh} />
                )}
                {record.tyLeGiamDinhBnn !== undefined && (
                  <InfoRow
                    label="Tỷ lệ giám định BNN"
                    value={`${record.tyLeGiamDinhBnn}%`}
                  />
                )}
                {record.namGiamDinhBnn !== undefined && (
                  <InfoRow
                    label="Năm giám định BNN"
                    value={record.namGiamDinhBnn}
                  />
                )}
                {record.namHuongTroCapBnn !== undefined && (
                  <InfoRow
                    label="Năm hưởng trợ cấp BNN"
                    value={record.namHuongTroCapBnn}
                  />
                )}
                {record.daRuaPhoi && record.namRuaPhoi !== undefined && (
                  <InfoRow label="Năm rửa phổi" value={record.namRuaPhoi} />
                )}
                {record.chongChiDinhRuaPhoi && (
                  <div className="col-span-2">
                    <InfoRow
                      label="Chống chỉ định rửa phổi"
                      value={record.chongChiDinhRuaPhoi}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </SectionCard>

        {/* Khám lâm sàng */}
        {filledClinical.length > 0 && (
          <SectionCard
            icon={<Stethoscope className="h-4 w-4" />}
            title="Khám lâm sàng"
          >
            <div className="grid md:grid-cols-2 gap-x-8">
              {filledClinical.map(([label, vk, pk]) => (
                <ClinicalItem
                  key={vk as string}
                  label={label}
                  value={record[vk] as string}
                  pl={record[pk] as number}
                />
              ))}
            </div>

            {(record.kqMatTraiKhongKinh ||
              record.kqMatPhaiKhongKinh ||
              record.kqMatTraiCoKinh ||
              record.kqMatPhaiCoKinh) && (
              <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  Kết quả đo mắt
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {record.kqMatTraiKhongKinh && (
                    <InfoRow
                      label="Mắt trái (không kính)"
                      value={record.kqMatTraiKhongKinh}
                    />
                  )}
                  {record.kqMatPhaiKhongKinh && (
                    <InfoRow
                      label="Mắt phải (không kính)"
                      value={record.kqMatPhaiKhongKinh}
                    />
                  )}
                  {record.kqMatTraiCoKinh && (
                    <InfoRow
                      label="Mắt trái (có kính)"
                      value={record.kqMatTraiCoKinh}
                    />
                  )}
                  {record.kqMatPhaiCoKinh && (
                    <InfoRow
                      label="Mắt phải (có kính)"
                      value={record.kqMatPhaiCoKinh}
                    />
                  )}
                </div>
              </div>
            )}

            {(record.noiThuongTaiTrai ||
              record.noiThuongTaiPhai ||
              record.noiThamTaiTrai ||
              record.noiThamTaiPhai) && (
              <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  Kết quả đo thính lực
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {record.noiThuongTaiTrai !== undefined && (
                    <InfoRow
                      label="Nói thường (Tai trái)"
                      value={`${record.noiThuongTaiTrai} m`}
                    />
                  )}
                  {record.noiThuongTaiPhai !== undefined && (
                    <InfoRow
                      label="Nói thường (Tai phải)"
                      value={`${record.noiThuongTaiPhai} m`}
                    />
                  )}
                  {record.noiThamTaiTrai !== undefined && (
                    <InfoRow
                      label="Nói thầm (Tai trái)"
                      value={`${record.noiThamTaiTrai} m`}
                    />
                  )}
                  {record.noiThamTaiPhai !== undefined && (
                    <InfoRow
                      label="Nói thầm (Tai phải)"
                      value={`${record.noiThamTaiPhai} m`}
                    />
                  )}
                </div>
              </div>
            )}

            {(record.hamTren || record.hamDuoi) && (
              <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  Hàm răng
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {record.hamTren && (
                    <InfoRow label="Hàm trên" value={record.hamTren} />
                  )}
                  {record.hamDuoi && (
                    <InfoRow label="Hàm dưới" value={record.hamDuoi} />
                  )}
                </div>
              </div>
            )}
          </SectionCard>
        )}

        {/* Xét nghiệm */}
        <SectionCard
          icon={<FlaskConical className="h-4 w-4" />}
          title="Xét nghiệm"
        >
          <div className="space-y-4">
            {(
              [
                record.wbc,
                record.rbc,
                record.hgb,
                record.plt,
                record.vss,
                record.hba1c,
              ] as (number | undefined)[]
            ).some((v) => v !== undefined) && (
              <div>
                <SubLabel title="Công thức máu" />
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {(
                    [
                      [record.wbc, "WBC", "K/μL"],
                      [record.rbc, "RBC", "M/μL"],
                      [record.hgb, "HGB", "g/dL"],
                      [record.plt, "PLT", "K/μL"],
                      [record.vss, "VSS", "mm/h"],
                      [record.hba1c, "HbA1c", "%"],
                    ] as [number | undefined, string, string][]
                  ).map(([v, l, u]) => (
                    <LabValue key={l} label={l} value={v} unit={u} />
                  ))}
                </div>
              </div>
            )}

            {[
              record.glucoza,
              record.ure,
              record.creatinin,
              record.auric,
              record.cholesterol,
              record.triglycerid,
              record.hdl,
              record.ldl,
              record.got,
              record.gpt,
              record.ggt,
              record.albumin,
              record.bilirubinTp,
              record.bilirubinTt,
              record.bilirubinGt,
              record.ckmb,
              record.canxi,
            ].some((v) => v !== undefined) && (
              <div>
                <SubLabel title="Sinh hóa máu" />
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                  {(
                    [
                      [record.glucoza, "Glucoza", "mmol/L"],
                      [record.ure, "Ure", "mmol/L"],
                      [record.creatinin, "Creatinin", "μmol/L"],
                      [record.auric, "A. Uric", "μmol/L"],
                      [record.cholesterol, "Cholesterol", "mmol/L"],
                      [record.triglycerid, "Triglycerid", "mmol/L"],
                      [record.hdl, "HDL", "mmol/L"],
                      [record.ldl, "LDL", "mmol/L"],
                      [record.got, "GOT", "U/L"],
                      [record.gpt, "GPT", "U/L"],
                      [record.ggt, "GGT", "U/L"],
                      [record.albumin, "Albumin", "g/L"],
                      [record.bilirubinTp, "Bili TP", "μmol/L"],
                      [record.bilirubinTt, "Bili TT", "μmol/L"],
                      [record.bilirubinGt, "Bili GT", "μmol/L"],
                      [record.ckmb, "CKMB", "U/L"],
                      [record.canxi, "Canxi", "mmol/L"],
                    ] as [number | undefined, string, string][]
                  ).map(([v, l, u]) => (
                    <LabValue key={l} label={l} value={v} unit={u} />
                  ))}
                </div>
              </div>
            )}

            {(record.hbsag !== undefined ||
              record.hav !== undefined ||
              record.hcv !== undefined ||
              record.hev !== undefined ||
              record.hpylori !== undefined) && (
              <div>
                <SubLabel title="Huyết thanh học" />
                <div className="flex flex-wrap gap-2">
                  <SerologyCapsule label="HBsAg" positive={record.hbsag} />
                  <SerologyCapsule label="HAV" positive={record.hav} />
                  <SerologyCapsule label="HCV" positive={record.hcv} />
                  <SerologyCapsule label="HEV" positive={record.hev} />
                  <SerologyCapsule
                    label="H. Pylori"
                    positive={record.hpylori}
                  />
                </div>
              </div>
            )}

            {(record.ntLeu ||
              record.ntNit ||
              record.ntPro ||
              record.ntEry ||
              record.ntGlu ||
              record.ntKet ||
              record.ntBil ||
              record.ntUbg ||
              record.ntPh ||
              record.ntSg) && (
              <div>
                <SubLabel title="Nước tiểu" />
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                  <LabValue label="Bạch cầu (LEU)" value={record.ntLeu} />
                  <LabValue label="Nitrite (NIT)" value={record.ntNit} />
                  <LabValue label="Protein (PRO)" value={record.ntPro} />
                  <LabValue label="Hồng cầu (ERY)" value={record.ntEry} />
                  <LabValue label="Glucose (GLU)" value={record.ntGlu} />
                  <LabValue label="Ketone (KET)" value={record.ntKet} />
                  <LabValue label="Bilirubin (BIL)" value={record.ntBil} />
                  <LabValue label="Urobilinogen (UBG)" value={record.ntUbg} />
                  <LabValue label="pH" value={record.ntPh} />
                  <LabValue label="Tỷ trọng (SG)" value={record.ntSg} />
                </div>
              </div>
            )}

            {[
              record.sieuAmOBung,
              record.saTuyenGiap,
              record.saTim,
              record.saDopplerMachKhac,
              record.saVu,
              record.dienTim,
              record.noiSoiTmh,
              record.noiSoiDaDay,
              record.noiSoiDaiTrang,
              record.chucNangHoHap,
              record.loangXuong,
              record.xoVuaMach,
              record.luuHuyetNao,
              record.xquangTimPhoi,
              record.xquangKhac,
              record.ctCanThiep,
              record.sinhThiet,
            ].some((v) => v) && (
              <div>
                <SubLabel title="Chẩn đoán hình ảnh" />
                <div className="grid md:grid-cols-2 gap-2">
                  {(
                    [
                      [record.sieuAmOBung, "Siêu âm ổ bụng"],
                      [record.saTuyenGiap, "Siêu âm tuyến giáp"],
                      [record.saTim, "Siêu âm tim"],
                      [
                        record.saDopplerMachKhac,
                        "Siêu âm Doppler mạch / SA khác",
                      ],
                      [record.saVu, "Siêu âm vú"],
                      [record.dienTim, "Điện tim"],
                      [record.noiSoiTmh, "Nội soi TMH"],
                      [record.noiSoiDaDay, "Nội soi dạ dày"],
                      [record.noiSoiDaiTrang, "Nội soi đại tràng"],
                      [record.chucNangHoHap, "Chức năng hô hấp"],
                      [record.loangXuong, "Loãng xương"],
                      [record.xoVuaMach, "Xơ vữa mạch"],
                      [record.luuHuyetNao, "Lưu huyết não"],
                      [record.xquangTimPhoi, "X-quang tim phổi"],
                      [record.xquangKhac, "X-quang khác"],
                      [record.ctCanThiep, "CT can thiệp"],
                      [record.sinhThiet, "Sinh thiết"],
                    ] as [string | undefined, string][]
                  )
                    .filter(([v]) => v)
                    .map(([v, l]) => (
                      <div
                        key={l}
                        className="flex gap-2 p-2 bg-muted/30 rounded-md border text-sm"
                      >
                        <span className="text-muted-foreground shrink-0">
                          {l}:
                        </span>
                        <span className="font-medium">{v}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {[
              record.soiCtc,
              record.papmer,
              record.viaTest,
              record.viliTest,
              record.xnTeBaoCoTuCung,
              record.xnHpv,
            ].some((v) => v) && (
              <div>
                <SubLabel title="Cận lâm sàng phụ khoa" />
                <div className="grid md:grid-cols-2 gap-2">
                  {(
                    [
                      [record.soiCtc, "Soi CTC"],
                      [record.papmer, "Pap smear"],
                      [record.viaTest, "VIA test"],
                      [record.viliTest, "VILI test"],
                      [record.xnTeBaoCoTuCung, "XN tế bào cổ tử cung"],
                      [record.xnHpv, "XN HPV"],
                    ] as [string | undefined, string][]
                  )
                    .filter(([v]) => v)
                    .map(([v, l]) => (
                      <div
                        key={l}
                        className="flex gap-2 p-2 bg-muted/30 rounded-md border text-sm"
                      >
                        <span className="text-muted-foreground shrink-0">
                          {l}:
                        </span>
                        <span className="font-medium">{v}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Kết luận & Xử trí */}
        <SectionCard
          icon={<FileText className="h-4 w-4" />}
          title="Kết luận & Xử trí"
        >
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {record.ketQuaCls && (
                <InfoRow label="Kết quả CLS" value={record.ketQuaCls} />
              )}
              {record.danhGiaCls && (
                <InfoRow label="Đánh giá CLS" value={record.danhGiaCls} />
              )}
              {record.moTaKetLuan && (
                <div className="md:col-span-2">
                  <InfoRow label="Mô tả kết luận" value={record.moTaKetLuan} />
                </div>
              )}
              {record.huongGiaiQuyet && (
                <div className="md:col-span-2">
                  <InfoRow
                    label="Hướng giải quyết"
                    value={record.huongGiaiQuyet}
                  />
                </div>
              )}
              {record.nguoiKetLuan && (
                <InfoRow label="Người kết luận" value={record.nguoiKetLuan} />
              )}
            </div>

            {xuTri.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {xuTri.map((x) => (
                  <span
                    key={x}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    {x}
                  </span>
                ))}
              </div>
            )}
          </div>
        </SectionCard>

        {/* Bệnh phát hiện */}
        {hasAnyDiag && (
          <Card className="p-4 border">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5  mt-0.5 shrink-0" />
              <div className="space-y-3 w-full">
                <p className="text-sm font-semibold ">
                  Bệnh phát hiện qua khám
                </p>
                <DiagnosisGroup
                  title="Nội khoa"
                  items={filterDiag(diagNhomNoiKhoa)}
                />
                <DiagnosisGroup
                  title="Tai - Mũi - Họng"
                  items={filterDiag(diagNhomTmh)}
                />
                <DiagnosisGroup
                  title="Răng - Hàm - Mặt"
                  items={filterDiag(diagNhomRhm)}
                />
                <DiagnosisGroup title="Mắt" items={filterDiag(diagNhomMat)} />
                <DiagnosisGroup
                  title="Ngoại khoa"
                  items={filterDiag(diagNhomNgoai)}
                />
                <DiagnosisGroup
                  title="Phụ khoa"
                  items={filterDiag(diagNhomPhuKhoa)}
                />
                <DiagnosisGroup
                  title="Da liễu"
                  items={filterDiag(diagNhomDaLieu)}
                />
                {(
                  [
                    [record.benhKhacNoiKhoa, "Bệnh khác (nội khoa)"],
                    [record.benhKhacTmh, "Bệnh khác (TMH)"],
                    [record.benhKhacRhm, "Bệnh khác (RHM)"],
                    [record.benhKhacMat, "Bệnh khác (mắt)"],
                    [record.benhKhacNgoaiKhoa, "Bệnh khác (ngoại khoa)"],
                    [record.benhKhacPhuKhoa, "Bệnh khác (phụ khoa)"],
                    [record.benhKhacDaLieu, "Bệnh khác (da liễu)"],
                  ] as [string | undefined, string][]
                )
                  .filter(([v]) => v)
                  .map(([v, l]) => (
                    <div key={l} className="text-sm">
                      <span className="font-medium">{l}:</span> {v}
                    </div>
                  ))}
              </div>
            </div>
          </Card>
        )}
      </div>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function HealthManagement() {
  const queryClient = useQueryClient();

  // ── Filter state ───────────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMonth, setFilterMonth] = useState("all");

  // ── Modal state ────────────────────────────────────────────────────────────
  const [detailRecord, setDetailRecord] = useState<HealthRecord | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [editRecord, setEditRecord] = useState<HealthRecord | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // ── NEW: selected record for inline panel ─────────────────────────────────
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(
    null,
  );

  // ── Data ───────────────────────────────────────────────────────────────────
  const { data: records = [], isLoading } = useQuery<HealthRecord[]>({
    queryKey: ["health-records"],
    queryFn: routineHealthCheckApi.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => routineHealthCheckApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["health-records"] });
      toast({ title: "Đã xóa hồ sơ" });
    },
    onError: () => toast({ title: "Lỗi khi xóa", variant: "destructive" }),
  });

  const handleDelete = (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa hồ sơ này không?")) {
      deleteMutation.mutate(id);
    }
  };

  const openCreate = () => {
    setEditRecord(null);
    setShowForm(true);
  };

  const openEdit = (r: HealthRecord) => {
    setEditRecord(r);
    setShowForm(true);
  };

  const openDetail = (r: HealthRecord) => {
    setDetailRecord(r);
    setShowDetail(true);
  };

  const handleDownloadReport = async (employeeId: number) => {
    try {
      await routineHealthCheckApi.downloadReport(employeeId);
      toast({ title: "Đã tải xuống báo cáo thành công" });
    } catch (error: any) {
      toast({
        title: "Lỗi tải file",
        description: error?.message || "Lỗi không xác định",
        variant: "destructive",
      });
    }
  };

  // ── Unique months for filter dropdown ─────────────────────────────────────
  const uniqueMonths = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.ngayKham) set.add(r.ngayKham.slice(0, 7));
    });
    return Array.from(set).sort().reverse();
  }, [records]);

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = useMemo(
    () =>
      records.filter((r) => {
        const term = searchTerm.trim().toLowerCase();
        const matchSearch =
          !term ||
          String(r.employeeId).includes(term) ||
          (r.donVi ?? "").toLowerCase().includes(term);
        const matchMonth =
          filterMonth === "all" || r.ngayKham?.slice(0, 7) === filterMonth;
        return matchSearch && matchMonth;
      }),
    [records, searchTerm, filterMonth],
  );

  // ── Checkbox handlers ──────────────────────────────────────────────────────
  const handleToggleOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleToggleAll = () => {
    if (selectedIds.length === filtered.length && filtered.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((r) => r.id!).filter(Boolean));
    }
  };

  const isAllSelected =
    selectedIds.length === filtered.length && filtered.length > 0;
  const isIndeterminate =
    selectedIds.length > 0 && selectedIds.length < filtered.length;

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold"> Khám sức khỏe định kỳ </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý lịch khám sức khỏe định kỳ của nhân viên ({records.length}{" "}
            hồ sơ)
          </p>
        </div>
      </div>

      {/* ── Filter bar ─────────────────────────────────────────────────────── */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo mã NV, đơn vị..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterMonth} onValueChange={setFilterMonth}>
            <SelectTrigger className="w-full md:w-52">
              <SelectValue placeholder="Lọc theo tháng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all"> Tất cả tháng </SelectItem>
              {uniqueMonths.map((m) => {
                const [year, month] = m.split("-");
                return (
                  <SelectItem key={m} value={m}>
                    Tháng {month}/{year}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <Button2 onClick={() => setShowBulkAdd(true)}>
            <Plus className="h-4 w-4 mr-2" /> Thêm mới
          </Button2>

          <Button2
            variant="outline"
            onClick={() => setShowBulkEdit(true)}
            disabled={selectedIds.length === 0}
          >
            <Edit className="h-4 w-4 mr-2" /> Chỉnh sửa ({selectedIds.length})
          </Button2>
        </div>
      </Card>

      {/* ── Main content: table + detail panel ────────────────────────────── */}
      <div
        className={`grid gap-4 transition-all duration-300 ${
          selectedRecord ? "grid-cols-12" : "grid-cols-1"
        }`}
      >
        {/* ── Table col ──────────────────────────────────────────────────── */}
        <div className={selectedRecord ? "col-span-4" : "col-span-12"}>
          <Card className="overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center p-16">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <span className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <p>Đang tải dữ liệu...</p>
                </div>
              </div>
            ) : (
              <div className="max-h-[calc(100vh-400px)] overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-muted sticky top-0 z-10">
                    <tr>
                      {/* Khi không có panel: hiển thị đủ cột */}
                      {!selectedRecord && (
                        <th className="text-center p-3 w-10">
                          <Checkbox
                            checked={isAllSelected}
                            onCheckedChange={handleToggleAll}
                          />
                        </th>
                      )}
                      {!selectedRecord && (
                        <th className="text-center p-3 text-sm font-semibold w-10">
                          STT
                        </th>
                      )}
                      <th className="text-left p-3 text-sm font-semibold">
                        Nhân viên
                      </th>
                      {!selectedRecord && (
                        <>
                          <th className="text-left p-3 text-sm font-semibold">
                            Đơn vị
                          </th>
                          <th className="text-left p-3 text-sm font-semibold">
                            Ngày khám
                          </th>
                          <th className="text-left p-3 text-sm font-semibold">
                            Huyết áp
                          </th>
                          <th className="text-left p-3 text-sm font-semibold">
                            Mạch
                          </th>
                          <th className="text-left p-3 text-sm font-semibold">
                            PL Sức khỏe
                          </th>
                          <th className="text-center p-3 text-sm font-semibold w-32">
                            Thao tác
                          </th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td
                          colSpan={selectedRecord ? 1 : 8}
                          className="text-center py-16 text-muted-foreground"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <AlertCircle className="h-8 w-8 text-muted-foreground/40" />
                            <p>Không tìm thấy hồ sơ nào</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filtered.map((r, i) => (
                        <tr
                          key={r.id}
                          className={`border-b hover:bg-muted/50 transition-colors cursor-pointer ${
                            selectedRecord?.id === r.id
                              ? "bg-primary/5 border-l-4 border-l-primary"
                              : ""
                          } ${selectedIds.includes(r.id!) ? "bg-blue-50" : ""}`}
                          onClick={() => setSelectedRecord(r)}
                        >
                          {/* Checkbox & STT — chỉ hiện khi không có panel */}
                          {!selectedRecord && (
                            <td
                              className="p-3 text-center"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Checkbox
                                checked={selectedIds.includes(r.id!)}
                                onCheckedChange={() => handleToggleOne(r.id!)}
                              />
                            </td>
                          )}
                          {!selectedRecord && (
                            <td className="p-3 text-center text-sm text-muted-foreground">
                              {i + 1}
                            </td>
                          )}

                          {/* Tên nhân viên — luôn hiển thị */}
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <User className="h-4 w-4 text-primary/60" />
                              </div>
                              <span className="text-sm font-medium truncate">
                                {r.employeeName}
                              </span>
                            </div>
                          </td>

                          {/* Các cột còn lại — ẩn khi có panel */}
                          {!selectedRecord && (
                            <>
                              <td className="p-3 text-sm">{r.donVi || "—"}</td>
                              <td className="p-3 text-sm">
                                {r.ngayKham
                                  ? new Date(
                                      r.ngayKham + "T00:00:00",
                                    ).toLocaleDateString("vi-VN")
                                  : "—"}
                              </td>
                              <td className="p-3 text-sm">
                                {r.huyetAp || "—"}
                              </td>
                              <td className="p-3 text-sm">
                                {r.mach ? `${r.mach} lần/phút` : "—"}
                              </td>
                              <td className="p-3">
                                <HealthLevelBadge level={r.plSucKhoe} />
                              </td>
                              {/* Actions */}
                              <td
                                className="p-3"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="flex items-center justify-center gap-1">
                                  {/* <Button
                                    variant="ghost"
                                    size="sm"
                                    title="Xem chi tiết"
                                    onClick={() => openDetail(r)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button> */}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    title="Chỉnh sửa"
                                    onClick={() => openEdit(r)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    title="Tải về Word (Mẫu 03 - TT32/2023)"
                                    className="text-blue-600 hover:text-blue-700"
                                    onClick={() =>
                                      handleDownloadReport(r.employeeId)
                                    }
                                  >
                                    <FileDown className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    title="Xóa"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => handleDelete(r.id!)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* ── Detail Panel col ───────────────────────────────────────────── */}
        {selectedRecord && (
          <div className="col-span-8">
            <MedicalDetailPanel
              record={selectedRecord}
              onClose={() => setSelectedRecord(null)}
              onEdit={(r) => openEdit(r)}
              onDownload={handleDownloadReport}
            />
          </div>
        )}
      </div>

      {/* ── Modals (giữ nguyên toàn bộ) ───────────────────────────────────── */}
      <MedicalDetailModal
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        record={detailRecord}
      />

      <MedicalFormModal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditRecord(null);
        }}
        record={editRecord}
        onSuccess={() => {
          setShowForm(false);
          setEditRecord(null);
        }}
      />

      <BulkAddHealthModal
        isOpen={showBulkAdd}
        onClose={() => setShowBulkAdd(false)}
        onSuccess={() => {
          setShowBulkAdd(false);
          queryClient.invalidateQueries({ queryKey: ["health-records"] });
        }}
      />

      <BulkEditHealthModal
        isOpen={showBulkEdit}
        onClose={() => setShowBulkEdit(false)}
        preSelectedIds={selectedIds}
        onSuccess={() => {
          setShowBulkEdit(false);
          setSelectedIds([]);
          queryClient.invalidateQueries({ queryKey: ["health-records"] });
        }}
      />
    </div>
  );
}
