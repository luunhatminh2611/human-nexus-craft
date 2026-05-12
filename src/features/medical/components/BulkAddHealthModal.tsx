// components/BulkAddHealthModal.tsx
import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Textarea } from "@/shared/components/ui/textarea";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/tables/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { Button } from "@/shared/components/ui/button/Button2";
import { toast } from "@/shared/hooks/use-toast";
import {
  Loader2,
  X,
  Plus,
  Download,
  Upload,
  Copy,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Activity,
} from "lucide-react";
import { routineHealthCheckApi } from "../api/medicalApi";
import type { HealthRecord } from "./MedicalFormModal";

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const num = (v: string) => {
  if (v === "" || v === null || v === undefined) return undefined;
  const n = Number(v);
  return isNaN(n) ? undefined : n;
};

// ─── Column definitions ───────────────────────────────────────────────────────

export const REQUIRED_COLS = [
  { key: "employeeId", label: "Mã NV *" },
  { key: "maBhxh", label: "Mã BHXH *" },
  { key: "ngayKham", label: "Ngày khám *" },
  { key: "donVi", label: "Đơn vị *" },
];

export const OPTIONAL_COLS = [
  // ─── Thông tin chung ───────────────────────────────────────────
  { key: "maBhxh", label: "Mã BHXH *", group: "Thông tin chung" },
  { key: "employeeId", label: "Mã NV *", group: "Thông tin chung" },
  { key: "hoVaTen", label: "Họ và tên", group: "Thông tin chung" },
  { key: "namSinh", label: "Năm sinh", group: "Thông tin chung" },
  { key: "chucDanh", label: "Chức danh", group: "Thông tin chung" },
  {
    key: "congTruong",
    label: "Công trường / Phân xưởng / Phòng ban",
    group: "Thông tin chung",
  },
  { key: "donVi", label: "Đơn vị *", group: "Thông tin chung" },

  // ─── Kết quả ───────────────────────────────────────────────────
  { key: "ngayKham", label: "Ngày khám *", group: "Kết quả" },
  { key: "chieuCao", label: "Chiều cao (cm)", group: "Kết quả" },
  { key: "canNang", label: "Cân nặng (kg)", group: "Kết quả" },
  { key: "mach", label: "Mạch", group: "Kết quả" },
  { key: "huyetAp", label: "Huyết áp", group: "Kết quả" },
  { key: "plTheLuc", label: "PL Thể lực", group: "Kết quả" },
  { key: "plSucKhoe", label: "PL Sức khỏe", group: "Kết quả" },
  { key: "benhThongThuong", label: "Bệnh thông thường", group: "Kết quả" },
  { key: "maBenhThongThuong", label: "Mã bệnh thông thường", group: "Kết quả" },
  { key: "soNgayNghiOm", label: "Số ngày nghỉ ốm", group: "Kết quả" },
  { key: "benhManTinh", label: "Bệnh mãn tính", group: "Kết quả" },
  { key: "maBenhManTinh", label: "Mã bệnh mãn tính", group: "Kết quả" },
  {
    key: "phanLoaiNgheNghiep",
    label: "Phân loại nghề nghiệp",
    group: "Kết quả",
  },
  {
    key: "nldTiepXucYeuToCoHai",
    label: "NLĐ tiếp xúc yếu tố có hại",
    group: "Tai nạn lao động",
  },
  {
    key: "biTaiNanLaoDong",
    label: "Bị tai nạn lao động",
    group: "Tai nạn lao động",
  },
  {
    key: "ngayBiTaiNanLaoDong",
    label: "Ngày bị tai nạn lao động",
    group: "Tai nạn lao động",
  },
  {
    key: "soNgayDieuTriTnld",
    label: "Số ngày điều trị TNLĐ",
    group: "Tai nạn lao động",
  },
  {
    key: "tyLeGiamDinhTnld",
    label: "Tỷ lệ giám định TNLĐ (%)",
    group: "Tai nạn lao động",
  },
  {
    key: "namHuongTroCapTnld",
    label: "Năm hưởng trợ cấp TNLĐ",
    group: "Tai nạn lao động",
  },
  // ─── Bệnh nghề nghiệp (BNN) ────────────────────────────────────
  {
    key: "nldKskPhatHienBnn",
    label: "NLĐ KSK phát hiện BNN",
    group: "Bệnh nghề nghiệp (BNN)",
  },
  {
    key: "nldChanDoanBnn",
    label: "NLĐ được chẩn đoán BNN",
    group: "Bệnh nghề nghiệp (BNN)",
  },
  {
    key: "chucDanhNgheKhiMacBnn",
    label: "Chức danh nghề khi mắc BNN",
    group: "Bệnh nghề nghiệp (BNN)",
  },
  {
    key: "tenBenhNgheNghiep",
    label: "Tên bệnh nghề nghiệp",
    group: "Bệnh nghề nghiệp (BNN)",
  },
  {
    key: "maBenhNgheNghiep",
    label: "Mã bệnh nghề nghiệp",
    group: "Bệnh nghề nghiệp (BNN)",
  },
  {
    key: "thoiGianHoiChanBnn",
    label: "Thời gian hội chẩn BNN",
    group: "Bệnh nghề nghiệp (BNN)",
  },
  { key: "theBenh", label: "Thể bệnh", group: "Bệnh nghề nghiệp (BNN)" },
  {
    key: "namGiamDinhBnn",
    label: "Năm giám định BNN",
    group: "Bệnh nghề nghiệp (BNN)",
  },
  {
    key: "tyLeGiamDinhBnn",
    label: "Tỷ lệ giám định BNN (%)",
    group: "Bệnh nghề nghiệp (BNN)",
  },
  {
    key: "namHuongTroCapBnn",
    label: "Năm hưởng trợ cấp BNN",
    group: "Bệnh nghề nghiệp (BNN)",
  },
  { key: "daRuaPhoi", label: "Đã rửa phổi", group: "Bệnh nghề nghiệp (BNN)" },
  { key: "namRuaPhoi", label: "Năm rửa phổi", group: "Bệnh nghề nghiệp (BNN)" },
  {
    key: "chongChiDinhRuaPhoi",
    label: "Chống chỉ định rửa phổi",
    group: "Bệnh nghề nghiệp (BNN)",
  },
  {
    key: "tienSuBenhGiaDinh",
    label: "Tiền sử bệnh gia đình",
    group: "Bệnh nghề nghiệp (BNN)",
  },

  // ─── Mô tả khám chuyên khoa ────────────────────────────────────
  {
    key: "khamTuanHoan",
    label: "Khám tuần hoàn",
    group: "Mô tả khám chuyên khoa",
  },
  {
    key: "plKhamTuanHoan",
    label: "Phân loại tuần hoàn",
    group: "Mô tả khám chuyên khoa",
  },
  { key: "khamHoHap", label: "Khám hô hấp", group: "Mô tả khám chuyên khoa" },
  {
    key: "plKhamHoHap",
    label: "Phân loại hô hấp",
    group: "Mô tả khám chuyên khoa",
  },
  {
    key: "khamTieuHoa",
    label: "Khám tiêu hóa",
    group: "Mô tả khám chuyên khoa",
  },
  {
    key: "plKhamTieuHoa",
    label: "Phân loại tiêu hóa",
    group: "Mô tả khám chuyên khoa",
  },
  {
    key: "khamThanTietNieu",
    label: "Khám thận - tiết niệu",
    group: "Mô tả khám chuyên khoa",
  },
  {
    key: "plKhamThanTietNieu",
    label: "Phân loại thận - tiết niệu",
    group: "Mô tả khám chuyên khoa",
  },
  {
    key: "khamNoiTiet",
    label: "Khám nội tiết",
    group: "Mô tả khám chuyên khoa",
  },
  {
    key: "plKhamNoiTiet",
    label: "Phân loại nội tiết",
    group: "Mô tả khám chuyên khoa",
  },
  {
    key: "khamCoXuongKhop",
    label: "Khám cơ - xương - khớp",
    group: "Mô tả khám chuyên khoa",
  },
  { key: "plKhamCxk", label: "Phân loại CXK", group: "Mô tả khám chuyên khoa" },
  {
    key: "khamThanKinh",
    label: "Khám thần kinh",
    group: "Mô tả khám chuyên khoa",
  },
  {
    key: "plKhamThanKinh",
    label: "Phân loại thần kinh",
    group: "Mô tả khám chuyên khoa",
  },
  {
    key: "khamTamThan",
    label: "Khám tâm thần",
    group: "Mô tả khám chuyên khoa",
  },
  {
    key: "plKhamTamThan",
    label: "Phân loại tâm thần",
    group: "Mô tả khám chuyên khoa",
  },
  { key: "khamNgoai", label: "Khám ngoại", group: "Mô tả khám chuyên khoa" },
  {
    key: "plKhamNgoai",
    label: "Phân loại ngoại",
    group: "Mô tả khám chuyên khoa",
  },
  { key: "khamDaLieu", label: "Khám da liễu", group: "Mô tả khám chuyên khoa" },
  {
    key: "plKhamDaLieu",
    label: "Phân loại da liễu",
    group: "Mô tả khám chuyên khoa",
  },
  {
    key: "khamSanPhuKhoa",
    label: "Khám sản phụ khoa",
    group: "Mô tả khám chuyên khoa",
  },
  {
    key: "plKhamSanKhoa",
    label: "Phân loại sản khoa",
    group: "Mô tả khám chuyên khoa",
  },
  {
    key: "tuoiBatDauKinhNguyet",
    label: "Tuổi bắt đầu kinh nguyệt",
    group: "Mô tả khám chuyên khoa",
  },
  {
    key: "tinhChatKinhNguyet",
    label: "Tính chất kinh nguyệt",
    group: "Mô tả khám chuyên khoa",
  },
  {
    key: "chuKyKinh",
    label: "Chu kỳ kinh (ngày)",
    group: "Mô tả khám chuyên khoa",
  },
  {
    key: "luongKinh",
    label: "Lượng kinh (ngày)",
    group: "Mô tả khám chuyên khoa",
  },
  {
    key: "dauBungKinh",
    label: "Đau bụng kinh",
    group: "Mô tả khám chuyên khoa",
  },
  {
    key: "daLapGiaDinh",
    label: "Đã lập gia đình",
    group: "Mô tả khám chuyên khoa",
  },
  { key: "para", label: "PARA", group: "Mô tả khám chuyên khoa" },
  {
    key: "soLanMoSanPhuKhoa",
    label: "Số lần mổ sản phụ khoa",
    group: "Mô tả khám chuyên khoa",
  },
  {
    key: "moTaMoSanPhuKhoa",
    label: "Mô tả mổ sản phụ khoa",
    group: "Mô tả khám chuyên khoa",
  },
  { key: "apDungBptt", label: "Áp dụng BPTT", group: "Mô tả khám chuyên khoa" },
  { key: "moTaBptt", label: "Mô tả BPTT", group: "Mô tả khám chuyên khoa" },
  { key: "khamMat", label: "Khám mắt", group: "Mô tả khám chuyên khoa" },
  { key: "plKhamMat", label: "Phân loại mắt", group: "Mô tả khám chuyên khoa" },
  {
    key: "kqMatTraiKhongKinh",
    label: "Mắt trái (không kính)",
    group: "Mô tả khám chuyên khoa",
  },
  {
    key: "kqMatPhaiKhongKinh",
    label: "Mắt phải (không kính)",
    group: "Mô tả khám chuyên khoa",
  },
  {
    key: "kqMatTraiCoKinh",
    label: "Mắt trái (có kính)",
    group: "Mô tả khám chuyên khoa",
  },
  {
    key: "kqMatPhaiCoKinh",
    label: "Mắt phải (có kính)",
    group: "Mô tả khám chuyên khoa",
  },
  {
    key: "khamTaiMuiHong",
    label: "Tai - Mũi - Họng",
    group: "Mô tả khám chuyên khoa",
  },
  { key: "plKhamTmh", label: "Phân loại TMH", group: "Mô tả khám chuyên khoa" },
  {
    key: "noiThuongTaiTrai",
    label: "Nói thường (tai trái)",
    group: "Mô tả khám chuyên khoa",
  },
  {
    key: "noiThuongTaiPhai",
    label: "Nói thường (tai phải)",
    group: "Mô tả khám chuyên khoa",
  },
  {
    key: "noiThamTaiTrai",
    label: "Nói thầm (tai trái)",
    group: "Mô tả khám chuyên khoa",
  },
  {
    key: "noiThamTaiPhai",
    label: "Nói thầm (tai phải)",
    group: "Mô tả khám chuyên khoa",
  },
  {
    key: "khamRangHamMat",
    label: "Răng - Hàm - Mặt",
    group: "Mô tả khám chuyên khoa",
  },
  { key: "plKhamRhm", label: "Phân loại RHM", group: "Mô tả khám chuyên khoa" },
  { key: "hamTren", label: "Hàm trên", group: "Mô tả khám chuyên khoa" },
  { key: "hamDuoi", label: "Hàm dưới", group: "Mô tả khám chuyên khoa" },
  { key: "ketQuaCls", label: "Kết quả CLS", group: "Mô tả khám chuyên khoa" },
  { key: "danhGiaCls", label: "Đánh giá CLS", group: "Mô tả khám chuyên khoa" },
  {
    key: "moTaKetLuan",
    label: "Mô tả kết luận",
    group: "Mô tả khám chuyên khoa",
  },
  {
    key: "huongGiaiQuyet",
    label: "Hướng giải quyết",
    group: "Mô tả khám chuyên khoa",
  },
  {
    key: "nguoiKetLuan",
    label: "Người kết luận",
    group: "Mô tả khám chuyên khoa",
  },

  // ─── Xử trí ────────────────────────────────────────────────────
  { key: "xuTriDt", label: "Xử trí ĐT", group: "Xử trí" },
  { key: "xuTriTd", label: "Xử trí TD", group: "Xử trí" },
  { key: "xuTriCk", label: "Xử trí CK", group: "Xử trí" },
  { key: "luuY", label: "Lưu ý", group: "Xử trí" },

  // ─── Xét nghiệm ────────────────────────────────────────────────
  { key: "wbc", label: "WBC", group: "Xét nghiệm" },
  { key: "rbc", label: "RBC", group: "Xét nghiệm" },
  { key: "hgb", label: "HGB", group: "Xét nghiệm" },
  { key: "plt", label: "PLT", group: "Xét nghiệm" },
  { key: "vss", label: "VSS", group: "Xét nghiệm" },
  { key: "ure", label: "Ure", group: "Xét nghiệm" },
  { key: "glucoza", label: "Glucoza", group: "Xét nghiệm" },
  { key: "creatinin", label: "Creatinin", group: "Xét nghiệm" },
  { key: "auric", label: "Acid Uric", group: "Xét nghiệm" },
  { key: "cholesterol", label: "Cholesterol", group: "Xét nghiệm" },
  { key: "triglycerid", label: "Triglycerid", group: "Xét nghiệm" },
  { key: "hdl", label: "HDL", group: "Xét nghiệm" },
  { key: "ldl", label: "LDL", group: "Xét nghiệm" },
  { key: "got", label: "GOT", group: "Xét nghiệm" },
  { key: "gpt", label: "GPT", group: "Xét nghiệm" },
  { key: "ggt", label: "GGT", group: "Xét nghiệm" },
  { key: "albumin", label: "Albumin", group: "Xét nghiệm" },
  { key: "bilirubinTp", label: "Bilirubin TP", group: "Xét nghiệm" },
  { key: "bilirubinTt", label: "Bilirubin TT", group: "Xét nghiệm" },
  { key: "bilirubinGt", label: "Bilirubin GT", group: "Xét nghiệm" },
  { key: "ckmb", label: "CKMB", group: "Xét nghiệm" },
  { key: "canxi", label: "Canxi", group: "Xét nghiệm" },
  { key: "ntLeu", label: "Leukocyte (NT)", group: "Xét nghiệm" },
  { key: "ntNit", label: "Nitrit (NT)", group: "Xét nghiệm" },
  { key: "ntPro", label: "Protein (NT)", group: "Xét nghiệm" },
  { key: "ntPh", label: "pH (NT)", group: "Xét nghiệm" },
  { key: "ntEry", label: "Erythrocyte (NT)", group: "Xét nghiệm" },
  { key: "ntSg", label: "Tỷ trọng (NT)", group: "Xét nghiệm" },
  { key: "ntKet", label: "Ketone (NT)", group: "Xét nghiệm" },
  { key: "ntBil", label: "Bilirubin (NT)", group: "Xét nghiệm" },
  { key: "ntGlu", label: "Glucose (NT)", group: "Xét nghiệm" },
  { key: "ntUbg", label: "Urobilinogen (NT)", group: "Xét nghiệm" },
  { key: "hba1c", label: "HbA1c", group: "Xét nghiệm" },
  { key: "hbsag", label: "HBsAg", group: "Xét nghiệm" },
  { key: "hav", label: "HAV", group: "Xét nghiệm" },
  { key: "hcv", label: "HCV", group: "Xét nghiệm" },
  { key: "hev", label: "HEV", group: "Xét nghiệm" },
  { key: "nhomMau", label: "Nhóm máu", group: "Xét nghiệm" },
  { key: "hpylori", label: "H. Pylori", group: "Xét nghiệm" },

  // ─── Kết quả cận lâm sàng ──────────────────────────────────────
  {
    key: "sieuAmOBung",
    label: "Siêu âm ổ bụng",
    group: "Kết quả cận lâm sàng",
  },
  { key: "saTuyenGiap", label: "SA tuyến giáp", group: "Kết quả cận lâm sàng" },
  { key: "saTim", label: "SA tim", group: "Kết quả cận lâm sàng" },
  {
    key: "saDopplerMachKhac",
    label: "SA Doppler mạch khác",
    group: "Kết quả cận lâm sàng",
  },
  { key: "saVu", label: "SA vú", group: "Kết quả cận lâm sàng" },
  { key: "dienTim", label: "Điện tim", group: "Kết quả cận lâm sàng" },
  { key: "noiSoiTmh", label: "Nội soi TMH", group: "Kết quả cận lâm sàng" },
  {
    key: "noiSoiDaDay",
    label: "Nội soi dạ dày",
    group: "Kết quả cận lâm sàng",
  },
  {
    key: "noiSoiDaiTrang",
    label: "Nội soi đại tràng",
    group: "Kết quả cận lâm sàng",
  },
  {
    key: "chucNangHoHap",
    label: "Chức năng hô hấp",
    group: "Kết quả cận lâm sàng",
  },
  { key: "loangXuong", label: "Loãng xương", group: "Kết quả cận lâm sàng" },
  { key: "xoVuaMach", label: "Xơ vữa mạch", group: "Kết quả cận lâm sàng" },
  { key: "luuHuyetNao", label: "Lưu huyết não", group: "Kết quả cận lâm sàng" },
  {
    key: "xquangTimPhoi",
    label: "X-quang tim phổi",
    group: "Kết quả cận lâm sàng",
  },
  { key: "xquangKhac", label: "X-quang khác", group: "Kết quả cận lâm sàng" },
  { key: "ctCanThiep", label: "CT can thiệp", group: "Kết quả cận lâm sàng" },
  { key: "sinhThiet", label: "Sinh thiết", group: "Kết quả cận lâm sàng" },
  { key: "soiCtc", label: "Soi CTC", group: "Kết quả cận lâm sàng" },
  { key: "papmer", label: "Pap smear", group: "Kết quả cận lâm sàng" },
  { key: "viaTest", label: "VIA test", group: "Kết quả cận lâm sàng" },
  { key: "viliTest", label: "VILI test", group: "Kết quả cận lâm sàng" },
  {
    key: "xnTeBaoCoTuCung",
    label: "XN tế bào cổ tử cung",
    group: "Kết quả cận lâm sàng",
  },
  { key: "xnHpv", label: "XN HPV", group: "Kết quả cận lâm sàng" },

  // ─── Nội khoa ──────────────────────────────────────────────────
  { key: "laoPhoi", label: "Lao phổi", group: "Nội khoa" },
  { key: "ungThuPhoi", label: "Ung thư phổi", group: "Nội khoa" },
  { key: "viemXoangCap", label: "Viêm xoang cấp", group: "Nội khoa" },
  { key: "viemXoangMan", label: "Viêm xoang mãn", group: "Nội khoa" },
  { key: "viemPheQuanCap", label: "Viêm phế quản cấp", group: "Nội khoa" },
  { key: "viemPheQuanMan", label: "Viêm phế quản mãn", group: "Nội khoa" },
  { key: "viemPhoi", label: "Viêm phổi", group: "Nội khoa" },
  { key: "henPheQuanDiUng", label: "Hen phế quản / dị ứng", group: "Nội khoa" },
  {
    key: "iaCHayViemDaDayRuot",
    label: "Ỉa chảy / viêm dạ dày ruột",
    group: "Nội khoa",
  },
  { key: "noiTiet", label: "Nội tiết", group: "Nội khoa" },
  { key: "benhTamThan", label: "Bệnh tâm thần", group: "Nội khoa" },
  {
    key: "benhThanKinhTwNgoaiBien",
    label: "Bệnh TK trung ương & ngoại biên",
    group: "Nội khoa",
  },
  { key: "haCanTheoDoi", label: "HA cần theo dõi", group: "Nội khoa" },
  { key: "haCanDieuTri", label: "HA cần điều trị", group: "Nội khoa" },
  { key: "benhTimMach", label: "Bệnh tim mạch", group: "Nội khoa" },
  { key: "benhVanTim", label: "Bệnh van tim", group: "Nội khoa" },
  { key: "roiLoanNhipTim", label: "Rối loạn nhịp tim", group: "Nội khoa" },
  { key: "viemDaDay", label: "Viêm dạ dày", group: "Nội khoa" },
  { key: "viemDaiTrang", label: "Viêm đại tràng", group: "Nội khoa" },
  { key: "basedow", label: "Basedow", group: "Nội khoa" },
  { key: "tieuDuong", label: "Tiểu đường", group: "Nội khoa" },
  { key: "tangRlDuong", label: "Tăng / RL đường", group: "Nội khoa" },
  { key: "rlMoMau", label: "RL mỡ máu", group: "Nội khoa" },
  { key: "tangMenGan", label: "Tăng men gan", group: "Nội khoa" },
  { key: "tangAcidUric", label: "Tăng Acid Uric", group: "Nội khoa" },
  { key: "viemGanXoGan", label: "Viêm gan / xơ gan", group: "Nội khoa" },
  { key: "benhThanTietNieu", label: "Bệnh thận tiết niệu", group: "Nội khoa" },
  { key: "soiTietNieu", label: "Sỏi tiết niệu", group: "Nội khoa" },
  { key: "nangThan", label: "Nang thận", group: "Nội khoa" },
  {
    key: "nangNhanTuyenGiap",
    label: "Nang / nhân tuyến giáp",
    group: "Nội khoa",
  },
  { key: "ganNhiemMo", label: "Gan nhiễm mỡ", group: "Nội khoa" },
  { key: "soiPolipTuiMat", label: "Sỏi / polip túi mật", group: "Nội khoa" },
  { key: "ungThuNoiKhoa", label: "Ung thư (nội khoa)", group: "Nội khoa" },
  { key: "benhKhacNoiKhoa", label: "Bệnh khác (nội khoa)", group: "Nội khoa" },
  { key: "benhSotRet", label: "Bệnh sốt rét", group: "Nội khoa" },

  // ─── Tai Mũi Họng ──────────────────────────────────────────────
  {
    key: "vmuiHongAmidalXoang",
    label: "V. mũi họng / Amidal / xoang",
    group: "Tai Mũi Họng",
  },
  { key: "viemTai", label: "Viêm tai", group: "Tai Mũi Họng" },
  { key: "polipMui", label: "Polip mũi", group: "Tai Mũi Họng" },
  { key: "benhKhacTmh", label: "Bệnh khác (TMH)", group: "Tai Mũi Họng" },

  // ─── Răng Hàm Mặt ──────────────────────────────────────────────
  { key: "sauRang", label: "Sâu răng", group: "Răng Hàm Mặt" },
  { key: "rangMocLech", label: "Răng mọc lệch", group: "Răng Hàm Mặt" },
  { key: "matRang", label: "Mất răng", group: "Răng Hàm Mặt" },
  { key: "benhKhacRhm", label: "Bệnh khác (RHM)", group: "Răng Hàm Mặt" },

  // ─── Mắt ───────────────────────────────────────────────────────
  { key: "tatKhucXa", label: "Tật khúc xạ", group: "Mắt" },
  { key: "laoThi", label: "Lão thị", group: "Mắt" },
  { key: "giamThiLuc", label: "Giảm thị lực", group: "Mắt" },
  { key: "ducThuyTinhThe", label: "Đục thủy tinh thể", group: "Mắt" },
  { key: "benhKhacMat", label: "Bệnh khác (mắt)", group: "Mắt" },

  // ─── Ngoại khoa ────────────────────────────────────────────────
  { key: "ucacLoai", label: "U các loại", group: "Ngoại khoa" },
  {
    key: "nangNhanTuyenVu",
    label: "Nang / nhân tuyến vú",
    group: "Ngoại khoa",
  },
  { key: "tri", label: "Trĩ", group: "Ngoại khoa" },
  { key: "benhXuongKhop", label: "Bệnh xương khớp", group: "Ngoại khoa" },
  { key: "vetMoOBung", label: "Vết mổ ổ bụng", group: "Ngoại khoa" },
  { key: "gayXuongCu", label: "Gãy xương cũ", group: "Ngoại khoa" },
  {
    key: "matDotNgonTayChanCu",
    label: "Mất đốt ngón tay/chân cũ",
    group: "Ngoại khoa",
  },
  {
    key: "taiNanChanThuongCu",
    label: "Tai nạn / chấn thương cũ",
    group: "Ngoại khoa",
  },
  {
    key: "benhKhacNgoaiKhoa",
    label: "Bệnh khác (ngoại khoa)",
    group: "Ngoại khoa",
  },
  { key: "sayThai", label: "Sảy thai", group: "Ngoại khoa" },

  // ─── Phụ khoa ──────────────────────────────────────────────────
  { key: "viemNamAmDao", label: "Viêm / nấm âm đạo", group: "Phụ khoa" },
  { key: "viemCtc", label: "Viêm CTC", group: "Phụ khoa" },
  { key: "nhanXoTuCung", label: "Nhân xơ tử cung", group: "Phụ khoa" },
  { key: "uxoTuCung", label: "U xơ tử cung", group: "Phụ khoa" },
  { key: "nangBt", label: "Nang buồng trứng", group: "Phụ khoa" },
  { key: "polipCtc", label: "Polip CTC", group: "Phụ khoa" },
  { key: "benhKhacPhuKhoa", label: "Bệnh khác (phụ khoa)", group: "Phụ khoa" },

  // ─── Da liễu ───────────────────────────────────────────────────
  { key: "viemDa", label: "Viêm da", group: "Da liễu" },
  { key: "vayNen", label: "Vảy nến", group: "Da liễu" },
  { key: "langBen", label: "Lang ben", group: "Da liễu" },
  { key: "namDa", label: "Nấm da", group: "Da liễu" },
  { key: "sanNgua", label: "Sẩn ngứa", group: "Da liễu" },
  { key: "benhKhacDaLieu", label: "Bệnh khác (da liễu)", group: "Da liễu" },
];

// deduplicate by key
const UNIQUE_OPTIONAL_COLS = OPTIONAL_COLS.filter(
  (col, idx, self) => self.findIndex((c) => c.key === col.key) === idx,
);

const DEFAULT_VISIBLE = new Set([
  "donVi",
  "mach",
  "huyetAp",
  "plSucKhoe",
  "moTaKetLuan",
]);

// ─── Empty record factory ──────────────────────────────────────────────────────

const createEmpty = (id: number): Partial<HealthRecord> & { _tid: number } => ({
  _tid: id,
  employeeId: "",

  ngayKham: new Date().toISOString().slice(0, 10),
  donVi: "",
  // Thông tin chung
  hoVaTen: "",
  namSinh: 0,
  chucDanh: "",
  congTruong: "",

  // Kết quả
  chieuCao: 0,
  canNang: 0,
  mach: 0,
  huyetAp: "",
  plTheLuc: 0,
  plSucKhoe: 0,
  benhThongThuong: "",
  maBenhThongThuong: "",
  soNgayNghiOm: 0,
  benhManTinh: "",
  maBenhManTinh: "",
  phanLoaiNgheNghiep: 0,
  nldTiepXucYeuToCoHai: false,
  biTaiNanLaoDong: false,
  ngayBiTaiNanLaoDong: "",
  soNgayDieuTriTnld: 0,
  tyLeGiamDinhTnld: 0,
  namHuongTroCapTnld: 0,
  nldKskPhatHienBnn: false,
  nldChanDoanBnn: false,
  chucDanhNgheKhiMacBnn: "",
  tenBenhNgheNghiep: "",
  maBenhNgheNghiep: "",
  thoiGianHoiChanBnn: "",
  theBenh: "",
  namGiamDinhBnn: 0,
  tyLeGiamDinhBnn: 0,
  namHuongTroCapBnn: 0,
  daRuaPhoi: false,
  namRuaPhoi: 0,
  chongChiDinhRuaPhoi: "",
  tienSuBenhGiaDinh: "",

  // Mô tả khám chuyên khoa
  khamTuanHoan: "",
  plKhamTuanHoan: 0,
  khamHoHap: "",
  plKhamHoHap: 0,
  khamTieuHoa: "",
  plKhamTieuHoa: 0,
  khamThanTietNieu: "",
  plKhamThanTietNieu: 0,
  khamNoiTiet: "",
  plKhamNoiTiet: 0,
  khamCoXuongKhop: "",
  plKhamCxk: 0,
  khamThanKinh: "",
  plKhamThanKinh: 0,
  khamTamThan: "",
  plKhamTamThan: 0,
  khamNgoai: "",
  plKhamNgoai: 0,
  khamDaLieu: "",
  plKhamDaLieu: 0,
  khamSanPhuKhoa: "",
  plKhamSanKhoa: 0,
  tuoiBatDauKinhNguyet: 0,
  tinhChatKinhNguyet: "",
  chuKyKinh: 0,
  luongKinh: 0,
  dauBungKinh: false,
  daLapGiaDinh: false,
  para: "",
  soLanMoSanPhuKhoa: 0,
  moTaMoSanPhuKhoa: "",
  apDungBptt: false,
  moTaBptt: "",
  khamMat: "",
  plKhamMat: 0,
  kqMatTraiKhongKinh: "",
  kqMatPhaiKhongKinh: "",
  kqMatTraiCoKinh: "",
  kqMatPhaiCoKinh: "",
  khamTaiMuiHong: "",
  plKhamTmh: 0,
  noiThuongTaiTrai: 0,
  noiThuongTaiPhai: 0,
  noiThamTaiTrai: 0,
  noiThamTaiPhai: 0,
  khamRangHamMat: "",
  plKhamRhm: 0,
  hamTren: "",
  hamDuoi: "",
  ketQuaCls: "",
  danhGiaCls: "",
  moTaKetLuan: "",
  huongGiaiQuyet: "",
  nguoiKetLuan: "",

  // Xử trí
  xuTriDt: false,
  xuTriTd: false,
  xuTriCk: false,
  luuY: false,

  // Xét nghiệm
  wbc: 0,
  rbc: 0,
  hgb: 0,
  plt: 0,
  vss: 0,
  ure: 0,
  glucoza: 0,
  creatinin: 0,
  auric: 0,
  cholesterol: 0,
  triglycerid: 0,
  hdl: 0,
  ldl: 0,
  got: 0,
  gpt: 0,
  ggt: 0,
  albumin: 0,
  bilirubinTp: 0,
  bilirubinTt: 0,
  bilirubinGt: 0,
  ckmb: 0,
  canxi: 0,
  ntLeu: "",
  ntNit: "",
  ntPro: "",
  ntPh: 0,
  ntEry: "",
  ntSg: 0,
  ntKet: "",
  ntBil: "",
  ntGlu: "",
  ntUbg: "",
  hba1c: 0,
  hbsag: false,
  hav: false,
  hcv: false,
  hev: false,
  nhomMau: "",
  hpylori: false,

  // Cận lâm sàng
  sieuAmOBung: "",
  saTuyenGiap: "",
  saTim: "",
  saDopplerMachKhac: "",
  saVu: "",
  dienTim: "",
  noiSoiTmh: "",
  noiSoiDaDay: "",
  noiSoiDaiTrang: "",
  chucNangHoHap: "",
  loangXuong: "",
  xoVuaMach: "",
  luuHuyetNao: "",
  xquangTimPhoi: "",
  xquangKhac: "",
  ctCanThiep: "",
  sinhThiet: "",
  soiCtc: "",
  papmer: "",
  viaTest: "",
  viliTest: "",
  xnTeBaoCoTuCung: "",
  xnHpv: "",

  // Nội khoa
  laoPhoi: false,
  ungThuPhoi: false,
  viemXoangCap: false,
  viemXoangMan: false,
  viemPheQuanCap: false,
  viemPheQuanMan: false,
  viemPhoi: false,
  henPheQuanDiUng: false,
  iaCHayViemDaDayRuot: false,
  noiTiet: false,
  benhTamThan: false,
  benhThanKinhTwNgoaiBien: false,
  haCanTheoDoi: false,
  haCanDieuTri: false,
  benhTimMach: false,
  benhVanTim: false,
  roiLoanNhipTim: false,
  viemDaDay: false,
  viemDaiTrang: false,
  basedow: false,
  tieuDuong: false,
  tangRlDuong: false,
  rlMoMau: false,
  tangMenGan: false,
  tangAcidUric: false,
  viemGanXoGan: false,
  benhThanTietNieu: false,
  soiTietNieu: false,
  nangThan: false,
  nangNhanTuyenGiap: false,
  ganNhiemMo: false,
  soiPolipTuiMat: false,
  ungThuNoiKhoa: false,
  benhKhacNoiKhoa: "",
  benhSotRet: false,

  // Tai Mũi Họng
  vmuiHongAmidalXoang: false,
  viemTai: false,
  polipMui: false,
  benhKhacTmh: "",

  // Răng Hàm Mặt
  sauRang: false,
  rangMocLech: false,
  matRang: false,
  benhKhacRhm: "",

  // Mắt
  tatKhucXa: false,
  laoThi: false,
  giamThiLuc: false,
  ducThuyTinhThe: false,
  benhKhacMat: "",

  // Ngoại khoa
  ucacLoai: false,
  nangNhanTuyenVu: false,
  tri: false,
  benhXuongKhop: false,
  vetMoOBung: false,
  gayXuongCu: false,
  matDotNgonTayChanCu: false,
  taiNanChanThuongCu: false,
  benhKhacNgoaiKhoa: "",
  sayThai: false,

  // Phụ khoa
  viemNamAmDao: false,
  viemCtc: false,
  nhanXoTuCung: false,
  uxoTuCung: false,
  nangBt: false,
  polipCtc: false,
  benhKhacPhuKhoa: "",

  // Da liễu
  viemDa: false,
  vayNen: false,
  langBen: false,
  namDa: false,
  sanNgua: false,
  benhKhacDaLieu: "",
});

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function BulkAddHealthModal({
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const queryClient = useQueryClient();
  type Row = ReturnType<typeof createEmpty>;

  const [rows, setRows] = useState<Row[]>([]);
  const [nextId, setNextId] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<"table" | "expanded">("table");
  const [visibleCols, setVisibleCols] = useState<Set<string>>(DEFAULT_VISIBLE);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && rows.length === 0) addRow();
  }, [isOpen]);

  // ── Mutations ──────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (payload: Partial<HealthRecord>[]) =>
      routineHealthCheckApi.create(payload as any),
    onSuccess: () => {
      toast({ title: `Đã thêm ${rows.length} lượt khám` });
      queryClient.invalidateQueries({ queryKey: ["health-records"] });
      onSuccess();
    },
    onError: () => toast({ title: "Lỗi khi lưu", variant: "destructive" }),
  });

  // ── Row helpers ────────────────────────────────────────────────────────────
  const addRow = () => {
    setRows((p) => [...p, createEmpty(nextId)]);
    setNextId((p) => p + 1);
  };

  const removeRow = (tid: number) =>
    setRows((p) => p.filter((r) => r._tid !== tid));

  const copyRow = (tid: number) => {
    const src = rows.find((r) => r._tid === tid);
    if (!src) return;
    const newRow: Row = { ...src, _tid: nextId, employeeId: undefined };
    setRows((p) => [...p, newRow]);
    setNextId((p) => p + 1);
    toast({ title: "Đã sao chép dòng" });
  };

  const setField = (tid: number, key: string, value: any) =>
    setRows((p) => p.map((r) => (r._tid === tid ? { ...r, [key]: value } : r)));

  const toggleExpand = (tid: number) =>
    setExpandedRows((p) => {
      const s = new Set(p);
      s.has(tid) ? s.delete(tid) : s.add(tid);
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
      toast({
        title: "Vui lòng thêm ít nhất một lượt khám",
        variant: "destructive",
      });
      return;
    }
    const invalid = rows.filter((r) => !r.employeeId || !r.ngayKham);
    if (invalid.length > 0) {
      toast({
        title: `${invalid.length} dòng thiếu Mã NV hoặc Ngày khám`,
        variant: "destructive",
      });
      return;
    }
    const payload = rows.map(({ _tid, ...rest }) => rest);
    console.log("Submitting payload:", payload);
    payload.forEach(item => createMutation.mutate(item));
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
      const ws = wb.addWorksheet("Khám sức khỏe");
      const headers = [
        "Mã NV *",
        "Ngày khám *",
        "Đơn vị",
        "Chiều cao",
        "Cân nặng",
        "Mạch",
        "Huyết áp",
        "Nhóm máu",
        "PL Thể lực",
        "PL Sức khỏe",
        "PL Nghề nghiệp",
        "WBC",
        "RBC",
        "HGB",
        "PLT",
        "VSS",
        "HbA1c",
        "Glucoza",
        "Ure",
        "Creatinin",
        "A.Uric",
        "Cholesterol",
        "Triglycerid",
        "HDL",
        "LDL",
        "GOT",
        "GPT",
        "GGT",
        "Mô tả kết luận",
        "Hướng giải quyết",
        "Người kết luận",
      ];
      ws.addRow(headers);
      ws.getRow(1).font = { bold: true };
      ws.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4472C4" },
      };
      ws.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

      rows.forEach((r) => {
        ws.addRow([
          r.employeeId,
          r.ngayKham,
          r.donVi,
          r.chieuCao,
          r.canNang,
          r.mach,
          r.huyetAp,
          r.nhomMau,
          r.plTheLuc,
          r.plSucKhoe,
          r.phanLoaiNgheNghiep,
          r.wbc,
          r.rbc,
          r.hgb,
          r.plt,
          r.vss,
          r.hba1c,
          r.glucoza,
          r.ure,
          r.creatinin,
          r.auric,
          r.cholesterol,
          r.triglycerid,
          r.hdl,
          r.ldl,
          r.got,
          r.gpt,
          r.ggt,
          r.moTaKetLuan,
          r.huongGiaiQuyet,
          r.nguoiKetLuan,
        ]);
      });

      headers.forEach((_, i) => {
        ws.getColumn(i + 1).width = 16;
      });

      const buf = await wb.xlsx.writeBuffer();
      saveAs(
        new Blob([buf], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        rows.length > 0
          ? `Them_luot_kham_${new Date().toISOString().slice(0, 10)}.xlsx`
          : "Mau_luot_kham.xlsx",
      );
      toast({ title: "Đã tải xuống file" });
    } catch {
      toast({ title: "Lỗi khi xuất file", variant: "destructive" });
    }
  };

  // ── Import Excel ───────────────────────────────────────────────────────────
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(await file.arrayBuffer());
      const ws = wb.getWorksheet("Khám sức khỏe");
      if (!ws) throw new Error('Không tìm thấy sheet "Khám sức khỏe"');

      const imported: Row[] = [];
      let idCounter = nextId;

      ws.eachRow((row, rowNum) => {
        if (rowNum === 1) return;
        const g = (n: number) => {
          const v = row.getCell(n).value;
          return v != null ? String(v).trim() : "";
        };
        if (!g(1)) return;
        imported.push({
          _tid: idCounter++,
          employeeId: num(g(1)),
          ngayKham: g(2) || new Date().toISOString().slice(0, 10),
          donVi: g(3),
          chieuCao: num(g(4)),
          canNang: num(g(5)),
          mach: num(g(6)),
          huyetAp: g(7),
          nhomMau: g(8),
          plTheLuc: num(g(9)),
          plSucKhoe: num(g(10)),
          phanLoaiNgheNghiep: num(g(11)),
          wbc: num(g(12)),
          rbc: num(g(13)),
          hgb: num(g(14)),
          plt: num(g(15)),
          vss: num(g(16)),
          hba1c: num(g(17)),
          glucoza: num(g(18)),
          ure: num(g(19)),
          creatinin: num(g(20)),
          auric: num(g(21)),
          cholesterol: num(g(22)),
          triglycerid: num(g(23)),
          hdl: num(g(24)),
          ldl: num(g(25)),
          got: num(g(26)),
          gpt: num(g(27)),
          ggt: num(g(28)),
          moTaKetLuan: g(29),
          huongGiaiQuyet: g(30),
          nguoiKetLuan: g(31),
          xuTriDt: false,
          xuTriTd: false,
          xuTriCk: false,
          hbsag: false,
          hav: false,
          hcv: false,
          hev: false,
          hpylori: false,
          nldTiepXucYeuToCoHai: false,
          biTaiNanLaoDong: false,
        });
      });

      setRows((p) => [...p, ...imported]);
      setNextId(idCounter);
      toast({ title: `Đã nhập ${imported.length} dòng từ file` });
    } catch (err: any) {
      toast({
        title: err.message || "Lỗi khi đọc file",
        variant: "destructive",
      });
    } finally {
      e.target.value = "";
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
            onChange={(e) => setField(row._tid, key, e.target.checked)}
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
          onChange={(e) => setField(row._tid, key, num(e.target.value))}
        />
      );
    }
    if (dateFields.includes(key)) {
      return (
        <Input
          type="date"
          className={cls}
          value={(row as any)[key] ? (row as any)[key] : ""}
          onChange={(e) => setField(row._tid, key, e.target.value)}
        />
      );
    }
    if (key === "nhomMau") {
      return (
        <Select
          value={(row as any)[key] ? (row as any)[key] : ""}
          onValueChange={(v) => setField(row._tid, key, v)}
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
        onChange={(e) => setField(row._tid, key, e.target.value)}
        placeholder="..."
      />
    );
  };

  // ── Expanded card ──────────────────────────────────────────────────────────
  const renderExpanded = (row: Row, index: number) => {
    const groupedColumns = OPTIONAL_COLS.reduce(
      (acc, col) => {
        if (!acc[col.group]) acc[col.group] = [];
        acc[col.group].push(col);
        return acc;
      },
      {} as Record<string, typeof OPTIONAL_COLS>,
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

    const renderField = (key: string, label: string) => {
      if (booleanFields.includes(key)) {
    return (
      <div key={key} className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <label className="flex items-center gap-1.5 h-8 border rounded-md px-2 bg-background cursor-pointer hover:bg-muted/50 w-full">
        <Checkbox
          checked={Boolean(row[key as keyof Row])}
          onCheckedChange={(v) => setField(row._tid, key, v)}
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
              onChange={(e) => setField(row._tid, key, e.target.value)}
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
              onChange={(e) => setField(row._tid, key, e.target.value)}
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
              onValueChange={(v) => setField(row._tid, key, v)}
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
              onValueChange={(v) => setField(row._tid, key, num(v))}
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
                row._tid,
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

          <Button variant="ghost" size="sm" onClick={() => removeRow(row._tid)}>
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

  // ── Column selector popover ────────────────────────────────────────────────
  const ColumnSelector = () => {
    const groups = UNIQUE_OPTIONAL_COLS.reduce(
      (acc, col) => {
        if (!acc[col.group]) acc[col.group] = [];
        acc[col.group].push(col);
        return acc;
      },
      {} as Record<string, typeof UNIQUE_OPTIONAL_COLS>,
    );

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <ChevronDown className="h-4 w-4" />
            Tùy chỉnh cột ({visibleCols.size + REQUIRED_COLS.length}/
            {REQUIRED_COLS.length + UNIQUE_OPTIONAL_COLS.length})
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-72 max-h-80 overflow-y-auto"
          onWheel={(e) => e.stopPropagation()}
        >
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold mb-1">Cột bắt buộc</p>
              {REQUIRED_COLS.map((c) => (
                <div
                  key={c.key}
                  className="flex items-center gap-2 opacity-50 py-0.5"
                >
                  <Checkbox checked disabled />
                  <span className="text-sm">{c.label}</span>
                </div>
              ))}
            </div>
            {Object.entries(groups).map(([g, cols]) => (
              <div key={g}>
                <p className="text-xs font-semibold mb-1">{g}</p>
                {cols.map((c) => (
                  <div
                    key={c.key}
                    className="flex items-center gap-2 py-0.5 cursor-pointer"
                    onClick={() => toggleCol(c.key)}
                  >
                    <Checkbox
                      checked={visibleCols.has(c.key)}
                      onCheckedChange={() => {
                        toggleCol(c.key);
                      }}
                    />
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
            Thêm nhiều lượt khám sức khỏe và lưu một lần. Có thể tải mẫu Excel
            để nhập liệu nhanh.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Toolbar */}
          <div className="px-6 py-3 border-b flex items-center justify-between bg-muted/30">
            <div className="flex items-center gap-2 flex-wrap">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleImport}
              />
              <Button
                size="sm"
                className="gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" /> Tải lên
              </Button>
              <Button size="sm" className="gap-2" onClick={handleExport}>
                <Download className="h-4 w-4" /> Tải xuống
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() =>
                  setViewMode((m) => (m === "table" ? "expanded" : "table"))
                }
              >
                {viewMode === "table" ? (
                  <Maximize2 className="h-4 w-4" />
                ) : (
                  <Minimize2 className="h-4 w-4" />
                )}
                {viewMode === "table" ? "Mở rộng" : "Thu gọn"}
              </Button>
              {viewMode === "table" && <ColumnSelector />}
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={addRow}
              >
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
                <p>
                  Chưa có lượt khám nào. Nhấn <b>Thêm dòng</b> để bắt đầu.
                </p>
              </div>
            ) : viewMode === "table" ? (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10 sticky left-0 bg-background z-10">
                        #
                      </TableHead>
                      <TableHead className="w-28 sticky left-10 bg-background z-10 text-center">
                        Thao tác
                      </TableHead>
                      {REQUIRED_COLS.map((c) => (
                        <TableHead key={c.key} className="whitespace-nowrap">
                          {c.label}
                        </TableHead>
                      ))}
                      {UNIQUE_OPTIONAL_COLS.filter((c) =>
                        visibleCols.has(c.key),
                      ).map((c) => (
                        <TableHead key={c.key} className="whitespace-nowrap">
                          {c.label}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row, idx) => (
                      <>
                        <TableRow key={row._tid}>
                          <TableCell className="sticky left-0 bg-background z-10 border-r font-medium">
                            {idx + 1}
                          </TableCell>
                          <TableCell className="sticky left-10 bg-background z-10 border-r">
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleExpand(row._tid)}
                                title={
                                  expandedRows.has(row._tid)
                                    ? "Thu gọn"
                                    : "Mở rộng"
                                }
                              >
                                {expandedRows.has(row._tid) ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyRow(row._tid)}
                                title="Sao chép"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeRow(row._tid)}
                                title="Xóa"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                          {REQUIRED_COLS.map((c) => (
                            <TableCell key={c.key}>
                              {renderCell(row, c.key)}
                            </TableCell>
                          ))}
                          {UNIQUE_OPTIONAL_COLS.filter((c) =>
                            visibleCols.has(c.key),
                          ).map((c) => (
                            <TableCell key={c.key}>
                              {renderCell(row, c.key)}
                            </TableCell>
                          ))}
                        </TableRow>
                        {expandedRows.has(row._tid) && (
                          <TableRow key={`${row._tid}-exp`}>
                            <TableCell
                              colSpan={
                                2 +
                                REQUIRED_COLS.length +
                                UNIQUE_OPTIONAL_COLS.filter((c) =>
                                  visibleCols.has(c.key),
                                ).length
                              }
                            >
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
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={createMutation.isPending}
              >
                Hủy
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || rows.length === 0}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                {createMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {createMutation.isPending
                  ? "Đang lưu..."
                  : `Xác nhận (${rows.length})`}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
