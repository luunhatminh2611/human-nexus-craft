// components/MedicalFormModal.tsx
// 230 trường theo đúng cấu trúc Excel: 13 tab
// Row 0 (tabs): Thông tin chung | Kết quả | Mô tả khám chuyên khoa | Xử trí |
//               Kết quả Xét nghiệm | Kết quả Cận lâm sàng |
//               Nội khoa | Tai Mũi Họng | Răng Hàm Mặt | Mắt | Ngoại khoa | Phụ khoa | Da liễu

import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button as Button2 } from '@/shared/components/ui/button/Button2';
import Button from '@/shared/components/ui/button/Button';
import { toast } from '@/shared/hooks/use-toast';
import { Activity } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { routineHealthCheckApi } from '../api/medicalApi';

// ─── Sub-section components (bệnh phát hiện) ─────────────────────────────────
import SectionThongTinChung from './sections/SectionThongTinChung';
import SectionMoTaKham      from './sections/SectionMoTaKham';
import SectionXuTri         from './sections/SectionXuTri';
import SectionXetNghiem     from './sections/SectionXetNghiem';
import SectionCanLamSang    from './sections/SectionCanLamSang';
import SectionBenhPhatHien  from './sections/SectionBenhPhatHien';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HealthRecord {
  id?: number;
  employeeId: number;
  isActive?: boolean;

  // === Thông tin chung (cols 0-5) ===
  socialInsuranceNumber?: string;           // [0]
  employeeName?: string;           // [1]
  birthday?: number;           // [2]
  jobTitleName?: string;          // [3]
  departmentName?: string;        // [4] Công trường/Phân xưởng/Phòng ban
  donVi?: string;             // [5]

  // === Kết quả (cols 6-38) ===
  ngayKham?: string;          // [6]
  height?: number;          // [7]
  weight?: number;           // [8]
  mach?: number;              // [9]
  huyetAp?: string;           // [10]
  plTheLuc?: number;          // [11]
  plSucKhoe?: number;         // [12]
  benhThongThuong?: string;   // [13]
  maBenhThongThuong?: string; // [14]
  soNgayNghiOm?: number;      // [15]
  benhManTinh?: string;       // [16]
  maBenhManTinh?: string;     // [17]
  phanLoaiNgheNghiep?: number;// [18]
  nldTiepXucYeuToCoHai?: boolean; // [19]
  biTaiNanLaoDong?: boolean;  // [20]
  ngayBiTaiNanLaoDong?: string; // [21]
  soNgayDieuTriTnld?: number; // [22]
  tyLeGiamDinhTnld?: number;  // [23]
  namHuongTroCapTnld?: number;// [24]
  nldKskPhatHienBnn?: boolean;// [25]
  nldChanDoanBnn?: boolean;   // [26]
  chucDanhNgheKhiMacBnn?: string; // [27]
  tenBenhNgheNghiep?: string; // [28]
  maBenhNgheNghiep?: string;  // [29]
  thoiGianHoiChanBnn?: string;// [30]
  theBenh?: string;           // [31]
  namGiamDinhBnn?: number;    // [32]
  tyLeGiamDinhBnn?: number;   // [33]
  namHuongTroCapBnn?: number; // [34]
  daRuaPhoi?: boolean;        // [35]
  namRuaPhoi?: number;        // [36]
  chongChiDinhRuaPhoi?: string; // [37]
  tienSuBenhGiaDinh?: string; // [38]

  // === Mô tả khám chuyên khoa (cols 39-92) ===
  khamTuanHoan?: string;      // [39]
  plKhamTuanHoan?: number;    // [40]
  khamHoHap?: string;         // [41]
  plKhamHoHap?: number;       // [42]
  khamTieuHoa?: string;       // [43]
  plKhamTieuHoa?: number;     // [44]
  khamThanTietNieu?: string;  // [45]
  plKhamThanTietNieu?: number;// [46]
  khamNoiTiet?: string;       // [47]
  plKhamNoiTiet?: number;     // [48]
  khamCoXuongKhop?: string;   // [49]
  plKhamCxk?: number;         // [50]
  khamThanKinh?: string;      // [51]
  plKhamThanKinh?: number;    // [52]
  khamTamThan?: string;       // [53]
  plKhamTamThan?: number;     // [54]
  khamNgoai?: string;         // [55]
  plKhamNgoai?: number;       // [56]
  khamDaLieu?: string;        // [57]
  plKhamDaLieu?: number;      // [58]
  khamSanPhuKhoa?: string;    // [59]
  plKhamSanKhoa?: number;     // [60]
  tuoiBatDauKinhNguyet?: number; // [61]
  tinhChatKinhNguyet?: string;// [62]
  chuKyKinh?: number;         // [63]
  luongKinh?: number;         // [64]
  dauBungKinh?: boolean;      // [65]
  daLapGiaDinh?: boolean;     // [66]
  para?: string;              // [67]
  soLanMoSanPhuKhoa?: number; // [68]
  moTaMoSanPhuKhoa?: string;  // [69]
  apDungBptt?: boolean;       // [70]
  moTaBptt?: string;          // [71]
  khamMat?: string;           // [72]
  plKhamMat?: number;         // [73]
  kqMatTraiKhongKinh?: string;// [74]
  kqMatPhaiKhongKinh?: string;// [75]
  kqMatTraiCoKinh?: string;   // [76]
  kqMatPhaiCoKinh?: string;   // [77]
  khamTaiMuiHong?: string;    // [78]
  plKhamTmh?: number;         // [79]
  noiThuongTaiTrai?: number;  // [80]
  noiThuongTaiPhai?: number;  // [81]
  noiThamTaiTrai?: number;    // [82]
  noiThamTaiPhai?: number;    // [83]
  khamRangHamMat?: string;    // [84]
  plKhamRhm?: number;         // [85]
  hamTren?: string;           // [86]
  hamDuoi?: string;           // [87]
  ketQuaCls?: string;         // [88]
  danhGiaCls?: string;        // [89]
  moTaKetLuan?: string;       // [90]
  huongGiaiQuyet?: string;    // [91]
  nguoiKetLuan?: string;      // [92]

  // === Xử trí (cols 93-96) ===
  xuTriDt?: boolean;          // [93]
  xuTriTd?: boolean;          // [94]
  xuTriCk?: boolean;          // [95]
  luuY?: boolean;             // [96]

  // === Kết quả Xét nghiệm (cols 97-135) ===
  wbc?: number;               // [97]
  rbc?: number;               // [98]
  hgb?: number;               // [99]
  plt?: number;               // [100]
  vss?: number;               // [101]
  ure?: number;               // [102]
  glucoza?: number;           // [103]
  creatinin?: number;         // [104]
  auric?: number;             // [105]
  cholesterol?: number;       // [106]
  triglycerid?: number;       // [107]
  hdl?: number;               // [108]
  ldl?: number;               // [109]
  got?: number;               // [110]
  gpt?: number;               // [111]
  ggt?: number;               // [112]
  albumin?: number;           // [113]
  bilirubinTp?: number;       // [114]
  bilirubinTt?: number;       // [115]
  bilirubinGt?: number;       // [116]
  ckmb?: number;              // [117]
  canxi?: number;             // [118]
  ntLeu?: string;             // [119]
  ntNit?: string;             // [120]
  ntPro?: string;             // [121]
  ntPh?: number;              // [122]
  ntEry?: string;             // [123]
  ntSg?: number;              // [124]
  ntKet?: string;             // [125]
  ntBil?: string;             // [126]
  ntGlu?: string;             // [127]
  ntUbg?: string;             // [128]
  hba1c?: number;             // [129]
  hbsag?: boolean;            // [130]
  hav?: boolean;              // [131]
  hcv?: boolean;              // [132]
  hev?: boolean;              // [133]
  nhomMau?: string;           // [134]
  hpylori?: boolean;          // [135]

  // === Kết quả Cận lâm sàng (cols 136-158) ===
  sieuAmOBung?: string;       // [136]
  saTuyenGiap?: string;       // [137]
  saTim?: string;             // [138]
  saDopplerMachKhac?: string; // [139]
  saVu?: string;              // [140]
  dienTim?: string;           // [141]
  noiSoiTmh?: string;         // [142]
  noiSoiDaDay?: string;       // [143]
  noiSoiDaiTrang?: string;    // [144]
  chucNangHoHap?: string;     // [145]
  loangXuong?: string;        // [146]
  xoVuaMach?: string;         // [147]
  luuHuyetNao?: string;       // [148]
  xquangTimPhoi?: string;     // [149]
  xquangKhac?: string;        // [150]
  ctCanThiep?: string;        // [151]
  sinhThiet?: string;         // [152]
  soiCtc?: string;            // [153]
  papmer?: string;            // [154]
  viaTest?: string;           // [155]
  viliTest?: string;          // [156]
  xnTeBaoCoTuCung?: string;   // [157]
  xnHpv?: string;             // [158]

  // === Nội khoa (cols 159-193) ===
  laoPhoi?: boolean;          // [159]
  ungThuPhoi?: boolean;       // [160]
  viemXoangCap?: boolean;     // [161]
  viemXoangMan?: boolean;     // [162]
  viemPheQuanCap?: boolean;   // [163]
  viemPheQuanMan?: boolean;   // [164]
  viemPhoi?: boolean;         // [165]
  henPheQuanDiUng?: boolean;  // [166]
  iaCHayViemDaDayRuot?: boolean; // [167]
  noiTiet?: boolean;          // [168]
  benhTamThan?: boolean;      // [169]
  benhThanKinhTwNgoaiBien?: boolean; // [170]
  haCanTheoDoi?: boolean;     // [171]
  haCanDieuTri?: boolean;     // [172]
  benhTimMach?: boolean;      // [173]
  benhVanTim?: boolean;       // [174]
  roiLoanNhipTim?: boolean;   // [175]
  viemDaDay?: boolean;        // [176]
  viemDaiTrang?: boolean;     // [177]
  basedow?: boolean;          // [178]
  tieuDuong?: boolean;        // [179]
  tangRlDuong?: boolean;      // [180]
  rlMoMau?: boolean;          // [181]
  tangMenGan?: boolean;       // [182]
  tangAcidUric?: boolean;     // [183]
  viemGanXoGan?: boolean;     // [184]
  benhThanTietNieu?: boolean; // [185]
  soiTietNieu?: boolean;      // [186]
  nangThan?: boolean;         // [187]
  nangNhanTuyenGiap?: boolean;// [188]
  ganNhiemMo?: boolean;       // [189]
  soiPolipTuiMat?: boolean;   // [190]
  ungThuNoiKhoa?: boolean;    // [191]
  benhKhacNoiKhoa?: string;   // [192]
  benhSotRet?: boolean;       // [193]

  // === Tai Mũi Họng (cols 194-197) ===
  vmuiHongAmidalXoang?: boolean; // [194]
  viemTai?: boolean;          // [195]
  polipMui?: boolean;         // [196]
  benhKhacTmh?: string;       // [197]

  // === Răng Hàm Mặt (cols 198-201) ===
  sauRang?: boolean;          // [198]
  rangMocLech?: boolean;      // [199]
  matRang?: boolean;          // [200]
  benhKhacRhm?: string;       // [201]

  // === Mắt (cols 202-206) ===
  tatKhucXa?: boolean;        // [202]
  laoThi?: boolean;           // [203]
  giamThiLuc?: boolean;       // [204]
  ducThuyTinhThe?: boolean;   // [205]
  benhKhacMat?: string;       // [206]

  // === Ngoại khoa (cols 207-216) ===
  ucacLoai?: boolean;         // [207]
  nangNhanTuyenVu?: boolean;  // [208]
  tri?: boolean;              // [209]
  benhXuongKhop?: boolean;    // [210]
  vetMoOBung?: boolean;       // [211]
  gayXuongCu?: boolean;       // [212]
  matDotNgonTayChanCu?: boolean; // [213]
  taiNanChanThuongCu?: boolean;  // [214]
  benhKhacNgoaiKhoa?: string; // [215]
  sayThai?: boolean;          // [216]

  // === Phụ khoa (cols 217-223) ===
  viemNamAmDao?: boolean;     // [217]
  viemCtc?: boolean;          // [218]
  nhanXoTuCung?: boolean;     // [219]
  uxoTuCung?: boolean;        // [220]
  nangBt?: boolean;           // [221]
  polipCtc?: boolean;         // [222]
  benhKhacPhuKhoa?: string;   // [223]

  // === Da liễu (cols 224-229) ===
  viemDa?: boolean;           // [224]
  vayNen?: boolean;           // [225]
  langBen?: boolean;          // [226]
  namDa?: boolean;            // [227]
  sanNgua?: boolean;          // [228]
  benhKhacDaLieu?: string;    // [229]
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  record: HealthRecord | null;
  onSuccess: () => void;
}

const EMPTY: Partial<HealthRecord> = {
  ngayKham: new Date().toISOString().slice(0, 10),
  nldTiepXucYeuToCoHai: false,
  biTaiNanLaoDong: false,
  nldKskPhatHienBnn: false,
  nldChanDoanBnn: false,
  daRuaPhoi: false,
  xuTriDt: false, xuTriTd: false, xuTriCk: false, luuY: false,
  hbsag: false, hav: false, hcv: false, hev: false, hpylori: false,
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MedicalFormModal({ isOpen, onClose, record, onSuccess }: Props) {
  const [form, setForm] = useState<Partial<HealthRecord>>(record ?? EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isOpen) {
      setForm(record ?? { ...EMPTY });
      setErrors({});
    }
  }, [isOpen, record]);

  const set = (key: keyof HealthRecord, value: HealthRecord[keyof HealthRecord]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const num = (v: string): number | undefined => {
    if (v === '' || v === null || v === undefined) return undefined;
    const n = Number(v);
    return isNaN(n) ? undefined : n;
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.socialInsuranceNumber) e.socialInsuranceNumber = 'Vui lòng nhập mã BHXH';
    if (!form.ngayKham) e.ngayKham = 'Vui lòng chọn ngày khám';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const createMutation = useMutation({
    mutationFn: (d: Partial<HealthRecord>) => routineHealthCheckApi.create([d]),
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
      toast({ title: 'Vui lòng kiểm tra lại thông tin', variant: 'destructive' });
      return;
    }

    if (record?.id) {
      updateMutation.mutate({ ...form, id: record.id });
    } else {
      createMutation.mutate(form);
    }
  };

  // ─── Section renderer ───────────────────────────────────────────────────────

  const renderSections = () => (
    <>
      <SectionThongTinChung form={form} set={set} num={num} errors={errors} />
      <SectionMoTaKham form={form} set={set} num={num} />
      <SectionXuTri form={form} set={set} />
      <SectionXetNghiem form={form} set={set} num={num} />
      <SectionCanLamSang form={form} set={set} />
      <SectionBenhPhatHien form={form} set={set} />
    </>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            {record ? 'Cập nhật kết quả khám sức khỏe' : 'Thêm mới kết quả khám sức khỏe'}
            <span className="ml-auto text-xs font-normal text-muted-foreground">
              230 trường / 13 nhóm Excel
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Content */}
        <div className="min-h-[300px] py-2 space-y-6">
          {renderSections()}
        </div>

        {/* Footer */}
        <DialogFooter className="flex items-center justify-end gap-2 pt-2 border-t">
          <Button variant="outline" onClick={onClose} disabled={isPending}>Hủy</Button>
          <Button2 onClick={handleSave} disabled={isPending}>
            {isPending
              ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2 inline-block" />Đang lưu...</>
              : record ? 'Cập nhật' : 'Lưu hồ sơ'
            }
          </Button2>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}