import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import Button from "@/shared/components/ui/button/Button";
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
import { employeeApi } from "../../api/employeeApi";
import { toast } from "@/shared/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import GenericSearchSelect from "@/features/employees/components/GenericSearchSelect";
import { categoryConfigs } from "@/features/employees/components/CategoriesConfig";
import NameSelectField from "../NameSelectedField";
import CategorySelectField from "../CategorySelectField";

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const STATUS_MAP: Record<string, string> = {
  DANG_CONG_TAC: "Đang công tác",
  NGHI_CHE_DO: "Nghỉ chế độ",
  NGHI_HUU_TRI: "Nghỉ hưu trí",
  NGHI_VIEC: "Nghỉ việc",
  TU_TRAN: "Từ trần",
};

export const STATUS_REVERSE_MAP: Record<string, string> = {
  "Đang công tác": "DANG_CONG_TAC",
  "Nghỉ chế độ": "NGHI_CHE_DO",
  "Nghỉ hưu trí": "NGHI_HUU_TRI",
  "Nghỉ việc": "NGHI_VIEC",
  "Từ trần": "TU_TRAN",
};

const Field = ({ label, required = false, children, className = "" }: any) => (
  <div className={`space-y-1 ${className}`}>
    <Label className="text-xs font-medium">
      {label}
      {required && <span className="text-destructive ml-1">*</span>}
    </Label>
    {children}
  </div>
);

const SectionTitle = ({ children }: any) => (
  <h3 className="text-sm font-semibold mb-3 text-blue-600 border-b pb-1 uppercase tracking-wide">
    {children}
  </h3>
);

/**
 * DateInput: input[type=date] hỗ trợ cả gõ tay lẫn bấm lịch (native browser calendar).
 * Hiển thị placeholder "dd/MM/yyyy" và format value ISO (yyyy-MM-dd) cho API.
 */
const DateInput = ({
  value,
  onChange,
  required = false,
}: {
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) => (
  <Input
    className="h-8 text-sm"
    type="date"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    required={required}
    // Cho phép user gõ hoặc bấm lịch tuỳ trình duyệt
    placeholder="dd/mm/yyyy"
  />
);

/**
 * Placeholder cho các trường chưa có API danh mục.
 * TODO: thay bằng GenericSearchSelect khi BE bổ sung danh mục tương ứng.
 */
const PendingSelect = ({ value, onChange, placeholder = "Chọn..." }: any) => (
  <Input
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={`[TODO danh mục] ${placeholder}`}
    className="h-8 text-sm border-dashed"
  />
);

// ─── Empty form (88 trường theo đúng spec) ───────────────────────────────────
const createEmptyForm = () => ({
  id: "",
  companyId: "",
  companyName: "",
  // ════ TAB 1: THÔNG TIN CƠ BẢN ════════════════════════════════════════════
  // [1]  Phòng ban *         → danh mục PhongBan
  departmentId: "",
  // [2]  Mã nhân viên *
  code: "",
  // [3]  Họ và tên *
  fullName: "",
  // [4]  Giới tính *         (Nam/Nữ)
  gender: "NAM",
  // [5]  Các tên gọi khác
  otherName: "",
  // [6]  Ngày sinh *         (dd/MM/yyyy)
  birthDate: "",
  // [7]  Nơi sinh *          → danh mục TinhThanhPho
  birthPlace: "",
  // [8]  Trạng thái *        → danh mục TrangThaiHoSo
  status: "Đang công tác",
  // [9]  Cấp ủy hiện tại     → danh mục CapUy (TODO)
  partyCommitteeId: "",
  // [10] Cấp ủy kiêm         → danh mục CapUy (TODO)
  subPartyCommitteeId: "",
  // [11] Chức vụ             → danh mục ChucVu (TODO)
  positionId: "",
  // [12] Phụ cấp chức vụ    (số)
  positionAllowance: "",
  // [13] Mã số thuế
  taxCode: "",
  // [14] Chức vụ kiêm nhiệm → danh mục ChucVu (TODO)
  subPositionId: "",
  // [15] Chức danh           → danh mục ChucDanh (TODO)
  jobTitleId: "",
  // [16] Vị trí công việc   → danh mục ViTriCongViec (TODO)
  jobPositionId: "",

  // Nơi ở hiện nay – Thường trú
  // [17] Tỉnh/Thành phố     → danh mục TinhThanhPho
  contactAddress: "",
  provinceCityId: "", // Thường trú - Tỉnh/TP → object ref
  wardId: "", // Thường trú - Xã/Phường → object ref
  permanentAddress: "", // Thường trú - Chi tiết
  nativePlace: "", // Quê quán - Tỉnh/TP (lưu tên string)
  homeTown: "", // Quê quán - Xã/Phường (lưu tên string)

  // ════ TAB 2: THÔNG TIN KHÁC ══════════════════════════════════════════════
  // [23] Dân tộc             → danh mục DanToc
  ethnicity: "",
  // [24] Tôn giáo            → danh mục TonGiao (TODO)
  religionId: "",
  religionName: "",
  // [25] Quốc tịch           → danh mục QuocTich
  nationalityId: "",
  // [26] Thành phần gia đình xuất thân → danh mục ThanhPhanGiaDinh
  policyFamilyId: "",
  // [27] Ngày tham gia cách mạng (dd/MM/yyyy)
  youthUnionJoinDate: "",
  // [28] Ngày vào ĐCS        (dd/MM/yyyy)
  partyJoinDate: "",
  // [29] Ngày chính thức ĐCS (dd/MM/yyyy)
  partyOfficialDate: "",
  // [30] Ngày nhập ngũ       (dd/MM/yyyy)
  militaryJoinDate: "",
  // [31] Ngày xuất ngũ       (dd/MM/yyyy)
  militaryEndDate: "",
  // [32] Quân hàm, chức vụ cao nhất
  title: "",
  // [33] Danh hiệu được phong → danh mục DanhHieuDuocPhong (TODO)
  militaryRankId: "",
  // [34] Thương binh hạng    (số)
  injuryRank: "",
  // [35] Gia đình liệt sĩ   (Có/Không)
  isWoundedSoldier: false,
  // [36] Tình trạng sức khỏe
  healthStatus: "",
  // [37] Chiều cao (Cm)      (số)
  height: "",
  // [38] Cân nặng (Kg)       (số)
  weight: "",
  // [39] Nhóm máu
  bloodType: "",
  // [40] CCCD/CC
  cccdNumber: "",
  // [41] Ngày cấp            (dd/MM/yyyy)
  cccdDate: "",
  // [42] Nơi cấp
  cccdPlace: "",

  // ════ TAB 3: NGUỒN THU NHẬP ══════════════════════════════════════════════
  // [43] Nguồn thu nhập của gia đình (VNĐ)
  familyIncome: "",
  // [44] Các nguồn thu nhập khác
  otherIncome: "",
  // [45] Được cấp, được thuê, loại nhà
  housingType: "",
  // [46] Tổng diện tích sử dụng (m²) – được cấp/thuê
  housingArea: "",
  // [47] Nhà tự mua, tự xây, loại nhà
  selfHousingType: "",
  // [48] Tổng diện tích sử dụng (m²) – tự mua/xây
  usableArea: "",
  // [49] Đất được cấp (m²)
  grantedLandArea: "",
  // [50] Đất tự mua (m²)
  purchasedLandArea: "",
  // [51] Các loại đất khác
  otherLand: "",
  // [52] Số tài khoản
  bankAccountNumber: "",
  // [53] Tên ngân hàng
  bankName: "",
  // [54] Chủ tài khoản
  bankAccountHolder: "",
  // [55] Chi nhánh
  bankBranch: "",

  // ════ TAB 4: TRÌNH ĐỘ ════════════════════════════════════════════════════
  organizationName: "",
  // [56] Nghề nghiệp trước khi được tuyển dụng
  previousJob: "",
  // [57] Ngày tuyển dụng     (dd/MM/yyyy)
  recruitmentDate: "",
  // [58] Ngày vào cơ quan *  (dd/MM/yyyy)
  startDate: "",
  // [59] Cơ quan tuyển dụng  → danh mục CoCauToChuc (TODO)
  organizationId: "",
  // [60] Địa chỉ cơ quan
  organizationAddress: "",
  // [61] Trình độ giáo dục phổ thông (12/12)
  educationDetail: "",
  // [62] Học hàm học vị cao nhất → danh mục HocHamHocVi
  educationLevelId: "",
  // [63] Lý luận chính trị   → danh mục LyLuanChinhTri
  politicalTheoryId: "",
  // [64] Ngoại ngữ           → danh mục NgoaiNgu (TODO)
  languageId: "",
  // [65] Trình độ ngoại ngữ  → danh mục TrinhDoNgoaiNgu
  languageLevelId: "",
  // [66] Chuyên môn chính    → danh mục ChuyenMon
  culturalLevelId: "",
  // [67] Trình độ chuyên môn cao nhất → danh mục TrinhDo
  professionalLevelId: "",
  // [68] Công việc chính đang làm
  currentJobDetail: "",
  // [69] Sở trường công tác
  workStrength: "",
  // [70] Công việc đã làm lâu nhất
  longestJob: "",

  // ════ TAB 5: LƯƠNG & BHXH ════════════════════════════════════════════════
  // [71] Bảng lương          → danh mục BangLuong (TODO)
  salaryPayrollId: "",
  // [72] Thang bảng lương    → danh mục ThangBangLuong (TODO)
  salaryScaleId: "",
  // [73] Hệ số lương         (số)
  salaryCoefficient: "",
  salaryPayrollName: "",
  salaryScaleName: "",
  socialInsurancePayrollName: "",
  socialInsuranceSalaryScaleName: "",
  // [74] Mức lương           (số)
  salaryAmount: "",
  // [75] Ngày áp dụng        (dd/MM/yyyy)
  salaryEffectiveDate: "",
  // [76] Bảng lương BHXH     → danh mục BangLuong (TODO)
  socialInsurancePayrollId: "",
  // [77] Thang bảng lương BHXH → danh mục ThangBangLuong (TODO)
  socialInsuranceSalaryScaleId: "",
  // [78] Hệ số lương BHXH    (số)
  socialInsuranceSalaryCoefficient: "",
  // [79] Mức lương BHXH      (số)
  socialInsuranceSalaryAmount: "",
  // [80] Nơi đóng BHXH
  socialInsurancePlace: "",
  // [81] Số sổ BHXH
  socialInsuranceNumber: "",
  // [82] Lương NS tài chính công đoàn (số)
  unionSalary: "",
  // [83] Chức danh BHXH      → danh mục ChucDanh (TODO)
  socialInsuranceJobTitleId: "",
  socialInsuranceJobTitleName: "",
  // ════ TAB 6: ĐẶC ĐIỂM LỊCH SỬ BẢN THÂN ════════════════════════════════
  // [84] Khai rõ: bị bắt, bị tù...
  legalHistory: "",
  // [85] Bản thân có làm việc trong chế độ cũ
  workedInOldRegime: "",
  // [86] Tham gia hoặc có quan hệ với các tổ chức nước ngoài
  foreignOrganizationRelation: "",
  // [87] Có thân nhân ở nước ngoài
  relativesAbroad: "",
  // [88] Ghi chú
  note: "",

  departmentName: "",
  positionName: "",
  subPositionName: "",
  jobTitleName: "",
  jobPositionName: "",
  provinceCityName: "",
  wardName: "",
  nationalityName: "",
  policyFamilyName: "",
  educationLevelName: "",
  politicalTheoryName: "",
  languageLevelName: "",
  culturalLevelName: "",
  professionalLevelName: "",
  militaryRankName: "",

  // internal - không phải trường spec
  user: null as any,
  workProcesses: [],
});

// ─── Map API response → formData ─────────────────────────────────────────────
const mapResponseToForm = (d: any) => ({
  id: d.id ?? "",
  companyId: d.companyId?.toString() ?? "",
  companyName: d.companyName ?? "",
  // ── Định danh ──────────────────────────────────────────────────────────────
  code: d.code ?? "",
  fullName: d.fullName ?? d.name ?? "",
  otherName: d.otherName ?? d.otherName ?? "",
  gender: d.gender ?? "NAM",
  birthDate: d.birthDate ?? d.birthday ?? "",
  birthPlace: d.birthPlace ?? "",
  status: STATUS_MAP[d.status] ?? d.status ?? "Đang công tác",

  // ── Cấp ủy ─────────────────────────────────────────────────────────────────
  // Response có thể trả về flat (partyCommitteeId) HOẶC nested array
  partyCommitteeId:
    d.partyCommitteeId?.toString() ??
    d.partyCommittees?.[0]?.partyCommittee?.id?.toString() ??
    "",
  subPartyCommitteeId:
    d.subPartyCommitteeId?.toString() ??
    d.subPartyCommittees?.[0]?.partyCommittee?.id?.toString() ??
    "",

  // ── Chức vụ / Chức danh ───────────────────────────────────────────────────
  positionId: d.positionId?.toString() ?? "",
  positionName: d.positionName ?? "",
  positionAllowance: d.positionAllowance?.toString() ?? "",
  taxCode: d.taxCode ?? "",
  subPositionId: d.subPositionId?.toString() ?? "",
  subPositionName: d.subPositionName ?? "",
  jobTitleId: d.jobTitleId?.toString() ?? "",
  jobTitleName: d.jobTitleName ?? "",
  jobPositionId: d.jobPositionId?.toString() ?? "",
  jobPositionName: d.jobPositionName ?? "",

  // ── Địa chỉ ───────────────────────────────────────────────────────────────
  contactAddress: d.contactAddress ?? "",
  provinceCityId: d.provinceCityId?.toString() ?? "",
  provinceCityName: d.provinceCityName ?? "",
  wardId: d.wardId?.toString() ?? "",
  wardName: d.wardName ?? "",
  permanentAddress: d.permanentAddress ?? "",
  nativePlace: d.nativePlace ?? "",
  homeTown: d.homeTown ?? "",

  // ── Thông tin khác ────────────────────────────────────────────────────────
  ethnicity: d.ethnicity ?? "",
  religionId: d.religionId?.toString() ?? "",
  religionName: d.religionName ?? "",
  nationalityId: d.nationalityId?.toString() ?? "",
  nationalityName: d.nationalityName ?? "",
  policyFamilyId: d.policyFamilyId?.toString() ?? "",
  policyFamilyName: d.policyFamilyName ?? "",

  youthUnionJoinDate: d.youthUnionJoinDate ?? "",
  partyJoinDate: d.partyJoinDate ?? "",
  partyOfficialDate: d.partyOfficialDate ?? "",

  militaryJoinDate: d.militaryJoinDate ?? "",
  militaryEndDate: d.militaryEndDate ?? "",
  title: d.title ?? "",
  militaryRankId: d.militaryRankId?.toString() ?? "",
  militaryRankName: d.militaryRankName ?? "",
  injuryRank: d.injuryRank?.toString() ?? "",
  isWoundedSoldier: d.isWoundedSoldier ?? false,

  healthStatus: d.healthStatus ?? "",
  height: d.height?.toString() ?? "",
  weight: d.weight?.toString() ?? "",
  bloodType: d.bloodType ?? "",

  cccdNumber: d.cccdNumber ?? "",
  cccdDate: d.cccdDate ?? "",
  cccdPlace: d.cccdPlace ?? "",

  // ── Nguồn thu nhập ────────────────────────────────────────────────────────
  familyIncome: d.familyIncome?.toString() ?? "",
  otherIncome: d.otherIncome ?? "",
  housingType: d.housingType ?? "",
  housingArea: d.housingArea?.toString() ?? "",
  selfHousingType: d.selfHousingType ?? "",
  usableArea: d.usableArea?.toString() ?? "",
  grantedLandArea: d.grantedLandArea?.toString() ?? "",
  purchasedLandArea: d.purchasedLandArea?.toString() ?? "",
  otherLand: d.otherLand ?? "",

  bankAccountNumber: d.bankAccountNumber ?? "",
  bankName: d.bankName ?? "",
  bankAccountHolder: d.bankAccountHolder ?? "",
  bankBranch: d.bankBranch ?? "",

  // ── Trình độ ──────────────────────────────────────────────────────────────
  organizationId: d.organizationId?.toString() ?? "",
  organizationName: d.organizationName ?? "",
  previousJob: d.previousJob ?? "",
  recruitmentDate: d.recruitmentDate ?? "",
  startDate: d.startDate ?? "",
  organizationAddress: d.organizationAddress ?? "",

  educationDetail: d.educationDetail ?? "",
  educationLevelId: d.educationLevelId?.toString() ?? "",
  educationLevelName: d.educationLevelName ?? "",
  politicalTheoryId: d.politicalTheoryId?.toString() ?? "",
  politicalTheoryName: d.politicalTheoryName ?? "",
  languageId: d.languageId?.toString() ?? "",
  languageLevelId: d.languageLevelId?.toString() ?? "",
  languageLevelName: d.languageLevelName ?? "",
  culturalLevelId: d.culturalLevelId?.toString() ?? "",
  culturalLevelName: d.culturalLevelName ?? "",
  professionalLevelId: d.professionalLevelId?.toString() ?? "",
  professionalLevelName: d.professionalLevelName ?? "",

  currentJobDetail: d.currentJobDetail ?? "",
  workStrength: d.workStrength ?? "",
  longestJob: d.longestJob ?? "",

  // ── Lương & BHXH ──────────────────────────────────────────────────────────
  salaryCoefficient: d.salaries?.[0]?.salaryCoefficient?.toString() ?? "",
  salaryAmount: d.salaries?.[0]?.salaryAmount?.toString() ?? "",
  salaryEffectiveDate: d.salaries?.[0]?.effectiveDate ?? "",
  salaryPayrollId:
    d.salaries?.[0]?.payroll?.id?.toString() ?? d.payrollId?.toString() ?? "",
  salaryPayrollName: d.salaries?.[0]?.payroll?.name ?? d.payrollName ?? "",
  salaryScaleId:
    d.salaries?.[0]?.salaryScale?.id?.toString() ??
    d.salaryScaleId?.toString() ??
    "",
  salaryScaleName:
    d.salaries?.[0]?.salaryScale?.name ?? d.salaryScaleName ?? "",
  socialInsurancePayrollId: d.socialInsurancePayrollId?.toString() ?? "",
  socialInsurancePayrollName: d.socialInsurancePayrollName ?? "",
  socialInsuranceSalaryScaleId:
    d.socialInsuranceSalaryScaleId?.toString() ?? "",
  socialInsuranceSalaryScaleName: d.socialInsuranceSalaryScaleName ?? "",
  socialInsuranceJobTitleId: d.socialInsuranceJobId?.toString() ?? "",
  socialInsuranceJobTitleName: d.socialInsuranceJobName ?? "",
  socialInsuranceSalaryCoefficient:
    d.socialInsuranceSalaryCoefficient?.toString() ?? "",
  socialInsuranceSalaryAmount: d.socialInsuranceSalaryAmount?.toString() ?? "",
  socialInsurancePlace: d.socialInsurancePlace ?? "",
  socialInsuranceNumber: d.socialInsuranceNumber ?? "",
  unionSalary: d.unionSalary?.toString() ?? "",

  departmentId: d.departmentId?.toString() ?? "",
  departmentName: d.departmentName ?? "",

  // ── Lịch sử bản thân ──────────────────────────────────────────────────────
  legalHistory: d.legalHistory ?? "",
  workedInOldRegime: d.workedInOldRegime ?? "",
  foreignOrganizationRelation: d.foreignOrganizationRelation ?? "",
  relativesAbroad: d.relativesAbroad ?? "",

  note: d.note ?? "",
  user: d.userId ? { id: d.userId } : null,
  workProcesses: d.workProcesses || [],
});

// ─── Map formData → API payload ───────────────────────────────────────────────
const mapFormToPayload = (f: any, mode: string) => ({
  ...(mode === "edit" && { id: Number(f.id) }), // id vẫn là number

  code: f.code,
  fullName: f.fullName,
  otherName: f.otherName || null,
  gender: f.gender,
  dateOfBirth: f.birthDate || null,
  status: STATUS_REVERSE_MAP[f.status] ?? f.status,
  startDate: f.startDate || null,
  taxCode: f.taxCode || null,

  // ── Spec = "string" → giữ nguyên string ──────────────────
  companyId: f.companyId || null,
  departmentId: f.departmentId || null,
  positionId: f.positionId || null,
  subPositionId: f.subPositionId || null,
  jobTitleId: f.jobTitleId || null,
  jobPositionId: f.jobPositionId || null,
  partyCommitteeId: f.partyCommitteeId || null,
  subPartyCommitteeId: f.subPartyCommitteeId || null,
  organizationId: f.organizationId || null,

  // ── provinceCityId, wardId không có trong swagger PUT ────
  // → hỏi BE, tạm thời vẫn gửi lên
  provinceCityId: f.provinceCityId || null,
  wardId: f.wardId || null,

  // ── Spec = number → convert Number() ─────────────────────
  foreignLanguageId: f.languageId ? Number(f.languageId) : null,
  languageLevelId: f.languageLevelId ? Number(f.languageLevelId) : null,
  payrollId: f.salaryPayrollId ? Number(f.salaryPayrollId) : null,
  salaryScaleId: f.salaryScaleId ? Number(f.salaryScaleId) : null,
  salaryCoefficient: f.salaryCoefficient ? Number(f.salaryCoefficient) : null,
  salaryAmount: f.salaryAmount ? Number(f.salaryAmount) : null,
  laborContractTypeId: f.laborContractTypeId
    ? Number(f.laborContractTypeId)
    : null,
  culturalLevelId: f.culturalLevelId ? Number(f.culturalLevelId) : null,
  professionalLevelId: f.professionalLevelId
    ? Number(f.professionalLevelId)
    : null,
  itLevelId: f.itLevelId ? Number(f.itLevelId) : null,
  trainingMajorId: f.trainingMajorId ? Number(f.trainingMajorId) : null,
  militaryRankId: f.militaryRankId ? Number(f.militaryRankId) : null,
  policyFamilyId: f.policyFamilyId ? Number(f.policyFamilyId) : null,
  occupationId: f.occupationId ? Number(f.occupationId) : null,
  socialInsuranceJobId: f.socialInsuranceJobTitleId
    ? Number(f.socialInsuranceJobTitleId)
    : null,
  decreaseReasonId: f.decreaseReasonId ? Number(f.decreaseReasonId) : null,
  increaseReasonId: f.increaseReasonId ? Number(f.increaseReasonId) : null,
  injuryRank: f.injuryRank ? Number(f.injuryRank) : null,
  height: f.height ? Number(f.height) : null,
  weight: f.weight ? Number(f.weight) : null,
  familyIncome: f.familyIncome ? Number(f.familyIncome) : null,
  housingArea: f.housingArea ? Number(f.housingArea) : null,
  usableArea: f.usableArea ? Number(f.usableArea) : null,
  grantedLandArea: f.grantedLandArea ? Number(f.grantedLandArea) : null,
  purchasedLandArea: f.purchasedLandArea ? Number(f.purchasedLandArea) : null,

  // ── Địa chỉ (string) ──────────────────────────────────────
  contactAddress: f.contactAddress || null,
  permanentAddress: f.permanentAddress || null,
  nativePlace: f.nativePlace || null,
  homeTown: f.homeTown || null,
  birthPlace: f.birthPlace || null,

  // ── Còn lại ───────────────────────────────────────────────
  positionAllowance: f.positionAllowance ? Number(f.positionAllowance) : null,
  ethnicity: f.ethnicity || null,
  religion: f.religionId || null,
  youthUnionJoinDate: f.youthUnionJoinDate || null,
  partyJoinDate: f.partyJoinDate || null,
  partyOfficialDate: f.partyOfficialDate || null,
  militaryJoinDate: f.militaryJoinDate || null,
  militaryEndDate: f.militaryEndDate || null,
  title: f.title || null,
  isWoundedSoldier: f.isWoundedSoldier,
  healthStatus: f.healthStatus || null,
  bloodType: f.bloodType || null,
  cccdNumber: f.cccdNumber || null,
  cccdDate: f.cccdDate || null,
  cccdPlace: f.cccdPlace || null,
  otherIncome: f.otherIncome || null,
  housingType: f.housingType || null,
  selfHousingType: f.selfHousingType || null,
  otherLand: f.otherLand || null,
  bankAccountNumber: f.bankAccountNumber || null,
  bankName: f.bankName || null,
  bankAccountHolder: f.bankAccountHolder || null,
  bankBranch: f.bankBranch || null,
  previousJob: f.previousJob || null,
  recruitmentDate: f.recruitmentDate || null,
  organizationAddress: f.organizationAddress || null,
  educationDetail: f.educationDetail || null,
  currentJobDetail: f.currentJobDetail || null,
  workStrength: f.workStrength || null,
  longestJob: f.longestJob || null,
  effectiveDate: f.salaryEffectiveDate || null,
  socialInsuranceNumber: f.socialInsuranceNumber || null,
  legalHistory: f.legalHistory || null,
  workedInOldRegime: f.workedInOldRegime || null,
  foreignOrganizationRelation: f.foreignOrganizationRelation || null,
  relativesAbroad: f.relativesAbroad || null,
  note: f.note || null,
  cardNumber: f.cardNumber || null,
  nationalityId: f.nationalityId || null,

  workProcesses: f.workProcesses,

  ...(mode === "edit" && f.user && { userId: Number(f.user.id) }),
});

export default function EmployeeModal({ isOpen, onClose, employeeId, mode }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(createEmptyForm());

  const { data: employee } = useQuery({
    queryKey: ["employee", employeeId],
    queryFn: () => employeeApi.getById(employeeId!),
    enabled: mode === "edit" && !!employeeId && isOpen,
    staleTime: 0,
    gcTime: 0,
  });

  useEffect(() => {
    if (!isOpen) return;
    if (mode === "edit" && employee) {
      setFormData(mapResponseToForm(employee.data ?? employee));
    } else if (mode === "create") {
      setFormData(createEmptyForm());
    }
  }, [isOpen, mode, employee]);

  const createMutation = useMutation({
    mutationFn: (data: any) => employeeApi.create(data),
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Tạo nhân viên mới thành công",
      });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo nhân viên",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => employeeApi.update(employeeId!, data),
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Cập nhật nhân viên thành công",
      });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["employee", employeeId] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật nhân viên",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.gender)
      return toast({
        title: "Thiếu thông tin",
        description: "Vui lòng chọn giới tính",
        variant: "destructive",
      });
    if (!formData.departmentId)
      return toast({
        title: "Thiếu thông tin",
        description: "Vui lòng chọn phòng ban",
        variant: "destructive",
      });
    const payload = mapFormToPayload(formData, mode);
    mode === "create"
      ? createMutation.mutate(payload)
      : updateMutation.mutate(payload);
  };

  const set = (field: string, value: any) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const addWorkProcess = () => {
    setFormData((prev) => ({
      ...prev,
      workProcesses: [
        ...prev.workProcesses,
        {startDate: "", endDate: "", detail: "" },
      ],
    }));
  };

  const updateWorkProcess = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const newProcesses = [...prev.workProcesses];
      newProcesses[index] = { ...newProcesses[index], [field]: value };
      return { ...prev, workProcesses: newProcesses };
    });
  };

  const removeWorkProcess = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      workProcesses: prev.workProcesses.filter((_, i) => i !== index),
    }));
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const description =
    mode === "create"
      ? "Nhập thông tin để tạo nhân viên mới. Các trường (*) là bắt buộc."
      : `Chỉnh sửa: ${employee?.data?.fullName ?? employee?.data?.name ?? ""}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle>
            {mode === "create" ? "Thêm nhân viên" : "Chỉnh sửa nhân viên"}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col overflow-hidden min-h-0"
        >
          <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0 space-y-6">
            {/* ══════════ TAB 1: THÔNG TIN CƠ BẢN ══════════ */}
            <div className="mt-0 space-y-6">
              {/* [1–8] Định danh */}
              <div>
                <SectionTitle>Thông tin định danh</SectionTitle>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Công ty" required>
                    <CategorySelectField
                      configKey="company"
                      value={formData.companyId}
                      displayValue={formData.companyName}
                      onChange={(v) => set("companyId", v)}
                    />
                  </Field>
                  {/* [1] Phòng ban */}
                  <Field label="Phòng ban" required>
                    <CategorySelectField
                      configKey="department"
                      value={formData.departmentId}
                      displayValue={formData.departmentName}
                      onChange={(v) => set("departmentId", v)}
                      onChangeWithName={(id, name) => {
                        set("departmentId", id);
                        set("departmentName", name);
                      }}
                    />
                  </Field>
                  {/* [2] Mã nhân viên */}
                  <Field label="Mã nhân viên" required>
                    <Input
                      className="h-8 text-sm"
                      value={formData.code}
                      onChange={(e) => set("code", e.target.value)}
                      placeholder="Nhập mã nhân viên"
                      required
                    />
                  </Field>
                  {/* [3] Họ và tên */}
                  <Field label="Họ và tên" required>
                    <Input
                      className="h-8 text-sm"
                      value={formData.fullName}
                      onChange={(e) => set("fullName", e.target.value)}
                      placeholder="Nhập họ và tên"
                      required
                    />
                  </Field>
                  {/* [4] Giới tính */}
                  <Field label="Giới tính" required>
                    <Select
                      value={formData.gender}
                      onValueChange={(v) => set("gender", v)}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NAM">Nam</SelectItem>
                        <SelectItem value="NỮ">Nữ</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  {/* [5] Các tên gọi khác */}
                  <Field label="Các tên gọi khác">
                    <Input
                      className="h-8 text-sm"
                      value={formData.otherName}
                      onChange={(e) => set("otherName", e.target.value)}
                      placeholder="Tên khác (nếu có)"
                    />
                  </Field>
                  {/* [6] Ngày sinh */}
                  <Field label="Ngày sinh" required>
                    <DateInput
                      value={formData.birthDate}
                      onChange={(v) => set("birthDate", v)}
                      required
                    />
                  </Field>
                  {/* [7] Nơi sinh */}
                  <Field label="Nơi sinh (Tỉnh/Thành Phố)" required>
                    <NameSelectField
                      configKey="provinceCity"
                      currentName={formData.birthPlace}
                      onChange={(v) => set("birthPlace", v)}
                    />
                  </Field>
                  {/* [8] Trạng thái */}
                  <Field label="Trạng thái hồ sơ" required>
                    <Select
                      value={formData.status}
                      onValueChange={(v) => set("status", v)}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Đang công tác">
                          Đang công tác
                        </SelectItem>
                        <SelectItem value="Nghỉ chế độ">Nghỉ chế độ</SelectItem>
                        <SelectItem value="Nghỉ hưu trí">
                          Nghỉ hưu trí
                        </SelectItem>
                        <SelectItem value="Nghỉ việc">Nghỉ việc</SelectItem>
                        <SelectItem value="Từ trần">Từ trần</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </div>

              {/* [9–10] Cấp ủy */}
              <div>
                <SectionTitle>Cấp ủy</SectionTitle>
                <div className="grid grid-cols-2 gap-3">
                  {/* [9] Cấp ủy hiện tại */}
                  <Field label="Cấp ủy hiện tại">
                    <CategorySelectField
                      configKey="partyCommittee"
                      value={formData.partyCommitteeId}
                      onChange={(v) => set("partyCommitteeId", v)}
                    />
                  </Field>
                  {/* [10] Cấp ủy kiêm */}
                  <Field label="Cấp ủy kiêm">
                    <CategorySelectField
                      configKey="partyCommittee"
                      value={formData.subPartyCommitteeId}
                      onChange={(v) => set("subPartyCommitteeId", v)}
                    />
                  </Field>
                </div>
              </div>

              {/* [11–16] Chức vụ & Chức danh */}
              <div>
                <SectionTitle>Chức vụ &amp; Chức danh</SectionTitle>
                <div className="grid grid-cols-3 gap-3">
                  {/* [11] Chức vụ */}
                  <Field label="Chức vụ">
                    <CategorySelectField
                      configKey="position"
                      value={formData.positionId}
                      displayValue={formData.positionName}
                      onChange={(v) => set("positionId", v)}
                    />
                  </Field>
                  {/* [12] Phụ cấp chức vụ */}
                  <Field label="Phụ cấp chức vụ (VNĐ)">
                    <Input
                      className="h-8 text-sm"
                      type="number"
                      value={formData.positionAllowance}
                      onChange={(e) => set("positionAllowance", e.target.value)}
                      placeholder="Nhập số tiền"
                    />
                  </Field>
                  {/* [13] Mã số thuế */}
                  <Field label="Mã số thuế">
                    <Input
                      className="h-8 text-sm"
                      value={formData.taxCode}
                      onChange={(e) => set("taxCode", e.target.value)}
                      placeholder="Nhập mã số thuế"
                    />
                  </Field>
                  {/* [14] Chức vụ kiêm nhiệm */}
                  <Field label="Chức vụ kiêm nhiệm">
                    <CategorySelectField
                      configKey="position"
                      value={formData.subPositionId}
                      displayValue={formData.subPositionName}
                      onChange={(v) => set("subPositionId", v)}
                    />
                  </Field>
                  {/* [15] Chức danh */}
                  <Field label="Chức danh">
                    <CategorySelectField
                      configKey="jobTitle"
                      value={formData.jobTitleId}
                      displayValue={formData.jobTitleName}
                      onChange={(v) => set("jobTitleId", v)}
                    />
                  </Field>
                  {/* [16] Vị trí công việc */}
                  <Field label="Vị trí công việc">
                    <CategorySelectField
                      configKey="jobPosition"
                      value={formData.jobPositionId}
                      displayValue={formData.jobPositionName}
                      onChange={(v) => set("jobPositionId", v)}
                    />
                  </Field>
                </div>
              </div>

              <div>
                <SectionTitle>Địa chỉ</SectionTitle>
                <div className="space-y-4">
                  {/* Nơi ở hiện nay */}
                  <div>
                    <Field label="Nơi ở hiện nay">
                      <Input
                        className="h-8 text-sm"
                        value={formData.contactAddress}
                        onChange={(e) => set("contactAddress", e.target.value)}
                        placeholder="Nhập địa chỉ nơi ở hiện nay"
                      />
                    </Field>
                  </div>

                  {/* Nơi đăng ký thường trú */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Thường trú
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      <Field label="Tỉnh/Thành phố">
                        <CategorySelectField
                          configKey="provinceCity"
                          value={formData.provinceCityId}
                          displayValue={formData.provinceCityName}
                          onChange={(v) => set("provinceCityId", v)}
                        />
                      </Field>
                      <Field label="Xã/Phường">
                        <CategorySelectField
                          configKey="ward"
                          value={formData.wardId}
                          displayValue={formData.wardName}
                          onChange={(v) => set("wardId", v)}
                        />
                      </Field>
                      <Field label="Nơi đăng ký thường trú">
                        <Input
                          className="h-8 text-sm"
                          value={formData.permanentAddress}
                          onChange={(e) =>
                            set("permanentAddress", e.target.value)
                          }
                          placeholder="Số nhà, đường, thôn/xóm..."
                        />
                      </Field>
                    </div>
                  </div>

                  {/* Quê quán - chọn từ danh mục nhưng lưu tên string */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Quê quán
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Tỉnh/Thành phố">
                        <NameSelectField
                          configKey="provinceCity"
                          currentName={formData.nativePlace}
                          onChange={(v) => set("nativePlace", v)}
                        />
                      </Field>
                      <Field label="Xã/Phường">
                        <NameSelectField
                          configKey="ward"
                          currentName={formData.homeTown}
                          onChange={(v) => set("homeTown", v)}
                        />
                      </Field>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ══════════ TAB 2: THÔNG TIN KHÁC ══════════ */}
            <div className="mt-0 space-y-6">
              {/* [23–26] Thông tin cá nhân */}
              <div>
                <SectionTitle>Thông tin cá nhân</SectionTitle>
                <div className="grid grid-cols-2 gap-3">
                  {/* [23] Dân tộc */}
                  <Field label="Dân tộc">
                    <CategorySelectField
                      configKey="ethnicity"
                      value={formData.ethnicity}
                      onChange={(v) => set("ethnicity", v)}
                    />
                  </Field>
                  {/* [24] Tôn giáo */}
                  <Field label="Tôn giáo">
                    <CategorySelectField
                      configKey="religion"
                      value={formData.religionId}
                      displayValue={formData.religionName}
                      onChange={(v) => set("religionId", v)}
                    />
                  </Field>
                  {/* [25] Quốc tịch */}
                  <Field label="Quốc tịch">
                    <CategorySelectField
                      configKey="nationality"
                      value={formData.nationalityId}
                      displayValue={formData.nationalityName}
                      onChange={(v) => set("nationalityId", v)}
                    />
                  </Field>
                  {/* [26] Thành phần gia đình */}
                  <Field label="Thành phần gia đình xuất thân">
                    <CategorySelectField
                      configKey="policyFamily"
                      value={formData.policyFamilyId}
                      displayValue={formData.policyFamilyName}
                      onChange={(v) => set("policyFamilyId", v)}
                    />
                  </Field>
                </div>
              </div>

              {/* [27–29] Tổ chức chính trị */}
              <div>
                <SectionTitle>Tổ chức chính trị – xã hội</SectionTitle>
                <div className="grid grid-cols-3 gap-3">
                  {/* [27] Ngày tham gia cách mạng */}
                  <Field label="Ngày t/gia cách mạng">
                    <DateInput
                      value={formData.youthUnionJoinDate}
                      onChange={(v) => set("youthUnionJoinDate", v)}
                    />
                  </Field>
                  {/* [28] Ngày vào ĐCS */}
                  <Field label="Ngày vào ĐCS">
                    <DateInput
                      value={formData.partyJoinDate}
                      onChange={(v) => set("partyJoinDate", v)}
                    />
                  </Field>
                  {/* [29] Ngày chính thức ĐCS */}
                  <Field label="Ngày chính thức ĐCS">
                    <DateInput
                      value={formData.partyOfficialDate}
                      onChange={(v) => set("partyOfficialDate", v)}
                    />
                  </Field>
                </div>
              </div>

              {/* Quá trình công tác */}
              <div>
                <SectionTitle>Quá trình công tác</SectionTitle>
                <div className="space-y-2">
                  {formData.workProcesses.map((process, index) => (
                    <div
                      key={process.id}
                      className="grid grid-cols-5 gap-2 items-end"
                    >
                      <Field label="Ngày bắt đầu">
                        <DateInput
                          value={process.startDate}
                          onChange={(v) =>
                            updateWorkProcess(index, "startDate", v)
                          }
                        />
                      </Field>
                      <Field label="Ngày kết thúc">
                        <DateInput
                          value={process.endDate}
                          onChange={(v) =>
                            updateWorkProcess(index, "endDate", v)
                          }
                        />
                      </Field>
                      <Field label="Chi tiết công việc" className="col-span-2">
                        <Input
                          className="h-8 text-sm"
                          value={process.detail}
                          onChange={(e) =>
                            updateWorkProcess(index, "detail", e.target.value)
                          }
                          placeholder="Nhập chi tiết"
                        />
                      </Field>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeWorkProcess(index)}
                        className="h-8 px-2 mr-2"
                      >
                        Xóa
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addWorkProcess}
                    className="w-full"
                  >
                    + Thêm quá trình công tác
                  </Button>
                </div>
              </div>

              {/* [30–35] Quân sự & Danh hiệu */}
              <div>
                <SectionTitle>Quân sự &amp; Danh hiệu</SectionTitle>
                <div className="grid grid-cols-3 gap-3">
                  {/* [30] Ngày nhập ngũ */}
                  <Field label="Ngày nhập ngũ">
                    <DateInput
                      value={formData.militaryJoinDate}
                      onChange={(v) => set("militaryJoinDate", v)}
                    />
                  </Field>
                  {/* [31] Ngày xuất ngũ */}
                  <Field label="Ngày xuất ngũ">
                    <DateInput
                      value={formData.militaryEndDate}
                      onChange={(v) => set("militaryEndDate", v)}
                    />
                  </Field>
                  {/* [32] Quân hàm, chức vụ cao nhất */}
                  <Field label="Quân hàm, chức vụ cao nhất">
                    <Input
                      className="h-8 text-sm"
                      value={formData.title}
                      onChange={(e) => set("title", e.target.value)}
                      placeholder="Nhập quân hàm / chức vụ cao nhất"
                    />
                  </Field>
                  {/* [33] Danh hiệu được phong */}
                  <Field label="Danh hiệu được phong">
                    {/* TODO: GSS danh mục DanhHieuDuocPhong khi BE thêm */}
                    <CategorySelectField
                      configKey="militaryRank"
                      value={formData.militaryRankId}
                      displayValue={formData.militaryRankName}
                      onChange={(v) => set("militaryRankId", v)}
                    />
                  </Field>
                  {/* [34] Thương binh hạng */}
                  <Field label="Thương binh hạng">
                    <Input
                      className="h-8 text-sm"
                      type="number"
                      value={formData.injuryRank}
                      onChange={(e) => set("injuryRank", e.target.value)}
                      placeholder="Nhập hạng (số)"
                    />
                  </Field>
                  {/* [35] Gia đình liệt sĩ */}
                  <Field label="Gia đình liệt sĩ">
                    <Select
                      value={formData.isWoundedSoldier ? "co" : "khong"}
                      onValueChange={(v) => set("isWoundedSoldier", v === "co")}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="co">Có</SelectItem>
                        <SelectItem value="khong">Không</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </div>

              {/* [36–39] Sức khỏe */}
              <div>
                <SectionTitle>Sức khỏe</SectionTitle>
                <div className="grid grid-cols-4 gap-3">
                  {/* [36] Tình trạng sức khỏe */}
                  <Field label="Tình trạng sức khỏe">
                    <Input
                      className="h-8 text-sm"
                      value={formData.healthStatus}
                      onChange={(e) => set("healthStatus", e.target.value)}
                      placeholder="Nhập tình trạng"
                    />
                  </Field>
                  {/* [37] Chiều cao */}
                  <Field label="Chiều cao (cm)">
                    <Input
                      className="h-8 text-sm"
                      type="number"
                      value={formData.height}
                      onChange={(e) => set("height", e.target.value)}
                      placeholder="cm"
                    />
                  </Field>
                  {/* [38] Cân nặng */}
                  <Field label="Cân nặng (kg)">
                    <Input
                      className="h-8 text-sm"
                      type="number"
                      value={formData.weight}
                      onChange={(e) => set("weight", e.target.value)}
                      placeholder="kg"
                    />
                  </Field>
                  {/* [39] Nhóm máu */}
                  <Field label="Nhóm máu">
                    <Select
                      value={formData.bloodType}
                      onValueChange={(v) => set("bloodType", v)}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Chọn" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "A",
                          "B",
                          "AB",
                          "O",
                          "A+",
                          "A-",
                          "B+",
                          "B-",
                          "AB+",
                          "AB-",
                          "O+",
                          "O-",
                        ].map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </div>

              {/* [40–42] CCCD */}
              <div>
                <SectionTitle>Căn cước công dân / CMND</SectionTitle>
                <div className="grid grid-cols-3 gap-3">
                  {/* [40] Số CCCD */}
                  <Field label="Số CCCD/CMND">
                    <Input
                      className="h-8 text-sm"
                      value={formData.cccdNumber}
                      onChange={(e) => set("cccdNumber", e.target.value)}
                      placeholder="Nhập số CCCD"
                    />
                  </Field>
                  {/* [41] Ngày cấp */}
                  <Field label="Ngày cấp">
                    <DateInput
                      value={formData.cccdDate}
                      onChange={(v) => set("cccdDate", v)}
                    />
                  </Field>
                  {/* [42] Nơi cấp */}
                  <Field label="Nơi cấp">
                    <Input
                      className="h-8 text-sm"
                      value={formData.cccdPlace}
                      onChange={(e) => set("cccdPlace", e.target.value)}
                      placeholder="Nhập nơi cấp"
                    />
                  </Field>
                </div>
              </div>
            </div>

            {/* ══════════ TAB 3: NGUỒN THU NHẬP ══════════ */}
            <div className="mt-0 space-y-6">
              {/* [43–44] Thu nhập */}
              <div>
                <SectionTitle>Thu nhập gia đình</SectionTitle>
                <div className="grid grid-cols-2 gap-3">
                  {/* [43] Nguồn thu nhập gia đình */}
                  <Field label="Nguồn thu nhập của gia đình (VNĐ)">
                    <Input
                      className="h-8 text-sm"
                      type="number"
                      value={formData.familyIncome}
                      onChange={(e) => set("familyIncome", e.target.value)}
                      placeholder="Nhập số tiền"
                    />
                  </Field>
                  {/* [44] Các nguồn thu nhập khác */}
                  <Field label="Các nguồn thu nhập khác">
                    <Input
                      className="h-8 text-sm"
                      value={formData.otherIncome}
                      onChange={(e) => set("otherIncome", e.target.value)}
                      placeholder="Mô tả"
                    />
                  </Field>
                </div>
              </div>

              {/* [45–48] Nhà ở */}
              <div>
                <SectionTitle>Nhà ở</SectionTitle>
                <div className="grid grid-cols-2 gap-3">
                  {/* [45] Được cấp/thuê – loại nhà */}
                  <Field label="Được cấp, được thuê – Loại nhà">
                    <Input
                      className="h-8 text-sm"
                      value={formData.housingType}
                      onChange={(e) => set("housingType", e.target.value)}
                      placeholder="Nhập loại nhà được cấp/thuê"
                    />
                  </Field>
                  {/* [46] Diện tích – được cấp/thuê */}
                  <Field label="Tổng diện tích sử dụng (m²)">
                    <Input
                      className="h-8 text-sm"
                      type="number"
                      value={formData.housingArea}
                      onChange={(e) => set("housingArea", e.target.value)}
                      placeholder="m²"
                    />
                  </Field>
                  {/* [47] Tự mua/xây – loại nhà */}
                  <Field label="Nhà tự mua, tự xây – Loại nhà">
                    <Input
                      className="h-8 text-sm"
                      value={formData.selfHousingType}
                      onChange={(e) => set("selfHousingType", e.target.value)}
                      placeholder="Nhập loại nhà tự mua/xây"
                    />
                  </Field>
                  {/* [48] Diện tích – tự mua/xây */}
                  <Field label="Tổng diện tích sử dụng (m²)">
                    <Input
                      className="h-8 text-sm"
                      type="number"
                      value={formData.usableArea}
                      onChange={(e) => set("usableArea", e.target.value)}
                      placeholder="m²"
                    />
                  </Field>
                </div>
              </div>

              {/* [49–51] Đất đai */}
              <div>
                <SectionTitle>Đất đai</SectionTitle>
                <div className="grid grid-cols-3 gap-3">
                  {/* [49] Đất được cấp */}
                  <Field label="Đất được cấp (m²)">
                    <Input
                      className="h-8 text-sm"
                      type="number"
                      value={formData.grantedLandArea}
                      onChange={(e) => set("grantedLandArea", e.target.value)}
                      placeholder="m²"
                    />
                  </Field>
                  {/* [50] Đất tự mua */}
                  <Field label="Đất tự mua (m²)">
                    <Input
                      className="h-8 text-sm"
                      type="number"
                      value={formData.purchasedLandArea}
                      onChange={(e) => set("purchasedLandArea", e.target.value)}
                      placeholder="m²"
                    />
                  </Field>
                  {/* [51] Các loại đất khác */}
                  <Field label="Các loại đất khác">
                    <Input
                      className="h-8 text-sm"
                      value={formData.otherLand}
                      onChange={(e) => set("otherLand", e.target.value)}
                      placeholder="Mô tả"
                    />
                  </Field>
                </div>
              </div>

              {/* [52–55] Tài khoản ngân hàng */}
              <div>
                <SectionTitle>Tài khoản ngân hàng</SectionTitle>
                <div className="grid grid-cols-2 gap-3">
                  {/* [52] Số tài khoản */}
                  <Field label="Số tài khoản">
                    <Input
                      className="h-8 text-sm"
                      value={formData.bankAccountNumber}
                      onChange={(e) => set("bankAccountNumber", e.target.value)}
                      placeholder="Nhập số tài khoản"
                    />
                  </Field>
                  {/* [53] Tên ngân hàng */}
                  <Field label="Tên ngân hàng">
                    <Input
                      className="h-8 text-sm"
                      value={formData.bankName}
                      onChange={(e) => set("bankName", e.target.value)}
                      placeholder="Nhập tên ngân hàng"
                    />
                  </Field>
                  {/* [54] Chủ tài khoản */}
                  <Field label="Chủ tài khoản">
                    <Input
                      className="h-8 text-sm"
                      value={formData.bankAccountHolder}
                      onChange={(e) => set("bankAccountHolder", e.target.value)}
                      placeholder="Nhập tên chủ tài khoản"
                    />
                  </Field>
                  {/* [55] Chi nhánh */}
                  <Field label="Chi nhánh">
                    <Input
                      className="h-8 text-sm"
                      value={formData.bankBranch}
                      onChange={(e) => set("bankBranch", e.target.value)}
                      placeholder="Nhập chi nhánh"
                    />
                  </Field>
                </div>
              </div>
            </div>

            {/* ══════════ TAB 4: TRÌNH ĐỘ ══════════ */}
            <div className="mt-0 space-y-6">
              {/* [56–60] Tuyển dụng */}
              <div>
                <SectionTitle>Tuyển dụng</SectionTitle>
                <div className="grid grid-cols-3 gap-3">
                  {/* [56] Nghề nghiệp trước khi tuyển dụng */}
                  <Field label="Nghề nghiệp trước khi được tuyển dụng">
                    <Input
                      className="h-8 text-sm"
                      value={formData.previousJob}
                      onChange={(e) => set("previousJob", e.target.value)}
                      placeholder="Nhập nghề nghiệp"
                    />
                  </Field>
                  {/* [57] Ngày tuyển dụng */}
                  <Field label="Ngày tuyển dụng">
                    <DateInput
                      value={formData.recruitmentDate}
                      onChange={(v) => set("recruitmentDate", v)}
                    />
                  </Field>
                  {/* [58] Ngày vào cơ quan */}
                  <Field label="Ngày vào cơ quan" required>
                    <DateInput
                      value={formData.startDate}
                      onChange={(v) => set("startDate", v)}
                      required
                    />
                  </Field>
                  {/* [59] Cơ quan tuyển dụng */}
                  <Field label="Cơ quan tuyển dụng">
                    <CategorySelectField
                      configKey="organization"
                      value={formData.organizationId}
                      displayValue={formData.organizationName}
                      onChange={(v) => set("organizationId", v)}
                    />
                  </Field>
                  {/* [60] Địa chỉ cơ quan */}
                  <Field label="Địa chỉ cơ quan" className="col-span-2">
                    <Input
                      className="h-8 text-sm"
                      value={formData.organizationAddress}
                      onChange={(e) =>
                        set("organizationAddress", e.target.value)
                      }
                      placeholder="Nhập địa chỉ cơ quan"
                    />
                  </Field>
                </div>
              </div>

              {/* [61–67] Trình độ học vấn & Chuyên môn */}
              <div>
                <SectionTitle>Trình độ học vấn &amp; Chuyên môn</SectionTitle>
                <div className="grid grid-cols-3 gap-3">
                  {/* [61] Trình độ giáo dục phổ thông */}
                  <Field label="Trình độ giáo dục phổ thông">
                    <Input
                      className="h-8 text-sm"
                      value={formData.educationDetail}
                      onChange={(e) => set("educationDetail", e.target.value)}
                      placeholder="VD: 12/12"
                    />
                  </Field>
                  {/* [62] Học hàm học vị cao nhất */}
                  <Field label="Học hàm học vị cao nhất">
                    <CategorySelectField
                      configKey="degree"
                      value={formData.educationLevelId}
                      displayValue={formData.educationLevelName}
                      onChange={(v) => set("educationLevelId", v)}
                    />
                  </Field>
                  {/* [63] Lý luận chính trị */}
                  <Field label="Lý luận chính trị">
                    <CategorySelectField
                      configKey="politicalTheory"
                      value={formData.politicalTheoryId}
                      displayValue={formData.politicalTheoryName}
                      onChange={(v) => set("politicalTheoryId", v)}
                    />
                  </Field>
                  {/* [64] Ngoại ngữ */}
                  <Field label="Ngoại ngữ">
                    <CategorySelectField
                      configKey="languageLevel"
                      value={formData.languageId}
                      onChange={(v) => set("languageId", v)}
                    />
                  </Field>
                  {/* [65] Trình độ ngoại ngữ */}
                  <Field label="Trình độ ngoại ngữ">
                    <CategorySelectField
                      configKey="languageLevel"
                      value={formData.languageLevelId}
                      displayValue={formData.languageLevelName}
                      onChange={(v) => set("languageLevelId", v)}
                    />
                  </Field>
                  {/* [66] Chuyên môn chính */}
                  <Field label="Chuyên môn chính">
                    <CategorySelectField
                      configKey="culturalLevel"
                      value={formData.culturalLevelId}
                      displayValue={formData.culturalLevelName}
                      onChange={(v) => set("culturalLevelId", v)}
                    />
                  </Field>
                  {/* [67] Trình độ chuyên môn cao nhất */}
                  <Field label="Trình độ chuyên môn cao nhất">
                    <CategorySelectField
                      configKey="professionalLevel"
                      value={formData.professionalLevelId}
                      displayValue={formData.professionalLevelName}
                      onChange={(v) => set("professionalLevelId", v)}
                    />
                  </Field>
                </div>
              </div>

              {/* [68–70] Chi tiết công việc */}
              <div>
                <SectionTitle>Chi tiết công việc</SectionTitle>
                <div className="grid grid-cols-3 gap-3">
                  {/* [68] Công việc chính đang làm */}
                  <Field label="Công việc chính đang làm">
                    <Input
                      className="h-8 text-sm"
                      value={formData.currentJobDetail}
                      onChange={(e) => set("currentJobDetail", e.target.value)}
                      placeholder="Nhập công việc"
                    />
                  </Field>
                  {/* [69] Sở trường công tác */}
                  <Field label="Sở trường công tác">
                    <Input
                      className="h-8 text-sm"
                      value={formData.workStrength}
                      onChange={(e) => set("workStrength", e.target.value)}
                      placeholder="Nhập sở trường"
                    />
                  </Field>
                  {/* [70] Công việc đã làm lâu nhất */}
                  <Field label="Công việc đã làm lâu nhất">
                    <Input
                      className="h-8 text-sm"
                      value={formData.longestJob}
                      onChange={(e) => set("longestJob", e.target.value)}
                      placeholder="Nhập công việc"
                    />
                  </Field>
                </div>
              </div>
            </div>

            {/* ══════════ TAB 5: LƯƠNG & BHXH ══════════ */}
            <div className="mt-0 space-y-6">
              {/* [71–75] Lương chính */}
              <div>
                <SectionTitle>Lương chính</SectionTitle>
                <div className="grid grid-cols-3 gap-3">
                  {/* [71] Bảng lương */}
                  <Field label="Bảng lương">
                    <CategorySelectField
                      configKey="payroll"
                      value={formData.salaryPayrollId}
                      displayValue={formData.salaryPayrollName}
                      onChange={(v) => set("salaryPayrollId", v)}
                    />
                  </Field>
                  {/* [72] Thang bảng lương */}
                  <Field label="Thang bảng lương">
                    <CategorySelectField
                      configKey="salaryScale"
                      value={formData.salaryScaleId}
                      displayValue={formData.salaryScaleName}
                      onChange={(v) => set("salaryScaleId", v)}
                    />
                  </Field>
                  {/* [73] Hệ số lương */}
                  <Field label="Hệ số lương">
                    <Input
                      className="h-8 text-sm"
                      type="number"
                      step="0.01"
                      value={formData.salaryCoefficient}
                      onChange={(e) => set("salaryCoefficient", e.target.value)}
                      placeholder="Nhập hệ số"
                    />
                  </Field>
                  {/* [74] Mức lương */}
                  <Field label="Mức lương (VNĐ)">
                    <Input
                      className="h-8 text-sm"
                      type="number"
                      value={formData.salaryAmount}
                      onChange={(e) => set("salaryAmount", e.target.value)}
                      placeholder="Nhập mức lương"
                    />
                  </Field>
                  {/* [75] Ngày áp dụng */}
                  <Field label="Ngày áp dụng">
                    <DateInput
                      value={formData.salaryEffectiveDate}
                      onChange={(v) => set("salaryEffectiveDate", v)}
                    />
                  </Field>
                </div>
              </div>

              {/* [76–83] Lương đóng BHXH */}
              <div>
                <SectionTitle>Lương đóng bảo hiểm xã hội</SectionTitle>
                <div className="grid grid-cols-3 gap-3">
                  {/* [76] Bảng lương BHXH */}
                  <Field label="Bảng lương BHXH">
                    <CategorySelectField
                      configKey="payroll"
                      value={formData.socialInsurancePayrollId}
                      displayValue={formData.socialInsurancePayrollName}
                      onChange={(v) => set("socialInsurancePayrollId", v)}
                    />
                  </Field>
                  {/* [77] Thang bảng lương BHXH */}
                  <Field label="Thang bảng lương BHXH">
                    <CategorySelectField
                      configKey="salaryScale"
                      value={formData.socialInsuranceSalaryScaleId}
                      displayValue={formData.socialInsuranceSalaryScaleName}
                      onChange={(v) => set("socialInsuranceSalaryScaleId", v)}
                    />
                  </Field>
                  {/* [78] Hệ số lương BHXH */}
                  <Field label="Hệ số lương BHXH">
                    <Input
                      className="h-8 text-sm"
                      type="number"
                      step="0.01"
                      value={formData.socialInsuranceSalaryCoefficient}
                      onChange={(e) =>
                        set("socialInsuranceSalaryCoefficient", e.target.value)
                      }
                      placeholder="Nhập hệ số"
                    />
                  </Field>
                  {/* [79] Mức lương BHXH */}
                  <Field label="Mức lương BHXH (VNĐ)">
                    <Input
                      className="h-8 text-sm"
                      type="number"
                      value={formData.socialInsuranceSalaryAmount}
                      onChange={(e) =>
                        set("socialInsuranceSalaryAmount", e.target.value)
                      }
                      placeholder="Nhập mức lương"
                    />
                  </Field>
                  {/* [80] Nơi đóng BHXH */}
                  <Field label="Nơi đóng BHXH">
                    <Input
                      className="h-8 text-sm"
                      value={formData.socialInsurancePlace}
                      onChange={(e) =>
                        set("socialInsurancePlace", e.target.value)
                      }
                      placeholder="Nhập nơi đóng"
                    />
                  </Field>
                  {/* [81] Số sổ BHXH */}
                  <Field label="Số sổ BHXH">
                    <Input
                      className="h-8 text-sm"
                      value={formData.socialInsuranceNumber}
                      onChange={(e) =>
                        set("socialInsuranceNumber", e.target.value)
                      }
                      placeholder="Nhập số sổ BHXH"
                    />
                  </Field>
                  {/* [82] Lương NS tài chính công đoàn */}
                  <Field label="Lương NS tài chính công đoàn (VNĐ)">
                    <Input
                      className="h-8 text-sm"
                      type="number"
                      value={formData.unionSalary}
                      onChange={(e) => set("unionSalary", e.target.value)}
                      placeholder="Nhập số tiền"
                    />
                  </Field>
                  {/* [83] Chức danh BHXH */}
                  <Field label="Chức danh BHXH">
                    <CategorySelectField
                      configKey="jobTitle"
                      value={formData.socialInsuranceJobTitleId}
                      displayValue={formData.socialInsuranceJobTitleName}
                      onChange={(v) => set("socialInsuranceJobTitleId", v)}
                    />
                  </Field>
                </div>
              </div>
            </div>

            {/* ══════════ TAB 6: ĐẶC ĐIỂM LỊCH SỬ BẢN THÂN ══════════ */}
            <div className="mt-0 space-y-6">
              <div>
                <SectionTitle>Đặc điểm lịch sử bản thân</SectionTitle>
                <div className="space-y-4">
                  {/* [84] Khai rõ: bị bắt, bị tù... */}
                  <Field label="Khai rõ: bị bắt, bị tù, đã khai báo cho ai, những vấn đề gì?">
                    <Textarea
                      value={formData.legalHistory}
                      onChange={(e) => set("legalHistory", e.target.value)}
                      placeholder="Khai rõ nếu có. Ghi 'Không' nếu không có."
                      rows={3}
                      className="text-sm"
                    />
                  </Field>
                  {/* [85] Bản thân có làm việc trong chế độ cũ */}
                  <Field label="Bản thân có làm việc trong chế độ cũ">
                    <Textarea
                      value={formData.workedInOldRegime}
                      onChange={(e) => set("workedInOldRegime", e.target.value)}
                      placeholder="Khai rõ nếu có. Ghi 'Không' nếu không có."
                      rows={3}
                      className="text-sm"
                    />
                  </Field>
                  {/* [86] Tham gia hoặc có quan hệ với các tổ chức nước ngoài */}
                  <Field label="Tham gia hoặc có quan hệ với các tổ chức chính trị, kinh tế, xã hội nào ở nước ngoài (làm gì, tổ chức nào, đặt trụ sở ở đâu?)">
                    <Textarea
                      value={formData.foreignOrganizationRelation}
                      onChange={(e) =>
                        set("foreignOrganizationRelation", e.target.value)
                      }
                      placeholder="Khai rõ nếu có. Ghi 'Không' nếu không có."
                      rows={3}
                      className="text-sm"
                    />
                  </Field>
                  {/* [87] Có thân nhân ở nước ngoài */}
                  <Field label="Có thân nhân ở nước ngoài (làm gì, địa chỉ)?">
                    <Textarea
                      value={formData.relativesAbroad}
                      onChange={(e) => set("relativesAbroad", e.target.value)}
                      placeholder="Khai rõ nếu có. Ghi 'Không' nếu không có."
                      rows={3}
                      className="text-sm"
                    />
                  </Field>
                </div>
              </div>

              {/* [88] Ghi chú */}
              <div>
                <SectionTitle>Ghi chú</SectionTitle>
                <Textarea
                  value={formData.note}
                  onChange={(e) => set("note", e.target.value)}
                  placeholder="Nhập ghi chú..."
                  rows={4}
                  className="text-sm"
                />
              </div>
            </div>
          </div>
          {/* end scroll area */}

          <DialogFooter className="px-6 py-4 border-t shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-green-500 text-white hover:bg-green-600"
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isLoading
                ? "Đang xử lý..."
                : mode === "create"
                  ? "Thêm nhân viên"
                  : "Xác nhận"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
